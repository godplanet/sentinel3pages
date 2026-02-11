/*
  # Seed Audit Cycle & Risk Components Demo Data

  ## Summary
  Seeds demonstration data to showcase:
  - Audit cycle tracking (Overdue, Upcoming, Current)
  - Risk component breakdowns (Operational, IT, Compliance, Financial)
  - Regulatory compliance scenarios (BDDK/GIAS)

  ## Test Scenarios
  1. **Kadıköy Şubesi** - Overdue audit (2 years, frequency: Annual) + High operational risk
  2. **Core Banking DB** - Critical IT asset with High IT Risk, Low Financial Risk
  3. **Ataşehir Şubesi** - Upcoming audit (25 days) + Balanced risks
  4. **XYZ Danışmanlık** - Expired contract vendor + High compliance risk

  ## Impact
  - Demonstrates audit health badges (RED/YELLOW/GREEN)
  - Shows risk component tooltip functionality
  - Validates audit cycle calculation logic
*/

-- First, get the tenant_id (assuming demo tenant exists)
DO $$
DECLARE
  v_tenant_id uuid;
  v_bank_id uuid;
  v_bank_path ltree;
BEGIN
  -- Get first tenant (demo tenant)
  SELECT id INTO v_tenant_id FROM tenants LIMIT 1;
  
  IF v_tenant_id IS NULL THEN
    RAISE NOTICE 'No tenant found. Skipping seed data.';
    RETURN;
  END IF;

  -- Find or create a bank entity
  SELECT id, path INTO v_bank_id, v_bank_path
  FROM audit_entities
  WHERE tenant_id = v_tenant_id AND type = 'BANK'
  LIMIT 1;

  IF v_bank_id IS NULL THEN
    -- Create a demo bank
    INSERT INTO audit_entities (
      tenant_id, path, name, type, risk_score, velocity_multiplier
    ) VALUES (
      v_tenant_id, 'demo_bank', 'Demo Bankası', 'BANK', 65, 1.0
    ) RETURNING id, path INTO v_bank_id, v_bank_path;
  END IF;

  -- SCENARIO 1: Kadıköy Şubesi - OVERDUE AUDIT (Gecikmiş)
  -- Last audit: 2 years ago (2023-02-11), Frequency: Annual
  -- Should show RED badge "Gecikmiş" (~730 days overdue)
  INSERT INTO audit_entities (
    tenant_id,
    path,
    name,
    type,
    risk_score,
    velocity_multiplier,
    metadata,
    last_audit_date,
    audit_frequency,
    next_audit_due,
    risk_operational,
    risk_it,
    risk_compliance,
    risk_financial
  ) VALUES (
    v_tenant_id,
    v_bank_path || 'kadikoy_subesi',
    'Kadıköy Şubesi',
    'BRANCH',
    85,
    1.2,
    jsonb_build_object(
      'turnover_rate', 28,
      'transaction_volume', 15000000,
      'staff_count', 45,
      'region', 'Anadolu Yakası'
    ),
    '2023-02-11',
    'Yıllık',
    '2024-02-11',
    85,
    45,
    60,
    30
  ) ON CONFLICT DO NOTHING;

  -- SCENARIO 2: Core Banking DB - Critical IT Asset with High IT Risk
  INSERT INTO audit_entities (
    tenant_id,
    path,
    name,
    type,
    risk_score,
    velocity_multiplier,
    metadata,
    last_audit_date,
    audit_frequency,
    next_audit_due,
    risk_operational,
    risk_it,
    risk_compliance,
    risk_financial
  ) VALUES (
    v_tenant_id,
    v_bank_path || 'core_banking_db',
    'Core Banking Veritabanı',
    'IT_ASSET',
    95,
    1.5,
    jsonb_build_object(
      'criticality_level', 'CRITICAL',
      'cpe_id', 'DB-PROD-001',
      'last_patch_date', '2024-10-15',
      'system_type', 'Oracle RAC',
      'owner_team', 'BT Operasyon'
    ),
    '2024-02-15',
    'Yıllık',
    '2025-02-15',
    40,
    95,
    50,
    20
  ) ON CONFLICT DO NOTHING;

  -- SCENARIO 3: Ataşehir Şubesi - UPCOMING AUDIT (Yaklaşıyor)
  -- Next audit: 25 days from now
  -- Should show YELLOW badge "Yaklaşıyor"
  INSERT INTO audit_entities (
    tenant_id,
    path,
    name,
    type,
    risk_score,
    velocity_multiplier,
    metadata,
    last_audit_date,
    audit_frequency,
    next_audit_due,
    risk_operational,
    risk_it,
    risk_compliance,
    risk_financial
  ) VALUES (
    v_tenant_id,
    v_bank_path || 'atasehir_subesi',
    'Ataşehir Şubesi',
    'BRANCH',
    70,
    1.1,
    jsonb_build_object(
      'turnover_rate', 12,
      'transaction_volume', 22000000,
      'staff_count', 38,
      'region', 'Anadolu Yakası'
    ),
    CURRENT_DATE - INTERVAL '340 days',
    'Yıllık',
    CURRENT_DATE + INTERVAL '25 days',
    70,
    55,
    65,
    45
  ) ON CONFLICT DO NOTHING;

  -- SCENARIO 4: XYZ Danışmanlık - Expired Contract Vendor + High Compliance Risk
  -- Last audit: 3 years ago, Frequency: 2 Yılda Bir
  -- Should show RED badge "Gecikmiş"
  INSERT INTO audit_entities (
    tenant_id,
    path,
    name,
    type,
    risk_score,
    velocity_multiplier,
    metadata,
    last_audit_date,
    audit_frequency,
    next_audit_due,
    risk_operational,
    risk_it,
    risk_compliance,
    risk_financial
  ) VALUES (
    v_tenant_id,
    v_bank_path || 'xyz_danismanlik',
    'XYZ Danışmanlık Ltd.',
    'VENDOR',
    90,
    1.3,
    jsonb_build_object(
      'contract_status', 'EXPIRED',
      'risk_rating', 'HIGH',
      'contract_expiry', '2024-06-30',
      'service_type', 'BT Danışmanlık',
      'annual_spend', 1200000
    ),
    '2021-12-01',
    '2 Yılda Bir',
    '2023-12-01',
    50,
    40,
    90,
    35
  ) ON CONFLICT DO NOTHING;

  -- SCENARIO 5: Ankara İştirak - Subsidiary with 3-year cycle, CURRENT status
  INSERT INTO audit_entities (
    tenant_id,
    path,
    name,
    type,
    risk_score,
    velocity_multiplier,
    metadata,
    last_audit_date,
    audit_frequency,
    next_audit_due,
    risk_operational,
    risk_it,
    risk_compliance,
    risk_financial
  ) VALUES (
    v_tenant_id,
    v_bank_path || 'ankara_istirak',
    'Ankara Finansal Hizmetler A.Ş.',
    'SUBSIDIARY',
    55,
    1.0,
    jsonb_build_object(
      'ownership_percentage', 75,
      'country', 'Türkiye',
      'industry', 'Finansal Hizmetler',
      'consolidated', true
    ),
    '2023-06-15',
    '3 Yılda Bir',
    '2026-06-15',
    55,
    30,
    50,
    40
  ) ON CONFLICT DO NOTHING;

  -- SCENARIO 6: Leasing App Server - IT Asset with Continuous Monitoring
  INSERT INTO audit_entities (
    tenant_id,
    path,
    name,
    type,
    risk_score,
    velocity_multiplier,
    metadata,
    last_audit_date,
    audit_frequency,
    next_audit_due,
    risk_operational,
    risk_it,
    risk_compliance,
    risk_financial
  ) VALUES (
    v_tenant_id,
    v_bank_path || 'leasing_app_srv',
    'Leasing Uygulama Sunucusu',
    'IT_ASSET',
    78,
    1.4,
    jsonb_build_object(
      'criticality_level', 'HIGH',
      'cpe_id', 'APP-PROD-045',
      'last_patch_date', '2026-01-20',
      'system_type', 'Linux + Tomcat',
      'owner_team', 'Uygulama Geliştirme'
    ),
    CURRENT_DATE - INTERVAL '90 days',
    'Sürekli',
    CURRENT_DATE + INTERVAL '275 days',
    60,
    78,
    45,
    25
  ) ON CONFLICT DO NOTHING;

  RAISE NOTICE 'Successfully seeded 6 audit entities with cycle and risk component data';
  
END $$;
