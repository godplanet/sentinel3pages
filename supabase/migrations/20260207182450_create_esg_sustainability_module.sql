/*
  # Create ESG & Sustainability Module (Green Ledger)

  Blueprint: Sentinel v3.0 - Module C: ESG & Sustainability

  1. New Tables
    - `esg_frameworks` - Reporting frameworks (GRI, TCFD, UN SDGs, EU Taxonomy)
      - `id` (uuid, PK)
      - `tenant_id` (uuid, FK tenants)
      - `name` (text) - Framework name
      - `version` (text) - Version string
      - `category` (text) - Environmental, Social, Governance, Integrated
      - `is_active` (boolean)

    - `esg_metric_definitions` - Metric catalog per framework
      - `id` (uuid, PK)
      - `tenant_id` (uuid, FK tenants)
      - `framework_id` (uuid, FK esg_frameworks)
      - `code` (text) - e.g. "GRI 305-1"
      - `name` (text) - Human label
      - `pillar` (text) - E, S, G
      - `unit` (text) - tCO2e, kWh, %, count, TRY
      - `data_type` (text) - Number, Boolean, Currency, Percentage
      - `target_value` (numeric) - Target threshold
      - `target_direction` (text) - below, above, equal

    - `esg_data_points` - Cryo-Chamber immutable metric submissions
      - `id` (uuid, PK)
      - `tenant_id` (uuid, FK tenants)
      - `metric_id` (uuid, FK esg_metric_definitions)
      - `period` (text) - e.g. "2026-Q1"
      - `value` (numeric) - Reported value
      - `previous_value` (numeric) - Last period for delta
      - `evidence_url` (text) - Attached proof
      - `evidence_description` (text)
      - `submitted_by` (text) - Reporter name
      - `department` (text)
      - `ai_validation_status` (text) - Pending, Validated, Flagged, Override
      - `ai_notes` (text) - Green Skeptic findings
      - `ai_confidence` (numeric) - 0-100 confidence score
      - `snapshot_json` (jsonb) - Full frozen copy
      - `record_hash` (text) - SHA-256
      - `is_frozen` (boolean)
      - `signed_at` (timestamptz)

    - `esg_social_metrics` - Social impact HR data
      - `id` (uuid, PK)
      - `tenant_id` (uuid, FK tenants)
      - `period` (text)
      - `total_employees` (integer)
      - `women_total` (integer)
      - `women_management` (integer)
      - `women_board` (integer)
      - `gender_pay_gap_pct` (numeric)
      - `training_hours_per_employee` (numeric)
      - `employee_turnover_pct` (numeric)
      - `workplace_injuries` (integer)
      - `community_investment_try` (numeric)

    - `esg_green_assets` - Green Asset Ratio tracking
      - `id` (uuid, PK)
      - `tenant_id` (uuid, FK tenants)
      - `period` (text)
      - `total_loan_portfolio_try` (numeric)
      - `green_loans_try` (numeric)
      - `green_bonds_try` (numeric)
      - `taxonomy_aligned_pct` (numeric)
      - `transition_finance_try` (numeric)

  2. Security
    - RLS enabled on all tables
    - Dev-mode anon CRUD policies
    - Authenticated tenant-scoped read policies

  3. Seed Data
    - 4 frameworks (GRI, TCFD, UN SDGs, EU Taxonomy)
    - 18 metric definitions across E/S/G pillars
    - 12 data points (8 validated, 2 flagged, 2 pending)
    - 4 quarters of social metrics
    - 4 quarters of green asset data
*/

-- ============================================================
-- TABLE: esg_frameworks
-- ============================================================
CREATE TABLE IF NOT EXISTS esg_frameworks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111' REFERENCES tenants(id),
  name text NOT NULL,
  version text,
  category text NOT NULL DEFAULT 'Integrated',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT esg_fw_cat CHECK (category IN ('Environmental','Social','Governance','Integrated'))
);
CREATE INDEX IF NOT EXISTS idx_esg_fw_tenant ON esg_frameworks(tenant_id);
ALTER TABLE esg_frameworks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anon read esg_frameworks" ON esg_frameworks FOR SELECT TO anon USING (true);
CREATE POLICY "Anon insert esg_frameworks" ON esg_frameworks FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon update esg_frameworks" ON esg_frameworks FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon delete esg_frameworks" ON esg_frameworks FOR DELETE TO anon USING (true);
CREATE POLICY "Auth read esg_frameworks" ON esg_frameworks FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()));

-- ============================================================
-- TABLE: esg_metric_definitions
-- ============================================================
CREATE TABLE IF NOT EXISTS esg_metric_definitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111' REFERENCES tenants(id),
  framework_id uuid REFERENCES esg_frameworks(id) ON DELETE CASCADE,
  code text NOT NULL,
  name text NOT NULL,
  pillar text NOT NULL DEFAULT 'E',
  unit text NOT NULL DEFAULT 'tCO2e',
  data_type text NOT NULL DEFAULT 'Number',
  target_value numeric,
  target_direction text DEFAULT 'below',
  created_at timestamptz DEFAULT now(),
  CONSTRAINT esg_md_pillar CHECK (pillar IN ('E','S','G')),
  CONSTRAINT esg_md_dtype CHECK (data_type IN ('Number','Boolean','Currency','Percentage')),
  CONSTRAINT esg_md_dir CHECK (target_direction IN ('below','above','equal'))
);
CREATE INDEX IF NOT EXISTS idx_esg_md_fw ON esg_metric_definitions(framework_id);
CREATE INDEX IF NOT EXISTS idx_esg_md_pillar ON esg_metric_definitions(pillar);
ALTER TABLE esg_metric_definitions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anon read esg_metric_definitions" ON esg_metric_definitions FOR SELECT TO anon USING (true);
CREATE POLICY "Anon insert esg_metric_definitions" ON esg_metric_definitions FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon update esg_metric_definitions" ON esg_metric_definitions FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon delete esg_metric_definitions" ON esg_metric_definitions FOR DELETE TO anon USING (true);
CREATE POLICY "Auth read esg_metric_definitions" ON esg_metric_definitions FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()));

-- ============================================================
-- TABLE: esg_data_points (CRYO-CHAMBER)
-- ============================================================
CREATE TABLE IF NOT EXISTS esg_data_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111' REFERENCES tenants(id),
  metric_id uuid REFERENCES esg_metric_definitions(id) ON DELETE CASCADE,
  period text NOT NULL,
  value numeric NOT NULL,
  previous_value numeric,
  evidence_url text,
  evidence_description text,
  submitted_by text NOT NULL,
  department text,
  ai_validation_status text NOT NULL DEFAULT 'Pending',
  ai_notes text,
  ai_confidence numeric,
  snapshot_json jsonb NOT NULL DEFAULT '{}',
  record_hash text NOT NULL DEFAULT '',
  is_frozen boolean NOT NULL DEFAULT false,
  signed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT esg_dp_status CHECK (ai_validation_status IN ('Pending','Validated','Flagged','Override'))
);
CREATE INDEX IF NOT EXISTS idx_esg_dp_metric ON esg_data_points(metric_id);
CREATE INDEX IF NOT EXISTS idx_esg_dp_period ON esg_data_points(period);
CREATE INDEX IF NOT EXISTS idx_esg_dp_status ON esg_data_points(ai_validation_status);
ALTER TABLE esg_data_points ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anon read esg_data_points" ON esg_data_points FOR SELECT TO anon USING (true);
CREATE POLICY "Anon insert esg_data_points" ON esg_data_points FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon update esg_data_points" ON esg_data_points FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon delete esg_data_points" ON esg_data_points FOR DELETE TO anon USING (true);
CREATE POLICY "Auth read esg_data_points" ON esg_data_points FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()));

-- ============================================================
-- TABLE: esg_social_metrics
-- ============================================================
CREATE TABLE IF NOT EXISTS esg_social_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111' REFERENCES tenants(id),
  period text NOT NULL,
  total_employees integer NOT NULL DEFAULT 0,
  women_total integer NOT NULL DEFAULT 0,
  women_management integer NOT NULL DEFAULT 0,
  women_board integer NOT NULL DEFAULT 0,
  gender_pay_gap_pct numeric NOT NULL DEFAULT 0,
  training_hours_per_employee numeric NOT NULL DEFAULT 0,
  employee_turnover_pct numeric NOT NULL DEFAULT 0,
  workplace_injuries integer NOT NULL DEFAULT 0,
  community_investment_try numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_esg_sm_period ON esg_social_metrics(period);
ALTER TABLE esg_social_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anon read esg_social_metrics" ON esg_social_metrics FOR SELECT TO anon USING (true);
CREATE POLICY "Anon insert esg_social_metrics" ON esg_social_metrics FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon update esg_social_metrics" ON esg_social_metrics FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon delete esg_social_metrics" ON esg_social_metrics FOR DELETE TO anon USING (true);
CREATE POLICY "Auth read esg_social_metrics" ON esg_social_metrics FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()));

-- ============================================================
-- TABLE: esg_green_assets
-- ============================================================
CREATE TABLE IF NOT EXISTS esg_green_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111' REFERENCES tenants(id),
  period text NOT NULL,
  total_loan_portfolio_try numeric NOT NULL DEFAULT 0,
  green_loans_try numeric NOT NULL DEFAULT 0,
  green_bonds_try numeric NOT NULL DEFAULT 0,
  taxonomy_aligned_pct numeric NOT NULL DEFAULT 0,
  transition_finance_try numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_esg_ga_period ON esg_green_assets(period);
ALTER TABLE esg_green_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anon read esg_green_assets" ON esg_green_assets FOR SELECT TO anon USING (true);
CREATE POLICY "Anon insert esg_green_assets" ON esg_green_assets FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon update esg_green_assets" ON esg_green_assets FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon delete esg_green_assets" ON esg_green_assets FOR DELETE TO anon USING (true);
CREATE POLICY "Auth read esg_green_assets" ON esg_green_assets FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()));

-- ============================================================
-- SEED DATA
-- ============================================================
DO $$
DECLARE
  t_id uuid := '11111111-1111-1111-1111-111111111111';
  fw_gri uuid := gen_random_uuid();
  fw_tcfd uuid := gen_random_uuid();
  fw_sdg uuid := gen_random_uuid();
  fw_eu uuid := gen_random_uuid();
  -- E metrics
  m_scope1 uuid := gen_random_uuid();
  m_scope2 uuid := gen_random_uuid();
  m_scope3 uuid := gen_random_uuid();
  m_energy uuid := gen_random_uuid();
  m_renew uuid := gen_random_uuid();
  m_water uuid := gen_random_uuid();
  m_waste uuid := gen_random_uuid();
  -- S metrics
  m_divm uuid := gen_random_uuid();
  m_divb uuid := gen_random_uuid();
  m_gpg uuid := gen_random_uuid();
  m_train uuid := gen_random_uuid();
  m_safety uuid := gen_random_uuid();
  m_community uuid := gen_random_uuid();
  -- G metrics
  m_board_ind uuid := gen_random_uuid();
  m_ethics uuid := gen_random_uuid();
  m_cyber uuid := gen_random_uuid();
  m_tax uuid := gen_random_uuid();
  m_gar uuid := gen_random_uuid();
BEGIN
  -- ========== FRAMEWORKS ==========
  INSERT INTO esg_frameworks (id, tenant_id, name, version, category) VALUES
    (fw_gri, t_id, 'GRI Standards', '2024', 'Integrated'),
    (fw_tcfd, t_id, 'TCFD Recommendations', '2023', 'Environmental'),
    (fw_sdg, t_id, 'UN Sustainable Development Goals', '2030 Agenda', 'Integrated'),
    (fw_eu, t_id, 'EU Taxonomy Regulation', '2024/1214', 'Environmental');

  -- ========== METRIC DEFINITIONS (18) ==========
  INSERT INTO esg_metric_definitions (id, tenant_id, framework_id, code, name, pillar, unit, data_type, target_value, target_direction) VALUES
    -- Environmental (7)
    (m_scope1, t_id, fw_gri, 'GRI 305-1', 'Dogrudan (Kapsam 1) Sera Gazi Emisyonlari', 'E', 'tCO2e', 'Number', 12000, 'below'),
    (m_scope2, t_id, fw_gri, 'GRI 305-2', 'Dolayli Enerji (Kapsam 2) Emisyonlari', 'E', 'tCO2e', 'Number', 8000, 'below'),
    (m_scope3, t_id, fw_gri, 'GRI 305-3', 'Diger Dolayli (Kapsam 3) Emisyonlari', 'E', 'tCO2e', 'Number', 45000, 'below'),
    (m_energy, t_id, fw_gri, 'GRI 302-1', 'Toplam Enerji Tuketimi', 'E', 'MWh', 'Number', 25000, 'below'),
    (m_renew, t_id, fw_tcfd, 'TCFD-E-04', 'Yenilenebilir Enerji Orani', 'E', '%', 'Percentage', 60, 'above'),
    (m_water, t_id, fw_gri, 'GRI 303-5', 'Su Tuketimi', 'E', 'm3', 'Number', 50000, 'below'),
    (m_waste, t_id, fw_gri, 'GRI 306-3', 'Toplam Atik Miktari', 'E', 'ton', 'Number', 200, 'below'),
    -- Social (6)
    (m_divm, t_id, fw_gri, 'GRI 405-1a', 'Ust Yonetimde Kadin Orani', 'S', '%', 'Percentage', 35, 'above'),
    (m_divb, t_id, fw_gri, 'GRI 405-1b', 'Yonetim Kurulunda Kadin Orani', 'S', '%', 'Percentage', 30, 'above'),
    (m_gpg, t_id, fw_sdg, 'SDG 5.1', 'Cinsiyet Ucret Farki', 'S', '%', 'Percentage', 5, 'below'),
    (m_train, t_id, fw_gri, 'GRI 404-1', 'Calisan Basina Egitim Saati', 'S', 'saat', 'Number', 40, 'above'),
    (m_safety, t_id, fw_gri, 'GRI 403-9', 'Is Kazasi Orani (LTIR)', 'S', 'oran', 'Number', 0.5, 'below'),
    (m_community, t_id, fw_sdg, 'SDG 17.3', 'Toplumsal Yatirim (TRY)', 'S', 'TRY', 'Currency', 5000000, 'above'),
    -- Governance (5)
    (m_board_ind, t_id, fw_gri, 'GRI 2-9', 'Bagimsiz YK Uyesi Orani', 'G', '%', 'Percentage', 50, 'above'),
    (m_ethics, t_id, fw_gri, 'GRI 2-26', 'Etik Ihlal Bildirim Sayisi', 'G', 'adet', 'Number', NULL, NULL),
    (m_cyber, t_id, fw_tcfd, 'TCFD-G-02', 'Siber Guvenlik Olgunluk Skoru', 'G', 'puan', 'Number', 4, 'above'),
    (m_tax, t_id, fw_gri, 'GRI 207-4', 'Efektif Vergi Orani', 'G', '%', 'Percentage', NULL, NULL),
    (m_gar, t_id, fw_eu, 'EU-TAX-01', 'Yesil Varlik Orani (GAR)', 'G', '%', 'Percentage', 15, 'above');

  -- ========== DATA POINTS (12) ==========
  -- Scope 1 emissions - validated
  INSERT INTO esg_data_points (tenant_id, metric_id, period, value, previous_value, evidence_url, evidence_description, submitted_by, department, ai_validation_status, ai_notes, ai_confidence, snapshot_json, record_hash, is_frozen, signed_at) VALUES
    (t_id, m_scope1, '2026-Q1', 11450, 12800, 'https://docs.internal/emissions-q1-2026.pdf', 'Dogrudan emisyon olcum raporu - ISO 14064 sertifikali', 'Zeynep Aksoy', 'Surdurulebilirlik',
     'Validated', 'GREEN SKEPTIC: Kapsam 1 emisyon degeri ISO 14064 sertifikali rapor ile desteklenmektedir. Onceki doneme gore %10.5 azalis tutarlidir. Enerji tuketim verileriyle uyumlu.', 92,
     jsonb_build_object('code','GRI 305-1','value',11450,'unit','tCO2e','period','2026-Q1','evidence','ISO 14064 raporu'),
     encode(sha256(convert_to('GRI305-1:11450:2026-Q1:Zeynep Aksoy', 'UTF8')), 'hex'), true, now() - interval '10 days'),
  -- Scope 2 - validated
    (t_id, m_scope2, '2026-Q1', 7200, 8100, 'https://docs.internal/energy-bills-q1.pdf', 'Elektrik faturalari ve emisyon faktoru hesaplama tablosu', 'Zeynep Aksoy', 'Surdurulebilirlik',
     'Validated', 'GREEN SKEPTIC: Kapsam 2 emisyonlari elektrik tuketim faturalari ile dogrulanmistir. EPDK emisyon faktorleri ile tutarli.', 88,
     jsonb_build_object('code','GRI 305-2','value',7200,'unit','tCO2e','period','2026-Q1'),
     encode(sha256(convert_to('GRI305-2:7200:2026-Q1:Zeynep Aksoy', 'UTF8')), 'hex'), true, now() - interval '10 days'),
  -- Renewable energy - FLAGGED (Greenwashing alert)
    (t_id, m_renew, '2026-Q1', 100, 45, NULL, 'Tum subeler yesil enerji tarifesine gecmistir', 'Emre Koc', 'Tesis Yonetimi',
     'Flagged', 'GREEN SKEPTIC [KRITIK]: Kullanici %100 yenilenebilir enerji beyani vermektedir, ancak onceki donemde oran %45 idi. %122 artis son derece olasi disi. Kanit belgesi EKSiK. Enerji tedarikci sertifikasi istenmektedir. Potansiyel GREENWASHING riski.', 15,
     jsonb_build_object('code','TCFD-E-04','value',100,'unit','%','period','2026-Q1','flagged',true),
     encode(sha256(convert_to('TCFDE04:100:2026-Q1:Emre Koc:FLAGGED', 'UTF8')), 'hex'), false, NULL),
  -- Water - validated
    (t_id, m_water, '2026-Q1', 42000, 48000, 'https://docs.internal/water-meters-q1.pdf', 'Sayac okumalari ve su faturalari', 'Zeynep Aksoy', 'Surdurulebilirlik',
     'Validated', 'GREEN SKEPTIC: Su tuketimi sayac verileri ile uyumlu. %12.5 azalis tasarruf projeleri ile aciklanabilir.', 85,
     jsonb_build_object('code','GRI 303-5','value',42000,'unit','m3','period','2026-Q1'),
     encode(sha256(convert_to('GRI303-5:42000:2026-Q1:Zeynep Aksoy', 'UTF8')), 'hex'), true, now() - interval '8 days'),
  -- Diversity management - validated
    (t_id, m_divm, '2026-Q1', 28, 25, 'https://hr.internal/diversity-report-q1.pdf', 'IK cesitlilik raporu', 'Selin Yildiz', 'Insan Kaynaklari',
     'Validated', 'GREEN SKEPTIC: Ust yonetimde kadin orani %28. Hedef %35. IK kayitlari ile dogrulandi. Olumlu trend.', 90,
     jsonb_build_object('code','GRI 405-1a','value',28,'unit','%','period','2026-Q1'),
     encode(sha256(convert_to('GRI405-1a:28:2026-Q1:Selin Yildiz', 'UTF8')), 'hex'), true, now() - interval '7 days'),
  -- Gender pay gap - FLAGGED
    (t_id, m_gpg, '2026-Q1', 2.1, 8.5, NULL, 'Maas esitligi projesi tamamlanmistir', 'Emre Koc', 'Insan Kaynaklari',
     'Flagged', 'GREEN SKEPTIC [UYARI]: Cinsiyet ucret farki tek ceyrekte %8.5 den %2.1 e dusmektedir. Bu boyutta ani iyilesme son derece nadir. Detayli maas analizi ve bagimsiz dogrulama istenmektedir. Kanit belgesi EKSIK.', 22,
     jsonb_build_object('code','SDG 5.1','value',2.1,'unit','%','period','2026-Q1','flagged',true),
     encode(sha256(convert_to('SDG5.1:2.1:2026-Q1:Emre Koc:FLAGGED', 'UTF8')), 'hex'), false, NULL),
  -- Training hours - validated
    (t_id, m_train, '2026-Q1', 38, 32, 'https://hr.internal/training-log-q1.pdf', 'Egitim katilim raporlari', 'Selin Yildiz', 'Insan Kaynaklari',
     'Validated', 'GREEN SKEPTIC: Calisan basina 38 saat egitim. LMS kayitlari ile dogrulandi.', 87,
     jsonb_build_object('code','GRI 404-1','value',38,'unit','saat','period','2026-Q1'),
     encode(sha256(convert_to('GRI404-1:38:2026-Q1:Selin Yildiz', 'UTF8')), 'hex'), true, now() - interval '5 days'),
  -- Board independence - validated
    (t_id, m_board_ind, '2026-Q1', 55, 55, 'https://governance.internal/yk-composition.pdf', 'YK yapisi raporu', 'Dr. Ahmet Korkmaz', 'Ust Yonetim',
     'Validated', 'GREEN SKEPTIC: 9 YK uyesinden 5 i bagimsiz (%55). KAP bildirimleri ile tutarli.', 95,
     jsonb_build_object('code','GRI 2-9','value',55,'unit','%','period','2026-Q1'),
     encode(sha256(convert_to('GRI2-9:55:2026-Q1:Dr. Ahmet Korkmaz', 'UTF8')), 'hex'), true, now() - interval '5 days'),
  -- GAR - validated
    (t_id, m_gar, '2026-Q1', 12.3, 9.8, 'https://credit.internal/green-portfolio-q1.pdf', 'Yesil kredi portfoy analizi', 'Zeynep Aksoy', 'Surdurulebilirlik',
     'Validated', 'GREEN SKEPTIC: Yesil Varlik Orani %12.3. Kredi portfoy verileri ile dogrulandi. EU Taksonomi eslesme orani tutarli.', 86,
     jsonb_build_object('code','EU-TAX-01','value',12.3,'unit','%','period','2026-Q1'),
     encode(sha256(convert_to('EUTAX01:12.3:2026-Q1:Zeynep Aksoy', 'UTF8')), 'hex'), true, now() - interval '4 days'),
  -- Scope 3 - pending
    (t_id, m_scope3, '2026-Q1', 38500, 42000, NULL, 'Tedarik zinciri emisyon tahmini', 'Zeynep Aksoy', 'Surdurulebilirlik',
     'Pending', NULL, NULL,
     jsonb_build_object('code','GRI 305-3','value',38500,'unit','tCO2e','period','2026-Q1'),
     encode(sha256(convert_to('GRI305-3:38500:2026-Q1:Zeynep Aksoy', 'UTF8')), 'hex'), false, NULL),
  -- Energy - pending
    (t_id, m_energy, '2026-Q1', 22800, 24500, NULL, 'Enerji tuketim ozeti', 'Zeynep Aksoy', 'Surdurulebilirlik',
     'Pending', NULL, NULL,
     jsonb_build_object('code','GRI 302-1','value',22800,'unit','MWh','period','2026-Q1'),
     encode(sha256(convert_to('GRI302-1:22800:2026-Q1:Zeynep Aksoy', 'UTF8')), 'hex'), false, NULL),
  -- Cyber score - validated
    (t_id, m_cyber, '2026-Q1', 3.8, 3.5, 'https://it.internal/cyber-maturity-q1.pdf', 'NIST CSF olgunluk degerlendirmesi', 'Ayse Demir', 'Bilgi Teknolojileri',
     'Validated', 'GREEN SKEPTIC: Siber olgunluk skoru 3.8/5. NIST CSF degerlendirme raporu ile dogrulandi.', 91,
     jsonb_build_object('code','TCFD-G-02','value',3.8,'unit','puan','period','2026-Q1'),
     encode(sha256(convert_to('TCFDG02:3.8:2026-Q1:Ayse Demir', 'UTF8')), 'hex'), true, now() - interval '3 days');

  -- ========== SOCIAL METRICS (4 quarters) ==========
  INSERT INTO esg_social_metrics (tenant_id, period, total_employees, women_total, women_management, women_board, gender_pay_gap_pct, training_hours_per_employee, employee_turnover_pct, workplace_injuries, community_investment_try) VALUES
    (t_id, '2025-Q2', 4200, 1890, 210, 2, 8.5, 28, 4.2, 3, 3200000),
    (t_id, '2025-Q3', 4250, 1912, 225, 2, 7.8, 31, 3.8, 1, 3500000),
    (t_id, '2025-Q4', 4300, 1978, 248, 3, 6.2, 35, 3.5, 2, 4100000),
    (t_id, '2026-Q1', 4350, 2044, 268, 3, 5.1, 38, 3.2, 0, 4800000);

  -- ========== GREEN ASSET RATIO (4 quarters) ==========
  INSERT INTO esg_green_assets (tenant_id, period, total_loan_portfolio_try, green_loans_try, green_bonds_try, taxonomy_aligned_pct, transition_finance_try) VALUES
    (t_id, '2025-Q2', 82000000000, 6560000000, 1200000000, 8.0, 2400000000),
    (t_id, '2025-Q3', 85000000000, 7650000000, 1500000000, 9.0, 2800000000),
    (t_id, '2025-Q4', 88000000000, 8624000000, 1800000000, 9.8, 3100000000),
    (t_id, '2026-Q1', 91000000000, 11193000000, 2200000000, 12.3, 3600000000);
END $$;