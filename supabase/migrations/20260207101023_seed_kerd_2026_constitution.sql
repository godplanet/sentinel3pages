/*
  # Seed KERD-2026 Risk Methodology Constitution

  1. Data Inserted
    - Default methodology config for tenant 00000000-0000-0000-0000-000000000001
    - Version: KERD-2026-v1.0
    - Contains: risk weights, severity thresholds, veto rules, scoring matrix, SLA config

  2. Notes
    - This is the "Constitution" that the Sentinel Risk Engine reads at runtime
    - Weights: Financial 30%, Legal 25%, Reputation 25%, Operational 20%
    - 5 severity bands from Observation (green) to Critical (bordeaux)
    - 2 veto rules: Shari'ah compliance and Critical Cyber Vulnerability
    - SLA definitions per severity level
*/

INSERT INTO methodology_configs (
  tenant_id,
  version,
  is_active,
  risk_weights,
  scoring_matrix,
  severity_thresholds,
  veto_rules,
  sla_config
) VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'KERD-2026-v1.0',
  true,
  '{
    "financial": 0.30,
    "legal": 0.25,
    "reputation": 0.25,
    "operational": 0.20
  }'::jsonb,
  '{
    "impact_max": 5,
    "likelihood_max": 5,
    "control_effectiveness_max": 5
  }'::jsonb,
  '[
    { "label": "Kritik (Bordo)", "min": 80, "max": 100, "color": "#800000" },
    { "label": "Yuksek (Kizil)", "min": 60, "max": 79.9, "color": "#dc2626" },
    { "label": "Orta (Turuncu)", "min": 30, "max": 59.9, "color": "#f97316" },
    { "label": "Dusuk (Sari)", "min": 10, "max": 29.9, "color": "#eab308" },
    { "label": "Gozlem (Yesil)", "min": 0, "max": 9.9, "color": "#22c55e" }
  ]'::jsonb,
  '[
    { "id": "shariah_veto", "field": "shariah_impact_score", "operator": ">=", "value": 4, "override_severity": "Kritik (Bordo)", "reason": "Seri Uyum Ihlali" },
    { "id": "cyber_veto", "field": "cvss_score", "operator": ">=", "value": 9.0, "override_severity": "Kritik (Bordo)", "reason": "Kritik Siber Zafiyet" }
  ]'::jsonb,
  '{
    "Kritik (Bordo)": { "calendar_days": 15, "sprint_count": 1 },
    "Yuksek (Kizil)": { "calendar_days": 30, "sprint_count": 2 },
    "Orta (Turuncu)": { "calendar_days": 90, "sprint_count": 4 },
    "Dusuk (Sari)": { "calendar_days": 180, "sprint_count": 8 },
    "Gozlem (Yesil)": { "calendar_days": 365, "sprint_count": 0 }
  }'::jsonb
)
ON CONFLICT DO NOTHING;
