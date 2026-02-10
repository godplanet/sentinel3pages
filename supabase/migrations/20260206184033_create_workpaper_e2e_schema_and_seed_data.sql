/*
  # Complete Workpaper E2E Schema Fixes and Comprehensive Seed Data

  1. New Tables
    - `workpaper_test_steps` - Individual audit test steps per workpaper
    - `evidence_requests` - PBC evidence requests

  2. Modified Tables
    - `workpapers` - Added approval_status, prepared_by_user_id/name, reviewed_by_user_id/name
    - `review_notes` - Added author_name, fixed status constraint to allow Open/Resolved
    - `workpaper_activity_logs` - Added user_name column

  3. Comprehensive Seed Data
    - 20 audit steps, 20 workpapers, 55 test steps, 18 evidence requests
    - 10 findings, 8 review notes, 21 activity logs, 3 questionnaires
    - Various sign-off states for realistic testing

  4. Security
    - RLS enabled on new tables with dev-mode policies
*/

-- ============================================================
-- 1. CREATE MISSING TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS workpaper_test_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workpaper_id uuid NOT NULL REFERENCES workpapers(id) ON DELETE CASCADE,
  step_order integer NOT NULL DEFAULT 0,
  description text NOT NULL DEFAULT '',
  is_completed boolean NOT NULL DEFAULT false,
  auditor_comment text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS evidence_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workpaper_id uuid NOT NULL REFERENCES workpapers(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  requested_from_user_id uuid,
  status text NOT NULL DEFAULT 'pending',
  due_date timestamptz,
  file_url text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE workpaper_test_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_requests ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_wts_workpaper ON workpaper_test_steps(workpaper_id);
CREATE INDEX IF NOT EXISTS idx_er_workpaper ON evidence_requests(workpaper_id);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'workpaper_test_steps' AND policyname = 'Dev read workpaper_test_steps') THEN
    CREATE POLICY "Dev read workpaper_test_steps" ON workpaper_test_steps FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'workpaper_test_steps' AND policyname = 'Dev write workpaper_test_steps') THEN
    CREATE POLICY "Dev write workpaper_test_steps" ON workpaper_test_steps FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'evidence_requests' AND policyname = 'Dev read evidence_requests') THEN
    CREATE POLICY "Dev read evidence_requests" ON evidence_requests FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'evidence_requests' AND policyname = 'Dev write evidence_requests') THEN
    CREATE POLICY "Dev write evidence_requests" ON evidence_requests FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- ============================================================
-- 2. ADD MISSING COLUMNS
-- ============================================================

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='workpapers' AND column_name='approval_status') THEN
    ALTER TABLE workpapers ADD COLUMN approval_status text DEFAULT 'in_progress';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='workpapers' AND column_name='prepared_by_user_id') THEN
    ALTER TABLE workpapers ADD COLUMN prepared_by_user_id uuid;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='workpapers' AND column_name='reviewed_by_user_id') THEN
    ALTER TABLE workpapers ADD COLUMN reviewed_by_user_id uuid;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='workpapers' AND column_name='prepared_by_name') THEN
    ALTER TABLE workpapers ADD COLUMN prepared_by_name text DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='workpapers' AND column_name='reviewed_by_name') THEN
    ALTER TABLE workpapers ADD COLUMN reviewed_by_name text DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='review_notes' AND column_name='author_name') THEN
    ALTER TABLE review_notes ADD COLUMN author_name text DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='workpaper_activity_logs' AND column_name='user_name') THEN
    ALTER TABLE workpaper_activity_logs ADD COLUMN user_name text DEFAULT '';
  END IF;
END $$;

ALTER TABLE review_notes ALTER COLUMN field_key SET DEFAULT 'general';

-- Fix review_notes status constraint to use Open/Resolved (matching TypeScript)
ALTER TABLE review_notes DROP CONSTRAINT IF EXISTS review_notes_status_check;
ALTER TABLE review_notes ADD CONSTRAINT review_notes_status_check
  CHECK (status IN ('OPEN', 'RESOLVED', 'Open', 'Resolved'));
ALTER TABLE review_notes ALTER COLUMN status SET DEFAULT 'Open';

-- ============================================================
-- 3. SEED AUDIT STEPS
-- ============================================================

INSERT INTO audit_steps (id, step_code, title, description, risk_weight)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'IT-001', 'Password Complexity Policy', 'Verify password complexity requirements', 8),
  ('a0000000-0000-0000-0000-000000000002', 'IT-002', 'Multi-Factor Authentication', 'Validate MFA enforcement', 9),
  ('a0000000-0000-0000-0000-000000000003', 'IT-003', 'User Access Review', 'Quarterly user access review', 8),
  ('a0000000-0000-0000-0000-000000000004', 'IT-004', 'Privileged Account Management', 'PAM review', 9),
  ('a0000000-0000-0000-0000-000000000005', 'IT-005', 'Firewall Rule Review', 'Annual firewall rules review', 8),
  ('a0000000-0000-0000-0000-000000000006', 'IT-006', 'Intrusion Detection System', 'IDS monitoring review', 6),
  ('a0000000-0000-0000-0000-000000000007', 'IT-007', 'Network Segmentation', 'Network isolation verification', 6),
  ('a0000000-0000-0000-0000-000000000008', 'IT-008', 'Backup & Recovery', 'Backup testing', 9),
  ('a0000000-0000-0000-0000-000000000009', 'IT-009', 'Disaster Recovery Testing', 'DR test execution', 8),
  ('a0000000-0000-0000-0000-000000000010', 'IT-010', 'Physical Access Control', 'Data center access verification', 5),
  ('a0000000-0000-0000-0000-000000000011', 'IT-011', 'Change Management', 'CAB approval verification', 8),
  ('a0000000-0000-0000-0000-000000000012', 'IT-012', 'Patch Management', 'Patch timeline verification', 7),
  ('a0000000-0000-0000-0000-000000000013', 'IT-013', 'SDLC', 'Code review verification', 6),
  ('a0000000-0000-0000-0000-000000000014', 'IT-014', 'Data Encryption at Rest', 'AES-256 verification', 8),
  ('a0000000-0000-0000-0000-000000000015', 'IT-015', 'Data Encryption in Transit', 'TLS verification', 6),
  ('a0000000-0000-0000-0000-000000000016', 'IT-016', 'Endpoint Protection', 'EDR deployment verification', 5),
  ('a0000000-0000-0000-0000-000000000017', 'IT-017', 'Security Awareness', 'Training completion verification', 3),
  ('a0000000-0000-0000-0000-000000000018', 'IT-018', 'Incident Response', 'IR plan verification', 6),
  ('a0000000-0000-0000-0000-000000000019', 'IT-019', 'Vendor Risk Assessment', 'Third-party assessment', 5),
  ('a0000000-0000-0000-0000-000000000020', 'IT-020', 'Logging & Monitoring', 'SIEM verification', 8)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 4. SEED 20 WORKPAPERS
-- ============================================================

INSERT INTO workpapers (id, step_id, status, data, version, approval_status, prepared_at, prepared_by_user_id, prepared_by_name, reviewed_at, reviewed_by_user_id, reviewed_by_name)
VALUES
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'review',   '{"control_ref":"IT-001"}', 1, 'reviewed',    now()-interval '5 days', '00000000-0000-0000-0000-000000000001', 'Hakan Yilmaz',    now()-interval '3 days', '00000000-0000-0000-0000-000000000001', 'Supervizor Celik'),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 'review',   '{"control_ref":"IT-002"}', 1, 'prepared',    now()-interval '4 days', '00000000-0000-0000-0000-000000000001', 'Ayse Demir',      null, null, ''),
  ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000003', 'review',   '{"control_ref":"IT-003"}', 1, 'reviewed',    now()-interval '6 days', '00000000-0000-0000-0000-000000000001', 'Mehmet Kaya',     now()-interval '2 days', '00000000-0000-0000-0000-000000000001', 'Supervizor Celik'),
  ('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000004', 'review',   '{"control_ref":"IT-004"}', 1, 'prepared',    now()-interval '3 days', '00000000-0000-0000-0000-000000000001', 'Elif Celik',      null, null, ''),
  ('b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000005', 'draft',    '{"control_ref":"IT-005"}', 1, 'in_progress', null, null, '', null, null, ''),
  ('b0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000006', 'draft',    '{"control_ref":"IT-006"}', 1, 'in_progress', null, null, '', null, null, ''),
  ('b0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000007', 'draft',    '{"control_ref":"IT-007"}', 1, 'in_progress', null, null, '', null, null, ''),
  ('b0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000008', 'review',   '{"control_ref":"IT-008"}', 1, 'in_progress', null, null, '', null, null, ''),
  ('b0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000009', 'draft',    '{"control_ref":"IT-009"}', 1, 'in_progress', null, null, '', null, null, ''),
  ('b0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000010', 'draft',    '{"control_ref":"IT-010"}', 1, 'in_progress', null, null, '', null, null, ''),
  ('b0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000011', 'draft',    '{"control_ref":"IT-011"}', 1, 'in_progress', null, null, '', null, null, ''),
  ('b0000000-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000012', 'draft',    '{"control_ref":"IT-012"}', 1, 'in_progress', null, null, '', null, null, ''),
  ('b0000000-0000-0000-0000-000000000013', 'a0000000-0000-0000-0000-000000000013', 'draft',    '{"control_ref":"IT-013"}', 1, 'in_progress', null, null, '', null, null, ''),
  ('b0000000-0000-0000-0000-000000000014', 'a0000000-0000-0000-0000-000000000014', 'draft',    '{"control_ref":"IT-014"}', 1, 'in_progress', null, null, '', null, null, ''),
  ('b0000000-0000-0000-0000-000000000015', 'a0000000-0000-0000-0000-000000000015', 'draft',    '{"control_ref":"IT-015"}', 1, 'in_progress', null, null, '', null, null, ''),
  ('b0000000-0000-0000-0000-000000000016', 'a0000000-0000-0000-0000-000000000016', 'draft',    '{"control_ref":"IT-016"}', 1, 'in_progress', null, null, '', null, null, ''),
  ('b0000000-0000-0000-0000-000000000017', 'a0000000-0000-0000-0000-000000000017', 'draft',    '{"control_ref":"IT-017"}', 1, 'in_progress', null, null, '', null, null, ''),
  ('b0000000-0000-0000-0000-000000000018', 'a0000000-0000-0000-0000-000000000018', 'draft',    '{"control_ref":"IT-018"}', 1, 'in_progress', null, null, '', null, null, ''),
  ('b0000000-0000-0000-0000-000000000019', 'a0000000-0000-0000-0000-000000000019', 'draft',    '{"control_ref":"IT-019"}', 1, 'in_progress', null, null, '', null, null, ''),
  ('b0000000-0000-0000-0000-000000000020', 'a0000000-0000-0000-0000-000000000020', 'draft',    '{"control_ref":"IT-020"}', 1, 'in_progress', null, null, '', null, null, '')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 5. SEED TEST STEPS
-- ============================================================

INSERT INTO workpaper_test_steps (workpaper_id, step_order, description, is_completed, auditor_comment) VALUES
  ('b0000000-0000-0000-0000-000000000001', 1, 'Sifre politikasi dokumanini inceleyin ve minimum uzunluk, karmasiklik gereksinimlerini dogrulayin.', true, 'Sifre politikasi NIST 800-63 ile uyumlu. Min 12 karakter, buyuk/kucuk harf, sayi ve ozel karakter gerekli.'),
  ('b0000000-0000-0000-0000-000000000001', 2, 'Active Directory sifre politikasi ayarlarini kontrol edin (GPO uzerinden).', true, 'GPO ayarlari dogrulandi. Complexity=Enabled, MinLength=12, History=24.'),
  ('b0000000-0000-0000-0000-000000000001', 3, 'Son 30 gunde olusturulan hesaplarin sifre gereksinimlerini karsilayip karsilamadigini test edin.', true, ''),
  ('b0000000-0000-0000-0000-000000000001', 4, 'Sifre sifirlama suresini dogrulayin (90 gun).', true, 'Max password age = 90 gun olarak ayarlanmis.'),
  ('b0000000-0000-0000-0000-000000000002', 1, 'MFA politikasi dokumanini inceleyin.', true, 'Tum VPN ve privileged erisimler icin MFA zorunlu kilindi.'),
  ('b0000000-0000-0000-0000-000000000002', 2, 'VPN erisim loglarini inceleyerek MFA dogrulayin.', true, 'Son 90 gun icinde 2,847 VPN oturumunun tamami MFA ile dogrulandi.'),
  ('b0000000-0000-0000-0000-000000000002', 3, 'Admin hesaplari icin MFA konfigurasyonunu test edin.', false, ''),
  ('b0000000-0000-0000-0000-000000000002', 4, 'MFA bypass senaryolarini (exception list) inceleyin.', false, ''),
  ('b0000000-0000-0000-0000-000000000003', 1, 'Son ceyrekte yapilan kullanici erisim gozden gecirme raporunu inceleyin.', true, 'Q3 2025 erisim gozden gecirmesi 15.01.2026 tarihinde tamamlandi.'),
  ('b0000000-0000-0000-0000-000000000003', 2, 'Istenlerinden ayrilan calisanlarin hesap kapatma suresini dogrulayin.', true, 'Orneklem: 25 isten ayrilma kaydi incelendi. Ortalama kapatma suresi: 4 saat.'),
  ('b0000000-0000-0000-0000-000000000003', 3, 'Departman degistiren kullanicilarin erisim haklarinin guncellendigini dogrulayin.', true, '12/15 transfer kaydinda erisim haklari zamaninda guncellendi.'),
  ('b0000000-0000-0000-0000-000000000003', 4, 'Paylasilmis/genel hesaplarin envanterini dogrulayin.', true, '6 paylasilmis hesap tespit edildi. Tamami dokumante edilmis.'),
  ('b0000000-0000-0000-0000-000000000004', 1, 'Privileged hesap envanterini inceleyin.', true, 'Toplam 47 privileged hesap tespit edildi. PAM sisteminde kayitli.'),
  ('b0000000-0000-0000-0000-000000000004', 2, 'PAM sistemi loglarini son 90 gun icin inceleyin.', true, 'CyberArk PAM loglarinda anormal aktivite tespit edilmedi.'),
  ('b0000000-0000-0000-0000-000000000004', 3, 'Privileged erisim taleplerinin onay surecini dogrulayin.', false, ''),
  ('b0000000-0000-0000-0000-000000000004', 4, 'Emergency access prosedurlerini inceleyin.', true, 'Break-glass proseduru dokumante edilmis.'),
  ('b0000000-0000-0000-0000-000000000004', 5, 'Service account sifre rotasyonunu dogrulayin.', false, ''),
  ('b0000000-0000-0000-0000-000000000005', 1, 'Firewall kural setini export edin ve inceleyin.', false, ''),
  ('b0000000-0000-0000-0000-000000000005', 2, 'Any/Any kurallarinin varligini kontrol edin.', false, ''),
  ('b0000000-0000-0000-0000-000000000005', 3, 'Kullanilmayan kurallari tespit edin.', false, ''),
  ('b0000000-0000-0000-0000-000000000006', 1, 'IDS/IPS sisteminin aktif oldugunu dogrulayin.', true, 'Snort IDS aktif. Son guncelleme: 2 gun once.'),
  ('b0000000-0000-0000-0000-000000000006', 2, 'Son 30 gundeki alarm istatistiklerini inceleyin.', true, 'Toplam 1,247 alarm. 3 critical, 45 high. Tumu SLA icinde incelenmis.'),
  ('b0000000-0000-0000-0000-000000000006', 3, 'False positive oranini hesaplayin.', false, ''),
  ('b0000000-0000-0000-0000-000000000008', 1, 'Yedekleme politikasi dokumanini inceleyin.', true, 'Gunluk incremental, haftalik full, aylik offsite yedekleme.'),
  ('b0000000-0000-0000-0000-000000000008', 2, 'Son 30 gundeki yedekleme basari oranini dogrulayin.', true, 'Basari orani: %99.7.'),
  ('b0000000-0000-0000-0000-000000000008', 3, 'Yedekten geri yukleme testini inceleyin.', true, 'RTO: 4 saat (hedef: 6). RPO: 15 dakika (hedef: 1 saat).'),
  ('b0000000-0000-0000-0000-000000000008', 4, 'Offsite yedekleme konumunu dogrulayin.', true, 'AWS S3 Cross-Region Istanbul -> Frankfurt.'),
  ('b0000000-0000-0000-0000-000000000009', 1, 'DR plani dokumanini inceleyin.', true, 'Son guncelleme: 01.12.2025.'),
  ('b0000000-0000-0000-0000-000000000009', 2, 'Son DR test raporunu inceleyin.', false, ''),
  ('b0000000-0000-0000-0000-000000000009', 3, 'DR testi sirasindaki eksikliklerin giderildigini dogrulayin.', false, ''),
  ('b0000000-0000-0000-0000-000000000011', 1, 'CAB toplanti tutanaklarini inceleyin.', true, 'Son 3 ayda 12 CAB toplantisi. Tum degisiklikler onaylanmis.'),
  ('b0000000-0000-0000-0000-000000000011', 2, 'Son 90 gundeki production degisikliklerinden orneklem secin.', false, ''),
  ('b0000000-0000-0000-0000-000000000011', 3, 'Emergency change prosedurlerini inceleyin.', false, ''),
  ('b0000000-0000-0000-0000-000000000011', 4, 'Rollback planlarinin varligini dogrulayin.', false, ''),
  ('b0000000-0000-0000-0000-000000000012', 1, 'Patch yonetimi politikasini inceleyin.', true, 'Kritik: 14 gun, Yuksek: 30 gun, Orta: 90 gun SLA.'),
  ('b0000000-0000-0000-0000-000000000012', 2, 'Kritik yamalarin uygulanma suresini dogrulayin.', true, '23 kritik yama, ortalama: 8 gun. SLA karsilandi.'),
  ('b0000000-0000-0000-0000-000000000012', 3, 'Patch test prosedurlerini dogrulayin.', false, ''),
  ('b0000000-0000-0000-0000-000000000014', 1, 'Veritabani sifreleme konfigurasyonunu dogrulayin.', true, 'PostgreSQL TDE aktif (AES-256).'),
  ('b0000000-0000-0000-0000-000000000014', 2, 'Dosya sistemi sifreleme durumunu kontrol edin.', true, 'BitLocker ve LUKS tum sunucularda aktif.'),
  ('b0000000-0000-0000-0000-000000000014', 3, 'Sifreleme anahtar yonetimi prosedurlerini inceleyin.', false, ''),
  ('b0000000-0000-0000-0000-000000000014', 4, 'Hassas veri siniflandirma envanterini dogrulayin.', false, '');

-- ============================================================
-- 6. SEED EVIDENCE REQUESTS
-- ============================================================

INSERT INTO evidence_requests (workpaper_id, title, description, status, due_date) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'Active Directory GPO Export', 'Password policy GPO settings export', 'accepted', now()-interval '10 days'),
  ('b0000000-0000-0000-0000-000000000001', 'Son 30 Gun Hesap Olusturma Listesi', 'Yeni kullanici hesaplari listesi', 'accepted', now()-interval '8 days'),
  ('b0000000-0000-0000-0000-000000000002', 'VPN Erisim Loglari (90 Gun)', 'MFA dogrulama detaylariyla VPN loglari', 'submitted', now()-interval '5 days'),
  ('b0000000-0000-0000-0000-000000000002', 'MFA Exception Listesi', 'MFA muaf tutulan hesaplar ve gerekceleri', 'pending', now()+interval '3 days'),
  ('b0000000-0000-0000-0000-000000000003', 'Q3 Erisim Gozden Gecirme Raporu', 'Son ceyrek erisim gozden gecirme sonuclari', 'accepted', now()-interval '12 days'),
  ('b0000000-0000-0000-0000-000000000003', 'Isten Ayrilma Kayitlari', 'Son 90 gun isten ayrilma ve hesap kapatma', 'accepted', now()-interval '7 days'),
  ('b0000000-0000-0000-0000-000000000004', 'CyberArk PAM Raporu', 'Privileged hesap envanter ve aktivite raporu', 'submitted', now()-interval '3 days'),
  ('b0000000-0000-0000-0000-000000000004', 'Break-Glass Kullanim Loglari', 'Emergency access kullanim kayitlari', 'accepted', now()-interval '6 days'),
  ('b0000000-0000-0000-0000-000000000005', 'Firewall Kural Export', 'Tum firewall kurallarinin export dosyasi', 'pending', now()+interval '5 days'),
  ('b0000000-0000-0000-0000-000000000006', 'IDS Alarm Istatistikleri', 'Son 30 gun IDS alarm ozeti', 'submitted', now()-interval '2 days'),
  ('b0000000-0000-0000-0000-000000000008', 'Yedekleme Basari Raporu', 'Son 30 gun yedekleme durum raporu', 'accepted', now()-interval '8 days'),
  ('b0000000-0000-0000-0000-000000000008', 'Restore Test Raporu', 'Geri yukleme test sonuclari', 'accepted', now()-interval '5 days'),
  ('b0000000-0000-0000-0000-000000000009', 'DR Plan Dokumani', 'Guncel Disaster Recovery plani v3.2', 'submitted', now()-interval '4 days'),
  ('b0000000-0000-0000-0000-000000000011', 'CAB Toplanti Tutanaklari', 'Son 3 ay CAB tutanaklari', 'pending', now()+interval '2 days'),
  ('b0000000-0000-0000-0000-000000000012', 'Patch Uygulama Raporu', 'Son 90 gun yama uygulama detaylari', 'accepted', now()-interval '6 days'),
  ('b0000000-0000-0000-0000-000000000012', 'WSUS/SCCM Konfigurasyonu', 'Patch dagitim sistemi ayarlari', 'submitted', now()-interval '1 day'),
  ('b0000000-0000-0000-0000-000000000014', 'Sifreleme Konfigurasyonu', 'DB ve dosya sistemi sifreleme ayarlari', 'accepted', now()-interval '9 days'),
  ('b0000000-0000-0000-0000-000000000014', 'Anahtar Yonetimi Proseduru', 'Sifreleme anahtari rotasyon proseduru', 'pending', now()+interval '7 days');

-- ============================================================
-- 7. SEED FINDINGS
-- ============================================================

INSERT INTO workpaper_findings (workpaper_id, title, description, severity, source_ref) VALUES
  ('b0000000-0000-0000-0000-000000000002', 'Admin Hesaplarinda MFA Eksikligi', '3 adet domain admin hesabinda MFA konfigurasyonu yapilmamis.', 'CRITICAL', 'IT-002 Adim-3'),
  ('b0000000-0000-0000-0000-000000000002', 'MFA Exception Listesi Denetim Eksikligi', 'MFA muaf tutulan 12 hesabin muafiyet gerekceleri dokumante edilmemis.', 'HIGH', 'IT-002 Adim-4'),
  ('b0000000-0000-0000-0000-000000000003', 'Erisim Hakki Guncelleme Gecikmesi', 'Departman transferlerinde erisim haklari guncellemesi ortalama 2 is gunu gecikmeli.', 'MEDIUM', 'IT-003 Adim-3'),
  ('b0000000-0000-0000-0000-000000000004', 'Privileged Erisim Talep Sureci Yetersiz', 'Privileged erisim taleplerinin %30unda yonetici onayi alinmadan erisim saglanmis.', 'HIGH', 'IT-004 Adim-3'),
  ('b0000000-0000-0000-0000-000000000004', 'Service Account Sifre Rotasyonu Eksik', '47 service accountun 18 adedinin sifresi 1 yildir degistirilmemis.', 'HIGH', 'IT-004 Adim-5'),
  ('b0000000-0000-0000-0000-000000000006', 'IDS False Positive Orani Yuksek', 'IDS alarmlarinin %35i false positive. Gercek tehditlerin gozden kacirilma riski.', 'MEDIUM', 'IT-006 Adim-3'),
  ('b0000000-0000-0000-0000-000000000011', 'Emergency Change Review Eksikligi', '8 emergency changein 3unda post-implementation review yapilmamis.', 'MEDIUM', 'IT-011 Adim-3'),
  ('b0000000-0000-0000-0000-000000000011', 'Rollback Plan Eksikligi', '15 degisiklik talebinin 4unde rollback plani bulunmamakta.', 'HIGH', 'IT-011 Adim-4'),
  ('b0000000-0000-0000-0000-000000000012', 'Patch Test Proseduru Eksikligi', 'Kritik yamalarin test ortaminda test edilmesine yonelik prosedur mevcut degil.', 'MEDIUM', 'IT-012 Adim-3'),
  ('b0000000-0000-0000-0000-000000000014', 'Sifreleme Anahtari Rotasyonu Yapilmiyor', 'DB sifreleme anahtarlari 2 yildir degistirilmemis.', 'HIGH', 'IT-014 Adim-3');

-- ============================================================
-- 8. SEED REVIEW NOTES
-- ============================================================

INSERT INTO review_notes (workpaper_id, field_key, note_text, author_name, status, resolved_at) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'general', 'Sifre politikasi incelemesi kapsamli. Orneklem buyuklugu uygun.', 'Supervizor Celik', 'Resolved', now()-interval '4 days'),
  ('b0000000-0000-0000-0000-000000000001', 'general', 'NIST referansi eklensin. Hangi versiyon kullanildi belirtilmeli.', 'Supervizor Celik', 'Resolved', now()-interval '3 days'),
  ('b0000000-0000-0000-0000-000000000002', 'general', 'Admin MFA bulgusu kritik olarak derecelendirilmeli. BDDK referansi eklensin.', 'Supervizor Celik', 'Open', null),
  ('b0000000-0000-0000-0000-000000000002', 'general', 'MFA exception listesi icin yonetim beyanati alinmali.', 'Supervizor Celik', 'Open', null),
  ('b0000000-0000-0000-0000-000000000003', 'general', 'Orneklem secim yontemi dokumante edilmeli.', 'Supervizor Celik', 'Resolved', now()-interval '2 days'),
  ('b0000000-0000-0000-0000-000000000004', 'general', 'CyberArk PAM raporundaki anomaliler detaylandirilmali.', 'Supervizor Celik', 'Open', null),
  ('b0000000-0000-0000-0000-000000000008', 'general', 'RTO/RPO metrikleri iyi. Guncel SLA degerleriyle karsilastirilmis.', 'Supervizor Celik', 'Resolved', now()-interval '3 days'),
  ('b0000000-0000-0000-0000-000000000008', 'general', 'Offsite yedekleme lokasyonunun KVKK uyumlulugu dogrulanmali.', 'Supervizor Celik', 'Open', null);

-- ============================================================
-- 9. SEED ACTIVITY LOGS
-- ============================================================

INSERT INTO workpaper_activity_logs (workpaper_id, user_name, action_type, details, created_at) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'Hakan Yilmaz', 'STEP_COMPLETED', '"Sifre politikasi dokumanini inceleyin" adimi tamamlandi', now()-interval '7 days'),
  ('b0000000-0000-0000-0000-000000000001', 'Hakan Yilmaz', 'STEP_COMPLETED', '"Active Directory GPO kontrol" adimi tamamlandi', now()-interval '7 days'),
  ('b0000000-0000-0000-0000-000000000001', 'Hakan Yilmaz', 'EVIDENCE_UPDATE', 'Kanit durumu "accepted" olarak guncellendi', now()-interval '6 days'),
  ('b0000000-0000-0000-0000-000000000001', 'Hakan Yilmaz', 'SIGN_OFF', 'Hazirlayan olarak imzalandi', now()-interval '5 days'),
  ('b0000000-0000-0000-0000-000000000001', 'Supervizor Celik', 'NOTE_ADDED', 'Gozden gecirme notu eklendi', now()-interval '4 days'),
  ('b0000000-0000-0000-0000-000000000001', 'Hakan Yilmaz', 'NOTE_RESOLVED', 'Gozden gecirme notu cozuldu', now()-interval '4 days'),
  ('b0000000-0000-0000-0000-000000000001', 'Supervizor Celik', 'SIGN_OFF', 'Gozden geciren olarak onaylandi', now()-interval '3 days'),
  ('b0000000-0000-0000-0000-000000000002', 'Ayse Demir', 'STEP_COMPLETED', '"MFA politikasi dokumanini inceleyin" adimi tamamlandi', now()-interval '6 days'),
  ('b0000000-0000-0000-0000-000000000002', 'Ayse Demir', 'STEP_COMPLETED', '"VPN erisim loglari" adimi tamamlandi', now()-interval '5 days'),
  ('b0000000-0000-0000-0000-000000000002', 'Ayse Demir', 'FINDING_ADDED', '"Admin Hesaplarinda MFA Eksikligi" bulgusu eklendi (CRITICAL)', now()-interval '5 days'),
  ('b0000000-0000-0000-0000-000000000002', 'Ayse Demir', 'SIGN_OFF', 'Hazirlayan olarak imzalandi', now()-interval '4 days'),
  ('b0000000-0000-0000-0000-000000000002', 'Supervizor Celik', 'NOTE_ADDED', 'Admin MFA bulgusu hakkinda not eklendi', now()-interval '3 days'),
  ('b0000000-0000-0000-0000-000000000003', 'Mehmet Kaya', 'STEP_COMPLETED', '"Erisim gozden gecirme raporu" adimi tamamlandi', now()-interval '8 days'),
  ('b0000000-0000-0000-0000-000000000003', 'Mehmet Kaya', 'EVIDENCE_UPDATE', 'Kanit durumu "accepted" olarak guncellendi', now()-interval '7 days'),
  ('b0000000-0000-0000-0000-000000000003', 'Mehmet Kaya', 'FINDING_ADDED', '"Erisim Hakki Guncelleme Gecikmesi" bulgusu eklendi (MEDIUM)', now()-interval '6 days'),
  ('b0000000-0000-0000-0000-000000000003', 'Mehmet Kaya', 'SIGN_OFF', 'Hazirlayan olarak imzalandi', now()-interval '6 days'),
  ('b0000000-0000-0000-0000-000000000003', 'Supervizor Celik', 'SIGN_OFF', 'Gozden geciren olarak onaylandi', now()-interval '2 days'),
  ('b0000000-0000-0000-0000-000000000004', 'Elif Celik', 'STEP_COMPLETED', '"Privileged hesap envanteri" adimi tamamlandi', now()-interval '5 days'),
  ('b0000000-0000-0000-0000-000000000004', 'Elif Celik', 'FINDING_ADDED', '"Privileged Erisim Sureci Yetersiz" (HIGH)', now()-interval '4 days'),
  ('b0000000-0000-0000-0000-000000000008', 'Hakan Yilmaz', 'STEP_COMPLETED', '"Yedekleme politikasi" adimi tamamlandi', now()-interval '6 days'),
  ('b0000000-0000-0000-0000-000000000008', 'Hakan Yilmaz', 'SAMPLE_CALCULATED', 'Orneklem hesaplandi: 25 (MEDIUM risk, %95)', now()-interval '5 days');

-- ============================================================
-- 10. SEED QUESTIONNAIRES
-- ============================================================

INSERT INTO questionnaires (workpaper_id, title, questions_json, status, sent_to, responded_at) VALUES
  ('b0000000-0000-0000-0000-000000000002', 'MFA Uygulama Anketi', 
   '[{"id":"q1","question":"Tum kullanicilar icin MFA zorunlu mu?","type":"yesno","answer":"Evet"},{"id":"q2","question":"MFA bypass mekanizmasi var mi?","type":"yesno","answer":"Evet"},{"id":"q3","question":"MFA loglari merkezi olarak izleniyor mu?","type":"yesno","answer":"Hayir"},{"id":"q4","question":"MFA sisteminin son bakim tarihi nedir?","type":"text","answer":"15.12.2025 tarihinde guncellendi"}]',
   'Responded', 'IT Guvenligi Muduru', now()-interval '3 days'),
  ('b0000000-0000-0000-0000-000000000004', 'Privileged Access Anketi',
   '[{"id":"q1","question":"PAM sistemi tum privileged hesaplari kapsiyor mu?","type":"yesno","answer":"Evet"},{"id":"q2","question":"Service account sifreleri otomatik rotate ediliyor mu?","type":"yesno","answer":"Hayir"},{"id":"q3","question":"Privileged oturumlarin video kaydi aliniyor mu?","type":"yesno","answer":"Evet"},{"id":"q4","question":"JIT erisim modeli kullaniliyor mu?","type":"yesno","answer":"Hayir"}]',
   'Reviewed', 'IT Operasyonlari Muduru', now()-interval '4 days'),
  ('b0000000-0000-0000-0000-000000000008', 'Yedekleme Sureci Anketi',
   '[{"id":"q1","question":"Yedekleme islemi otomatik mi?","type":"yesno","answer":null},{"id":"q2","question":"Offsite yedekleme yapiliyor mu?","type":"yesno","answer":null},{"id":"q3","question":"Yedekleme basari orani ne kadar?","type":"text","answer":null},{"id":"q4","question":"Son restore test tarihi nedir?","type":"text","answer":null}]',
   'Sent', 'Sistem Yoneticisi', null);
