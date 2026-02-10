/*
  # Create Compliance Mapper Schema with Rich Seed Data

  1. New Tables
    - `compliance_frameworks` - Regulatory frameworks (BDDK, KVKK, ISO, COBIT)
      - `id` (uuid, PK)
      - `tenant_id` (uuid, FK tenants)
      - `name` (text) - Framework title
      - `short_code` (text) - e.g. "BDDK-BSY"
      - `authority` (text) - Issuing body
      - `version` (text)
      - `description` (text)
      - `effective_date` (date)
      - `status` (text) - ACTIVE, DEPRECATED, DRAFT
    - `framework_requirements` - Individual regulation articles
      - `id` (uuid, PK)
      - `tenant_id` (uuid, FK tenants)
      - `framework_id` (uuid, FK compliance_frameworks)
      - `code` (text) - e.g. "Madde 24"
      - `title` (text)
      - `description` (text)
      - `category` (text) - Grouping category
      - `priority` (text) - CRITICAL, HIGH, MEDIUM, LOW
    - `control_requirement_mappings` - Maps controls to requirements
      - `id` (uuid, PK)
      - `tenant_id` (uuid, FK tenants)
      - `control_ref` (text) - Control reference code
      - `control_title` (text)
      - `requirement_id` (uuid, FK framework_requirements)
      - `coverage_strength` (text) - FULL, PARTIAL, WEAK
      - `match_score` (integer, 0-100)
      - `notes` (text)

  2. Security
    - RLS enabled on all tables
    - Anon read/write policies for dev/demo mode
    - Authenticated user policies for production

  3. Seed Data
    - 4 frameworks: BDDK-BSY, KVKK, ISO 27001, COBIT 2019
    - 30+ requirements across frameworks with realistic Turkish banking content
    - 15+ control mappings showing various coverage levels

  4. Views
    - `framework_coverage_stats` - Per-framework coverage percentages
*/

-- ============================================================
-- TABLE: compliance_frameworks
-- ============================================================
CREATE TABLE IF NOT EXISTS compliance_frameworks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111' REFERENCES tenants(id),
  name text NOT NULL,
  short_code text,
  authority text,
  version text,
  description text,
  effective_date date,
  status text NOT NULL DEFAULT 'ACTIVE',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cf_tenant ON compliance_frameworks(tenant_id);
CREATE INDEX IF NOT EXISTS idx_cf_status ON compliance_frameworks(status);

ALTER TABLE compliance_frameworks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon can read frameworks (dev)"
  ON compliance_frameworks FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can insert frameworks (dev)"
  ON compliance_frameworks FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon can update frameworks (dev)"
  ON compliance_frameworks FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Auth users read own tenant frameworks"
  ON compliance_frameworks FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()));

-- ============================================================
-- TABLE: framework_requirements
-- ============================================================
CREATE TABLE IF NOT EXISTS framework_requirements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111' REFERENCES tenants(id),
  framework_id uuid NOT NULL REFERENCES compliance_frameworks(id) ON DELETE CASCADE,
  code text NOT NULL,
  title text NOT NULL,
  description text,
  category text,
  priority text NOT NULL DEFAULT 'MEDIUM',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fr_framework ON framework_requirements(framework_id);
CREATE INDEX IF NOT EXISTS idx_fr_tenant ON framework_requirements(tenant_id);
CREATE INDEX IF NOT EXISTS idx_fr_priority ON framework_requirements(priority);

ALTER TABLE framework_requirements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon can read requirements (dev)"
  ON framework_requirements FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can insert requirements (dev)"
  ON framework_requirements FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon can update requirements (dev)"
  ON framework_requirements FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Auth users read own tenant requirements"
  ON framework_requirements FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()));

-- ============================================================
-- TABLE: control_requirement_mappings
-- ============================================================
CREATE TABLE IF NOT EXISTS control_requirement_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111' REFERENCES tenants(id),
  control_ref text NOT NULL,
  control_title text NOT NULL,
  requirement_id uuid NOT NULL REFERENCES framework_requirements(id) ON DELETE CASCADE,
  coverage_strength text NOT NULL DEFAULT 'FULL',
  match_score integer NOT NULL DEFAULT 100,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT crm_match_score_range CHECK (match_score >= 0 AND match_score <= 100),
  CONSTRAINT crm_coverage_check CHECK (coverage_strength IN ('FULL','PARTIAL','WEAK'))
);

CREATE INDEX IF NOT EXISTS idx_crm_requirement ON control_requirement_mappings(requirement_id);
CREATE INDEX IF NOT EXISTS idx_crm_tenant ON control_requirement_mappings(tenant_id);
CREATE INDEX IF NOT EXISTS idx_crm_control_ref ON control_requirement_mappings(control_ref);

ALTER TABLE control_requirement_mappings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon can read mappings (dev)"
  ON control_requirement_mappings FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can insert mappings (dev)"
  ON control_requirement_mappings FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon can update mappings (dev)"
  ON control_requirement_mappings FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon can delete mappings (dev)"
  ON control_requirement_mappings FOR DELETE TO anon USING (true);
CREATE POLICY "Auth users read own tenant mappings"
  ON control_requirement_mappings FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()));

-- ============================================================
-- VIEW: framework_coverage_stats
-- ============================================================
CREATE OR REPLACE VIEW framework_coverage_stats AS
SELECT
  cf.id AS framework_id,
  cf.tenant_id,
  cf.name,
  cf.short_code,
  cf.authority,
  cf.status,
  COUNT(fr.id) AS total_requirements,
  COUNT(DISTINCT CASE WHEN crm.id IS NOT NULL THEN fr.id END) AS covered_requirements,
  COUNT(DISTINCT CASE WHEN crm.id IS NULL THEN fr.id END) AS gap_count,
  CASE
    WHEN COUNT(fr.id) = 0 THEN 0
    ELSE ROUND((COUNT(DISTINCT CASE WHEN crm.id IS NOT NULL THEN fr.id END)::numeric / COUNT(fr.id)::numeric) * 100)
  END AS coverage_pct,
  COALESCE(AVG(crm.match_score) FILTER (WHERE crm.id IS NOT NULL), 0)::integer AS avg_match_score
FROM compliance_frameworks cf
LEFT JOIN framework_requirements fr ON fr.framework_id = cf.id
LEFT JOIN control_requirement_mappings crm ON crm.requirement_id = fr.id
WHERE cf.status = 'ACTIVE'
GROUP BY cf.id, cf.tenant_id, cf.name, cf.short_code, cf.authority, cf.status;

-- ============================================================
-- SEED DATA
-- ============================================================
DO $$
DECLARE
  t_id uuid := '11111111-1111-1111-1111-111111111111';
  fw_bddk uuid := gen_random_uuid();
  fw_kvkk uuid := gen_random_uuid();
  fw_iso uuid := gen_random_uuid();
  fw_cobit uuid := gen_random_uuid();
  -- BDDK requirement IDs
  r_bddk_01 uuid := gen_random_uuid();
  r_bddk_02 uuid := gen_random_uuid();
  r_bddk_03 uuid := gen_random_uuid();
  r_bddk_04 uuid := gen_random_uuid();
  r_bddk_05 uuid := gen_random_uuid();
  r_bddk_06 uuid := gen_random_uuid();
  r_bddk_07 uuid := gen_random_uuid();
  r_bddk_08 uuid := gen_random_uuid();
  r_bddk_09 uuid := gen_random_uuid();
  r_bddk_10 uuid := gen_random_uuid();
  -- KVKK requirement IDs
  r_kvkk_01 uuid := gen_random_uuid();
  r_kvkk_02 uuid := gen_random_uuid();
  r_kvkk_03 uuid := gen_random_uuid();
  r_kvkk_04 uuid := gen_random_uuid();
  r_kvkk_05 uuid := gen_random_uuid();
  r_kvkk_06 uuid := gen_random_uuid();
  r_kvkk_07 uuid := gen_random_uuid();
  -- ISO requirement IDs
  r_iso_01 uuid := gen_random_uuid();
  r_iso_02 uuid := gen_random_uuid();
  r_iso_03 uuid := gen_random_uuid();
  r_iso_04 uuid := gen_random_uuid();
  r_iso_05 uuid := gen_random_uuid();
  r_iso_06 uuid := gen_random_uuid();
  r_iso_07 uuid := gen_random_uuid();
  r_iso_08 uuid := gen_random_uuid();
  -- COBIT requirement IDs
  r_cobit_01 uuid := gen_random_uuid();
  r_cobit_02 uuid := gen_random_uuid();
  r_cobit_03 uuid := gen_random_uuid();
  r_cobit_04 uuid := gen_random_uuid();
  r_cobit_05 uuid := gen_random_uuid();
  r_cobit_06 uuid := gen_random_uuid();
BEGIN
  -- ========== FRAMEWORKS ==========
  INSERT INTO compliance_frameworks (id, tenant_id, name, short_code, authority, version, description, effective_date, status) VALUES
    (fw_bddk, t_id, 'Bankalarin Bilgi Sistemleri Yonetmeligi', 'BDDK-BSY', 'BDDK', 'v4.0',
     'Bankalarin bilgi sistemlerinin yonetimi, risk yonetimi ve iç kontrol sureclerine iliskin usul ve esaslar',
     '2024-01-01', 'ACTIVE'),
    (fw_kvkk, t_id, 'Kisisel Verilerin Korunmasi Kanunu', 'KVKK', 'KVK Kurumu', '6698',
     'Kisisel verilerin islenmesinde bireylerin temel hak ve ozgurluklerin korunmasi',
     '2016-04-07', 'ACTIVE'),
    (fw_iso, t_id, 'ISO/IEC 27001:2022 Bilgi Guvenligi', 'ISO-27001', 'ISO', '2022',
     'Bilgi guvenligi yonetim sistemi gereksinimleri - Ek A kontrolleri',
     '2022-10-25', 'ACTIVE'),
    (fw_cobit, t_id, 'COBIT 2019 BT Yonetisim Cercevesi', 'COBIT-2019', 'ISACA', '2019',
     'Bilgi ve teknoloji yonetisimi icin kurumsal cerceve',
     '2019-01-01', 'ACTIVE');

  -- ========== BDDK-BSY REQUIREMENTS (10) ==========
  INSERT INTO framework_requirements (id, tenant_id, framework_id, code, title, description, category, priority) VALUES
    (r_bddk_01, t_id, fw_bddk, 'Madde 20', 'Sizdi Testleri ve Guvenlik Aciklari',
     'Bankalar bilgi sistemlerinde yilda en az bir kez sizdi testi yaptirmak zorundadir. Tespit edilen acikliklar 30 gun icinde kapatilmalidir.',
     'Guvenlik Testleri', 'CRITICAL'),
    (r_bddk_02, t_id, fw_bddk, 'Madde 24', 'Kimlik Dogrulama ve Yetkilendirme',
     'Bilgi sistemlerine erisimde cok faktorlu kimlik dogrulama uygulanmalidir. Kritik sistemlerde en az iki faktorlu dogrulama zorunludur.',
     'Erisim Yonetimi', 'CRITICAL'),
    (r_bddk_03, t_id, fw_bddk, 'Madde 28', 'Is Surekliligi Yonetimi',
     'Bankalar, bilgi sistemlerinin surekliligi icin felaket kurtarma planlarini yilda en az bir kez test etmelidir.',
     'Is Surekliligi', 'HIGH'),
    (r_bddk_04, t_id, fw_bddk, 'Madde 15', 'Bilgi Sistemleri Risk Yonetimi',
     'BS riskleri, bankanin genel risk yonetimi cercevesine entegre edilmeli ve duzgun olarak raporlanmalidir.',
     'Risk Yonetimi', 'HIGH'),
    (r_bddk_05, t_id, fw_bddk, 'Madde 32', 'Dis Hizmet Alimi Yonetimi',
     'Bankalarin bilgi sistemleri alanindaki dis hizmet alimlarinda BDDK bilgilendirilmeli ve risk degerlendirmesi yapilmalidir.',
     'Ucuncu Taraf', 'HIGH'),
    (r_bddk_06, t_id, fw_bddk, 'Madde 18', 'Log Yonetimi ve Izleme',
     'Tum kritik sistem loglarinin merkezi olarak toplanmasi, en az 5 yil saklanmasi ve duzenli olarak incelenmesi gerekmektedir.',
     'Izleme', 'HIGH'),
    (r_bddk_07, t_id, fw_bddk, 'Madde 22', 'Ag Guvenligi',
     'Bankanin ag altyapisi segmentasyon, IDS/IPS ve guvenlik duvari ile korunmalidir.',
     'Ag Guvenligi', 'MEDIUM'),
    (r_bddk_08, t_id, fw_bddk, 'Madde 26', 'Yazilim Gelistirme Surecleri',
     'Bankalar guvenli yazilim gelistirme yasam dongusu (SDLC) uygulayarak, kod gozden gecirme ve guvenlik testlerini yapmalidirlar.',
     'Yazilim Guvenligi', 'MEDIUM'),
    (r_bddk_09, t_id, fw_bddk, 'Madde 30', 'Veri Siniflandirma',
     'Banka verileri gizlilik, butunluk ve erisilebilirlik acisidan siniflandirilmalidir.',
     'Veri Yonetimi', 'MEDIUM'),
    (r_bddk_10, t_id, fw_bddk, 'Madde 35', 'Olay Yonetimi ve Raporlama',
     'Bilgi guvenligi olaylari siniflandirilmali ve kritik olaylar 24 saat icinde BDDK''ye bildirilmelidir.',
     'Olay Yonetimi', 'CRITICAL');

  -- ========== KVKK REQUIREMENTS (7) ==========
  INSERT INTO framework_requirements (id, tenant_id, framework_id, code, title, description, category, priority) VALUES
    (r_kvkk_01, t_id, fw_kvkk, 'Madde 4', 'Genel Ilkeler',
     'Kisisel veriler; hukuka uygun, dogru, belirli amaclarla, sinirli ve olculu sekilde islenmeli ve gerektiginde guncellenmeli.',
     'Genel Ilkeler', 'HIGH'),
    (r_kvkk_02, t_id, fw_kvkk, 'Madde 5', 'Isleme Sartlari',
     'Kisisel verilerin islenmesi icin acik riza veya kanunda belirtilen diger istisnai sartlar gerekmektedir.',
     'Veri Isleme', 'CRITICAL'),
    (r_kvkk_03, t_id, fw_kvkk, 'Madde 7', 'Silme, Yok Etme veya Anonim Hale Getirme',
     'Isleme amaci ortadan kalkan kisisel veriler re''sen veya talep uzerine silinmeli, yok edilmeli veya anonim hale getirilmelidir.',
     'Veri Yasam Dongusu', 'HIGH'),
    (r_kvkk_04, t_id, fw_kvkk, 'Madde 10', 'Aydinlatma Yukumlulugu',
     'Veri sorumlusu, ilgili kisileri veri isleme amaci, aktarim ve haklari konusunda bilgilendirmelidir.',
     'Seffaflik', 'HIGH'),
    (r_kvkk_05, t_id, fw_kvkk, 'Madde 12', 'Veri Guvenligi Tedbirleri',
     'Veri sorumlusu; verilerin hukuka aykiri islenmesini ve erisimi onlemek, verilerin muhafazasini saglamak icin gerekli teknik ve idari tedbirleri almalidir.',
     'Guvenlik', 'CRITICAL'),
    (r_kvkk_06, t_id, fw_kvkk, 'Madde 9', 'Yurt Disina Aktarim',
     'Kisisel verilerin yurt disina aktarimi icin acik riza veya yeterli koruma bulunan ulke sarti aranir.',
     'Veri Aktarimi', 'HIGH'),
    (r_kvkk_07, t_id, fw_kvkk, 'Madde 16', 'Veri Sorumlusu Sicili (VERBIS)',
     'Veri sorumlulari, VERBISe kayit olarak isleme envanterini guncel tutmalidir.',
     'Kayit Yukumlulugu', 'MEDIUM');

  -- ========== ISO 27001:2022 REQUIREMENTS (8) ==========
  INSERT INTO framework_requirements (id, tenant_id, framework_id, code, title, description, category, priority) VALUES
    (r_iso_01, t_id, fw_iso, 'A.5.1', 'Bilgi Guvenligi Politikalari',
     'Bilgi guvenligi politikalari tanimlanmali, yonetim tarafindan onaylanmali ve duzenli olarak gozden gecirilmelidir.',
     'Organizasyonel', 'HIGH'),
    (r_iso_02, t_id, fw_iso, 'A.5.15', 'Erisim Kontrolu',
     'Bilgi ve diger iliskili varliklara fiziksel ve mantiksal erisim kurallari tanimlanmali ve uygulanmalidir.',
     'Erisim Kontrolu', 'CRITICAL'),
    (r_iso_03, t_id, fw_iso, 'A.5.23', 'Bulut Hizmetleri Guvenligi',
     'Bulut hizmetlerinin edinimi, kullanimi, yonetimi ve sonlandirilmasi icin surecler olusturulmalidir.',
     'Tedarikci', 'MEDIUM'),
    (r_iso_04, t_id, fw_iso, 'A.8.9', 'Konfigurasyon Yonetimi',
     'Donanim, yazilim, hizmetler ve aglarin guvenlik konfigurasyonlari tanimlanmali ve yonetilmelidir.',
     'Teknolojik', 'HIGH'),
    (r_iso_05, t_id, fw_iso, 'A.8.12', 'Veri Sizintisi Onleme (DLP)',
     'Hassas bilgileri isleten, depolayan veya ileten sistemlere veri sizintisi onleme tedbirleri uygulanmalidir.',
     'Teknolojik', 'HIGH'),
    (r_iso_06, t_id, fw_iso, 'A.8.16', 'Izleme Faaliyetleri',
     'Aglar, sistemler ve uygulamalar anormal davranislar icin izlenmeli ve uygun onlemler alinmalidir.',
     'Teknolojik', 'HIGH'),
    (r_iso_07, t_id, fw_iso, 'A.6.8', 'Bilgi Guvenligi Olay Raporlama',
     'Bilgi guvenligi olaylarini raporlamak icin mekanizmalar saglanmalidir.',
     'Insan', 'MEDIUM'),
    (r_iso_08, t_id, fw_iso, 'A.5.29', 'Is Surekliligi icin BG',
     'Bilgi guvenligi surekliligi, is surekliligi yonetimi cercevesine entegre edilmelidir.',
     'Organizasyonel', 'HIGH');

  -- ========== COBIT 2019 REQUIREMENTS (6) ==========
  INSERT INTO framework_requirements (id, tenant_id, framework_id, code, title, description, category, priority) VALUES
    (r_cobit_01, t_id, fw_cobit, 'APO12', 'Risk Yonetimi',
     'BT ile ilgili risklerin surekli olarak tanimlanmasi, degerlenmesi ve azaltilmasi.',
     'Align Plan Organize', 'HIGH'),
    (r_cobit_02, t_id, fw_cobit, 'APO13', 'Guvenlik Yonetimi',
     'Kurumsal bilgi guvenlik politikalarinin tanimlanmasi, isletilmesi ve izlenmesi.',
     'Align Plan Organize', 'CRITICAL'),
    (r_cobit_03, t_id, fw_cobit, 'BAI06', 'Degisiklik Yonetimi',
     'BT ortamindaki tum degisikliklerin yonetilen sekilde ele alinmasi.',
     'Build Acquire Implement', 'HIGH'),
    (r_cobit_04, t_id, fw_cobit, 'DSS01', 'Operasyon Yonetimi',
     'BT operasyonel prosedurlerinin koordine edilmesi ve yurutulmesi.',
     'Deliver Service Support', 'MEDIUM'),
    (r_cobit_05, t_id, fw_cobit, 'DSS02', 'Hizmet Talepleri ve Olay Yonetimi',
     'Hizmet taleplerinin ve olaylarin zamaninda cozumlenmesini saglama.',
     'Deliver Service Support', 'HIGH'),
    (r_cobit_06, t_id, fw_cobit, 'MEA01', 'Performans ve Uyum Izleme',
     'BT performansinin ve uyumlulugunun izlenmesi, degerlendirilmesi ve raporlanmasi.',
     'Monitor Evaluate Assess', 'HIGH');

  -- ========== CONTROL MAPPINGS (16) ==========
  INSERT INTO control_requirement_mappings (tenant_id, control_ref, control_title, requirement_id, coverage_strength, match_score, notes) VALUES
    -- BDDK mappings
    (t_id, 'CTR-SEC-001', 'Yillik Sizdi Testi Programi', r_bddk_01, 'FULL', 95, 'Yillik sizdi testi anlasmasi mevcut, Q2 ve Q4 testleri planli'),
    (t_id, 'CTR-SEC-002', 'Zafiyet Tarama Otomasyonu', r_bddk_01, 'PARTIAL', 70, 'Haftalik otomatik tarama, ancak 3. parti sistemler kapsam disinda'),
    (t_id, 'CTR-IAM-001', 'Cok Faktorlu Kimlik Dogrulama (MFA)', r_bddk_02, 'FULL', 100, 'Tum kritik sistemlerde MFA aktif'),
    (t_id, 'CTR-IAM-002', 'Merkezi Kimlik Yonetim Sistemi', r_bddk_02, 'PARTIAL', 80, 'AD entegrasyonu mevcut, legacy sistemlerde manual'),
    (t_id, 'CTR-BCP-001', 'DR Testi Yillik Plan', r_bddk_03, 'FULL', 90, 'Yilda 2 kez DR testi, son test Ocak 2026'),
    (t_id, 'CTR-LOG-001', 'SIEM Merkezi Log Toplama', r_bddk_06, 'FULL', 85, 'Splunk ile merkezi log, 5 yil saklama politikasi aktif'),
    (t_id, 'CTR-NET-001', 'Ag Segmentasyonu ve Firewall', r_bddk_07, 'FULL', 92, 'DMZ, ic ag ve SWIFT ag segmentasyonu mevcut'),
    (t_id, 'CTR-INC-001', 'Olay Mudahale Proseduru', r_bddk_10, 'PARTIAL', 65, 'Prosedup mevcut, ancak BDDK bildirim suresi testleri eksik'),
    -- KVKK mappings
    (t_id, 'CTR-PRI-001', 'Aydinlatma Metni Yonetimi', r_kvkk_04, 'FULL', 88, 'Tum kanallarda aydinlatma metinleri guncellenmis'),
    (t_id, 'CTR-PRI-002', 'Veri Envanteri ve VERBIS Kaydi', r_kvkk_07, 'FULL', 95, 'VERBIS kaydi guncel, envanter yillik gozden gecirilmis'),
    (t_id, 'CTR-PRI-003', 'Veri Silme/Anonim Hale Getirme', r_kvkk_03, 'PARTIAL', 60, 'Otomatik silme mekanizmasi dev asamasinda'),
    (t_id, 'CTR-ENC-001', 'Veri Sifreleme Politikasi', r_kvkk_05, 'PARTIAL', 75, 'AES-256 kullaniliyor ancak bazi eski sistemler kapsam disinda'),
    -- ISO mappings
    (t_id, 'CTR-POL-001', 'BG Politika Seti', r_iso_01, 'FULL', 90, '12 politika dokumani guncel ve yonetim onayli'),
    (t_id, 'CTR-DLP-001', 'Veri Sizintisi Onleme Sistemi', r_iso_05, 'PARTIAL', 55, 'E-posta DLP aktif, endpoint DLP pilot asamada'),
    (t_id, 'CTR-MON-001', 'SIEM Anomali Tespiti', r_iso_06, 'FULL', 88, 'ML tabanli anomali tespiti aktif'),
    -- COBIT mappings
    (t_id, 'CTR-CHG-001', 'Degisiklik Yonetimi Sureci', r_cobit_03, 'FULL', 82, 'ServiceNow uzerinden yonetilen degisiklik sureci');
END $$;