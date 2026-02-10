/*
  # Seed Talent OS Demo Data

  1. Data Seeded
    - 5 Auditor Personas with distinct profiles
    - Skill matrix entries for each auditor across 6 domains
    - 4 Audit Service Templates

  2. Notes
    - Burak Yilmaz has RED fatigue (85/100) to demonstrate warning system
    - Each auditor has unique skill distribution reflecting their persona
*/

DO $$
DECLARE
  v_elif uuid;
  v_mert uuid;
  v_zeynep uuid;
  v_burak uuid;
  v_selin uuid;
BEGIN

INSERT INTO talent_profiles (
  full_name, title, department, total_xp, current_level,
  fatigue_score, burnout_zone, last_audit_date,
  consecutive_high_stress_projects, active_hours_last_3_weeks,
  travel_load, is_available
) VALUES (
  'Elif Kaya', 'Expert', 'BT Denetimi', 12500, 5,
  32.0, 'GREEN', '2026-01-20',
  0, 95.0, 15.0, true
) RETURNING id INTO v_elif;

INSERT INTO talent_profiles (
  full_name, title, department, total_xp, current_level,
  fatigue_score, burnout_zone, last_audit_date,
  consecutive_high_stress_projects, active_hours_last_3_weeks,
  travel_load, is_available
) VALUES (
  'Mert Demir', 'Senior', 'Uyum Denetimi', 7800, 4,
  58.0, 'AMBER', '2026-01-28',
  2, 115.0, 45.0, true
) RETURNING id INTO v_mert;

INSERT INTO talent_profiles (
  full_name, title, department, total_xp, current_level,
  fatigue_score, burnout_zone, last_audit_date,
  consecutive_high_stress_projects, active_hours_last_3_weeks,
  travel_load, is_available
) VALUES (
  'Zeynep Arslan', 'Junior', 'Genel Denetim', 1200, 1,
  18.0, 'GREEN', '2026-02-01',
  0, 60.0, 5.0, true
) RETURNING id INTO v_zeynep;

INSERT INTO talent_profiles (
  full_name, title, department, total_xp, current_level,
  fatigue_score, burnout_zone, last_audit_date,
  consecutive_high_stress_projects, active_hours_last_3_weeks,
  travel_load, is_available
) VALUES (
  'Burak Yilmaz', 'Manager', 'Veri Analizi', 9400, 4,
  85.0, 'RED', '2026-02-03',
  4, 155.0, 72.0, false
) RETURNING id INTO v_burak;

INSERT INTO talent_profiles (
  full_name, title, department, total_xp, current_level,
  fatigue_score, burnout_zone, last_audit_date,
  consecutive_high_stress_projects, active_hours_last_3_weeks,
  travel_load, is_available
) VALUES (
  'Selin Ozturk', 'Senior', 'Mali Denetim', 6500, 3,
  25.0, 'GREEN', '2026-01-15',
  1, 80.0, 20.0, true
) RETURNING id INTO v_selin;

-- Elif Kaya Skills
INSERT INTO talent_skills (auditor_id, skill_name, proficiency_level, earned_xp) VALUES
  (v_elif, 'Cyber', 5, 4200),
  (v_elif, 'DataAnalytics', 4, 2800),
  (v_elif, 'RiskMgmt', 3, 1900),
  (v_elif, 'Finance', 2, 1200),
  (v_elif, 'Compliance', 2, 1100),
  (v_elif, 'Shariah', 1, 300);

-- Mert Demir Skills
INSERT INTO talent_skills (auditor_id, skill_name, proficiency_level, earned_xp) VALUES
  (v_mert, 'Shariah', 5, 3500),
  (v_mert, 'Compliance', 4, 2100),
  (v_mert, 'RiskMgmt', 3, 1200),
  (v_mert, 'Finance', 3, 900),
  (v_mert, 'Cyber', 1, 200),
  (v_mert, 'DataAnalytics', 1, 100);

-- Zeynep Arslan Skills
INSERT INTO talent_skills (auditor_id, skill_name, proficiency_level, earned_xp) VALUES
  (v_zeynep, 'Compliance', 2, 400),
  (v_zeynep, 'Finance', 2, 350),
  (v_zeynep, 'RiskMgmt', 1, 200),
  (v_zeynep, 'DataAnalytics', 1, 150),
  (v_zeynep, 'Cyber', 1, 100),
  (v_zeynep, 'Shariah', 1, 50);

-- Burak Yilmaz Skills (RED ZONE)
INSERT INTO talent_skills (auditor_id, skill_name, proficiency_level, earned_xp) VALUES
  (v_burak, 'DataAnalytics', 5, 4000),
  (v_burak, 'Cyber', 3, 1800),
  (v_burak, 'RiskMgmt', 4, 2200),
  (v_burak, 'Finance', 2, 800),
  (v_burak, 'Compliance', 2, 500),
  (v_burak, 'Shariah', 1, 100);

-- Selin Ozturk Skills
INSERT INTO talent_skills (auditor_id, skill_name, proficiency_level, earned_xp) VALUES
  (v_selin, 'Compliance', 4, 2600),
  (v_selin, 'Finance', 4, 2400),
  (v_selin, 'RiskMgmt', 3, 1500),
  (v_selin, 'Shariah', 2, 600),
  (v_selin, 'Cyber', 1, 200),
  (v_selin, 'DataAnalytics', 2, 700);

END $$;

-- Service Templates (outside PL/pgSQL block)
INSERT INTO audit_service_templates (service_name, description, required_skills, standard_duration_sprints, complexity) VALUES
(
  'BT Derinlemesine Denetim',
  'Kapsamli bilgi teknolojileri altyapi ve guvenlik denetimi',
  '{"Cyber": 4, "DataAnalytics": 3, "RiskMgmt": 2}'::jsonb,
  4, 'HIGH'
),
(
  'Sube Denetimi',
  'Standart banka subesi operasyonel denetimi',
  '{"Compliance": 3, "Finance": 3, "RiskMgmt": 2}'::jsonb,
  2, 'MEDIUM'
),
(
  'Islami Finans Uyum Incelemesi',
  'Seriat uyumluluk ve sukuk portfoy denetimi',
  '{"Shariah": 4, "Compliance": 3, "Finance": 2}'::jsonb,
  3, 'HIGH'
),
(
  'Veri Analizi Sprinti',
  'Hizli veri odakli anomali tespiti ve analiz calismasi',
  '{"DataAnalytics": 4, "Cyber": 2}'::jsonb,
  1, 'MEDIUM'
);
