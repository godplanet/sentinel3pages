/*
  # Create Action Management Module Schema + Seed Data

  1. New Tables
    - `actions` - Remediation actions linked to findings
      - `id` (uuid, PK), `tenant_id`, `finding_id` (FK), `finding_snapshot`, `assignee_unit_name`, `assignee_user_id`, `auditor_owner_id`, `original_due_date`, `current_due_date`, `closed_at`, `status`, `auto_fix_config`, `title`, `description`, `priority`, `cost_estimation`, `created_at`, `updated_at`, `created_by`
    - `action_evidence` - Evidence/attachments for action completion
      - `id` (uuid, PK), `tenant_id`, `action_id` (FK), `file_name`, `storage_path`, `file_size`, `mime_type`, `file_hash`, `description`, `uploaded_by`, `created_at`
    - `action_requests` - Extension/waiver requests for actions
      - `id` (uuid, PK), `tenant_id`, `action_id` (FK), `type`, `requested_date`, `justification`, `impact_analysis`, `status`, `reviewer_id`, `reviewer_comments`, `reviewed_at`, `requested_by`, `created_at`, `updated_at`
    - `action_logs` - Audit trail of action status changes
      - `id` (uuid, PK), `tenant_id`, `action_id` (FK), `event_type`, `previous_status`, `new_status`, `description`, `metadata`, `actor_id`, `actor_role`, `created_at`

  2. Views
    - `view_action_aging` - Computed view for action aging analytics

  3. Security
    - RLS enabled on all tables
    - Permissive anon policies for demo environment

  4. Seed Data
    - 5 actions (various statuses), evidence, requests, and logs
*/

-- actions
CREATE TABLE IF NOT EXISTS actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111',
  finding_id uuid REFERENCES audit_findings(id) ON DELETE SET NULL,
  finding_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  assignee_unit_name text,
  assignee_user_id uuid,
  auditor_owner_id uuid,
  original_due_date date NOT NULL DEFAULT (now() + interval '30 days'),
  current_due_date date NOT NULL DEFAULT (now() + interval '30 days'),
  closed_at timestamptz,
  status text NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'PENDING_VERIFICATION', 'CLOSED', 'OVERDUE', 'WAIVED')),
  auto_fix_config jsonb,
  title text NOT NULL DEFAULT '',
  description text DEFAULT '',
  priority text NOT NULL DEFAULT 'MEDIUM' CHECK (priority IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
  cost_estimation numeric(12,2),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid
);

ALTER TABLE actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_actions_select" ON actions FOR SELECT TO anon USING (true);
CREATE POLICY "anon_actions_insert" ON actions FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_actions_update" ON actions FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_actions_delete" ON actions FOR DELETE TO anon USING (true);

-- action_evidence
CREATE TABLE IF NOT EXISTS action_evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111',
  action_id uuid NOT NULL REFERENCES actions(id) ON DELETE CASCADE,
  file_name text NOT NULL DEFAULT '',
  storage_path text NOT NULL DEFAULT '',
  file_size integer DEFAULT 0,
  mime_type text DEFAULT '',
  file_hash text NOT NULL DEFAULT '',
  description text DEFAULT '',
  uploaded_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE action_evidence ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_action_evidence_select" ON action_evidence FOR SELECT TO anon USING (true);
CREATE POLICY "anon_action_evidence_insert" ON action_evidence FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_action_evidence_delete" ON action_evidence FOR DELETE TO anon USING (true);

-- action_requests
CREATE TABLE IF NOT EXISTS action_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111',
  action_id uuid NOT NULL REFERENCES actions(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'EXTENSION' CHECK (type IN ('EXTENSION', 'WAIVER', 'REASSIGNMENT', 'SCOPE_CHANGE')),
  requested_date date,
  justification text NOT NULL DEFAULT '',
  impact_analysis text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewer_id uuid,
  reviewer_comments text,
  reviewed_at timestamptz,
  requested_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE action_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_action_requests_select" ON action_requests FOR SELECT TO anon USING (true);
CREATE POLICY "anon_action_requests_insert" ON action_requests FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_action_requests_update" ON action_requests FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- action_logs
CREATE TABLE IF NOT EXISTS action_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111',
  action_id uuid NOT NULL REFERENCES actions(id) ON DELETE CASCADE,
  event_type text NOT NULL DEFAULT '',
  previous_status text,
  new_status text,
  description text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  actor_id uuid,
  actor_role text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE action_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_action_logs_select" ON action_logs FOR SELECT TO anon USING (true);
CREATE POLICY "anon_action_logs_insert" ON action_logs FOR INSERT TO anon WITH CHECK (true);

-- view_action_aging (computed analytics view)
CREATE OR REPLACE VIEW view_action_aging AS
SELECT
  a.id,
  a.tenant_id,
  a.finding_id,
  a.title,
  a.status,
  a.priority,
  a.assignee_unit_name,
  a.assignee_user_id,
  a.original_due_date,
  a.current_due_date,
  a.created_at,
  EXTRACT(DAY FROM now() - a.created_at)::integer AS age_from_detection,
  GREATEST(0, EXTRACT(DAY FROM now() - a.current_due_date))::integer AS performance_delay_days,
  GREATEST(0, EXTRACT(DAY FROM now() - a.original_due_date))::integer AS operational_overdue_days,
  EXTRACT(DAY FROM a.current_due_date::timestamptz - a.original_due_date::timestamptz)::integer AS extension_days,
  (now() > a.original_due_date::timestamptz) AS is_operationally_overdue,
  (now() > a.current_due_date::timestamptz) AS is_performance_delayed,
  COALESCE(ev.evidence_count, 0)::integer AS evidence_count,
  COALESCE(rq.pending_requests, 0)::integer AS pending_requests
FROM actions a
LEFT JOIN (
  SELECT action_id, count(*) AS evidence_count FROM action_evidence GROUP BY action_id
) ev ON ev.action_id = a.id
LEFT JOIN (
  SELECT action_id, count(*) AS pending_requests FROM action_requests WHERE status = 'pending' GROUP BY action_id
) rq ON rq.action_id = a.id;

-- ===== SEED DATA =====

-- 5 Actions assigned to auditee users
INSERT INTO actions (id, tenant_id, finding_id, finding_snapshot, assignee_unit_name, assignee_user_id, auditor_owner_id, original_due_date, current_due_date, status, title, description, priority, cost_estimation) VALUES
  ('ab100000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111',
   'f0000000-0000-0000-0000-000000000001',
   '{"finding_id": "f0000000-0000-0000-0000-000000000001", "title": "Kasa Limiti Asimi", "severity": "HIGH", "risk_rating": 78}'::jsonb,
   'Sube Operasyonlari', 'a0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001',
   '2026-03-15', '2026-03-15', 'OPEN',
   'Kasa limiti kontrol prosedurunu guncellemek', 'Tum subelerde kasa limiti asimina karsi otomatik uyari mekanizmasi kurulmasi', 'HIGH', 25000),
  ('ab100000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111',
   'f0000000-0000-0000-0000-000000000001',
   '{"finding_id": "f0000000-0000-0000-0000-000000000001", "title": "Kasa Limiti Asimi", "severity": "HIGH", "risk_rating": 78}'::jsonb,
   'Bilgi Teknolojileri', 'a0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001',
   '2026-04-01', '2026-04-01', 'IN_PROGRESS',
   'Otomatik kasa limiti uyari sistemi gelistirmek', 'Core bankacilik sistemine entegre kasa limiti kontrol modulu gelistirilmesi', 'HIGH', 150000),
  ('ab100000-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111',
   'f0000000-0000-0000-0000-000000000002',
   '{"finding_id": "f0000000-0000-0000-0000-000000000002", "title": "KYC Eksikligi", "severity": "MEDIUM", "risk_rating": 62}'::jsonb,
   'Uyum Birimi', 'a0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000002',
   '2026-03-01', '2026-03-15', 'OPEN',
   'Eksik KYC belgelerini tamamlamak', 'Eksik kimlik dogrulama belgelerinin musteri iletisim plani cercevesinde tamamlanmasi', 'MEDIUM', 5000),
  ('ab100000-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111',
   'f0000000-0000-0000-0000-000000000002',
   '{"finding_id": "f0000000-0000-0000-0000-000000000002", "title": "KYC Eksikligi", "severity": "MEDIUM", "risk_rating": 62}'::jsonb,
   'Insan Kaynaklari', 'a0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000002',
   '2026-02-28', '2026-02-28', 'PENDING_VERIFICATION',
   'KYC egitim programi duzenlemek', 'Tum sube personeline KYC/AML mevzuat egitimi verilmesi', 'MEDIUM', 12000),
  ('ab100000-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111',
   'f0000000-0000-0000-0000-000000000003',
   '{"finding_id": "f0000000-0000-0000-0000-000000000003", "title": "Murabaha Hesaplama Hatasi", "severity": "HIGH", "risk_rating": 85}'::jsonb,
   'Bilgi Teknolojileri', 'a0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000003',
   '2026-03-30', '2026-03-30', 'OPEN',
   'Murabaha hesaplama motorunu duzeltmek', 'Faizsiz bankacilik urunlerindeki hesaplama formul hatasinin giderilmesi', 'CRITICAL', 80000);

-- Action Evidence
INSERT INTO action_evidence (id, tenant_id, action_id, file_name, storage_path, file_size, mime_type, file_hash, description) VALUES
  ('ab200000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111',
   'ab100000-0000-0000-0000-000000000002', 'kasa_modul_tasarim.pdf', '/evidence/actions/kasa_modul_tasarim.pdf',
   2457600, 'application/pdf', 'sha256:abc123def456', 'BT ekibinin hazirladigi kasa limiti kontrol modulu teknik tasarim dokumani'),
  ('ab200000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111',
   'ab100000-0000-0000-0000-000000000004', 'kyc_egitim_plan.xlsx', '/evidence/actions/kyc_egitim_plan.xlsx',
   184320, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'sha256:fed987cba654', 'KYC/AML egitim takvimi ve katilimci listesi');

-- Action Requests (1 extension request)
INSERT INTO action_requests (id, tenant_id, action_id, type, requested_date, justification, impact_analysis, status, requested_by) VALUES
  ('ab300000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111',
   'ab100000-0000-0000-0000-000000000003', 'EXTENSION', '2026-03-15',
   'Musteri iletisim sureci beklenenden uzun surmektedir. 200 musteriye SMS ve e-posta gonderildi ancak geri donus orani dusuk.',
   'Ek 2 hafta ile eksik belgelerin %80 inin tamamlanmasi beklenmektedir. Kalan %20 icin hukuki surec baslatilabilir.',
   'approved', 'a0000000-0000-0000-0000-000000000002');

-- Action Logs
INSERT INTO action_logs (id, tenant_id, action_id, event_type, previous_status, new_status, description, metadata, actor_id, actor_role) VALUES
  ('ab400000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111',
   'ab100000-0000-0000-0000-000000000001', 'STATUS_CHANGE', NULL, 'OPEN',
   'Aksiyon olusturuldu', '{"source": "finding_workflow"}'::jsonb, 'a0000000-0000-0000-0000-000000000001', 'AUDITOR'),
  ('ab400000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111',
   'ab100000-0000-0000-0000-000000000002', 'STATUS_CHANGE', 'OPEN', 'IN_PROGRESS',
   'BT ekibi gelistirmeye basladi', '{"developer": "Mehmet K."}'::jsonb, 'a0000000-0000-0000-0000-000000000005', 'AUDITEE'),
  ('ab400000-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111',
   'ab100000-0000-0000-0000-000000000004', 'STATUS_CHANGE', 'IN_PROGRESS', 'PENDING_VERIFICATION',
   'Egitim tamamlandi, dogrulama bekleniyor', '{"attendee_count": 45}'::jsonb, 'a0000000-0000-0000-0000-000000000005', 'AUDITEE'),
  ('ab400000-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111',
   'ab100000-0000-0000-0000-000000000003', 'EXTENSION_APPROVED', NULL, NULL,
   'Sure uzatma talebi onaylandi: 2026-03-15', '{"old_due": "2026-03-01", "new_due": "2026-03-15"}'::jsonb, 'a0000000-0000-0000-0000-000000000002', 'AUDITOR');
