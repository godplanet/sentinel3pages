/*
  # Seed Risk Velocity & KRI Config Data

  1. Updates audit_entities with position history for comet chart visualization
     - Sets last_position (Q4 2025) and current_position (Q1 2026) for all 12 entities
     - Calculates risk_velocity_score based on position delta

  2. Seeds integration_kri_config with 8 sample KRI signal configurations
     - SAP_HR: Staff Turnover, Training Completion
     - SIEM: Security Incidents, Failed Logins
     - CORE_BANKING: Transaction Error Rate, NPL Ratio
     - COMPLIANCE: Regulatory Breach Count
     - AML: SAR Filing Rate
*/

UPDATE audit_entities SET
  last_position = '{"x": 2, "y": 3, "date": "2025-12-31"}'::jsonb,
  current_position = '{"x": 3, "y": 4, "date": "2026-03-31"}'::jsonb,
  risk_velocity_score = 1.41
WHERE id = 'a0000000-0000-0000-0000-000000000001';

UPDATE audit_entities SET
  last_position = '{"x": 3, "y": 3, "date": "2025-12-31"}'::jsonb,
  current_position = '{"x": 4, "y": 4, "date": "2026-03-31"}'::jsonb,
  risk_velocity_score = 1.41
WHERE id = 'a0000000-0000-0000-0000-000000000002';

UPDATE audit_entities SET
  last_position = '{"x": 4, "y": 5, "date": "2025-12-31"}'::jsonb,
  current_position = '{"x": 3, "y": 4, "date": "2026-03-31"}'::jsonb,
  risk_velocity_score = -1.41
WHERE id = 'a0000000-0000-0000-0000-000000000003';

UPDATE audit_entities SET
  last_position = '{"x": 3, "y": 2, "date": "2025-12-31"}'::jsonb,
  current_position = '{"x": 4, "y": 3, "date": "2026-03-31"}'::jsonb,
  risk_velocity_score = 1.41
WHERE id = 'a0000000-0000-0000-0000-000000000004';

UPDATE audit_entities SET
  last_position = '{"x": 2, "y": 2, "date": "2025-12-31"}'::jsonb,
  current_position = '{"x": 2, "y": 3, "date": "2026-03-31"}'::jsonb,
  risk_velocity_score = 1.0
WHERE id = 'a0000000-0000-0000-0000-000000000005';

UPDATE audit_entities SET
  last_position = '{"x": 4, "y": 4, "date": "2025-12-31"}'::jsonb,
  current_position = '{"x": 3, "y": 3, "date": "2026-03-31"}'::jsonb,
  risk_velocity_score = -1.41
WHERE id = 'a0000000-0000-0000-0000-000000000006';

UPDATE audit_entities SET
  last_position = '{"x": 1, "y": 2, "date": "2025-12-31"}'::jsonb,
  current_position = '{"x": 2, "y": 2, "date": "2026-03-31"}'::jsonb,
  risk_velocity_score = 1.0
WHERE id = 'a0000000-0000-0000-0000-000000000007';

UPDATE audit_entities SET
  last_position = '{"x": 3, "y": 4, "date": "2025-12-31"}'::jsonb,
  current_position = '{"x": 4, "y": 5, "date": "2026-03-31"}'::jsonb,
  risk_velocity_score = 1.41
WHERE id = 'a0000000-0000-0000-0000-000000000008';

UPDATE audit_entities SET
  last_position = '{"x": 2, "y": 3, "date": "2025-12-31"}'::jsonb,
  current_position = '{"x": 2, "y": 2, "date": "2026-03-31"}'::jsonb,
  risk_velocity_score = -1.0
WHERE id = 'a0000000-0000-0000-0000-000000000009';

UPDATE audit_entities SET
  last_position = '{"x": 3, "y": 3, "date": "2025-12-31"}'::jsonb,
  current_position = '{"x": 3, "y": 4, "date": "2026-03-31"}'::jsonb,
  risk_velocity_score = 1.0
WHERE id = 'a0000000-0000-0000-0000-00000000000a';

UPDATE audit_entities SET
  last_position = '{"x": 1, "y": 1, "date": "2025-12-31"}'::jsonb,
  current_position = '{"x": 1, "y": 2, "date": "2026-03-31"}'::jsonb,
  risk_velocity_score = 1.0
WHERE id = 'a0000000-0000-0000-0000-00000000000b';

UPDATE audit_entities SET
  last_position = '{"x": 2, "y": 2, "date": "2025-12-31"}'::jsonb,
  current_position = '{"x": 3, "y": 3, "date": "2026-03-31"}'::jsonb,
  risk_velocity_score = 1.41
WHERE id = 'a0000000-0000-0000-0000-00000000000c';

INSERT INTO integration_kri_config (id, tenant_id, source_system, kri_name, threshold_value, impact_axis, impact_weight, is_active, description)
VALUES
  ('b0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001',
   'SAP_HR', 'Personel Devir Orani', 20.0, 'LIKELIHOOD', 1.5, true,
   'Yillik personel devir orani %20 uzerine ciktiginda olasilik puanini +1.5 arttirir'),
  ('b0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001',
   'SAP_HR', 'Egitim Tamamlanma Orani', 70.0, 'IMPACT', -1.0, true,
   'Egitim tamamlanma %70 altina dustugunde etki puanini +1.0 arttirir'),
  ('b0000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001',
   'SIEM', 'Guvenlik Olay Sayisi', 50.0, 'IMPACT', 2.0, true,
   'Aylik guvenlik olayi 50 uzerine ciktiginda etki puanini +2.0 arttirir'),
  ('b0000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001',
   'SIEM', 'Basarisiz Giris Denemesi', 100.0, 'LIKELIHOOD', 1.0, true,
   'Aylik basarisiz giris denemesi 100 uzerine ciktiginda olasilik +1.0 artar'),
  ('b0000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001',
   'CORE_BANKING', 'Islem Hata Orani', 0.5, 'IMPACT', 1.5, true,
   'Islem hata orani %0.5 uzerine ciktiginda etki puanini +1.5 arttirir'),
  ('b0000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001',
   'CORE_BANKING', 'Takipteki Kredi Orani', 5.0, 'IMPACT', 2.5, true,
   'NPL orani %5 uzerine ciktiginda etki puanini +2.5 arttirir'),
  ('b0000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000001',
   'COMPLIANCE', 'Duzenleyici Ihlal Sayisi', 3.0, 'IMPACT', 3.0, true,
   'Ceyreklik ihlal sayisi 3 uzerine ciktiginda etki puanini +3.0 arttirir'),
  ('b0000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000001',
   'AML', 'STR Bildirim Orani', 10.0, 'LIKELIHOOD', 1.5, true,
   'Aylik STR bildirim sayisi 10 uzerine ciktiginda olasilik +1.5 artar')
ON CONFLICT (id) DO NOTHING;
