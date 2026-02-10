/*
  # Seed Risk Configuration Singleton (Parametric Engine)

  1. New Tables
    - `risk_configuration` (Singleton - 1 active row)
      - `id` (uuid, primary key)
      - `tenant_id` (uuid, default tenant)
      - `weight_financial` (numeric, 0.35) - Financial impact weight
      - `weight_reputation` (numeric, 0.25) - Reputation impact weight
      - `weight_operational` (numeric, 0.20) - Operational impact weight
      - `weight_legal` (numeric, 0.20) - Legal/Regulatory impact weight
      - `velocity_multiplier_high` (numeric, 1.5) - High velocity multiplier
      - `velocity_multiplier_medium` (numeric, 1.2) - Medium velocity multiplier
      - `threshold_critical` (numeric, 20) - Critical zone boundary
      - `threshold_high` (numeric, 16) - High zone boundary
      - `threshold_medium` (numeric, 10) - Medium zone boundary
      - `is_active` (boolean) - Active flag
      - `created_at`, `updated_at` (timestamptz)

  2. Security
    - RLS enabled
    - Authenticated + anon can read and update active config

  3. Seed Data
    - One default row with KERD-2026 constitution values
*/

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS risk_configuration (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
  weight_financial numeric NOT NULL DEFAULT 0.35,
  weight_reputation numeric NOT NULL DEFAULT 0.25,
  weight_operational numeric NOT NULL DEFAULT 0.20,
  weight_legal numeric NOT NULL DEFAULT 0.20,
  velocity_multiplier_high numeric NOT NULL DEFAULT 1.5,
  velocity_multiplier_medium numeric NOT NULL DEFAULT 1.2,
  threshold_critical numeric NOT NULL DEFAULT 20,
  threshold_high numeric NOT NULL DEFAULT 16,
  threshold_medium numeric NOT NULL DEFAULT 10,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_risk_configuration_active_tenant
  ON risk_configuration (tenant_id)
  WHERE is_active = true;

ALTER TABLE risk_configuration ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'risk_configuration' AND policyname = 'Authenticated users can read risk configuration'
  ) THEN
    CREATE POLICY "Authenticated users can read risk configuration"
      ON risk_configuration FOR SELECT TO authenticated
      USING (is_active = true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'risk_configuration' AND policyname = 'Authenticated users can update risk configuration'
  ) THEN
    CREATE POLICY "Authenticated users can update risk configuration"
      ON risk_configuration FOR UPDATE TO authenticated
      USING (is_active = true) WITH CHECK (is_active = true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'risk_configuration' AND policyname = 'Dev mode read risk configuration'
  ) THEN
    CREATE POLICY "Dev mode read risk configuration"
      ON risk_configuration FOR SELECT TO anon
      USING (is_active = true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'risk_configuration' AND policyname = 'Dev mode update risk configuration'
  ) THEN
    CREATE POLICY "Dev mode update risk configuration"
      ON risk_configuration FOR UPDATE TO anon
      USING (is_active = true) WITH CHECK (is_active = true);
  END IF;
END $$;

INSERT INTO risk_configuration (
  weight_financial, weight_reputation, weight_operational, weight_legal,
  velocity_multiplier_high, velocity_multiplier_medium,
  threshold_critical, threshold_high, threshold_medium,
  is_active
)
SELECT 0.35, 0.25, 0.20, 0.20, 1.5, 1.2, 20, 16, 10, true
WHERE NOT EXISTS (SELECT 1 FROM risk_configuration);