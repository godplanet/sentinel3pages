/*
  # Seed RKM Data (Final - Correct Columns)
*/

-- RKM PROCESSES
INSERT INTO rkm_processes (id, tenant_id, process_code, process_name, process_type, path, level) VALUES
  ('96000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'PR-KF-00', 'Kredi ve Finansman İşlemleri', 'PRIMARY', 'PR-KF-00', 1),
  ('96000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'PR-FK-00', 'Fon Kaynaklarının Yönetimi', 'PRIMARY', 'PR-FK-00', 1),
  ('96000000-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'PR-MH-00', 'Müşteri Hizmetleri', 'PRIMARY', 'PR-MH-00', 1),
  ('96000000-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 'PR-BK-00', 'Bilgi Teknolojisi', 'SUPPORT', 'PR-BK-00', 1),
  ('96000000-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111', 'PR-FR-00', 'Finansal Raporlama', 'SUPPORT', 'PR-FR-00', 1),
  ('96000000-0000-0000-0000-000000000006', '11111111-1111-1111-1111-111111111111', 'PR-OS-00', 'Operasyonel Süreçler', 'PRIMARY', 'PR-OS-00', 1),
  ('96000000-0000-0000-0000-000000000007', '11111111-1111-1111-1111-111111111111', 'PR-HZ-00', 'Hazine İşlemleri', 'PRIMARY', 'PR-HZ-00', 1),
  ('96000000-0000-0000-0000-000000000008', '11111111-1111-1111-1111-111111111111', 'PR-DG-00', 'Destek Fonksiyonları', 'SUPPORT', 'PR-DG-00', 1)
ON CONFLICT (id) DO NOTHING;

-- RKM RISKS
INSERT INTO rkm_risks (
  id, tenant_id, risk_code, risk_title, risk_description,
  main_process, sub_process, risk_category,
  inherent_likelihood, inherent_impact,
  residual_likelihood, residual_impact,
  risk_owner
) VALUES
  ('97000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'RSK-KF-001', 'Kredi Tahsis Yetki Aşımı', 'Limit aşımı', 'Kredi ve Finansman İşlemleri', 'Kredi Tahsisi', 'Operasyonel', 4, 5, 2, 4, 'Kredi Müdürü'),
  ('97000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'RSK-KF-002', 'Teminat Yetersizliği', 'Değerleme hatası', 'Kredi ve Finansman İşlemleri', 'Teminat', 'Mali', 4, 4, 3, 3, 'Hukuk'),
  ('97000000-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111', 'RSK-FK-002', 'Likidite Kriz', 'Ani çıkış', 'Fon Kaynaklarının Yönetimi', 'Likidite', 'Mali', 4, 5, 2, 4, 'CFO'),
  ('97000000-0000-0000-0000-000000000006', '11111111-1111-1111-1111-111111111111', 'RSK-MH-001', 'KYC/AML Eksikliği', 'Kimlik eksik', 'Müşteri Hizmetleri', 'Onboarding', 'Uyumluluk', 4, 5, 2, 3, 'Uyumluluk'),
  ('97000000-0000-0000-0000-000000000009', '11111111-1111-1111-1111-111111111111', 'RSK-BK-001', 'Siber Saldırı', 'Ransomware', 'Bilgi Teknolojisi', 'Siber Güvenlik', 'Teknoloji', 5, 5, 3, 4, 'CISO'),
  ('97000000-0000-0000-0000-000000000010', '11111111-1111-1111-1111-111111111111', 'RSK-BK-002', 'Sistem Kesintisi', 'Downtime', 'Bilgi Teknolojisi', 'IT Altyapı', 'Teknoloji', 4, 5, 2, 3, 'CTO'),
  ('97000000-0000-0000-0000-000000000017', '11111111-1111-1111-1111-111111111111', 'RSK-HZ-001', 'Döviz Riski', 'Volatilite', 'Hazine İşlemleri', 'Döviz', 'Piyasa', 5, 4, 3, 3, 'Hazine'),
  ('97000000-0000-0000-0000-000000000014', '11111111-1111-1111-1111-111111111111', 'RSK-OS-001', 'Kasa Soygun', 'Hırsızlık', 'Operasyonel Süreçler', 'Kasa', 'Operasyonel', 2, 5, 1, 3, 'Operasyon')
ON CONFLICT (id) DO NOTHING;

-- RKM TEMPLATES
INSERT INTO rkm_templates (id, tenant_id, module_type, name, description, schema_definition, is_active) VALUES
  ('98000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'operational', 'Şube Operasyonel Risk', 'Şube şablonu', '{}'::jsonb, true),
  ('98000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'technology', 'Siber Güvenlik', 'IT şablonu', '{}'::jsonb, true)
ON CONFLICT (id) DO NOTHING;
