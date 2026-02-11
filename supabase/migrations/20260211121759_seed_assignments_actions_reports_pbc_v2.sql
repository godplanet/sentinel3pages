/*
  # Seed Assignments, Action Steps, Report Blocks & PBC Requests (v2)

  1. Seeded Tables
    - `assignments` (3 rows) - Finding-to-auditee workflow assignments
    - `action_steps` (4 rows) - Remediation action steps
    - `report_blocks` (6 rows) - Report editor building blocks (created_by = NULL due to auth.users FK)
    - `pbc_requests` (4 rows) - PBC document requests

  2. Notes
    - report_blocks.created_by set to NULL since FK references auth.users (no auth users in dev mode)
    - All other FKs reference existing seed data
*/

-- Assignments
INSERT INTO assignments (id, finding_id, assignee_id, portal_status, workflow_stage, is_locked, priority, created_at, updated_at)
VALUES
  ('d9000000-0000-0000-0000-000000000001',
   'f0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000004',
   'PENDING', 'SELF', false, 'ACIL', now(), now()),
  ('d9000000-0000-0000-0000-000000000002',
   'f0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000005',
   'AGREED', 'SUBMITTED', true, 'ONCELIKLI', now(), now()),
  ('d9000000-0000-0000-0000-000000000003',
   'f0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000004',
   'PENDING', 'DELEGATED', false, 'STANDART', now(), now())
ON CONFLICT (id) DO NOTHING;

-- Action Steps
INSERT INTO action_steps (id, assignment_id, description, due_date, status, created_at)
VALUES
  ('da000000-0000-0000-0000-000000000001',
   'd9000000-0000-0000-0000-000000000001',
   'Kasa limiti prosedurlerini guncellemek ve sube mudurlerine dagitmak',
   '2026-03-15', 'OPEN', now()),
  ('da000000-0000-0000-0000-000000000002',
   'd9000000-0000-0000-0000-000000000001',
   'Otomatik kasa limiti uyari sistemini devreye almak',
   '2026-04-01', 'OPEN', now()),
  ('da000000-0000-0000-0000-000000000003',
   'd9000000-0000-0000-0000-000000000002',
   'Eksik KYC belgelerinin tamamlanmasi icin musteri iletisim planini uygulamak',
   '2026-03-01', 'PENDING_VERIFICATION', now()),
  ('da000000-0000-0000-0000-000000000004',
   'd9000000-0000-0000-0000-000000000003',
   'Murabaha hesaplama motorundaki formul hatasini BT ile duzeltmek',
   '2026-03-30', 'OPEN', now())
ON CONFLICT (id) DO NOTHING;

-- Report Blocks (created_by = NULL, no auth.users in dev)
INSERT INTO report_blocks (id, tenant_id, report_id, position_index, parent_block_id, depth_level, block_type, content, created_by, created_at, updated_at)
VALUES
  ('db000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111',
   'd0000000-0000-0000-0000-000000000001', 0, NULL, 0, 'heading',
   '{"text": "Hazine Uyum Denetimi Raporu", "level": 1}'::jsonb,
   NULL, now(), now()),
  ('db000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111',
   'd0000000-0000-0000-0000-000000000001', 1, NULL, 0, 'paragraph',
   '{"text": "Bu rapor, Hazine operasyonlarinin mevzuat uyumu ve ic kontrol etkinligi hakkinda bagimsiz guvence saglamak amaciyla hazirlanmistir."}'::jsonb,
   NULL, now(), now()),
  ('db000000-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111',
   'd0000000-0000-0000-0000-000000000001', 2, NULL, 0, 'heading',
   '{"text": "Yonetici Ozeti", "level": 2}'::jsonb,
   NULL, now(), now()),
  ('db000000-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111',
   'd0000000-0000-0000-0000-000000000001', 3, NULL, 0, 'dynamic_metric',
   '{"metric": "finding_count", "label": "Toplam Bulgu Sayisi", "source": "audit_findings"}'::jsonb,
   NULL, now(), now()),
  ('db000000-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111',
   'd0000000-0000-0000-0000-000000000001', 4, NULL, 0, 'heading',
   '{"text": "Bulgular", "level": 2}'::jsonb,
   NULL, now(), now()),
  ('db000000-0000-0000-0000-000000000006', '11111111-1111-1111-1111-111111111111',
   'd0000000-0000-0000-0000-000000000001', 5, NULL, 1, 'finding_ref',
   '{"finding_id": "f0000000-0000-0000-0000-000000000001", "display": "full"}'::jsonb,
   NULL, now(), now())
ON CONFLICT (id) DO NOTHING;

-- PBC Requests
INSERT INTO pbc_requests (id, engagement_id, subject, description, responsible_unit, due_date, status, notes, created_at, updated_at)
VALUES
  ('dc000000-0000-0000-0000-000000000001',
   'e0000000-0000-0000-0000-000000000001',
   'Kasa Sayim Tutanaklari', 'Son 3 ayin gunluk kasa sayim tutanaklari',
   'Sube Operasyonlari', '2026-02-28', 'Bekliyor', '', now(), now()),
  ('dc000000-0000-0000-0000-000000000002',
   'e0000000-0000-0000-0000-000000000001',
   'Yetki Matrisi', 'Guncel sube personeli yetki ve limit tablosu',
   'Insan Kaynaklari', '2026-02-20', 'Bekliyor', '', now(), now()),
  ('dc000000-0000-0000-0000-000000000003',
   'e0000000-0000-0000-0000-000000000002',
   'Penetrasyon Testi Raporu', '2025 yili penetrasyon testi sonuc raporu',
   'Bilgi Guvenligi', '2026-03-01', 'Bekliyor', '', now(), now()),
  ('dc000000-0000-0000-0000-000000000004',
   'e0000000-0000-0000-0000-000000000003',
   'Hazine Islem Kayitlari', 'Son 6 ayin hazine islem detay dokumu',
   'Hazine Mudurlugu', '2026-02-25', 'Bekliyor', '', now(), now())
ON CONFLICT (id) DO NOTHING;
