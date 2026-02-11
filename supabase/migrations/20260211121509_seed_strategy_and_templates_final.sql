/*
  # Seed Strategy & Template Data (Final)

  1. Seeded Tables
    - `strategic_bank_goals` (6 rows) - Bank strategic goals 2026
    - `strategic_audit_objectives` (6 rows) - Audit objectives 2026
    - `strategy_alignment_matrix` (8 rows) - Goal-objective linkages (relevance 0.0-1.0)
    - `template_steps` (10 rows) - Audit program steps for 2 templates

  2. Constraint Compliance
    - bank_goals.category: GROWTH, EFFICIENCY, COMPLIANCE, INNOVATION
    - audit_objectives.category: ASSURANCE, ADVISORY, RISK_MANAGEMENT, GOVERNANCE
    - alignment_matrix.relevance_score: 0.0 to 1.0
    - template_steps.testing_method: Inquiry, Inspection, Observation, Reperformance, Analytical

  3. Security
    - All scoped to tenant 11111111-1111-1111-1111-111111111111
*/

INSERT INTO strategic_bank_goals (id, tenant_id, title, description, period_year, weight, category, owner_executive, created_at, updated_at)
VALUES
  ('d1000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111',
   'Dijital Bankacilik Buyumesi', 'Dijital kanallarda musteri kazanimi ve islem hacmini %30 artirmak',
   2026, 25, 'GROWTH', 'Genel Mudur Yardimcisi - Dijital', now(), now()),
  ('d1000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111',
   'Operasyonel Verimlilik', 'Operasyonel maliyetleri %15 azaltmak ve otomasyon oranini artirmak',
   2026, 20, 'EFFICIENCY', 'Genel Mudur Yardimcisi - Operasyon', now(), now()),
  ('d1000000-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111',
   'Regulatorye Uyum Mukemmelligi', 'BDDK, SPK ve MASAK uyum oranlarini %100 seviyesine cikarmak',
   2026, 20, 'COMPLIANCE', 'Uyum Direktoru', now(), now()),
  ('d1000000-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111',
   'Teknoloji ve Inovasyon', 'Yapay zeka ve bulut teknolojileri ile yeni urun gelistirme',
   2026, 15, 'INNOVATION', 'CTO', now(), now()),
  ('d1000000-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111',
   'Risk Yonetimi Guclendirme', 'Entegre risk yonetimi cercevesini olgunlastirmak',
   2026, 10, 'EFFICIENCY', 'CRO', now(), now()),
  ('d1000000-0000-0000-0000-000000000006', '11111111-1111-1111-1111-111111111111',
   'Surdurulebilirlik ve ESG', 'ESG raporlama ve yesil bankacilik hedeflerini gerceklestirmek',
   2026, 10, 'INNOVATION', 'Surdurulebilirlik Komitesi Baskani', now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO strategic_audit_objectives (id, tenant_id, title, description, period_year, category, created_at, updated_at)
VALUES
  ('d2000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111',
   'Dijital Kanal Denetim Kapsamini Genisletmek', 'Mobil ve internet bankacilik surecleri icin kapsamli denetim programi gelistirmek',
   2026, 'ASSURANCE', now(), now()),
  ('d2000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111',
   'Surekli Denetim Olgunlugunu Artirmak', 'CCM ve veri analitigine dayali surekli denetim kapasitesini gelistirmek',
   2026, 'ADVISORY', now(), now()),
  ('d2000000-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111',
   'Uyum Denetimlerini Guclandirmek', 'BDDK YIKD ve MASAK gerekliliklerine uygun denetim metodolojisi',
   2026, 'GOVERNANCE', now(), now()),
  ('d2000000-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111',
   'Sube Denetim Verimliligini Artirmak', 'Uzaktan ve yerinde denetim surelerini optimize etmek',
   2026, 'ASSURANCE', now(), now()),
  ('d2000000-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111',
   'Siber Guvenlik Denetim Kapasitesi', 'Siber tehdit ve guvenlik acigi degerlendirme yetkinligini artirmak',
   2026, 'RISK_MANAGEMENT', now(), now()),
  ('d2000000-0000-0000-0000-000000000006', '11111111-1111-1111-1111-111111111111',
   'Yapay Zeka Destekli Denetim', 'AI tabanli anomali tespiti ve bulgu onerisi yetenekleri gelistirmek',
   2026, 'ADVISORY', now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO strategy_alignment_matrix (id, tenant_id, bank_goal_id, audit_objective_id, relevance_score, rationale, created_at, updated_at)
VALUES
  ('d3000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111',
   'd1000000-0000-0000-0000-000000000001', 'd2000000-0000-0000-0000-000000000001',
   0.95, 'Dijital buyume hedefi dogrudan dijital kanal denetim kapsamini etkiler', now(), now()),
  ('d3000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111',
   'd1000000-0000-0000-0000-000000000002', 'd2000000-0000-0000-0000-000000000002',
   0.90, 'Operasyonel verimlilik hedefi surekli denetim olgunlugunu gerektirir', now(), now()),
  ('d3000000-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111',
   'd1000000-0000-0000-0000-000000000003', 'd2000000-0000-0000-0000-000000000003',
   1.00, 'Regulatorye uyum dogrudan uyum denetimlerini etkiler', now(), now()),
  ('d3000000-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111',
   'd1000000-0000-0000-0000-000000000002', 'd2000000-0000-0000-0000-000000000004',
   0.85, 'Operasyonel verimlilik sube denetim sureclerini optimize eder', now(), now()),
  ('d3000000-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111',
   'd1000000-0000-0000-0000-000000000004', 'd2000000-0000-0000-0000-000000000005',
   0.88, 'Teknoloji hedefleri siber guvenlik denetim kapasitesini gerektirir', now(), now()),
  ('d3000000-0000-0000-0000-000000000006', '11111111-1111-1111-1111-111111111111',
   'd1000000-0000-0000-0000-000000000004', 'd2000000-0000-0000-0000-000000000006',
   0.92, 'Inovasyon hedefi yapay zeka destekli denetimi zorunlu kilar', now(), now()),
  ('d3000000-0000-0000-0000-000000000007', '11111111-1111-1111-1111-111111111111',
   'd1000000-0000-0000-0000-000000000005', 'd2000000-0000-0000-0000-000000000002',
   0.80, 'Risk yonetimi guclendirme surekli denetim olgunlugunu destekler', now(), now()),
  ('d3000000-0000-0000-0000-000000000008', '11111111-1111-1111-1111-111111111111',
   'd1000000-0000-0000-0000-000000000001', 'd2000000-0000-0000-0000-000000000005',
   0.75, 'Dijital buyume siber risk denetimini zorunlu kilar', now(), now())
ON CONFLICT (id) DO NOTHING;

-- Template Steps: Sube Operasyonel (55fdafcd-2292-4eda-9611-a226772ce9c3)
INSERT INTO template_steps (id, tenant_id, template_id, step_order, control_id, control_title, test_procedure, risk_id, expected_evidence, testing_method, sample_size_guidance, is_key_control, created_at, updated_at)
VALUES
  ('d4000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111',
   '55fdafcd-2292-4eda-9611-a226772ce9c3', 1, 'CTRL-BR-001', 'Kasa Sayim Kontrolu',
   'Gunluk kasa sayim tutanaklarini inceleyin ve fiili bakiye ile mutabakat yapin',
   NULL, 'Kasa sayim tutanaklari, GL mutabakati', 'Inspection', '30 gun ornekleme', true, now(), now()),
  ('d4000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111',
   '55fdafcd-2292-4eda-9611-a226772ce9c3', 2, 'CTRL-BR-002', 'Yetki Limitleri Kontrolu',
   'Sube personelinin islem yetki limitlerini dogrulayin ve asim islemlerini inceleyin',
   NULL, 'Yetki matrisi, asim raporlari', 'Inquiry', 'Tum yetki degisiklikleri', true, now(), now()),
  ('d4000000-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111',
   '55fdafcd-2292-4eda-9611-a226772ce9c3', 3, 'CTRL-BR-003', 'Musteri Hesap Acilisi',
   'Hesap acilis belgelerinin tamligi ve MASAK uyumunu kontrol edin',
   NULL, 'Hesap acilis dosyalari, kimlik belgeleri', 'Inspection', '25 hesap ornekleme', false, now(), now()),
  ('d4000000-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111',
   '55fdafcd-2292-4eda-9611-a226772ce9c3', 4, 'CTRL-BR-004', 'Kredi Dosyasi Kontrolu',
   'Kredi tahsis ve kullandirma sureclerinin mevzuata uygunlugunu inceleyin',
   NULL, 'Kredi dosyalari, komite kararlari', 'Reperformance', '15 kredi dosyasi', true, now(), now()),
  ('d4000000-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111',
   '55fdafcd-2292-4eda-9611-a226772ce9c3', 5, 'CTRL-BR-005', 'Emanet Kasa Kontrolu',
   'Emanet kasa envanter listesini fiili durumla karsilastirin',
   NULL, 'Emanet kasa defteri, envanter listesi', 'Observation', 'Tum emanet kasalar', false, now(), now())
ON CONFLICT (id) DO NOTHING;

-- Template Steps: Siber Guvenlik (363cfe52-c3ae-4d4e-88ac-796240c05002)
INSERT INTO template_steps (id, tenant_id, template_id, step_order, control_id, control_title, test_procedure, risk_id, expected_evidence, testing_method, sample_size_guidance, is_key_control, created_at, updated_at)
VALUES
  ('d4000000-0000-0000-0000-000000000006', '11111111-1111-1111-1111-111111111111',
   '363cfe52-c3ae-4d4e-88ac-796240c05002', 1, 'CTRL-CY-001', 'Erisim Yonetimi Kontrolu',
   'Kritik sistemlere erisim haklarini ve yetkilendirme sureclerini inceleyin',
   NULL, 'Active Directory raporlari, erisim matrisi', 'Inspection', 'Tum kritik sistemler', true, now(), now()),
  ('d4000000-0000-0000-0000-000000000007', '11111111-1111-1111-1111-111111111111',
   '363cfe52-c3ae-4d4e-88ac-796240c05002', 2, 'CTRL-CY-002', 'Guvenlik Duvari Kurallari',
   'Firewall kurallarini guvenlik politikasina uygunluk acisindan degerlendirin',
   NULL, 'Firewall konfigurasyonu, kural degisiklik loglari', 'Reperformance', 'Tum FW kurallari', true, now(), now()),
  ('d4000000-0000-0000-0000-000000000008', '11111111-1111-1111-1111-111111111111',
   '363cfe52-c3ae-4d4e-88ac-796240c05002', 3, 'CTRL-CY-003', 'Zafiyet Tarama Sureci',
   'Periyodik zafiyet taramalarinin yapildigini ve aksiyon alindigini dogrulayin',
   NULL, 'Zafiyet tarama raporlari, remediation planlari', 'Inquiry', 'Son 6 ay taramalari', false, now(), now()),
  ('d4000000-0000-0000-0000-000000000009', '11111111-1111-1111-1111-111111111111',
   '363cfe52-c3ae-4d4e-88ac-796240c05002', 4, 'CTRL-CY-004', 'Olay Mudahale Sureci',
   'Siber guvenlik olay mudahale planini ve son 12 aydaki olaylari inceleyin',
   NULL, 'IRP dokumani, olay kayitlari, tatbikat raporlari', 'Inspection', 'Tum P1/P2 olaylar', true, now(), now()),
  ('d4000000-0000-0000-0000-000000000010', '11111111-1111-1111-1111-111111111111',
   '363cfe52-c3ae-4d4e-88ac-796240c05002', 5, 'CTRL-CY-005', 'Veri Sizdirmazlik (DLP)',
   'DLP politikalarinin etkinligini ve ihlal vakalarini degerlendirin',
   NULL, 'DLP politikalari, ihlal raporlari, istisna listesi', 'Reperformance', 'Son 3 ay DLP alarmlari', false, now(), now())
ON CONFLICT (id) DO NOTHING;
