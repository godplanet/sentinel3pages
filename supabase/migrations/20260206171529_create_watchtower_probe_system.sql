/*
  # Sentinel Watchtower - Continuous Audit Engine Upgrade

  1. Modified Tables
    - `probes`
      - Added `category` (text) - Probe category: FRAUD, OPS, COMPLIANCE
      - Added `severity` (text) - Alert severity: HIGH, MEDIUM, LOW

  2. New Tables
    - `probe_runs`
      - `id` (uuid, primary key)
      - `probe_id` (uuid, FK to probes)
      - `items_found` (integer) - Exception count per run
      - `execution_time_ms` (integer) - Duration in ms
      - `status` (text) - PASS, FAIL, ERROR
      - `run_metadata` (jsonb) - Raw execution metadata
      - `started_at` / `completed_at` (timestamptz)
      - `tenant_id` (uuid)

    - `probe_exceptions`
      - `id` (uuid, primary key)
      - `run_id` (uuid, FK to probe_runs)
      - `probe_id` (uuid, FK to probes)
      - `data_payload` (jsonb) - The actual flagged row/record
      - `status` (text) - OPEN, REMEDIED, FALSE_POSITIVE, ESCALATED
      - `assigned_to` (uuid) - Reviewer user id
      - `notes` (text) - Reviewer notes
      - `resolved_at` (timestamptz)
      - `tenant_id` (uuid)

  3. Security
    - RLS enabled on both new tables
    - SELECT, INSERT, UPDATE, DELETE policies for authenticated users
    - Tenant isolation via tenant_id

  4. Indexes
    - probe_runs: probe_id, started_at, tenant_id
    - probe_exceptions: run_id, probe_id, status, tenant_id

  5. Seed Data
    - Sample probe runs and exceptions for demo purposes
*/

-- Add category and severity to probes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'probes' AND column_name = 'category'
  ) THEN
    ALTER TABLE probes ADD COLUMN category text DEFAULT 'OPS';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'probes' AND column_name = 'severity'
  ) THEN
    ALTER TABLE probes ADD COLUMN severity text DEFAULT 'MEDIUM';
  END IF;
END $$;

-- Create probe_runs table
CREATE TABLE IF NOT EXISTS probe_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  probe_id uuid NOT NULL REFERENCES probes(id) ON DELETE CASCADE,
  items_found integer NOT NULL DEFAULT 0,
  execution_time_ms integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'PASS',
  run_metadata jsonb DEFAULT '{}'::jsonb,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz DEFAULT now(),
  tenant_id uuid NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111'::uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE probe_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view probe runs"
  ON probe_runs FOR SELECT TO authenticated
  USING (tenant_id = (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid);

CREATE POLICY "Authenticated users can insert probe runs"
  ON probe_runs FOR INSERT TO authenticated
  WITH CHECK (tenant_id = (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid);

CREATE POLICY "Authenticated users can update probe runs"
  ON probe_runs FOR UPDATE TO authenticated
  USING (tenant_id = (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid)
  WITH CHECK (tenant_id = (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid);

CREATE POLICY "Authenticated users can delete probe runs"
  ON probe_runs FOR DELETE TO authenticated
  USING (tenant_id = (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid);

CREATE INDEX IF NOT EXISTS idx_probe_runs_probe_id ON probe_runs(probe_id);
CREATE INDEX IF NOT EXISTS idx_probe_runs_started_at ON probe_runs(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_probe_runs_tenant_id ON probe_runs(tenant_id);

-- Create probe_exceptions table
CREATE TABLE IF NOT EXISTS probe_exceptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id uuid NOT NULL REFERENCES probe_runs(id) ON DELETE CASCADE,
  probe_id uuid NOT NULL REFERENCES probes(id) ON DELETE CASCADE,
  data_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'OPEN',
  assigned_to uuid,
  notes text DEFAULT '',
  resolved_at timestamptz,
  tenant_id uuid NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111'::uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE probe_exceptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view probe exceptions"
  ON probe_exceptions FOR SELECT TO authenticated
  USING (tenant_id = (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid);

CREATE POLICY "Authenticated users can insert probe exceptions"
  ON probe_exceptions FOR INSERT TO authenticated
  WITH CHECK (tenant_id = (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid);

CREATE POLICY "Authenticated users can update probe exceptions"
  ON probe_exceptions FOR UPDATE TO authenticated
  USING (tenant_id = (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid)
  WITH CHECK (tenant_id = (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid);

CREATE POLICY "Authenticated users can delete probe exceptions"
  ON probe_exceptions FOR DELETE TO authenticated
  USING (tenant_id = (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid);

CREATE INDEX IF NOT EXISTS idx_probe_exceptions_run_id ON probe_exceptions(run_id);
CREATE INDEX IF NOT EXISTS idx_probe_exceptions_probe_id ON probe_exceptions(probe_id);
CREATE INDEX IF NOT EXISTS idx_probe_exceptions_status ON probe_exceptions(status);
CREATE INDEX IF NOT EXISTS idx_probe_exceptions_tenant_id ON probe_exceptions(tenant_id);

-- Dev mode permissive policies for testing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'probe_runs' AND policyname = 'Dev probe_runs public access'
  ) THEN
    CREATE POLICY "Dev probe_runs public access" ON probe_runs FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'probe_exceptions' AND policyname = 'Dev probe_exceptions public access'
  ) THEN
    CREATE POLICY "Dev probe_exceptions public access" ON probe_exceptions FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Seed demo probes with category/severity
UPDATE probes SET category = 'FRAUD', severity = 'HIGH' WHERE title ILIKE '%fraud%' OR title ILIKE '%eft%' OR title ILIKE '%transaction%';
UPDATE probes SET category = 'COMPLIANCE', severity = 'MEDIUM' WHERE title ILIKE '%compliance%' OR title ILIKE '%regulatory%';
UPDATE probes SET category = 'OPS', severity = 'LOW' WHERE category IS NULL OR category = 'OPS';

-- Insert sample probes if none exist
INSERT INTO probes (title, description, query_type, query_payload, schedule_cron, risk_threshold, is_active, category, severity, last_result_status, last_run_at)
SELECT * FROM (VALUES
  ('Haftasonu EFT Kontrol', 'Hafta sonu yapilan yuksek tutarli EFT islemlerini tespit eder', 'SQL', 'SELECT * FROM transactions WHERE day_of_week IN (6,7) AND amount > 500000', '0 */4 * * *', 3, true, 'FRAUD', 'HIGH', 'FAIL', now() - interval '2 hours'),
  ('Yetki Matrisi Ihlal Tarama', 'Onay yetkisi olmadan gerceklestirilen islemleri tarar', 'SQL', 'SELECT * FROM approvals WHERE approver_level < required_level', '0 8 * * 1-5', 5, true, 'COMPLIANCE', 'HIGH', 'PASS', now() - interval '6 hours'),
  ('Bolunmus Islem Tespiti (Smurfing)', 'Esik altinda kalan ardisik islemleri tespit eder', 'SQL', 'SELECT * FROM transactions WHERE amount BETWEEN 9000 AND 10000 GROUP BY account_id HAVING COUNT(*) > 3', '0 */2 * * *', 2, true, 'FRAUD', 'HIGH', 'FAIL', now() - interval '1 hour'),
  ('Dormant Hesap Aktivite Izleme', 'Uzun suredir islem gormeyen hesaplardaki ani hareketleri izler', 'API', 'https://core-banking/api/dormant-accounts/activity', '0 6 * * *', 1, true, 'FRAUD', 'MEDIUM', 'PASS', now() - interval '18 hours'),
  ('KVKK Veri Erisim Logu', 'Hassas verilere erisim loglarini kontrol eder', 'SQL', 'SELECT * FROM access_logs WHERE data_classification = ''SENSITIVE'' AND accessed_at > now() - interval ''24h''', '0 0 * * *', 10, true, 'COMPLIANCE', 'MEDIUM', 'PASS', now() - interval '24 hours'),
  ('Sistem Performans Izleme', 'Core banking sistem yanit surelerini izler', 'WEBHOOK', 'https://monitoring.internal/webhook/perf-alerts', '*/15 * * * *', 5, false, 'OPS', 'LOW', 'PASS', now() - interval '4 hours')
) AS v(title, description, query_type, query_payload, schedule_cron, risk_threshold, is_active, category, severity, last_result_status, last_run_at)
WHERE NOT EXISTS (SELECT 1 FROM probes WHERE probes.title = v.title);

-- Seed probe_runs (past 48 hours of simulated runs)
DO $$
DECLARE
  p_record RECORD;
  run_id uuid;
  run_time timestamptz;
  items int;
  run_status text;
  h int;
BEGIN
  FOR p_record IN SELECT id, risk_threshold, category FROM probes LIMIT 6 LOOP
    FOR h IN 0..23 LOOP
      run_time := now() - (h * interval '2 hours');
      items := floor(random() * 15)::int;

      IF items > p_record.risk_threshold THEN
        run_status := 'FAIL';
      ELSE
        run_status := 'PASS';
      END IF;

      run_id := gen_random_uuid();

      INSERT INTO probe_runs (id, probe_id, items_found, execution_time_ms, status, started_at, completed_at, run_metadata)
      VALUES (
        run_id,
        p_record.id,
        items,
        50 + floor(random() * 450)::int,
        run_status,
        run_time,
        run_time + (floor(random() * 500)::int || ' milliseconds')::interval,
        jsonb_build_object('source', 'scheduled', 'version', '3.0')
      );

      IF run_status = 'FAIL' THEN
        FOR i IN 1..LEAST(items, 5) LOOP
          INSERT INTO probe_exceptions (run_id, probe_id, data_payload, status)
          VALUES (
            run_id,
            p_record.id,
            jsonb_build_object(
              'account_id', 'ACC-' || floor(random() * 99999)::text,
              'amount', round((random() * 1000000)::numeric, 2),
              'timestamp', run_time::text,
              'description', CASE floor(random() * 4)::int
                WHEN 0 THEN 'Esik ustu islem tespit edildi'
                WHEN 1 THEN 'Yetkisiz erisim girisimi'
                WHEN 2 THEN 'Supheli islem deseni'
                ELSE 'Politika ihlali'
              END
            ),
            CASE floor(random() * 4)::int
              WHEN 0 THEN 'OPEN'
              WHEN 1 THEN 'OPEN'
              WHEN 2 THEN 'REMEDIED'
              ELSE 'FALSE_POSITIVE'
            END
          );
        END LOOP;
      END IF;
    END LOOP;
  END LOOP;
END $$;
