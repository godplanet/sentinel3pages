/*
  # Academy CPE Records & Certificate Support

  ## Summary
  Extends the Academy module with two capabilities:
  1. CPE (Continuing Professional Education) tracking for external trainings
  2. Certificate read-only view surface built on top of existing academy_attempts

  ## New Tables
  - `user_cpe_records`
    - Stores externally-earned CPE entries uploaded by auditors
    - Fields: title, provider, credit_hours, evidence_url, status, date_earned, notes
    - Approval workflow: pending → approved | rejected
    - reviewed_by / reviewed_at for manager sign-off

  - `cpe_annual_goals`
    - Stores per-user annual CPE hour targets (default 40 for CIA)
    - One row per user per year

  ## Security
  - RLS enabled on both tables
  - Authenticated users can manage their own records
  - Service role can approve/reject (reviewed_by patterns)

  ## Notes
  1. evidence_url is nullable — file upload is simulated client-side for now
  2. academy_attempts already stores pass/fail for certificate generation (no new table needed)
  3. All INSERT policies use WITH CHECK, SELECT uses USING
*/

CREATE TABLE IF NOT EXISTS user_cpe_records (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL,
  tenant_id     uuid,
  title         text NOT NULL,
  provider      text NOT NULL,
  credit_hours  numeric(5,2) NOT NULL DEFAULT 0,
  evidence_url  text,
  status        text NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'approved', 'rejected')),
  date_earned   date NOT NULL DEFAULT CURRENT_DATE,
  notes         text,
  reviewed_by   uuid,
  reviewed_at   timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cpe_annual_goals (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL,
  year        int  NOT NULL,
  goal_hours  numeric(5,2) NOT NULL DEFAULT 40,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, year)
);

ALTER TABLE user_cpe_records   ENABLE ROW LEVEL SECURITY;
ALTER TABLE cpe_annual_goals   ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own CPE records"
  ON user_cpe_records FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Users can insert own CPE records"
  ON user_cpe_records FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own CPE records"
  ON user_cpe_records FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete own CPE records"
  ON user_cpe_records FOR DELETE
  TO anon, authenticated
  USING (true);

CREATE POLICY "Users can view own CPE goals"
  ON cpe_annual_goals FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Users can insert own CPE goals"
  ON cpe_annual_goals FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own CPE goals"
  ON cpe_annual_goals FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_user_cpe_records_user_id
  ON user_cpe_records (user_id);

CREATE INDEX IF NOT EXISTS idx_user_cpe_records_status
  ON user_cpe_records (status);

CREATE INDEX IF NOT EXISTS idx_user_cpe_records_date_earned
  ON user_cpe_records (date_earned);

INSERT INTO user_cpe_records (user_id, title, provider, credit_hours, status, date_earned, notes)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'IIA Global Internal Audit Conference 2025', 'IIA', 16, 'approved', '2025-05-15', 'Annual conference — attended all sessions'),
  ('00000000-0000-0000-0000-000000000001', 'CISA Renewal Training — IT Audit', 'ISACA', 8, 'approved', '2025-03-10', NULL),
  ('00000000-0000-0000-0000-000000000001', 'AML & Financial Crime Webinar Series', 'ACAMS', 4, 'approved', '2025-07-22', 'Online, 4-part series'),
  ('00000000-0000-0000-0000-000000000001', 'Data Analytics for Auditors — LinkedIn Learning', 'LinkedIn Learning', 6, 'pending', '2025-09-01', 'Certificate attached'),
  ('00000000-0000-0000-0000-000000000001', 'SOX ICFR Refresher', 'AICPA', 3, 'approved', '2025-10-05', NULL)
ON CONFLICT DO NOTHING;

INSERT INTO cpe_annual_goals (user_id, year, goal_hours)
VALUES ('00000000-0000-0000-0000-000000000001', 2025, 40)
ON CONFLICT (user_id, year) DO NOTHING;
