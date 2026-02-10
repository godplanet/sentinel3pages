/*
  # Final Working Demo Data Seed
  
  Adds comprehensive demo data with proper UUID formatting.
  Safe to run multiple times (idempotent).
*/

DO $$
DECLARE
  v_tenant_id UUID := '11111111-1111-1111-1111-111111111111';
  v_plan_id UUID;
  v_user_id_1 UUID := '01111111-1111-1111-1111-111111111101';
  v_user_id_2 UUID := '02111111-1111-1111-1111-111111111102';
  v_entity_ids UUID[];
  v_eng_ids UUID[];
  v_find_ids UUID[];
BEGIN
  RAISE NOTICE '[SEED] Starting comprehensive demo data...';

  -- Get or create plan
  SELECT id INTO v_plan_id FROM audit_plans WHERE tenant_id = v_tenant_id LIMIT 1;
  
  IF v_plan_id IS NULL THEN
    v_plan_id := '10000001-1111-1111-1111-111111111111';
    INSERT INTO audit_plans (id, tenant_id, plan_year, title, status)
    VALUES (v_plan_id, v_tenant_id, 2026, 'Yıllık Denetim Planı 2026', 'APPROVED')
    ON CONFLICT (id) DO NOTHING;
    RAISE NOTICE '[SEED] ✓ Plan created';
  ELSE
    RAISE NOTICE '[SEED] ✓ Using existing plan: %', v_plan_id;
  END IF;

  -- Create users
  INSERT INTO user_profiles (id, tenant_id, email, full_name, role, department)
  VALUES
    (v_user_id_1, v_tenant_id, 'hakan.yilmaz@demobank.com', 'Hakan Yılmaz', 'CAE', 'Internal Audit'),
    (v_user_id_2, v_tenant_id, 'ayse.kara@demobank.com', 'Ayşe Kara', 'AUDITOR', 'Internal Audit')
  ON CONFLICT (id) DO NOTHING;

  RAISE NOTICE '[SEED] ✓ Users created';

  -- Create entities (more than 1)
  INSERT INTO audit_entities (tenant_id, path, name, type, risk_score)
  VALUES
    (v_tenant_id, 'bank', 'Demo Bank A.Ş.', 'ROOT', 85),
    (v_tenant_id, 'bank.retail', 'Bireysel Bankacılık', 'DIVISION', 78),
    (v_tenant_id, 'bank.corporate', 'Kurumsal Bankacılık', 'DIVISION', 82),
    (v_tenant_id, 'bank.it', 'Bilgi Teknolojileri', 'DIVISION', 90),
    (v_tenant_id, 'bank.risk', 'Risk Yönetimi', 'DIVISION', 75),
    (v_tenant_id, 'bank.compliance', 'Uyum', 'DIVISION', 70),
    (v_tenant_id, 'bank.treasury', 'Hazine', 'DIVISION', 88),
    (v_tenant_id, 'bank.retail.branch', 'Şube Operasyonları', 'UNIT', 72)
  ON CONFLICT DO NOTHING;

  SELECT ARRAY_AGG(id) INTO v_entity_ids FROM audit_entities WHERE tenant_id = v_tenant_id ORDER BY created_at LIMIT 8;

  RAISE NOTICE '[SEED] ✓ % entities', ARRAY_LENGTH(v_entity_ids, 1);

  -- Create engagements (more than 1)
  IF ARRAY_LENGTH(v_entity_ids, 1) >= 5 THEN
    INSERT INTO audit_engagements (
      tenant_id, plan_id, entity_id, title, audit_type, status,
      start_date, end_date, lead_auditor_id, grade, created_at
    ) VALUES
      (v_tenant_id, v_plan_id, v_entity_ids[1], 'Siber Güvenlik Denetimi', 'COMPREHENSIVE', 'COMPLETED',
       '2026-01-15', '2026-02-28', v_user_id_2, 65, '2026-01-15'::timestamptz),
      (v_tenant_id, v_plan_id, v_entity_ids[2], 'Kredi Tahsis Süreçleri', 'COMPREHENSIVE', 'IN_PROGRESS',
       '2026-02-01', '2026-03-31', v_user_id_2, NULL, '2026-02-01'::timestamptz),
      (v_tenant_id, v_plan_id, v_entity_ids[3], 'AML/CFT Uyum Denetimi', 'COMPLIANCE', 'COMPLETED',
       '2025-11-01', '2025-12-31', v_user_id_2, 78, '2025-11-01'::timestamptz),
      (v_tenant_id, v_plan_id, v_entity_ids[4], 'BT Genel Kontroller', 'IT_AUDIT', 'PLANNING',
       '2026-03-01', '2026-04-30', v_user_id_2, NULL, '2026-03-01'::timestamptz),
      (v_tenant_id, v_plan_id, v_entity_ids[5], 'Şube Operasyonları Denetimi', 'OPERATIONAL', 'FIELDWORK',
       '2026-02-15', '2026-03-15', v_user_id_2, NULL, '2026-02-15'::timestamptz)
    ON CONFLICT DO NOTHING;
  END IF;

  SELECT ARRAY_AGG(id) INTO v_eng_ids FROM audit_engagements WHERE tenant_id = v_tenant_id ORDER BY created_at LIMIT 10;

  RAISE NOTICE '[SEED] ✓ % engagements total', ARRAY_LENGTH(v_eng_ids, 1);

  -- Add more findings to fill out the dashboard
  IF ARRAY_LENGTH(v_eng_ids, 1) >= 2 THEN
    INSERT INTO audit_findings (
      engagement_id, title, severity, status, likelihood, impact,
      details, auditee_department, finding_year, created_at
    ) VALUES
      (v_eng_ids[1], 'Zayıf Parola Politikası', 'HIGH', 'FINAL', 4, 4,
       '{"description":"Sistem kullanıcıları zayıf parolalar kullanıyor"}'::jsonb,
       'IT Security', 2026, '2026-03-01'::timestamptz),
      (v_eng_ids[1], 'Yedekleme Süreci Eksikliği', 'CRITICAL', 'FINAL', 3, 5,
       '{"description":"Kritik sistemlerde yedekleme yapılmıyor"}'::jsonb,
       'IT Operations', 2026, '2026-03-01'::timestamptz),
      (v_eng_ids[2], 'Kredi Onay Limitleri Aşılıyor', 'HIGH', 'DRAFT', 4, 4,
       '{"description":"Bazı şubelerde onay limitleri aşıldı"}'::jsonb,
       'Corporate Banking', 2026, '2026-02-20'::timestamptz),
      (v_eng_ids[2], 'Teminat Değerleme Eksikliği', 'MEDIUM', 'DRAFT', 3, 3,
       '{"description":"Teminatlar güncel değerle değerlendirilmiyor"}'::jsonb,
       'Credit Risk', 2026, '2026-02-20'::timestamptz)
    ON CONFLICT DO NOTHING;
  END IF;

  SELECT ARRAY_AGG(id) INTO v_find_ids FROM audit_findings 
  WHERE engagement_id = ANY(v_eng_ids) ORDER BY created_at LIMIT 15;

  RAISE NOTICE '[SEED] ✓ % findings total', ARRAY_LENGTH(v_find_ids, 1);

  -- Add action plans for dashboard metrics
  IF ARRAY_LENGTH(v_find_ids, 1) >= 4 THEN
    INSERT INTO action_plans (
      tenant_id, finding_id, title, description, status,
      target_date, responsible_person, created_at
    ) VALUES
      (v_tenant_id, v_find_ids[1], 'Parola Politikası Güncelleme', 'Güçlü parola kuralları uygulanacak',
       'IN_PROGRESS', '2026-05-01', 'Ahmet Yılmaz (IT)', '2026-03-05'::timestamptz),
      (v_tenant_id, v_find_ids[2], 'Yedekleme Sistemi Kurulumu', 'Veeam Backup sistemi devreye alınacak',
       'APPROVED', '2026-06-30', 'Mehmet Demir (IT)', '2026-03-05'::timestamptz),
      (v_tenant_id, v_find_ids[3], 'Limit Kontrol Otomasyonu', 'Core banking limitler otomatik kontrol edilecek',
       'DRAFT', '2026-07-01', 'Ali Çelik (Credit)', '2026-02-20'::timestamptz),
      (v_tenant_id, v_find_ids[4], 'Teminat Değerleme Politikası', 'Yıllık değerleme prosedürü hazırlanacak',
       'DRAFT', '2026-06-01', 'Fatma Öz (Risk)', '2026-02-20'::timestamptz)
    ON CONFLICT DO NOTHING;

    RAISE NOTICE '[SEED] ✓ Action plans created';
  END IF;

  -- Add workpapers to show activity
  IF ARRAY_LENGTH(v_eng_ids, 1) >= 3 THEN
    INSERT INTO workpapers (
      engagement_id, ref_number, title, objective, status, approval_status,
      preparer_id, reviewer_id, hours_spent, created_at
    ) VALUES
      (v_eng_ids[1], 'WP-2026-001', 'Parola Politikası Analizi', 'Parola kurallarının değerlendirilmesi',
       'COMPLETED', 'APPROVED', v_user_id_2, v_user_id_1, 8.5, '2026-01-20'::timestamptz),
      (v_eng_ids[1], 'WP-2026-002', 'Yedekleme Testleri', 'Backup sistemlerinin test edilmesi',
       'COMPLETED', 'APPROVED', v_user_id_2, v_user_id_1, 12.0, '2026-01-25'::timestamptz),
      (v_eng_ids[1], 'WP-2026-003', 'Yetki Matrisi İncelemesi', 'Kullanıcı yetkileri örnekleme',
       'COMPLETED', 'APPROVED', v_user_id_2, v_user_id_1, 6.0, '2026-02-01'::timestamptz),
      (v_eng_ids[2], 'WP-2026-010', 'Kredi Onay Süreci', 'Onay limitlerinin test edilmesi',
       'IN_PROGRESS', 'PENDING', v_user_id_2, NULL, 4.5, '2026-02-10'::timestamptz),
      (v_eng_ids[2], 'WP-2026-011', 'Teminat Portföy Analizi', 'Teminat değerleme süreçlerinin incelenmesi',
       'IN_PROGRESS', 'PENDING', v_user_id_2, NULL, 3.0, '2026-02-15'::timestamptz),
      (v_eng_ids[3], 'WP-2025-050', 'STR Bildirim Süreci', 'Şüpheli işlem bildirimi süre testleri',
       'COMPLETED', 'APPROVED', v_user_id_2, v_user_id_1, 10.0, '2025-11-20'::timestamptz)
    ON CONFLICT DO NOTHING;

    RAISE NOTICE '[SEED] ✓ Workpapers created';
  END IF;

  RAISE NOTICE '══════════════════════════════════════════════════════';
  RAISE NOTICE '✓ DEMO DATA SEEDING COMPLETED SUCCESSFULLY';
  RAISE NOTICE '══════════════════════════════════════════════════════';

EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING '[SEED] Non-fatal error: %', SQLERRM;
    -- Don't raise exception, just warn
END $$;