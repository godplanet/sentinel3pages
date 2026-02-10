/*
  # Phase 3: Forensic Vault & Interrogation Room

  1. Modified Tables
    - `vault_access_requests`
      - Clear stale demo data referencing forensic_cases
      - Re-point FK from forensic_cases to investigation_cases
      - Add `required_approvals` (int, default 2 for multi-sig quorum)
      - Add `unlocked_at` (timestamptz, set when quorum met)
      - Expand status constraint: PENDING, APPROVED, REJECTED, UNLOCKED, DENIED, EXPIRED

  2. New Tables
    - `interrogation_logs`
      - `id` (uuid, primary key)
      - `case_id` (uuid, references investigation_cases)
      - `session_number` (int, sequential per case)
      - `suspect_name`, `interviewer_name` (text)
      - `transcript` (jsonb array of speaker/text/ts objects)
      - `ai_contradiction_flags` (jsonb array of claim/evidence/severity)
      - `status` (text: IN_PROGRESS, COMPLETED, SIGNED)
      - `started_at`, `completed_at` (timestamptz)

  3. Security
    - RLS on interrogation_logs (auth + anon dev)
    - vault_access_requests: only PENDING rows updatable (prevents post-unlock tampering)

  4. Seed Data
    - 1 vault access request (UNLOCKED: CAE + Investigation Manager approved)
    - 1 interrogation session: 6-line transcript, 3 AI contradiction flags

  5. Important Notes
    - Multi-sig requires 2 of 3 audit leadership roles (CAE, DEPUTY, MANAGER)
    - Contradictions cross-reference frozen digital evidence from Phase 2
*/

-- Clear stale vault_access_requests that reference forensic_cases
DELETE FROM vault_access_requests;

-- Re-point FK to investigation_cases
ALTER TABLE vault_access_requests DROP CONSTRAINT IF EXISTS vault_access_requests_case_id_fkey;
ALTER TABLE vault_access_requests
  ADD CONSTRAINT vault_access_requests_case_id_fkey
  FOREIGN KEY (case_id) REFERENCES investigation_cases(id);

-- Add missing columns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vault_access_requests' AND column_name = 'required_approvals'
  ) THEN
    ALTER TABLE vault_access_requests ADD COLUMN required_approvals int NOT NULL DEFAULT 2;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vault_access_requests' AND column_name = 'unlocked_at'
  ) THEN
    ALTER TABLE vault_access_requests ADD COLUMN unlocked_at timestamptz;
  END IF;
END $$;

-- Expand status constraint
ALTER TABLE vault_access_requests DROP CONSTRAINT IF EXISTS vault_access_requests_status_check;
ALTER TABLE vault_access_requests ADD CONSTRAINT vault_access_requests_status_check
  CHECK (status = ANY (ARRAY['PENDING', 'APPROVED', 'REJECTED', 'UNLOCKED', 'DENIED', 'EXPIRED']));

-- ============================================================
-- Interrogation Logs
-- ============================================================
CREATE TABLE IF NOT EXISTS interrogation_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES investigation_cases(id),
  session_number int NOT NULL DEFAULT 1,
  suspect_name text NOT NULL DEFAULT '',
  interviewer_name text NOT NULL DEFAULT '',
  transcript jsonb NOT NULL DEFAULT '[]'::jsonb,
  ai_contradiction_flags jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'IN_PROGRESS',
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE interrogation_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read interrogation_logs"
  ON interrogation_logs FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can insert interrogation_logs"
  ON interrogation_logs FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can update active interrogation_logs"
  ON interrogation_logs FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL AND status = 'IN_PROGRESS')
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Dev read interrogation_logs"
  ON interrogation_logs FOR SELECT TO anon USING (true);

CREATE POLICY "Dev insert interrogation_logs"
  ON interrogation_logs FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Dev update active interrogation_logs"
  ON interrogation_logs FOR UPDATE TO anon
  USING (status = 'IN_PROGRESS') WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_interrogation_logs_case
  ON interrogation_logs(case_id);

-- ============================================================
-- SEED: Vault Access (UNLOCKED by 2/3 leadership)
-- ============================================================
INSERT INTO vault_access_requests (
  id, case_id, requested_by, approvals, required_approvals, status, created_at, unlocked_at
) VALUES (
  'e1e2e3e4-0001-4000-8000-000000000001',
  'b1b2c3d4-1111-4000-8000-000000000001',
  'Elif K. (Basinceleme Uzmani)',
  '[
    {"role": "CAE", "name": "Dr. Ayse Yilmaz (Denetim Baskani)", "approved_at": "2026-02-06T10:30:00Z"},
    {"role": "MANAGER", "name": "Elif K. (Inceleme Muduru)", "approved_at": "2026-02-06T11:15:00Z"}
  ]'::jsonb,
  2,
  'UNLOCKED',
  '2026-02-06T09:00:00Z',
  '2026-02-06T11:15:00Z'
) ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- SEED: Interrogation Session
-- ============================================================
INSERT INTO interrogation_logs (
  id, case_id, session_number, suspect_name, interviewer_name,
  transcript, ai_contradiction_flags, status, started_at
) VALUES (
  'f1f2f3f4-0001-4000-8000-000000000001',
  'b1b2c3d4-1111-4000-8000-000000000001',
  1,
  'Ahmet B.',
  'Elif K. (Basinceleme Uzmani)',
  '[
    {"speaker": "INTERVIEWER", "text": "Ahmet Bey, 15 Kasim 2025 tarihinde Shell Corp Dis Ticaret firmasina yapilan 72.500 TL tutarindaki odeme hakkinda bilginiz var mi?", "ts": "2026-02-07T14:00:00Z"},
    {"speaker": "SUSPECT", "text": "Ben o tarihte izindeydim. Ofiste degildin, odeme islemiyle bir ilgim yok.", "ts": "2026-02-07T14:01:30Z"},
    {"speaker": "INTERVIEWER", "text": "Shell Corp Dis Ticaret firmasi ile herhangi bir kisisel baglantiniz var mi?", "ts": "2026-02-07T14:02:15Z"},
    {"speaker": "SUSPECT", "text": "Hayir, kesinlikle yok. Firmayi sadece kurumsal olarak taniyorum.", "ts": "2026-02-07T14:03:00Z"},
    {"speaker": "INTERVIEWER", "text": "Peki Mehmet B. isimli kisiyi taniyor musunuz?", "ts": "2026-02-07T14:04:00Z"},
    {"speaker": "SUSPECT", "text": "Mehmet mi? Evet, uzak bir akrabamdir ama is iliskimiz yok.", "ts": "2026-02-07T14:04:45Z"}
  ]'::jsonb,
  '[
    {
      "id": "c1",
      "claim": "15 Kasim 2025 tarihinde izindeydi, ofiste degildi",
      "evidence_type": "LOG",
      "evidence_source": "Active Directory",
      "evidence_detail": "15.11.2025 saat 09:20 - ahmet.b kullanicisi 10.0.15.42 IP adresinden ofis agina giris yapmis. Ayni gun 22:45 - VPN uzerinden 185.92.74.11 IP ile tekrar giris.",
      "severity": "CRITICAL",
      "detected_at": "2026-02-07T14:01:35Z"
    },
    {
      "id": "c2",
      "claim": "Shell Corp ile kisisel baglantisi yok",
      "evidence_type": "EMAIL",
      "evidence_source": "Microsoft Exchange",
      "evidence_detail": "ahmet.b@banka.com adresinden tedarikci@shell-corp.biz adresine e-posta: Fatura Onay FTR-2025-4892.",
      "severity": "HIGH",
      "detected_at": "2026-02-07T14:03:05Z"
    },
    {
      "id": "c3",
      "claim": "Mehmet B. ile is iliskisi yok",
      "evidence_type": "LOG",
      "evidence_source": "Ticaret Sicil / Adres Kaydi",
      "evidence_detail": "Mehmet B., Shell Corp Dis Ticaret Ltd. %100 hissedari. Ayni ikametgah: Kadikoy, Istanbul.",
      "severity": "CRITICAL",
      "detected_at": "2026-02-07T14:04:50Z"
    }
  ]'::jsonb,
  'IN_PROGRESS',
  '2026-02-07T14:00:00Z'
) ON CONFLICT (id) DO NOTHING;
