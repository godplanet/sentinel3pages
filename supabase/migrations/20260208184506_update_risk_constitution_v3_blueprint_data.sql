/*
  # Update Risk Constitution v3 seed data to match Sentinel Blueprint

  1. Changes
    - Update `dimensions` to include shariah dimension (Finansal, Yasal, Itibar & Seri, Operasyonel)
    - Update `impact_matrix` with 5-to-1 descending levels matching Basel/BDDK terminology
    - Update `veto_rules` with Seri Veto and Siber Veto (CVSS 9+) kill-switches
    - Update `risk_ranges` to match BDDK color mapping (Bordo, Kizil, Turuncu, Sari, Yesil)
    - Update `version` to v3.0.0

  2. Notes
    - Uses shariah_desc column pattern in impact_matrix for dynamic rendering
    - Veto conditions: shariah_sensitivity == 5 and cvss >= 9.0 && asset == critical
    - BDDK-compliant 5-tier color scale with bordo (#800000) for critical
*/

UPDATE risk_constitution_v3
SET
  version = 'v3.0.0',
  dimensions = '[
    {"id": "financial", "label": "Finansal Etki (Basel)", "weight": 0.30},
    {"id": "legal", "label": "Yasal & Mevzuat", "weight": 0.25},
    {"id": "shariah", "label": "Itibar & Seri", "weight": 0.25},
    {"id": "operational", "label": "Operasyonel", "weight": 0.20}
  ]'::jsonb,
  impact_matrix = '[
    {
      "level": 5,
      "label": "Felaket (Catastrophic)",
      "financial_desc": "> 0.5% Ozkaynak Kaybi",
      "shariah_desc": "Haram Gelir / Batil Akil",
      "legal_desc": "Lisans Iptali Riski",
      "operational_desc": "> 3 gun kesinti"
    },
    {
      "level": 4,
      "label": "Kritik (Major)",
      "financial_desc": "0.25% - 0.5% Ozkaynak",
      "shariah_desc": "Ciddi Fetva Ihlali",
      "legal_desc": "Yuksek Para Cezasi",
      "operational_desc": "1-3 gun kesinti"
    },
    {
      "level": 3,
      "label": "Orta (Moderate)",
      "financial_desc": "0.1% - 0.25% Ozkaynak",
      "shariah_desc": "Supheli Islem",
      "legal_desc": "Uyari / Kisitlama",
      "operational_desc": "4-8 saat kesinti"
    },
    {
      "level": 2,
      "label": "Dusuk (Minor)",
      "financial_desc": "< 0.1% Ozkaynak",
      "shariah_desc": "Mekruh / Usul Hatasi",
      "legal_desc": "Kucuk Idari Ceza",
      "operational_desc": "1-4 saat kesinti"
    },
    {
      "level": 1,
      "label": "Onemsiz (Insignificant)",
      "financial_desc": "Ihmal Edilebilir",
      "shariah_desc": "Sekil Eksikligi",
      "legal_desc": "Kayit Hatasi",
      "operational_desc": "< 1 saat kesinti"
    }
  ]'::jsonb,
  veto_rules = '[
    {"id": "shariah_veto", "name": "Seri Veto (Haram Gelir)", "condition": "shariah_sensitivity == 5", "override_score": 100, "enabled": true},
    {"id": "cyber_veto", "name": "Siber Veto (CVSS 9+)", "condition": "cvss >= 9 && asset_criticality == critical", "override_score": 100, "enabled": true}
  ]'::jsonb,
  risk_ranges = '[
    {"label": "Kritik (Bordo)", "min": 90, "max": 100, "color": "#800000"},
    {"label": "Yuksek (Kizil)", "min": 70, "max": 90, "color": "#dc2626"},
    {"label": "Orta (Turuncu)", "min": 40, "max": 70, "color": "#f97316"},
    {"label": "Dusuk (Sari)", "min": 20, "max": 40, "color": "#eab308"},
    {"label": "Gozlem (Yesil)", "min": 0, "max": 20, "color": "#22c55e"}
  ]'::jsonb,
  updated_at = now()
WHERE is_active = true;
