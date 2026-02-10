/*
  # Seed demo data for reports and workpapers (corrected)

  1. New Data
    - 4 sample reports using valid statuses: draft, review, published, archived
    - 8 report blocks using valid block_type: heading, paragraph
    - 6 workpapers using valid statuses: draft, review, finalized

  2. Notes
    - Respects all check constraints on reports, report_blocks, and workpapers
    - Turkish banking audit content for demo purposes
*/

DO $$
DECLARE
  t_id uuid := '11111111-1111-1111-1111-111111111111';
  eng_id uuid := '10000000-0000-0000-0000-000000000003';
  r1 uuid := gen_random_uuid();
  r2 uuid := gen_random_uuid();
  r3 uuid := gen_random_uuid();
  r4 uuid := gen_random_uuid();
  step1 uuid;
  step2 uuid;
  step3 uuid;
  step4 uuid;
  step5 uuid;
BEGIN
  SELECT id INTO step1 FROM audit_steps LIMIT 1 OFFSET 0;
  SELECT id INTO step2 FROM audit_steps LIMIT 1 OFFSET 1;
  SELECT id INTO step3 FROM audit_steps LIMIT 1 OFFSET 2;
  SELECT id INTO step4 FROM audit_steps LIMIT 1 OFFSET 3;
  SELECT id INTO step5 FROM audit_steps LIMIT 1 OFFSET 4;

  INSERT INTO reports (id, tenant_id, engagement_id, title, description, status, template_id, created_at, updated_at) VALUES
    (r1, t_id, eng_id, 'Kadikoy Subesi Operasyonel Denetim Raporu',
     'Kadikoy subesi operasyonel sureclerin yeterliligi ve etkinligi degerlendirmesi',
     'draft',
     (SELECT id FROM report_templates WHERE type = 'BRANCH' LIMIT 1),
     now() - interval '3 days', now() - interval '1 hour'),
    (r2, t_id, eng_id, 'Bilgi Sistemleri Genel Kontrol Denetimi',
     'COBIT cercevesinde BT genel kontrollerin degerlendirmesi - 2026 Q1',
     'review',
     (SELECT id FROM report_templates WHERE type = 'IT' LIMIT 1),
     now() - interval '7 days', now() - interval '2 days'),
    (r3, t_id, eng_id, 'Kredi Surecleri Uyum Incelemesi',
     'BDDK duzenlemelerine uyum kapsaminda kredi tahsis ve izleme surecleri',
     'published',
     NULL,
     now() - interval '14 days', now() - interval '5 days'),
    (r4, t_id, eng_id, 'Nakit Yonetimi ve Hazine Islemleri',
     'Hazine operasyonlari ve nakit akis yonetimi denetim raporu',
     'draft',
     NULL,
     now() - interval '1 day', now());

  INSERT INTO report_blocks (tenant_id, report_id, position_index, block_type, content, depth_level) VALUES
    (t_id, r1, 0, 'heading', '{"text": "1. Yonetici Ozeti"}'::jsonb, 0),
    (t_id, r1, 1, 'paragraph', '{"html": "<p>Kadikoy Subesi operasyonel denetimi kapsaminda toplam 12 kontrol noktasi incelenmis, 3 yuksek, 5 orta ve 2 dusuk riskli bulgu tespit edilmistir. Genel denetim notu <strong>72/100 (C+)</strong> olarak belirlenmistir.</p>"}'::jsonb, 0),
    (t_id, r1, 2, 'heading', '{"text": "2. Denetim Kapsami"}'::jsonb, 0),
    (t_id, r1, 3, 'paragraph', '{"html": "<p>Denetim, 01.01.2026 - 31.01.2026 tarihleri arasindaki operasyonel surecleri kapsamaktadir. Nakit islemleri, kredi tahsisi, musteri sikayetleri ve kontrol mekanizmalari incelenmistir.</p>"}'::jsonb, 0);

  INSERT INTO report_blocks (tenant_id, report_id, position_index, block_type, content, depth_level) VALUES
    (t_id, r2, 0, 'heading', '{"text": "1. BT Genel Kontrol Degerlendirmesi"}'::jsonb, 0),
    (t_id, r2, 1, 'paragraph', '{"html": "<p>COBIT 2019 cercevesinde yapilan degerlendirmede, erisim kontrolleri ve degisiklik yonetimi sureclerinde iyilestirme alanlari tespit edilmistir. Toplam 8 bulgu raporlanmistir.</p>"}'::jsonb, 0),
    (t_id, r2, 2, 'heading', '{"text": "2. Erisim Yonetimi Bulgulari"}'::jsonb, 0),
    (t_id, r2, 3, 'paragraph', '{"html": "<p>Kullanici erisim haklarinin periyodik gozden gecirilmesinde aksakliklar tespit edilmistir. Ayrilmis personel hesaplarinin yuzde sekizi hala aktif durumdadir.</p>"}'::jsonb, 0);

  INSERT INTO workpapers (step_id, status, approval_status, data, version) VALUES
    (step1, 'finalized', 'approved',
     '{"control_ref": "AC-001", "title": "Erisim Kontrol Matrisi", "scope": "Tum kullanici hesaplari"}'::jsonb, 1),
    (step2, 'draft', 'in_progress',
     '{"control_ref": "AC-002", "title": "Ayrilanlar Listesi Dogrulama", "scope": "Son 6 ay"}'::jsonb, 1),
    (step3, 'finalized', 'review_pending',
     '{"control_ref": "NS-001", "title": "Firewall Kural Seti Analizi", "scope": "Tum firewall kurallari"}'::jsonb, 2),
    (step4, 'review', 'in_progress',
     '{"control_ref": "CM-001", "title": "Degisiklik Yonetimi Sureci", "scope": "Uretim ortami degisiklikleri"}'::jsonb, 1),
    (step5, 'finalized', 'approved',
     '{"control_ref": "BC-001", "title": "Felaket Kurtarma Plani Testi", "scope": "Yillik DR testi"}'::jsonb, 3),
    (step1, 'draft', 'not_started',
     '{"control_ref": "DP-001", "title": "Veri Siniflandirma Kontrolu", "scope": "Hassas veri envanter"}'::jsonb, 1);
END $$;