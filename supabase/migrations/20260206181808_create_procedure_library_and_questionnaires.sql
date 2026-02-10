/*
  # Procedure Library & Questionnaires (Enterprise Smart Tools)

  1. New Tables
    - `procedure_library` (Reusable test procedure knowledge base)
      - `id` (uuid, primary key)
      - `category` (varchar) - grouping: IT General Controls, Credit, Treasury, etc.
      - `title` (text) - short procedure name
      - `description` (text) - full procedure text to add as test step
      - `tags` (text[]) - searchable tags
      - `created_at` (timestamptz)

    - `questionnaires` (Archer-style interactive questionnaires)
      - `id` (uuid, primary key)
      - `workpaper_id` (uuid, FK to workpapers)
      - `title` (text) - questionnaire name
      - `questions_json` (jsonb) - array of {question, type, answer, options}
      - `status` (varchar) - Sent, Responded, Reviewed
      - `sent_to` (text) - recipient name/department
      - `created_at` (timestamptz)
      - `responded_at` (timestamptz)

  2. Security
    - RLS enabled on both tables
    - Authenticated and anon dev-mode policies

  3. Seed Data
    - 15+ standard audit procedures across categories
*/

-- 1. Procedure Library
CREATE TABLE IF NOT EXISTS procedure_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category VARCHAR(50) NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Questionnaires
CREATE TABLE IF NOT EXISTS questionnaires (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workpaper_id UUID NOT NULL REFERENCES workpapers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  questions_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  status VARCHAR(20) CHECK (status IN ('Sent', 'Responded', 'Reviewed')) DEFAULT 'Sent',
  sent_to TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  responded_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE procedure_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE questionnaires ENABLE ROW LEVEL SECURITY;

-- RLS for procedure_library (read-only for authenticated)
CREATE POLICY "Auth users can read procedures"
  ON procedure_library FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Dev anon select procedures"
  ON procedure_library FOR SELECT TO anon USING (true);

-- RLS for questionnaires (authenticated CRUD)
CREATE POLICY "Auth users can select questionnaires"
  ON questionnaires FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM workpapers w WHERE w.id = questionnaires.workpaper_id));

CREATE POLICY "Auth users can insert questionnaires"
  ON questionnaires FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM workpapers w WHERE w.id = questionnaires.workpaper_id));

CREATE POLICY "Auth users can update questionnaires"
  ON questionnaires FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM workpapers w WHERE w.id = questionnaires.workpaper_id))
  WITH CHECK (EXISTS (SELECT 1 FROM workpapers w WHERE w.id = questionnaires.workpaper_id));

-- Dev-mode anon policies
CREATE POLICY "Dev anon select questionnaires"
  ON questionnaires FOR SELECT TO anon USING (true);

CREATE POLICY "Dev anon insert questionnaires"
  ON questionnaires FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Dev anon update questionnaires"
  ON questionnaires FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_procedure_library_category
  ON procedure_library(category);

CREATE INDEX IF NOT EXISTS idx_questionnaires_workpaper_id
  ON questionnaires(workpaper_id);

CREATE INDEX IF NOT EXISTS idx_questionnaires_status
  ON questionnaires(status);

-- Seed procedure library
INSERT INTO procedure_library (category, title, description, tags) VALUES
  ('IT Genel Kontroller', 'Sifre Karmasikligi Kontrolu', 'Sistem sifre politikalarini inceleyin: minimum 8 karakter, buyuk/kucuk harf, rakam ve ozel karakter zorunlulugu dogrulayin.', ARRAY['password', 'sifre', 'IT', 'erisim']),
  ('IT Genel Kontroller', 'Sifre Suresi Dolum Kontrolu', 'Sifre gecerlilik suresini kontrol edin: maksimum 90 gun, son 12 sifrenin tekrar kullanilamadigi dogrulayin.', ARRAY['password', 'sifre', 'expiry', 'sure']),
  ('IT Genel Kontroller', 'Erisim Yetkisi Gozden Gecirme', 'Kullanici erisim yetkilerinin periyodik olarak gozden gecirildigini, yetkisiz erisim bulunmadigini dogrulayin.', ARRAY['erisim', 'access', 'yetki', 'review']),
  ('IT Genel Kontroller', 'Yedekleme Testi', 'Gunluk/haftalik yedekleme islemlerinin basarili oldugunu, geri yukleme testlerinin yapildigini dogrulayin.', ARRAY['backup', 'yedek', 'restore', 'IT']),
  ('IT Genel Kontroller', 'Log Izleme Kontrolu', 'Sistem loglarinin duzgun tutuldugunu, anormal aktivitelerin izlendigini ve alarm mekanizmalarini test edin.', ARRAY['log', 'izleme', 'monitoring', 'alarm']),
  ('Kredi Surecleri', 'Kredi Dosyasi Tamligi', 'Kredi dosyasinda gerekli tum belgelerin (kimlik, gelir belgesi, teminat degerleme, kredi komitesi karari) mevcut oldugunu dogrulayin.', ARRAY['kredi', 'credit', 'dosya', 'belge']),
  ('Kredi Surecleri', 'Teminat Degerleme Kontrolu', 'Teminatlarin guncel degerleme raporlarina sahip oldugunu, degerleme suresinin gecerlilik siniri icinde kaldigini kontrol edin.', ARRAY['teminat', 'collateral', 'degerleme', 'valuation']),
  ('Kredi Surecleri', 'Kredi Limiti Onay Kontrolu', 'Kredi limitlerinin yetkili komite/kisi tarafindan uygun seviyede onaylandigini dogrulayin.', ARRAY['kredi', 'limit', 'onay', 'approval']),
  ('Kredi Surecleri', 'Takipteki Kredi Siniflandirmasi', 'Takipteki kredilerin BDDK duzenlemelerine uygun siniflandirildigini ve karsilik ayrildigini kontrol edin.', ARRAY['takip', 'NPL', 'karsilik', 'provision']),
  ('Hazine Islemleri', 'Islem Limiti Asim Kontrolu', 'Hazine islemlerinin belirlenen limitleri asmadigi, asim durumunda gerekli onaylarin alindigini dogrulayin.', ARRAY['hazine', 'treasury', 'limit', 'asim']),
  ('Hazine Islemleri', 'Piyasa Riski Hesaplamasi', 'VaR hesaplamalarinin dogru ve guncel verilerle yapildigini, backtesting sonuclarini dogrulayin.', ARRAY['VaR', 'piyasa', 'market', 'risk']),
  ('Uyum & KVKK', 'Kisisel Veri Envanteri Kontrolu', 'Kisisel veri envanterinin guncel oldugunu, tum veri isleme faaliyetlerinin kayit altinda tutuldugunu dogrulayin.', ARRAY['KVKK', 'GDPR', 'kisisel', 'veri', 'envanter']),
  ('Uyum & KVKK', 'Acik Riza Mekanizmasi', 'Musterilerden alinan acik rizalarin uygun formatta, zaman damgali ve geri alinabilir oldugunu kontrol edin.', ARRAY['riza', 'consent', 'KVKK', 'musteri']),
  ('Operasyonel Risk', 'Is Surekliligi Plani Testi', 'Is surekliligi planinin yillik test edildigini, test sonuclarinin raporlandigini dogrulayin.', ARRAY['BCP', 'is_surekliligi', 'continuity', 'test']),
  ('Operasyonel Risk', 'Olay Yonetimi Sureci', 'Operasyonel kayip olaylarinin zamaninda raporlandigini, kok neden analizinin yapildigini kontrol edin.', ARRAY['olay', 'incident', 'kayip', 'RCA']),
  ('Mali Kontroller', 'Mutabakat Sureci Kontrolu', 'Hesap mutabakatlarinin zamaninda ve dogru yapildigini, acik kalemlerin takip edildigini dogrulayin.', ARRAY['mutabakat', 'reconciliation', 'hesap', 'mali']);
