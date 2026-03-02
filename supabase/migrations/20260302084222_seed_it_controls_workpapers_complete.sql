/*
  # Seed IT General Controls - Workpapers & All Detail Data

  Full seed: audit steps, workpapers, test steps, evidence requests,
  workpaper findings, review notes, activity logs.
*/

-- IT Audit Steps
INSERT INTO audit_steps (id, engagement_id, step_code, title, description, risk_weight) VALUES
('60000000-0000-0000-0000-000000000001','c0200000-0000-0000-0000-000000000001','IT-001','Şifre Karmaşıklık Politikası','Sistem genelinde şifre politikalarının etkinliğini doğrula',0.90),
('60000000-0000-0000-0000-000000000002','c0200000-0000-0000-0000-000000000001','IT-002','Çok Faktörlü Kimlik Doğrulama','MFA uygulamasının kritik sistemlerdeki kapsamını denetle',0.95),
('60000000-0000-0000-0000-000000000003','c0200000-0000-0000-0000-000000000001','IT-003','Kullanıcı Erişim Gözden Geçirmesi','Periyodik erişim inceleme prosedürlerini doğrula',0.85),
('60000000-0000-0000-0000-000000000004','c0200000-0000-0000-0000-000000000001','IT-004','Ayrıcalıklı Hesap Yönetimi','Süper kullanıcı ve yönetici hesaplarının kontrolünü denetle',0.95),
('60000000-0000-0000-0000-000000000005','c0200000-0000-0000-0000-000000000001','IT-005','Güvenlik Duvarı Kural Gözden Geçirmesi','Güvenlik duvarı kural setinin geçerliliğini doğrula',0.80),
('60000000-0000-0000-0000-000000000006','c0200000-0000-0000-0000-000000000001','IT-006','Yama Yönetimi','Kritik yamalar için güncelleme zamanlamasını denetle',0.85),
('60000000-0000-0000-0000-000000000007','c0200000-0000-0000-0000-000000000001','IT-007','Değişiklik Yönetimi Süreci','Onaylı değişiklik kontrol prosedürlerine uyumu doğrula',0.80),
('60000000-0000-0000-0000-000000000008','c0200000-0000-0000-0000-000000000001','IT-008','Yedekleme ve Kurtarma','Yedekleme bütünlüğü ve kurtarma testi doğrulaması',0.90),
('60000000-0000-0000-0000-000000000009','c0200000-0000-0000-0000-000000000001','IT-009','Olay Yanıt Prosedürleri','Güvenlik olayı yönetim sürecini gözden geçir',0.85),
('60000000-0000-0000-0000-000000000010','c0200000-0000-0000-0000-000000000001','IT-010','Fiziksel Güvenlik Kontrolleri','Veri merkezi erişim kontrol mekanizmalarını denetle',0.70),
('60000000-0000-0000-0000-000000000011','c0200000-0000-0000-0000-000000000001','IT-011','Veri Şifreleme Standartları','Bekleme ve iletim sırasındaki şifreleme uygulamalarını doğrula',0.90),
('60000000-0000-0000-0000-000000000012','c0200000-0000-0000-0000-000000000001','IT-012','Ağ Segmentasyonu','VLAN ve ağ bölümleme kontrollerinin uygunluğunu denetle',0.75),
('60000000-0000-0000-0000-000000000013','c0200000-0000-0000-0000-000000000001','IT-013','Güvenlik Açığı Yönetimi','Güvenlik açığı tarama ve giderme süreçlerini doğrula',0.85),
('60000000-0000-0000-0000-000000000014','c0200000-0000-0000-0000-000000000001','IT-014','Üçüncü Taraf Erişim Denetimi','Satıcı ve üçüncü taraf sistem erişim kontrollerini gözden geçir',0.80),
('60000000-0000-0000-0000-000000000015','c0200000-0000-0000-0000-000000000001','IT-015','Log Yönetimi ve İzleme','Güvenlik loglarının merkezi toplanması ve uyarı mekanizmalarını denetle',0.85)
ON CONFLICT (id) DO NOTHING;

-- Workpapers
INSERT INTO workpapers (id, step_id, status, approval_status, prepared_by_name, reviewed_by_name, prepared_at, reviewed_at, total_hours_spent, data, version) VALUES
('f0000000-0000-0000-0000-000000000001','60000000-0000-0000-0000-000000000001','finalized','reviewed','Ahmet Yılmaz','Mehmet Kaya','2026-02-10T10:00:00Z','2026-02-12T14:00:00Z',8.5,'{"control_ref":"IT-001","test_result":"PASS","tod":"EFFECTIVE","toe":"EFFECTIVE","sample_size":25}',2),
('f0000000-0000-0000-0000-000000000002','60000000-0000-0000-0000-000000000002','review','prepared','Ayşe Demir',null,'2026-02-11T09:00:00Z',null,6.0,'{"control_ref":"IT-002","test_result":"FAIL","tod":"INEFFECTIVE","toe":"INEFFECTIVE","sample_size":30}',2),
('f0000000-0000-0000-0000-000000000003','60000000-0000-0000-0000-000000000003','finalized','reviewed','Ahmet Yılmaz','Mehmet Kaya','2026-02-08T11:00:00Z','2026-02-10T16:00:00Z',7.0,'{"control_ref":"IT-003","test_result":"PASS","tod":"EFFECTIVE","toe":"EFFECTIVE","sample_size":20}',2),
('f0000000-0000-0000-0000-000000000004','60000000-0000-0000-0000-000000000004','review','prepared','Burak Şahin',null,'2026-02-12T08:00:00Z',null,5.5,'{"control_ref":"IT-004","test_result":"FAIL","tod":"INEFFECTIVE","toe":"NOT_STARTED","sample_size":15}',2),
('f0000000-0000-0000-0000-000000000005','60000000-0000-0000-0000-000000000005','review','prepared','Ayşe Demir',null,'2026-02-13T10:00:00Z',null,4.0,'{"control_ref":"IT-005","test_result":"PASS","tod":"EFFECTIVE","toe":"EFFECTIVE","sample_size":10}',1),
('f0000000-0000-0000-0000-000000000006','60000000-0000-0000-0000-000000000006','draft','in_progress',null,null,null,null,2.0,'{"control_ref":"IT-006","test_result":"PENDING","tod":"NOT_STARTED","toe":"NOT_STARTED","sample_size":20}',1),
('f0000000-0000-0000-0000-000000000007','60000000-0000-0000-0000-000000000007','finalized','reviewed','Burak Şahin','Mehmet Kaya','2026-02-09T09:00:00Z','2026-02-11T11:00:00Z',6.5,'{"control_ref":"IT-007","test_result":"PASS","tod":"EFFECTIVE","toe":"EFFECTIVE","sample_size":25}',2),
('f0000000-0000-0000-0000-000000000008','60000000-0000-0000-0000-000000000008','review','prepared','Ahmet Yılmaz',null,'2026-02-14T08:00:00Z',null,5.0,'{"control_ref":"IT-008","test_result":"PASS","tod":"EFFECTIVE","toe":"EFFECTIVE","sample_size":5}',1),
('f0000000-0000-0000-0000-000000000009','60000000-0000-0000-0000-000000000009','draft','in_progress',null,null,null,null,1.5,'{"control_ref":"IT-009","test_result":"PENDING","tod":"NOT_STARTED","toe":"NOT_STARTED","sample_size":10}',1),
('f0000000-0000-0000-0000-000000000010','60000000-0000-0000-0000-000000000010','finalized','reviewed','Ayşe Demir','Selin Arslan','2026-02-07T10:00:00Z','2026-02-09T15:00:00Z',4.5,'{"control_ref":"IT-010","test_result":"PASS","tod":"EFFECTIVE","toe":"EFFECTIVE","sample_size":8}',2),
('f0000000-0000-0000-0000-000000000011','60000000-0000-0000-0000-000000000011','review','prepared','Burak Şahin',null,'2026-02-13T14:00:00Z',null,6.0,'{"control_ref":"IT-011","test_result":"FAIL","tod":"INEFFECTIVE","toe":"INEFFECTIVE","sample_size":20}',2),
('f0000000-0000-0000-0000-000000000012','60000000-0000-0000-0000-000000000012','draft','in_progress',null,null,null,null,0.5,'{"control_ref":"IT-012","test_result":"PENDING","tod":"NOT_STARTED","toe":"NOT_STARTED","sample_size":15}',1),
('f0000000-0000-0000-0000-000000000013','60000000-0000-0000-0000-000000000013','finalized','reviewed','Ahmet Yılmaz','Mehmet Kaya','2026-02-06T09:00:00Z','2026-02-08T17:00:00Z',8.0,'{"control_ref":"IT-013","test_result":"FAIL","tod":"INEFFECTIVE","toe":"EFFECTIVE","sample_size":30}',2),
('f0000000-0000-0000-0000-000000000014','60000000-0000-0000-0000-000000000014','review','prepared','Ayşe Demir',null,'2026-02-14T11:00:00Z',null,3.5,'{"control_ref":"IT-014","test_result":"PASS","tod":"EFFECTIVE","toe":"EFFECTIVE","sample_size":12}',1),
('f0000000-0000-0000-0000-000000000015','60000000-0000-0000-0000-000000000015','draft','in_progress',null,null,null,null,1.0,'{"control_ref":"IT-015","test_result":"PENDING","tod":"NOT_STARTED","toe":"NOT_STARTED","sample_size":25}',1)
ON CONFLICT (id) DO NOTHING;

-- Test Steps
INSERT INTO workpaper_test_steps (id, workpaper_id, step_order, description, is_completed, auditor_comment) VALUES
('70000000-0000-0000-0000-000000000001','f0000000-0000-0000-0000-000000000001',1,'Şifre politikası belgesini ve son güncellemesini talep et ve incele.',true,'Politika belgelendi, son revizyon Aralık 2025.'),
('70000000-0000-0000-0000-000000000002','f0000000-0000-0000-0000-000000000001',2,'Active Directory GPO ayarlarından minimum şifre uzunluğunu doğrula.',true,'GPO ekran görüntüsü alındı, 12 karakter minimum uygulandı.'),
('70000000-0000-0000-0000-000000000003','f0000000-0000-0000-0000-000000000001',3,'Son 90 günde zayıf şifre kullanan hesapları tespit et.',true,'Sıfır zayıf şifre tespit edildi.'),
('70000000-0000-0000-0000-000000000004','f0000000-0000-0000-0000-000000000002',1,'MFA politikasının kapsamını ve muafiyet listesini dokümante et.',true,'Muafiyet listesinde 23 yönetici hesabı var, gerekçe eksik.'),
('70000000-0000-0000-0000-000000000005','f0000000-0000-0000-0000-000000000002',2,'Kritik sistemlere (core banking) MFA zorunluluğunu test et.',true,'Core banking sisteminde MFA bypass tespit edildi – BULGU OLUŞTURULDU.'),
('70000000-0000-0000-0000-000000000006','f0000000-0000-0000-0000-000000000002',3,'Son 30 günün başarısız MFA denemelerini analiz et.',true,'Raporlanan 147 başarısız deneme, 3 hesap kilitli.'),
('70000000-0000-0000-0000-000000000007','f0000000-0000-0000-0000-000000000002',4,'Yönetici hesapları için MFA zorunluluğunun istisnasız uygulandığını doğrula.',false,'Henüz tamamlanmadı.'),
('70000000-0000-0000-0000-000000000008','f0000000-0000-0000-0000-000000000003',1,'Son 90 günde erişim yetkisi verilen kullanıcıların listesini al.',true,'IAM sisteminden 312 kullanıcı listesi alındı.'),
('70000000-0000-0000-0000-000000000009','f0000000-0000-0000-0000-000000000003',2,'Ayrılan çalışanların hesaplarının kapatıldığını doğrula.',true,'Tüm 18 ayrılan çalışanın hesabı zamanında kapatılmış.'),
('70000000-0000-0000-0000-000000000010','f0000000-0000-0000-0000-000000000003',3,'Yönetici onayı olmadan eklenen ayrıcalıklı erişimleri tespit et.',true,'Tüm ayrıcalıklı erişimler onaylı.'),
('70000000-0000-0000-0000-000000000011','f0000000-0000-0000-0000-000000000004',1,'Domain Admin hesaplarının tam listesini al.',true,'47 Domain Admin hesabı tespit edildi.'),
('70000000-0000-0000-0000-000000000012','f0000000-0000-0000-0000-000000000004',2,'Her Domain Admin hesabının aktif iş gerekçesini doğrula.',true,'12 hesabın gerekçesi yok – BULGU: ayrıcalık sürünmesi.'),
('70000000-0000-0000-0000-000000000013','f0000000-0000-0000-0000-000000000004',3,'Süper kullanıcı hesaplarının PAM sistemi üzerinden yönetildiğini doğrula.',false,'PAM entegrasyon doğrulaması bekliyor.'),
('70000000-0000-0000-0000-000000000014','f0000000-0000-0000-0000-000000000005',1,'Tüm güvenlik duvarı kural setini dışa aktar ve belgele.',true,'2.847 kural indirildi.'),
('70000000-0000-0000-0000-000000000015','f0000000-0000-0000-0000-000000000005',2,'Son 6 ayda gözden geçirilmemiş ANY/ANY kurallarını tespit et.',true,'3 ANY/ANY kural tespit edildi.'),
('70000000-0000-0000-0000-000000000016','f0000000-0000-0000-0000-000000000005',3,'Onay belgesi olmadan eklenen kural değişikliklerini kontrol et.',true,'Tüm değişiklikler ticket ile desteklenmiş.'),
('70000000-0000-0000-0000-000000000017','f0000000-0000-0000-0000-000000000007',1,'Son 3 ayın değişiklik kayıtlarını al (CAB onaylı).',true,'184 değişiklik kaydı incelendi.'),
('70000000-0000-0000-0000-000000000018','f0000000-0000-0000-0000-000000000007',2,'Test ortamında doğrulama yapılmadan canlıya alınan değişiklikleri bul.',true,'Sıfır istisnasız değişiklik.'),
('70000000-0000-0000-0000-000000000019','f0000000-0000-0000-0000-000000000007',3,'Acil değişiklik prosedürüne uyumu gözden geçir.',true,'Tüm 6 acil değişiklik için sonradan onay alınmış.'),
('70000000-0000-0000-0000-000000000020','f0000000-0000-0000-0000-000000000008',1,'Yedekleme politikasını ve son test raporunu al.',true,'Haftalık yedekleme doğrulaması mevcut.'),
('70000000-0000-0000-0000-000000000021','f0000000-0000-0000-0000-000000000008',2,'Son 30 günde başarısız yedekleme sayısını doğrula.',true,'2 başarısız yedekleme, her ikisi de yeniden çalıştırılmış.'),
('70000000-0000-0000-0000-000000000022','f0000000-0000-0000-0000-000000000011',1,'Veri sınıflandırma envanterini al.',true,'3 kritik veri tabanı incelendi – biri TLS 1.0 kullanıyor.'),
('70000000-0000-0000-0000-000000000023','f0000000-0000-0000-0000-000000000011',2,'At-rest şifreleme konfigürasyonlarını doğrula.',true,'Birincil veri tabanı şifrelenmemiş – KRİTİK BULGU.'),
('70000000-0000-0000-0000-000000000024','f0000000-0000-0000-0000-000000000011',3,'Anahtar yönetimi prosedürlerini incele.',false,'KMS denetim raporu bekleniyor.')
ON CONFLICT (id) DO NOTHING;

-- Evidence Requests
INSERT INTO evidence_requests (id, workpaper_id, title, description, status, due_date) VALUES
('80000000-0000-0000-0000-000000000001','f0000000-0000-0000-0000-000000000001','Active Directory GPO Dışa Aktarımı','Şifre politikası GPO ayarlarının ekran görüntüsü ve dışa aktarımı','accepted','2026-02-08T23:59:00Z'),
('80000000-0000-0000-0000-000000000002','f0000000-0000-0000-0000-000000000002','MFA Muafiyet Listesi','MFA muafiyetleri ve iş gerekçelerini içeren liste','submitted','2026-02-10T23:59:00Z'),
('80000000-0000-0000-0000-000000000003','f0000000-0000-0000-0000-000000000002','MFA Reddedilen Erişim Logları','Son 30 günlük başarısız MFA girişim logları','accepted','2026-02-09T23:59:00Z'),
('80000000-0000-0000-0000-000000000004','f0000000-0000-0000-0000-000000000003','IAM Kullanıcı Listesi','Tüm aktif kullanıcıları ve erişim rollerini içeren liste','accepted','2026-02-06T23:59:00Z'),
('80000000-0000-0000-0000-000000000005','f0000000-0000-0000-0000-000000000004','Domain Admin Hesap Listesi','Aktif Domain Admin hesaplarının tam listesi','accepted','2026-02-11T23:59:00Z'),
('80000000-0000-0000-0000-000000000006','f0000000-0000-0000-0000-000000000004','PAM Sistem Konfigürasyonu','PAM çözümü konfigürasyon ve kapsam belgesi','pending','2026-02-16T23:59:00Z'),
('80000000-0000-0000-0000-000000000007','f0000000-0000-0000-0000-000000000005','Güvenlik Duvarı Kural Seti','Tüm güvenlik duvarı kurallarının dışa aktarımı','accepted','2026-02-12T23:59:00Z'),
('80000000-0000-0000-0000-000000000008','f0000000-0000-0000-0000-000000000008','Yedekleme Test Raporu','Son 3 aylık yedekleme doğrulama test raporu','submitted','2026-02-13T23:59:00Z'),
('80000000-0000-0000-0000-000000000009','f0000000-0000-0000-0000-000000000011','Şifreleme Konfigürasyon Raporu','Tüm veritabanları için şifreleme yapılandırması belgesi','submitted','2026-02-12T23:59:00Z'),
('80000000-0000-0000-0000-000000000010','f0000000-0000-0000-0000-000000000013','Güvenlik Açığı Tarama Raporu','Son üç aylık güvenlik açığı tarama sonuçları','accepted','2026-02-05T23:59:00Z')
ON CONFLICT (id) DO NOTHING;

-- Workpaper Findings
INSERT INTO workpaper_findings (id, workpaper_id, title, description, severity, source_ref) VALUES
('90000000-0000-0000-0000-000000000001','f0000000-0000-0000-0000-000000000002','Core Banking MFA Bypass Tespiti','Core banking sistemine erişimde MFA bypass mekanizması tespit edilmiştir. Servis hesapları MFA gereksinimine tabi tutulmadan kritik işlemler yapabilmektedir.','CRITICAL','IT-002'),
('90000000-0000-0000-0000-000000000002','f0000000-0000-0000-0000-000000000004','Ayrıcalıklı Hesap Sürünmesi','47 Domain Admin hesabından 12 tanesinin aktif iş gerekçesi bulunmamaktadır.','HIGH','IT-004'),
('90000000-0000-0000-0000-000000000003','f0000000-0000-0000-0000-000000000011','Birincil Veritabanı Şifreleme Eksikliği','Müşteri verilerini barındıran birincil MSSQL veritabanında at-rest şifreleme (TDE) aktif değildir. KVKK ve BDDK düzenlemelerine aykırılık teşkil eder.','CRITICAL','IT-011'),
('90000000-0000-0000-0000-000000000004','f0000000-0000-0000-0000-000000000013','Kritik Güvenlik Açıkları Giderme Gecikmesi','CVSS 9.0+ skoruna sahip 4 güvenlik açığı 90+ günden bu yana açık durumda. 30 günlük SLA ihlali.','HIGH','IT-013'),
('90000000-0000-0000-0000-000000000005','f0000000-0000-0000-0000-000000000002','MFA Muafiyet Yönetimi Eksikliği','23 yönetici hesabının MFA muafiyet listesinde bulunması için geçerli iş gerekçesi dokümante edilmemiştir.','MEDIUM','IT-002')
ON CONFLICT (id) DO NOTHING;

-- Review Notes
INSERT INTO review_notes (id, workpaper_id, note_text, author_name, status, field_key) VALUES
('b1000000-0000-0000-0000-000000000001','f0000000-0000-0000-0000-000000000002','MFA bypass bulgusunun 5-Why RCA analizi tamamlanmalı. Sistemik kök neden analizi yapılmadan kapatılamaz.','Mehmet Kaya','Open','general'),
('b1000000-0000-0000-0000-000000000002','f0000000-0000-0000-0000-000000000004','PAM entegrasyon doğrulaması tamamlanmadan bu çalışma kağıdını onaylamak mümkün değil. Lütfen 3. test adımını tamamlayın.','Selin Arslan','Open','general'),
('b1000000-0000-0000-0000-000000000003','f0000000-0000-0000-0000-000000000001','GPO dışa aktarımı yeterli. Bulgu yok. Onaylandı.','Mehmet Kaya','Resolved','general'),
('b1000000-0000-0000-0000-000000000004','f0000000-0000-0000-0000-000000000011','KVKK ihlali riski nedeniyle bu bulgu ivediyle yönetim bildirimine yükseltilmelidir.','Selin Arslan','Open','general'),
('b1000000-0000-0000-0000-000000000005','f0000000-0000-0000-0000-000000000003','Örneklem boyutu yeterli. Sonuçlar tatmin edici. Onaylandı.','Mehmet Kaya','Resolved','general')
ON CONFLICT (id) DO NOTHING;

-- Activity Logs
INSERT INTO workpaper_activity_logs (id, workpaper_id, user_name, action_type, details) VALUES
('c1000000-0000-0000-0000-000000000001','f0000000-0000-0000-0000-000000000001','Ahmet Yılmaz','STATUS_CHANGE','Çalışma kağıdı taslak durumundan inceleme durumuna geçirildi.'),
('c1000000-0000-0000-0000-000000000002','f0000000-0000-0000-0000-000000000001','Ahmet Yılmaz','SIGN_OFF','Denetçi imzası: Hazırlayan – Ahmet Yılmaz'),
('c1000000-0000-0000-0000-000000000003','f0000000-0000-0000-0000-000000000001','Mehmet Kaya','SIGN_OFF','Supervizör imzası: Gözden Geçiren – Mehmet Kaya'),
('c1000000-0000-0000-0000-000000000004','f0000000-0000-0000-0000-000000000002','Ayşe Demir','FINDING_ADDED','Yeni bulgu eklendi: Core Banking MFA Bypass Tespiti (KRİTİK)'),
('c1000000-0000-0000-0000-000000000005','f0000000-0000-0000-0000-000000000002','Ayşe Demir','STEP_COMPLETED','Test adımı tamamlandı: MFA Reddedilen Erişim Logları analizi'),
('c1000000-0000-0000-0000-000000000006','f0000000-0000-0000-0000-000000000002','Ayşe Demir','SIGN_OFF','Denetçi imzası: Hazırlayan – Ayşe Demir'),
('c1000000-0000-0000-0000-000000000007','f0000000-0000-0000-0000-000000000004','Burak Şahin','FINDING_ADDED','Yeni bulgu eklendi: Ayrıcalıklı Hesap Sürünmesi (YÜKSEK)'),
('c1000000-0000-0000-0000-000000000008','f0000000-0000-0000-0000-000000000011','Burak Şahin','FINDING_ADDED','Yeni bulgu eklendi: Birincil Veritabanı Şifreleme Eksikliği (KRİTİK)'),
('c1000000-0000-0000-0000-000000000009','f0000000-0000-0000-0000-000000000013','Ahmet Yılmaz','STEP_COMPLETED','Test adımı tamamlandı: Güvenlik açığı tarama sonuçları analizi'),
('c1000000-0000-0000-0000-000000000010','f0000000-0000-0000-0000-000000000007','Burak Şahin','SIGN_OFF','Denetçi imzası: Hazırlayan – Burak Şahin')
ON CONFLICT (id) DO NOTHING;
