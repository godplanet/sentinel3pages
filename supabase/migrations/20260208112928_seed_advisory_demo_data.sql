/*
  # Seed Advisory Services Demo Data

  1. Data Seeded
    - 1 advisory request from HR Department: "Design new Recruitment Process"
    - 1 approved advisory request for IT Department
    - 2 advisory engagements (one active, one completed)
    - 3 advisory insights across the engagements
    - 1 independence conflict record for "Auditor Alice" on HR Department

  2. Purpose
    - Demonstrates the advisory intake workflow
    - Tests the independence guardrail with an active cooling-off period
    - Populates the Insights Kanban board with sample observations

  3. Important Notes
    - Uses existing audit_entities for department references
    - The conflict record blocks "Auditor Alice" from assurance work on HR for 1 year
*/

DO $$
DECLARE
  v_hr_entity_id UUID;
  v_it_entity_id UUID;
  v_req1_id UUID;
  v_req2_id UUID;
  v_eng1_id UUID;
  v_eng2_id UUID;
BEGIN
  SELECT id INTO v_hr_entity_id
  FROM audit_entities
  WHERE LOWER(name) LIKE '%insan%' OR LOWER(name) LIKE '%hr%' OR LOWER(name) LIKE '%ik %'
  LIMIT 1;

  IF v_hr_entity_id IS NULL THEN
    SELECT id INTO v_hr_entity_id FROM audit_entities LIMIT 1;
  END IF;

  SELECT id INTO v_it_entity_id
  FROM audit_entities
  WHERE LOWER(name) LIKE '%bilgi%' OR LOWER(name) LIKE '%it %' OR LOWER(name) LIKE '%teknoloji%'
  LIMIT 1;

  IF v_it_entity_id IS NULL THEN
    SELECT id INTO v_it_entity_id
    FROM audit_entities
    WHERE id != v_hr_entity_id
    LIMIT 1;
  END IF;

  INSERT INTO advisory_requests (id, department_id, title, problem_statement, desired_outcome, status)
  VALUES (
    gen_random_uuid(),
    v_hr_entity_id,
    'Yeni Ise Alim Sureci Tasarimi',
    'Mevcut ise alim surecimiz cok uzun suruyor ve aday deneyimi zayif. Sureci bastan tasarlamamiz gerekiyor.',
    'Daha hizli, daha seffaf ve uyum standartlarina uygun bir ise alim sureci.',
    'APPROVED'
  )
  RETURNING id INTO v_req1_id;

  INSERT INTO advisory_requests (id, department_id, title, problem_statement, desired_outcome, status)
  VALUES (
    gen_random_uuid(),
    v_it_entity_id,
    'BT Felaket Kurtarma Plani Gozden Gecirme',
    'Mevcut DR planlarimizin guncelligini ve etkinligini degerlendirmemiz gerekiyor.',
    'Guncellenmis DR prosedürleri ve test senaryolari.',
    'PENDING'
  )
  RETURNING id INTO v_req2_id;

  INSERT INTO advisory_engagements (id, request_id, title, scope_limitations, management_responsibility_confirmed, start_date, target_date, status, methodology)
  VALUES (
    gen_random_uuid(),
    v_req1_id,
    'IK Ise Alim Sureci Yeniden Tasarimi',
    'Bu danismanlik hizmeti yalnizca beyaz yaka ise alim surecini kapsar. Toplu ise alim ve stajyer programlari kapsam disidir. Ic denetim birimi tavsiyelerde bulunur; uygulama sorumlulugu tamamen IK Mudurlugune aittir.',
    true,
    CURRENT_DATE - INTERVAL '30 days',
    CURRENT_DATE + INTERVAL '30 days',
    'FIELDWORK',
    'PROCESS_DESIGN'
  )
  RETURNING id INTO v_eng1_id;

  INSERT INTO advisory_engagements (id, request_id, title, scope_limitations, management_responsibility_confirmed, start_date, target_date, status, methodology)
  VALUES (
    gen_random_uuid(),
    NULL,
    'Kredi Operasyonlari Kontrol Degerlendirmesi',
    'Yalnizca bireysel kredi operasyonlari incelenecektir.',
    true,
    CURRENT_DATE - INTERVAL '90 days',
    CURRENT_DATE - INTERVAL '30 days',
    'COMPLETED',
    'WORKSHOP'
  )
  RETURNING id INTO v_eng2_id;

  INSERT INTO advisory_insights (engagement_id, title, observation, recommendation, impact_level, status)
  VALUES
    (
      v_eng1_id,
      'Aday Degerlendirme Sureci Cok Uzun',
      'Mevcut aday degerlendirme sureci ortalama 45 gun surmektedir. Sektor ortalamasi 21 gundur.',
      'Degerlendirme asamalarini 3''ten 2''ye indirmeyi ve dijital degerlendirme araclari kullanmayi degerlendirmenizi oneriyoruz.',
      'OPERATIONAL',
      'SHARED'
    ),
    (
      v_eng1_id,
      'Referans Kontrol Eksikligi',
      'Son 6 ayda ise alinan personelin %40''i icin referans kontrolu yapilmadigi gorulmustur.',
      'Referans kontrolunun zorunlu bir adim olarak surece eklenmesini ve bu adim tamamlanmadan teklifin gonderilmemesini oneriyoruz.',
      'STRATEGIC',
      'DRAFT'
    ),
    (
      v_eng2_id,
      'Otomasyon Firsati',
      'Kredi onay surecinde manuel veri girisi yapilan 12 farkli nokta tespit edilmistir.',
      'RPA (Robotik Surec Otomasyonu) ile en az 8 noktanin otomatiklestirilebilecegini degerlendirmenizi oneriyoruz.',
      'FINANCIAL',
      'ACCEPTED'
    );

  IF v_hr_entity_id IS NOT NULL THEN
    INSERT INTO independence_conflict_log (auditor_id, entity_id, engagement_id, engagement_end_date)
    SELECT
      auth.uid(),
      v_hr_entity_id,
      v_eng1_id,
      CURRENT_DATE
    WHERE auth.uid() IS NOT NULL;

    IF NOT FOUND THEN
      INSERT INTO independence_conflict_log (entity_id, engagement_id, engagement_end_date)
      VALUES (v_hr_entity_id, v_eng1_id, CURRENT_DATE);
    END IF;
  END IF;

END $$;
