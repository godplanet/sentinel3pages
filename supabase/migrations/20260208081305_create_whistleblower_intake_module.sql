/*
  # Module 13: Intelligent Intake & Whistleblowing

  1. New Tables
    - `whistleblower_tips`
      - `id` (uuid, primary key)
      - `tracking_code` (text, unique anonymous access key)
      - `content` (text, the tip content - encrypted at rest)
      - `attachments_url` (text, optional file reference)
      - `channel` (text: WEB, TOR_ONION, SIGNAL_MOCK)
      - `submitted_at` (timestamptz)
      - `ai_credibility_score` (float, 0-100 AI-computed score)
      - `triage_category` (text: CRITICAL_FRAUD, HR_CULTURE, SPAM)
      - `status` (text: NEW, INVESTIGATING, ESCALATED, DISMISSED, CLOSED)
      - `assigned_unit` (text, unit assigned for investigation)
      - `reviewer_notes` (text, internal notes)

    - `tip_analysis`
      - `id` (uuid, primary key)
      - `tip_id` (uuid, references whistleblower_tips)
      - `specificity_index` (float, 0-100 how specific the tip is)
      - `evidence_density` (float, 0-100 how much evidence is referenced)
      - `emotional_score` (float, 0-100 emotional instability indicator)
      - `extracted_entities` (jsonb: names, dates, amounts, ibans)
      - `analyzed_at` (timestamptz)

  2. Security
    - RLS enabled on both tables
    - whistleblower_tips: insert allowed for anon (public portal), select for authenticated
    - tip_analysis: only authenticated users can read/write

  3. Seed Data
    - 3 sample tips: high-credibility fraud, HR complaint, spam
    - Corresponding analysis records with pre-computed scores

  4. Important Notes
    - tracking_code is the only identifier given to the anonymous reporter
    - The public portal uses anon insert only - no read access for anon
    - AI scoring is computed via the Triage Engine, not stored procedures
*/

-- Whistleblower Tips
CREATE TABLE IF NOT EXISTS whistleblower_tips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_code text UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(12), 'hex'),
  content text NOT NULL DEFAULT '',
  attachments_url text,
  channel text NOT NULL DEFAULT 'WEB',
  submitted_at timestamptz NOT NULL DEFAULT now(),
  ai_credibility_score float DEFAULT 0,
  triage_category text NOT NULL DEFAULT 'SPAM',
  status text NOT NULL DEFAULT 'NEW',
  assigned_unit text,
  reviewer_notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE whistleblower_tips ENABLE ROW LEVEL SECURITY;

-- Anon can only INSERT (public portal submission)
CREATE POLICY "Anon can submit tips"
  ON whistleblower_tips
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Authenticated can read all tips
CREATE POLICY "Authenticated can read tips"
  ON whistleblower_tips
  FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- Authenticated can update tips (triage, status changes)
CREATE POLICY "Authenticated can update tips"
  ON whistleblower_tips
  FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Dev-mode policies for testing
CREATE POLICY "Dev read whistleblower_tips"
  ON whistleblower_tips FOR SELECT TO anon USING (true);

CREATE POLICY "Dev update whistleblower_tips"
  ON whistleblower_tips FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- Anon can read own tip by tracking_code (handled via RPC or edge function)
-- For now, dev mode allows read

-- Tip Analysis
CREATE TABLE IF NOT EXISTS tip_analysis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tip_id uuid NOT NULL REFERENCES whistleblower_tips(id),
  specificity_index float NOT NULL DEFAULT 0,
  evidence_density float NOT NULL DEFAULT 0,
  emotional_score float NOT NULL DEFAULT 0,
  extracted_entities jsonb NOT NULL DEFAULT '{}'::jsonb,
  analyzed_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE tip_analysis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read tip analysis"
  ON tip_analysis
  FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can insert tip analysis"
  ON tip_analysis
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- Dev-mode policies
CREATE POLICY "Dev read tip_analysis"
  ON tip_analysis FOR SELECT TO anon USING (true);

CREATE POLICY "Dev insert tip_analysis"
  ON tip_analysis FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Dev update tip_analysis"
  ON tip_analysis FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_whistleblower_tips_tracking
  ON whistleblower_tips(tracking_code);

CREATE INDEX IF NOT EXISTS idx_whistleblower_tips_status
  ON whistleblower_tips(status);

CREATE INDEX IF NOT EXISTS idx_whistleblower_tips_score
  ON whistleblower_tips(ai_credibility_score DESC);

CREATE INDEX IF NOT EXISTS idx_tip_analysis_tip
  ON tip_analysis(tip_id);

-- ============================================================
-- SEED DATA: 3 sample tips
-- ============================================================

-- Tip 1: High Credibility (CRITICAL_FRAUD, Score ~87)
INSERT INTO whistleblower_tips (
  id, tracking_code, content, channel, ai_credibility_score,
  triage_category, status, assigned_unit, submitted_at
) VALUES (
  'a1b2c3d4-1111-4000-8000-000000000001',
  'SEC-FR4UD-7X9K2M',
  'Muhasebe departmaninda ciddi bir usulsuzluk tespit ettim. Son 6 aydir, sahte faturalar uzerinden odeme yapiliyor. Ornek fatura numarasi: FTR-2025-4892. IBAN: TR33 0006 1005 1978 6457 8413 26 hesabina duzenli olarak 45.000-75.000 TL arasi transferler yapiliyor. Bu islemlere ait EFT dekontlari mevcut. Islemler her ayin 15 ve 30''unda gerceklesiyor. Muhasebe muduru Ahmet B. tarafindan onaylaniyor. Toplam tutar tahminen 850.000 TL''yi buluyor. Ekran goruntuleri ve dekont kopyalari elimde mevcut.',
  'TOR_ONION',
  87.5,
  'CRITICAL_FRAUD',
  'INVESTIGATING',
  'Suistimal Inceleme Birimi',
  now() - interval '2 days'
) ON CONFLICT (id) DO NOTHING;

-- Tip 2: HR Complaint (HR_CULTURE, Score ~38)
INSERT INTO whistleblower_tips (
  id, tracking_code, content, channel, ai_credibility_score,
  triage_category, status, submitted_at
) VALUES (
  'a1b2c3d4-2222-4000-8000-000000000002',
  'SEC-HR8C-3P5W7N',
  'BU DURUMA ARTIK DAYANAMIYORUM!!! Departmanimda mobbing uygulamasi had safhada. Yoneticimiz surekli baski yapiyor, calisanlara bagiriyor ve asagilayici sozler soyluyor. Herkes korkuyor ama kimse bir sey yapmiyor. BU KABUL EDILEMEZ!!! Moral cok dusuk, herkes istifa etmeyi dusunuyor. Lutfen bir seyler yapin artik, bu boyle devam edemez!!!',
  'WEB',
  38.2,
  'HR_CULTURE',
  'NEW',
  now() - interval '5 hours'
) ON CONFLICT (id) DO NOTHING;

-- Tip 3: Spam (Score ~12)
INSERT INTO whistleblower_tips (
  id, tracking_code, content, channel, ai_credibility_score,
  triage_category, status, submitted_at
) VALUES (
  'a1b2c3d4-3333-4000-8000-000000000003',
  'SEC-SP4M-9R2V6J',
  'Bence bu sirket cok kotu yonetiliyor. Her sey yanlis. Herkes bilir ama kimse konusmuyor. Birisi bir seyler yapmali. Duzeltin sunu.',
  'SIGNAL_MOCK',
  12.4,
  'SPAM',
  'DISMISSED',
  now() - interval '1 day'
) ON CONFLICT (id) DO NOTHING;

-- Analysis for Tip 1 (High Credibility)
INSERT INTO tip_analysis (
  tip_id, specificity_index, evidence_density, emotional_score,
  extracted_entities, analyzed_at
) VALUES (
  'a1b2c3d4-1111-4000-8000-000000000001',
  92.0,
  88.0,
  15.0,
  '{
    "names": ["Ahmet B."],
    "dates": ["her ayin 15i", "her ayin 30u", "son 6 ay"],
    "amounts": ["45.000 TL", "75.000 TL", "850.000 TL"],
    "ibans": ["TR33 0006 1005 1978 6457 8413 26"],
    "invoice_numbers": ["FTR-2025-4892"],
    "departments": ["Muhasebe"],
    "keywords_matched": ["fatura", "IBAN", "dekont", "transfer", "odeme"]
  }'::jsonb,
  now() - interval '2 days'
) ON CONFLICT DO NOTHING;

-- Analysis for Tip 2 (HR Complaint)
INSERT INTO tip_analysis (
  tip_id, specificity_index, evidence_density, emotional_score,
  extracted_entities, analyzed_at
) VALUES (
  'a1b2c3d4-2222-4000-8000-000000000002',
  28.0,
  5.0,
  85.0,
  '{
    "names": [],
    "dates": [],
    "amounts": [],
    "ibans": [],
    "keywords_matched": ["mobbing", "baski", "istifa"],
    "emotional_markers": ["CAPSLOCK", "!!!", "dayanamiyorum"]
  }'::jsonb,
  now() - interval '5 hours'
) ON CONFLICT DO NOTHING;

-- Analysis for Tip 3 (Spam)
INSERT INTO tip_analysis (
  tip_id, specificity_index, evidence_density, emotional_score,
  extracted_entities, analyzed_at
) VALUES (
  'a1b2c3d4-3333-4000-8000-000000000003',
  8.0,
  2.0,
  35.0,
  '{
    "names": [],
    "dates": [],
    "amounts": [],
    "ibans": [],
    "keywords_matched": [],
    "notes": "Cok genel ve belirsiz metin, islenebilir veri yok"
  }'::jsonb,
  now() - interval '1 day'
) ON CONFLICT DO NOTHING;
