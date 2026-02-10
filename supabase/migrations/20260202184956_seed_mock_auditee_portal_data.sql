/*
  # Mock Data for Auditee Portal Testing

  1. Seed Data
    - Sample findings with various severities
    - Workflow states for each finding
    - Auditee assignments
    - Sample responses and milestones
    - Evidence files

  2. Purpose
    - Enable immediate testing of auditee portal
    - Demonstrate different workflow stages
    - Show various response types (accept, object)
*/

-- First, ensure we have a tenant
INSERT INTO tenants (id, name, type, environment, created_at)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Demo Bank A.Ş.', 'HEAD_OFFICE', 'PROD', now())
ON CONFLICT (id) DO NOTHING;

-- Create a dummy engagement first
INSERT INTO audit_plans (id, tenant_id, title, period_start, period_end, status, version)
VALUES (
  '10000000-0000-0000-0000-000000000001',
  '11111111-1111-1111-1111-111111111111',
  'Yıllık Denetim Planı 2026',
  '2026-01-01',
  '2026-12-31',
  'APPROVED',
  1
) ON CONFLICT (id) DO NOTHING;

INSERT INTO audit_entities (id, tenant_id, path, name, type, risk_score)
VALUES (
  '10000000-0000-0000-0000-000000000002',
  '11111111-1111-1111-1111-111111111111',
  'bank.operations',
  'Operasyon Birimi',
  'UNIT',
  75.5
) ON CONFLICT (id) DO NOTHING;

INSERT INTO audit_engagements (id, tenant_id, plan_id, entity_id, title, status, audit_type, start_date, end_date)
VALUES (
  '10000000-0000-0000-0000-000000000003',
  '11111111-1111-1111-1111-111111111111',
  '10000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000002',
  'Şube Operasyonları Denetimi',
  'IN_PROGRESS',
  'COMPREHENSIVE',
  '2026-01-15',
  '2026-03-15'
) ON CONFLICT (id) DO NOTHING;

-- Sample findings
INSERT INTO audit_findings (id, engagement_id, title, severity, status, details, impact_score, likelihood_score, state, created_at)
VALUES 
  (
    '22222222-2222-2222-2222-222222222221',
    '10000000-0000-0000-0000-000000000003',
    'Kasa İşlemlerinde Çift Anahtar Kuralı İhlali',
    'CRITICAL',
    'FINAL',
    '{"condition": "Yapılan incelemede, 12.01.2026 tarihli kasa açış işleminde şube yöneticinin ve operasyon yetkilisinin hazır bulunması gerekliliği ihlal edilmiştir.", "criteria": "İşlemin tek taraflı gerçekleştirildiği CCTV kayıtlarından tespit edilmiştir."}',
    5,
    4,
    'IN_NEGOTIATION',
    now() - interval '3 days'
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    '10000000-0000-0000-0000-000000000003',
    'Kredi Onay Limitlerinde Yetki Aşımı',
    'HIGH',
    'FINAL',
    '{"condition": "Şube müdürünün kredi onay limitinin üzerinde işlem gerçekleştirdiği tespit edilmiştir.", "criteria": "5.000.000 TL limit olmasına rağmen 7.500.000 TL tutarında kredi onayı yapılmıştır."}',
    4,
    3,
    'IN_NEGOTIATION',
    now() - interval '5 days'
  ),
  (
    '22222222-2222-2222-2222-222222222223',
    '10000000-0000-0000-0000-000000000003',
    'Müşteri Bilgileri Güncelleme Prosedürü Eksikliği',
    'MEDIUM',
    'FINAL',
    '{"condition": "Müşteri bilgilerinin güncellenmesinde çift kontrol mekanizması eksik olduğu gözlemlenmiştir.", "criteria": "Bu durum veri bütünlüğü riskine yol açabilir."}',
    3,
    3,
    'AGREED',
    now() - interval '7 days'
  ),
  (
    '22222222-2222-2222-2222-222222222224',
    '10000000-0000-0000-0000-000000000003',
    'BT Sistem Yedekleme Politikası Uygunsuzluğu',
    'HIGH',
    'REMEDIATED',
    '{"condition": "Kritik sistemlerin yedekleme periyodu politikaya uygun değildir.", "criteria": "Günlük yedekleme yerine haftalık yedekleme yapıldığı tespit edilmiştir."}',
    4,
    4,
    'REMEDIATED',
    now() - interval '15 days'
  ),
  (
    '22222222-2222-2222-2222-222222222225',
    '10000000-0000-0000-0000-000000000003',
    'Şifre Politikası Uygunsuzluğu',
    'MEDIUM',
    'FINAL',
    '{"condition": "Kullanıcı şifrelerinin 90 günde bir değiştirilmesi gerekirken bu kontrol yapılmamaktadır.", "criteria": "180 gün üzerinde şifre değiştirmeyen kullanıcılar tespit edilmiştir."}',
    3,
    4,
    'IN_NEGOTIATION',
    now() - interval '2 days'
  )
ON CONFLICT (id) DO NOTHING;

-- Create workflow states for findings
INSERT INTO finding_workflow_states (id, tenant_id, finding_id, current_stage, stage_order, can_auditee_respond, due_date, assigned_role)
VALUES 
  (
    '33333333-3333-3333-3333-333333333331',
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222221',
    'AUDITEE_REVIEWING',
    2,
    true,
    now() + interval '7 days',
    'AUDITEE'
  ),
  (
    '33333333-3333-3333-3333-333333333332',
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    'SENT_TO_AUDITEE',
    2,
    true,
    now() + interval '10 days',
    'AUDITEE'
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222223',
    'AUDITEE_ACCEPTED',
    3,
    false,
    now() + interval '14 days',
    'AUDITOR'
  ),
  (
    '33333333-3333-3333-3333-333333333334',
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222224',
    'REMEDIATION_STARTED',
    10,
    false,
    now() + interval '30 days',
    'AUDITEE'
  ),
  (
    '33333333-3333-3333-3333-333333333335',
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222225',
    'AUDITEE_REVIEWING',
    2,
    true,
    now() + interval '5 days',
    'AUDITEE'
  )
ON CONFLICT (id) DO NOTHING;

-- Sample auditee response (for accepted finding)
INSERT INTO auditee_responses (id, tenant_id, finding_id, workflow_state_id, response_type, response_text, response_date, responded_by, responded_by_name, responded_by_email, is_final)
VALUES 
  (
    '44444444-4444-4444-4444-444444444443',
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222223',
    '33333333-3333-3333-3333-333333333333',
    'ACCEPT',
    'Prosedür güncellemesi yapılacak ve çift kontrol mekanizması devreye alınacaktır. İlgili personele eğitim verilecektir.',
    now() - interval '2 days',
    '00000000-0000-0000-0000-000000000000',
    'Mehmet Yılmaz',
    'mehmet.yilmaz@demobank.com',
    false
  )
ON CONFLICT (id) DO NOTHING;

-- Sample milestones for accepted finding
INSERT INTO response_milestones (id, tenant_id, response_id, finding_id, milestone_title, milestone_description, target_date, status, responsible_person)
VALUES 
  (
    '55555555-5555-5555-5555-555555555551',
    '11111111-1111-1111-1111-111111111111',
    '44444444-4444-4444-4444-444444444443',
    '22222222-2222-2222-2222-222222222223',
    'Prosedür Dokümantasyonu',
    'Yeni prosedür dokümanının hazırlanması ve onaylanması',
    (now() + interval '30 days')::date,
    'IN_PROGRESS',
    'Mehmet Yılmaz'
  ),
  (
    '55555555-5555-5555-5555-555555555552',
    '11111111-1111-1111-1111-111111111111',
    '44444444-4444-4444-4444-444444444443',
    '22222222-2222-2222-2222-222222222223',
    'BT Sistemi Güncelleme',
    'Çift kontrol için sistem geliştirmesi',
    (now() + interval '90 days')::date,
    'PENDING',
    'Ahmet Demir'
  ),
  (
    '55555555-5555-5555-5555-555555555553',
    '11111111-1111-1111-1111-111111111111',
    '44444444-4444-4444-4444-444444444443',
    '22222222-2222-2222-2222-222222222223',
    'Personel Eğitimi',
    'Tüm şube personeline eğitim verilmesi',
    (now() + interval '45 days')::date,
    'PENDING',
    'Ayşe Kaya'
  )
ON CONFLICT (id) DO NOTHING;

-- Sample evidence file
INSERT INTO finding_evidence (id, tenant_id, finding_id, response_id, file_name, file_size, file_type, file_url, uploaded_by, uploaded_by_name, upload_purpose, verified_by_auditor)
VALUES 
  (
    '66666666-6666-6666-6666-666666666661',
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222221',
    NULL,
    'CCTV_Log_Export.pdf',
    2457600,
    'application/pdf',
    '/evidence/cctv_log_export.pdf',
    '00000000-0000-0000-0000-000000000000',
    'Denetim Ekibi',
    'OTHER',
    true
  )
ON CONFLICT (id) DO NOTHING;

-- Workflow transitions
INSERT INTO workflow_transitions (tenant_id, finding_id, from_stage, to_stage, transition_type, triggered_by, reason)
VALUES 
  (
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222221',
    'DRAFT',
    'SENT_TO_AUDITEE',
    'FORWARD',
    '00000000-0000-0000-0000-000000000000',
    'Bulgu denetlenene iletildi'
  ),
  (
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222223',
    'SENT_TO_AUDITEE',
    'AUDITEE_ACCEPTED',
    'FORWARD',
    '00000000-0000-0000-0000-000000000000',
    'Denetlenen bulguyu kabul etti'
  )
ON CONFLICT DO NOTHING;