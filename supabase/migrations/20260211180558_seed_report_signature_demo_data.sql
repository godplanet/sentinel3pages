/*
  # Seed Report Signature Demo Data

  ## Summary
  Creates demonstration reports with various signature chain scenarios to showcase:
  - Complete signature chain (all 3 approvals)
  - Pending signature (waiting for next approver)
  - Dissenting opinion (Şerh) example
  - Rejected report scenario
  - Published (frozen) report with snapshot

  ## Test Scenarios
  1. **Draft Report** - No signatures, ready for Creator to sign
  2. **Review Report** - Creator signed, waiting for Manager
  3. **Dissent Report** - Manager approved with dissent (Şerh)
  4. **Published Report** - All signatures complete, frozen snapshot
  5. **Rejected Report** - Manager rejected, back to draft

  ## Impact
  - Demonstrates signature workflow states
  - Shows dissenting opinion functionality
  - Validates snapshot/freeze mechanism
*/

DO $$
DECLARE
  v_tenant_id uuid;
  v_report_1 uuid;
  v_report_2 uuid;
  v_report_3 uuid;
  v_report_4 uuid;
  v_report_5 uuid;
BEGIN
  -- Get tenant
  SELECT id INTO v_tenant_id FROM tenants LIMIT 1;

  IF v_tenant_id IS NULL THEN
    RAISE NOTICE 'No tenant found. Skipping seed data.';
    RETURN;
  END IF;

  -- SCENARIO 1: Draft Report (No Signatures)
  INSERT INTO reports (
    tenant_id,
    title,
    description,
    status,
    theme_config,
    layout_type,
    created_at
  ) VALUES (
    v_tenant_id,
    'Q1 2026 Risk Assessment Report',
    'Quarterly risk assessment covering operational, IT, and compliance domains',
    'draft',
    '{"mode": "neon", "accent": "blue", "layout": "standard"}'::jsonb,
    'standard',
    now() - INTERVAL '5 days'
  ) RETURNING id INTO v_report_1;

  -- SCENARIO 2: Review Report (Creator Signed, Waiting for Manager)
  INSERT INTO reports (
    tenant_id,
    title,
    description,
    status,
    theme_config,
    layout_type,
    created_at
  ) VALUES (
    v_tenant_id,
    'Branch Audit Report - Kadıköy',
    'Comprehensive branch audit findings and recommendations',
    'review',
    '{"mode": "neon", "accent": "blue", "layout": "standard"}'::jsonb,
    'standard',
    now() - INTERVAL '3 days'
  ) RETURNING id INTO v_report_2;

  -- Add Creator signature
  INSERT INTO report_signatures (
    tenant_id,
    report_id,
    signer_name,
    signer_role,
    signer_title,
    status,
    order_index,
    signed_at
  ) VALUES (
    v_tenant_id,
    v_report_2,
    'Mehmet Demir',
    'CREATOR',
    'Hazırlayan Denetçi',
    'signed',
    0,
    now() - INTERVAL '3 days'
  );

  -- SCENARIO 3: Manager Approved with Dissent (Şerh)
  INSERT INTO reports (
    tenant_id,
    title,
    description,
    status,
    theme_config,
    layout_type,
    created_at
  ) VALUES (
    v_tenant_id,
    'IT Security Audit - Core Banking',
    'Critical vulnerabilities identified in core banking infrastructure',
    'review',
    '{"mode": "neon", "accent": "orange", "layout": "standard"}'::jsonb,
    'standard',
    now() - INTERVAL '7 days'
  ) RETURNING id INTO v_report_3;

  -- Creator signature
  INSERT INTO report_signatures (
    tenant_id,
    report_id,
    signer_name,
    signer_role,
    signer_title,
    status,
    order_index,
    signed_at
  ) VALUES (
    v_tenant_id,
    v_report_3,
    'Ayşe Kaya',
    'CREATOR',
    'Hazırlayan Denetçi',
    'signed',
    0,
    now() - INTERVAL '7 days'
  );

  -- Manager signature WITH DISSENT
  INSERT INTO report_signatures (
    tenant_id,
    report_id,
    signer_name,
    signer_role,
    signer_title,
    status,
    order_index,
    dissent_comment,
    signed_at
  ) VALUES (
    v_tenant_id,
    v_report_3,
    'Zeynep Arslan',
    'MANAGER',
    'Denetim Yöneticisi',
    'signed_with_dissent',
    1,
    'Yönetici Özeti''nde belirtilen "Kritik" risk seviyesine katılmıyorum. Bulgular "Yüksek" olarak değerlendirilmelidir. Sistemin mevcut kompansasyon kontrolleri yeterli düzeydedir.',
    now() - INTERVAL '6 days'
  );

  -- SCENARIO 4: Published Report (Complete Signature Chain + Snapshot)
  INSERT INTO reports (
    tenant_id,
    title,
    description,
    status,
    theme_config,
    layout_type,
    created_at,
    published_at,
    locked_at,
    snapshot_data
  ) VALUES (
    v_tenant_id,
    '2025 Annual Audit Summary',
    'Comprehensive annual audit report covering all business units',
    'published',
    '{"mode": "neon", "accent": "green", "layout": "executive"}'::jsonb,
    'executive',
    now() - INTERVAL '30 days',
    now() - INTERVAL '15 days',
    now() - INTERVAL '15 days',
    jsonb_build_object(
      'report', jsonb_build_object(
        'title', '2025 Annual Audit Summary',
        'status', 'published'
      ),
      'blocks', '[]'::jsonb,
      'findings', '[]'::jsonb,
      'metadata', jsonb_build_object(
        'snapshot_version', '1.0',
        'created_at', now() - INTERVAL '15 days',
        'total_blocks', 12,
        'total_findings', 8
      )
    )
  ) RETURNING id INTO v_report_4;

  -- Complete signature chain for published report
  INSERT INTO report_signatures (
    tenant_id,
    report_id,
    signer_name,
    signer_role,
    signer_title,
    status,
    order_index,
    signed_at
  ) VALUES
    (v_tenant_id, v_report_4, 'Mustafa Özkan', 'CREATOR', 'Hazırlayan Denetçi', 'signed', 0, now() - INTERVAL '30 days'),
    (v_tenant_id, v_report_4, 'Fatma Yıldız', 'MANAGER', 'Denetim Yöneticisi', 'signed', 1, now() - INTERVAL '20 days'),
    (v_tenant_id, v_report_4, 'Ali Çelik', 'CAE', 'Teftiş Kurulu Başkanı', 'signed', 2, now() - INTERVAL '15 days');

  -- SCENARIO 5: Rejected Report (Manager Rejected)
  INSERT INTO reports (
    tenant_id,
    title,
    description,
    status,
    theme_config,
    layout_type,
    created_at
  ) VALUES (
    v_tenant_id,
    'Vendor Risk Assessment - ABC Corp',
    'Third-party vendor risk evaluation',
    'draft',
    '{"mode": "neon", "accent": "red", "layout": "standard"}'::jsonb,
    'standard',
    now() - INTERVAL '10 days'
  ) RETURNING id INTO v_report_5;

  -- Creator signature
  INSERT INTO report_signatures (
    tenant_id,
    report_id,
    signer_name,
    signer_role,
    signer_title,
    status,
    order_index,
    signed_at
  ) VALUES (
    v_tenant_id,
    v_report_5,
    'Kemal Şahin',
    'CREATOR',
    'Hazırlayan Denetçi',
    'signed',
    0,
    now() - INTERVAL '10 days'
  );

  -- Manager REJECTION
  INSERT INTO report_signatures (
    tenant_id,
    report_id,
    signer_name,
    signer_role,
    signer_title,
    status,
    order_index,
    dissent_comment,
    signed_at
  ) VALUES (
    v_tenant_id,
    v_report_5,
    'Selin Aydın',
    'MANAGER',
    'Denetim Yöneticisi',
    'rejected',
    1,
    'Risk skorlaması metodolojisi hatalı. Vendor''un finansal durumu yeterince analiz edilmemiş. Rapor revizyona gönderilmelidir.',
    now() - INTERVAL '8 days'
  );

  RAISE NOTICE 'Successfully seeded 5 report signature scenarios';

END $$;
