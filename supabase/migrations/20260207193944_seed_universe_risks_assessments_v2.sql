/*
  # Seed: Turkish Bank Structure, Risk Library & Heatmap Assessments

  1. Audit Entities (12 entities)
    - Genel Mudurluk (HQ), 5 departments, 6 branches
  2. Risk Definitions (8 standard banking risks)
  3. Risk Assessments (24 live heatmap data points)
*/

DELETE FROM audit_entities WHERE tenant_id = '00000000-0000-0000-0000-000000000001';

INSERT INTO audit_entities (id, tenant_id, path, name, type, risk_score, velocity_multiplier, status, metadata) VALUES
  ('a0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'gm', 'Genel Mudurluk', 'HEADQUARTERS', 68.0, 1.0, 'Active', '{"city":"Istanbul","floor":"25-30"}'),
  ('a0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'gm.bireysel', 'Bireysel Krediler Tahsis', 'DEPARTMENT', 78.5, 1.15, 'Active', '{"department_code":"BKT"}'),
  ('a0000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'gm.bt', 'Bilgi Teknolojileri Grubu', 'DEPARTMENT', 82.0, 1.25, 'Active', '{"department_code":"BTG"}'),
  ('a0000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'gm.hazine', 'Hazine ve Yatirim', 'DEPARTMENT', 74.0, 1.10, 'Active', '{"department_code":"HYB"}'),
  ('a0000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'gm.uyum', 'Uyum ve MASAK', 'DEPARTMENT', 65.0, 1.05, 'Active', '{"department_code":"UMB"}'),
  ('a0000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', 'gm.operasyon', 'Operasyon Merkezi', 'DEPARTMENT', 71.0, 1.12, 'Active', '{"department_code":"OPM"}'),
  ('a0000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000001', 'gm.merkez', 'Merkez Sube', 'BRANCH', 72.0, 1.20, 'Active', '{"city":"Istanbul","branch_code":"001"}'),
  ('a0000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000001', 'gm.ankara', 'Ankara Kurumsal Sube', 'BRANCH', 66.0, 1.08, 'Active', '{"city":"Ankara","branch_code":"002"}'),
  ('a0000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000001', 'gm.kadikoy', 'Kadikoy Sube', 'BRANCH', 58.0, 1.05, 'Active', '{"city":"Istanbul","branch_code":"003"}'),
  ('a0000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'gm.levent', 'Levent Ticari Sube', 'BRANCH', 75.0, 1.18, 'Active', '{"city":"Istanbul","branch_code":"004"}'),
  ('a0000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', 'gm.izmir', 'Izmir Bolge Mudurlugu', 'GROUP', 62.0, 1.10, 'Active', '{"city":"Izmir","region":"Ege"}'),
  ('a0000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000001', 'gm.izmir.alsancak', 'Alsancak Sube', 'BRANCH', 55.0, 1.02, 'Active', '{"city":"Izmir","branch_code":"010"}');

UPDATE audit_entities SET parent_id = 'a0000000-0000-0000-0000-000000000001'
  WHERE path::text LIKE 'gm.%' AND path::text NOT LIKE 'gm.%.%'
  AND tenant_id = '00000000-0000-0000-0000-000000000001';

UPDATE audit_entities SET parent_id = 'a0000000-0000-0000-0000-000000000011'
  WHERE path::text LIKE 'gm.izmir.%'
  AND tenant_id = '00000000-0000-0000-0000-000000000001';

INSERT INTO risk_definitions (id, tenant_id, title, category, description, base_impact, base_likelihood) VALUES
  ('d0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001',
   'Yetkisiz Erisim (Siber)', 'BT Riski',
   'Kritik bankacilik sistemlerine yetkisiz erisim riski.', 5, 3),
  ('d0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001',
   'Nakit Acigi / Kasa Farki', 'Operasyonel Risk',
   'Sube kasalarinda fiziksel nakit sayim farki riski.', 3, 4),
  ('d0000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001',
   'Mevzuata Aykiri Kredi Kullandirimi', 'Kredi Riski',
   'BDDK mevzuatina aykiri kredi tahsis islemleri riski.', 5, 2),
  ('d0000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001',
   'Tedarikci Hizmet Kesintisi', 'Ucuncu Taraf Riski',
   'Kritik tedarikci firmalardan hizmet kesintisi riski.', 4, 3),
  ('d0000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001',
   'KVKK Veri Ihlali', 'Uyumluluk Riski',
   'Kisisel verilerin korunmasi kanununa aykiri veri isleme riski.', 5, 2),
  ('d0000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001',
   'Kredi Teminat Eksikligi', 'Kredi Riski',
   'Kullandirilan kredilerde yeterli teminat alinmamasi riski.', 4, 3),
  ('d0000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000001',
   'Fraud / Sahtecilik Riski', 'Operasyonel Risk',
   'Ic veya dis kaynakli sahtecilik islemleri riski.', 5, 3),
  ('d0000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000001',
   'Faiz Orani Degisim Riski', 'Piyasa Riski',
   'Faiz oranlarindaki degisimler nedeniyle portfoy deger kaybi riski.', 4, 4);

INSERT INTO risk_assessments (tenant_id, entity_id, risk_id, impact, likelihood, control_effectiveness, justification) VALUES
  ('00000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 5, 4, 0.70, 'Merkezi sistemlere siber saldiri tehdidi yuksek'),
  ('00000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000005', 5, 2, 0.80, 'KVKK uyum programi aktif'),
  ('00000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000003', 5, 4, 0.55, 'Kredi hacmi yuksek, mevzuat degisiklikleri siklasiyor'),
  ('00000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000006', 4, 5, 0.45, 'Teminat degerleme sureci yetersiz'),
  ('00000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000007', 4, 3, 0.60, 'Sahte belge kontrolleri guclendirildi'),
  ('00000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000001', 5, 5, 0.65, 'KRITIK: Siber saldiri yuzeyi genis'),
  ('00000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000004', 4, 4, 0.50, 'Kritik tedarikci bagimliligi yuksek'),
  ('00000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000008', 5, 5, 0.60, 'Faiz volatilitesi doneminde portfoy buyuk'),
  ('00000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000007', 3, 2, 0.75, 'Cift onay mekanizmasi mevcut'),
  ('00000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000005', 4, 3, 0.72, 'KVKK surecleri olgun'),
  ('00000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000003', 3, 2, 0.80, 'Mevzuat takip sistemi guncel'),
  ('00000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000006', 'd0000000-0000-0000-0000-000000000002', 3, 5, 0.40, 'Yuksek islem hacmi, manuel surec fazla'),
  ('00000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000006', 'd0000000-0000-0000-0000-000000000007', 4, 4, 0.55, 'Sahtecilik tespit sistemi aktif ama gecikme var'),
  ('00000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000007', 'd0000000-0000-0000-0000-000000000002', 3, 4, 0.50, 'Yuksek musteri trafigi'),
  ('00000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000007', 'd0000000-0000-0000-0000-000000000006', 4, 3, 0.55, 'Konut kredisi teminat sureci devam'),
  ('00000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000008', 'd0000000-0000-0000-0000-000000000003', 4, 2, 0.65, 'Kurumsal kredi limitleri kontrol altinda'),
  ('00000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000008', 'd0000000-0000-0000-0000-000000000002', 2, 3, 0.60, 'Dijital islem agirligi, kasa farki dusuk'),
  ('00000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000009', 'd0000000-0000-0000-0000-000000000002', 2, 2, 0.70, 'Dusuk hacimli sube'),
  ('00000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000009', 'd0000000-0000-0000-0000-000000000006', 3, 2, 0.65, 'Bireysel kredi agirlikli'),
  ('00000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000010', 'd0000000-0000-0000-0000-000000000003', 5, 3, 0.50, 'Buyuk kurumsal krediler'),
  ('00000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000010', 'd0000000-0000-0000-0000-000000000007', 5, 4, 0.45, 'Ticari islem hacmi yuksek, fraud belirgin'),
  ('00000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000011', 'd0000000-0000-0000-0000-000000000004', 3, 3, 0.55, 'Bolgede yerel tedarikci bagimliligi'),
  ('00000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000011', 'd0000000-0000-0000-0000-000000000001', 4, 2, 0.60, 'Bolge VPN erisimi kontrol altinda'),
  ('00000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000012', 'd0000000-0000-0000-0000-000000000002', 1, 2, 0.75, 'Kucuk sube, dusuk islem hacmi'),
  ('00000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000012', 'd0000000-0000-0000-0000-000000000006', 2, 1, 0.80, 'Sinirli kredi portfoyu');
