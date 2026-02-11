/*
  # Add Anon INSERT Policy for Risk Configuration

  1. Security
    - Allow anon users to INSERT risk configuration (dev mode)
    - This fixes "Risk konfigürasyonu bulunamadı" error when no data exists
*/

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'risk_configuration' AND policyname = 'Dev mode insert risk configuration'
  ) THEN
    CREATE POLICY "Dev mode insert risk configuration"
      ON risk_configuration FOR INSERT TO anon
      WITH CHECK (true);
  END IF;
END $$;

-- Ensure seed data exists
INSERT INTO risk_configuration (
  weight_financial, weight_reputation, weight_operational, weight_legal,
  velocity_multiplier_high, velocity_multiplier_medium,
  threshold_critical, threshold_high, threshold_medium,
  is_active
)
SELECT 0.35, 0.25, 0.20, 0.20, 1.5, 1.2, 20, 16, 10, true
WHERE NOT EXISTS (SELECT 1 FROM risk_configuration WHERE is_active = true);
