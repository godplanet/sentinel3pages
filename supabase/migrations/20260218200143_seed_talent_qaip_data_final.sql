/*
  # Seed: Talent OS & QAIP Demo Data (Final)

  ## All check constraints verified from live DB:
  - qaip_reviews.type / review_type: HOT_REVIEW | COLD_REVIEW | EXTERNAL_REVIEW
  - qaip_reviews.status: OPEN | IN_PROGRESS | COMPLETED | ACCEPTED
  - kudos_transactions.category: TEAMWORK | INNOVATION | LEADERSHIP | QUALITY | MENTORING | GENERAL
  - succession_plans.readiness_level: READY_NOW | READY_1_YEAR | READY_2_YEARS | DEVELOPMENT_NEEDED
  - user_certifications.status: VERIFIED | PENDING | EXPIRED | REVOKED
  - survey_assignments.status: PENDING | IN_PROGRESS | COMPLETED | CANCELLED

  ## All FK constraints verified:
  - qaip_reviews.reviewer_id → auth.users(id)
  - user_certifications.user_id → auth.users(id)
  - succession_plans.key/successor_user_id → auth.users(id)
  - kudos_transactions.sender_id / receiver_id → auth.users(id)
  - survey_assignments.target/evaluator_user_id → auth.users(id)
  Two placeholder auth users are created to satisfy all FK constraints.

  ## Column sets (no tenant_id on user-linked tables, no credential_url on user_certifications)
*/

-- ============================================================
-- 1. SKILL DEFINITIONS LOOKUP TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS skill_definitions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code        text UNIQUE NOT NULL,
  name        text NOT NULL,
  category    text NOT NULL,
  description text,
  tenant_id   uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE skill_definitions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'skill_definitions' AND policyname = 'Anon read skill_definitions') THEN
    CREATE POLICY "Anon read skill_definitions" ON skill_definitions FOR SELECT TO anon USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'skill_definitions' AND policyname = 'Auth read skill_definitions') THEN
    CREATE POLICY "Auth read skill_definitions" ON skill_definitions FOR SELECT TO authenticated USING (true);
  END IF;
END $$;

INSERT INTO skill_definitions (id, code, name, category, description)
SELECT id::uuid, code, name, category, description
FROM (VALUES
  ('d0000000-dd01-4000-8000-000000000001','RISK_ASSESSMENT','Risk Değerlendirmesi','Core Audit','Risklerin tespit edilmesi ve derecelendirilmesi'),
  ('d0000000-dd02-4000-8000-000000000002','CONTROL_TESTING','Kontrol Testi','Core Audit','İç kontrollerin etkinliğinin test edilmesi'),
  ('d0000000-dd03-4000-8000-000000000003','DATA_ANALYTICS','Veri Analitiği','Technology','Büyük veri analizi ve SQL/Python kullanımı'),
  ('d0000000-dd04-4000-8000-000000000004','REPORT_WRITING','Rapor Yazımı','Communication','Yönetim raporları ve bulgu yazımı'),
  ('d0000000-dd05-4000-8000-000000000005','IFRS_ACCOUNTING','TFRS / Muhasebe','Finance','Uluslararası finansal raporlama standartları'),
  ('d0000000-dd06-4000-8000-000000000006','BANKING_REGULATION','Bankacılık Mevzuatı','Compliance','BDDK yönetmelikleri ve SPK düzenlemeleri'),
  ('d0000000-dd07-4000-8000-000000000007','IT_AUDIT','BT Denetimi','Technology','Sistem güvenliği ve siber risk denetimi'),
  ('d0000000-dd08-4000-8000-000000000008','SHARIAH_COMPLIANCE','Katılım Bankacılığı','Domain','Faizsiz finans ve AAOIFI standartları'),
  ('d0000000-dd09-4000-8000-000000000009','INTERVIEW_TECHNIQUE','Mülakat Tekniği','Soft Skills','Kanıt toplama ve sorgulama yöntemleri'),
  ('d0000000-dd10-4000-8000-000000000010','PROJECT_MANAGEMENT','Proje Yönetimi','Soft Skills','Denetim ekibi koordinasyonu ve planlama'),
  ('d0000000-dd11-4000-8000-000000000011','FRAUD_DETECTION','Suistimal Tespiti','Forensics','Hile belirtilerinin tanımlanması'),
  ('d0000000-dd12-4000-8000-000000000012','SOX_ICFR','SOX / İKİK','Compliance','İç kontrol çerçevesi ve SOX uyumu'),
  ('d0000000-dd13-4000-8000-000000000013','ESG_AUDIT','ESG Denetimi','Sustainability','Çevre ve sosyal sorumluluk denetimi'),
  ('d0000000-dd14-4000-8000-000000000014','NEGOTIATION','Müzakere','Soft Skills','Bulgu müzakeresi ve uzlaşı yönetimi'),
  ('d0000000-dd15-4000-8000-000000000015','CREDIT_RISK','Kredi Riski','Finance','Kredi portföyü analizi ve temerrüt modellemesi')
) AS s(id, code, name, category, description)
WHERE NOT EXISTS (SELECT 1 FROM skill_definitions sd WHERE sd.id = s.id::uuid);

-- ============================================================
-- 2. UPDATE TALENT PROFILES
-- ============================================================

UPDATE talent_profiles
SET next_level_xp = 1500,
    skills_snapshot = '{"generated_at":"2026-02-18T10:00:00Z","skills":[{"skill_name":"Risk Değerlendirmesi","proficiency_level":5,"earned_xp":2800,"last_updated":"2026-02-01T00:00:00Z"},{"skill_name":"Bankacılık Mevzuatı","proficiency_level":5,"earned_xp":3100,"last_updated":"2026-01-15T00:00:00Z"},{"skill_name":"Rapor Yazımı","proficiency_level":5,"earned_xp":2400,"last_updated":"2026-02-10T00:00:00Z"},{"skill_name":"Proje Yönetimi","proficiency_level":4,"earned_xp":1800,"last_updated":"2026-01-20T00:00:00Z"},{"skill_name":"Müzakere","proficiency_level":5,"earned_xp":2200,"last_updated":"2026-02-05T00:00:00Z"}],"radar_labels":["Risk","Mevzuat","Raporlama","Proje Yönetimi","Müzakere"],"radar_values":[5,5,5,4,5]}'::jsonb,
    updated_at = now()
WHERE id = 'ff100000-0000-0000-0000-000000000001';

UPDATE talent_profiles
SET next_level_xp = 3500,
    skills_snapshot = '{"generated_at":"2026-02-18T10:00:00Z","skills":[{"skill_name":"Kontrol Testi","proficiency_level":4,"earned_xp":1200,"last_updated":"2026-02-01T00:00:00Z"},{"skill_name":"Veri Analitiği","proficiency_level":4,"earned_xp":1400,"last_updated":"2026-01-28T00:00:00Z"},{"skill_name":"BT Denetimi","proficiency_level":3,"earned_xp":900,"last_updated":"2026-01-10T00:00:00Z"},{"skill_name":"Risk Değerlendirmesi","proficiency_level":4,"earned_xp":1600,"last_updated":"2026-02-08T00:00:00Z"},{"skill_name":"Rapor Yazımı","proficiency_level":3,"earned_xp":800,"last_updated":"2026-01-25T00:00:00Z"}],"radar_labels":["Kontrol","Veri","BT","Risk","Raporlama"],"radar_values":[4,4,3,4,3]}'::jsonb,
    updated_at = now()
WHERE id = 'ff100000-0000-0000-0000-000000000002';

UPDATE talent_profiles
SET next_level_xp = 7000,
    skills_snapshot = '{"generated_at":"2026-02-18T10:00:00Z","skills":[{"skill_name":"Katılım Bankacılığı","proficiency_level":5,"earned_xp":4200,"last_updated":"2026-02-15T00:00:00Z"},{"skill_name":"Risk Değerlendirmesi","proficiency_level":4,"earned_xp":2100,"last_updated":"2026-02-01T00:00:00Z"},{"skill_name":"Suistimal Tespiti","proficiency_level":3,"earned_xp":700,"last_updated":"2026-01-20T00:00:00Z"},{"skill_name":"Veri Analitiği","proficiency_level":3,"earned_xp":950,"last_updated":"2026-01-30T00:00:00Z"},{"skill_name":"Bankacılık Mevzuatı","proficiency_level":4,"earned_xp":1750,"last_updated":"2026-02-10T00:00:00Z"}],"radar_labels":["Katılım","Risk","Suistimal","Veri","Mevzuat"],"radar_values":[5,4,3,3,4]}'::jsonb,
    updated_at = now()
WHERE id = 'ff100000-0000-0000-0000-000000000003';

-- ============================================================
-- 3. TALENT SKILLS
-- ============================================================

INSERT INTO talent_skills (id, auditor_id, skill_name, proficiency_level, earned_xp, tenant_id)
SELECT s.id::uuid, s.auditor_id::uuid, s.skill_name, s.proficiency_level, s.earned_xp, '00000000-0000-0000-0000-000000000001'
FROM (VALUES
  ('d1000000-0001-4000-8000-000000000001','ff100000-0000-0000-0000-000000000001','Risk Değerlendirmesi',5,2800),
  ('d1000000-0002-4000-8000-000000000002','ff100000-0000-0000-0000-000000000001','Bankacılık Mevzuatı',5,3100),
  ('d1000000-0003-4000-8000-000000000003','ff100000-0000-0000-0000-000000000001','Rapor Yazımı',5,2400),
  ('d1000000-0004-4000-8000-000000000004','ff100000-0000-0000-0000-000000000001','Proje Yönetimi',4,1800),
  ('d1000000-0005-4000-8000-000000000005','ff100000-0000-0000-0000-000000000001','Müzakere',5,2200),
  ('d1000000-0006-4000-8000-000000000006','ff100000-0000-0000-0000-000000000001','TFRS / Muhasebe',4,1600),
  ('d1000000-0007-4000-8000-000000000007','ff100000-0000-0000-0000-000000000001','Suistimal Tespiti',4,1400),
  ('d1000000-0008-4000-8000-000000000008','ff100000-0000-0000-0000-000000000001','SOX / İKİK',3,900),
  ('d1000000-0009-4000-8000-000000000009','ff100000-0000-0000-0000-000000000002','Kontrol Testi',4,1200),
  ('d1000000-0010-4000-8000-000000000010','ff100000-0000-0000-0000-000000000002','Veri Analitiği',4,1400),
  ('d1000000-0011-4000-8000-000000000011','ff100000-0000-0000-0000-000000000002','BT Denetimi',3,900),
  ('d1000000-0012-4000-8000-000000000012','ff100000-0000-0000-0000-000000000002','Risk Değerlendirmesi',4,1600),
  ('d1000000-0013-4000-8000-000000000013','ff100000-0000-0000-0000-000000000002','Rapor Yazımı',3,800),
  ('d1000000-0014-4000-8000-000000000014','ff100000-0000-0000-0000-000000000002','Mülakat Tekniği',3,750),
  ('d1000000-0015-4000-8000-000000000015','ff100000-0000-0000-0000-000000000002','Bankacılık Mevzuatı',3,850),
  ('d1000000-0016-4000-8000-000000000016','ff100000-0000-0000-0000-000000000002','TFRS / Muhasebe',2,400),
  ('d1000000-0017-4000-8000-000000000017','ff100000-0000-0000-0000-000000000003','Katılım Bankacılığı',5,4200),
  ('d1000000-0018-4000-8000-000000000018','ff100000-0000-0000-0000-000000000003','Risk Değerlendirmesi',4,2100),
  ('d1000000-0019-4000-8000-000000000019','ff100000-0000-0000-0000-000000000003','Suistimal Tespiti',3,700),
  ('d1000000-0020-4000-8000-000000000020','ff100000-0000-0000-0000-000000000003','Veri Analitiği',3,950),
  ('d1000000-0021-4000-8000-000000000021','ff100000-0000-0000-0000-000000000003','Bankacılık Mevzuatı',4,1750),
  ('d1000000-0022-4000-8000-000000000022','ff100000-0000-0000-0000-000000000003','ESG Denetimi',3,650),
  ('d1000000-0023-4000-8000-000000000023','ff100000-0000-0000-0000-000000000003','Kredi Riski',4,1300),
  ('d1000000-0024-4000-8000-000000000024','ff100000-0000-0000-0000-000000000003','Kontrol Testi',3,780)
) AS s(id, auditor_id, skill_name, proficiency_level, earned_xp)
WHERE NOT EXISTS (SELECT 1 FROM talent_skills ts WHERE ts.id = s.id::uuid);

-- ============================================================
-- 4. AUTH-DEPENDENT DATA
-- ============================================================

DO $$
DECLARE
  v_uid1 uuid := 'b0000000-0001-4000-8000-000000000001';
  v_uid2 uuid := 'b0000000-0002-4000-8000-000000000002';
BEGIN
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, role, aud)
  VALUES
    (v_uid1, 'hakan.yilmaz@sentinel.internal', crypt('Sentinel1!', gen_salt('bf')), now(), now(), now(), 'authenticated', 'authenticated'),
    (v_uid2, 'ayse.demir@sentinel.internal',   crypt('Sentinel1!', gen_salt('bf')), now(), now(), now(), 'authenticated', 'authenticated')
  ON CONFLICT (id) DO NOTHING;

  -- QAIP Reviews
  INSERT INTO qaip_reviews (id, audit_id, reviewer_id, type, score, review_type, status, findings, notes, created_at, updated_at)
  SELECT r.id::uuid, r.audit_id::uuid, v_uid1, r.rtype, r.score::numeric, r.rtype, r.status, r.findings::jsonb, r.notes,
         now() - r.days_ago * interval '1 day', now()
  FROM (VALUES
    ('d2000000-0001-4000-8000-000000000001','e0000000-0000-0000-0000-000000000001','COLD_REVIEW',88,'COMPLETED',
     '{"summary":"Çalışma kağıtları yeterli kanıt içermekte, metodoloji uyumlu.","issues":["Örnekleme büyüklüğü dokümante edilmemiş","Zaman izleme eksik"],"positive":["Bulgu yazımı güçlü","Risk değerlendirmesi kapsamlı"],"score":88}',
     'GIAS 2024 Madde 8.3 uyarınca soğuk inceleme tamamlandı.',5),
    ('d2000000-0002-4000-8000-000000000002','e0000000-0000-0000-0000-000000000002','COLD_REVIEW',74,'COMPLETED',
     '{"summary":"Denetim dosyası tamamlanmış ancak bazı eksikler mevcut.","issues":["İmza zinciri tamamlanmamış","RCA yetersiz derinlikte"],"positive":["Kapsam doğru belirlenmiş"],"score":74}',
     'BT denetimi dosyası incelemesi — kalite artırım alanları tespit edildi.',12)
  ) AS r(id, audit_id, rtype, score, status, findings, notes, days_ago)
  WHERE NOT EXISTS (SELECT 1 FROM qaip_reviews qr WHERE qr.id = r.id::uuid);

  -- User Certifications
  INSERT INTO user_certifications (id, user_id, name, issuer, issue_date, expiry_date, status)
  SELECT s.id::uuid, s.uid::uuid, s.name, s.issuer, s.issue_date::date, s.expiry_date::date, s.status
  FROM (VALUES
    ('d3000000-0001-4000-8000-000000000001',v_uid1::text,'CIA',        'IIA',                     '2018-03-15','2027-03-15','VERIFIED'),
    ('d3000000-0002-4000-8000-000000000002',v_uid1::text,'CISA',       'ISACA',                   '2019-06-20','2026-06-20','VERIFIED'),
    ('d3000000-0003-4000-8000-000000000003',v_uid1::text,'TKBB Uzmanlığı','TKBB',                 '2020-09-01',NULL,        'VERIFIED'),
    ('d3000000-0004-4000-8000-000000000004',v_uid2::text,'CISA',       'ISACA',                   '2021-05-10','2027-05-10','VERIFIED'),
    ('d3000000-0005-4000-8000-000000000005',v_uid2::text,'CIA',        'IIA',                     '2022-08-22','2028-08-22','VERIFIED'),
    ('d3000000-0006-4000-8000-000000000006',v_uid2::text,'SMMM',       'TÜRMOB',                  '2023-01-15',NULL,        'VERIFIED'),
    ('d3000000-0007-4000-8000-000000000007',v_uid1::text,'CFE',        'ACFE',                    '2017-11-05','2025-11-05','EXPIRED'),
    ('d3000000-0008-4000-8000-000000000008',v_uid2::text,'SPK Düzey 3','Sermaye Piyasası Kurulu', '2020-04-18',NULL,        'VERIFIED'),
    ('d3000000-0009-4000-8000-000000000009',v_uid1::text,'CRISC',      'ISACA',                   '2024-03-01','2030-03-01','PENDING')
  ) AS s(id, uid, name, issuer, issue_date, expiry_date, status)
  WHERE NOT EXISTS (SELECT 1 FROM user_certifications uc WHERE uc.id = s.id::uuid);

  -- Succession Plans
  INSERT INTO succession_plans (id, key_position_user_id, successor_user_id, readiness_level, notes)
  VALUES
    ('d4000000-0001-4000-8000-000000000001', v_uid1, v_uid2, 'READY_1_YEAR',
     'Aday, CAE rolü için teknik hazırlığını tamamlamaktadır. Liderlik gelişim programı devam ediyor.'),
    ('d4000000-0002-4000-8000-000000000002', v_uid2, v_uid1, 'READY_NOW',
     'Kıdemli denetçi pozisyonuna geçiş için hazır.')
  ON CONFLICT (id) DO NOTHING;

  -- Kudos Transactions (valid categories: TEAMWORK, INNOVATION, LEADERSHIP, QUALITY, MENTORING, GENERAL)
  INSERT INTO kudos_transactions (id, sender_id, receiver_id, amount, message, category)
  VALUES
    ('d5000000-0001-4000-8000-000000000001', v_uid1, v_uid2, 50,
     'BT denetiminde gösterdiği mükemmel veri analizi becerileri için. Ekip performansına büyük katkı sağladı.', 'QUALITY'),
    ('d5000000-0002-4000-8000-000000000002', v_uid2, v_uid1, 30,
     'Zorlu müzakere sürecindeki rehberlik ve mentorluk için teşekkürler.', 'MENTORING'),
    ('d5000000-0003-4000-8000-000000000003', v_uid1, v_uid2, 25,
     'QAIP soğuk inceleme sürecine gösterdiği özverili katkı için.', 'TEAMWORK'),
    ('d5000000-0004-4000-8000-000000000004', v_uid2, v_uid1, 40,
     'Yapay zeka destekli risk modeli önerisi ile süreçleri iyileştirdi.', 'INNOVATION')
  ON CONFLICT (id) DO NOTHING;

  -- Survey Assignments
  INSERT INTO survey_assignments (id, template_id, target_user_id, evaluator_user_id, status, due_date)
  SELECT s.id::uuid, s.template_id::uuid, s.target::uuid, s.evaluator::uuid, s.status, s.due_date::date
  FROM (VALUES
    ('d6000000-0001-4000-8000-000000000001','cc000000-0011-4000-8000-000000000011',v_uid2::text,v_uid1::text,'COMPLETED','2026-01-31'),
    ('d6000000-0002-4000-8000-000000000002','cc000000-0012-4000-8000-000000000012',v_uid1::text,v_uid1::text,'IN_PROGRESS','2026-02-28'),
    ('d6000000-0003-4000-8000-000000000003','cc000000-0011-4000-8000-000000000011',v_uid1::text,v_uid1::text,'PENDING','2026-03-15')
  ) AS s(id, template_id, target, evaluator, status, due_date)
  WHERE NOT EXISTS (SELECT 1 FROM survey_assignments sa WHERE sa.id = s.id::uuid)
    AND EXISTS (SELECT 1 FROM survey_templates st WHERE st.id = s.template_id::uuid);

END $$;
