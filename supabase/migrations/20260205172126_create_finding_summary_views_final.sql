/*
  # Finding Summary and Analytics Views

  1. New Views
    - `view_finding_summary`: Aggregated finding data with action plan counts
    - `view_universe_audit_coverage`: Audit coverage analysis for gap identification

  2. Functions
    - `fn_get_audit_coverage_gaps()`: Returns entities requiring audit attention

  3. Performance
    - Adds indexes on frequently queried columns
*/

-- Drop existing views if they exist
DROP VIEW IF EXISTS public.view_finding_summary CASCADE;
DROP VIEW IF EXISTS public.view_universe_audit_coverage CASCADE;

-- Finding Summary View
CREATE VIEW public.view_finding_summary AS
SELECT
    f.id,
    f.title,
    f.finding_code,
    f.risk_rating,
    f.severity,
    f.status,
    f.state,
    f.main_status,
    f.created_at,
    f.published_at,
    f.engagement_id,
    f.assigned_auditee_id,
    f.financial_impact,
    e.title as engagement_title,
    e.audit_type,
    COUNT(DISTINCT ap.id) as action_plan_count,
    COUNT(DISTINCT CASE WHEN ap.status = 'OPEN' THEN ap.id END) as open_action_count,
    COUNT(DISTINCT CASE WHEN ap.status = 'OVERDUE' THEN ap.id END) as overdue_action_count,
    MIN(ap.target_date) as next_due_date,
    MAX(ap.completion_date) as last_completed_date
FROM public.audit_findings f
LEFT JOIN public.audit_engagements e ON f.engagement_id = e.id
LEFT JOIN public.action_plans ap ON f.id = ap.finding_id
GROUP BY
    f.id,
    f.title,
    f.finding_code,
    f.risk_rating,
    f.severity,
    f.status,
    f.state,
    f.main_status,
    f.created_at,
    f.published_at,
    f.engagement_id,
    f.assigned_auditee_id,
    f.financial_impact,
    e.title,
    e.audit_type;

-- Audit Universe Coverage View
CREATE VIEW public.view_universe_audit_coverage AS
SELECT
    ae.id as entity_id,
    ae.name as entity_name,
    ae.type as entity_type,
    ae.path as entity_path,
    ae.risk_score,
    COALESCE(ae.risk_score_manual, ae.risk_score) as effective_risk_score,
    COUNT(DISTINCT eng.id) as audit_count,
    MAX(eng.end_date) as last_audit_date,
    (CURRENT_DATE - MAX(eng.end_date))::integer as days_since_last_audit,
    CASE
        WHEN MAX(eng.end_date) IS NULL THEN 'NEVER_AUDITED'
        WHEN (CURRENT_DATE - MAX(eng.end_date)) > 365 THEN 'HIGH_PRIORITY'
        WHEN (CURRENT_DATE - MAX(eng.end_date)) > 180 THEN 'MEDIUM_PRIORITY'
        ELSE 'RECENTLY_AUDITED'
    END as coverage_status
FROM public.audit_entities ae
LEFT JOIN public.audit_engagements eng ON ae.id = eng.entity_id
    AND eng.status IN ('COMPLETED', 'REPORTING')
GROUP BY
    ae.id,
    ae.name,
    ae.type,
    ae.path,
    ae.risk_score,
    ae.risk_score_manual;

-- Function to get audit coverage gaps
CREATE OR REPLACE FUNCTION public.fn_get_audit_coverage_gaps()
RETURNS TABLE (
    entity_id uuid,
    entity_name text,
    entity_type text,
    risk_score numeric,
    coverage_status text,
    priority_score numeric,
    days_since_last_audit integer
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        v.entity_id,
        v.entity_name,
        v.entity_type::text,
        v.effective_risk_score,
        v.coverage_status,
        (COALESCE(v.effective_risk_score, 50) *
         COALESCE(v.days_since_last_audit, 1000)::numeric / 365.0) as priority_score,
        v.days_since_last_audit
    FROM public.view_universe_audit_coverage v
    WHERE v.coverage_status IN ('NEVER_AUDITED', 'HIGH_PRIORITY', 'MEDIUM_PRIORITY')
    ORDER BY priority_score DESC;
END;
$$;

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_findings_code
    ON public.audit_findings(finding_code);

CREATE INDEX IF NOT EXISTS idx_findings_state_severity
    ON public.audit_findings(state, severity);

CREATE INDEX IF NOT EXISTS idx_findings_engagement
    ON public.audit_findings(engagement_id)
    WHERE engagement_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_actions_finding_status
    ON public.action_plans(finding_id, status);

CREATE INDEX IF NOT EXISTS idx_actions_target_date
    ON public.action_plans(target_date)
    WHERE status != 'COMPLETED';

CREATE INDEX IF NOT EXISTS idx_engagements_entity_status
    ON public.audit_engagements(entity_id, status);

CREATE INDEX IF NOT EXISTS idx_engagements_dates
    ON public.audit_engagements(start_date, end_date);

-- Add auditor accountability column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'audit_engagements'
        AND column_name = 'auditor_in_charge'
    ) THEN
        ALTER TABLE public.audit_engagements
        ADD COLUMN auditor_in_charge uuid REFERENCES auth.users(id);
    END IF;
END $$;

COMMENT ON VIEW public.view_finding_summary IS
    'Aggregated finding summary with action plan metrics for dashboard displays';

COMMENT ON VIEW public.view_universe_audit_coverage IS
    'Audit coverage analysis showing gaps and priorities for risk-based planning';

COMMENT ON FUNCTION public.fn_get_audit_coverage_gaps() IS
    'Returns prioritized list of entities requiring audit attention based on risk and coverage';
