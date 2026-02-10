/*
  # Seed Cybersecurity Audit Engagement

  1. Data Seeded
    - 1 Engagement: "Siber Guvenlik Derin Denetimi 2026-Q1"
    - 4 Sprints with goals:
      Sprint 1: Kapsam & Planlama (Scoping)
      Sprint 2: Teknik Test (Penetration/Vuln Testing)
      Sprint 3: Musteri Dogrulama (Client Validation)
      Sprint 4: Raporlama & Kapani (Reporting)
    - 12 Audit Tasks distributed across sprints
    - Tasks assigned to seeded talent profiles (Elif, Zeynep, Burak)
*/

DO $$
DECLARE
  v_template_id uuid;
  v_engagement_id uuid;
  v_sprint1 uuid;
  v_sprint2 uuid;
  v_sprint3 uuid;
  v_sprint4 uuid;
  v_elif uuid;
  v_zeynep uuid;
  v_burak uuid;
BEGIN

SELECT id INTO v_template_id FROM audit_service_templates
  WHERE service_name = 'BT Derinlemesine Denetim' LIMIT 1;

SELECT id INTO v_elif FROM talent_profiles WHERE full_name = 'Elif Kaya' LIMIT 1;
SELECT id INTO v_zeynep FROM talent_profiles WHERE full_name = 'Zeynep Arslan' LIMIT 1;
SELECT id INTO v_burak FROM talent_profiles WHERE full_name = 'Burak Yilmaz' LIMIT 1;

INSERT INTO audit_engagements_v2 (
  title, description, service_template_id, status, total_sprints,
  start_date, end_date, team_members
) VALUES (
  'Siber Guvenlik Derin Denetimi 2026-Q1',
  'Merkez BT altyapisi, ag guvenligi, erisim yonetimi ve veri koruma kontrollerinin kapsamli denetimi',
  v_template_id, 'ACTIVE', 4,
  '2026-02-03', '2026-03-28',
  '[]'::jsonb
) RETURNING id INTO v_engagement_id;

-- Sprint 1
INSERT INTO audit_sprints (
  engagement_id, sprint_number, title, goal, start_date, end_date, status
) VALUES (
  v_engagement_id, 1,
  'Sprint 1: Kapsam & Planlama',
  'Denetim kapsamini belirle, risk degerlendirmesini tamamla, is programini olustur',
  '2026-02-03', '2026-02-14', 'COMPLETED'
) RETURNING id INTO v_sprint1;

-- Sprint 2
INSERT INTO audit_sprints (
  engagement_id, sprint_number, title, goal, start_date, end_date, status
) VALUES (
  v_engagement_id, 2,
  'Sprint 2: Teknik Test & Analiz',
  'Penetrasyon testleri, guvenlik acigi taramasi, erisim kontrol testleri',
  '2026-02-17', '2026-02-28', 'ACTIVE'
) RETURNING id INTO v_sprint2;

-- Sprint 3
INSERT INTO audit_sprints (
  engagement_id, sprint_number, title, goal, start_date, end_date, status
) VALUES (
  v_engagement_id, 3,
  'Sprint 3: Musteri Dogrulama',
  'Bulgulari musteriye sun, yanit ve aksiyonlari topla, dogrulama yap',
  '2026-03-03', '2026-03-14', 'PLANNED'
) RETURNING id INTO v_sprint3;

-- Sprint 4
INSERT INTO audit_sprints (
  engagement_id, sprint_number, title, goal, start_date, end_date, status
) VALUES (
  v_engagement_id, 4,
  'Sprint 4: Raporlama & Kapani',
  'Nihai raporu hazirla, yonetim sunumunu yap, dosyayi kapat',
  '2026-03-17', '2026-03-28', 'PLANNED'
) RETURNING id INTO v_sprint4;

-- ========== Sprint 1 Tasks (COMPLETED) ==========
INSERT INTO audit_tasks (sprint_id, engagement_id, title, description, assigned_to, assigned_name, status, priority, story_points) VALUES
(v_sprint1, v_engagement_id, 'Risk degerlendirme toplantisi', 'BT ekibi ile risk degerlendirme calistayi duzenle', v_elif, 'Elif Kaya', 'DONE', 'HIGH', 3),
(v_sprint1, v_engagement_id, 'Kapsam dokumani hazirla', 'Denetim kapsam ve sinirlarini belgele', v_zeynep, 'Zeynep Arslan', 'DONE', 'MEDIUM', 2),
(v_sprint1, v_engagement_id, 'PBC listesi olustur', 'Musteriden talep edilecek belge listesini hazirla', v_zeynep, 'Zeynep Arslan', 'DONE', 'MEDIUM', 2);

-- ========== Sprint 2 Tasks (ACTIVE - mix of statuses) ==========
INSERT INTO audit_tasks (sprint_id, engagement_id, title, description, assigned_to, assigned_name, status, priority, validation_status, story_points) VALUES
(v_sprint2, v_engagement_id, 'Ag guvenlik duvari kural analizi', 'Firewall kurallarini incele, gereksiz acik portlari tespit et', v_elif, 'Elif Kaya', 'DONE', 'CRITICAL', 'VALIDATED', 5),
(v_sprint2, v_engagement_id, 'Erisim kontrol matrisi testi', 'Rol bazli erisim kontrollerini dogrula', v_elif, 'Elif Kaya', 'IN_PROGRESS', 'HIGH', 'OPEN', 3),
(v_sprint2, v_engagement_id, 'Zafiyet tarama raporu', 'Otomatik zafiyet tarama araclarini calistir ve raporla', v_burak, 'Burak Yilmaz', 'CLIENT_REVIEW', 'HIGH', 'CLIENT_REVIEW', 5),
(v_sprint2, v_engagement_id, 'Veri siniflandirma kontrolu', 'Hassas veri siniflandirma politikalarinin uygulanmasini test et', v_zeynep, 'Zeynep Arslan', 'TODO', 'MEDIUM', 'OPEN', 2),
(v_sprint2, v_engagement_id, 'Yedekleme ve felaket kurtarma testi', 'Backup prosedurlerini ve DR planini dogrula', v_elif, 'Elif Kaya', 'TODO', 'HIGH', 'OPEN', 3);

-- ========== Sprint 3 Tasks (PLANNED) ==========
INSERT INTO audit_tasks (sprint_id, engagement_id, title, description, assigned_to, assigned_name, status, priority, story_points) VALUES
(v_sprint3, v_engagement_id, 'Bulgu taslak sunumu', 'Tespit edilen bulgulari yonetime sun', v_elif, 'Elif Kaya', 'TODO', 'HIGH', 3),
(v_sprint3, v_engagement_id, 'Musteri yanit toplama', 'Bulgu yanitlarini ve aksiyon planlarini topla', v_zeynep, 'Zeynep Arslan', 'TODO', 'MEDIUM', 2);

-- ========== Sprint 4 Tasks (PLANNED) ==========
INSERT INTO audit_tasks (sprint_id, engagement_id, title, description, assigned_to, assigned_name, status, priority, story_points) VALUES
(v_sprint4, v_engagement_id, 'Nihai rapor hazirla', 'Tum bulgulari ve onerileri icerecek nihai raporu yaz', v_elif, 'Elif Kaya', 'TODO', 'CRITICAL', 5),
(v_sprint4, v_engagement_id, 'Yonetim sunumu', 'Ust yonetim icin ozet sunum hazirla', v_elif, 'Elif Kaya', 'TODO', 'HIGH', 3);

END $$;
