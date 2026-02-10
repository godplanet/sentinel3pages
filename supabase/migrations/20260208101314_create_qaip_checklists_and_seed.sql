/*
  # Create QAIP Checklists & Reviews Tables + Seed Data

  1. New Tables
    - `qaip_checklists`
      - `id` (uuid, primary key)
      - `title` (text) - checklist name
      - `description` (text) - purpose description
      - `criteria` (jsonb) - array of { id, text, weight } objects
      - `tenant_id` (uuid)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    - `qaip_reviews`
      - `id` (uuid, primary key)
      - `engagement_id` (uuid, nullable) - linked audit engagement
      - `reviewer_id` (uuid, nullable) - who performed the review
      - `checklist_id` (uuid) - references qaip_checklists
      - `results` (jsonb) - criteria evaluation results
      - `total_score` (integer) - computed compliance score
      - `status` (text) - IN_PROGRESS, COMPLETED, APPROVED
      - `notes` (text, nullable) - reviewer notes
      - `tenant_id` (uuid)
      - `completed_at` (timestamptz, nullable)
      - `created_at` (timestamptz)

  2. Security
    - RLS enabled on both tables
    - Dev-mode permissive policies for authenticated users

  3. Seed Data
    - 3 default checklists covering standard QAIP review criteria
    - 2 sample reviews for demonstration
*/

CREATE TABLE IF NOT EXISTS qaip_checklists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  criteria jsonb NOT NULL DEFAULT '[]'::jsonb,
  tenant_id uuid DEFAULT '00000000-0000-0000-0000-000000000000'::uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE qaip_checklists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read qaip_checklists"
  ON qaip_checklists FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert qaip_checklists"
  ON qaip_checklists FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update qaip_checklists"
  ON qaip_checklists FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete qaip_checklists"
  ON qaip_checklists FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'qaip_checklists' AND policyname = 'Dev read qaip_checklists'
  ) THEN
    CREATE POLICY "Dev read qaip_checklists"
      ON qaip_checklists FOR SELECT TO anon USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'qaip_checklists' AND policyname = 'Dev write qaip_checklists'
  ) THEN
    CREATE POLICY "Dev write qaip_checklists"
      ON qaip_checklists FOR INSERT TO anon WITH CHECK (true);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS qaip_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  engagement_id uuid,
  reviewer_id uuid,
  checklist_id uuid REFERENCES qaip_checklists(id),
  results jsonb DEFAULT '{}'::jsonb,
  total_score integer DEFAULT 0,
  status text DEFAULT 'IN_PROGRESS',
  notes text,
  tenant_id uuid DEFAULT '00000000-0000-0000-0000-000000000000'::uuid,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE qaip_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read qaip_reviews"
  ON qaip_reviews FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert qaip_reviews"
  ON qaip_reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update qaip_reviews"
  ON qaip_reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete qaip_reviews"
  ON qaip_reviews FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'qaip_reviews' AND policyname = 'Dev read qaip_reviews'
  ) THEN
    CREATE POLICY "Dev read qaip_reviews"
      ON qaip_reviews FOR SELECT TO anon USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'qaip_reviews' AND policyname = 'Dev write qaip_reviews'
  ) THEN
    CREATE POLICY "Dev write qaip_reviews"
      ON qaip_reviews FOR INSERT TO anon WITH CHECK (true);
  END IF;
END $$;

INSERT INTO qaip_checklists (id, title, description, criteria) VALUES
(
  'a1b2c3d4-0001-4000-8000-000000000001',
  'Genel Denetim Kalite Kontrol Listesi',
  'Her denetim gorevine uygulanacak standart kalite kontrol listesi',
  '[
    {"id": "gc-001", "text": "Denetim kapsami acik ve net tanimlanmis mi?", "weight": 15},
    {"id": "gc-002", "text": "Risk degerlendirmesi yapilmis mi?", "weight": 15},
    {"id": "gc-003", "text": "Is programi onaylanmis mi?", "weight": 10},
    {"id": "gc-004", "text": "Tum testler icin yeterli kanit toplanmis mi?", "weight": 20},
    {"id": "gc-005", "text": "Bulgularin kok nedeni (5-Why RCA) analiz edilmis mi?", "weight": 15},
    {"id": "gc-006", "text": "Bulgu derecelendirmesi KERD metodolojisine uygun mu?", "weight": 10},
    {"id": "gc-007", "text": "Rapor taslagi gozden gecirilmis mi?", "weight": 10},
    {"id": "gc-008", "text": "Musteri yaniti alinmis ve dokumante edilmis mi?", "weight": 5}
  ]'::jsonb
),
(
  'a1b2c3d4-0002-4000-8000-000000000002',
  'BT Denetimi Ozel Kontrol Listesi',
  'Bilgi teknolojileri denetimlerine ozel kalite kontrol kriterleri',
  '[
    {"id": "it-001", "text": "Sistem envanter listesi dogrulanmis mi?", "weight": 10},
    {"id": "it-002", "text": "Erisim kontrol matrisi test edilmis mi?", "weight": 15},
    {"id": "it-003", "text": "Zafiyet taramasi sonuclari degerlendirilmis mi?", "weight": 15},
    {"id": "it-004", "text": "Log analizi yapilmis mi?", "weight": 15},
    {"id": "it-005", "text": "Yedekleme ve felaket kurtarma plani test edilmis mi?", "weight": 15},
    {"id": "it-006", "text": "Degisiklik yonetimi sureci incelenmis mi?", "weight": 10},
    {"id": "it-007", "text": "Veri siniflandirma politikasi uyumu kontrol edilmis mi?", "weight": 10},
    {"id": "it-008", "text": "Ucuncu taraf bagimliliklari degerlendirilmis mi?", "weight": 10}
  ]'::jsonb
),
(
  'a1b2c3d4-0003-4000-8000-000000000003',
  'Saha Calismasi Sonrasi Degerlendirme',
  'Saha calismasi tamamlandiktan sonra uygulanacak hizli degerlendirme',
  '[
    {"id": "fw-001", "text": "Tum calismalar imzalanmis mi?", "weight": 20},
    {"id": "fw-002", "text": "Kanit dosyalari tam ve eksiksiz mi?", "weight": 25},
    {"id": "fw-003", "text": "Bulgular musteri ile paylasilmis mi?", "weight": 20},
    {"id": "fw-004", "text": "Aksiyon planlari belirlenmis mi?", "weight": 20},
    {"id": "fw-005", "text": "Zaman kayitlari guncel mi?", "weight": 15}
  ]'::jsonb
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO qaip_reviews (id, engagement_id, checklist_id, results, total_score, status, notes, completed_at) VALUES
(
  'b2c3d4e5-0001-4000-8000-000000000001',
  '42d72f07-e813-4cff-8218-4a64f7a3baab',
  'a1b2c3d4-0001-4000-8000-000000000001',
  '{"gc-001": "PASS", "gc-002": "PASS", "gc-003": "PASS", "gc-004": "FAIL", "gc-005": "FAIL", "gc-006": "PASS", "gc-007": "PASS", "gc-008": "FAIL"}'::jsonb,
  65,
  'COMPLETED',
  'Kanit toplama ve kok neden analizinde iyilestirme gerekli. Genel olarak kabul edilebilir seviyede ancak kritik eksikler mevcut.',
  now() - interval '3 days'
),
(
  'b2c3d4e5-0002-4000-8000-000000000002',
  '42d72f07-e813-4cff-8218-4a64f7a3baab',
  'a1b2c3d4-0002-4000-8000-000000000002',
  '{"it-001": "PASS", "it-002": "PASS", "it-003": "PASS", "it-004": "PASS", "it-005": "PASS", "it-006": "PASS", "it-007": "PASS", "it-008": "PASS"}'::jsonb,
  100,
  'APPROVED',
  'BT denetimi tum kontrol kriterlerini karsilamaktadir. Mukemmel kalite.',
  now() - interval '1 day'
)
ON CONFLICT (id) DO NOTHING;
