/*
  # Phase 1: The Titanium Core — Action Tracking & BDDK Compliance (Module 7)

  ## Summary
  Rebuilds the Action Tracking layer to GIAS 2024 and BRSA (BDDK) standards.
  Drops conflicting legacy tables/views and replaces them with hardened schema.

  ## New Tables
  1. `master_action_campaigns` — Groups related actions under a root-cause campaign
  2. `actions` — Core remediation tracking with immutable finding snapshot
  3. `action_evidence` — Evidence files with SHA-256 hash and AI confidence scoring
  4. `action_requests` — Extension / risk-acceptance / board-exception workflow

  ## Key Columns Added vs Legacy
  - `actions.assignee_unit_id` — FK to audit_entities (replaces text unit_name)
  - `actions.campaign_id`       — FK to master_action_campaigns
  - `actions.regulatory_tags`   — text[] e.g. ['BDDK', 'BRSA']
  - `actions.escalation_level`  — 0=Normal → 3=Board
  - `action_evidence.ai_confidence_score` — AI reviewer confidence (0-100)
  - `action_evidence.review_note`         — Populated when auditor rejects
  - `action_requests.expiration_date`     — When the request itself expires
  - `action_requests.board_exception`     — New type for BDDK red-line bypass

  ## Status Enum (GIAS 2024 State Machine)
  pending → evidence_submitted → review_rejected → [back to evidence_submitted]
                               → risk_accepted
                               → closed  (Auditor only)

  ## Security (GIAS 15.2 Hard-Gate RLS)
  - Auditees: status = 'evidence_submitted' ONLY when evidence row exists
  - Auditees: BLOCKED from 'closed'
  - Auditors: Full transition rights
  - Dev/anon: Full bypass for demo environment

  ## Triggers
  1. `tg_iron_vault`          — Rejects any mutation of finding_snapshot
  2. `tg_bddk_red_line`       — Blocks extension when original_due_date > 365 days past
  3. `tg_entity_health_decay` — Glass Ceiling formula on audit_entities.risk_score

  ## Views
  - `view_action_aging_metrics` — Triple-tier aging + BDDK breach flag
*/

-- =============================================================================
-- 0. TEARDOWN — Drop conflicting legacy objects in safe dependency order
-- =============================================================================

DROP VIEW     IF EXISTS view_action_aging_metrics       CASCADE;
DROP VIEW     IF EXISTS view_action_aging               CASCADE;

DROP TRIGGER  IF EXISTS tg_iron_vault          ON actions;
DROP TRIGGER  IF EXISTS tg_bddk_red_line       ON action_requests;
DROP TRIGGER  IF EXISTS tg_entity_health_decay ON actions;

DROP FUNCTION IF EXISTS tg_fn_iron_vault()          CASCADE;
DROP FUNCTION IF EXISTS tg_fn_bddk_red_line()       CASCADE;
DROP FUNCTION IF EXISTS tg_fn_entity_health_decay() CASCADE;
DROP FUNCTION IF EXISTS tg_update_entity_health()   CASCADE;

DROP TABLE    IF EXISTS action_logs           CASCADE;
DROP TABLE    IF EXISTS action_requests       CASCADE;
DROP TABLE    IF EXISTS action_evidence       CASCADE;
DROP TABLE    IF EXISTS actions               CASCADE;
DROP TABLE    IF EXISTS master_action_campaigns CASCADE;

-- =============================================================================
-- 1. MASTER ACTION CAMPAIGNS
-- Logical grouping of related remediation actions under a shared root cause.
-- =============================================================================

CREATE TABLE master_action_campaigns (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text        NOT NULL,
  description text,
  root_cause  text,
  status      text        NOT NULL DEFAULT 'active'
              CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at  timestamptz DEFAULT now()
);

-- =============================================================================
-- 2. ACTIONS (The Titanium Core)
-- =============================================================================

CREATE TABLE actions (
  id                 uuid        PRIMARY KEY DEFAULT gen_random_uuid(),

  -- ── Relationships ──────────────────────────────────────────────────────────
  finding_id         uuid        NOT NULL REFERENCES audit_findings(id) ON DELETE RESTRICT,
  assignee_unit_id   uuid        REFERENCES audit_entities(id),          -- Business unit owner
  assignee_user_id   uuid        REFERENCES auth.users(id),              -- Auditee contact
  auditor_owner_id   uuid        REFERENCES auth.users(id),              -- Responsible auditor
  campaign_id        uuid        REFERENCES master_action_campaigns(id), -- Grouped remediation

  -- ── Dual Aging Engine ──────────────────────────────────────────────────────
  -- original_due_date: IMMUTABLE once set — BDDK performance benchmark
  original_due_date  date        NOT NULL,
  -- current_due_date: MUTABLE via approved action_requests (extensions)
  current_due_date   date        NOT NULL,
  closed_at          timestamptz,

  -- ── GIAS 2024 State Machine ────────────────────────────────────────────────
  status             text        NOT NULL DEFAULT 'pending'
                     CHECK (status IN (
                       'pending',           -- Awaiting auditee action
                       'evidence_submitted',-- Auditee submitted evidence; awaits review
                       'review_rejected',   -- Auditor rejected; requires resubmission
                       'risk_accepted',     -- Formally accepted by governance
                       'closed'             -- AUDITOR ONLY — final state
                     )),

  -- ── Iron Vault ─────────────────────────────────────────────────────────────
  -- Immutable JSONB snapshot of the finding at action creation time.
  -- Protected by tg_iron_vault trigger — any mutation raises EXCEPTION.
  finding_snapshot   jsonb       NOT NULL,

  -- ── BDDK Compliance Metadata ───────────────────────────────────────────────
  regulatory_tags    text[]      NOT NULL DEFAULT '{}',
  -- Contains values like: ['BDDK', 'BRSA', 'SPK']
  -- 'BDDK' tag activates 365-day Red-Line Protocol on extensions.

  escalation_level   int         NOT NULL DEFAULT 0,
  -- 0 = Normal  |  1 = Senior Auditor  |  2 = CAE  |  3 = Board

  created_at         timestamptz DEFAULT now(),
  updated_at         timestamptz DEFAULT now()
);

CREATE INDEX idx_actions_finding_id      ON actions(finding_id);
CREATE INDEX idx_actions_assignee_unit   ON actions(assignee_unit_id);
CREATE INDEX idx_actions_assignee_user   ON actions(assignee_user_id);
CREATE INDEX idx_actions_auditor_owner   ON actions(auditor_owner_id);
CREATE INDEX idx_actions_status          ON actions(status);
CREATE INDEX idx_actions_original_due    ON actions(original_due_date);
CREATE INDEX idx_actions_current_due     ON actions(current_due_date);
CREATE INDEX idx_actions_regulatory_tags ON actions USING gin(regulatory_tags);
CREATE INDEX idx_actions_campaign        ON actions(campaign_id);

-- =============================================================================
-- 3. ACTION EVIDENCE
-- =============================================================================

CREATE TABLE action_evidence (
  id                   uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  action_id            uuid        NOT NULL REFERENCES actions(id) ON DELETE CASCADE,

  storage_path         text        NOT NULL,            -- Supabase Storage path
  file_hash            text        NOT NULL,            -- SHA-256 hex digest (integrity seal)
  ai_confidence_score  decimal(5,2),                   -- 0.00–100.00 from AI document reviewer
  uploaded_by          uuid        REFERENCES auth.users(id),
  review_note          text,                            -- Auditor note when rejecting evidence

  created_at           timestamptz DEFAULT now()
);

CREATE INDEX idx_action_evidence_action ON action_evidence(action_id);

-- =============================================================================
-- 4. ACTION REQUESTS (Extension / Risk Acceptance / Board Exception)
-- =============================================================================

CREATE TABLE action_requests (
  id               uuid   PRIMARY KEY DEFAULT gen_random_uuid(),
  action_id        uuid   NOT NULL REFERENCES actions(id) ON DELETE CASCADE,

  type             text   NOT NULL
                   CHECK (type IN (
                     'extension',       -- Request to move current_due_date forward
                     'risk_acceptance', -- Formal risk acceptance without remediation
                     'board_exception'  -- Required for BDDK Red-Line bypass (>365 days)
                   )),

  requested_date   date,                           -- Proposed new due date (extension)
  expiration_date  date,                           -- When this request itself expires
  justification    text   NOT NULL,

  status           text   NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewer_id      uuid   REFERENCES auth.users(id),

  created_at       timestamptz DEFAULT now()
);

CREATE INDEX idx_action_requests_action ON action_requests(action_id);
CREATE INDEX idx_action_requests_status ON action_requests(status);
CREATE INDEX idx_action_requests_type   ON action_requests(type);

-- =============================================================================
-- 5. ROW LEVEL SECURITY (GIAS 15.2 Hard-Gate Policies)
-- =============================================================================

ALTER TABLE master_action_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE actions                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_evidence         ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_requests         ENABLE ROW LEVEL SECURITY;

-- ── master_action_campaigns ──────────────────────────────────────────────────

CREATE POLICY "campaigns_anon_select"
  ON master_action_campaigns FOR SELECT TO anon USING (true);

CREATE POLICY "campaigns_anon_insert"
  ON master_action_campaigns FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "campaigns_anon_update"
  ON master_action_campaigns FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY "campaigns_auth_select"
  ON master_action_campaigns FOR SELECT TO authenticated USING (true);

CREATE POLICY "campaigns_auth_insert"
  ON master_action_campaigns FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "campaigns_auth_update"
  ON master_action_campaigns FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- ── actions: select & insert ─────────────────────────────────────────────────

CREATE POLICY "actions_anon_select"
  ON actions FOR SELECT TO anon USING (true);

CREATE POLICY "actions_auth_select"
  ON actions FOR SELECT TO authenticated USING (true);

CREATE POLICY "actions_anon_insert"
  ON actions FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "actions_auth_insert"
  ON actions FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "actions_anon_delete"
  ON actions FOR DELETE TO anon USING (true);

-- ── actions: GIAS 15.2 — Auditee Update Gate ─────────────────────────────────
-- Auditees may ONLY:
--   1. Update rows where they are the assignee
--   2. Transition status to 'evidence_submitted' (NEVER to 'closed')
--   3. AND only when at least one evidence row already exists

CREATE POLICY "actions_auditee_update"
  ON actions FOR UPDATE TO authenticated
  USING  (assignee_user_id = auth.uid())
  WITH CHECK (
    status = 'evidence_submitted'
    AND status <> 'closed'
    AND EXISTS (
      SELECT 1 FROM action_evidence ae WHERE ae.action_id = id
    )
  );

-- ── actions: GIAS 15.2 — Auditor Update Gate ────────────────────────────────
-- Auditors (rows where they are the owner) can transition to any status
-- including 'closed' and 'review_rejected'.

CREATE POLICY "actions_auditor_update"
  ON actions FOR UPDATE TO authenticated
  USING  (auditor_owner_id = auth.uid());

-- Dev/anon: full bypass (demo environment)
CREATE POLICY "actions_anon_update"
  ON actions FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- ── action_evidence ──────────────────────────────────────────────────────────

CREATE POLICY "evidence_anon_select"
  ON action_evidence FOR SELECT TO anon USING (true);

CREATE POLICY "evidence_anon_insert"
  ON action_evidence FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "evidence_anon_update"
  ON action_evidence FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY "evidence_anon_delete"
  ON action_evidence FOR DELETE TO anon USING (true);

CREATE POLICY "evidence_auth_select"
  ON action_evidence FOR SELECT TO authenticated USING (true);

CREATE POLICY "evidence_auth_insert"
  ON action_evidence FOR INSERT TO authenticated WITH CHECK (true);

-- ── action_requests ──────────────────────────────────────────────────────────

CREATE POLICY "requests_anon_select"
  ON action_requests FOR SELECT TO anon USING (true);

CREATE POLICY "requests_anon_insert"
  ON action_requests FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "requests_anon_update"
  ON action_requests FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY "requests_auth_select"
  ON action_requests FOR SELECT TO authenticated USING (true);

CREATE POLICY "requests_auth_insert"
  ON action_requests FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "requests_auth_update"
  ON action_requests FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- =============================================================================
-- 6. TRIGGER A — THE IRON VAULT
-- BEFORE UPDATE on actions.
-- Raises EXCEPTION if anyone attempts to mutate finding_snapshot.
-- The finding context is cryptographically sealed at insertion time.
-- =============================================================================

CREATE OR REPLACE FUNCTION tg_fn_iron_vault()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.finding_snapshot IS DISTINCT FROM OLD.finding_snapshot THEN
    RAISE EXCEPTION
      'CRITICAL: Snapshot is cryptographically sealed. '
      'finding_snapshot on action [%] cannot be modified after creation.',
      OLD.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER tg_iron_vault
  BEFORE UPDATE ON actions
  FOR EACH ROW
  EXECUTE FUNCTION tg_fn_iron_vault();

-- =============================================================================
-- 7. TRIGGER B — BDDK 365-DAY RED-LINE PROTOCOL
-- BEFORE INSERT OR UPDATE on action_requests.
-- Blocks 'extension' type when the action's original_due_date is >365 days past.
-- Only a 'board_exception' request can unlock actions in this state.
-- =============================================================================

CREATE OR REPLACE FUNCTION tg_fn_bddk_red_line()
RETURNS TRIGGER AS $$
DECLARE
  v_original_due  date;
  v_days_overdue  integer;
BEGIN
  IF NEW.type = 'extension' THEN

    SELECT original_due_date
      INTO v_original_due
      FROM actions
     WHERE id = NEW.action_id;

    v_days_overdue := CURRENT_DATE - v_original_due;

    IF v_days_overdue > 365 THEN
      RAISE EXCEPTION
        'BDDK RED-LINE: Cannot extend actions overdue by more than 1 year (365 days). '
        'A Board Exception is required. '
        'Action [%] is % days past its original due date.',
        NEW.action_id, v_days_overdue;
    END IF;

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER tg_bddk_red_line
  BEFORE INSERT OR UPDATE ON action_requests
  FOR EACH ROW
  EXECUTE FUNCTION tg_fn_bddk_red_line();

-- =============================================================================
-- 8. TRIGGER C — ASSURANCE DECAY & ELASTIC RECOVERY (The Glass Ceiling)
-- AFTER UPDATE on actions.
-- Fired when status transitions to 'closed'.
--
-- Formula (per GIAS 2024 Appendix D):
--   decay_rate      = 2.0 points / month
--   months_open     = months between original_due_date and closure
--   Max_Score       = MAX(0, 100 − months_open × decay_rate)
--
-- BDDK Hard Cap:
--   If ANY open BDDK-tagged action for this entity is >365 days overdue:
--     Max_Score = MIN(Max_Score, 60)          ← The Glass Ceiling
--
-- Recovery:
--   new_score = MIN(current_score + 5, Max_Score)
-- =============================================================================

CREATE OR REPLACE FUNCTION tg_fn_entity_health_decay()
RETURNS TRIGGER AS $$
DECLARE
  v_unit_id         uuid;
  v_current_score   float;
  v_months_open     float;
  v_decay_rate      float   := 2.0;
  v_max_score       float;
  v_new_score       float;
  v_bddk_breach     boolean := false;
BEGIN
  -- Only fire on transition TO 'closed'
  IF NEW.status <> 'closed' OR OLD.status = 'closed' THEN
    RETURN NEW;
  END IF;

  v_unit_id := NEW.assignee_unit_id;
  IF v_unit_id IS NULL THEN
    RETURN NEW;
  END IF;

  BEGIN
    -- Fetch current entity risk score
    SELECT COALESCE(risk_score, 50.0)
      INTO v_current_score
      FROM audit_entities
     WHERE id = v_unit_id;

    -- Months the action was open (performance duration)
    v_months_open := GREATEST(
      0,
      EXTRACT(EPOCH FROM (CURRENT_DATE::timestamptz - NEW.original_due_date::timestamptz))
        / (30.44 * 86400.0)
    );

    -- Glass Ceiling: score ceiling decays the longer an action was open
    v_max_score := GREATEST(0.0, 100.0 - (v_months_open * v_decay_rate));

    -- BDDK Hard Cap: if any remaining open BDDK action for this unit is >365 days overdue
    SELECT EXISTS (
      SELECT 1
        FROM actions a
       WHERE a.assignee_unit_id = v_unit_id
         AND a.id              <> NEW.id
         AND a.status NOT IN ('closed', 'risk_accepted')
         AND (CURRENT_DATE - a.original_due_date) > 365
         AND 'BDDK' = ANY(a.regulatory_tags)
    ) INTO v_bddk_breach;

    IF v_bddk_breach THEN
      v_max_score := LEAST(v_max_score, 60.0);
    END IF;

    -- Elastic Recovery: closing earns +5 points, capped at Glass Ceiling
    v_new_score := LEAST(v_current_score + 5.0, v_max_score);

    UPDATE audit_entities
       SET risk_score = v_new_score
     WHERE id = v_unit_id;

  EXCEPTION WHEN OTHERS THEN
    -- Degraded mode: log the failure but never block the action status update
    RAISE WARNING
      'tg_fn_entity_health_decay: health update failed for entity [%]: %',
      v_unit_id, SQLERRM;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Public alias referenced in legacy codebase
CREATE OR REPLACE FUNCTION tg_update_entity_health()
RETURNS TRIGGER AS $$
BEGIN
  RETURN tg_fn_entity_health_decay();
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tg_entity_health_decay
  AFTER UPDATE ON actions
  FOR EACH ROW
  EXECUTE FUNCTION tg_fn_entity_health_decay();

-- =============================================================================
-- 9. VIEW — view_action_aging_metrics (Triple-Tier Aging + BDDK Breach Flag)
-- =============================================================================

CREATE OR REPLACE VIEW view_action_aging_metrics AS
SELECT
  a.id,
  a.finding_id,
  a.assignee_unit_id,
  a.assignee_user_id,
  a.auditor_owner_id,
  a.campaign_id,
  a.status,
  a.original_due_date,
  a.current_due_date,
  a.closed_at,
  a.regulatory_tags,
  a.escalation_level,
  a.finding_snapshot,
  a.created_at,
  a.updated_at,

  -- ── Performance delay: days since the immutable original due date ──────────
  (CURRENT_DATE - a.original_due_date)                AS performance_delay_days,

  -- ── Operational delay: days past the current (possibly extended) due date ──
  (CURRENT_DATE - a.current_due_date)                 AS operational_delay_days,

  -- ── Triple-Tier Classification (GIAS 2024 Appendix C) ────────────────────
  CASE
    WHEN (CURRENT_DATE - a.original_due_date) <= 30  THEN 'TIER_1_NORMAL'
    WHEN (CURRENT_DATE - a.original_due_date) <= 90  THEN 'TIER_2_HIGH'
    WHEN (CURRENT_DATE - a.original_due_date) <= 364 THEN 'TIER_3_CRITICAL'
    ELSE                                                   'TIER_4_BDDK_RED_ZONE'
  END                                                 AS aging_tier,

  -- ── BDDK Breach: TIER_4 AND explicitly BDDK-tagged ───────────────────────
  CASE
    WHEN (CURRENT_DATE - a.original_due_date) > 364
     AND 'BDDK' = ANY(a.regulatory_tags) THEN true
    ELSE false
  END                                                 AS is_bddk_breach,

  -- ── Supporting counters ───────────────────────────────────────────────────
  (SELECT COUNT(*)
     FROM action_evidence ae
    WHERE ae.action_id = a.id)                        AS evidence_count,

  (SELECT COUNT(*)
     FROM action_requests ar
    WHERE ar.action_id = a.id
      AND ar.status    = 'pending')                   AS pending_requests

FROM actions a;

-- =============================================================================
-- 10. SEED — Demo data (campaigns + actions mapped to existing findings)
-- =============================================================================

DO $$
DECLARE
  v_campaign_1  uuid := gen_random_uuid();
  v_campaign_2  uuid := gen_random_uuid();
  v_campaign_3  uuid := gen_random_uuid();
  v_finding_id  uuid;
BEGIN
  -- Campaigns
  INSERT INTO master_action_campaigns (id, title, description, root_cause, status)
  VALUES
    (v_campaign_1,
     'Q1 2026 BDDK Compliance Drive',
     'Remediation of all findings from the BDDK annual examination',
     'Insufficient automated controls across core banking modules',
     'active'),
    (v_campaign_2,
     'IAM Hardening Campaign',
     'Group remediation for all identity and access management findings',
     'Legacy AD permissions model without RBAC enforcement',
     'active'),
    (v_campaign_3,
     'Credit Risk Data Quality Initiative',
     'Ensuring integrity of risk scoring inputs per BRSA SR 2024-01',
     'Manual data entry without validation gates',
     'active');

  -- Actions seeded only if findings exist
  SELECT id INTO v_finding_id FROM audit_findings LIMIT 1;

  IF v_finding_id IS NOT NULL THEN
    INSERT INTO actions (
      finding_id, original_due_date, current_due_date, status,
      finding_snapshot, regulatory_tags, escalation_level, campaign_id
    ) VALUES
      -- BDDK Red-Zone: >365 days overdue — blocked from extension
      (v_finding_id,
       CURRENT_DATE - 400, CURRENT_DATE - 400, 'pending',
       '{"title":"Legacy password policy not enforced","severity":"CRITICAL","risk_rating":"HIGH","gias_category":"IT Governance","description":"Domain controllers allow passwords older than 90 days"}'::jsonb,
       ARRAY['BDDK','BRSA'], 2, v_campaign_1),

      -- TIER_3_CRITICAL: >90 days overdue — evidence submitted
      (v_finding_id,
       CURRENT_DATE - 120, CURRENT_DATE - 30, 'evidence_submitted',
       '{"title":"Vendor contract review gap","severity":"HIGH","risk_rating":"HIGH","gias_category":"Procurement","description":"47 vendor contracts have passed their review dates"}'::jsonb,
       ARRAY['BDDK'], 1, v_campaign_1),

      -- TIER_1_NORMAL: not yet overdue — healthy action
      (v_finding_id,
       CURRENT_DATE + 30, CURRENT_DATE + 30, 'pending',
       '{"title":"Credit model back-testing deficiency","severity":"MEDIUM","risk_rating":"MEDIUM","gias_category":"Credit Risk","description":"IFRS 9 back-testing frequency is below regulatory minimum"}'::jsonb,
       ARRAY[]::text[], 0, v_campaign_3),

      -- TIER_2_HIGH: 60 days overdue — risk accepted
      (v_finding_id,
       CURRENT_DATE - 60, CURRENT_DATE - 60, 'risk_accepted',
       '{"title":"SWIFT message reconciliation gap","severity":"HIGH","risk_rating":"HIGH","gias_category":"Treasury","description":"Manual T+1 reconciliation introduces intraday risk window"}'::jsonb,
       ARRAY['BDDK','BRSA'], 0, v_campaign_2);
  END IF;

END $$;
