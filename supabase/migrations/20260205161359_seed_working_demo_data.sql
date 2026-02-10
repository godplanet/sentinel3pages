/*
  # Sentinel v3.0 - Working Demo Data

  1. Tables
    - governance_docs (6 items)
    - policies (6 items)
    - surveys (3 items)
    - qaip_checklists (3 items)
    - incidents (5 items)

  2. All constraints validated
*/

-- GOVERNANCE VAULT
INSERT INTO public.governance_docs (doc_type, title, version, approval_status) VALUES
('CHARTER', 'İç Denetim Yönetmeliği 2026', 'v4.0', 'APPROVED'),
('CHARTER', 'Denetim Komitesi Tüzüğü', 'v2.1', 'APPROVED'),
('MINUTES', '2026/01 Komite Toplantı Tutanağı', 'Final', 'APPROVED'),
('MINUTES', '2026/02 Komite Toplantı Tutanağı', 'Draft', 'DRAFT'),
('POLICY', 'Risk Metodolojisi', 'v3.2', 'APPROVED'),
('DECLARATION', 'Bağımsızlık Beyanı 2026', 'v1.0', 'APPROVED')
ON CONFLICT DO NOTHING;

-- POLICIES
INSERT INTO public.policies (title, version, is_active) VALUES
('Bilgi Güvenliği Politikası', '3.0', TRUE),
('Temiz Masa Temiz Ekran', '1.2', TRUE),
('Etik İlkeler', '2.0', TRUE),
('Kredi Tahsis Politikası', '4.1', TRUE),
('KVKK Politikası', '2.3', TRUE),
('Varlık Yönetimi', '1.5', TRUE)
ON CONFLICT DO NOTHING;

-- SURVEYS
INSERT INTO public.surveys (title, description, target_audience, form_schema, is_active) VALUES
('Denetim Memnuniyet Anketi', 
 'Denetim sonrası değerlendirme',
 'AUDITEE',
 '[{"id":"q1","type":"rating","label":"Profesyonellik?","max":5}, {"id":"q2","type":"rating","label":"Süre uygunluğu?","max":5}, {"id":"q3","type":"text","label":"Öneriler?"}]'::jsonb,
 TRUE),

('Risk Algı Anketi 2026',
 'Kurum risk algısı',
 'INTERNAL',
 '[{"id":"r1","type":"choice","label":"En büyük risk?","options":["Siber","Kredi","Likidite","Operasyonel","Mevzuat"]}, {"id":"r2","type":"rating","label":"Kontrol etkinliği?","max":5}]'::jsonb,
 TRUE),

('Dış Paydaş Anketi',
 'Düzenleyici görüşler',
 'EXTERNAL',
 '[{"id":"e1","type":"text","label":"Öneriler?"}, {"id":"e2","type":"rating","label":"Memnuniyet?","max":5}]'::jsonb,
 TRUE)
ON CONFLICT DO NOTHING;

-- QAIP CHECKLISTS
INSERT INTO public.qaip_checklists (title, description, criteria) VALUES
('Dosya Kapanış Kontrolü',
 'GIAS uygunluk kontrolü',
 '[{"id":"qa1","text":"Risk analizi var mı?","weight":20}, {"id":"qa2","text":"Örneklem yeterli mi?","weight":15}, {"id":"qa3","text":"Kanıtlar yeterli mi?","weight":40}, {"id":"qa4","text":"Risk seviyesi doğru mu?","weight":15}, {"id":"qa5","text":"Rapor uygun mu?","weight":10}]'::jsonb),

('Çalışma Kağıdı Review',
 'Süpervizör kontrolü',
 '[{"id":"wp1","text":"Amaç tanımlı mı?","weight":25}, {"id":"wp2","text":"Adımlar detaylı mı?","weight":20}, {"id":"wp3","text":"Referanslar tam mı?","weight":30}, {"id":"wp4","text":"Sonuç yazılmış mı?","weight":25}]'::jsonb),

('Saha Çalışması',
 'Fieldwork kontrolü',
 '[{"id":"fw1","text":"Örneklem doğru mu?","weight":30}, {"id":"fw2","text":"Testler yapıldı mı?","weight":35}, {"id":"fw3","text":"İletişim iyi mi?","weight":20}, {"id":"fw4","text":"Zaman uygun mu?","weight":15}]'::jsonb)
ON CONFLICT DO NOTHING;

-- INCIDENTS
INSERT INTO public.incidents (title, description, category, status, is_anonymous) VALUES
('Yetkisiz Hesap Erişimi',
 'Şube çalışanının müşteri hesabına yetkisiz girişi',
 'Fraud', 'INVESTIGATING', TRUE),

('Mobbing Şikayeti',
 'Departmanda etik dışı davranış bildirimi',
 'Ethics', 'NEW', TRUE),

('Veri Sızıntısı İddiası',
 'Müşteri verilerinin yetkisiz paylaşımı iddiası',
 'IT', 'NEW', TRUE),

('Rüşvet Bildirimi',
 'Kredi onayı için rüşvet talep iddiası',
 'Dolandırıcılık', 'NEW', TRUE),

('Sistem Güvenlik İhlali',
 'Core banking yetkisiz erişim',
 'IT', 'INVESTIGATING', FALSE)
ON CONFLICT DO NOTHING;
