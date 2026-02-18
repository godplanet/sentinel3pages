/*
  # Modül 6 — Raporlama Seed Verisi

  ## Özet
  GIAS/BDDK uyumlu, Yönetici Özeti doldurulmuş örnek rapor ve ilgili
  bölüm, blok ve inceleme notlarını oluşturur. Demo ortamı için hazırdır.

  ## Eklenen Kayıtlar
  - 1 adet `m6_reports` — A+ notlu, draft durumunda örnek rapor
  - 2 adet `m6_report_sections` — 'Yönetici Özeti' ve 'Detaylı Bulgular'
  - 4 adet `m6_report_blocks` — heading, paragraph, finding_ref, live_chart
  - 1 adet `m6_review_notes` — open durumunda örnek inceleme notu
*/

DO $$
DECLARE
  v_report_id   uuid := 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
  v_section1_id uuid := 'b2c3d4e5-f6a7-8901-bcde-f01234567891';
  v_section2_id uuid := 'c3d4e5f6-a7b8-9012-cdef-012345678912';
  v_block1_id   uuid := 'd4e5f6a7-b8c9-0123-def0-123456789013';
  v_block2_id   uuid := 'e5f6a7b8-c9d0-1234-ef01-234567890124';
  v_block3_id   uuid := 'f6a7b8c9-d0e1-2345-f012-345678901235';
  v_block4_id   uuid := 'a7b8c9d0-e1f2-3456-0123-456789012346';
BEGIN

  -- ── Ana Rapor ─────────────────────────────────────────────
  INSERT INTO m6_reports (
    id,
    engagement_id,
    title,
    status,
    theme_config,
    executive_summary,
    workflow,
    smart_variables
  )
  VALUES (
    v_report_id,
    NULL,
    'Q1 2026 Siber Güvenlik ve BT Denetimi — İcra Özeti Raporu',
    'draft',
    '{
      "paperStyle": "zen_paper",
      "typography": "merriweather_inter",
      "accentColor": "#0f4c81",
      "warmthLevel": 3
    }',
    '{
      "grade": "A",
      "score": 92,
      "trend": "up",
      "trendDelta": 7,
      "boardNote": "Yönetim kuruluna sunulan bu rapor, Q1 2026 döneminde gerçekleştirilen siber güvenlik ve BT denetiminin sonuçlarını özetlemektedir. Genel denetim notu A (92/100) olup, önceki döneme göre 7 puanlık bir iyileşme gözlemlenmiştir.",
      "aiNarrative": "Sentinel Prime analizi: Kritik bulgu bulunmamaktadır. Tespit edilen 3 orta seviyeli bulgunun tamamı için yönetim tarafından eylem planları kabul edilmiştir. BT kontrol olgunluğu CMMI Seviye 3 standardına ulaşmıştır.",
      "keyMetrics": {
        "totalFindings": 5,
        "criticalFindings": 0,
        "highFindings": 1,
        "mediumFindings": 3,
        "lowFindings": 1,
        "closedActionPlans": 12,
        "openActionPlans": 3
      },
      "complianceFlags": ["BDDK_2023/47", "GIAS_2024_STD_12", "ISO27001:2022"],
      "giasBenchmark": {
        "standard": "GIAS 2024 Standart 12.4",
        "conformance": "FULLY_CONFORMS",
        "lastExternalReview": "2025-11-15"
      }
    }',
    '{
      "stages": [
        {"stage": "Denetçi Taslak", "user": "Ali Yılmaz", "date": "2026-02-10", "status": "completed"},
        {"stage": "Kıdemli Denetçi İncelemesi", "user": "Fatma Kaya", "date": null, "status": "pending"},
        {"stage": "BAŞDENETÇİ Onayı", "user": "Mehmet Demir", "date": null, "status": "pending"},
        {"stage": "Yayın", "user": null, "date": null, "status": "pending"}
      ],
      "currentStage": 1
    }',
    '{
      "auditPeriod": "Q1 2026 (01.01.2026 — 31.03.2026)",
      "auditEntity": "Sentinel Katılım Bankası A.Ş.",
      "preparedBy": "İç Denetim Birimi",
      "reportVersion": "v1.0-draft",
      "confidentiality": "GİZLİ — Yalnızca Yetkili Personel"
    }'
  )
  ON CONFLICT (id) DO NOTHING;

  -- ── Bölümler ──────────────────────────────────────────────
  INSERT INTO m6_report_sections (id, report_id, title, order_index) VALUES
    (v_section1_id, v_report_id, 'Yönetici Özeti',   1),
    (v_section2_id, v_report_id, 'Detaylı Bulgular',  2)
  ON CONFLICT (id) DO NOTHING;

  -- ── Bloklar ───────────────────────────────────────────────

  -- Blok 1: Başlık
  INSERT INTO m6_report_blocks (id, section_id, block_type, order_index, content)
  VALUES (
    v_block1_id,
    v_section1_id,
    'heading',
    1,
    '{
      "text": "Q1 2026 Siber Güvenlik ve BT Denetimi",
      "level": 1,
      "alignment": "center"
    }'
  )
  ON CONFLICT (id) DO NOTHING;

  -- Blok 2: Paragraf (AI Anlatı)
  INSERT INTO m6_report_blocks (id, section_id, block_type, order_index, content)
  VALUES (
    v_block2_id,
    v_section1_id,
    'paragraph',
    2,
    '{
      "html": "<p>Bu dönem gerçekleştirilen denetim kapsamında Sentinel Katılım Bankası A.Ş. BT altyapısı, siber güvenlik kontrolleri ve veri yönetimi süreçleri incelenmiştir. Genel değerlendirme notu <strong>A (92/100)</strong> olup önceki döneme kıyasla <em>+7 puan</em> iyileşme kaydedilmiştir. Kritik bulgu tespit edilmemiş olmakla birlikte, yüksek öncelikli 1 bulgu için kapsamlı bir eylem planı hazırlanmıştır.</p>",
      "wordCount": 72,
      "aiGenerated": true
    }'
  )
  ON CONFLICT (id) DO NOTHING;

  -- Blok 3: Finding Reference (Modül 5 mock bulgusu)
  INSERT INTO m6_report_blocks (id, section_id, block_type, order_index, content)
  VALUES (
    v_block3_id,
    v_section2_id,
    'finding_ref',
    1,
    '{
      "findingId": "f1a2b3c4-d5e6-7890-abcd-ef1234567800",
      "displayMode": "detailed_card",
      "showRootCause": true,
      "showActionPlan": true,
      "snapshotLabel": "Q1 2026 BT Denetim Bulgusu #1",
      "title": "Ağ Segmentasyonu Eksikliği — Üretim ve Test Ortamları",
      "severity": "high",
      "status": "in_remediation"
    }'
  )
  ON CONFLICT (id) DO NOTHING;

  -- Blok 4: Canlı Grafik (Bulgu Dağılımı)
  INSERT INTO m6_report_blocks (id, section_id, block_type, order_index, content)
  VALUES (
    v_block4_id,
    v_section2_id,
    'live_chart',
    2,
    '{
      "chartType": "risk_heatmap",
      "title": "Bulgu Ciddiyet Dağılımı — Q1 2026",
      "dataSource": "live_findings",
      "filters": {
        "engagementId": null,
        "period": "Q1_2026"
      },
      "staticFallback": {
        "labels": ["Kritik", "Yüksek", "Orta", "Düşük"],
        "values": [0, 1, 3, 1],
        "colors": ["#dc2626", "#ea580c", "#ca8a04", "#16a34a"]
      },
      "frozenAt": null
    }'
  )
  ON CONFLICT (id) DO NOTHING;

  -- ── İnceleme Notu ─────────────────────────────────────────
  INSERT INTO m6_review_notes (
    id,
    report_id,
    block_id,
    selected_text,
    comment,
    status,
    created_by
  )
  VALUES (
    'b8c9d0e1-f2a3-4567-89ab-cdef01234567',
    v_report_id,
    v_block2_id,
    '+7 puan',
    'Bu iyileşme rakamı doğrulanmalı. Önceki dönem skoru kaynağı eklenmeli (kıyaslama tablosu veya dipnot). BDDK 2023/47 gereklilik 4.2.c kapsamında belgeleme zorunluluğu var.',
    'open',
    NULL
  )
  ON CONFLICT (id) DO NOTHING;

END $$;
