/*
  # Create TPRM (Third-Party Risk Management) Module

  1. New Tables
    - `tprm_vendors` - Vendor inventory with risk tiers
      - `id` (uuid, PK)
      - `tenant_id` (uuid, FK tenants)
      - `name` (text) - Vendor name
      - `category` (text) - IT Altyapi, Danismanlik, Hizmet, Hukuk, Telekom
      - `risk_tier` (text) - Tier 1 (Critical), Tier 2, Tier 3
      - `criticality_score` (integer, 0-100)
      - `status` (text) - Active, Inactive, Under Review, Terminated
      - `contact_person` (text)
      - `email` (text)
      - `contract_start` (date)
      - `contract_end` (date)
      - `last_audit_date` (date)
      - `country` (text)
      - `data_access_level` (text) - None, Limited, Full
      - `notes` (text)
    - `tprm_assessments` - Vendor assessment surveys
      - `id` (uuid, PK)
      - `tenant_id` (uuid, FK tenants)
      - `vendor_id` (uuid, FK tprm_vendors)
      - `title` (text)
      - `status` (text) - Draft, Sent, In Progress, Completed, Review Needed
      - `risk_score` (integer) - Calculated score
      - `due_date` (date)
      - `completed_at` (timestamptz)
      - `assessor` (text)
    - `tprm_assessment_answers` - Individual question/answer/AI grade rows
      - `id` (uuid, PK)
      - `tenant_id` (uuid, FK tenants)
      - `assessment_id` (uuid, FK tprm_assessments)
      - `question_text` (text)
      - `vendor_response` (text)
      - `ai_grade_score` (integer, 1-10)
      - `ai_grade_rationale` (text)
      - `category` (text)

  2. Security
    - RLS enabled on all tables
    - Dev-mode anon read/write policies
    - Authenticated user policies for production

  3. Seed Data
    - 6 realistic Turkish banking vendors
    - 4 assessments across vendors
    - 20+ assessment Q&A with AI grades

  4. Views
    - `tprm_vendor_summary` - Per-vendor risk overview with assessment counts
*/

-- ============================================================
-- TABLE: tprm_vendors
-- ============================================================
CREATE TABLE IF NOT EXISTS tprm_vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111' REFERENCES tenants(id),
  name text NOT NULL,
  category text,
  risk_tier text NOT NULL DEFAULT 'Tier 3',
  criticality_score integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'Active',
  contact_person text,
  email text,
  contract_start date,
  contract_end date,
  last_audit_date date,
  country text DEFAULT 'Turkiye',
  data_access_level text DEFAULT 'None',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT tprm_v_score_range CHECK (criticality_score >= 0 AND criticality_score <= 100),
  CONSTRAINT tprm_v_tier_check CHECK (risk_tier IN ('Tier 1','Tier 2','Tier 3')),
  CONSTRAINT tprm_v_status_check CHECK (status IN ('Active','Inactive','Under Review','Terminated')),
  CONSTRAINT tprm_v_access_check CHECK (data_access_level IN ('None','Limited','Full'))
);

CREATE INDEX IF NOT EXISTS idx_tprm_v_tenant ON tprm_vendors(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tprm_v_tier ON tprm_vendors(risk_tier);
CREATE INDEX IF NOT EXISTS idx_tprm_v_status ON tprm_vendors(status);

ALTER TABLE tprm_vendors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon can read vendors (dev)"
  ON tprm_vendors FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can insert vendors (dev)"
  ON tprm_vendors FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon can update vendors (dev)"
  ON tprm_vendors FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon can delete vendors (dev)"
  ON tprm_vendors FOR DELETE TO anon USING (true);
CREATE POLICY "Auth users read own tenant vendors"
  ON tprm_vendors FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()));

-- ============================================================
-- TABLE: tprm_assessments
-- ============================================================
CREATE TABLE IF NOT EXISTS tprm_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111' REFERENCES tenants(id),
  vendor_id uuid NOT NULL REFERENCES tprm_vendors(id) ON DELETE CASCADE,
  title text NOT NULL,
  status text NOT NULL DEFAULT 'Draft',
  risk_score integer,
  due_date date,
  completed_at timestamptz,
  assessor text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT tprm_a_status_check CHECK (status IN ('Draft','Sent','In Progress','Completed','Review Needed'))
);

CREATE INDEX IF NOT EXISTS idx_tprm_a_tenant ON tprm_assessments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tprm_a_vendor ON tprm_assessments(vendor_id);
CREATE INDEX IF NOT EXISTS idx_tprm_a_status ON tprm_assessments(status);

ALTER TABLE tprm_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon can read assessments (dev)"
  ON tprm_assessments FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can insert assessments (dev)"
  ON tprm_assessments FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon can update assessments (dev)"
  ON tprm_assessments FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon can delete assessments (dev)"
  ON tprm_assessments FOR DELETE TO anon USING (true);
CREATE POLICY "Auth users read own tenant assessments"
  ON tprm_assessments FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()));

-- ============================================================
-- TABLE: tprm_assessment_answers
-- ============================================================
CREATE TABLE IF NOT EXISTS tprm_assessment_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111' REFERENCES tenants(id),
  assessment_id uuid NOT NULL REFERENCES tprm_assessments(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  vendor_response text,
  ai_grade_score integer,
  ai_grade_rationale text,
  category text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT tprm_aa_score_range CHECK (ai_grade_score IS NULL OR (ai_grade_score >= 1 AND ai_grade_score <= 10))
);

CREATE INDEX IF NOT EXISTS idx_tprm_aa_tenant ON tprm_assessment_answers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tprm_aa_assessment ON tprm_assessment_answers(assessment_id);

ALTER TABLE tprm_assessment_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon can read answers (dev)"
  ON tprm_assessment_answers FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can insert answers (dev)"
  ON tprm_assessment_answers FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon can update answers (dev)"
  ON tprm_assessment_answers FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon can delete answers (dev)"
  ON tprm_assessment_answers FOR DELETE TO anon USING (true);
CREATE POLICY "Auth users read own tenant answers"
  ON tprm_assessment_answers FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()));

-- ============================================================
-- VIEW: tprm_vendor_summary
-- ============================================================
CREATE OR REPLACE VIEW tprm_vendor_summary AS
SELECT
  v.id,
  v.tenant_id,
  v.name,
  v.category,
  v.risk_tier,
  v.criticality_score,
  v.status,
  v.contact_person,
  v.email,
  v.contract_start,
  v.contract_end,
  v.last_audit_date,
  v.country,
  v.data_access_level,
  v.created_at,
  COUNT(a.id) AS total_assessments,
  COUNT(a.id) FILTER (WHERE a.status = 'Completed') AS completed_assessments,
  COUNT(a.id) FILTER (WHERE a.status = 'In Progress' OR a.status = 'Sent') AS active_assessments,
  COALESCE(
    AVG(a.risk_score) FILTER (WHERE a.risk_score IS NOT NULL),
    0
  )::integer AS avg_risk_score,
  MAX(a.completed_at) AS last_assessment_date
FROM tprm_vendors v
LEFT JOIN tprm_assessments a ON a.vendor_id = v.id
GROUP BY v.id, v.tenant_id, v.name, v.category, v.risk_tier, v.criticality_score,
  v.status, v.contact_person, v.email, v.contract_start, v.contract_end,
  v.last_audit_date, v.country, v.data_access_level, v.created_at;

-- ============================================================
-- SEED DATA
-- ============================================================
DO $$
DECLARE
  t_id uuid := '11111111-1111-1111-1111-111111111111';
  v_aws uuid := gen_random_uuid();
  v_koc uuid := gen_random_uuid();
  v_sodexo uuid := gen_random_uuid();
  v_esin uuid := gen_random_uuid();
  v_veri uuid := gen_random_uuid();
  v_turkcell uuid := gen_random_uuid();
  a_aws_1 uuid := gen_random_uuid();
  a_koc_1 uuid := gen_random_uuid();
  a_turkcell_1 uuid := gen_random_uuid();
  a_esin_1 uuid := gen_random_uuid();
BEGIN
  -- ========== VENDORS (6) ==========
  INSERT INTO tprm_vendors (id, tenant_id, name, category, risk_tier, criticality_score, status, contact_person, email, contract_start, contract_end, last_audit_date, country, data_access_level, notes) VALUES
    (v_aws, t_id, 'Amazon Web Services (AWS)', 'IT Altyapi / Bulut', 'Tier 1', 98, 'Active',
     'Umut Kaya (TAM)', 'umut.kaya@aws-turkey.com',
     '2024-01-01', '2027-01-01', '2025-11-15', 'ABD',
     'Full', 'Core banking ve DR altyapisi. BDDK dis hizmet bildirimi yapildi. SOC 2 Type II raporu mevcut.'),
    (v_koc, t_id, 'KocSistem Bilgi ve Iletisim', 'IT Yonetilen Hizmetler', 'Tier 1', 92, 'Active',
     'Mehmet Yilmaz', 'mehmet.yilmaz@kocsistem.com.tr',
     '2023-06-01', '2026-06-01', '2025-09-20', 'Turkiye',
     'Full', 'Veri merkezi operasyonlari ve guvenlik izleme (SOC). 7/24 NOC/SOC hizmeti.'),
    (v_sodexo, t_id, 'Sodexo Avantaj ve Odul', 'Hizmet / Yan Haklar', 'Tier 3', 25, 'Active',
     'Ayse Demir', 'ayse.demir@sodexo.com.tr',
     '2025-01-01', '2026-01-01', NULL, 'Turkiye',
     'Limited', 'Personel yemek karti ve yan hak yonetimi. Sinirli kisisel veri erisimi.'),
    (v_esin, t_id, 'Esin Avukatlik Ortakligi (Baker McKenzie)', 'Hukuk Danismanligi', 'Tier 2', 65, 'Active',
     'Av. Can Esin', 'can.esin@esin.av.tr',
     '2024-03-01', '2026-03-01', '2025-06-10', 'Turkiye',
     'Limited', 'BDDK mevzuat danismanligi ve dava takibi. Gizli musteri verileri paylasimi var.'),
    (v_veri, t_id, 'VeriKurtarma Merkezi A.S.', 'IT Destek / Veri Kurtarma', 'Tier 2', 70, 'Under Review',
     'Teknik Ekip', 'destek@verikurtarma.com.tr',
     '2024-07-01', '2025-12-31', '2025-04-22', 'Turkiye',
     'Full', 'Felaket kurtarma senaryolarinda kritik veri erisimi. Sozlesme yenileme surecinde.'),
    (v_turkcell, t_id, 'Turkcell Superonline', 'Telekomunikasyon', 'Tier 1', 85, 'Active',
     'Kurumsal Musteri Hiz.', 'kurumsal@superonline.net',
     '2023-01-01', '2026-12-31', '2025-10-05', 'Turkiye',
     'None', 'Ana ve yedek fiber altyapisi. SWIFT baglantisi ve DDoS koruma hizmeti dahil.');

  -- ========== ASSESSMENTS (4) ==========
  INSERT INTO tprm_assessments (id, tenant_id, vendor_id, title, status, risk_score, due_date, completed_at, assessor) VALUES
    (a_aws_1, t_id, v_aws, '2026 Yili Bilgi Guvenligi Degerlendirmesi', 'Completed', 82,
     '2025-12-01', '2025-11-15 14:30:00+03', 'Dr. Ahmet Korkmaz'),
    (a_koc_1, t_id, v_koc, '2026 SOC Hizmet Degerlendirmesi', 'In Progress', NULL,
     '2026-03-01', NULL, 'Fatma Ozturk'),
    (a_turkcell_1, t_id, v_turkcell, '2026 Telekom Altyapi Risk Anketi', 'Completed', 75,
     '2025-11-01', '2025-10-05 10:15:00+03', 'Burak Celik'),
    (a_esin_1, t_id, v_esin, '2026 Hukuk Danismani Gizlilik Degerlendirmesi', 'Sent', NULL,
     '2026-04-15', NULL, 'Selin Arslan');

  -- ========== ASSESSMENT ANSWERS: AWS (6 questions) ==========
  INSERT INTO tprm_assessment_answers (tenant_id, assessment_id, question_text, vendor_response, ai_grade_score, ai_grade_rationale, category) VALUES
    (t_id, a_aws_1, 'ISO 27001 sertifikaniz guncel mi?',
     'Evet, ISO 27001:2022 sertifikamiz Aralik 2025 tarihine kadar gecerlidir. Bagimsiz denetim BSI tarafindan yapilmistir.',
     9, 'Guncel sertifika ve bagimsiz dogrulama mevcut. Tam uyumlu.', 'Sertifika & Uyum'),
    (t_id, a_aws_1, 'Veri sifreleme politikanizi aciklayiniz.',
     'Tum veriler AES-256 ile sifrelenir. Transit verilerde TLS 1.3 kullanilir. Musteriye ozel KMS anahtarlari desteklenir.',
     10, 'Endustri standartlarinin ustunde sifreleme. KMS entegrasyonu mukemmel.', 'Veri Guvenligi'),
    (t_id, a_aws_1, 'Olay mudahale surecleriniz nelerdir?',
     'AWS Security Hub uzerinden 7/24 izleme. P1 olaylarda 15 dk SLA. Musteri bildirimi en gec 1 saat.',
     9, 'Cok hizli SLA ve proaktif bildirim. Sektorun en iyisi.', 'Olay Yonetimi'),
    (t_id, a_aws_1, 'Son 12 ayda yasanan guvenlik olaylarini bildiriniz.',
     'Son 12 ayda musterimizi etkileyen sifir guvenlik olayi yasanmistir. Genel AWS olaylari icin transparency raporumuza bakiniz.',
     8, 'Temiz gecmis, ancak transparency raporu detayli incelenmeli.', 'Olay Gecmisi'),
    (t_id, a_aws_1, 'Alt yuklenici kullanimi var mi?',
     'Evet, bazi bolgelerde yerel veri merkezi ortaklari kullanilmaktadir. Tam listesi NDA kapsaminda paylasilabilir.',
     7, 'Alt yuklenici mevcudiyeti risk olusturabilir. NDA kapsaminda detayli inceleme gerekli.', 'Ucuncu Taraf'),
    (t_id, a_aws_1, 'KVKK uyumlulugunuz hakkinda bilgi veriniz.',
     'Istanbul bolge ofisi uzerinden KVKK uyumlulugu saglanmaktadir. VERBIS kaydi mevcuttur. Veri isleme sozlesmesi imzalanmistir.',
     8, 'KVKK uyumu saglanmis. VERBIS kaydi dogrulanmali.', 'Yasal Uyum');

  -- ========== ASSESSMENT ANSWERS: TURKCELL (5 questions) ==========
  INSERT INTO tprm_assessment_answers (tenant_id, assessment_id, question_text, vendor_response, ai_grade_score, ai_grade_rationale, category) VALUES
    (t_id, a_turkcell_1, 'Ag guvenligi altyapinizi tanimlayiniz.',
     'DDoS koruma (Arbor Networks), IPS/IDS sistemleri, 7/24 NOC izlemesi mevcuttur.',
     8, 'Kapsamli ag guvenligi. DDoS koruma ozellikle onemli.', 'Ag Guvenligi'),
    (t_id, a_turkcell_1, 'SLA ihlallerini nasil yonetiyorsunuz?',
     'SLA izleme paneli mevcuttur. Ihlal durumunda otomatik eskalasyon ve ceza mekanizmasi aktiftir.',
     7, 'SLA yonetimi iyi ancak ceza mekanizmasi detaylandirilmali.', 'Hizmet Seviyesi'),
    (t_id, a_turkcell_1, 'Fiziksel guvenlik tedbirleriniz nelerdir?',
     'ISO 27001 uyumlu veri merkezleri. Biyometrik erisim, 7/24 CCTV, mantrap giris sistemleri.',
     9, 'Fiziksel guvenlik endustri standardinda. Biyometrik erisim pozitif.', 'Fiziksel Guvenlik'),
    (t_id, a_turkcell_1, 'Is surekliligi planlariniz?',
     'Yilda 2 kez DR testi yapilmaktadir. Coklu veri merkezi mimarisi ile %99.99 uptime garantisi.',
     8, 'Guclu is surekliligi. DR testleri duzenli.', 'Is Surekliligi'),
    (t_id, a_turkcell_1, 'Personel guvenlik taramalari uyguluyor musunuz?',
     'Tum kritik pozisyonlar icin ise giris guvenligi sorusturmasi ve yillik yenileme yapilmaktadir.',
     7, 'Personel taramasi mevcut ancak yenileme sikliginin arttirilmasi onerilir.', 'Insan Kaynaklari');

  -- ========== ASSESSMENT ANSWERS: KOCSISTEM - In Progress (4 questions, 2 answered) ==========
  INSERT INTO tprm_assessment_answers (tenant_id, assessment_id, question_text, vendor_response, ai_grade_score, ai_grade_rationale, category) VALUES
    (t_id, a_koc_1, 'SOC operasyonlarinizin kapsamini aciklayiniz.',
     '7/24 SOC hizmeti sunulmaktadir. SIEM olarak Splunk Enterprise kullanilmaktadir. Ortalama tespit suresi 12 dakikadir.',
     8, 'Iyi kapsam ve tespit suresi. SIEM secimi uygun.', 'SOC Operasyonlari'),
    (t_id, a_koc_1, 'Yedekleme ve veri koruma politikaniz nedir?',
     '3-2-1 yedekleme kurali uygulanmaktadir. Gunluk artimli, haftalik tam yedek. Yedekler sifrelenmektedir.',
     9, 'Endustri standartlarinda yedekleme politikasi. Sifreleme pozitif.', 'Veri Koruma'),
    (t_id, a_koc_1, 'Zafiyet yonetimi surecleriniz nelerdir?',
     NULL, NULL, NULL, 'Zafiyet Yonetimi'),
    (t_id, a_koc_1, 'Degisiklik yonetimi prosedurlerinizi aciklayiniz.',
     NULL, NULL, NULL, 'Degisiklik Yonetimi');

  -- ========== ASSESSMENT ANSWERS: ESIN - Sent (3 questions, unanswered) ==========
  INSERT INTO tprm_assessment_answers (tenant_id, assessment_id, question_text, vendor_response, ai_grade_score, ai_grade_rationale, category) VALUES
    (t_id, a_esin_1, 'Gizlilik sozlesmeleriniz guncel mi?',
     NULL, NULL, NULL, 'Gizlilik'),
    (t_id, a_esin_1, 'Musteri verilerine kimlerin erisimi var?',
     NULL, NULL, NULL, 'Erisim Kontrolu'),
    (t_id, a_esin_1, 'Dijital dosya paylasim yontemleriniz nelerdir?',
     NULL, NULL, NULL, 'Veri Paylasimi');
END $$;