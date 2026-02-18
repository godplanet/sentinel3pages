/*
  # Turkish Banking Sector — Comprehensive Seed Data v4 (Final)

  ## Summary
  Populates all critical tables with realistic Turkish banking sector data.
  All column constraint values corrected from v3.

  ## Constraint Corrections from v3
  - tprm_vendors.status      : 'Active' | 'Inactive' | 'Under Review' | 'Terminated'
  - tprm_vendors.data_access_level : 'None' | 'Limited' | 'Full'
  - audit_findings.severity  : 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'OBSERVATION'
  - audit_findings.status    : 'DRAFT' | 'FINAL' | 'REMEDIATED'
  - audit_findings.state     : 'DRAFT' | 'IN_NEGOTIATION' | 'AGREED' | 'DISPUTED' | 'FINAL' | 'REMEDIATED'
  - risk_assessments.control_effectiveness : 0–100 (percentage, not 1–5 scale)
*/

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. UPDATE EXISTING ENTITIES WITH GRADING METADATA
-- ─────────────────────────────────────────────────────────────────────────────
UPDATE audit_entities SET
  risk_score = 82.5, risk_financial = 85, risk_compliance = 78,
  risk_operational = 80, risk_it = 70,
  audit_frequency = 'annual',
  last_audit_date = '2024-06-15'::timestamptz,
  next_audit_due  = '2025-06-15'::timestamptz,
  metadata = jsonb_build_object(
    'weight', 2.5,
    'findings_summary', jsonb_build_object('bordo',1,'kizil',2,'turuncu',3,'sari',2,'gozlem',1,'shariah_systemic',0),
    'lastAudit','2024-06-15','auditor','Mehmet Yilmaz','assets_billion_tl',185.4,'employee_count',4200)
WHERE id = 'c0000000-0000-0000-0000-000000000001';

UPDATE audit_entities SET
  risk_score = 76.0, risk_financial = 90, risk_compliance = 72,
  risk_operational = 65, risk_it = 55,
  audit_frequency = 'quarterly',
  last_audit_date = '2024-09-10'::timestamptz,
  next_audit_due  = '2024-12-10'::timestamptz,
  metadata = jsonb_build_object(
    'weight', 3.0,
    'findings_summary', jsonb_build_object('bordo',0,'kizil',3,'turuncu',4,'sari',3,'gozlem',2,'shariah_systemic',1),
    'lastAudit','2024-09-10','auditor','Ayse Kaya','portfolio_billion_tl',42.7,'swap_exposure_million_tl',8900)
WHERE id = 'c0000000-0000-0000-0000-000000000002';

UPDATE audit_entities SET
  risk_score = 55.0, risk_financial = 50, risk_compliance = 60,
  risk_operational = 58, risk_it = 45,
  audit_frequency = 'annual',
  last_audit_date = '2024-03-20'::timestamptz,
  next_audit_due  = '2025-03-20'::timestamptz,
  metadata = jsonb_build_object(
    'weight', 1.0,
    'findings_summary', jsonb_build_object('bordo',0,'kizil',1,'turuncu',2,'sari',4,'gozlem',3,'shariah_systemic',0),
    'lastAudit','2024-03-20','auditor','Can Demir','transaction_count_monthly',28500,'branch_manager','Fatma Arslan')
WHERE id = 'c0000000-0000-0000-0000-000000000003';

UPDATE audit_entities SET
  risk_score = 48.0, risk_financial = 45, risk_compliance = 55,
  risk_operational = 50, risk_it = 40,
  audit_frequency = 'biennial',
  last_audit_date = '2023-11-05'::timestamptz,
  next_audit_due  = '2025-11-05'::timestamptz,
  metadata = jsonb_build_object(
    'weight', 0.8,
    'findings_summary', jsonb_build_object('bordo',0,'kizil',0,'turuncu',1,'sari',3,'gozlem',2,'shariah_systemic',0),
    'lastAudit','2023-11-05','auditor','Ali Celik','transaction_count_monthly',19200,'branch_manager','Zeynep Sahin')
WHERE id = 'c0000000-0000-0000-0000-000000000004';

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. INSERT NEW AUDIT ENTITIES (12 departments, branches, IT assets)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO audit_entities
  (id, tenant_id, path, name, type, risk_score, risk_financial, risk_compliance, risk_operational, risk_it, audit_frequency, last_audit_date, next_audit_due, metadata)
VALUES
('ac000001-0000-0000-0000-000000000001','11111111-1111-1111-1111-111111111111','hq.krediler','Kurumsal Krediler Bolumu','DEPARTMENT',88.0,92,85,80,60,'quarterly','2024-08-01','2024-11-01',
  jsonb_build_object('weight',2.8,'findings_summary',jsonb_build_object('bordo',1,'kizil',3,'turuncu',2,'sari',1,'gozlem',2,'shariah_systemic',0),'lastAudit','2024-08-01','portfolio_billion_tl',67.3,'npl_ratio_percent',3.2)),

('ac000002-0000-0000-0000-000000000002','11111111-1111-1111-1111-111111111111','hq.uyum','Uyum ve Mevzuat Bolumu','DEPARTMENT',72.0,65,88,70,55,'quarterly','2024-10-01','2024-12-01',
  jsonb_build_object('weight',2.2,'findings_summary',jsonb_build_object('bordo',0,'kizil',2,'turuncu',3,'sari',4,'gozlem',2,'shariah_systemic',1),'lastAudit','2024-10-01','regulations_tracked',48,'open_regulatory_items',7)),

('ac000003-0000-0000-0000-000000000003','11111111-1111-1111-1111-111111111111','hq.bilisteknoloji','Bilgi Teknolojileri Bolumu','DEPARTMENT',79.0,60,70,75,95,'semiannual','2024-07-15','2025-01-15',
  jsonb_build_object('weight',2.5,'findings_summary',jsonb_build_object('bordo',0,'kizil',2,'turuncu',4,'sari',3,'gozlem',3,'shariah_systemic',0),'lastAudit','2024-07-15','systems_count',124,'critical_systems',18)),

('ac000004-0000-0000-0000-000000000004','11111111-1111-1111-1111-111111111111','hq.masak','Kara Para Aklamayla Mucadele MASAK','DEPARTMENT',85.0,78,95,80,70,'quarterly','2024-09-20','2024-12-20',
  jsonb_build_object('weight',2.0,'findings_summary',jsonb_build_object('bordo',1,'kizil',2,'turuncu',2,'sari',2,'gozlem',1,'shariah_systemic',0),'lastAudit','2024-09-20','str_filed_ytd',23,'pep_count',412)),

('ac000005-0000-0000-0000-000000000005','11111111-1111-1111-1111-111111111111','hq.operasyon','Operasyon ve Surecler Bolumu','DEPARTMENT',62.0,55,65,75,58,'semiannual','2024-05-10','2024-11-10',
  jsonb_build_object('weight',1.5,'findings_summary',jsonb_build_object('bordo',0,'kizil',1,'turuncu',3,'sari',5,'gozlem',4,'shariah_systemic',0),'lastAudit','2024-05-10','daily_transactions',85000,'sla_breaches_monthly',12)),

('ac000006-0000-0000-0000-000000000006','11111111-1111-1111-1111-111111111111','hq.sube_besiktas','Besiktas Subesi 103','UNIT',51.0,48,55,52,42,'annual','2024-02-28','2025-02-28',
  jsonb_build_object('weight',0.8,'findings_summary',jsonb_build_object('bordo',0,'kizil',0,'turuncu',2,'sari',3,'gozlem',2,'shariah_systemic',0),'lastAudit','2024-02-28','transaction_count_monthly',22100,'branch_manager','Hasan Koc')),

('ac000007-0000-0000-0000-000000000007','11111111-1111-1111-1111-111111111111','hq.sube_sisli','Sisli Subesi 104','UNIT',58.0,55,62,60,45,'annual','2024-04-15','2025-04-15',
  jsonb_build_object('weight',0.9,'findings_summary',jsonb_build_object('bordo',0,'kizil',1,'turuncu',2,'sari',3,'gozlem',1,'shariah_systemic',0),'lastAudit','2024-04-15','transaction_count_monthly',31500,'branch_manager','Nilufar Ozen')),

('ac000008-0000-0000-0000-000000000008','11111111-1111-1111-1111-111111111111','hq.it_corebanking','Core Banking Sistemi T24','UNIT',92.0,70,75,85,98,'quarterly','2024-10-05','2025-01-05',
  jsonb_build_object('weight',3.5,'findings_summary',jsonb_build_object('bordo',2,'kizil',3,'turuncu',2,'sari',1,'gozlem',0,'shariah_systemic',0),'lastAudit','2024-10-05','uptime_percent',99.7,'version','Temenos T24 R20')),

('ac000009-0000-0000-0000-000000000009','11111111-1111-1111-1111-111111111111','hq.it_swift','SWIFT ve Muhabir Bankacilik','UNIT',87.0,88,80,75,90,'semiannual','2024-08-20','2025-02-20',
  jsonb_build_object('weight',3.0,'findings_summary',jsonb_build_object('bordo',1,'kizil',2,'turuncu',3,'sari',2,'gozlem',1,'shariah_systemic',0),'lastAudit','2024-08-20','swift_messages_daily',1850,'csp_compliance_percent',94.5)),

('ac000010-0000-0000-0000-000000000010','11111111-1111-1111-1111-111111111111','hq.perakende','Perakende Bankacilik','DEPARTMENT',65.0,62,68,70,55,'semiannual','2024-06-01','2024-12-01',
  jsonb_build_object('weight',1.8,'findings_summary',jsonb_build_object('bordo',0,'kizil',1,'turuncu',3,'sari',4,'gozlem',3,'shariah_systemic',0),'lastAudit','2024-06-01','retail_customers',285000,'digital_banking_ratio_percent',67.4)),

('ac000011-0000-0000-0000-000000000011','11111111-1111-1111-1111-111111111111','hq.isgirisi','Sentinel Finansal Kiralama AS','UNIT',70.0,72,68,65,50,'annual','2024-01-20','2025-01-20',
  jsonb_build_object('weight',1.2,'findings_summary',jsonb_build_object('bordo',0,'kizil',1,'turuncu',2,'sari',3,'gozlem',2,'shariah_systemic',0),'lastAudit','2024-01-20','leasing_portfolio_million_tl',4850,'active_contracts',1240)),

('ac000012-0000-0000-0000-000000000012','11111111-1111-1111-1111-111111111111','hq.izmir_bolge','Izmir Bolge Mudurlugu','UNIT',60.0,58,65,62,48,'annual','2024-03-05','2025-03-05',
  jsonb_build_object('weight',1.1,'findings_summary',jsonb_build_object('bordo',0,'kizil',1,'turuncu',2,'sari',4,'gozlem',3,'shariah_systemic',0),'lastAudit','2024-03-05','branches_under_management',12,'total_deposits_million_tl',9600))

ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. INSERT RISK LIBRARY (20 Turkish banking risk definitions)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO risk_library
  (id, tenant_id, risk_code, title, inherent_score, residual_score, control_effectiveness, static_fields, dynamic_data)
VALUES
('aa000001-0000-0000-0000-000000000001','11111111-1111-1111-1111-111111111111','CR-001','Kurumsal Kredi Temerrut Riski',85,60,65,
  jsonb_build_object('category','credit','regulatory_ref','BDDK Yonetmelik 19/2014','description','Kurumsal kredi portfoyunde temerrut orani artisi ve karsili yetersizligi'),
  jsonb_build_object('last_reviewed','2024-10-01','reviewer','Risk Komitesi')),

('aa000002-0000-0000-0000-000000000002','11111111-1111-1111-1111-111111111111','CR-002','Takipteki Kredi NPL Riski',75,50,55,
  jsonb_build_object('category','credit','regulatory_ref','TFRS 9','description','NPL oraninin sektor ortalamasinin ustune cikma ve TFRS 9 karsili hatasi'),
  jsonb_build_object('last_reviewed','2024-09-15','reviewer','Kredi Risk')),

('aa000003-0000-0000-0000-000000000003','11111111-1111-1111-1111-111111111111','MR-001','Faiz Orani Riski IRRBB',80,55,60,
  jsonb_build_object('category','market','regulatory_ref','Basel IV IRRBB','description','Faiz orani duyarliligi ve NIM sikismasi riski'),
  jsonb_build_object('last_reviewed','2024-10-10','reviewer','ALCO')),

('aa000004-0000-0000-0000-000000000004','11111111-1111-1111-1111-111111111111','MR-002','Doviz Kuru Riski',90,65,58,
  jsonb_build_object('category','market','regulatory_ref','BDDK Kur Riski','description','USD/TL ve EUR/TL pozisyonlarinda asiri dalgalanma'),
  jsonb_build_object('last_reviewed','2024-10-05','reviewer','Hazine')),

('aa000005-0000-0000-0000-000000000005','11111111-1111-1111-1111-111111111111','LR-001','Likidite Riski',78,52,62,
  jsonb_build_object('category','liquidity','regulatory_ref','Basel III LCR/NSFR','description','Kisa vadeli fonlama guclu ve LCR orani ihlali'),
  jsonb_build_object('last_reviewed','2024-09-20','reviewer','Fon Yonetimi')),

('aa000006-0000-0000-0000-000000000006','11111111-1111-1111-1111-111111111111','CR-003','Konsantrasyon Riski',72,48,55,
  jsonb_build_object('category','credit','regulatory_ref','BDDK Buyuk Kredi Siniri','description','Tek musteri sektör kredi konsantrasyonunun yasal limitleri asmasi'),
  jsonb_build_object('last_reviewed','2024-08-30','reviewer','Kredi Risk')),

('aa000007-0000-0000-0000-000000000007','11111111-1111-1111-1111-111111111111','OPR-001','Operasyonel Kayip Riski',65,42,58,
  jsonb_build_object('category','operational','regulatory_ref','Basel IV OpRisk','description','Ic kontrol yetersizliginden kaynaklanan operasyonel kayip olaylari'),
  jsonb_build_object('last_reviewed','2024-07-15','reviewer','Operasyon Risk')),

('aa000008-0000-0000-0000-000000000008','11111111-1111-1111-1111-111111111111','IT-001','Siber Saldiri ve Veri Ihlali',95,70,65,
  jsonb_build_object('category','cyber','regulatory_ref','KVKK / BDDK BT','description','Kotu niyetli yazilim fidye yazilimi ve musteri verilerinin calinmasi'),
  jsonb_build_object('last_reviewed','2024-10-15','reviewer','CISO')),

('aa000009-0000-0000-0000-000000000009','11111111-1111-1111-1111-111111111111','IT-002','Core Banking Sistem Kesintisi',88,60,70,
  jsonb_build_object('category','cyber','regulatory_ref','BDDK BT Yonetmeligi','description','Ana bankacilik sisteminin kritik saatlerde erisilemazlik'),
  jsonb_build_object('last_reviewed','2024-09-01','reviewer','BT')),

('aa000010-0000-0000-0000-000000000010','11111111-1111-1111-1111-111111111111','COMP-001','BDDK Mevzuat Uyum Riski',70,45,62,
  jsonb_build_object('category','compliance','regulatory_ref','BDDK 5411','description','BDDK duzenlemelerine aykirilik ve idari para cezasi'),
  jsonb_build_object('last_reviewed','2024-10-01','reviewer','Uyum')),

('aa000011-0000-0000-0000-000000000011','11111111-1111-1111-1111-111111111111','AML-001','Kara Para Aklama Riski',85,55,60,
  jsonb_build_object('category','compliance','regulatory_ref','5549 MASAK','description','AML/CTF islemlerinin tespit edilememesi'),
  jsonb_build_object('last_reviewed','2024-10-10','reviewer','MASAK Uyum')),

('aa000012-0000-0000-0000-000000000012','11111111-1111-1111-1111-111111111111','COMP-002','KVKK Veri Gizliligi',75,50,65,
  jsonb_build_object('category','compliance','regulatory_ref','6698 KVKK','description','Kisisel verilerin korunmasi kanunu ihlali'),
  jsonb_build_object('last_reviewed','2024-08-20','reviewer','DPO')),

('aa000013-0000-0000-0000-000000000013','11111111-1111-1111-1111-111111111111','SR-001','Seriat Uyum Riski Sukuk',68,40,70,
  jsonb_build_object('category','shariah','regulatory_ref','AAOIFI FAS 32','description','Katilim bankaciligi urunlerinde seriat kurulunun onaylamadigi yapilar'),
  jsonb_build_object('last_reviewed','2024-09-10','reviewer','Seriat Danisma')),

('aa000014-0000-0000-0000-000000000014','11111111-1111-1111-1111-111111111111','FR-001','Finansal Raporlama Riski',72,48,68,
  jsonb_build_object('category','finance','regulatory_ref','TFRS/BDS','description','Mali tablolarin hatali hazirlanmasi ve yaniltici finansal bilgi'),
  jsonb_build_object('last_reviewed','2024-07-01','reviewer','Finansal Raporlama')),

('aa000015-0000-0000-0000-000000000015','11111111-1111-1111-1111-111111111111','CAP-001','Sermaye Yeterliligi Riski',80,55,65,
  jsonb_build_object('category','finance','regulatory_ref','Basel III SYR','description','BDDK sermaye yeterliligi rasyosunun yasal minimumun altina dusmesi'),
  jsonb_build_object('last_reviewed','2024-10-01','reviewer','Sermaye Yonetimi')),

('aa000016-0000-0000-0000-000000000016','11111111-1111-1111-1111-111111111111','MR-003','Turev Urun Valuasyon Riski',82,58,62,
  jsonb_build_object('category','market','regulatory_ref','BDDK Turev Araclar','description','Opsiyon vadeli islem ve swap sozlesmelerinin yanlis degerlemesi'),
  jsonb_build_object('last_reviewed','2024-09-25','reviewer','Hazine Risk')),

('aa000017-0000-0000-0000-000000000017','11111111-1111-1111-1111-111111111111','OPR-002','Insan Kaynaklari Hata Riski',55,35,68,
  jsonb_build_object('category','operational','regulatory_ref','Ic Kontrol','description','Personel hatasi egitim eksikligi ve ic dolandiricilik'),
  jsonb_build_object('last_reviewed','2024-06-01','reviewer','IK')),

('aa000018-0000-0000-0000-000000000018','11111111-1111-1111-1111-111111111111','IT-003','SWIFT CSP Uyum Riski',78,52,72,
  jsonb_build_object('category','cyber','regulatory_ref','SWIFT CSCF v2024','description','SWIFT Customer Security Programme zorunlu kontrollerinin uygulanmamasi'),
  jsonb_build_object('last_reviewed','2024-10-05','reviewer','SWIFT Guvenlik')),

('aa000019-0000-0000-0000-000000000019','11111111-1111-1111-1111-111111111111','TR-001','Ucuncu Taraf Tedarikci Riski',65,42,60,
  jsonb_build_object('category','operational','regulatory_ref','BDDK Dis Hizmet','description','Dis hizmet alınan kuruloslarin hizmet kesintisi ve guvenlik aciklari'),
  jsonb_build_object('last_reviewed','2024-08-15','reviewer','TPRM')),

('aa000020-0000-0000-0000-000000000020','11111111-1111-1111-1111-111111111111','REP-001','Itibar Riski',60,38,58,
  jsonb_build_object('category','operational','regulatory_ref','Bankacilik Kanunu','description','Olumsuz medya haberleri musteri sikayetleri ve sosyal medya krizi'),
  jsonb_build_object('last_reviewed','2024-07-20','reviewer','Kurumsal Iletisim'))

ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. INSERT RISK ASSESSMENTS (covers full 5×5 heatmap grid)
--    control_effectiveness is 0–100 percentage
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO risk_assessments
  (id, tenant_id, entity_id, risk_definition_id, risk_category, risk_title,
   inherent_likelihood, inherent_impact, residual_likelihood, residual_impact,
   control_effectiveness, risk_owner, status, assessment_date, review_date, notes)
VALUES
-- CRITICAL ZONE (L5×I5, L5×I4, L4×I5, L4×I4)
('ab000001-0000-0000-0000-000000000001','11111111-1111-1111-1111-111111111111','ac000008-0000-0000-0000-000000000008','aa000008-0000-0000-0000-000000000008','cyber','Fidye Yazilimi Saldirisi',5,5,3,4,45,'CIO','active','2024-10-15','2025-01-15','Kritik fidye yazilimi kampanyasi tespit edildi'),
('ab000002-0000-0000-0000-000000000002','11111111-1111-1111-1111-111111111111','c0000000-0000-0000-0000-000000000002','aa000004-0000-0000-0000-000000000004','market','USD/TL Pozisyon Asimi',5,4,3,3,55,'Hazine MD','active','2024-10-10','2025-01-10','BDDK limiti asidi; acil aksiyon devrede'),
('ab000003-0000-0000-0000-000000000003','11111111-1111-1111-1111-111111111111','ac000001-0000-0000-0000-000000000001','aa000001-0000-0000-0000-000000000001','credit','Buyuk Musteri Temerrudi',4,5,2,4,60,'Kredi Risk MD','active','2024-09-20','2024-12-20','En buyuk 5 musterinin riski SYO sinirini asiyor'),
('ab000004-0000-0000-0000-000000000004','11111111-1111-1111-1111-111111111111','ac000004-0000-0000-0000-000000000004','aa000011-0000-0000-0000-000000000011','compliance','MASAK Supheli Islem Kacirma',4,4,2,3,70,'MASAK MD','active','2024-10-01','2025-01-01','Otomatik izleme sistemi model bosluklari var'),
('ab000005-0000-0000-0000-000000000005','11111111-1111-1111-1111-111111111111','ac000009-0000-0000-0000-000000000009','aa000018-0000-0000-0000-000000000018','cyber','SWIFT Agina Yetkisiz Erisim',4,5,2,4,60,'SWIFT Guvenlik','active','2024-10-05','2025-01-05','CSP kontrollerinin 4 tanesi tamamlanmadi'),
('ab000006-0000-0000-0000-000000000006','11111111-1111-1111-1111-111111111111','ac000008-0000-0000-0000-000000000008','aa000009-0000-0000-0000-000000000009','cyber','Core Banking Tam Kesinti',3,5,2,4,75,'CTO','active','2024-09-15','2024-12-15','DR testi basarisiz: RTO hedefi 2 saat asidi'),
('ab000007-0000-0000-0000-000000000007','11111111-1111-1111-1111-111111111111','c0000000-0000-0000-0000-000000000001','aa000015-0000-0000-0000-000000000015','finance','Sermaye Yeterliligi Sinir Ihlali',4,4,3,3,60,'CFO','active','2024-10-01','2025-01-01','Stres senaryolarinda SYR yuzde 10.5'),

-- HIGH ZONE (L4×I3, L3×I4, L3×I3)
('ab000008-0000-0000-0000-000000000008','11111111-1111-1111-1111-111111111111','ac000001-0000-0000-0000-000000000001','aa000002-0000-0000-0000-000000000002','credit','NPL Artisi Ticari Segment',4,3,3,2,60,'Kredi Risk','active','2024-10-01','2025-01-01','NPL orani yuzde 4.1; sektor ortalamasi yuzde 3.0'),
('ab000009-0000-0000-0000-000000000009','11111111-1111-1111-1111-111111111111','c0000000-0000-0000-0000-000000000002','aa000003-0000-0000-0000-000000000003','market','Faiz Orani Duyarliligi NIM',3,4,2,3,60,'ALCO','active','2024-09-10','2024-12-10','EVE yuzde 15 deger kaybi senaryosu mevzuat limitini asiyor'),
('ab000010-0000-0000-0000-000000000010','11111111-1111-1111-1111-111111111111','ac000002-0000-0000-0000-000000000002','aa000010-0000-0000-0000-000000000010','compliance','BDDK Denetim Bulgusu',3,3,2,2,75,'Uyum MD','monitoring','2024-10-01','2025-04-01','6 adet BDDK bulgusu kapatilamadi'),
('ab000011-0000-0000-0000-000000000011','11111111-1111-1111-1111-111111111111','c0000000-0000-0000-0000-000000000001','aa000005-0000-0000-0000-000000000005','liquidity','LCR Rasyosu Dusus',3,4,2,3,60,'Likidite Risk','active','2024-10-05','2025-01-05','LCR yuzde 112; tampon eriyor'),
('ab000012-0000-0000-0000-000000000012','11111111-1111-1111-1111-111111111111','ac000003-0000-0000-0000-000000000003','aa000012-0000-0000-0000-000000000012','compliance','KVKK Veri Ihlali',3,3,3,2,65,'DPO','active','2024-08-20','2024-11-20','3. parti uygulamada veri sizinti acigi tespit edildi'),
('ab000013-0000-0000-0000-000000000013','11111111-1111-1111-1111-111111111111','ac000001-0000-0000-0000-000000000001','aa000006-0000-0000-0000-000000000006','credit','Sektorel Konsantrasyon Insaat',4,3,3,2,60,'Kredi Risk','active','2024-09-25','2024-12-25','Insaat sektoru portfoyun yuzde 28i; ic limit yuzde 25'),
('ab000014-0000-0000-0000-000000000014','11111111-1111-1111-1111-111111111111','ac000005-0000-0000-0000-000000000005','aa000007-0000-0000-0000-000000000007','operational','Odeme Sistemi Islem Hatasi',3,3,2,2,75,'Operasyon MD','monitoring','2024-07-15','2024-10-15','Gunluk 85K islemde hata orani yuzde 0.08'),
('ab000015-0000-0000-0000-000000000015','11111111-1111-1111-1111-111111111111','ac000009-0000-0000-0000-000000000009','aa000016-0000-0000-0000-000000000016','market','Turev Valuasyon Modeli Riski',4,3,3,2,55,'Hazine Risk','active','2024-09-25','2024-12-25','Swap portfoyu XVA modeli bagimsiz validasyon bekliyor'),
('ab000029-0000-0000-0000-000000000029','11111111-1111-1111-1111-111111111111','ac000001-0000-0000-0000-000000000001','aa000016-0000-0000-0000-000000000016','market','CDS Spread Genislemesi',3,4,2,3,60,'Piyasa Risk','active','2024-10-01','2025-01-01','Turkiye CDS spreadi 350bp; model yeniden kalibre edildi'),
('ab000030-0000-0000-0000-000000000030','11111111-1111-1111-1111-111111111111','c0000000-0000-0000-0000-000000000001','aa000003-0000-0000-0000-000000000003','market','Mevduat Yenileme Riski',4,3,3,2,60,'ALCO','active','2024-10-10','2025-01-10','Vadeli mevduatin yuzde 65i 1 ay icinde yenileniyor'),
('ab000031-0000-0000-0000-000000000031','11111111-1111-1111-1111-111111111111','ac000003-0000-0000-0000-000000000003','aa000008-0000-0000-0000-000000000008','cyber','Phishing Saldirisi Trendi',4,3,3,2,55,'CISO','active','2024-10-15','2025-01-15','Aylik 450 phishing girisimi'),
('ab000032-0000-0000-0000-000000000032','11111111-1111-1111-1111-111111111111','ac000004-0000-0000-0000-000000000004','aa000011-0000-0000-0000-000000000011','compliance','Yuksek Riskli Musteri Profili',5,3,3,2,60,'MASAK MD','active','2024-10-01','2025-01-01','PEP listesindeki 412 hesabin guclu izleme altina alinmasi'),
('ab000034-0000-0000-0000-000000000034','11111111-1111-1111-1111-111111111111','ac000010-0000-0000-0000-000000000010','aa000007-0000-0000-0000-000000000007','operational','Dijital Kanal Dolandiricilik',4,4,3,3,60,'Dolandiricilik Onleme','active','2024-09-15','2024-12-15','Online bankacilik kimlik avi artisi; AI filtre devreye alindi'),
('ab000036-0000-0000-0000-000000000036','11111111-1111-1111-1111-111111111111','c0000000-0000-0000-0000-000000000002','aa000016-0000-0000-0000-000000000016','market','Opsiyon Delta Hedge Acigi',5,4,4,3,45,'Hazine','active','2024-10-10','2025-01-10','Egzotik opsiyon portfoyu acik delta pozisyonunda'),
('ab000040-0000-0000-0000-000000000040','11111111-1111-1111-1111-111111111111','ac000005-0000-0000-0000-000000000005','aa000005-0000-0000-0000-000000000005','liquidity','Ani Nakit Cikisi Senaryosu',3,5,2,4,60,'Likidite Risk','active','2024-10-05','2025-01-05','Stres testi 5 gunluk cikis senaryosunda acik tespit edildi'),

-- MEDIUM ZONE (L3×I2, L2×I3, L2×I2)
('ab000016-0000-0000-0000-000000000016','11111111-1111-1111-1111-111111111111','ac000010-0000-0000-0000-000000000010','aa000020-0000-0000-0000-000000000020','operational','Sosyal Medya Itibar Krizi',3,2,2,1,65,'Kurumsal Iletisim','monitoring','2024-08-01','2024-11-01','Musteri sikayet trendi artis gosteriyor'),
('ab000017-0000-0000-0000-000000000017','11111111-1111-1111-1111-111111111111','ac000002-0000-0000-0000-000000000002','aa000014-0000-0000-0000-000000000014','finance','TFRS 9 Karsili Hesaplama Hatasi',2,3,1,2,80,'CFO','monitoring','2024-09-01','2024-12-01','Model guncelleme proseduru tanimsiz'),
('ab000018-0000-0000-0000-000000000018','11111111-1111-1111-1111-111111111111','ac000011-0000-0000-0000-000000000011','aa000013-0000-0000-0000-000000000013','shariah','Sukuk Yapisi Seriat Uyum Sorunu',2,3,1,2,80,'Seriat Danisma','monitoring','2024-09-10','2024-12-10','Banka garantisi iceren sukuk yapisi gozden gecirildi'),
('ab000019-0000-0000-0000-000000000019','11111111-1111-1111-1111-111111111111','ac000005-0000-0000-0000-000000000005','aa000017-0000-0000-0000-000000000017','operational','Personel Hatasi Muhasebe',2,2,1,1,85,'IK MD','monitoring','2024-06-01','2024-09-01','Veri girisi egitim programi tamamlandi'),
('ab000020-0000-0000-0000-000000000020','11111111-1111-1111-1111-111111111111','ac000003-0000-0000-0000-000000000003','aa000019-0000-0000-0000-000000000019','operational','3. Parti BT Hizmet Kesintisi',3,2,2,1,65,'TPRM MD','monitoring','2024-08-15','2024-11-15','IBM bulut servis SLA iyilestirme plani imzalandi'),
('ab000033-0000-0000-0000-000000000033','11111111-1111-1111-1111-111111111111','ac000002-0000-0000-0000-000000000002','aa000010-0000-0000-0000-000000000010','compliance','SPK Sermaye Piyasasi Uyum',2,3,1,2,80,'Uyum','monitoring','2024-06-01','2024-12-01','MiFID II paralel uygulama bosluklari giderildi'),
('ab000035-0000-0000-0000-000000000035','11111111-1111-1111-1111-111111111111','ac000011-0000-0000-0000-000000000011','aa000013-0000-0000-0000-000000000013','shariah','Murabaha Sozlesme Hatasi',3,3,2,2,65,'Seriat Uyum','monitoring','2024-08-01','2024-11-01','12 sozlesmede seriat disi kar hesabi tespit edildi'),
('ab000037-0000-0000-0000-000000000037','11111111-1111-1111-1111-111111111111','ac000008-0000-0000-0000-000000000008','aa000009-0000-0000-0000-000000000009','cyber','Veri Merkezi Guc Arizasi',2,4,1,3,85,'Altyapi MD','monitoring','2024-07-01','2024-10-01','UPS kapasitesi artirimi tamamlandi'),
('ab000038-0000-0000-0000-000000000038','11111111-1111-1111-1111-111111111111','ac000009-0000-0000-0000-000000000009','aa000018-0000-0000-0000-000000000018','cyber','SWIFT Mesaj Dogrulama Hatasi',3,3,2,2,80,'Muhabir Bankacilik','monitoring','2024-09-20','2024-12-20','SMA kontrolu eksikligi giderildi'),
('ab000039-0000-0000-0000-000000000039','11111111-1111-1111-1111-111111111111','c0000000-0000-0000-0000-000000000001','aa000014-0000-0000-0000-000000000014','finance','Konsolide Finansal Tablo Hatasi',2,4,1,3,85,'CFO','monitoring','2024-04-01','2024-10-01','Istirak konsolidasyonu metodolojisi guncellendi'),

-- LOW ZONE (L1-2 × I1-2) — fills heatmap corners
('ab000021-0000-0000-0000-000000000021','11111111-1111-1111-1111-111111111111','ac000006-0000-0000-0000-000000000006','aa000007-0000-0000-0000-000000000007','operational','Sube Nakit Yonetimi Acigi',2,2,1,1,90,'Operasyon','closed','2024-03-10','2024-06-10','Nakit limit proseduru guncellendi'),
('ab000022-0000-0000-0000-000000000022','11111111-1111-1111-1111-111111111111','ac000007-0000-0000-0000-000000000007','aa000010-0000-0000-0000-000000000010','compliance','Musteri Tani KYC Eksikligi',2,3,1,2,85,'Uyum','monitoring','2024-04-15','2024-07-15','152 hesapta eksik KYC belgeleri tamamlandi'),
('ab000023-0000-0000-0000-000000000023','11111111-1111-1111-1111-111111111111','ac000012-0000-0000-0000-000000000012','aa000020-0000-0000-0000-000000000020','operational','Bolge Itibar ve Marka Riski',2,2,1,1,75,'Iletisim','monitoring','2024-03-05','2024-06-05','Bolge NPS skoru iyilesme egiliminde'),
('ab000024-0000-0000-0000-000000000024','11111111-1111-1111-1111-111111111111','ac000006-0000-0000-0000-000000000006','aa000017-0000-0000-0000-000000000017','operational','Kucuk Olcekli Operasyonel Hata',1,2,1,1,90,'Sube MD','closed','2024-02-28','2024-05-28','Rutin kontrollerle takip edildi'),
('ab000025-0000-0000-0000-000000000025','11111111-1111-1111-1111-111111111111','ac000007-0000-0000-0000-000000000007','aa000020-0000-0000-0000-000000000020','operational','Dusuk Etkili Musteri Sikayeti',1,1,1,1,90,'Musteri Hizm','closed','2024-04-01','2024-07-01','Standart surec ile yonetildi'),
('ab000026-0000-0000-0000-000000000026','11111111-1111-1111-1111-111111111111','ac000012-0000-0000-0000-000000000012','aa000019-0000-0000-0000-000000000019','operational','Tedarikci Kucuk SLA Ihlali',2,1,1,1,90,'TPRM','closed','2024-01-10','2024-04-10','Sozlesme yenilemede ceza maddesi eklendi'),
('ab000027-0000-0000-0000-000000000027','11111111-1111-1111-1111-111111111111','c0000000-0000-0000-0000-000000000003','aa000011-0000-0000-0000-000000000011','compliance','Sube KYC Guncellemeleri',2,2,1,1,85,'Sube MD','monitoring','2024-03-20','2024-06-20','KYC yenileme kampanyasi baslatildi'),
('ab000028-0000-0000-0000-000000000028','11111111-1111-1111-1111-111111111111','c0000000-0000-0000-0000-000000000004','aa000007-0000-0000-0000-000000000007','operational','Sube Operasyon Riski',2,1,1,1,85,'Sube MD','monitoring','2023-11-05','2024-05-05','Kontroller yeterli seviyede')

ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. INSERT TPRM VENDORS (10 Turkish banking vendors)
--    status: 'Active' | 'Inactive' | 'Under Review' | 'Terminated'
--    data_access_level: 'None' | 'Limited' | 'Full'
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO tprm_vendors
  (id, tenant_id, name, category, risk_tier, criticality_score, status, contact_person, email, contract_start, contract_end, last_audit_date, country, data_access_level, notes)
VALUES
('ad000001-0000-0000-0000-000000000001','11111111-1111-1111-1111-111111111111','Temenos AG - T24 Core Banking','Teknoloji - Core Banking','Tier 1',95,'Active','Michael Senn','m.senn@temenos.com','2020-01-01','2026-12-31','2024-06-15','Isvicre','Full','Core banking ana sistemi; tum finansal islemlerin omurgasi'),
('ad000002-0000-0000-0000-000000000002','11111111-1111-1111-1111-111111111111','IBM Turkiye AS - Bulut Altyapi','Teknoloji - Cloud','Tier 1',88,'Active','Serkan Dogan','s.dogan@tr.ibm.com','2021-03-01','2025-02-28','2024-03-20','Turkiye','Full','Felaket kurtarma ve yedek veri merkezi hizmetleri'),
('ad000003-0000-0000-0000-000000000003','11111111-1111-1111-1111-111111111111','PwC Turkiye - Dis Denetim','Danismanlik - Denetim','Tier 1',85,'Active','Burak Ozgur','b.ozgur@pwc.com','2022-01-01','2024-12-31','2024-09-30','Turkiye','Full','Bagimsiz dis denetim; TFRS/SPK raporlamasi'),
('ad000004-0000-0000-0000-000000000004','11111111-1111-1111-1111-111111111111','Mastercard Turkiye - Kart Semasi','Finans - Odeme','Tier 1',92,'Active','Eyup Ucar','e.ucar@mastercard.com','2019-06-01','2027-05-31','2024-05-10','Turkiye','Full','Debit/kredi kart islem agi ve tokenizasyon'),
('ad000005-0000-0000-0000-000000000005','11111111-1111-1111-1111-111111111111','Intertech - Dijital Bankacilik','Teknoloji - Fintech','Tier 2',78,'Active','Yavuz Topaloglu','y.topaloglu@intertech.com.tr','2021-09-01','2025-08-31','2024-07-22','Turkiye','Full','Mobile banking ve internet bankacilik platformu'),
('ad000006-0000-0000-0000-000000000006','11111111-1111-1111-1111-111111111111','LOGO Yazilim - Muhasebe ERP','Teknoloji - ERP','Tier 2',65,'Active','Levent Cakir','l.cakir@logo.com.tr','2020-07-01','2025-06-30','2024-01-15','Turkiye','Limited','Genel muhasebe ve butce sistemi'),
('ad000007-0000-0000-0000-000000000007','11111111-1111-1111-1111-111111111111','Deloitte Turkiye - Risk Danismanligi','Danismanlik - Risk','Tier 2',72,'Active','Mert Aydin','m.aydin@deloitte.com','2023-01-01','2025-12-31','2024-09-01','Turkiye','Limited','ICAAP ve sermaye planlamasi danismanligi'),
('ad000008-0000-0000-0000-000000000008','11111111-1111-1111-1111-111111111111','Kuveyt Bilgi Teknoloji - MASAK AML','Teknoloji - Uyum','Tier 2',80,'Active','Abdullah Rashidi','a.rashidi@kbt.com.kw','2022-05-01','2026-04-30','2024-04-18','Kuveyt','Full','AML/KYC izleme ve MASAK raporlama sistemi'),
('ad000009-0000-0000-0000-000000000009','11111111-1111-1111-1111-111111111111','Siemens Finansal Hizmetler - Kiralama','Finans - Leasing','Tier 3',55,'Active','Klaus Weber','k.weber@siemens-fs.com','2021-11-01','2024-10-31','2023-11-20','Almanya','Limited','Ekipman finansmani ve faaliyet kiralaması'),
('ad000010-0000-0000-0000-000000000010','11111111-1111-1111-1111-111111111111','Ankara Guvenlik AS - Fiziksel Guvenlik','Guvenlik - Fiziksel','Tier 3',45,'Active','Recep Yilmaz','r.yilmaz@ankaragsecurity.com.tr','2020-02-01','2025-01-31','2024-02-28','Turkiye','None','Sube ve genel mudurluk fiziksel guvenligi')

ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. INSERT ADDITIONAL AUDIT FINDINGS (20 realistic Turkish banking findings)
--    severity: CRITICAL | HIGH | MEDIUM | LOW | OBSERVATION
--    status  : DRAFT | FINAL | REMEDIATED
--    state   : DRAFT | IN_NEGOTIATION | AGREED | DISPUTED | FINAL | REMEDIATED
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO audit_findings
  (id, engagement_id, title, severity, status, state, main_status, financial_impact, details)
VALUES
('af000001-0000-0000-0000-000000000001','e0000000-0000-0000-0000-000000000001','Doviz Acik Pozisyonu BDDK Limitini Asiyor','CRITICAL','FINAL','IN_NEGOTIATION','bordo',2500000,
  jsonb_build_object('description','USD/TL net doviz pozisyonu ozkaynaklar oraninda BDDK limitini yuzde 8 asmaktadir.','finding_type','compliance','regulation','BDDK Kur Riski','root_cause','Pozisyon takip sisteminde limit uyarilari devre disi','recommendation','Limit kontrol mekanizmasi yeniden etkinlestirilmeli')),

('af000002-0000-0000-0000-000000000001','e0000000-0000-0000-0000-000000000001','TFRS 9 Asama Gecisi Hatali Hesaplanmis','CRITICAL','FINAL','DISPUTED','bordo',8750000,
  jsonb_build_object('description','Stage 2 kredilerin Stage 3 gecisinde kullanilan makro ekonomik senaryo agirliklari guncel TCMB projeksiyonlarini yansitmamaktadir.','finding_type','financial','regulation','TFRS 9','root_cause','Model guncelleme proseduru tanimsiz','recommendation','Ceyreklik model guncelleme proseduru olusturulmali')),

('af000003-0000-0000-0000-000000000001','e0000000-0000-0000-0000-000000000002','Muhabir Banka Due Diligence Eksik','HIGH','FINAL','IN_NEGOTIATION','kizil',0,
  jsonb_build_object('description','12 muhabir bankadan 4 tanesinin yillik due diligence belgesi 2 yili askın suredir guncellenmemis.','finding_type','compliance','regulation','BDDK Muhabir Bankacilik','root_cause','Gorev dagılımı net degil','recommendation','Muhabir banka takip tablosu olusturulmali')),

('af000004-0000-0000-0000-000000000002','e0000000-0000-0000-0000-000000000002','Core Banking Yetkilendirme Matrisi Eski','HIGH','FINAL','FINAL','kizil',0,
  jsonb_build_object('description','T24 sisteminde 34 kullanici hesabinin yetki profili 3 yili askın suredir guncellenmemis. Gorev ayriligi ihlalleri mevcut.','finding_type','it_audit','regulation','BDDK BT','root_cause','IAM surecinde periyodik revizyon adimi eksik','recommendation','Yetki matrisi ceyreklik gozden gecirilmeli')),

('af000005-0000-0000-0000-000000000002','e0000000-0000-0000-0000-000000000002','MASAK STR Otomasyonunda Kor Nokta','HIGH','FINAL','IN_NEGOTIATION','kizil',0,
  jsonb_build_object('description','ML tabanli AML modeli 50.000 TL alti yapilandirilmis islemleri tespit edemiyor.','finding_type','compliance','regulation','5549 MASAK','root_cause','Model egitim verisi 2021 tarihli','recommendation','Model yillik yeniden egitilmeli')),

('af000006-0000-0000-0000-000000000003','e0000000-0000-0000-0000-000000000003','KVKK Veri Silme Talepleri Suresi Asiliyor','MEDIUM','FINAL','AGREED','turuncu',0,
  jsonb_build_object('description','17 musteri basvurusunun 30 gunluk yasal suresinin asildigi tespit edilmistir.','finding_type','compliance','regulation','KVKK 6698','root_cause','Veri silme proseduru manuel','recommendation','Otomatik DSAR yonetim sistemi devreye alinmali')),

('af000007-0000-0000-0000-000000000003','e0000000-0000-0000-0000-000000000003','Insaat Sektoru Konsantrasyon Limiti Asimi','MEDIUM','FINAL','IN_NEGOTIATION','turuncu',0,
  jsonb_build_object('description','Kredi portfoyunun yuzde 28i insaat sektorunde; ic limit yuzde 25.','finding_type','credit','regulation','BDDK Kredi Riski','root_cause','Yeni kredi tahsiste portfoy konsantrasyonu kontrol edilmiyor','recommendation','Tahsis onay surecine konsantrasyon kontrol adimi eklenmeli')),

('af000008-0000-0000-0000-000000000003','e0000000-0000-0000-0000-000000000001','LCR Tampon Erozyonu','MEDIUM','FINAL','IN_NEGOTIATION','turuncu',0,
  jsonb_build_object('description','Stres senaryolarinda LCR yuzde 108e dusuyor.','finding_type','liquidity','regulation','Basel III LCR','root_cause','Vadesiz mevduat cikis katsayilari muhafazakar kullanilmiyor','recommendation','HQLA portfoyu arttirilmali')),

('af000009-0000-0000-0000-000000000001','e0000000-0000-0000-0000-000000000002','Opsiyon Portfoyu Delta Hedge Acigi','HIGH','FINAL','DISPUTED','kizil',1200000,
  jsonb_build_object('description','Egzotik opsiyon portfoyunde anlik delta pozisyonu acigi 120M TL esderegini asiyor.','finding_type','market','regulation','Piyasa Risk Limitleri','root_cause','Intraday hedge rebalancing sistemi manuel','recommendation','Otomatik delta hedging sistemi devreye alinmali')),

('af000010-0000-0000-0000-000000000002','e0000000-0000-0000-0000-000000000002','Disaster Recovery RTO Hedefi Asiliyor','HIGH','FINAL','FINAL','kizil',0,
  jsonb_build_object('description','Son DR testinde core banking RTO 4 saat 12 dakika; hedef 2 saat.','finding_type','it_audit','regulation','BDDK BT','root_cause','DR prosedurlerinde paralel kurtarma adimları sirali yapiliyor','recommendation','Paralel kurtarma mimarisine gecilmeli')),

('af000011-0000-0000-0000-000000000003','e0000000-0000-0000-0000-000000000003','Swift CSP Zorunlu Kontrol Eksiklikleri','HIGH','FINAL','IN_NEGOTIATION','kizil',0,
  jsonb_build_object('description','SWIFT CSCF v2024 kapsamında 4 zorunlu kontrol tamamlanmamis (1.1, 2.2, 6.1, 7.3A).','finding_type','it_audit','regulation','SWIFT CSCF','root_cause','Proje kaynak planlamasi yetersiz','recommendation','Q1 2025 itibarıyla tum zorunlu kontrollerin tamamlanmasi')),

('af000012-0000-0000-0000-000000000001','e0000000-0000-0000-0000-000000000001','Personel Fazla Mesai Uyum Sorunu','LOW','REMEDIATED','REMEDIATED','sari',0,
  jsonb_build_object('description','Hazine biriminde 8 personelin aylik fazla mesai suresi yasal siniri asiyor.','finding_type','compliance','regulation','Is Kanunu','root_cause','Yogun donem planlamasinda yedek personel kullanilmiyor','recommendation','Rotasyon takvimi olusturulmali')),

('af000013-0000-0000-0000-000000000002','e0000000-0000-0000-0000-000000000002','Vendor Risk Degerlendirmesi Guncellenmemis','LOW','DRAFT','IN_NEGOTIATION','sari',0,
  jsonb_build_object('description','3 kritik tedarikçinin yillik risk degerlendirmesi 18 ayı askın suredir yapilmamis.','finding_type','operational','regulation','BDDK Dis Hizmet','root_cause','TPRM surecinde sorumluluk matrisi guncel degil','recommendation','Kritik tedarıkçiler icin yillik degerlendirme takvimi olusturulmali')),

('af000014-0000-0000-0000-000000000003','e0000000-0000-0000-0000-000000000003','Murabaha Kari Seriat Disi Yapilandirilmis','MEDIUM','FINAL','IN_NEGOTIATION','turuncu',350000,
  jsonb_build_object('description','12 murabaha sozlesmesinde kâr hesabinin gecikme zammi icerdigi tespit edildi; seriat ihlali.','finding_type','shariah','regulation','AAOIFI','root_cause','Sozlesme sablonu seriat kurulu onayindan gecmeden guncellendi','recommendation','12 sozlesme yeniden duzenlenmeli')),

('af000015-0000-0000-0000-000000000001','e0000000-0000-0000-0000-000000000001','Phishing Saldirisi Basari Orani Artiyor','MEDIUM','FINAL','AGREED','turuncu',0,
  jsonb_build_object('description','Son 3 ayda phishing simulasyonlarinda basari orani yuzde 2.1den yuzde 4.8e yukeldi.','finding_type','it_audit','regulation','BDDK Siber Risk','root_cause','Farkindalik egitimi frekansı dusuk','recommendation','Aylik hedefli phishing simulasyonlari devreye alinmali')),

('af000016-0000-0000-0000-000000000002','e0000000-0000-0000-0000-000000000002','Sermaye Yeterliligi Stres Testi Sinirda','MEDIUM','FINAL','IN_NEGOTIATION','turuncu',0,
  jsonb_build_object('description','Siddetli senaryo altinda SYR yuzde 10.2ye dusuyor; BDDK minimum yuzde 10.','finding_type','capital','regulation','Basel III SYR','root_cause','Risk agirlikli varliklarin artisi capital planning modeline yansitilmamis','recommendation','Sermaye planlamasi stres senaryolariyla guncellenmeli')),

('af000017-0000-0000-0000-000000000003','e0000000-0000-0000-0000-000000000003','Kredi Veri Kalitesi Sorunlari CBUTR','LOW','REMEDIATED','REMEDIATED','sari',0,
  jsonb_build_object('description','KKB raporlamasinda 340 kredide hatali tutar girisi tespit edildi.','finding_type','data_quality','regulation','BDDK Veri Kalitesi','root_cause','Manuel veri girisi surecinde validasyon kurallari yok','recommendation','Otomatik veri dogrulama ve KKB raporlama API entegrasyonu')),

('af000018-0000-0000-0000-000000000001','e0000000-0000-0000-0000-000000000001','PEP Hesap Izleme Sikligi Yetersiz','HIGH','FINAL','IN_NEGOTIATION','kizil',0,
  jsonb_build_object('description','412 PEP hesabinin yuzde 40i haftalık yerine aylik izleniyor.','finding_type','compliance','regulation','5549 MASAK','root_cause','PEP izleme sistemi haftalik izleme kategorisini desteklemiyor','recommendation','Tum PEP hesaplari haftalik izleme altina alinmali')),

('af000019-0000-0000-0000-000000000002','e0000000-0000-0000-0000-000000000002','Yurt Disi Muhabirlerle Para Birimi Uyumsuzlugu','LOW','REMEDIATED','REMEDIATED','sari',125000,
  jsonb_build_object('description','7 muhabir bankada kur farkindan kaynaklanan kucuk bakiye uyumsuzluklari 6 aydir kapatilamadi.','finding_type','operational','regulation','Ic Kontrol','root_cause','Mutabakat sureci manuel','recommendation','Gunluk otomatik mutabakat sistemi devreye alinmali')),

('af000020-0000-0000-0000-000000000003','e0000000-0000-0000-0000-000000000003','Izmir Bolgede Eksik Belge Kabul Edilmis','OBSERVATION','REMEDIATED','REMEDIATED','gozlem',0,
  jsonb_build_object('description','Gozlem: 23 kredi dosyasında imza sirkuleri yerine fotokopi kullanilmis.','finding_type','compliance','regulation','Kredi Prosedürleri','root_cause','Bolge talimati ile GMY proseduru arasinda celisme','recommendation','Bolge talimatlari GMY prosedürleriyle uyumlu hale getirilmeli'))

ON CONFLICT (id) DO NOTHING;
