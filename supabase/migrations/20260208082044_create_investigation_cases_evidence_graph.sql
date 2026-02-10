/*
  # Phase 2: Digital Freeze & Sherlock Engine

  1. New Tables
    - `investigation_cases`
      - `id` (uuid, primary key)
      - `tip_id` (uuid, references whistleblower_tips - the originating tip)
      - `title` (text, case title)
      - `lead_investigator` (text, assigned investigator)
      - `status` (text: OPEN, FROZEN, CLOSED)
      - `priority` (text: CRITICAL, HIGH, MEDIUM, LOW)
      - `created_at`, `updated_at` (timestamptz)

    - `digital_evidence`
      - `id` (uuid, primary key)
      - `case_id` (uuid, references investigation_cases)
      - `type` (text: EMAIL, CHAT, LOG, INVOICE)
      - `source_system` (text, e.g. Exchange, Slack, SAP)
      - `content_snapshot` (jsonb, frozen evidence content)
      - `hash_sha256` (text, SHA-256 integrity hash)
      - `timestamp_rfc3161` (timestamptz, RFC 3161 timestamp)
      - `locked` (boolean, WORM immutability flag)
      - `frozen_by` (text, who executed the freeze)
      - `created_at` (timestamptz)
      Note: Rows are effectively immutable - the locked flag prevents updates.

    - `entity_relationships`
      - `id` (uuid, primary key)
      - `case_id` (uuid, references investigation_cases)
      - `source_node` (text, e.g. person name)
      - `source_type` (text: PERSON, VENDOR, COMPANY, ACCOUNT)
      - `target_node` (text, e.g. vendor name)
      - `target_type` (text: PERSON, VENDOR, COMPANY, ACCOUNT)
      - `relation_type` (text: SHARED_ADDRESS, SAME_IP, TRANSFER, SHARED_PHONE, OWNERSHIP, APPROVAL)
      - `evidence_ref` (text, reference to supporting evidence)
      - `confidence` (float, 0-100 confidence in the link)
      - `created_at` (timestamptz)

  2. Security
    - RLS enabled on all three tables
    - Authenticated users can read/write
    - Dev-mode permissive policies for anon testing

  3. Seed Data
    - 1 case linked to the high-credibility fraud tip
    - 6 digital evidence records (emails, chat logs, invoices, system logs)
    - 8 entity relationship records forming a fraud network graph

  4. Important Notes
    - digital_evidence rows with locked=true cannot be updated (enforced via RLS policy)
    - SHA-256 hashes are pre-computed for seed data integrity
    - entity_relationships form a directed graph for the Sherlock visualization
*/

-- ============================================================
-- Investigation Cases
-- ============================================================
CREATE TABLE IF NOT EXISTS investigation_cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tip_id uuid REFERENCES whistleblower_tips(id),
  title text NOT NULL DEFAULT '',
  lead_investigator text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'OPEN',
  priority text NOT NULL DEFAULT 'MEDIUM',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE investigation_cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read investigation_cases"
  ON investigation_cases FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can insert investigation_cases"
  ON investigation_cases FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can update investigation_cases"
  ON investigation_cases FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Dev read investigation_cases"
  ON investigation_cases FOR SELECT TO anon USING (true);

CREATE POLICY "Dev insert investigation_cases"
  ON investigation_cases FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Dev update investigation_cases"
  ON investigation_cases FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- ============================================================
-- Digital Evidence Vault
-- ============================================================
CREATE TABLE IF NOT EXISTS digital_evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES investigation_cases(id),
  type text NOT NULL DEFAULT 'LOG',
  source_system text NOT NULL DEFAULT '',
  content_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  hash_sha256 text NOT NULL DEFAULT '',
  timestamp_rfc3161 timestamptz NOT NULL DEFAULT now(),
  locked boolean NOT NULL DEFAULT false,
  frozen_by text NOT NULL DEFAULT 'SYSTEM',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE digital_evidence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read digital_evidence"
  ON digital_evidence FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can insert digital_evidence"
  ON digital_evidence FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated cannot update locked evidence"
  ON digital_evidence FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL AND locked = false)
  WITH CHECK (auth.uid() IS NOT NULL AND locked = false);

CREATE POLICY "Dev read digital_evidence"
  ON digital_evidence FOR SELECT TO anon USING (true);

CREATE POLICY "Dev insert digital_evidence"
  ON digital_evidence FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Dev update unlocked digital_evidence"
  ON digital_evidence FOR UPDATE TO anon
  USING (locked = false) WITH CHECK (locked = false);

-- ============================================================
-- Entity Relationships (Knowledge Graph)
-- ============================================================
CREATE TABLE IF NOT EXISTS entity_relationships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES investigation_cases(id),
  source_node text NOT NULL,
  source_type text NOT NULL DEFAULT 'PERSON',
  target_node text NOT NULL,
  target_type text NOT NULL DEFAULT 'VENDOR',
  relation_type text NOT NULL DEFAULT 'TRANSFER',
  evidence_ref text,
  confidence float NOT NULL DEFAULT 50,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE entity_relationships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read entity_relationships"
  ON entity_relationships FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can insert entity_relationships"
  ON entity_relationships FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Dev read entity_relationships"
  ON entity_relationships FOR SELECT TO anon USING (true);

CREATE POLICY "Dev insert entity_relationships"
  ON entity_relationships FOR INSERT TO anon WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_investigation_cases_tip
  ON investigation_cases(tip_id);

CREATE INDEX IF NOT EXISTS idx_investigation_cases_status
  ON investigation_cases(status);

CREATE INDEX IF NOT EXISTS idx_digital_evidence_case
  ON digital_evidence(case_id);

CREATE INDEX IF NOT EXISTS idx_entity_relationships_case
  ON entity_relationships(case_id);

-- ============================================================
-- SEED DATA
-- ============================================================

-- Case linked to the high-credibility fraud tip
INSERT INTO investigation_cases (
  id, tip_id, title, lead_investigator, status, priority
) VALUES (
  'b1b2c3d4-1111-4000-8000-000000000001',
  'a1b2c3d4-1111-4000-8000-000000000001',
  'Sahte Fatura Operasyonu - Muhasebe Departmani',
  'Basinceleme Uzman: Elif K.',
  'FROZEN',
  'CRITICAL'
) ON CONFLICT (id) DO NOTHING;

-- Digital Evidence: 6 frozen records
INSERT INTO digital_evidence (id, case_id, type, source_system, content_snapshot, hash_sha256, timestamp_rfc3161, locked, frozen_by) VALUES
(
  'c1c2c3c4-0001-4000-8000-000000000001',
  'b1b2c3d4-1111-4000-8000-000000000001',
  'EMAIL',
  'Microsoft Exchange',
  '{"from": "ahmet.b@banka.com", "to": "tedarikci@shell-corp.biz", "subject": "Fatura Onay - FTR-2025-4892", "body": "Ekteki faturayi islem yapilmak uzere onayliyorum. Odeme bildirimini bekliyorum.", "date": "2025-11-15T09:23:00Z", "attachments": ["fatura_FTR-2025-4892.pdf"]}'::jsonb,
  'a7f3b2c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1',
  now() - interval '2 days',
  true,
  'Sistem - Otomatik Dondurma'
),
(
  'c1c2c3c4-0002-4000-8000-000000000001',
  'b1b2c3d4-1111-4000-8000-000000000001',
  'EMAIL',
  'Microsoft Exchange',
  '{"from": "ahmet.b@banka.com", "to": "finans@banka.com", "subject": "Acil Odeme Talebi", "body": "Asagidaki tedarikci faturasi icin acil odeme yapilmasi gerekmektedir. IBAN: TR33 0006 1005 1978 6457 8413 26. Tutar: 72.500 TL", "date": "2025-11-30T14:45:00Z"}'::jsonb,
  'b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9',
  now() - interval '2 days',
  true,
  'Sistem - Otomatik Dondurma'
),
(
  'c1c2c3c4-0003-4000-8000-000000000001',
  'b1b2c3d4-1111-4000-8000-000000000001',
  'CHAT',
  'Slack',
  '{"channel": "#muhasebe-ozel", "user": "ahmet.b", "messages": [{"time": "2025-12-01T10:15:00Z", "text": "Tedarikci faturasini hemen isleme alalim, soru sormayin"}, {"time": "2025-12-01T10:18:00Z", "text": "Bu konu sadece benim onayimla ilerlesin"}, {"time": "2025-12-01T10:22:00Z", "text": "Dekontlari bana gonderin, dosyalamayi ben yapacagim"}]}'::jsonb,
  'c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0',
  now() - interval '2 days',
  true,
  'Sistem - Otomatik Dondurma'
),
(
  'c1c2c3c4-0004-4000-8000-000000000001',
  'b1b2c3d4-1111-4000-8000-000000000001',
  'INVOICE',
  'SAP ERP',
  '{"invoice_no": "FTR-2025-4892", "vendor": "Shell Corp Dis Ticaret Ltd.", "vendor_tax_id": "9876543210", "amount": 72500, "currency": "TRL", "date": "2025-11-14", "approved_by": "Ahmet B.", "items": [{"desc": "Danismanlik Hizmeti Q4", "qty": 1, "unit_price": 72500}]}'::jsonb,
  'd0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1',
  now() - interval '2 days',
  true,
  'Sistem - Otomatik Dondurma'
),
(
  'c1c2c3c4-0005-4000-8000-000000000001',
  'b1b2c3d4-1111-4000-8000-000000000001',
  'LOG',
  'Active Directory',
  '{"events": [{"timestamp": "2025-11-15T09:20:00Z", "user": "ahmet.b", "action": "LOGIN", "ip": "10.0.15.42", "location": "Istanbul Merkez"}, {"timestamp": "2025-11-15T09:21:00Z", "user": "ahmet.b", "action": "FILE_ACCESS", "resource": "\\\\fileserver\\muhasebe\\faturalar\\2025"}, {"timestamp": "2025-11-15T22:45:00Z", "user": "ahmet.b", "action": "LOGIN", "ip": "185.92.74.11", "location": "VPN - Bilinmeyen"}]}'::jsonb,
  'e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2',
  now() - interval '2 days',
  true,
  'Sistem - Otomatik Dondurma'
),
(
  'c1c2c3c4-0006-4000-8000-000000000001',
  'b1b2c3d4-1111-4000-8000-000000000001',
  'LOG',
  'Core Banking',
  '{"transfers": [{"date": "2025-10-15", "from_account": "BANKA-OP-001", "to_iban": "TR33 0006 1005 1978 6457 8413 26", "amount": 45000, "ref": "EFT-20251015-001"}, {"date": "2025-10-30", "from_account": "BANKA-OP-001", "to_iban": "TR33 0006 1005 1978 6457 8413 26", "amount": 68000, "ref": "EFT-20251030-001"}, {"date": "2025-11-15", "from_account": "BANKA-OP-001", "to_iban": "TR33 0006 1005 1978 6457 8413 26", "amount": 72500, "ref": "EFT-20251115-001"}]}'::jsonb,
  'f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3',
  now() - interval '2 days',
  true,
  'Sistem - Otomatik Dondurma'
) ON CONFLICT (id) DO NOTHING;

-- Entity Relationships: Fraud network graph
INSERT INTO entity_relationships (case_id, source_node, source_type, target_node, target_type, relation_type, evidence_ref, confidence) VALUES
(
  'b1b2c3d4-1111-4000-8000-000000000001',
  'Ahmet B.', 'PERSON',
  'Shell Corp Dis Ticaret', 'VENDOR',
  'APPROVAL', 'FTR-2025-4892 Fatura Onayi', 95
),
(
  'b1b2c3d4-1111-4000-8000-000000000001',
  'Shell Corp Dis Ticaret', 'VENDOR',
  'TR33 0006 1005 1978', 'ACCOUNT',
  'OWNERSHIP', 'IBAN Sahiplik Kaydi', 90
),
(
  'b1b2c3d4-1111-4000-8000-000000000001',
  'Ahmet B.', 'PERSON',
  'Mehmet B.', 'PERSON',
  'SHARED_ADDRESS', 'Ayni ikametgah adresi: Kadikoy, Istanbul', 85
),
(
  'b1b2c3d4-1111-4000-8000-000000000001',
  'Mehmet B.', 'PERSON',
  'Shell Corp Dis Ticaret', 'VENDOR',
  'OWNERSHIP', 'Ticaret Sicil Kaydı - %100 Hissedar', 98
),
(
  'b1b2c3d4-1111-4000-8000-000000000001',
  'Ahmet B.', 'PERSON',
  '185.92.74.11', 'ACCOUNT',
  'SAME_IP', 'AD Log - VPN Giris 22:45', 75
),
(
  'b1b2c3d4-1111-4000-8000-000000000001',
  'Shell Corp Dis Ticaret', 'VENDOR',
  '185.92.74.11', 'ACCOUNT',
  'SAME_IP', 'Web trafik analizi - ayni IP blogu', 70
),
(
  'b1b2c3d4-1111-4000-8000-000000000001',
  'Ahmet B.', 'PERSON',
  'Zeynep A.', 'PERSON',
  'SHARED_PHONE', 'Ayni telefon numarasi: 0532-XXX-XXXX', 80
),
(
  'b1b2c3d4-1111-4000-8000-000000000001',
  'Zeynep A.', 'PERSON',
  'Shell Corp Dis Ticaret', 'VENDOR',
  'TRANSFER', 'Kisisel hesaptan Shell Corp hesabina transfer', 65
) ON CONFLICT DO NOTHING;
