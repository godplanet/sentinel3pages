/*
  # E2E Tohumlama İçin Geçici RLS İptali

  Açıklama:
  Turkey Bank E2E seed işleminin Supabase anon key üzerinden çalışabilmesi için
  ilgili tablolardaki Row Level Security geçici olarak devre dışı bırakılıyor.
  Seed tamamlandıktan sonra RLS yeniden aktif edilmelidir.

  Etkilenen Tablolar:
  - user_profiles
  - audit_entities
  - audit_plans
  - audit_engagements
  - audit_steps
  - workpapers
  - audit_findings
  - actions
  - action_plans
  - risk_library
  - compliance_regulations
*/

ALTER TABLE IF EXISTS user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS audit_entities DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS audit_plans DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS audit_engagements DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS audit_steps DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS workpapers DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS audit_findings DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS actions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS action_plans DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS risk_library DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS compliance_regulations DISABLE ROW LEVEL SECURITY;
