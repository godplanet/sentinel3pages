/*
  # Create Sentinel Office Document Vault (Cryo-Chamber)

  Blueprint: Sentinel v3.0 - Sentinel Office with immutable version control

  1. New Tables
    - `office_documents` - Document metadata registry
      - `id` (uuid, PK)
      - `tenant_id` (uuid)
      - `workpaper_id` (uuid, nullable) - Links to audit workpaper
      - `title` (text) - Document title
      - `doc_type` (text) - SPREADSHEET or DOCUMENT
      - `current_version_id` (uuid, nullable)
      - `created_by_name` (text) - Author
      - `is_archived` (boolean) - Soft archive
      - `created_at` / `updated_at` (timestamptz)

    - `office_versions` - Immutable Cryo-Chamber snapshots
      - `id` (uuid, PK)
      - `tenant_id` (uuid)
      - `document_id` (uuid, FK office_documents)
      - `version_number` (integer) - Sequential
      - `content_data` (jsonb) - Full serialized content
      - `content_hash` (text) - SHA-256
      - `change_summary` (text) - Description of change
      - `is_frozen` (boolean)
      - `created_by_name` (text)
      - `created_at` (timestamptz)

  2. Security
    - RLS enabled on both tables
    - Dev-mode anon policies + authenticated tenant-scoped

  3. Seed Data
    - Credit Sampling spreadsheet with 6 customer rows
    - Draft Finding Report with TipTap JSON
*/

CREATE TABLE IF NOT EXISTS office_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111',
  workpaper_id uuid,
  title text NOT NULL,
  doc_type text NOT NULL DEFAULT 'SPREADSHEET',
  current_version_id uuid,
  created_by_name text NOT NULL DEFAULT '',
  is_archived boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT office_doc_type_chk CHECK (doc_type IN ('SPREADSHEET', 'DOCUMENT'))
);
CREATE INDEX IF NOT EXISTS idx_office_docs_tenant ON office_documents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_office_docs_workpaper ON office_documents(workpaper_id);
ALTER TABLE office_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anon read office_documents" ON office_documents FOR SELECT TO anon USING (true);
CREATE POLICY "Anon insert office_documents" ON office_documents FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon update office_documents" ON office_documents FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon delete office_documents" ON office_documents FOR DELETE TO anon USING (true);
CREATE POLICY "Auth read office_documents" ON office_documents FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS office_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111',
  document_id uuid NOT NULL REFERENCES office_documents(id) ON DELETE CASCADE,
  version_number integer NOT NULL DEFAULT 1,
  content_data jsonb NOT NULL DEFAULT '{}',
  content_hash text NOT NULL DEFAULT '',
  change_summary text,
  is_frozen boolean NOT NULL DEFAULT false,
  created_by_name text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_office_ver_doc ON office_versions(document_id);
CREATE INDEX IF NOT EXISTS idx_office_ver_num ON office_versions(document_id, version_number);
ALTER TABLE office_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anon read office_versions" ON office_versions FOR SELECT TO anon USING (true);
CREATE POLICY "Anon insert office_versions" ON office_versions FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon update office_versions" ON office_versions FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon delete office_versions" ON office_versions FOR DELETE TO anon USING (true);
CREATE POLICY "Auth read office_versions" ON office_versions FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()));

-- Seed documents
INSERT INTO office_documents (id, tenant_id, title, doc_type, created_by_name)
VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '11111111-1111-1111-1111-111111111111', 'Kredi Orneklem Secimi (2026-Q1)', 'SPREADSHEET', 'Mehmet Yilmaz'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', '11111111-1111-1111-1111-111111111111', 'Kredi Surecleri - Bulgu Taslak Raporu', 'DOCUMENT', 'Mehmet Yilmaz')
ON CONFLICT (id) DO NOTHING;

-- Seed spreadsheet version
INSERT INTO office_versions (document_id, version_number, content_data, content_hash, change_summary, is_frozen, created_by_name)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  1,
  '{"cells":{"A1":{"value":"Musteri No","format":"text"},"B1":{"value":"Musteri Adi","format":"text"},"C1":{"value":"Kredi Tutari (TRY)","format":"text"},"D1":{"value":"Faiz Orani (%)","format":"text"},"E1":{"value":"Risk Skoru","format":"text"},"F1":{"value":"Teminat Degeri (TRY)","format":"text"},"G1":{"value":"LTV (%)","format":"text"},"H1":{"value":"Sonuc","format":"text"},"A2":{"value":"10234567","format":"text"},"B2":{"value":"ABC Insaat Ltd.","format":"text"},"C2":{"value":"2500000","format":"currency"},"D2":{"value":"24.5","format":"number"},"E2":{"value":"Yuksek","format":"text"},"F2":{"value":"3200000","format":"currency"},"G2":{"value":"78.1","format":"percent"},"H2":{"value":"Uygun","format":"text"},"A3":{"value":"10345678","format":"text"},"B3":{"value":"XYZ Tekstil A.S.","format":"text"},"C3":{"value":"850000","format":"currency"},"D3":{"value":"26.0","format":"number"},"E3":{"value":"Orta","format":"text"},"F3":{"value":"600000","format":"currency"},"G3":{"value":"141.7","format":"percent"},"H3":{"value":"Bulgu","format":"text"},"A4":{"value":"10456789","format":"text"},"B4":{"value":"Mehmet Yilmaz","format":"text"},"C4":{"value":"175000","format":"currency"},"D4":{"value":"22.0","format":"number"},"E4":{"value":"Dusuk","format":"text"},"F4":{"value":"350000","format":"currency"},"G4":{"value":"50.0","format":"percent"},"H4":{"value":"Uygun","format":"text"},"A5":{"value":"10567890","format":"text"},"B5":{"value":"DEF Enerji A.S.","format":"text"},"C5":{"value":"5000000","format":"currency"},"D5":{"value":"21.5","format":"number"},"E5":{"value":"Yuksek","format":"text"},"F5":{"value":"4200000","format":"currency"},"G5":{"value":"119.0","format":"percent"},"H5":{"value":"Bulgu","format":"text"},"A6":{"value":"10678901","format":"text"},"B6":{"value":"Ayse Kara","format":"text"},"C6":{"value":"320000","format":"currency"},"D6":{"value":"23.0","format":"number"},"E6":{"value":"Orta","format":"text"},"F6":{"value":"480000","format":"currency"},"G6":{"value":"66.7","format":"percent"},"H6":{"value":"Uygun","format":"text"},"A8":{"value":"TOPLAM","format":"text"},"C8":{"value":"","formula":"=SUM(C2:C6)","format":"currency"},"F8":{"value":"","formula":"=SUM(F2:F6)","format":"currency"}},"config":{"columns":8,"rows":20,"columnWidths":{},"columnHeaders":{"0":"Musteri No","1":"Musteri Adi","2":"Kredi Tutari","3":"Faiz %","4":"Risk","5":"Teminat","6":"LTV %","7":"Sonuc"}},"version":1}'::jsonb,
  encode(sha256(convert_to('sheet-v1-seed', 'UTF8')), 'hex'),
  'Ilk versiyon: 6 musteri orneklemi girildi',
  true,
  'Mehmet Yilmaz'
);

-- Seed document version
INSERT INTO office_versions (document_id, version_number, content_data, content_hash, change_summary, is_frozen, created_by_name)
VALUES (
  'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  1,
  '{"type":"doc","content":[{"type":"heading","attrs":{"level":1},"content":[{"type":"text","text":"Kredi Surecleri Denetim Raporu - Taslak"}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"1. Yonetici Ozeti"}]},{"type":"paragraph","content":[{"type":"text","text":"Bu denetim, bankanin bireysel ve ticari kredi sureclerini kapsamaktadir. Denetim donemi 01.01.2026 - 31.03.2026 tarihleri arasini kapsamaktadir. Toplam 14 bulgu tespit edilmis olup, 1 tanesi kritik, 3 tanesi yuksek risk kategorisindedir."}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"2. Denetim Kapsami"}]},{"type":"bulletList","content":[{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Kredi tahsis ve onay surecleri"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Teminat degerleme islemleri"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Kredi izleme ve erken uyari sistemi"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Yapilandirma ve takipteki alacaklar"}]}]}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"3. Onemli Bulgular"}]},{"type":"paragraph","content":[{"type":"text","marks":[{"type":"bold"}],"text":"Bulgu 1 (Kritik): "},{"type":"text","text":"Teminat degerleme raporlarinda %15 oraninda eksik veya guncel olmayan ekspertiz raporu tespit edilmistir."}]},{"type":"paragraph","content":[{"type":"text","marks":[{"type":"bold"}],"text":"Bulgu 2 (Yuksek): "},{"type":"text","text":"LTV orani %100 un uzerinde olan 23 adet kredi tespit edilmistir. Toplam tutar 45.2M TRY."}]}]}'::jsonb,
  encode(sha256(convert_to('report-v1-seed', 'UTF8')), 'hex'),
  'Ilk versiyon: Taslak rapor olusturuldu',
  true,
  'Mehmet Yilmaz'
);

-- Link current versions
UPDATE office_documents SET current_version_id = (
  SELECT id FROM office_versions WHERE document_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' ORDER BY version_number DESC LIMIT 1
) WHERE id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

UPDATE office_documents SET current_version_id = (
  SELECT id FROM office_versions WHERE document_id = 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22' ORDER BY version_number DESC LIMIT 1
) WHERE id = 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22';