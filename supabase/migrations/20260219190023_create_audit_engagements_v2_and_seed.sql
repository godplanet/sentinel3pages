/*
  # Create audit_engagements_v2 table and seed 3 demo engagements

  1. Creates audit_engagements_v2 (the parent table for agile sprints/tasks)
  2. Seeds 3 realistic Turkish banking audit engagements with sprints and tasks
*/

CREATE TABLE IF NOT EXISTS audit_engagements_v2 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '',
  description text DEFAULT '',
  service_template_id uuid,
  status text NOT NULL DEFAULT 'PLANNED'
    CHECK (status IN ('PLANNED', 'ACTIVE', 'COMPLETED')),
  total_sprints integer NOT NULL DEFAULT 1,
  start_date date,
  end_date date,
  team_members jsonb NOT NULL DEFAULT '[]'::jsonb,
  tenant_id uuid DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE audit_engagements_v2 ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='audit_engagements_v2' AND policyname='engagements_v2_dev_read') THEN
    CREATE POLICY "engagements_v2_dev_read" ON audit_engagements_v2 FOR SELECT TO anon USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='audit_engagements_v2' AND policyname='engagements_v2_select_auth') THEN
    CREATE POLICY "engagements_v2_select_auth" ON audit_engagements_v2 FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='audit_engagements_v2' AND policyname='engagements_v2_insert_auth') THEN
    CREATE POLICY "engagements_v2_insert_auth" ON audit_engagements_v2 FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='audit_engagements_v2' AND policyname='engagements_v2_update_auth') THEN
    CREATE POLICY "engagements_v2_update_auth" ON audit_engagements_v2 FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='audit_engagements_v2' AND policyname='engagements_v2_delete_auth') THEN
    CREATE POLICY "engagements_v2_delete_auth" ON audit_engagements_v2 FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);
  END IF;
END $$;

-- Enable anon read on sprints and tasks as well (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='audit_sprints' AND policyname='sprints_dev_read') THEN
    CREATE POLICY "sprints_dev_read" ON audit_sprints FOR SELECT TO anon USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='audit_tasks' AND policyname='tasks_dev_read') THEN
    CREATE POLICY "tasks_dev_read" ON audit_tasks FOR SELECT TO anon USING (true);
  END IF;
END $$;

-- ============================================================
-- SEED DATA
-- ============================================================
DO $$
DECLARE
  v_eng1 uuid; v_eng2 uuid; v_eng3 uuid;
  v_s1_1 uuid; v_s1_2 uuid; v_s1_3 uuid; v_s1_4 uuid;
  v_s2_1 uuid; v_s2_2 uuid; v_s2_3 uuid;
  v_s3_1 uuid; v_s3_2 uuid; v_s3_3 uuid;
BEGIN

-- ---- Engagement 1 ----
INSERT INTO audit_engagements_v2 (title, description, status, total_sprints, start_date, end_date, team_members) VALUES (
  'Siber Güvenlik Derin Denetimi 2026-Q1',
  'Merkez BT altyapısı, ağ güvenliği, erişim yönetimi ve veri koruma kontrollerinin kapsamlı denetimi. BDDK Madde 42 uyumluluk doğrulaması dahil.',
  'ACTIVE', 4, '2026-02-03', '2026-03-28',
  '[{"name":"Elif Kaya","role":"Baş Denetçi"},{"name":"Burak Yılmaz","role":"BT Uzmanı"},{"name":"Zeynep Arslan","role":"Denetçi"}]'::jsonb
) RETURNING id INTO v_eng1;

INSERT INTO audit_sprints (engagement_id,sprint_number,title,goal,start_date,end_date,status) VALUES (v_eng1,1,'Sprint 1: Kapsam & Planlama','Denetim kapsamını belirle, risk değerlendirmesini tamamla, iş programını oluştur','2026-02-03','2026-02-14','COMPLETED') RETURNING id INTO v_s1_1;
INSERT INTO audit_sprints (engagement_id,sprint_number,title,goal,start_date,end_date,status) VALUES (v_eng1,2,'Sprint 2: Teknik Test & Analiz','Penetrasyon testleri, güvenlik açığı taraması, erişim kontrol testleri','2026-02-17','2026-02-28','ACTIVE') RETURNING id INTO v_s1_2;
INSERT INTO audit_sprints (engagement_id,sprint_number,title,goal,start_date,end_date,status) VALUES (v_eng1,3,'Sprint 3: Müşteri Doğrulama','Bulguları müşteriye sun, yanıt ve aksiyonları topla','2026-03-03','2026-03-14','PLANNED') RETURNING id INTO v_s1_3;
INSERT INTO audit_sprints (engagement_id,sprint_number,title,goal,start_date,end_date,status) VALUES (v_eng1,4,'Sprint 4: Raporlama & Kapanış','Nihai raporu hazırla, yönetim sunumunu yap, dosyayı kapat','2026-03-17','2026-03-28','PLANNED') RETURNING id INTO v_s1_4;

INSERT INTO audit_tasks (sprint_id,engagement_id,title,description,assigned_name,status,priority,validation_status,story_points,evidence_links) VALUES
(v_s1_1,v_eng1,'Risk değerlendirme çalıştayı','BT ekibi ile risk değerlendirme çalıştayı düzenle, kritik sistemleri belirle','Elif Kaya','DONE','HIGH','VALIDATED',3,ARRAY['Calisay_Tutanak_v1.pdf','Risk_Matrisi_Final.xlsx']),
(v_s1_1,v_eng1,'Kapsam belgesi hazırla','Denetim kapsam ve sınırlarını belgele, yönetim onayı al','Zeynep Arslan','DONE','MEDIUM','VALIDATED',2,ARRAY['Kapsam_Belgesi_Onaylı.pdf']),
(v_s1_1,v_eng1,'PBC listesi oluştur','Müşteriden talep edilecek belge listesini hazırla ve gönder','Zeynep Arslan','DONE','MEDIUM','VALIDATED',2,ARRAY['PBC_Liste_v2.xlsx']),
(v_s1_2,v_eng1,'Ağ güvenlik duvarı kural analizi','Firewall kurallarını incele, gereksiz açık portları tespit et','Burak Yılmaz','DONE','CRITICAL','VALIDATED',5,ARRAY['Firewall_Analiz_Raporu.pdf']),
(v_s1_2,v_eng1,'Erişim kontrol matrisi testi','Rol bazlı erişim kontrollerini doğrula, ayrıcalıklı hesapları incele','Elif Kaya','IN_PROGRESS','HIGH','OPEN',3,ARRAY[]::text[]),
(v_s1_2,v_eng1,'Zafiyet tarama raporu','Otomatik zafiyet tarama araçlarını çalıştır ve raporla','Burak Yılmaz','CLIENT_REVIEW','HIGH','CLIENT_REVIEW',5,ARRAY['Zafiyet_Tarama_Ham.csv']),
(v_s1_2,v_eng1,'Veri sınıflandırma kontrolü','Hassas veri sınıflandırma politikalarının uygulanmasını test et','Zeynep Arslan','TODO','MEDIUM','OPEN',2,ARRAY[]::text[]),
(v_s1_3,v_eng1,'Bulgu taslak sunumu','Tespit edilen bulguları yönetime sun, itiraz sürecini başlat','Elif Kaya','TODO','HIGH','OPEN',3,ARRAY[]::text[]),
(v_s1_4,v_eng1,'Nihai rapor hazırla','Tüm bulguları ve önerileri içerecek nihai raporu yaz','Elif Kaya','TODO','CRITICAL','OPEN',5,ARRAY[]::text[]);

-- ---- Engagement 2 ----
INSERT INTO audit_engagements_v2 (title, description, status, total_sprints, start_date, end_date, team_members) VALUES (
  'Kredi Riski & BDDK Uyumluluk Denetimi 2026',
  'Kurumsal ve perakende kredi portföylerinin BDDK düzenlemeleri çerçevesinde kapsamlı denetimi. Karşılık oranları ve stres testi metodolojisi doğrulaması.',
  'ACTIVE', 3, '2026-01-15', '2026-03-07',
  '[{"name":"Ahmet Kaya","role":"Baş Denetçi"},{"name":"Selin Yıldız","role":"Risk Uzmanı"},{"name":"Murat Öztürk","role":"Denetçi"}]'::jsonb
) RETURNING id INTO v_eng2;

INSERT INTO audit_sprints (engagement_id,sprint_number,title,goal,start_date,end_date,status) VALUES (v_eng2,1,'Sprint 1: Portföy Analizi','NPL oranlarını hesapla, temerrüt modellerini incele, örneklemi belirle','2026-01-15','2026-01-31','COMPLETED') RETURNING id INTO v_s2_1;
INSERT INTO audit_sprints (engagement_id,sprint_number,title,goal,start_date,end_date,status) VALUES (v_eng2,2,'Sprint 2: Karşılık & Stres Testi','Karşılık yeterliliğini değerlendir, stres test senaryolarını doğrula','2026-02-03','2026-02-21','ACTIVE') RETURNING id INTO v_s2_2;
INSERT INTO audit_sprints (engagement_id,sprint_number,title,goal,start_date,end_date,status) VALUES (v_eng2,3,'Sprint 3: Rapor & Düzenleyici Paket','BDDK raporlama paketini hazırla, yönetim notunu yaz','2026-02-24','2026-03-07','PLANNED') RETURNING id INTO v_s2_3;

INSERT INTO audit_tasks (sprint_id,engagement_id,title,description,assigned_name,status,priority,validation_status,story_points,evidence_links) VALUES
(v_s2_1,v_eng2,'NPL portföy örneklemesi','İstatistiksel örnekleme ile 150 kredi dosyası seç','Selin Yıldız','DONE','HIGH','VALIDATED',5,ARRAY['Ornekleme_Metodoloji.xlsx','Secili_Dosyalar.csv']),
(v_s2_1,v_eng2,'Temerrüt sınıflandırma doğrulaması','Bankanın temerrüt tanımını BDDK standartlarıyla karşılaştır','Ahmet Kaya','DONE','CRITICAL','VALIDATED',3,ARRAY['BDDK_Karsilastirma_v2.pdf']),
(v_s2_1,v_eng2,'Teminat değerleme kontrolü','Teminat değerleme metodolojisini ve güncellik sıklığını doğrula','Murat Öztürk','DONE','HIGH','VALIDATED',4,ARRAY['Teminat_Degerleme_Test.xlsx']),
(v_s2_2,v_eng2,'Karşılık yeterliliği testi','Özel karşılık hesaplamalarını bağımsız olarak yeniden hesapla','Selin Yıldız','IN_PROGRESS','CRITICAL','OPEN',8,ARRAY['Karsılik_Ham_Veri.xlsx']),
(v_s2_2,v_eng2,'Stres test senaryo doğrulaması','Baz, olumsuz ve aşırı olumsuz senaryoları gözden geçir','Ahmet Kaya','IN_PROGRESS','HIGH','OPEN',5,ARRAY[]::text[]),
(v_s2_2,v_eng2,'BDDK Madde 9 uyumluluk matrisi','Kredi sınıflandırma kurallarının tam uyumluluğunu belgele','Murat Öztürk','CLIENT_REVIEW','HIGH','CLIENT_REVIEW',3,ARRAY['BDDK_Madde9_Matrix.pdf']),
(v_s2_2,v_eng2,'Büyük kredi limiti kontrolü','Tek borçlu kredi limitlerinin yasal sınırlar dahilinde olduğunu doğrula','Selin Yıldız','TODO','MEDIUM','OPEN',2,ARRAY[]::text[]),
(v_s2_3,v_eng2,'BDDK raporlama paketi','CR-1 ve CR-2 formlarını hazırla ve doğrula','Ahmet Kaya','TODO','CRITICAL','OPEN',5,ARRAY[]::text[]),
(v_s2_3,v_eng2,'Yönetim notu','Kredi riski bulgularını özetleyen yönetim notunu yaz','Selin Yıldız','TODO','HIGH','OPEN',3,ARRAY[]::text[]);

-- ---- Engagement 3 ----
INSERT INTO audit_engagements_v2 (title, description, status, total_sprints, start_date, end_date, team_members) VALUES (
  'Dijital Bankacılık & Open Banking API Denetimi',
  'Mobil bankacılık uygulaması, Open Banking API güvenliği ve PSD2 uyumluluk denetimi. Müşteri veri koruma ve OAuth 2.0 implementasyonu değerlendirmesi.',
  'PLANNED', 3, '2026-03-01', '2026-04-18',
  '[{"name":"Burak Yılmaz","role":"BT Baş Denetçisi"},{"name":"Zeynep Arslan","role":"Uyumluluk Uzmanı"}]'::jsonb
) RETURNING id INTO v_eng3;

INSERT INTO audit_sprints (engagement_id,sprint_number,title,goal,start_date,end_date,status) VALUES (v_eng3,1,'Sprint 1: API Envanteri & Risk Haritalama','Tüm public API uç noktalarını envanterle, risk skorlarını hesapla','2026-03-01','2026-03-14','PLANNED') RETURNING id INTO v_s3_1;
INSERT INTO audit_sprints (engagement_id,sprint_number,title,goal,start_date,end_date,status) VALUES (v_eng3,2,'Sprint 2: Güvenlik Testi & PSD2','OWASP API Top 10 testleri, OAuth akış doğrulaması, PSD2 SCA kontrolü','2026-03-17','2026-04-04','PLANNED') RETURNING id INTO v_s3_2;
INSERT INTO audit_sprints (engagement_id,sprint_number,title,goal,start_date,end_date,status) VALUES (v_eng3,3,'Sprint 3: Bulgu & Uyumluluk Raporu','Güvenlik bulgularını belgele, PSD2 uyumluluk matrisini tamamla','2026-04-07','2026-04-18','PLANNED') RETURNING id INTO v_s3_3;

INSERT INTO audit_tasks (sprint_id,engagement_id,title,description,assigned_name,status,priority,validation_status,story_points,evidence_links) VALUES
(v_s3_1,v_eng3,'API uç nokta envanteri','Tüm REST/GraphQL uç noktalarını belgele, versiyon kontrolünü doğrula','Burak Yılmaz','TODO','HIGH','OPEN',3,ARRAY[]::text[]),
(v_s3_1,v_eng3,'OAuth 2.0 akış incelemesi','Authorization code flow ve token yönetimini gözden geçir','Burak Yılmaz','TODO','CRITICAL','OPEN',5,ARRAY[]::text[]),
(v_s3_1,v_eng3,'KVKK veri akış haritalama','Kişisel veri işleme akışlarını belgele ve KVKK gereksinimleriyle karşılaştır','Zeynep Arslan','TODO','HIGH','OPEN',4,ARRAY[]::text[]),
(v_s3_2,v_eng3,'OWASP API Top 10 testi','Tüm kritik OWASP API güvenlik açıklarını test et','Burak Yılmaz','TODO','CRITICAL','OPEN',8,ARRAY[]::text[]),
(v_s3_2,v_eng3,'PSD2 SCA doğrulaması','Güçlü müşteri kimlik doğrulama mekanizmalarını doğrula','Zeynep Arslan','TODO','HIGH','OPEN',5,ARRAY[]::text[]),
(v_s3_2,v_eng3,'Rate limiting ve DDoS koruması','API hız sınırlama ve kötüye kullanım önleme kontrollerini test et','Burak Yılmaz','TODO','MEDIUM','OPEN',3,ARRAY[]::text[]),
(v_s3_3,v_eng3,'PSD2 uyumluluk matrisi','EBA kılavuzları karşısında uyumluluk durumunu belgele','Zeynep Arslan','TODO','HIGH','OPEN',4,ARRAY[]::text[]),
(v_s3_3,v_eng3,'Güvenlik bulgu raporu','Tüm API güvenlik bulgularını önem sırasına göre raporla','Burak Yılmaz','TODO','CRITICAL','OPEN',5,ARRAY[]::text[]);

END $$;
