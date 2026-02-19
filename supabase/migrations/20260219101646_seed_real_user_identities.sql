/*
  # Seed Real User Identities

  ## Purpose
  Upserts all Sentinel demo personas into `user_profiles` so the header, sidebar
  persona-switcher, and Talent OS all read from a consistent source.

  Default active user: Hilmi Duru — Baş Denetçi (cae role).

  ## Users
  | Name            | Role      | Title                      |
  |-----------------|-----------|----------------------------|
  | Hilmi Duru      | cae       | Baş Denetçi                |
  | Hakan Yılmaz    | cae       | Teftiş Kurulu Başkanı      |
  | Ahmet Demir     | auditor   | Kıdemli Müfettiş           |
  | Zeynep Aydın    | executive | Genel Müdür Yardımcısı     |
  | Mehmet Kaya     | auditee   | Şube Müdürü                |
  | Vendor Co.      | vendor    | Tedarikçi Temsilcisi       |
*/

DO $$
DECLARE
  v_tenant uuid := '11111111-1111-1111-1111-111111111111';
BEGIN
  INSERT INTO user_profiles (id, tenant_id, email, full_name, role, title, department)
  VALUES
    ('a0000000-0000-0000-0000-000000000010'::uuid, v_tenant,
     'hilmi.duru@sentinelbank.com.tr', 'Hilmi Duru',
     'cae', 'Baş Denetçi', 'İç Denetim'),

    ('a0000000-0000-0000-0000-000000000001'::uuid, v_tenant,
     'hakan.yilmaz@sentinelbank.com.tr', 'Hakan Yılmaz',
     'cae', 'Teftiş Kurulu Başkanı', 'İç Denetim'),

    ('a0000000-0000-0000-0000-000000000002'::uuid, v_tenant,
     'ahmet.demir@sentinelbank.com.tr', 'Ahmet Demir',
     'auditor', 'Kıdemli Müfettiş', 'İç Denetim'),

    ('a0000000-0000-0000-0000-000000000003'::uuid, v_tenant,
     'zeynep.aydin@sentinelbank.com.tr', 'Zeynep Aydın',
     'executive', 'Genel Müdür Yardımcısı', 'Genel Müdürlük'),

    ('a0000000-0000-0000-0000-000000000004'::uuid, v_tenant,
     'mehmet.kaya@sentinelbank.com.tr', 'Mehmet Kaya',
     'auditee', 'Şube Müdürü', 'Perakende Bankacılık'),

    ('a0000000-0000-0000-0000-000000000005'::uuid, v_tenant,
     'vendor@partnerfirm.com', 'Vendor Co.',
     'vendor', 'Tedarikçi Temsilcisi', 'Dış Kaynak')

  ON CONFLICT (id) DO UPDATE
    SET full_name  = EXCLUDED.full_name,
        title      = EXCLUDED.title,
        role       = EXCLUDED.role,
        email      = EXCLUDED.email,
        department = EXCLUDED.department,
        updated_at = now();
END $$;
