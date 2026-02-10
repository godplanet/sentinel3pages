/*
  # Create compliance_regulations table

  1. New Tables
    - `compliance_regulations`
      - `id` (uuid, primary key)
      - `tenant_id` (uuid, foreign key to tenants)
      - `code` (text, NOT NULL - e.g., 'BDDK', 'MASAK', 'KVKK')
      - `title` (text, NOT NULL)
      - `category` (text, NOT NULL)
      - `article` (text, nullable - specific article/section reference)
      - `description` (text, NOT NULL)
      - `severity` (text, NOT NULL - critical/high/medium/low)
      - `framework` (text, nullable - e.g., 'GIAS2024', 'BASEL_III')
      - `is_active` (boolean, default true)
      - `metadata` (jsonb, for flexible additional data)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS
    - Add dev mode policies for unrestricted access
  
  3. Indexes
    - Index on tenant_id for multi-tenancy
    - Index on code for fast lookups
    - Index on category for filtering
*/

CREATE TABLE IF NOT EXISTS compliance_regulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('BDDK', 'TCMB', 'MASAK', 'SPK', 'KVKK', 'DIGER')),
  article TEXT,
  description TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  framework TEXT,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_compliance_regulations_tenant ON compliance_regulations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_compliance_regulations_code ON compliance_regulations(code);
CREATE INDEX IF NOT EXISTS idx_compliance_regulations_category ON compliance_regulations(category);
CREATE INDEX IF NOT EXISTS idx_compliance_regulations_severity ON compliance_regulations(severity);

ALTER TABLE compliance_regulations ENABLE ROW LEVEL SECURITY;

-- Dev mode public read policy
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'compliance_regulations' AND policyname = 'Dev mode public read'
  ) THEN
    CREATE POLICY "Dev mode public read"
      ON compliance_regulations FOR SELECT
      TO public
      USING (true);
  END IF;
END $$;

-- Dev mode public insert policy
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'compliance_regulations' AND policyname = 'Dev mode public insert'
  ) THEN
    CREATE POLICY "Dev mode public insert"
      ON compliance_regulations FOR INSERT
      TO public
      WITH CHECK (true);
  END IF;
END $$;

-- Seed standard Turkish banking regulations
INSERT INTO compliance_regulations (tenant_id, code, title, category, article, description, severity, framework)
SELECT 
  (SELECT id FROM tenants LIMIT 1),
  code,
  title,
  category::TEXT,
  article,
  description,
  severity::TEXT,
  framework
FROM (VALUES
  ('BDDK', 'Bilgi Sistemleri ve Elektronik Bankacılık Hizmetleri Hakkında Yönetmelik', 'BDDK', 'Madde 12 - Güvenlik Kontrolleri', 'Bankaların bilgi sistemlerinde güvenlik kontrollerini sağlaması, yedekleme ve kurtarma prosedürlerini uygulaması zorunludur.', 'critical', 'GIAS2024'),
  ('BDDK', 'İç Sistemler ve İç Sermaye Değerlendirme Süreci Hakkında Yönetmelik', 'BDDK', 'Madde 8 - İç Kontrol Sistemi', 'Bankalar, risk yönetimi süreçlerini destekleyen etkin bir iç kontrol sistemi kurmak zorundadır.', 'high', 'GIAS2024'),
  ('BDDK', 'Bankaların İç Denetim Fonksiyonları Hakkında Yönetmelik', 'BDDK', 'Madde 5 - Denetim Planı', 'İç denetim birimi, yıllık denetim planını risk bazlı yaklaşım ile hazırlar ve yönetim kurulunun onayına sunar.', 'high', 'GIAS2024'),
  ('TCMB', 'Ödeme ve Menkul Kıymet Mutabakat Sistemleri Hakkında Kanun', 'TCMB', 'Madde 6 - Operasyonel Risk', 'Ödeme sistemleri, operasyonel riskleri minimize edecek prosedürler ve teknolojik altyapıya sahip olmalıdır.', 'high', NULL),
  ('TCMB', 'Döviz İşlemleri Hakkında Tebliğ', 'TCMB', 'Madde 4 - Dokümantasyon', 'Döviz alım-satım işlemlerinde müşteri kimlik bilgileri ve işlem dokümantasyonu eksiksiz tutulmalıdır.', 'medium', NULL),
  ('MASAK', 'Suç Gelirlerinin Aklanmasının Önlenmesi Hakkında Kanun', 'MASAK', 'Madde 15 - Şüpheli İşlem Bildirimi', 'Yükümlüler, şüpheli işlemleri gecikmeksizin MASAK''a bildirmekle yükümlüdür.', 'critical', 'GIAS2024'),
  ('MASAK', 'Uyum Programı Rehberi', 'MASAK', 'Bölüm 3 - Müşterini Tanı (KYC)', 'Müşteri kimlik tespiti ve doğrulaması süreçleri, risk bazlı yaklaşım ile gerçekleştirilmelidir.', 'critical', 'GIAS2024'),
  ('KVKK', 'Kişisel Verilerin Korunması Kanunu', 'KVKK', 'Madde 12 - Veri Güvenliği', 'Veri sorumlusu, kişisel verilerin hukuka aykırı işlenmesini ve erişilmesini önlemek için uygun güvenlik tedbirlerini almak zorundadır.', 'critical', 'GIAS2024'),
  ('SPK', 'Sermaye Piyasası Kurulu Tebliği', 'SPK', 'Madde 7 - Bilgi Güvenliği', 'Aracı kurumlar, müşteri bilgilerinin gizliliğini ve bütünlüğünü koruyacak sistemler kurmakla yükümlüdür.', 'high', NULL),
  ('BASEL III', 'Basel III Sermaye Yeterliliği Çerçevesi', 'DIGER', 'Operasyonel Risk Yönetimi', 'Bankalar, operasyonel risk için sermaye yükümlülüğü hesaplamak ve yönetmek zorundadır.', 'high', 'BASEL_III')
) AS t(code, title, category, article, description, severity, framework)
ON CONFLICT DO NOTHING;
