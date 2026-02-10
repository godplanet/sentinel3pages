/*
  # Create Automation Engine (Sentinel Cortex) Module

  1. New Tables
    - `automation_rules` - IFTTT-style automation rule definitions
      - `id` (uuid, PK)
      - `tenant_id` (uuid, FK tenants)
      - `title` (text) - Human-readable rule name
      - `description` (text) - Detailed explanation
      - `trigger_event` (text) - FINDING_CREATED, RISK_CHANGED, DUE_DATE_PASSED, AUDIT_STARTED, ASSESSMENT_COMPLETED, STATUS_CHANGED
      - `conditions` (jsonb) - Filter conditions as structured JSON
      - `actions` (jsonb) - Array of actions to execute
      - `is_active` (boolean) - Toggle on/off
      - `priority` (integer) - Execution order
      - `last_triggered_at` (timestamptz)
      - `execution_count` (integer)
      - `created_by` (text)
    - `automation_logs` - Execution audit trail
      - `id` (uuid, PK)
      - `tenant_id` (uuid, FK tenants)
      - `rule_id` (uuid, FK automation_rules)
      - `rule_title` (text) - Snapshot of rule title at execution time
      - `trigger_event` (text)
      - `trigger_context` (jsonb) - The data payload that triggered
      - `conditions_evaluated` (jsonb) - Which conditions matched
      - `actions_executed` (jsonb) - Results per action
      - `action_result` (text) - Summary text
      - `status` (text) - Success, Failed, Skipped, Simulated
      - `duration_ms` (integer) - Execution time
      - `is_simulation` (boolean) - Test run flag

  2. Security
    - RLS enabled on both tables
    - Dev-mode anon CRUD policies
    - Authenticated tenant-scoped read policies

  3. Seed Data
    - 6 realistic banking automation rules
    - 12 execution log entries with realistic outcomes
*/

-- ============================================================
-- TABLE: automation_rules
-- ============================================================
CREATE TABLE IF NOT EXISTS automation_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111' REFERENCES tenants(id),
  title text NOT NULL,
  description text,
  trigger_event text NOT NULL,
  conditions jsonb NOT NULL DEFAULT '{}',
  actions jsonb NOT NULL DEFAULT '[]',
  is_active boolean NOT NULL DEFAULT true,
  priority integer NOT NULL DEFAULT 50,
  last_triggered_at timestamptz,
  execution_count integer NOT NULL DEFAULT 0,
  created_by text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT auto_r_trigger_check CHECK (trigger_event IN (
    'FINDING_CREATED','RISK_CHANGED','DUE_DATE_PASSED',
    'AUDIT_STARTED','ASSESSMENT_COMPLETED','STATUS_CHANGED',
    'WORKPAPER_SIGNED','ACTION_OVERDUE','VENDOR_REVIEW_DUE'
  )),
  CONSTRAINT auto_r_priority_range CHECK (priority >= 1 AND priority <= 100)
);

CREATE INDEX IF NOT EXISTS idx_auto_r_tenant ON automation_rules(tenant_id);
CREATE INDEX IF NOT EXISTS idx_auto_r_trigger ON automation_rules(trigger_event);
CREATE INDEX IF NOT EXISTS idx_auto_r_active ON automation_rules(is_active);

ALTER TABLE automation_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon can read rules (dev)"
  ON automation_rules FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can insert rules (dev)"
  ON automation_rules FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon can update rules (dev)"
  ON automation_rules FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon can delete rules (dev)"
  ON automation_rules FOR DELETE TO anon USING (true);
CREATE POLICY "Auth users read own tenant rules"
  ON automation_rules FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()));

-- ============================================================
-- TABLE: automation_logs
-- ============================================================
CREATE TABLE IF NOT EXISTS automation_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111' REFERENCES tenants(id),
  rule_id uuid REFERENCES automation_rules(id) ON DELETE SET NULL,
  rule_title text,
  trigger_event text,
  trigger_context jsonb,
  conditions_evaluated jsonb,
  actions_executed jsonb,
  action_result text,
  status text NOT NULL DEFAULT 'Success',
  duration_ms integer DEFAULT 0,
  is_simulation boolean NOT NULL DEFAULT false,
  executed_at timestamptz DEFAULT now(),
  CONSTRAINT auto_l_status_check CHECK (status IN ('Success','Failed','Skipped','Simulated'))
);

CREATE INDEX IF NOT EXISTS idx_auto_l_tenant ON automation_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_auto_l_rule ON automation_logs(rule_id);
CREATE INDEX IF NOT EXISTS idx_auto_l_status ON automation_logs(status);
CREATE INDEX IF NOT EXISTS idx_auto_l_exec ON automation_logs(executed_at DESC);

ALTER TABLE automation_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon can read logs (dev)"
  ON automation_logs FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can insert logs (dev)"
  ON automation_logs FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon can update logs (dev)"
  ON automation_logs FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon can delete logs (dev)"
  ON automation_logs FOR DELETE TO anon USING (true);
CREATE POLICY "Auth users read own tenant logs"
  ON automation_logs FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()));

-- ============================================================
-- SEED DATA
-- ============================================================
DO $$
DECLARE
  t_id uuid := '11111111-1111-1111-1111-111111111111';
  r1 uuid := gen_random_uuid();
  r2 uuid := gen_random_uuid();
  r3 uuid := gen_random_uuid();
  r4 uuid := gen_random_uuid();
  r5 uuid := gen_random_uuid();
  r6 uuid := gen_random_uuid();
BEGIN
  -- ========== RULES (6) ==========
  INSERT INTO automation_rules (id, tenant_id, title, description, trigger_event, conditions, actions, is_active, priority, execution_count, last_triggered_at, created_by) VALUES
    (r1, t_id,
     'Kritik Bulgulari Baskana Bildir',
     'Kritik risk seviyesinde yeni bir bulgu olusturuldugunda Denetim Baskanina aninda bildirim gonder ve acil inceleme gorevi olustur.',
     'FINDING_CREATED',
     '{"risk_level": "Critical", "operator": "equals"}',
     '[{"type": "SEND_NOTIFICATION", "target": "AUDIT_PRESIDENT", "message": "Yeni bir Kritik Bulgu tespit edildi! Acil inceleme gerekiyor."}, {"type": "CREATE_TASK", "task_title": "Acil Inceleme Baslat", "assignee": "AUDIT_PRESIDENT", "priority": "urgent"}]',
     true, 10, 23,
     now() - interval '2 minutes',
     'Dr. Ahmet Korkmaz'),

    (r2, t_id,
     'Gecikmis Aksiyonlari Isaretle',
     'Aksiyon suresi dolan kalemleri otomatik olarak "Overdue" olarak isaretle ve ilgili aksiyoner ile yoneticiye hatirlatma e-postasi gonder.',
     'DUE_DATE_PASSED',
     '{"days_overdue": 1, "operator": "gte"}',
     '[{"type": "UPDATE_STATUS", "field": "status", "value": "Overdue"}, {"type": "SEND_EMAIL", "template": "reminder_urgent", "to_role": "ACTION_OWNER"}, {"type": "SEND_EMAIL", "template": "escalation_notice", "to_role": "DEPARTMENT_HEAD"}]',
     true, 20, 47,
     now() - interval '6 hours',
     'Sistem'),

    (r3, t_id,
     'BT Denetimlerinde CISO Onayi Iste',
     'Bilgi Teknolojileri kategorisindeki denetimlere otomatik olarak CISO gozetim onayi ata.',
     'AUDIT_STARTED',
     '{"category": "Information Technology", "operator": "equals"}',
     '[{"type": "ASSIGN_REVIEWER", "role": "CISO", "review_type": "oversight"}, {"type": "SEND_NOTIFICATION", "target": "CISO", "message": "Yeni BT denetimi baslatildi. Gozetim onayiniz bekleniyor."}]',
     true, 30, 8,
     now() - interval '3 days',
     'Dr. Ahmet Korkmaz'),

    (r4, t_id,
     'Yuksek Riskli Birim Degisikliklerini Kaydet',
     'Denetim evrenindeki birimlerin risk skorunda %20 uzerinde artis olustugunda uyari gonder ve risk komitesini bilgilendir.',
     'RISK_CHANGED',
     '{"change_percent": 20, "direction": "increase", "operator": "gte"}',
     '[{"type": "SEND_NOTIFICATION", "target": "RISK_COMMITTEE", "message": "Birim risk skorunda onemli artis tespit edildi."}, {"type": "CREATE_TASK", "task_title": "Risk Degisikligi Analizi", "assignee": "RISK_OFFICER"}]',
     true, 15, 12,
     now() - interval '1 day',
     'Sistem'),

    (r5, t_id,
     'Tedarikcier Degerlendirme Hatirlatmasi',
     'Tedarikcier degerlendirme anketinin bitis tarihine 14 gun kala otomatik hatirlatma gonder.',
     'VENDOR_REVIEW_DUE',
     '{"days_before_due": 14, "operator": "lte"}',
     '[{"type": "SEND_EMAIL", "template": "vendor_assessment_reminder", "to_role": "VENDOR_MANAGER"}, {"type": "SEND_NOTIFICATION", "target": "COMPLIANCE_TEAM", "message": "Tedarikcier degerlendirmesi yaklasıyor."}]',
     false, 40, 3,
     now() - interval '2 weeks',
     'Fatma Ozturk'),

    (r6, t_id,
     'Calisma Kagidi Onay Sonrasi Kilit',
     'Calisma kagidi tum onaylardan gectikten sonra otomatik olarak kilitle ve raporlama modulune bildir.',
     'WORKPAPER_SIGNED',
     '{"all_approvals_complete": true, "operator": "equals"}',
     '[{"type": "UPDATE_STATUS", "field": "locked", "value": true}, {"type": "SEND_NOTIFICATION", "target": "REPORT_MANAGER", "message": "Calisma kagidi onaylandi ve kilitlendi. Rapora dahil edilebilir."}]',
     true, 50, 31,
     now() - interval '5 hours',
     'Sistem');

  -- ========== LOGS (12) ==========
  INSERT INTO automation_logs (tenant_id, rule_id, rule_title, trigger_event, trigger_context, conditions_evaluated, actions_executed, action_result, status, duration_ms, is_simulation, executed_at) VALUES
    (t_id, r1, 'Kritik Bulgulari Baskana Bildir', 'FINDING_CREATED',
     '{"finding_id": "f-001", "title": "SQL Injection Zafiyeti", "risk_level": "Critical", "department": "IT"}',
     '{"risk_level": {"expected": "Critical", "actual": "Critical", "match": true}}',
     '[{"type": "SEND_NOTIFICATION", "result": "delivered"}, {"type": "CREATE_TASK", "result": "task_created", "task_id": "t-091"}]',
     'Bildirim gonderildi: Dr. Ahmet Korkmaz. Gorev olusturuldu: t-091',
     'Success', 145, false, now() - interval '2 minutes'),

    (t_id, r1, 'Kritik Bulgulari Baskana Bildir', 'FINDING_CREATED',
     '{"finding_id": "f-002", "title": "Yetkisiz Erisim Tespit", "risk_level": "Critical", "department": "Operations"}',
     '{"risk_level": {"expected": "Critical", "actual": "Critical", "match": true}}',
     '[{"type": "SEND_NOTIFICATION", "result": "delivered"}, {"type": "CREATE_TASK", "result": "task_created", "task_id": "t-092"}]',
     'Bildirim gonderildi. Gorev olusturuldu: t-092',
     'Success', 132, false, now() - interval '1 day'),

    (t_id, r2, 'Gecikmis Aksiyonlari Isaretle', 'DUE_DATE_PASSED',
     '{"action_id": "a-015", "title": "Firewall Kurali Guncelleme", "days_overdue": 3}',
     '{"days_overdue": {"expected": 1, "actual": 3, "match": true}}',
     '[{"type": "UPDATE_STATUS", "result": "updated"}, {"type": "SEND_EMAIL", "result": "sent_to_owner"}, {"type": "SEND_EMAIL", "result": "sent_to_head"}]',
     'Durum Overdue olarak guncellendi. 2 e-posta gonderildi.',
     'Success', 210, false, now() - interval '6 hours'),

    (t_id, r2, 'Gecikmis Aksiyonlari Isaretle', 'DUE_DATE_PASSED',
     '{"action_id": "a-022", "title": "KYC Sureci Iyilestirme", "days_overdue": 7}',
     '{"days_overdue": {"expected": 1, "actual": 7, "match": true}}',
     '[{"type": "UPDATE_STATUS", "result": "updated"}, {"type": "SEND_EMAIL", "result": "sent_to_owner"}, {"type": "SEND_EMAIL", "result": "sent_to_head"}]',
     'Durum Overdue olarak guncellendi. Eskalasyon bildirimi gonderildi.',
     'Success', 198, false, now() - interval '12 hours'),

    (t_id, r3, 'BT Denetimlerinde CISO Onayi Iste', 'AUDIT_STARTED',
     '{"audit_id": "aud-005", "title": "Siber Guvenlik Denetimi 2026", "category": "Information Technology"}',
     '{"category": {"expected": "Information Technology", "actual": "Information Technology", "match": true}}',
     '[{"type": "ASSIGN_REVIEWER", "result": "assigned", "reviewer": "Murat Bey (CISO)"}, {"type": "SEND_NOTIFICATION", "result": "delivered"}]',
     'CISO atandi: Murat Bey. Bildirim gonderildi.',
     'Success', 87, false, now() - interval '3 days'),

    (t_id, r4, 'Yuksek Riskli Birim Degisikliklerini Kaydet', 'RISK_CHANGED',
     '{"entity_id": "e-012", "entity_name": "Dijital Bankacilik", "old_score": 45, "new_score": 72, "change_percent": 60}',
     '{"change_percent": {"expected": 20, "actual": 60, "match": true}, "direction": {"expected": "increase", "actual": "increase", "match": true}}',
     '[{"type": "SEND_NOTIFICATION", "result": "delivered"}, {"type": "CREATE_TASK", "result": "task_created"}]',
     'Risk Komitesi bilgilendirildi. Analiz gorevi olusturuldu.',
     'Success', 156, false, now() - interval '1 day'),

    (t_id, r6, 'Calisma Kagidi Onay Sonrasi Kilit', 'WORKPAPER_SIGNED',
     '{"workpaper_id": "wp-033", "title": "Kredi Sureci Kontrol Testleri", "all_approvals_complete": true}',
     '{"all_approvals_complete": {"expected": true, "actual": true, "match": true}}',
     '[{"type": "UPDATE_STATUS", "result": "locked"}, {"type": "SEND_NOTIFICATION", "result": "delivered"}]',
     'Calisma kagidi kilitlendi. Rapor yoneticisi bilgilendirildi.',
     'Success', 92, false, now() - interval '5 hours'),

    (t_id, r6, 'Calisma Kagidi Onay Sonrasi Kilit', 'WORKPAPER_SIGNED',
     '{"workpaper_id": "wp-034", "title": "Operasyonel Risk Degerlendirmesi", "all_approvals_complete": true}',
     '{"all_approvals_complete": {"expected": true, "actual": true, "match": true}}',
     '[{"type": "UPDATE_STATUS", "result": "locked"}, {"type": "SEND_NOTIFICATION", "result": "delivered"}]',
     'Calisma kagidi kilitlendi.',
     'Success', 78, false, now() - interval '8 hours'),

    (t_id, r1, 'Kritik Bulgulari Baskana Bildir', 'FINDING_CREATED',
     '{"finding_id": "f-sim-001", "title": "Test: Simule Kritik Bulgu", "risk_level": "Critical"}',
     '{"risk_level": {"expected": "Critical", "actual": "Critical", "match": true}}',
     '[{"type": "SEND_NOTIFICATION", "result": "simulated"}, {"type": "CREATE_TASK", "result": "simulated"}]',
     'SIMULASYON: Kural ateslenirdi. 2 aksiyon calisitirilirdi.',
     'Simulated', 12, true, now() - interval '30 minutes'),

    (t_id, r2, 'Gecikmis Aksiyonlari Isaretle', 'DUE_DATE_PASSED',
     '{"action_id": "a-sim-001", "title": "Test: 0 gun gecikme", "days_overdue": 0}',
     '{"days_overdue": {"expected": 1, "actual": 0, "match": false}}',
     '[]',
     'SIMULASYON: Kosul eslesmedi. Kural ateslemezdi.',
     'Simulated', 8, true, now() - interval '45 minutes'),

    (t_id, r3, 'BT Denetimlerinde CISO Onayi Iste', 'AUDIT_STARTED',
     '{"audit_id": "aud-fail", "title": "Kredi Operasyonlari Denetimi", "category": "Credit Operations"}',
     '{"category": {"expected": "Information Technology", "actual": "Credit Operations", "match": false}}',
     '[]',
     'Kosul eslesmedi: Kategori BT degil. Kural atlanacak.',
     'Skipped', 15, false, now() - interval '2 days'),

    (t_id, r2, 'Gecikmis Aksiyonlari Isaretle', 'DUE_DATE_PASSED',
     '{"action_id": "a-030", "title": "SWIFT Guncelleme"}',
     '{"days_overdue": {"expected": 1, "actual": 2, "match": true}}',
     '[{"type": "UPDATE_STATUS", "result": "error", "message": "DB connection timeout"}]',
     'Hata: Veritabani baglanti zaman asimi.',
     'Failed', 5023, false, now() - interval '18 hours');
END $$;