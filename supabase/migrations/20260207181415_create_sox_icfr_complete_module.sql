/*
  # Create SOX/ICFR Cryo-Chamber Complete Module

  Blueprint: Sentinel v3.0 - Module A: SOX/ICFR Compliance

  1. New Tables
    - `sox_campaigns` - Time-bounded attestation campaigns
    - `sox_controls` - ICFR control definitions with Basel IV risk weighting
    - `sox_attestations` - Cryo-Chamber immutable signed attestation records
    - `sox_incidents` - Incident data for Skeptic AI cross-check
    - `sox_outbox_events` - Transactional outbox for async side-effects

  2. Security
    - RLS enabled on all 5 tables
    - Dev-mode anon CRUD policies
    - Authenticated tenant-scoped read policies

  3. Seed Data
    - 1 active campaign, 8 controls, 4 attestations, 5 incidents, 5 outbox events
*/

-- ============================================================
-- TABLE: sox_campaigns
-- ============================================================
CREATE TABLE IF NOT EXISTS sox_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111' REFERENCES tenants(id),
  title text NOT NULL,
  period text NOT NULL,
  status text NOT NULL DEFAULT 'Active',
  start_date timestamptz,
  end_date timestamptz,
  total_controls integer NOT NULL DEFAULT 0,
  completed_count integer NOT NULL DEFAULT 0,
  created_by text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT sox_c_status_check CHECK (status IN ('Draft','Active','Closed','Archived'))
);
CREATE INDEX IF NOT EXISTS idx_sox_camp_tenant ON sox_campaigns(tenant_id);
ALTER TABLE sox_campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anon read sox_campaigns" ON sox_campaigns FOR SELECT TO anon USING (true);
CREATE POLICY "Anon insert sox_campaigns" ON sox_campaigns FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon update sox_campaigns" ON sox_campaigns FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon delete sox_campaigns" ON sox_campaigns FOR DELETE TO anon USING (true);
CREATE POLICY "Auth read sox_campaigns" ON sox_campaigns FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()));

-- ============================================================
-- TABLE: sox_controls
-- ============================================================
CREATE TABLE IF NOT EXISTS sox_controls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111' REFERENCES tenants(id),
  campaign_id uuid REFERENCES sox_campaigns(id) ON DELETE CASCADE,
  code text NOT NULL,
  description text NOT NULL,
  category text NOT NULL DEFAULT 'Operational',
  risk_weight integer NOT NULL DEFAULT 10,
  assigned_to text,
  department text,
  frequency text NOT NULL DEFAULT 'Monthly',
  is_key_control boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT sox_ctrl_cat CHECK (category IN ('Operational','IT','Financial','Compliance')),
  CONSTRAINT sox_ctrl_freq CHECK (frequency IN ('Daily','Weekly','Monthly','Quarterly','Annually')),
  CONSTRAINT sox_ctrl_wt CHECK (risk_weight >= 1 AND risk_weight <= 100)
);
CREATE INDEX IF NOT EXISTS idx_sox_ctrl_camp ON sox_controls(campaign_id);
CREATE INDEX IF NOT EXISTS idx_sox_ctrl_code ON sox_controls(code);
ALTER TABLE sox_controls ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anon read sox_controls" ON sox_controls FOR SELECT TO anon USING (true);
CREATE POLICY "Anon insert sox_controls" ON sox_controls FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon update sox_controls" ON sox_controls FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon delete sox_controls" ON sox_controls FOR DELETE TO anon USING (true);
CREATE POLICY "Auth read sox_controls" ON sox_controls FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()));

-- ============================================================
-- TABLE: sox_attestations (CRYO-CHAMBER)
-- ============================================================
CREATE TABLE IF NOT EXISTS sox_attestations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111' REFERENCES tenants(id),
  campaign_id uuid REFERENCES sox_campaigns(id) ON DELETE CASCADE,
  control_id uuid REFERENCES sox_controls(id) ON DELETE CASCADE,
  attester_name text NOT NULL,
  status text NOT NULL,
  manager_comment text,
  ai_challenge text,
  ai_challenge_resolved boolean NOT NULL DEFAULT false,
  snapshot_json jsonb NOT NULL,
  record_hash text NOT NULL,
  signed_at timestamptz NOT NULL DEFAULT now(),
  is_frozen boolean NOT NULL DEFAULT true,
  CONSTRAINT sox_att_st CHECK (status IN ('Effective','Ineffective','Not_Tested'))
);
CREATE INDEX IF NOT EXISTS idx_sox_att_camp ON sox_attestations(campaign_id);
CREATE INDEX IF NOT EXISTS idx_sox_att_ctrl ON sox_attestations(control_id);
CREATE INDEX IF NOT EXISTS idx_sox_att_hash ON sox_attestations(record_hash);
ALTER TABLE sox_attestations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anon read sox_attestations" ON sox_attestations FOR SELECT TO anon USING (true);
CREATE POLICY "Anon insert sox_attestations" ON sox_attestations FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon update sox_attestations" ON sox_attestations FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon delete sox_attestations" ON sox_attestations FOR DELETE TO anon USING (true);
CREATE POLICY "Auth read sox_attestations" ON sox_attestations FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()));

-- ============================================================
-- TABLE: sox_incidents
-- ============================================================
CREATE TABLE IF NOT EXISTS sox_incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111' REFERENCES tenants(id),
  department text NOT NULL,
  control_code text,
  severity text NOT NULL DEFAULT 'Medium',
  title text NOT NULL,
  description text,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT sox_inc_sev CHECK (severity IN ('Critical','High','Medium','Low'))
);
CREATE INDEX IF NOT EXISTS idx_sox_inc_dept ON sox_incidents(department);
CREATE INDEX IF NOT EXISTS idx_sox_inc_ctrl ON sox_incidents(control_code);
ALTER TABLE sox_incidents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anon read sox_incidents" ON sox_incidents FOR SELECT TO anon USING (true);
CREATE POLICY "Anon insert sox_incidents" ON sox_incidents FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Auth read sox_incidents" ON sox_incidents FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()));

-- ============================================================
-- TABLE: sox_outbox_events (Transactional Outbox)
-- ============================================================
CREATE TABLE IF NOT EXISTS sox_outbox_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111' REFERENCES tenants(id),
  event_type text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'Pending',
  created_at timestamptz DEFAULT now(),
  processed_at timestamptz,
  CONSTRAINT sox_ob_st CHECK (status IN ('Pending','Processed','Failed'))
);
CREATE INDEX IF NOT EXISTS idx_sox_ob_status ON sox_outbox_events(status);
ALTER TABLE sox_outbox_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anon read sox_outbox_events" ON sox_outbox_events FOR SELECT TO anon USING (true);
CREATE POLICY "Anon insert sox_outbox_events" ON sox_outbox_events FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon update sox_outbox_events" ON sox_outbox_events FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Auth read sox_outbox_events" ON sox_outbox_events FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()));

-- ============================================================
-- SEED
-- ============================================================
DO $$
DECLARE
  t_id uuid := '11111111-1111-1111-1111-111111111111';
  camp_id uuid := gen_random_uuid();
  c1 uuid := gen_random_uuid();
  c2 uuid := gen_random_uuid();
  c3 uuid := gen_random_uuid();
  c4 uuid := gen_random_uuid();
  c5 uuid := gen_random_uuid();
  c6 uuid := gen_random_uuid();
  c7 uuid := gen_random_uuid();
  c8 uuid := gen_random_uuid();
BEGIN
  INSERT INTO sox_campaigns (id, tenant_id, title, period, status, start_date, end_date, total_controls, completed_count, created_by)
  VALUES (camp_id, t_id, '2026 Q1 Yonetici Beyani', 'Q1-2026', 'Active', '2026-01-01', '2026-03-31', 8, 4, 'Dr. Ahmet Korkmaz');

  INSERT INTO sox_controls (id, tenant_id, campaign_id, code, description, category, risk_weight, assigned_to, department, frequency, is_key_control) VALUES
    (c1, t_id, camp_id, 'OP-01', 'Kasa limitleri gun sonunda sistemden kontrol edilmistir. Limit asim durumunda otomatik uyari olusturulmaktadir.', 'Operational', 25, 'Mehmet Yilmaz', 'Operasyon', 'Daily', true),
    (c2, t_id, camp_id, 'OP-02', 'Sube acilis-kapanis islemleri cift onay ile tamamlanmistir. Tum islemler kamera kaydi altindadir.', 'Operational', 15, 'Mehmet Yilmaz', 'Operasyon', 'Daily', false),
    (c3, t_id, camp_id, 'IT-01', 'Sube personeli sifrelerini kimseyle paylasmamistir. Sifre politikasi 90 gun zorunlu degisim icermektedir.', 'IT', 30, 'Ayse Demir', 'Bilgi Teknolojileri', 'Monthly', true),
    (c4, t_id, camp_id, 'IT-02', 'Kritik sistemlere erisim yetkileri ceyreklik olarak gozden gecirilmistir. Gereksiz yetkiler kaldirilmistir.', 'IT', 35, 'Ayse Demir', 'Bilgi Teknolojileri', 'Quarterly', true),
    (c5, t_id, camp_id, 'FN-01', 'Mali tablolar aylik mutabakat kontrolunden gecmistir. Farkliliklar 48 saat icinde arastirilmistir.', 'Financial', 40, 'Fatma Kaya', 'Finansal Kontrol', 'Monthly', true),
    (c6, t_id, camp_id, 'FN-02', 'Kredi tahsis limitleri yetki matrisine uygun olarak uygulanmistir.', 'Financial', 20, 'Fatma Kaya', 'Finansal Kontrol', 'Weekly', false),
    (c7, t_id, camp_id, 'CM-01', 'MASAK bildirimleri mevzuata uygun sekilde ve zamaninda gonderilmistir.', 'Compliance', 45, 'Ali Ozkan', 'Uyum', 'Monthly', true),
    (c8, t_id, camp_id, 'CM-02', 'KVKK kapsamindaki veri isleme envanterleri gunceldir ve yillik bagimsiz gozden gecirme yapilmistir.', 'Compliance', 20, 'Ali Ozkan', 'Uyum', 'Annually', false);

  INSERT INTO sox_attestations (tenant_id, campaign_id, control_id, attester_name, status, manager_comment, ai_challenge, ai_challenge_resolved, snapshot_json, record_hash, signed_at) VALUES
    (t_id, camp_id, c1, 'Mehmet Yilmaz', 'Effective',
     'Tum kasa limit kontrolleri gun sonu raporlari ile dogrulanmistir.',
     NULL, false,
     jsonb_build_object('control_code','OP-01','control_desc','Kasa limitleri gun sonunda kontrol edilmistir.','status','Effective','attester','Mehmet Yilmaz','campaign','Q1-2026','signed_at',now()-interval '5 days'),
     encode(sha256(convert_to('OP-01:Effective:Mehmet Yilmaz:Q1-2026', 'UTF8')), 'hex'),
     now() - interval '5 days'),
    (t_id, camp_id, c3, 'Ayse Demir', 'Effective',
     'Sifre politikasi Active Directory uzerinden zorlanmaktadir. Son 90 gunde tum personel sifre yenilemesini tamamlamistir.',
     NULL, false,
     jsonb_build_object('control_code','IT-01','control_desc','Sifre politikasi uygulanmistir.','status','Effective','attester','Ayse Demir','campaign','Q1-2026','signed_at',now()-interval '3 days'),
     encode(sha256(convert_to('IT-01:Effective:Ayse Demir:Q1-2026', 'UTF8')), 'hex'),
     now() - interval '3 days'),
    (t_id, camp_id, c5, 'Fatma Kaya', 'Ineffective',
     'Subat ayi mutabakatinda 2 adet acik kalem tespit edilmistir. Arastirma devam etmektedir.',
     'SENTINEL SKEPTIC: Bu kontrolun Ineffective olarak isaretlenmesi dogrulanmistir. Mali Kontrol departmaninda son 30 gunde 2 olay kaydi bulunmaktadir.',
     true,
     jsonb_build_object('control_code','FN-01','control_desc','Mali tablolar aylik mutabakat kontrolunden gecmistir.','status','Ineffective','attester','Fatma Kaya','campaign','Q1-2026','signed_at',now()-interval '1 day'),
     encode(sha256(convert_to('FN-01:Ineffective:Fatma Kaya:Q1-2026', 'UTF8')), 'hex'),
     now() - interval '1 day'),
    (t_id, camp_id, c4, 'Ayse Demir', 'Effective',
     'Ceyreklik yetki gozden gecirmesi tamamlanmistir. 12 gereksiz yetki kaldirilmistir. AI itirazina yanit: Tespit edilen olay mevcut kontrol ile engellenip raporlanmistir.',
     'SENTINEL SKEPTIC: Dikkat! BT departmaninda son 30 gunde 1 guvenlik olayi kaydedilmistir. Effective isaretlemeden once aciklayiniz.',
     true,
     jsonb_build_object('control_code','IT-02','control_desc','Kritik sistem erisim yetkileri gozden gecirilmistir.','status','Effective','attester','Ayse Demir','campaign','Q1-2026','ai_challenged',true,'signed_at',now()-interval '12 hours'),
     encode(sha256(convert_to('IT-02:Effective:Ayse Demir:Q1-2026:challenged', 'UTF8')), 'hex'),
     now() - interval '12 hours');

  INSERT INTO sox_incidents (tenant_id, department, control_code, severity, title, description, occurred_at) VALUES
    (t_id, 'Operasyon', 'OP-02', 'Medium', 'Sube kapanis proseduru ihlali', 'Kadikoy subesi tek onayla kapanmistir.', now()-interval '15 days'),
    (t_id, 'Bilgi Teknolojileri', 'IT-02', 'High', 'Yetkisiz erisim denemesi', 'Eski personel hesabiyla VPN erisim denemesi.', now()-interval '10 days'),
    (t_id, 'Finansal Kontrol', 'FN-01', 'High', 'Mutabakat farki - acik kalem', 'Subat mutabakatinda 245,000 TL acik kalem.', now()-interval '20 days'),
    (t_id, 'Finansal Kontrol', 'FN-01', 'Medium', 'Geciken mutabakat kapamasi', 'Ocak mutabakati 5 gun gecikmeyle kapatildi.', now()-interval '45 days'),
    (t_id, 'Uyum', 'CM-01', 'Critical', 'MASAK bildirimi gecikme riski', 'Subat STR bildirimi son gun teslim edildi.', now()-interval '25 days');

  INSERT INTO sox_outbox_events (event_type, payload, status, processed_at) VALUES
    ('ATTESTATION_SIGNED', '{"control_code":"OP-01","status":"Effective","risk_weight":25}', 'Processed', now()-interval '5 days'),
    ('ATTESTATION_SIGNED', '{"control_code":"IT-01","status":"Effective","risk_weight":30}', 'Processed', now()-interval '3 days'),
    ('ATTESTATION_SIGNED', '{"control_code":"FN-01","status":"Ineffective","risk_weight":40}', 'Processed', now()-interval '1 day'),
    ('ATTESTATION_SIGNED', '{"control_code":"IT-02","status":"Effective","risk_weight":35}', 'Processed', now()-interval '12 hours'),
    ('RISK_SCORE_UPDATE', '{"control_code":"FN-01","old_score":72,"new_score":85,"reason":"Ineffective attestation"}', 'Pending', NULL);
END $$;