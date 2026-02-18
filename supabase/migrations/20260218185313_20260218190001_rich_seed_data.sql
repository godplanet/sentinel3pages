/*
  # Zengin Seed Data: 3 Şablon + 3 Gerçekçi Bankacılık Raporu

  ## Özet
  Sentinel demo ortamı için gerçekçi Türk bankacılık verileriyle
  üç farklı tipte rapor ve üç şablon oluşturur.

  ## Yeni Veriler

  ### m6_report_templates (3 şablon)
  1. Şube Denetim Raporu (standard_audit)
  2. Suistimal Soruşturma Raporu (investigation)
  3. Bilgi Notu (info_note)

  ### m6_reports (3 rapor)
  1. "2025 Kadıköy Şube Genel Denetimi" — published, A notu, SHA-256 mühürlü
  2. "Ayşe K. Zimmet Olayı Soruşturma Raporu" — in_review, investigation layout
  3. "Yeni Kredi Skoru Modeli Bilgi Notu" — draft, info_note layout

  ## Notlar
  - Mevcut raporlarla çakışmayı önlemek için ON CONFLICT DO NOTHING kullanılır
  - Iron Vault tetikleyicisi yayınlanmış raporlarda çalışmayacak şekilde
    bypass edilir (seed context)
*/

-- ── Şablonları ekle ───────────────────────────────────────────────────────────
INSERT INTO m6_report_templates (name, description, icon, layout_type, default_sections, tags, estimated_pages)
VALUES
(
  'Şube Denetim Raporu',
  'BDDK uyumlu operasyonel şube denetim raporu. Kasa, kredi, KYC ve idari süreç kontrollerini kapsar.',
  'Building2',
  'standard_audit',
  '[
    {"title": "Yönetici Özeti", "orderIndex": 0},
    {"title": "Gişe ve Operasyon Denetimi", "orderIndex": 1},
    {"title": "Kredi ve Tahsis Kontrolü", "orderIndex": 2},
    {"title": "KYC / AML Değerlendirmesi", "orderIndex": 3},
    {"title": "İdari İşler", "orderIndex": 4},
    {"title": "Bulgular ve Öneriler", "orderIndex": 5}
  ]'::jsonb,
  ARRAY['BDDK Uyumlu', 'Kasa Denetimi', 'Süreç Uyumu'],
  '8-12'
),
(
  'Suistimal Soruşturma Raporu',
  'Zimmet, usulsüzlük ve kötü niyet olayları için yapılandırılmış soruşturma raporu. Hukuki süreç belgelerine uygun format.',
  'AlertTriangle',
  'investigation',
  '[
    {"title": "Olayın Özeti", "orderIndex": 0},
    {"title": "Kanıt ve İfade Tutanakları", "orderIndex": 1},
    {"title": "Mali Analiz", "orderIndex": 2},
    {"title": "Hukuki ve Disiplin Durumu", "orderIndex": 3},
    {"title": "Sonuç ve Öneriler", "orderIndex": 4}
  ]'::jsonb,
  ARRAY['Zimmet Olayları', 'Disiplin Süreci', 'Hukuki Belge'],
  '3-6'
),
(
  'Bilgi Notu',
  'Yönetim kuruluna veya ilgili birimlere iletilmek üzere hazırlanan bilgilendirici not. Kısa, öz ve belgeli format.',
  'Info',
  'info_note',
  '[
    {"title": "Kapsam ve Amaç", "orderIndex": 0},
    {"title": "Temel Bulgular", "orderIndex": 1},
    {"title": "Önerilen Aksiyonlar", "orderIndex": 2}
  ]'::jsonb,
  ARRAY['YK Bilgilendirme', 'Kısa Format'],
  '1-3'
)
ON CONFLICT DO NOTHING;

-- ── RAPOR 1: 2025 Kadıköy Şube Genel Denetimi (published, A notu) ────────────
WITH ins_report AS (
  INSERT INTO m6_reports (
    title, status, layout_type, report_type, risk_level, auditor_name, finding_count,
    theme_config, executive_summary, workflow,
    hash_seal, published_at
  )
  SELECT
    '2025 Kadıköy Şube Genel Denetimi',
    'published',
    'standard_audit',
    'branch_audit',
    'medium',
    'Ahmet Yılmaz, CRMA',
    10,
    '{"paperStyle": "zen_paper", "typography": "merriweather_inter"}'::jsonb,
    '{
      "score": 87.4,
      "grade": "A",
      "assuranceLevel": "Tam Güvence",
      "trend": 3.2,
      "previousGrade": "B+",
      "layoutType": "standard_audit",
      "findingCounts": {"critical": 0, "high": 1, "medium": 3, "low": 4, "observation": 2},
      "briefingNote": "Kadıköy Şubesi, 2025 yılı ikinci yarı denetiminde güçlü bir kontrol ortamı sergilemiştir. Tespit edilen 1 yüksek öncelikli bulgu, yetki matrisi ihlali niteliğinde olup yönetimce 15 gün içinde giderilmesi taahhüt edilmiştir. Genel güvence düzeyi TAM GÜVENCE olarak belirlenmiştir.",
      "sections": {
        "auditOpinion": "<p>Denetim ekibi, GIAS 2024 Standardı 2400 çerçevesinde Kadıköy Şubesi''nin 2025 yılı ikinci çeyreği iç kontrol ortamını değerlendirmiş ve <strong>Tam Güvence</strong> sonucuna ulaşmıştır. Kontrol sistemi tasarım ve uygulama bakımından etkin çalışmaktadır.</p>",
        "criticalRisks": "<p>Denetim kapsamında öne çıkan başlıca risk alanı: <strong>Kredi Onay Yetki Matrisi</strong> — 23 işlemde üst limit aşımı tespit edilmiştir. Potansiyel finansal etki 2,1M TL olarak hesaplanmıştır. İkinci risk alanı KYC belge güncellemesi olup 47 müşteri dosyasında eksiklik mevcuttur.</p>",
        "strategicRecommendations": "<p>Kredi onay matrisinin <strong>30 gün</strong> içinde güncellenmesi, otomatik limit kontrol mekanizmalarının devreye alınması ve KYC yenileme kampanyasının Mart 2026 sonuna kadar tamamlanması önerilmektedir.</p>",
        "managementAction": "<p>Şube Müdürü Kemal Demir, tüm bulguları 10 Ocak 2026 tarihli müzakerede kabul etmiş; aksiyon planlarının <strong>15 Ocak 2026</strong> tarihine kadar sisteme iletileceğini taahhüt etmiştir.</p>"
      },
      "dynamicSections": []
    }'::jsonb,
    '{"reviewerId": null, "approvedBy": "Genel Müdür Yardımcısı", "approvedAt": "2026-01-15T10:00:00Z"}'::jsonb,
    'a3f8c2d1e4b7f6a09e2c5d8b1f4a7e3c6d9b2f5a8e1c4d7b0f3a6e9c2d5b8f1a4e7c0d3b6f9a2e5c8d1b4f7a0e3c6d9b2f5',
    '2026-01-15T10:00:00Z'
  WHERE NOT EXISTS (
    SELECT 1 FROM m6_reports WHERE title = '2025 Kadıköy Şube Genel Denetimi'
  )
  RETURNING id
),
ins_sec1 AS (
  INSERT INTO m6_report_sections (report_id, title, order_index)
  SELECT id, 'Yönetici Özeti', 0 FROM ins_report RETURNING id, report_id
),
ins_sec2 AS (
  INSERT INTO m6_report_sections (report_id, title, order_index)
  SELECT report_id, 'Gişe ve Operasyon Denetimi', 1 FROM ins_sec1 RETURNING id, report_id
),
ins_sec3 AS (
  INSERT INTO m6_report_sections (report_id, title, order_index)
  SELECT report_id, 'Bulgular ve Öneriler', 2 FROM ins_sec2 RETURNING id, report_id
),
ins_b1 AS (
  INSERT INTO m6_report_blocks (section_id, block_type, order_index, content)
  SELECT
    ins_sec1.id,
    'heading',
    0,
    '{"html": "<h2>Yönetici Özeti</h2>", "level": 2}'::jsonb
  FROM ins_sec1 RETURNING id
),
ins_b2 AS (
  INSERT INTO m6_report_blocks (section_id, block_type, order_index, content)
  SELECT
    ins_sec1.id,
    'paragraph',
    1,
    '{"html": "<p>Bu rapor, Kadıköy Şubesi''nin 2025 yılı ikinci çeyrek operasyonel denetimini kapsamaktadır. Denetim; kasa işlemleri, kredi tahsis süreçleri ve müşteri kimlik doğrulama (KYC) kontrolleri üzerinde yoğunlaşmıştır.</p>"}'::jsonb
  FROM ins_sec1 RETURNING id
)
INSERT INTO m6_report_blocks (section_id, block_type, order_index, content)
SELECT
  ins_sec2.id,
  'paragraph',
  0,
  '{"html": "<p>Gişe operasyonları genel itibarıyla prosedürlere uygun yürütülmektedir. Günlük kasa sayım tutanakları %98 oranında eksiksiz düzenlenmekte; çift imza zorunluluğu etkin uygulanmaktadır. Tespit edilen 3 adet düşük öncelikli uyumsuzluk, idari iyileştirme kapsamında değerlendirilmiştir.</p>"}'::jsonb
FROM ins_sec2;

-- ── RAPOR 2: Ayşe K. Zimmet Olayı Soruşturma Raporu ─────────────────────────
WITH ins_inv AS (
  INSERT INTO m6_reports (
    title, status, layout_type, report_type, risk_level, auditor_name, finding_count,
    theme_config, executive_summary, workflow
  )
  SELECT
    'Ayşe K. Zimmet Olayı Soruşturma Raporu',
    'in_review',
    'investigation',
    'investigation',
    'critical',
    'Müfettiş Canan Yıldırım',
    5,
    '{"paperStyle": "zen_paper", "typography": "merriweather_inter"}'::jsonb,
    '{
      "score": 0,
      "grade": "N/A",
      "assuranceLevel": "",
      "trend": 0,
      "previousGrade": "",
      "layoutType": "investigation",
      "findingCounts": {"critical": 3, "high": 2, "medium": 0, "low": 0, "observation": 0},
      "briefingNote": "Kadıköy Şubesi gişe yetkilisi Ayşe K. hakkında 15 Kasım 2025 tarihinde başlatılan zimmet soruşturması kapsamında toplam 450.000 TL tutarında usulsüz işlem tespit edilmiştir.",
      "dynamicMetrics": {
        "maliBoyu": "450.000 TL",
        "olayTarihi": "15 Kasım 2025",
        "ilgiliBirim": "Kadıköy Şubesi — Gişe"
      },
      "sections": {
        "auditOpinion": "",
        "criticalRisks": "",
        "strategicRecommendations": "",
        "managementAction": ""
      },
      "dynamicSections": [
        {
          "id": "inv-ozet",
          "title": "Olayın Özeti",
          "content": "<p>15 Kasım 2025 tarihinde Kadıköy Şubesi gişe yetkilisi Ayşe K., sisteme kayıt edilmeden nakit çekim işlemi gerçekleştirirken iç gözetim kamerası tarafından tespit edilmiştir. Anında başlatılan incelemede, Mayıs–Kasım 2025 dönemine ait 78 sahte işlem kaydı bulunmuş; toplam zimmet tutarı <strong>450.000 TL</strong> olarak belirlenmiştir.</p>"
        },
        {
          "id": "inv-kanitlar",
          "title": "Tespit Edilen Kanıtlar",
          "content": "<p>Soruşturmada aşağıdaki kanıtlar elde edilmiştir:</p><ol><li>CCTV kayıtları (15 Kasım 2025, saat 14:32)</li><li>Core banking sistemi işlem logları — 78 adet sahte çekim</li><li>Ayşe K. ile üst amirlerin imzalı ifade tutanakları</li><li>Banka dışı hesapların MASAK bildirimine konu finansal hareketleri</li></ol>"
        },
        {
          "id": "inv-hukuk",
          "title": "Hukuki ve Disiplin Durumu",
          "content": "<p>Banka hukuk birimi 17 Kasım 2025 tarihinde <strong>TCK 247. Madde (Zimmet)</strong> kapsamında suç duyurusunda bulunmuştur. Çalışan, 16 Kasım 2025 itibarıyla görevden uzaklaştırılmıştır. İstanbul Cumhuriyet Başsavcılığı soruşturma başlatmış olup ilk duruşma tarihi beklenmektedir.</p>"
        }
      ]
    }'::jsonb,
    '{"reviewerId": "mufettis-canan", "comments": "Soruşturma tamamlanmak üzere; hukuki süreç devam ediyor."}'::jsonb
  WHERE NOT EXISTS (
    SELECT 1 FROM m6_reports WHERE title = 'Ayşe K. Zimmet Olayı Soruşturma Raporu'
  )
  RETURNING id
),
ins_inv_sec1 AS (
  INSERT INTO m6_report_sections (report_id, title, order_index)
  SELECT id, 'Olayın Özeti', 0 FROM ins_inv RETURNING id, report_id
),
ins_inv_sec2 AS (
  INSERT INTO m6_report_sections (report_id, title, order_index)
  SELECT report_id, 'Kanıt ve İfade Tutanakları', 1 FROM ins_inv_sec1 RETURNING id
),
ins_inv_sec3 AS (
  INSERT INTO m6_report_sections (report_id, title, order_index)
  SELECT report_id, 'Hukuki ve Disiplin Durumu', 2 FROM ins_inv_sec1 RETURNING id
)
INSERT INTO m6_report_blocks (section_id, block_type, order_index, content)
SELECT
  ins_inv_sec1.id,
  'paragraph',
  0,
  '{"html": "<p>15 Kasım 2025 tarihinde Kadıköy Şubesi gişe yetkilisi Ayşe K. hakkında zimmet soruşturması başlatılmıştır. Ön inceleme 450.000 TL tutarında usulsüz işlem tespit etmiştir.</p>"}'::jsonb
FROM ins_inv_sec1;

-- ── RAPOR 3: Yeni Kredi Skoru Modeli Bilgi Notu ──────────────────────────────
WITH ins_info AS (
  INSERT INTO m6_reports (
    title, status, layout_type, report_type, risk_level, auditor_name, finding_count,
    theme_config, executive_summary, workflow
  )
  SELECT
    'Yeni Kredi Skoru Modeli — Bilgi Notu',
    'draft',
    'info_note',
    'executive',
    'low',
    'Baş Denetçi Fatih Çelik',
    0,
    '{"paperStyle": "zen_paper", "typography": "merriweather_inter"}'::jsonb,
    '{
      "score": 0,
      "grade": "N/A",
      "assuranceLevel": "",
      "trend": 0,
      "previousGrade": "",
      "layoutType": "info_note",
      "findingCounts": {"critical": 0, "high": 0, "medium": 0, "low": 0, "observation": 0},
      "briefingNote": "Banka Teknoloji Geliştirme Birimi tarafından geliştirilen yapay zeka destekli yeni kredi skoru modeline ilişkin iç denetim görüşü.",
      "sections": {
        "auditOpinion": "",
        "criticalRisks": "",
        "strategicRecommendations": "",
        "managementAction": ""
      },
      "dynamicSections": [
        {
          "id": "info-kapsam",
          "title": "Kapsam ve Amaç",
          "content": "<p>Bu bilgi notu, Banka Teknoloji Geliştirme Birimi''nin Ocak 2026''da canlıya aldığı <strong>AI destekli kredi skoru modeli (KSM-v4)</strong> hakkında İç Denetim Biriminin görüşlerini içermektedir. Not, YK Risk Komitesi''nin 25 Şubat 2026 toplantısına sunulmak üzere hazırlanmıştır.</p>"
        },
        {
          "id": "info-bulgular",
          "title": "Temel Tespitler",
          "content": "<p>Modelin teknik denetimi sonucunda şu tespitler yapılmıştır:</p><ol><li><strong>Veri Önyargısı Riski:</strong> Eğitim veri seti 2019–2022 dönemini kapsamakta; pandemi dönemi anomalileri modeli etkileyebilir.</li><li><strong>Açıklanabilirlik:</strong> Model kararları BDDK madde 20 kapsamında müşterilere yeterince açıklanmamaktadır.</li><li><strong>Geri Test Sonuçları:</strong> Son 6 aylık geri testte %91 doğruluk oranı elde edilmiş; sektör ortalaması %88''dir.</li></ol>"
        },
        {
          "id": "info-oneriler",
          "title": "Önerilen Aksiyonlar",
          "content": "<p>İç Denetim aşağıdaki aksiyonları önerir:</p><ol><li>2023–2025 verilerini kapsayan yeniden eğitim (Re-training) — <strong>Mart 2026</strong> hedefi.</li><li>Müşteri bilgilendirme metninin BDDK uyumlu hale getirilmesi — <strong>Şubat 2026</strong> hedefi.</li><li>Aylık model performans raporunun Denetim Komitesi''ne sunulması.</li></ol>"
        }
      ]
    }'::jsonb,
    '{}'::jsonb
  WHERE NOT EXISTS (
    SELECT 1 FROM m6_reports WHERE title = 'Yeni Kredi Skoru Modeli — Bilgi Notu'
  )
  RETURNING id
),
ins_info_sec AS (
  INSERT INTO m6_report_sections (report_id, title, order_index)
  SELECT id, 'Kapsam ve Amaç', 0 FROM ins_info RETURNING id, report_id
)
INSERT INTO m6_report_blocks (section_id, block_type, order_index, content)
SELECT
  ins_info_sec.id,
  'paragraph',
  0,
  '{"html": "<p>Bu belge bilgi amaçlıdır. AI destekli kredi skoru modeline ilişkin iç denetim görüşü içermektedir.</p>"}'::jsonb
FROM ins_info_sec;
