/*
  # Academy LMS — Seed Data

  ## Contents
  - 2 Courses: "Advanced Murabaha Audit" + "Cybersecurity Basics for Auditors"
  - 2 Exams (one per course, passing score 70%, 30 min)
  - 5 Questions per exam (10 total) with realistic banking/audit content
  - 3 Training Assignments linked to real talent_profiles users
  - 3 CPE Records demonstrating the credit-tracking system

  ## UUID Convention
  - courses       : ca000001-...-001, ca000002-...-002
  - exams         : cb000001-...-001, cb000002-...-002
  - questions     : cc000001-...-001 through cc000010-...-010
  - assignments   : cd000001-...-001 through cd000003-...-003
  - cpe_records   : ce000001-...-001 through ce000003-...-003
*/

-- ─────────────────────────────────────────────────────────────────────────────
-- COURSES
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO academy_courses
  (id, title, description, category, xp_reward, estimated_duration, difficulty, tags)
VALUES
(
  'ca000001-0000-0000-0000-000000000001',
  'Advanced Murabaha Audit',
  'Katılım bankacılığında kullanılan mürâbaha sözleşmelerinin IIA standartları ve AAOIFI çerçevesinde derinlemesine denetimi. Akad yapısı, fiyatlama sorunları, tescil süreçleri ve Şeriat Kurulu koordinasyonu ele alınmaktadır.',
  'shariah',
  250,
  90,
  'advanced',
  ARRAY['shariah', 'murabaha', 'AAOIFI', 'islamic-finance', 'katilim-bankaciligi']
),
(
  'ca000002-0000-0000-0000-000000000002',
  'Cybersecurity Basics for Auditors',
  'Denetçiler için siber güvenlik temelleri: tehdit vektörleri, BDDK BT Yönetmeliği gereksinimleri, SWIFT CSCF kontrolleri, kimlik yönetimi ve penetrasyon testi yorumlama. Saha denetimlerinde IT bulgularını raporlama pratikleri.',
  'cyber',
  200,
  60,
  'intermediate',
  ARRAY['cybersecurity', 'BDDK', 'SWIFT', 'IT-audit', 'KVKK']
)
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- EXAMS
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO academy_exams
  (id, course_id, title, description, passing_score, time_limit_minutes, max_attempts, randomize_questions)
VALUES
(
  'cb000001-0000-0000-0000-000000000001',
  'ca000001-0000-0000-0000-000000000001',
  'Mürâbaha Denetim Yetkinlik Sınavı',
  'AAOIFI FAS 28/32 ve TKBB standartları kapsamında mürâbaha akitlerinin denetiminde temel kavramlar.',
  70,
  30,
  3,
  true
),
(
  'cb000002-0000-0000-0000-000000000002',
  'ca000002-0000-0000-0000-000000000002',
  'Siber Güvenlik Denetim Temelleri Sınavı',
  'BDDK BT Yönetmeliği, SWIFT CSCF ve temel siber tehdit kategorileri.',
  70,
  30,
  3,
  true
)
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- QUESTIONS — EXAM 1: Advanced Murabaha Audit (5 questions)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO academy_questions
  (id, exam_id, question_text, options, correct_option_id, points, explanation, order_index)
VALUES
(
  'cc000001-0000-0000-0000-000000000001',
  'cb000001-0000-0000-0000-000000000001',
  'AAOIFI FAS 28 standardına göre, bir mürâbaha işleminde bankanın varlığı fiilen teslim almadan müşteriye satması durumunda ne tür bir ihlal söz konusudur?',
  jsonb_build_array(
    jsonb_build_object('id','a','text','Likidite riski ihlali'),
    jsonb_build_object('id','b','text','Sahip olunmayan varlığın satışı (Bay al-Malum) yasağı ihlali'),
    jsonb_build_object('id','c','text','Kâr haddi limiti aşımı'),
    jsonb_build_object('id','d','text','Tescil gecikmesi ihlali')
  ),
  'b',
  2,
  'AAOIFI FAS 28, bankanın henüz mülkiyete geçmediği varlığı satamayacağını açıkça düzenler. Bu, Şeriat''ın "sahip olmadığını satma" yasağından kaynaklanır.',
  1
),
(
  'cc000002-0000-0000-0000-000000000002',
  'cb000001-0000-0000-0000-000000000001',
  'Mürâbaha sözleşmesinde "gecikme zammı" uygulaması Şeriat açısından hangi koşulda kabul edilebilir?',
  jsonb_build_array(
    jsonb_build_object('id','a','text','Hiçbir koşulda; tüm gecikme ödemeleri riba sayılır'),
    jsonb_build_object('id','b','text','BDDK onayı alınmış olmak koşuluyla serbesttir'),
    jsonb_build_object('id','c','text','Yalnızca hayır kurumlarına bağışlanmak üzere toplanabilir, gelir olarak kaydedilemez'),
    jsonb_build_object('id','d','text','Enflasyon endeksli tutarla sınırlı olmak koşuluyla gelir yazılabilir')
  ),
  'c',
  2,
  'AAOIFI ve TKBB standartlarına göre gecikme zammı tahsil edilebilir; ancak bankanın geliri olarak kaydedilemez, tamamı hayır/sosyal fona aktarılmalıdır.',
  2
),
(
  'cc000003-0000-0000-0000-000000000003',
  'cb000001-0000-0000-0000-000000000001',
  'Denetçi, bir mürâbaha dosyasında imza sirkülerinin fotokopi olduğunu tespit etmiştir. Bu bulgulama KERD-2026 çerçevesinde hangi kategoriye girer?',
  jsonb_build_array(
    jsonb_build_object('id','a','text','Bordo (kritik) — doğrudan finansal kayba yol açar'),
    jsonb_build_object('id','b','text','Kızıl (yüksek) — mevzuat ihlali'),
    jsonb_build_object('id','c','text','Gözlem — öneri niteliğinde, yaptırım gerektirmez'),
    jsonb_build_object('id','d','text','Turuncu (orta) — süreç zayıflığı')
  ),
  'c',
  2,
  'Fotokopi imza sirküleri düşük risk taşır ve doğrudan finansal etki yaratmaz. KERD-2026 kategorisinde yaptırım gerektirmeyen "Gözlem" olarak sınıflandırılır.',
  3
),
(
  'cc000004-0000-0000-0000-000000000004',
  'cb000001-0000-0000-0000-000000000001',
  'Mürâbaha akdinde "tescil" adımının denetimi sırasında denetçi öncelikle aşağıdakilerden hangisini doğrulamalıdır?',
  jsonb_build_array(
    jsonb_build_object('id','a','text','Varlığın piyasa değerinin kredi tutarının üzerinde olduğunu'),
    jsonb_build_object('id','b','text','Tapu/tescil belgesinin akitten önce alındığını ve bankanın mülkiyet zincirinde göründüğünü'),
    jsonb_build_object('id','c','text','Kâr oranının TCMB politika faizini aşmadığını'),
    jsonb_build_object('id','d','text','Müşterinin KKB puanının yeterli olduğunu')
  ),
  'b',
  2,
  'Şeriat sahih akdi için varlığın akitten önce bankaya intikal etmesi gerekir. Denetçi, tapu/tescil belgesiyle bankanın fiili sahipliğini teyit etmelidir.',
  4
),
(
  'cc000005-0000-0000-0000-000000000005',
  'cb000001-0000-0000-0000-000000000001',
  'Bir katılım bankasında toplu mürâbaha portföyünün yüzde kaçında örneklem denetimi yapılması IIA Standart 2320 kapsamında "yeterli" kabul edilir?',
  jsonb_build_array(
    jsonb_build_object('id','a','text','Her zaman %100 inceleme zorunludur'),
    jsonb_build_object('id','b','text','Risk tabanlı örneklem; tüm yüksek riskli dosyalar artı istatistiksel seçim'),
    jsonb_build_object('id','c','text','En az %25 sabit oran yeterlidir'),
    jsonb_build_object('id','d','text','Örneklem büyüklüğü Şeriat Kurulu''nun kararına bırakılır')
  ),
  'b',
  2,
  'IIA Standart 2320, denetçinin risk tabanlı yaklaşımla örneklem büyüklüğünü belirlemesini öngörür. Yüksek riskli dosyaların tamamı dahil edilmeli, kalan kısım istatistiksel örneklemle seçilmelidir.',
  5
),

-- ─────────────────────────────────────────────────────────────────────────────
-- QUESTIONS — EXAM 2: Cybersecurity Basics (5 questions)
-- ─────────────────────────────────────────────────────────────────────────────
(
  'cc000006-0000-0000-0000-000000000006',
  'cb000002-0000-0000-0000-000000000002',
  'BDDK BT Yönetmeliği kapsamında, kritik bir bankacılık sisteminin RTO (Recovery Time Objective) hedefi en fazla kaç saat olarak tanımlanmıştır?',
  jsonb_build_array(
    jsonb_build_object('id','a','text','30 dakika'),
    jsonb_build_object('id','b','text','2 saat'),
    jsonb_build_object('id','c','text','4 saat'),
    jsonb_build_object('id','d','text','24 saat')
  ),
  'b',
  2,
  'BDDK BT Yönetmeliği''nde kritik sistemler için maksimum RTO 2 saat olarak belirlenmiştir. Bu süreyi aşan DR tatbikat sonuçları kızıl bulgu olarak raporlanmalıdır.',
  1
),
(
  'cc000007-0000-0000-0000-000000000007',
  'cb000002-0000-0000-0000-000000000002',
  'SWIFT CSCF v2024 kapsamında, aşağıdakilerden hangisi "zorunlu" kontrol kategorisinde yer ALMAZ?',
  jsonb_build_array(
    jsonb_build_object('id','a','text','1.1 — SWIFT ortamının kısıtlanması'),
    jsonb_build_object('id','b','text','2.2 — Güvenlik güncellemelerinin uygulanması'),
    jsonb_build_object('id','c','text','6.1 — Operatör kimlik doğrulama'),
    jsonb_build_object('id','d','text','3.1 — Fiziksel güvenlik — isteğe bağlı kontrol')
  ),
  'd',
  2,
  'SWIFT CSCF 3.1 Fiziksel Güvenlik, "advisory" (tavsiye niteliğinde) kontroldür, zorunlu değildir. 1.1, 2.2 ve 6.1 mandatory kontrollerdir.',
  2
),
(
  'cc000008-0000-0000-0000-000000000008',
  'cb000002-0000-0000-0000-000000000002',
  'Bir fidye yazılımı saldırısında ilk tespit edilen gösterge aşağıdakilerden hangisidir?',
  jsonb_build_array(
    jsonb_build_object('id','a','text','Sistemlerde toplu dosya uzantısı değişimi (.locked, .enc)'),
    jsonb_build_object('id','b','text','Ağ trafiğinde ani düşüş'),
    jsonb_build_object('id','c','text','İnsan kaynakları sisteminde işe alım artışı'),
    jsonb_build_object('id','d','text','Muhasebe hesaplarında dengesizlik')
  ),
  'a',
  2,
  'Ransomware''ın karakteristik ilk belirtisi dosya uzantılarının şifrelenmiş formatlara (örn. .locked, .enc) dönüşmesidir. SIEM sistemleri bu anomaliyi MDE kurallarıyla tetiklemelidir.',
  3
),
(
  'cc000009-0000-0000-0000-000000000009',
  'cb000002-0000-0000-0000-000000000002',
  'KVKK kapsamında müşteri "Silme Talebi" için maksimum yanıt süresi kaç gündür?',
  jsonb_build_array(
    jsonb_build_object('id','a','text','7 gün'),
    jsonb_build_object('id','b','text','15 gün'),
    jsonb_build_object('id','c','text','30 gün'),
    jsonb_build_object('id','d','text','60 gün')
  ),
  'c',
  2,
  'KVKK Madde 13 kapsamında veri sorumlusu, başvuruya 30 gün içinde yanıt vermelidir. Bu süreyi aşmak idari para cezasına yol açabilir.',
  4
),
(
  'cc000010-0000-0000-0000-000000000010',
  'cb000002-0000-0000-0000-000000000002',
  'Denetçi, bir kullanıcının 3 yıldır değiştirilmemiş BT sistemleri parolasını tespit etmiştir. Bu bulgu Bilgi Güvenliği denetiminde hangi kontrol zafiyetine işaret eder?',
  jsonb_build_array(
    jsonb_build_object('id','a','text','Yetkilendirme matrisindeki görev ayrılığı ihlali'),
    jsonb_build_object('id','b','text','Parola politikasının (Password Policy) zorlamasının devre dışı olması'),
    jsonb_build_object('id','c','text','Penetrasyon testi eksikliği'),
    jsonb_build_object('id','d','text','Felaket kurtarma planı boşluğu')
  ),
  'b',
  2,
  'Parolanın periyodik değiştirilmemesi, IAM (Identity & Access Management) kapsamındaki Parola Politikası kontrolünün teknik zorlama mekanizmasının çalışmadığına işaret eder.',
  5
)
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- TRAINING ASSIGNMENTS (linked to existing talent_profiles users)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO training_assignments
  (id, user_id, course_id, assigned_by, due_date, status, priority, notes)
VALUES
(
  'cd000001-0000-0000-0000-000000000001',
  'ff100000-0000-0000-0000-000000000004',
  'ca000001-0000-0000-0000-000000000001',
  'ff100000-0000-0000-0000-000000000006',
  CURRENT_DATE + INTERVAL '30 days',
  'assigned',
  'mandatory',
  'Katılım bankacılığı portföyü büyüdü; tüm kıdemli denetçilere zorunlu.'
),
(
  'cd000002-0000-0000-0000-000000000002',
  'ff100000-0000-0000-0000-000000000005',
  'ca000002-0000-0000-0000-000000000002',
  'ff100000-0000-0000-0000-000000000006',
  CURRENT_DATE + INTERVAL '14 days',
  'in_progress',
  'high',
  'BDDK BT denetim süreci başlamadan önce tamamlanmalı.'
),
(
  'cd000003-0000-0000-0000-000000000003',
  'ff100000-0000-0000-0000-000000000006',
  'ca000001-0000-0000-0000-000000000001',
  'ff100000-0000-0000-0000-000000000006',
  CURRENT_DATE + INTERVAL '60 days',
  'assigned',
  'normal',
  'Yönetici kendi portföyünü güncelliyor.'
)
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- USER CPE RECORDS
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO user_cpe_records
  (id, user_id, title, provider, credit_hours, status, date_earned, notes)
VALUES
(
  'ce000001-0000-0000-0000-000000000001',
  'ff100000-0000-0000-0000-000000000004',
  'IIA Türkiye Yıllık Konferansı 2024',
  'IIA Türkiye Enstitüsü',
  16.00,
  'approved',
  '2024-10-05',
  '2 günlük konferans — tüm oturumlara katılım belgesi ibraz edildi.'
),
(
  'ce000002-0000-0000-0000-000000000002',
  'ff100000-0000-0000-0000-000000000005',
  'AAOIFI Uluslararası Sertifika Programı — Modül 3',
  'AAOIFI',
  8.00,
  'approved',
  '2024-09-12',
  'Online program; sertifika numarası: AAOIFI-2024-TR-0187'
),
(
  'ce000003-0000-0000-0000-000000000003',
  'ff100000-0000-0000-0000-000000000005',
  'Siber Güvenlik ve Banka Denetimi Webineri',
  'BDDK Eğitim Birimi',
  4.00,
  'pending',
  '2024-11-20',
  'Katılım belgesi onay sürecinde.'
)
ON CONFLICT (id) DO NOTHING;
