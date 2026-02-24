/*
  # Dev E2E: Disable RLS on all critical pipeline tables

  ## Purpose
  Development / E2E testing mode — no auth tokens are present when the app
  runs unauthenticated. Supabase silently drops every INSERT/UPDATE that hits
  an RLS policy without a matching session, producing zero rows and no error
  message to the client.

  ## Tables unlocked (core pipeline)
  1. audit_entities      — Audit Universe nodes
  2. audit_plans         — Annual plan (required before engagements)
  3. audit_engagements   — Individual audit tasks (Görev)
  4. audit_steps         — Workpaper checklist steps
  5. workpapers          — Çalışma kağıtları
  6. workpaper_findings  — Findings linked to workpapers
  7. audit_findings      — Core finding records (Bulgular)
  8. actions             — Remediation actions (Aksiyonlar)
  9. reports             — Audit reports

  ## Tables unlocked (supporting joins)
  10. report_blocks
  11. report_versions
  12. action_evidence
  13. action_requests
  14. assignments

  ## Security note
  DEV/E2E ONLY. Re-enable RLS before any production deployment using the
  policies defined in 20260223200726_enforce_zero_trust_rls.sql.
*/

-- ============================================================
-- DISABLE RLS — CORE PIPELINE TABLES
-- ============================================================
ALTER TABLE public.audit_entities      DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_plans         DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_engagements   DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_steps         DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.workpapers          DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.workpaper_findings  DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_findings      DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.actions             DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports             DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- DISABLE RLS — SUPPORTING TABLES
-- ============================================================
ALTER TABLE public.report_blocks       DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_versions     DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.action_evidence     DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.action_requests     DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments         DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- BELT-AND-SUSPENDERS: permissive policies for all unlocked tables
-- (in case any future migration re-enables RLS)
-- ============================================================
DO $$
DECLARE
  all_tables TEXT[] := ARRAY[
    'audit_entities', 'audit_plans', 'audit_engagements', 'audit_steps',
    'workpapers', 'workpaper_findings', 'audit_findings', 'actions', 'reports',
    'report_blocks', 'report_versions', 'action_evidence', 'action_requests',
    'assignments'
  ];
  t TEXT;
BEGIN
  FOREACH t IN ARRAY all_tables LOOP
    EXECUTE format('DROP POLICY IF EXISTS "dev_e2e_allow_all" ON public.%I', t);
    EXECUTE format(
      $p$
        CREATE POLICY "dev_e2e_allow_all"
          ON public.%I
          FOR ALL
          TO public
          USING (true)
          WITH CHECK (true)
      $p$,
      t
    );
  END LOOP;
END $$;
