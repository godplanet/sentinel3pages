/*
  # Create RKM Control Library

  1. New Tables
    - `rkm_library_categories`
      - `id` (uuid, primary key)
      - `name` (varchar 100, unique) - Category name e.g. "IT General Controls"
      - `description` (text) - Category description
      - `icon` (varchar 50) - Icon identifier for UI
      - `sort_order` (integer) - Display order
      - `created_at` (timestamptz)

    - `rkm_library_risks`
      - `id` (uuid, primary key)
      - `category_id` (uuid, FK to rkm_library_categories)
      - `risk_title` (text) - Risk name
      - `control_title` (text) - Control objective name
      - `standard_test_steps` (jsonb) - Array of standard test step strings
      - `risk_level` (varchar 20) - HIGH/MEDIUM/LOW
      - `framework_ref` (varchar 100) - Framework reference (COBIT, COSO etc.)
      - `sort_order` (integer) - Display order
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add read-only policies for authenticated users (library is shared reference data)

  3. Seed Data
    - 6 realistic categories: COBIT IT Controls, Credit Processes, AML/CFT, Treasury Operations, Operational Risk, Financial Controls
    - 24 control/risk entries with realistic Turkish banking test steps
*/

-- Categories table
CREATE TABLE IF NOT EXISTS rkm_library_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT DEFAULT '',
  icon VARCHAR(50) DEFAULT 'Shield',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE rkm_library_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read library categories"
  ON rkm_library_categories
  FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- Risks/Controls table
CREATE TABLE IF NOT EXISTS rkm_library_risks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES rkm_library_categories(id) ON DELETE CASCADE,
  risk_title TEXT NOT NULL DEFAULT '',
  control_title TEXT NOT NULL DEFAULT '',
  standard_test_steps JSONB DEFAULT '[]'::jsonb,
  risk_level VARCHAR(20) DEFAULT 'MEDIUM',
  framework_ref VARCHAR(100) DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE rkm_library_risks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read library risks"
  ON rkm_library_risks
  FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- Dev-mode permissive policies for demo/testing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'rkm_library_categories' AND policyname = 'dev_read_library_categories'
  ) THEN
    CREATE POLICY "dev_read_library_categories"
      ON rkm_library_categories FOR SELECT TO anon USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'rkm_library_risks' AND policyname = 'dev_read_library_risks'
  ) THEN
    CREATE POLICY "dev_read_library_risks"
      ON rkm_library_risks FOR SELECT TO anon USING (true);
  END IF;
END $$;

-- Seed: Categories
INSERT INTO rkm_library_categories (id, name, description, icon, sort_order) VALUES
  ('a0000001-0000-0000-0000-000000000001', 'IT Genel Kontroller (COBIT)', 'Bilgi teknolojileri genel kontrolleri - Erisim yonetimi, degisiklik yonetimi, yedekleme', 'Monitor', 1),
  ('a0000001-0000-0000-0000-000000000002', 'Kredi Surecleri', 'Bireysel ve kurumsal kredi tahsis, kullandirma ve izleme kontrolleri', 'CreditCard', 2),
  ('a0000001-0000-0000-0000-000000000003', 'AML / CFT (Kara Para ile Mucadele)', 'MASAK uyumluluğu, musteri tanimi (KYC), supeli islem bildirimi', 'ShieldAlert', 3),
  ('a0000001-0000-0000-0000-000000000004', 'Hazine Islemleri', 'Doviz, menkul kiymet, turev urun islemleri kontrolleri', 'TrendingUp', 4),
  ('a0000001-0000-0000-0000-000000000005', 'Operasyonel Risk', 'Is surekliligi, felaket kurtarma, olay yonetimi kontrolleri', 'AlertTriangle', 5),
  ('a0000001-0000-0000-0000-000000000006', 'Mali Kontroller', 'Muhasebe, finansal raporlama ve ic kontrol kontrolleri', 'Calculator', 6)
ON CONFLICT (name) DO NOTHING;

-- Seed: COBIT IT Controls
INSERT INTO rkm_library_risks (category_id, risk_title, control_title, standard_test_steps, risk_level, framework_ref, sort_order) VALUES
  ('a0000001-0000-0000-0000-000000000001', 'Yetkisiz sistem erisimi', 'Sifre Politikasi Kontrolu',
   '["Aktif Dizin (AD) sifre politikasini inceleyin: min 12 karakter, buyuk/kucuk/rakam/ozel karakter zorunlulugu","Son 90 gun icerisinde sifre degistirmeyen kullanici listesini cikartin","Varsayilan admin hesaplarinin (Administrator, sa, root) kilitli olduğunu dogrulayin","Basarisiz giris denemesi kilitleme esigini test edin (5 deneme sonrasi kilit)","Servis hesaplarinin sifre rotasyon tarihlerini kontrol edin"]',
   'HIGH', 'COBIT DSS05.04', 1),

  ('a0000001-0000-0000-0000-000000000001', 'Onaysiz sistem degisiklikleri', 'Degisiklik Yonetimi (Change Management)',
   '["Son 6 aydaki tum degisiklik taleplerini (RFC) listeleyin","Her RFC icin onay zincirini dogrulayin: Talep -> Test -> Onay -> Uygulama","Acil degisikliklerin (Emergency Change) toplam icindeki oranini hesaplayin (<%5 beklenir)","Test ortaminda basarili test kaniti olmaadan production''a alinan degisiklikleri tespit edin","Rollback planlarinin dokumante edildigini kontrol edin"]',
   'HIGH', 'COBIT BAI06', 2),

  ('a0000001-0000-0000-0000-000000000001', 'Veri kaybi', 'Yedekleme ve Felaket Kurtarma',
   '["Yedekleme politikasini inceleyin: gunluk/haftalik/aylik yedekleme takvimi","Son 3 aydaki yedekleme basari/basarisizlik loglarini analiz edin","En az 1 yedekleme geri yukleme (restore) testi sonucunu dogrulayin","Yedeklerin offsite/bulut kopyasinin var olduğunu kontrol edin","RTO ve RPO hedeflerinin dokumanlarla desteklendigini dogrulayin"]',
   'HIGH', 'COBIT DSS04', 3),

  ('a0000001-0000-0000-0000-000000000001', 'Hassas verilere yetkisiz erisim', 'Veritabani Erisim Kontrolu',
   '["Veritabani admin (DBA) yetkisine sahip kullanici listesini cikartin","DBA yetkilerinin is gerekliligi ile eslesmesini dogrulayin","Veritabani denetim loglarinin (audit trail) aktif olduğunu kontrol edin","Prod veritabanina dogrudan erisim yapan kullanicilari tespit edin","Hassas tablolarda (musteri bilgileri, hesap bakiyeleri) sutun seviyesinde yetkilendirme kontrol edin"]',
   'MEDIUM', 'COBIT DSS05.03', 4),

-- Seed: Credit Processes
  ('a0000001-0000-0000-0000-000000000002', 'Yanlis kredi degerlendirme', 'Kredi Tahsis Sureci Kontrolu',
   '["Kredi komitesi onay tutanaklarini inceleyin: yetki limitleri asimini kontrol edin","Orneklem bazinda kredi dosyalarini secerek gelir belgesi dogrulamasini yapin","Kredi notlama (scoring) modelinin dogru uygulandigini 10 dosya uzerinde test edin","Teminat degerleme raporlarinin guncel ve bagimsiz oldugunu dogrulayin","Iliski kisisi kredilerinin ayri raporlandigini kontrol edin"]',
   'HIGH', 'BDDK Yonetmeligi', 1),

  ('a0000001-0000-0000-0000-000000000002', 'Donuk alacak artisi', 'Kredi Izleme ve Erken Uyari',
   '["Erken uyari sistemi (EWS) alarmlarinin zamaninda tetiklendigini kontrol edin","30/60/90 gun gecikme raporlarinin duzenliligi ve dogruluğunu dogrulayin","Yapilandirilan kredilerin izleme dosyalarini inceleyin","Kredi limiti kullanimlarinin yoğunlasma analizini yapin","Sektorel ve cografi yoğunlasma raporlarini kontrol edin"]',
   'HIGH', 'BDDK Kararlari', 2),

  ('a0000001-0000-0000-0000-000000000002', 'Teminat riski', 'Teminat Yonetimi Kontrolu',
   '["Teminat yeterliligi raporunu alin ve teminat/alacak oranini hesaplayin","Gayrimenkul teminatlarinin sigorta poliçesi gecerliliklerini kontrol edin","Teminat degerleme frekansinin mevzuata uygunluğunu dogrulayin","Rehinli menkul kiymet portfoyunun guncel degerini kontrol edin","Teminat serbest birakma islemlerinin onay surecini inceleyin"]',
   'MEDIUM', 'BDDK Teminat Tebliği', 3),

-- Seed: AML/CFT
  ('a0000001-0000-0000-0000-000000000003', 'Kara para aklama riski', 'Musteri Tanimi (KYC) Kontrolu',
   '["Yeni musteri acilis dosyalarindan orneklem secin ve kimlik dogrulamasi yapin","PEP (Siyasi Etkin Kisi) tarama kayitlarini kontrol edin","Gerçek faydalaniciinin (UBO) tespitinin yapildigini dogrulayin","Risk siniflandirmasinin (dusuk/orta/yuksek) kriterlerini inceleyin","Musteri bilgi guncelleme frekansinin mevzuata uygunluğunu kontrol edin"]',
   'HIGH', 'MASAK 5549 Sayili Kanun', 1),

  ('a0000001-0000-0000-0000-000000000003', 'Supheli islem bildirimi eksikligi', 'STR (Supeli Islem Raporlama) Kontrolu',
   '["Son 12 aydaki STR sayisini ve trendini analiz edin","STR bildirim surelerinin mevzuata uygunluğunu kontrol edin (10 is gunu)","Otomatik alarm uretilen ama STR yapilmayan vakaalari inceleyin","STR kalite kontrolu: orneklem bazinda dosya detaylarini dogrulayin","MASAK geri bildirimlerine verilen yanit surelerini kontrol edin"]',
   'HIGH', 'MASAK Genel Tebligi', 2),

  ('a0000001-0000-0000-0000-000000000003', 'Yapay parcalama (Smurfing)', 'Islem Izleme Sistemi Kontrolu',
   '["Esik alti (threshold) islem alarm kurallarini inceleyin","Ayni gun icinde ayni musteriden coklu kucuk islem (smurfing) taramasi yapin","Nakit islem raporlarinin (CTR) tam ve zamaninda olusturulduğunu dogrulayin","Kara liste/yaptirim taramalarinin gercek zamanli calistigini test edin","Falso pozitif oranini hesaplayin ve kabul edilebilir seviyelerde olduğunu dogrulayin"]',
   'HIGH', 'MASAK / FATF Tavsiyeleri', 3),

-- Seed: Treasury
  ('a0000001-0000-0000-0000-000000000004', 'Yetkisiz islem riski', 'Hazine Islem Yetkilendirme',
   '["Dealer yetki limitlerini ve islem onay hiyerarsisini inceleyin","Limit asimi raporlarini son 3 ay icin kontrol edin","Front-office / back-office gorev ayrimi uygulamasini dogrulayin","Islem dogrulama (deal confirmation) surecinin zamaninda yapildigini kontrol edin","Overnight pozisyon limitlerinin ihlal raporlarini inceleyin"]',
   'HIGH', 'BDDK Hazine Tebliği', 1),

  ('a0000001-0000-0000-0000-000000000004', 'Piyasa riski', 'Piyasa Riski Olcum Kontrolu',
   '["VaR (Value at Risk) hesaplama modelinin dogrulanma tarihini kontrol edin","Backtesting sonuclarini inceleyin: istisnai asilma sayisi","Stres testi senaryolarinin guncelligini ve yeterliligi dogrulayin","Pozisyon limiti kullanim raporlarinin gunluk uretildigini kontrol edin","Risk yonetimi komitesine yapilan raporlamalarin duzenliligini dogrulayin"]',
   'HIGH', 'BDDK Piyasa Riski Tebliği', 2),

-- Seed: Operational Risk
  ('a0000001-0000-0000-0000-000000000005', 'Is surekliligi riski', 'Is Surekliligi Plani (BCP) Kontrolu',
   '["Is surekliligi planinin yillik guncelleme tarihini kontrol edin","Son tatbikat (drill) raporlarini inceleyin: katilim orani ve basari kriterleri","Kritik is sureclerinin MIA (Maksimum Izin Verilen Kesinti Suresi) tanimlarini dogrulayin","Alternatif calisma mekaninin hazirlik durumunu kontrol edin","Iletisim agacinin (call tree) guncelligini ve test edilmis olduğunu dogrulayin"]',
   'HIGH', 'BDDK BCP Rehberi', 1),

  ('a0000001-0000-0000-0000-000000000005', 'Operasyonel kayip riski', 'Olay Yonetimi Kontrolu',
   '["Son 12 aydaki operasyonel kayip olaylarini listeleyin","Her olay icin kok neden analizinin yapildigini dogrulayin","Tekrarlayan olay tiplerine karsi alinmis onlemleri kontrol edin","Operasyonel risk olay raporlama esik degerlerini inceleyin","IC kayip veri tabaninin duzenliligi ve dogruluğunu dogrulayin"]',
   'MEDIUM', 'COSO ERM', 2),

  ('a0000001-0000-0000-0000-000000000005', 'Dis kaynak riski', 'Dis Kaynak Kullanimi (Outsourcing) Kontrolu',
   '["Kritik dis kaynak hizmet saglayicilarinin listesini cikartin","SLA izleme raporlarini ve performans metriklerini kontrol edin","Dis kaynak firmalarindaki guvenlik denetim raporlarini (SOC2/ISO 27001) inceleyin","Felaket kurtarma planinda dis kaynak bagimliliklarinin ele alindigini dogrulayin","BDDK''ya dis kaynak bildirimi yapildigini kontrol edin"]',
   'MEDIUM', 'BDDK Dis Kaynak Tebliği', 3),

-- Seed: Financial Controls
  ('a0000001-0000-0000-0000-000000000006', 'Finansal raporlama hatasi', 'Donem Sonu Kapansi Kontrolu',
   '["Aylik mutabakat (reconciliation) islemlerinin tam ve zamaninda yapildigini dogrulayin","Muallak hesaplarin yaslandirma analizini kontrol edin","Manuel gunluk kayitlarinin (journal entry) onay surecini test edin","Tahakkuk ve provizyon hesaplamalarinin dogruluğunu orneklem bazinda dogrulayin","Konsolidasyon eliminasyon kayitlarinin dogru yapildigini kontrol edin"]',
   'HIGH', 'TMS/TFRS', 1),

  ('a0000001-0000-0000-0000-000000000006', 'Masraf yonetimi riski', 'Harcama Onay Kontrolu',
   '["Harcama yetki limitlerini ve onay matrisini inceleyin","Limit asimi harcamalarin uygun onaylarla desteklendigini kontrol edin","Tedarikci secim surecinde rekabet kosullarinin saglandigini dogrulayin","Fatura-siparis-tesellum uclu eslesmesini (3-way match) orneklem bazinda test edin","Iliski kisisi tedarikci odemelerini tarayin"]',
   'MEDIUM', 'IC Kontrol Standartlari', 2),

  ('a0000001-0000-0000-0000-000000000006', 'Vergi uyumsuzlugu', 'Vergi Uyum Kontrolu',
   '["Kurumlar vergisi beyannamesi ile muhasebe kayitlari arasindaki fark analizini inceleyin","KDV iade taleplerinin mevzuata uygunluğunu dogrulayin","Transfer fiyatlandirmasi raporunun hazirlanmis olduğunu kontrol edin","Stopaj hesaplamalarinin dogruluğunu orneklem bazinda test edin","Vergi risk degerlendirmesi raporunun guncelligini dogrulayin"]',
   'MEDIUM', 'VUK / KVK', 3)
ON CONFLICT DO NOTHING;

-- Index for faster category lookups
CREATE INDEX IF NOT EXISTS idx_rkm_library_risks_category_id ON rkm_library_risks(category_id);
