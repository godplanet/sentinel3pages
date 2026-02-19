/*
  # Phase 12 — XP Ledger & Gamification Engine

  ## Summary
  Implements the core data layer for the Sentinel XP system, turning auditor actions
  into a gamified experience. Every XP transaction is recorded in an immutable ledger
  (like a bank statement) and the running totals are stored on the auditor profile.

  ## New Tables
  - `xp_ledger`
    - Immutable append-only XP transaction log
    - source_type: FINDING | WORKPAPER | CERTIFICATE | EXAM | KUDOS
    - Optional skill_id links the XP to a specific competency
    - source_entity_id optionally points back to the triggering object (finding id, etc.)

  ## Modified Tables
  - `auditor_profiles`
    - `current_xp` (int, default 0) — running XP total
    - `current_level` (int, default 1) — derived level (updated by XPEngine)

  ## Security
  - RLS enabled; anon role allowed for dev/demo environment (matches pattern of other tables)
  - xp_ledger is append-only by design (no DELETE policy for authenticated users)

  ## Seed Data
  - 8 demo XP entries for demo user simulating a realistic audit history
*/

-- ============================================================
-- 1. xp_ledger
-- ============================================================
CREATE TABLE IF NOT EXISTS xp_ledger (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL,
  amount           int  NOT NULL,
  skill_id         uuid,
  source_type      text NOT NULL
                     CHECK (source_type IN ('FINDING','WORKPAPER','CERTIFICATE','EXAM','KUDOS')),
  source_entity_id uuid,
  description      text NOT NULL DEFAULT '',
  created_at       timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE xp_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view xp ledger"
  ON xp_ledger FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert xp entries"
  ON xp_ledger FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_xp_ledger_user_id    ON xp_ledger (user_id);
CREATE INDEX IF NOT EXISTS idx_xp_ledger_created_at ON xp_ledger (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_xp_ledger_source_type ON xp_ledger (source_type);

-- ============================================================
-- 2. Add XP columns to auditor_profiles
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'auditor_profiles' AND column_name = 'current_xp'
  ) THEN
    ALTER TABLE auditor_profiles ADD COLUMN current_xp int NOT NULL DEFAULT 0;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'auditor_profiles' AND column_name = 'current_level'
  ) THEN
    ALTER TABLE auditor_profiles ADD COLUMN current_level int NOT NULL DEFAULT 1;
  END IF;
END $$;

-- ============================================================
-- 3. Seed demo XP entries for demo user
-- ============================================================
INSERT INTO xp_ledger (user_id, amount, source_type, description, created_at)
VALUES
  ('00000000-0000-0000-0000-000000000001', 150, 'FINDING',     'Critical IT Finding logged — Siber Güvenlik',           now() - interval '14 days'),
  ('00000000-0000-0000-0000-000000000001', 100, 'FINDING',     'High risk finding logged — AML Kontrol Eksikliği',      now() - interval '12 days'),
  ('00000000-0000-0000-0000-000000000001', 150, 'WORKPAPER',   'Workpaper sign-off completed — QAIP Score: 96%',        now() - interval '10 days'),
  ('00000000-0000-0000-0000-000000000001', 1000,'CERTIFICATE', 'CISA Sertifikası başarıyla tamamlandı',                 now() - interval '8 days'),
  ('00000000-0000-0000-0000-000000000001', 50,  'FINDING',     'Medium risk finding — Kredi Riski Süreci',              now() - interval '6 days'),
  ('00000000-0000-0000-0000-000000000001', 100, 'WORKPAPER',   'Workpaper sign-off completed — QAIP Score: 82%',        now() - interval '4 days'),
  ('00000000-0000-0000-0000-000000000001', 200, 'KUDOS',       'Kudos alındı: Olağanüstü Analitik Çalışma (+200 XP)',   now() - interval '2 days'),
  ('00000000-0000-0000-0000-000000000001', 100, 'EXAM',        'Akademi Sınavı geçildi — İç Denetim Temelleri (%88)',   now() - interval '1 day')
ON CONFLICT DO NOTHING;

-- Update demo user profile totals to match seed data
UPDATE auditor_profiles
SET
  current_xp    = 1850,
  current_level = 2
WHERE user_id = '00000000-0000-0000-0000-000000000001';
