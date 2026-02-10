-- BDDK Compliance Views - Executive Dashboard and Regulatory Reporting
-- Creates views for BDDK BS Yönetmeliği Madde 32 compliance tracking

CREATE OR REPLACE VIEW public.view_executive_dashboard AS
SELECT
  e.title as engagement_title,
  f.id as finding_id,
  f.title as finding_title,
  f.severity as finding_severity,
  f.finding_year,
  f.agreement_date,
  f.auditee_department,
  a.id as action_id,
  a.title as action_title,
  a.description as action_description,
  a.target_date as action_target_date,
  a.original_due_date,
  a.extension_count,
  a.status as action_status,
  a.responsible_person,
  (CURRENT_DATE - f.agreement_date)::INT as finding_age_days,
  CASE
    WHEN a.target_date IS NULL THEN 0
    WHEN a.status = 'COMPLETED' THEN 0
    WHEN CURRENT_DATE > a.target_date THEN (CURRENT_DATE - a.target_date)::INT
    ELSE 0
  END as days_overdue,
  CASE
    WHEN a.status = 'COMPLETED' THEN 'Kapatıldı'
    WHEN a.target_date < CURRENT_DATE AND (CURRENT_DATE - a.target_date)::INT > 365 
      THEN 'Vadesi 1 Yıldan Fazla Aşılan'
    WHEN a.target_date < CURRENT_DATE AND (CURRENT_DATE - a.target_date)::INT BETWEEN 90 AND 365
      THEN 'Vadesi 3-12 Ay Arası Aşılan'
    WHEN a.target_date < CURRENT_DATE AND (CURRENT_DATE - a.target_date)::INT < 90
      THEN 'Vadesi 3 Aydan Az Aşılan'
    WHEN a.target_date >= CURRENT_DATE
      THEN 'Vadesi Gelmemiş'
    ELSE 'Belirsiz'
  END as regulatory_status,
  CASE
    WHEN f.severity = 'CRITICAL' AND (CURRENT_DATE - f.agreement_date)::INT > 365 
      THEN 'RED'
    WHEN (CURRENT_DATE - a.target_date)::INT > 180
      THEN 'ORANGE'
    WHEN (CURRENT_DATE - a.target_date)::INT > 90
      THEN 'YELLOW'
    ELSE 'GREEN'
  END as alert_level
FROM public.audit_findings f
JOIN public.audit_engagements e ON f.engagement_id = e.id
LEFT JOIN public.action_plans a ON f.id = a.finding_id
WHERE f.status IN ('FINAL', 'REMEDIATED')
ORDER BY f.finding_year DESC, f.agreement_date DESC;

CREATE OR REPLACE VIEW public.view_bddk_compliance_summary AS
SELECT
  COUNT(DISTINCT f.id) as total_findings,
  COUNT(DISTINCT CASE WHEN a.status = 'COMPLETED' THEN f.id END) as closed_findings,
  COUNT(DISTINCT CASE WHEN a.target_date < CURRENT_DATE AND a.status != 'COMPLETED' THEN f.id END) as overdue_findings,
  COUNT(DISTINCT CASE WHEN f.severity = 'CRITICAL' THEN f.id END) as critical_findings,
  COUNT(DISTINCT CASE 
    WHEN a.target_date < CURRENT_DATE 
    AND a.status != 'COMPLETED' 
    AND (CURRENT_DATE - a.target_date)::INT > 365 
    THEN f.id 
  END) as overdue_1year_plus,
  AVG(CASE WHEN a.status = 'COMPLETED' THEN (a.target_date - f.agreement_date)::INT END) as avg_resolution_days,
  SUM(a.extension_count) as total_extensions
FROM public.audit_findings f
LEFT JOIN public.action_plans a ON f.id = a.finding_id
WHERE f.status IN ('FINAL', 'REMEDIATED');

CREATE OR REPLACE VIEW public.view_unit_performance AS
SELECT
  f.auditee_department as department,
  COUNT(DISTINCT f.id) as total_findings,
  COUNT(DISTINCT CASE WHEN a.status = 'COMPLETED' THEN f.id END) as closed_findings,
  COUNT(DISTINCT CASE WHEN a.target_date < CURRENT_DATE AND a.status != 'COMPLETED' THEN f.id END) as overdue_actions,
  AVG(CASE 
    WHEN a.status = 'COMPLETED' 
    THEN (a.target_date - f.agreement_date)::INT 
  END)::INT as avg_closure_days,
  SUM(a.extension_count) as total_extensions
FROM public.audit_findings f
LEFT JOIN public.action_plans a ON f.id = a.finding_id
WHERE f.status IN ('FINAL', 'REMEDIATED')
GROUP BY f.auditee_department
ORDER BY overdue_actions DESC, total_findings DESC;