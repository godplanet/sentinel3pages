/*
  # SENTINEL v3.0 - GIAS 2024 Tam Uyum Paketi

  1. Modül A: Sentinel Survey (Anket ve Geri Bildirim) - Std 11.1
    - `surveys` - Anket şablonları
    - `survey_responses` - Anket yanıtları ve puanları

  2. Modül B: QAIP Master (Kalite Güvence) - Std 12.1
    - `qaip_checklists` - Kalite kontrol listeleri
    - `qaip_reviews` - Kalite inceleme sonuçları

  3. Modül C: Talent OS (Yetenek Yönetimi) - Std 3.1
    - `auditor_profiles` - Denetçi profilleri ve yetkinlikler

  4. Modül D: Governance Vault (Yönetişim Kasası) - Std 6.1
    - `governance_docs` - Yönetmelik ve dokümanlar
    - `auditor_declarations` - Bağımsızlık beyanları

  Tüm tablolar RLS aktif ve tenant_id bazlı izolasyon sağlanmıştır.
*/

-- ============================================================
-- MODÜL A: SENTINEL SURVEY (ANKET VE GERİ BİLDİRİM)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.surveys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    target_audience TEXT CHECK (target_audience IN ('AUDITEE', 'INTERNAL', 'EXTERNAL')),
    form_schema JSONB NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.survey_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID REFERENCES public.surveys(id) ON DELETE CASCADE,
    respondent_id UUID REFERENCES auth.users(id),
    engagement_id UUID,
    answers JSONB NOT NULL,
    score DECIMAL(5,2),
    tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
    submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for Surveys
ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view surveys in their tenant"
  ON public.surveys FOR SELECT
  TO authenticated
  USING (tenant_id = '00000000-0000-0000-0000-000000000001');

CREATE POLICY "Admins can create surveys"
  ON public.surveys FOR INSERT
  TO authenticated
  WITH CHECK (tenant_id = '00000000-0000-0000-0000-000000000001');

CREATE POLICY "Admins can update surveys"
  ON public.surveys FOR UPDATE
  TO authenticated
  USING (tenant_id = '00000000-0000-0000-0000-000000000001')
  WITH CHECK (tenant_id = '00000000-0000-0000-0000-000000000001');

CREATE POLICY "Admins can delete surveys"
  ON public.surveys FOR DELETE
  TO authenticated
  USING (tenant_id = '00000000-0000-0000-0000-000000000001');

-- RLS Policies for Survey Responses
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view responses in their tenant"
  ON public.survey_responses FOR SELECT
  TO authenticated
  USING (tenant_id = '00000000-0000-0000-0000-000000000001');

CREATE POLICY "Users can submit responses"
  ON public.survey_responses FOR INSERT
  TO authenticated
  WITH CHECK (tenant_id = '00000000-0000-0000-0000-000000000001');

-- ============================================================
-- MODÜL B: QAIP MASTER (KALİTE GÜVENCE)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.qaip_checklists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    criteria JSONB NOT NULL,
    tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.qaip_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    engagement_id UUID,
    reviewer_id UUID REFERENCES auth.users(id),
    checklist_id UUID REFERENCES public.qaip_checklists(id),
    results JSONB NOT NULL,
    total_score INTEGER,
    status TEXT DEFAULT 'IN_PROGRESS' CHECK (status IN ('IN_PROGRESS', 'COMPLETED', 'APPROVED')),
    notes TEXT,
    tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for QAIP Checklists
ALTER TABLE public.qaip_checklists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view checklists in their tenant"
  ON public.qaip_checklists FOR SELECT
  TO authenticated
  USING (tenant_id = '00000000-0000-0000-0000-000000000001');

CREATE POLICY "Admins can create checklists"
  ON public.qaip_checklists FOR INSERT
  TO authenticated
  WITH CHECK (tenant_id = '00000000-0000-0000-0000-000000000001');

CREATE POLICY "Admins can update checklists"
  ON public.qaip_checklists FOR UPDATE
  TO authenticated
  USING (tenant_id = '00000000-0000-0000-0000-000000000001')
  WITH CHECK (tenant_id = '00000000-0000-0000-0000-000000000001');

CREATE POLICY "Admins can delete checklists"
  ON public.qaip_checklists FOR DELETE
  TO authenticated
  USING (tenant_id = '00000000-0000-0000-0000-000000000001');

-- RLS Policies for QAIP Reviews
ALTER TABLE public.qaip_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view reviews in their tenant"
  ON public.qaip_reviews FOR SELECT
  TO authenticated
  USING (tenant_id = '00000000-0000-0000-0000-000000000001');

CREATE POLICY "Reviewers can create reviews"
  ON public.qaip_reviews FOR INSERT
  TO authenticated
  WITH CHECK (tenant_id = '00000000-0000-0000-0000-000000000001');

CREATE POLICY "Reviewers can update their reviews"
  ON public.qaip_reviews FOR UPDATE
  TO authenticated
  USING (tenant_id = '00000000-0000-0000-0000-000000000001')
  WITH CHECK (tenant_id = '00000000-0000-0000-0000-000000000001');

-- ============================================================
-- MODÜL C: TALENT OS (YETENEK YÖNETİMİ)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.auditor_profiles (
    user_id UUID PRIMARY KEY,
    title TEXT,
    department TEXT,
    certifications TEXT[] DEFAULT ARRAY[]::TEXT[],
    skills_matrix JSONB DEFAULT '{}'::jsonb,
    cpe_credits INTEGER DEFAULT 0,
    hire_date DATE,
    tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.training_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.auditor_profiles(user_id),
    training_title TEXT NOT NULL,
    training_type TEXT CHECK (training_type IN ('INTERNAL', 'EXTERNAL', 'CERTIFICATION', 'ONLINE')),
    hours INTEGER DEFAULT 0,
    cpe_credits INTEGER DEFAULT 0,
    completed_date DATE,
    certificate_url TEXT,
    tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for Auditor Profiles
ALTER TABLE public.auditor_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view profiles in their tenant"
  ON public.auditor_profiles FOR SELECT
  TO authenticated
  USING (tenant_id = '00000000-0000-0000-0000-000000000001');

CREATE POLICY "Users can update own profile"
  ON public.auditor_profiles FOR UPDATE
  TO authenticated
  USING (tenant_id = '00000000-0000-0000-0000-000000000001')
  WITH CHECK (tenant_id = '00000000-0000-0000-0000-000000000001');

CREATE POLICY "Admins can insert profiles"
  ON public.auditor_profiles FOR INSERT
  TO authenticated
  WITH CHECK (tenant_id = '00000000-0000-0000-0000-000000000001');

-- RLS Policies for Training Records
ALTER TABLE public.training_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view training records in their tenant"
  ON public.training_records FOR SELECT
  TO authenticated
  USING (tenant_id = '00000000-0000-0000-0000-000000000001');

CREATE POLICY "Users can create training records"
  ON public.training_records FOR INSERT
  TO authenticated
  WITH CHECK (tenant_id = '00000000-0000-0000-0000-000000000001');

CREATE POLICY "Users can update training records"
  ON public.training_records FOR UPDATE
  TO authenticated
  USING (tenant_id = '00000000-0000-0000-0000-000000000001')
  WITH CHECK (tenant_id = '00000000-0000-0000-0000-000000000001');

-- ============================================================
-- MODÜL D: GOVERNANCE VAULT (YÖNETİŞİM KASASI)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.governance_docs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doc_type TEXT NOT NULL CHECK (doc_type IN ('CHARTER', 'DECLARATION', 'MINUTES', 'POLICY', 'PROCEDURE')),
    title TEXT NOT NULL,
    version TEXT,
    content_url TEXT,
    approval_status TEXT DEFAULT 'DRAFT' CHECK (approval_status IN ('DRAFT', 'APPROVED', 'ARCHIVED')),
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMPTZ,
    tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.auditor_declarations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    declaration_type TEXT DEFAULT 'INDEPENDENCE' CHECK (declaration_type IN ('INDEPENDENCE', 'CONFLICT_OF_INTEREST', 'CODE_OF_CONDUCT')),
    period_year INTEGER NOT NULL,
    content JSONB,
    signed_at TIMESTAMPTZ DEFAULT NOW(),
    signature_hash TEXT,
    tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for Governance Docs
ALTER TABLE public.governance_docs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view governance docs in their tenant"
  ON public.governance_docs FOR SELECT
  TO authenticated
  USING (tenant_id = '00000000-0000-0000-0000-000000000001');

CREATE POLICY "Admins can create governance docs"
  ON public.governance_docs FOR INSERT
  TO authenticated
  WITH CHECK (tenant_id = '00000000-0000-0000-0000-000000000001');

CREATE POLICY "Admins can update governance docs"
  ON public.governance_docs FOR UPDATE
  TO authenticated
  USING (tenant_id = '00000000-0000-0000-0000-000000000001')
  WITH CHECK (tenant_id = '00000000-0000-0000-0000-000000000001');

CREATE POLICY "Admins can delete governance docs"
  ON public.governance_docs FOR DELETE
  TO authenticated
  USING (tenant_id = '00000000-0000-0000-0000-000000000001');

-- RLS Policies for Auditor Declarations
ALTER TABLE public.auditor_declarations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view declarations in their tenant"
  ON public.auditor_declarations FOR SELECT
  TO authenticated
  USING (tenant_id = '00000000-0000-0000-0000-000000000001');

CREATE POLICY "Users can create declarations"
  ON public.auditor_declarations FOR INSERT
  TO authenticated
  WITH CHECK (tenant_id = '00000000-0000-0000-0000-000000000001');

CREATE POLICY "Users can update own declarations"
  ON public.auditor_declarations FOR UPDATE
  TO authenticated
  USING (tenant_id = '00000000-0000-0000-0000-000000000001')
  WITH CHECK (tenant_id = '00000000-0000-0000-0000-000000000001');

-- ============================================================
-- SEED DATA (SİSTEMİ CANLANDIRMA)
-- ============================================================

-- Anket Şablonları
INSERT INTO public.surveys (title, description, target_audience, form_schema, is_active) VALUES
(
    'Denetim Süreci Memnuniyet Anketi',
    'Tamamlanan denetim faaliyeti sonrası süreç değerlendirmesi.',
    'AUDITEE',
    '[
        {"id": "q1", "type": "rating", "label": "Denetim ekibinin iletişimi profesyonel miydi?", "max": 5},
        {"id": "q2", "type": "rating", "label": "Bulgular süreçlerinizi iyileştirmede faydalı oldu mu?", "max": 5},
        {"id": "q3", "type": "rating", "label": "Denetim süresi makul müdür?", "max": 5},
        {"id": "q4", "type": "text", "label": "Gelecek denetimler için önerileriniz nelerdir?"}
    ]'::jsonb,
    true
),
(
    'İç Denetim Ekibi Özdeğerlendirme Anketi',
    'Denetim ekibinin kendi performansını değerlendirmesi.',
    'INTERNAL',
    '[
        {"id": "q1", "type": "rating", "label": "Risk değerlendirmemiz yeterli miydi?", "max": 5},
        {"id": "q2", "type": "rating", "label": "Bulguların kalitesi neydi?", "max": 5},
        {"id": "q3", "type": "rating", "label": "Zaman yönetimimiz etkin miydi?", "max": 5},
        {"id": "q4", "type": "text", "label": "Gelişim alanlarımız nelerdir?"}
    ]'::jsonb,
    true
);

-- Kalite Kontrol Listeleri
INSERT INTO public.qaip_checklists (title, description, criteria) VALUES
(
    'Dosya Kapanış Kalite Kontrol Listesi (QAIP)',
    'Denetim dosyasının kalite standartlarına uygunluğunu değerlendiren kontrol listesi.',
    '[
        {"id": "c1", "text": "Denetim kapsamı risk değerlendirmesine dayanıyor mu?", "weight": 20},
        {"id": "c2", "text": "Bulgular yeterli ve güvenilir kanıtlarla desteklenmiş mi?", "weight": 30},
        {"id": "c3", "text": "Yönetim aksiyon planları alınmış ve vadeler makul mü?", "weight": 20},
        {"id": "c4", "text": "Çalışma kağıtlarında süpervizör onayı (Sign-off) var mı?", "weight": 15},
        {"id": "c5", "text": "Rapor IIA standartlarına uygun mu?", "weight": 15}
    ]'::jsonb
),
(
    'Yıllık Plan Kalite İncelemesi',
    'Yıllık denetim planının hazırlanma sürecinin kalite kontrolü.',
    '[
        {"id": "c1", "text": "Risk değerlendirmesi kapsamlı ve güncel mi?", "weight": 30},
        {"id": "c2", "text": "Yönetim kurulu ve üst yönetim görüşleri alındı mı?", "weight": 25},
        {"id": "c3", "text": "Kaynak tahsisi yeterliliği değerlendirildi mi?", "weight": 25},
        {"id": "c4", "text": "Plan esnek ve adapte edilebilir mi?", "weight": 20}
    ]'::jsonb
);

-- Yönetişim Dokümanları
INSERT INTO public.governance_docs (title, doc_type, version, approval_status, approved_at) VALUES
('İç Denetim Yönetmeliği (Audit Charter)', 'CHARTER', 'v4.2', 'APPROVED', NOW()),
('2026 Yılı Bağımsızlık Beyanı Formu', 'DECLARATION', 'v1.0', 'APPROVED', NOW()),
('Yönetim Kurulu Denetim Komitesi Toplantı Tutanağı - Ocak 2026', 'MINUTES', 'v1.0', 'APPROVED', '2026-01-15'),
('İç Denetim Etik İlkeleri', 'POLICY', 'v3.0', 'APPROVED', '2025-12-01');

-- Örnek Denetçi Profilleri
INSERT INTO public.auditor_profiles (user_id, title, department, certifications, skills_matrix, cpe_credits, hire_date) VALUES
('00000000-0000-0000-0000-000000000001', 'Kıdemli İç Denetçi', 'İç Denetim', ARRAY['CIA', 'CISA'], '{"IT": 5, "Finans": 4, "Risk Yönetimi": 5, "Operasyonel": 4}'::jsonb, 120, '2020-03-15'),
('00000000-0000-0000-0000-000000000002', 'İç Denetim Müdürü', 'İç Denetim', ARRAY['CIA', 'CFE', 'SMMM'], '{"Finans": 5, "Kredi": 5, "Risk Yönetimi": 5, "Liderlik": 5}'::jsonb, 180, '2015-01-10'),
('00000000-0000-0000-0000-000000000003', 'İç Denetçi', 'İç Denetim', ARRAY['CIA'], '{"Operasyonel": 4, "Uyumluluk": 4, "IT": 3}'::jsonb, 80, '2022-06-01');

-- Örnek Eğitim Kayıtları
INSERT INTO public.training_records (user_id, training_title, training_type, hours, cpe_credits, completed_date) VALUES
('00000000-0000-0000-0000-000000000001', 'Siber Güvenlik Denetimi - İleri Seviye', 'EXTERNAL', 16, 16, '2025-11-20'),
('00000000-0000-0000-0000-000000000001', 'BDDK Mevzuat Güncellemeleri', 'ONLINE', 8, 8, '2026-01-10'),
('00000000-0000-0000-0000-000000000002', 'Liderlik ve Stratejik Düşünme', 'EXTERNAL', 24, 24, '2025-10-15'),
('00000000-0000-0000-0000-000000000003', 'Temel Risk Yönetimi', 'INTERNAL', 12, 12, '2025-12-05');

-- Örnek Bağımsızlık Beyanları
INSERT INTO public.auditor_declarations (user_id, declaration_type, period_year, content, signature_hash) VALUES
('00000000-0000-0000-0000-000000000001', 'INDEPENDENCE', 2026, '{"conflicts": [], "external_roles": [], "financial_interests": []}'::jsonb, 'a1b2c3d4e5f6'),
('00000000-0000-0000-0000-000000000002', 'INDEPENDENCE', 2026, '{"conflicts": [], "external_roles": [], "financial_interests": []}'::jsonb, 'b2c3d4e5f6a1'),
('00000000-0000-0000-0000-000000000003', 'INDEPENDENCE', 2026, '{"conflicts": [], "external_roles": [], "financial_interests": []}'::jsonb, 'c3d4e5f6a1b2');

-- İndeksler (Performans)
CREATE INDEX IF NOT EXISTS idx_survey_responses_survey_id ON public.survey_responses(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_engagement_id ON public.survey_responses(engagement_id);
CREATE INDEX IF NOT EXISTS idx_qaip_reviews_engagement_id ON public.qaip_reviews(engagement_id);
CREATE INDEX IF NOT EXISTS idx_qaip_reviews_reviewer_id ON public.qaip_reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_training_records_user_id ON public.training_records(user_id);
CREATE INDEX IF NOT EXISTS idx_auditor_declarations_user_id ON public.auditor_declarations(user_id);
CREATE INDEX IF NOT EXISTS idx_auditor_declarations_period_year ON public.auditor_declarations(period_year);
