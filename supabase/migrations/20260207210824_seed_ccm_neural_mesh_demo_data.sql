/*
  # Seed CCM Neural Mesh Demo Data

  This migration populates the continuous monitoring tables with:

  1. Data Sources
    - 4 source systems: SAP_ERP, T24_CORE, HR_PORTAL, ACCESS_CTRL

  2. Routine Traffic (~200 normal transactions, 50 HR records, 200 access logs, 50 invoices)
    - Normal banking transactions across multiple users and beneficiaries
    - Standard employee roster with proper access patterns
    - Legitimate vendor invoices with natural Benford distribution

  3. Fraud Scenario A: Structuring / Smurfing
    - User 'USR_SMURF_01' makes 10 transfers of 49,000 TL each
    - All within a 2-hour window on the same day
    - Just below the 50,000 TL reporting threshold
    - Generates STRUCTURING alert (risk_score: 92, CRITICAL)

  4. Fraud Scenario B: Ghost Employee
    - Employee 'GHOST_001' marked ACTIVE in HR master
    - Zero access log entries in the last 30 days
    - Salary: 18,500 TL still being paid
    - Generates GHOST_EMPLOYEE alert (risk_score: 88, HIGH)

  5. Fraud Scenario C: Benford's Law Violation
    - Vendor 'Fraud_Corp' with 30 invoices
    - Amounts predominantly start with digit '9' (unnatural distribution)
    - Generates BENFORD_VIOLATION alert (risk_score: 78, HIGH)

  6. Pre-generated Alerts
    - 3 alerts for the 3 fraud scenarios above
    - All in OPEN status for investigation
*/

-- ============================================================
-- 1. DATA SOURCES
-- ============================================================
INSERT INTO data_sources (name, source_type, status, record_count, last_sync_at, metadata) VALUES
  ('SAP_ERP', 'ERP', 'ACTIVE', 4250, now() - interval '5 minutes', '{"version":"S/4HANA 2023","host":"erp.bank.local","port":8443}'::jsonb),
  ('T24_CORE', 'CORE_BANKING', 'ACTIVE', 12800, now() - interval '2 minutes', '{"version":"R22","host":"t24.bank.local","port":9443}'::jsonb),
  ('HR_PORTAL', 'HR', 'ACTIVE', 1420, now() - interval '15 minutes', '{"version":"SuccessFactors","host":"hr.bank.local"}'::jsonb),
  ('ACCESS_CTRL', 'ACCESS_CONTROL', 'ACTIVE', 8900, now() - interval '1 minute', '{"version":"Lenel OnGuard 8.0","host":"access.bank.local"}'::jsonb)
ON CONFLICT DO NOTHING;

-- ============================================================
-- 2. HR MASTER DATA (50 employees + 1 ghost)
-- ============================================================
DO $$
DECLARE
  v_depts text[] := ARRAY['Hazine','Operasyon','BT','Uyum','Kredi','Perakende','Risk','IC_Denetim'];
  v_names text[] := ARRAY[
    'Ahmet Yilmaz','Mehmet Kaya','Ayse Demir','Fatma Arslan','Ali Ozturk',
    'Hasan Celik','Zeynep Sahin','Murat Dogan','Elif Acar','Can Erdogan',
    'Deniz Aydin','Baris Korkmaz','Seda Polat','Emre Aksoy','Gul Tekin',
    'Kerem Yildiz','Nur Coskun','Tolga Kaplan','Pelin Gunes','Burak Sen',
    'Sibel Ozer','Arda Kilic','Merve Aslan','Cem Basar','Tugba Konak',
    'Onur Avci','Ilke Duran','Serhat Tas','Yasemin Kurt','Berk Inal',
    'Hande Sezer','Alper Unal','Derya Bulut','Sinan Peker','Canan Altin',
    'Volkan Turan','Selin Aktas','Mert Guler','Ece Bozkurt','Kaan Karaca',
    'Irem Soylu','Oguz Vural','Burcu Esen','Furkan Demirci','Ayla Ozkan',
    'Tamer Bilgin','Dilan Yavuz','Eren Cinar','Nil Saglam','Ufuk Bayrak'
  ];
  i integer;
BEGIN
  FOR i IN 1..50 LOOP
    INSERT INTO ccm_hr_master (employee_id, full_name, status, department, hire_date, salary)
    VALUES (
      'EMP_' || LPAD(i::text, 4, '0'),
      v_names[i],
      'ACTIVE',
      v_depts[1 + (i % 8)],
      CURRENT_DATE - (365 * (1 + (i % 8)) + (i * 17 % 365)) * interval '1 day',
      12000 + (i * 731 % 18000)
    )
    ON CONFLICT (employee_id) DO NOTHING;
  END LOOP;
END $$;

-- SCENARIO B: Ghost Employee - ACTIVE in HR but no access
INSERT INTO ccm_hr_master (employee_id, full_name, status, department, hire_date, salary)
VALUES ('GHOST_001', 'Hayalet Kullanici', 'ACTIVE', 'Operasyon', CURRENT_DATE - interval '3 years', 18500)
ON CONFLICT (employee_id) DO NOTHING;

-- ============================================================
-- 3. ACCESS LOGS (normal traffic for real employees)
-- ============================================================
DO $$
DECLARE
  v_types text[] := ARRAY['LOGIN','LOGOUT','TURNSTILE','VPN','BADGE'];
  v_locs text[] := ARRAY['Merkez_Bina','Sube_Kadikoy','Sube_Besiktas','VPN_Remote','DR_Site'];
  i integer;
  v_emp text;
  v_day integer;
  v_hour integer;
BEGIN
  FOR i IN 1..200 LOOP
    v_emp := 'EMP_' || LPAD((1 + (i % 50))::text, 4, '0');
    v_day := i % 30;
    v_hour := 7 + (i % 12);
    INSERT INTO ccm_access_logs (user_id, event_timestamp, event_type, source_ip, location)
    VALUES (
      v_emp,
      now() - (v_day || ' days')::interval + (v_hour || ' hours')::interval,
      v_types[1 + (i % 5)],
      '10.0.' || (i % 255) || '.' || ((i * 7) % 255),
      v_locs[1 + (i % 5)]
    );
  END LOOP;
END $$;

-- NOTE: Ghost_001 has ZERO access logs (intentional)

-- ============================================================
-- 4. NORMAL TRANSACTIONS (200 routine)
-- ============================================================
DO $$
DECLARE
  v_beneficiaries text[] := ARRAY[
    'Turk Telekom A.S.','IGDAS','ISKI','Vodafone TR','Garanti BBVA',
    'Akbank T.A.S.','Yapı Kredi','QNB Finansbank','Halkbank','Vakifbank',
    'Migros','Carrefour SA','BIM A.S.','Teknosa','MediaMarkt',
    'TAV Havalimanlari','Pegasus Hava','THY A.O.','Dogus Otomotiv','Koc Holding'
  ];
  v_types text[] := ARRAY['TRANSFER','PAYMENT','WITHDRAWAL','DEPOSIT'];
  v_users text[] := ARRAY['USR_TR_01','USR_TR_02','USR_TR_03','USR_TR_04','USR_TR_05',
                           'USR_TR_06','USR_TR_07','USR_TR_08','USR_TR_09','USR_TR_10'];
  i integer;
  v_amt numeric;
BEGIN
  FOR i IN 1..200 LOOP
    v_amt := round((100 + random() * 150000)::numeric, 2);
    INSERT INTO ccm_transactions (source_system, transaction_date, amount, currency, user_id, beneficiary, transaction_type, metadata)
    VALUES (
      CASE WHEN i % 3 = 0 THEN 'T24_CORE' ELSE 'SAP_ERP' END,
      now() - ((i % 30) || ' days')::interval - ((i % 24) || ' hours')::interval,
      v_amt,
      CASE WHEN i % 20 = 0 THEN 'USD' WHEN i % 15 = 0 THEN 'EUR' ELSE 'TRY' END,
      v_users[1 + (i % 10)],
      v_beneficiaries[1 + (i % 20)],
      v_types[1 + (i % 4)],
      jsonb_build_object('branch', 'BR_' || LPAD((1 + i % 50)::text, 3, '0'), 'channel', CASE WHEN i % 3 = 0 THEN 'MOBILE' WHEN i % 3 = 1 THEN 'INTERNET' ELSE 'BRANCH' END)
    );
  END LOOP;
END $$;

-- ============================================================
-- 5. SCENARIO A: STRUCTURING / SMURFING
-- 10 transfers of 49,000 TL each within 2 hours
-- ============================================================
DO $$
DECLARE
  v_base_time timestamptz := now() - interval '2 days' + interval '10 hours';
  i integer;
  v_shell_cos text[] := ARRAY[
    'Deniz Ticaret Ltd','Mavi Insaat A.S.','Yildiz Danismanlik','Kara Lojistik',
    'Ay Gida San.','Gunes Tekstil','Bulut Enerji','Doga Tarim','Nehir Madencilik','Atlas Dis Tic.'
  ];
BEGIN
  FOR i IN 1..10 LOOP
    INSERT INTO ccm_transactions (source_system, transaction_date, amount, currency, user_id, beneficiary, transaction_type, metadata)
    VALUES (
      'T24_CORE',
      v_base_time + ((i * 12) || ' minutes')::interval,
      49000.00,
      'TRY',
      'USR_SMURF_01',
      v_shell_cos[i],
      'TRANSFER',
      jsonb_build_object(
        'branch', 'BR_047',
        'channel', 'INTERNET',
        'scenario', 'STRUCTURING',
        'note', '50K esiginin hemen altinda tekrarlayan transferler'
      )
    );
  END LOOP;
END $$;

-- ============================================================
-- 6. NORMAL INVOICES (50 legitimate with natural Benford)
-- ============================================================
DO $$
DECLARE
  v_vendors text[] := ARRAY[
    'Anadolu Sigorta','Aksigorta','Turk Telekomünikasyon','Softtech A.S.','IBM Turkiye',
    'Microsoft TR','Oracle Turkiye','SAP Turkiye','Deloitte','PwC Turkiye',
    'Ernst & Young','KPMG Turkiye','Bilge Yazilim','NetCad','Logo Yazilim',
    'Comodo Guvenlik','Forcepoint','Palo Alto TR','Cisco Turkiye','VMware TR'
  ];
  i integer;
  v_leading integer;
  v_amt numeric;
BEGIN
  FOR i IN 1..50 LOOP
    v_leading := CASE
      WHEN i <= 15 THEN 1
      WHEN i <= 24 THEN 2
      WHEN i <= 30 THEN 3
      WHEN i <= 34 THEN 4
      WHEN i <= 38 THEN 5
      WHEN i <= 41 THEN 6
      WHEN i <= 43 THEN 7
      WHEN i <= 46 THEN 8
      ELSE 9
    END;
    v_amt := (v_leading * 1000 + (i * 137 % 999))::numeric + round((random() * 99)::numeric, 2);

    INSERT INTO ccm_invoices (invoice_id, vendor_name, amount, currency, created_by, invoice_date, description)
    VALUES (
      'INV-2026-' || LPAD(i::text, 5, '0'),
      v_vendors[1 + (i % 20)],
      v_amt,
      'TRY',
      'EMP_' || LPAD((1 + i % 20)::text, 4, '0'),
      CURRENT_DATE - (i % 60) * interval '1 day',
      'Standart tedarikci faturasi #' || i
    );
  END LOOP;
END $$;

-- ============================================================
-- 7. SCENARIO C: BENFORD VIOLATION (Fraud_Corp - 30 invoices starting with '9')
-- ============================================================
DO $$
DECLARE
  i integer;
  v_amt numeric;
BEGIN
  FOR i IN 1..30 LOOP
    v_amt := (9000 + (i * 97 % 999))::numeric + round((random() * 99)::numeric, 2);
    INSERT INTO ccm_invoices (invoice_id, vendor_name, amount, currency, created_by, invoice_date, description, metadata)
    VALUES (
      'INV-FC-2026-' || LPAD(i::text, 4, '0'),
      'Fraud_Corp Ltd.',
      v_amt,
      'TRY',
      'EMP_0012',
      CURRENT_DATE - (i % 45) * interval '1 day',
      'Danismanlik hizmeti faturasi #' || i,
      jsonb_build_object('scenario', 'BENFORD_VIOLATION', 'leading_digit', 9)
    );
  END LOOP;
END $$;

-- ============================================================
-- 8. PRE-GENERATED ALERTS
-- ============================================================
INSERT INTO ccm_alerts (rule_triggered, risk_score, severity, title, description, evidence_data, related_entity_id, status) VALUES
(
  'STRUCTURING',
  92,
  'CRITICAL',
  'Yapilandirma Suphelisi: USR_SMURF_01',
  '2 saat icinde 10 adet 49.000 TL transfer tespit edildi. Toplam: 490.000 TL. 50K raporlama esiginin hemen altinda.',
  jsonb_build_object(
    'user_id', 'USR_SMURF_01',
    'total_amount', 490000,
    'transaction_count', 10,
    'time_window_minutes', 120,
    'threshold', 50000,
    'avg_per_tx', 49000,
    'beneficiaries', ARRAY['Deniz Ticaret Ltd','Mavi Insaat A.S.','Yildiz Danismanlik','Kara Lojistik','Ay Gida San.','Gunes Tekstil','Bulut Enerji','Doga Tarim','Nehir Madencilik','Atlas Dis Tic.']
  ),
  'USR_SMURF_01',
  'OPEN'
),
(
  'GHOST_EMPLOYEE',
  88,
  'HIGH',
  'Hayalet Calisan: GHOST_001',
  'GHOST_001 (Hayalet Kullanici) HR sisteminde AKTIF ancak son 30 gunde sifir erisim kaydi. Maas: 18.500 TL odeniyor.',
  jsonb_build_object(
    'employee_id', 'GHOST_001',
    'full_name', 'Hayalet Kullanici',
    'department', 'Operasyon',
    'status', 'ACTIVE',
    'salary', 18500,
    'access_logs_30d', 0,
    'hire_date', '2023-02-07'
  ),
  'GHOST_001',
  'OPEN'
),
(
  'BENFORD_VIOLATION',
  78,
  'HIGH',
  'Benford Sapma: Fraud_Corp Ltd.',
  'Fraud_Corp Ltd. tedarikci faturalarinda anormal rakam dagilimi. 30 faturanin %100''u 9 ile basliyor (beklenen: ~%4.6).',
  jsonb_build_object(
    'vendor_name', 'Fraud_Corp Ltd.',
    'invoice_count', 30,
    'leading_digit_9_pct', 100.0,
    'expected_benford_pct', 4.6,
    'deviation_factor', 21.7,
    'total_amount_suspicious', 291000,
    'created_by', 'EMP_0012'
  ),
  'Fraud_Corp Ltd.',
  'OPEN'
);

-- Update source record counts
UPDATE data_sources SET record_count = (SELECT count(*) FROM ccm_transactions) WHERE name = 'SAP_ERP';
UPDATE data_sources SET record_count = (SELECT count(*) FROM ccm_transactions WHERE source_system = 'T24_CORE') WHERE name = 'T24_CORE';
UPDATE data_sources SET record_count = (SELECT count(*) FROM ccm_hr_master) WHERE name = 'HR_PORTAL';
UPDATE data_sources SET record_count = (SELECT count(*) FROM ccm_access_logs) WHERE name = 'ACCESS_CTRL';
