/*
  # Create Missing Talent Skills & Service Templates Tables

  1. New Tables
    - `talent_skills` - Auditor skill proficiency tracking
      - `id` (uuid, PK), `auditor_id` (FK), `skill_name`, `proficiency_level`, `earned_xp`, `tenant_id`, `created_at`, `updated_at`
    - `audit_service_templates` - Standard audit service definitions with required skills
      - `id` (uuid, PK), `service_name`, `description`, `required_skills`, `standard_duration_sprints`, `complexity`, `tenant_id`, `created_at`, `updated_at`

  2. Security
    - RLS enabled on both tables
    - Permissive anon policies for demo environment

  3. Seed Data
    - Skills for existing talent_profiles
    - 5 audit service templates
*/

-- talent_skills
CREATE TABLE IF NOT EXISTS talent_skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auditor_id uuid NOT NULL REFERENCES talent_profiles(id) ON DELETE CASCADE,
  skill_name text NOT NULL DEFAULT '',
  proficiency_level integer NOT NULL DEFAULT 1 CHECK (proficiency_level BETWEEN 1 AND 5),
  earned_xp integer NOT NULL DEFAULT 0,
  tenant_id uuid NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE talent_skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_talent_skills_select" ON talent_skills FOR SELECT TO anon USING (true);
CREATE POLICY "anon_talent_skills_insert" ON talent_skills FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_talent_skills_update" ON talent_skills FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_talent_skills_delete" ON talent_skills FOR DELETE TO anon USING (true);

-- audit_service_templates
CREATE TABLE IF NOT EXISTS audit_service_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_name text NOT NULL,
  description text NOT NULL DEFAULT '',
  required_skills jsonb NOT NULL DEFAULT '{}'::jsonb,
  standard_duration_sprints integer NOT NULL DEFAULT 2,
  complexity text NOT NULL DEFAULT 'MEDIUM' CHECK (complexity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  tenant_id uuid NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE audit_service_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_service_tpl_select" ON audit_service_templates FOR SELECT TO anon USING (true);
CREATE POLICY "anon_service_tpl_insert" ON audit_service_templates FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_service_tpl_update" ON audit_service_templates FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- ===== SEED DATA =====

-- Inject skills for existing talent_profiles
INSERT INTO talent_skills (auditor_id, skill_name, proficiency_level, earned_xp, tenant_id)
SELECT
  tp.id,
  s.skill_name,
  s.proficiency_level,
  s.earned_xp,
  tp.tenant_id
FROM talent_profiles tp
CROSS JOIN (
  VALUES
    ('Risk Analizi', 4, 850),
    ('Saha Denetimi', 3, 620),
    ('IT Denetimi', 2, 380),
    ('Finansal Denetim', 4, 920),
    ('MASAK/AML', 3, 550),
    ('Veri Analitiği', 3, 480)
) AS s(skill_name, proficiency_level, earned_xp)
WHERE tp.id IN (SELECT id FROM talent_profiles ORDER BY created_at LIMIT 4);

INSERT INTO talent_skills (auditor_id, skill_name, proficiency_level, earned_xp, tenant_id)
SELECT
  tp.id,
  s.skill_name,
  s.proficiency_level,
  s.earned_xp,
  tp.tenant_id
FROM talent_profiles tp
CROSS JOIN (
  VALUES
    ('Risk Analizi', 2, 280),
    ('Saha Denetimi', 4, 780),
    ('Uyum Denetimi', 3, 510),
    ('Operasyonel Denetim', 4, 860)
) AS s(skill_name, proficiency_level, earned_xp)
WHERE tp.id IN (SELECT id FROM talent_profiles ORDER BY created_at OFFSET 4 LIMIT 4);

-- Audit Service Templates
INSERT INTO audit_service_templates (id, service_name, description, required_skills, standard_duration_sprints, complexity) VALUES
  ('ac100000-0000-0000-0000-000000000001', 'Kredi Sureci Denetimi',
   'Kredi tahsis, kullandirma ve takip sureclerinin kapsamli denetimi',
   '{"Finansal Denetim": 4, "Risk Analizi": 3, "Veri Analitigi": 2}'::jsonb, 3, 'HIGH'),
  ('ac100000-0000-0000-0000-000000000002', 'IT Genel Kontrol Denetimi',
   'Bilgi teknolojileri genel kontrollerinin COBIT cercevesinde denetimi',
   '{"IT Denetimi": 4, "Veri Analitigi": 3, "Uyum Denetimi": 2}'::jsonb, 4, 'CRITICAL'),
  ('ac100000-0000-0000-0000-000000000003', 'Sube Denetimi (Standart)',
   'Standart sube operasyonlari denetim programi',
   '{"Saha Denetimi": 3, "Operasyonel Denetim": 3, "MASAK/AML": 2}'::jsonb, 2, 'MEDIUM'),
  ('ac100000-0000-0000-0000-000000000004', 'MASAK Uyum Denetimi',
   'Suc gelirlerinin aklanmasinin onlenmesi mevzuat uyum denetimi',
   '{"MASAK/AML": 4, "Uyum Denetimi": 4, "Risk Analizi": 3}'::jsonb, 3, 'HIGH'),
  ('ac100000-0000-0000-0000-000000000005', 'Hazine Operasyonlari Denetimi',
   'Hazine islemleri ve piyasa riski yonetimi surec denetimi',
   '{"Finansal Denetim": 4, "Risk Analizi": 4, "Veri Analitigi": 3}'::jsonb, 3, 'CRITICAL');
