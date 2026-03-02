/*
  # Workpaper Support Tables & Column Additions

  ## Summary
  The workpapers page and SuperDrawer rely on several columns and tables that were
  missing from the database. This migration adds all required pieces.

  ## Changes to Existing Tables

  ### workpapers
  - `approval_status` (text, default 'in_progress') — tracks prepared/reviewed sign-off state
  - `prepared_by_user_id` (uuid) — who prepared/signed the workpaper
  - `prepared_by_name` (text) — display name for the preparer
  - `reviewed_by_user_id` (uuid) — who reviewed/approved the workpaper
  - `reviewed_by_name` (text) — display name for the reviewer
  - `auditor_scratchpad` (text) — private encrypted notes field
  - `auditor_notes` (text) — journal notes visible in drawer
  - `sampling_config` (jsonb) — statistical sampling configuration
  - `total_hours_spent` (numeric) — rolled-up time from time logs
  - `spreadsheet_data` (jsonb) — Sentinel Sheets embedded workbook state

  ### review_notes
  - `author_name` (text) — display name of the note author (was missing, code expected it)

  ## New Tables

  ### workpaper_test_steps
  Stores individual test step checklist items linked to a workpaper.

  ### evidence_requests
  PBC (Provided By Client) evidence request tracking per workpaper.

  ### workpaper_activity_logs
  Immutable audit trail for all workpaper actions.

  ### questionnaires
  Questionnaires sent to departments for evidence gathering.

  ### procedure_library
  Pre-built audit procedures that can be injected into workpapers.

  ## Security
  - RLS enabled on all new tables with permissive anon read/write for dev environment
*/

-- ============================================================
-- STEP 1: Extend workpapers table
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workpapers' AND column_name = 'approval_status') THEN
    ALTER TABLE workpapers ADD COLUMN approval_status text NOT NULL DEFAULT 'in_progress';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workpapers' AND column_name = 'prepared_by_user_id') THEN
    ALTER TABLE workpapers ADD COLUMN prepared_by_user_id uuid;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workpapers' AND column_name = 'prepared_by_name') THEN
    ALTER TABLE workpapers ADD COLUMN prepared_by_name text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workpapers' AND column_name = 'reviewed_by_user_id') THEN
    ALTER TABLE workpapers ADD COLUMN reviewed_by_user_id uuid;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workpapers' AND column_name = 'reviewed_by_name') THEN
    ALTER TABLE workpapers ADD COLUMN reviewed_by_name text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workpapers' AND column_name = 'auditor_scratchpad') THEN
    ALTER TABLE workpapers ADD COLUMN auditor_scratchpad text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workpapers' AND column_name = 'auditor_notes') THEN
    ALTER TABLE workpapers ADD COLUMN auditor_notes text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workpapers' AND column_name = 'sampling_config') THEN
    ALTER TABLE workpapers ADD COLUMN sampling_config jsonb;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workpapers' AND column_name = 'total_hours_spent') THEN
    ALTER TABLE workpapers ADD COLUMN total_hours_spent numeric DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workpapers' AND column_name = 'spreadsheet_data') THEN
    ALTER TABLE workpapers ADD COLUMN spreadsheet_data jsonb;
  END IF;
END $$;

-- ============================================================
-- STEP 2: Extend review_notes — add missing author_name
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'review_notes' AND column_name = 'author_name') THEN
    ALTER TABLE review_notes ADD COLUMN author_name text NOT NULL DEFAULT '';
  END IF;
END $$;

-- ============================================================
-- STEP 3: workpaper_test_steps
-- ============================================================
CREATE TABLE IF NOT EXISTS workpaper_test_steps (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workpaper_id  uuid NOT NULL REFERENCES workpapers(id) ON DELETE CASCADE,
  step_order    integer NOT NULL DEFAULT 1,
  description   text NOT NULL,
  is_completed  boolean NOT NULL DEFAULT false,
  auditor_comment text NOT NULL DEFAULT '',
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

ALTER TABLE workpaper_test_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_read_workpaper_test_steps"
  ON workpaper_test_steps FOR SELECT TO anon USING (true);

CREATE POLICY "anon_insert_workpaper_test_steps"
  ON workpaper_test_steps FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "anon_update_workpaper_test_steps"
  ON workpaper_test_steps FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY "anon_delete_workpaper_test_steps"
  ON workpaper_test_steps FOR DELETE TO anon USING (true);

-- ============================================================
-- STEP 4: evidence_requests
-- ============================================================
CREATE TABLE IF NOT EXISTS evidence_requests (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workpaper_id            uuid NOT NULL REFERENCES workpapers(id) ON DELETE CASCADE,
  title                   text NOT NULL,
  description             text NOT NULL DEFAULT '',
  requested_from_user_id  uuid,
  status                  text NOT NULL DEFAULT 'pending',
  due_date                timestamptz,
  file_url                text NOT NULL DEFAULT '',
  created_at              timestamptz DEFAULT now(),
  updated_at              timestamptz DEFAULT now()
);

ALTER TABLE evidence_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_read_evidence_requests"
  ON evidence_requests FOR SELECT TO anon USING (true);

CREATE POLICY "anon_insert_evidence_requests"
  ON evidence_requests FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "anon_update_evidence_requests"
  ON evidence_requests FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY "anon_delete_evidence_requests"
  ON evidence_requests FOR DELETE TO anon USING (true);

-- ============================================================
-- STEP 5: workpaper_activity_logs
-- ============================================================
CREATE TABLE IF NOT EXISTS workpaper_activity_logs (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workpaper_id uuid NOT NULL REFERENCES workpapers(id) ON DELETE CASCADE,
  user_id      uuid,
  user_name    text NOT NULL DEFAULT 'Denetci',
  action_type  text NOT NULL,
  details      text NOT NULL DEFAULT '',
  created_at   timestamptz DEFAULT now()
);

ALTER TABLE workpaper_activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_read_workpaper_activity_logs"
  ON workpaper_activity_logs FOR SELECT TO anon USING (true);

CREATE POLICY "anon_insert_workpaper_activity_logs"
  ON workpaper_activity_logs FOR INSERT TO anon WITH CHECK (true);

-- ============================================================
-- STEP 6: questionnaires
-- ============================================================
CREATE TABLE IF NOT EXISTS questionnaires (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workpaper_id  uuid NOT NULL REFERENCES workpapers(id) ON DELETE CASCADE,
  title         text NOT NULL,
  questions_json jsonb NOT NULL DEFAULT '[]',
  status        text NOT NULL DEFAULT 'Sent',
  sent_to       text NOT NULL DEFAULT '',
  responded_at  timestamptz,
  created_at    timestamptz DEFAULT now()
);

ALTER TABLE questionnaires ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_read_questionnaires"
  ON questionnaires FOR SELECT TO anon USING (true);

CREATE POLICY "anon_insert_questionnaires"
  ON questionnaires FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "anon_update_questionnaires"
  ON questionnaires FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- ============================================================
-- STEP 7: procedure_library
-- ============================================================
CREATE TABLE IF NOT EXISTS procedure_library (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category    text NOT NULL,
  title       text NOT NULL,
  description text NOT NULL DEFAULT '',
  steps       jsonb NOT NULL DEFAULT '[]',
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE procedure_library ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_read_procedure_library"
  ON procedure_library FOR SELECT TO anon USING (true);

CREATE POLICY "anon_insert_procedure_library"
  ON procedure_library FOR INSERT TO anon WITH CHECK (true);

-- ============================================================
-- STEP 8: Seed procedure_library with IT audit procedures
-- ============================================================
INSERT INTO procedure_library (id, category, title, description, steps) VALUES
(
  'a0100000-0000-0000-0000-000000000001',
  'Access Control',
  'Kullanıcı Erişim Gözden Geçirmesi',
  'Kullanıcı erişim haklarının periyodik olarak gözden geçirilmesini doğrular.',
  '[
    {"order": 1, "text": "Son 90 günde erişim yetkisi verilen kullanıcıların listesini alın."},
    {"order": 2, "text": "Ayrılan çalışanların hesaplarının kapatıldığını doğrulayın."},
    {"order": 3, "text": "Ayrıcalıklı hesapların iş gereksinimiyle uyumunu kontrol edin."},
    {"order": 4, "text": "Erişim gözden geçirme onay kayıtlarını belgeleyin."}
  ]'
),
(
  'a0100000-0000-0000-0000-000000000002',
  'Access Control',
  'MFA Doğrulama Testi',
  'Kritik sistemler için çok faktörlü kimlik doğrulamanın etkinliğini test eder.',
  '[
    {"order": 1, "text": "MFA politikasının kapsamını ve muafiyet listesini belgeleyin."},
    {"order": 2, "text": "Son 30 günün MFA atlatma girişimlerini analiz edin."},
    {"order": 3, "text": "Yönetici hesapları için MFA zorunluluğunu test edin."}
  ]'
),
(
  'a0100000-0000-0000-0000-000000000003',
  'Network Security',
  'Güvenlik Duvarı Kural Seti Doğrulaması',
  'Güvenlik duvarı kurallarının iş gereksinimlerine uygunluğunu doğrular.',
  '[
    {"order": 1, "text": "Tüm güvenlik duvarı kurallarını dışa aktarın ve belgeleyin."},
    {"order": 2, "text": "Son 6 ayda değiştirilmemiş ANY/ANY kurallarını tespit edin."},
    {"order": 3, "text": "Onay belgesi olmayan kural değişikliklerini belirleyin."}
  ]'
),
(
  'a0100000-0000-0000-0000-000000000004',
  'Change Management',
  'Değişiklik Yönetimi Süreç Denetimi',
  'Yazılım ve altyapı değişikliklerinin onay sürecini inceler.',
  '[
    {"order": 1, "text": "Son 3 ayın değişiklik talebi kayıtlarını alın."},
    {"order": 2, "text": "Test ortamında doğrulama yapılmadan uygulanan değişiklikleri tespit edin."},
    {"order": 3, "text": "Acil değişiklik prosedürüne uyumu gözden geçirin."},
    {"order": 4, "text": "Geri alma (rollback) prosedürlerinin mevcut olup olmadığını kontrol edin."}
  ]'
),
(
  'a0100000-0000-0000-0000-000000000005',
  'Data Protection',
  'Veri Şifreleme Uyumluluk Testi',
  'Hassas verilerin uygun şifreleme standartlarıyla korunduğunu doğrular.',
  '[
    {"order": 1, "text": "Veri sınıflandırma envanterini gözden geçirin."},
    {"order": 2, "text": "İletimde (in-transit) TLS 1.2+ kullanımını doğrulayın."},
    {"order": 3, "text": "Veritabanlarında bekleyen (at-rest) şifreleme konfigürasyonlarını kontrol edin."},
    {"order": 4, "text": "Anahtar yönetimi prosedürlerinin uygunluğunu belgeleyin."}
  ]'
)
ON CONFLICT (id) DO NOTHING;
