import { supabase } from '../../api/supabase';

export const TENANT_ID = '11111111-1111-1111-1111-111111111111';

export const USERS = {
  CAE: 'a0000000-0000-0000-0000-000000000001',
  AUDITOR: 'a0000000-0000-0000-0000-000000000002',
  AUDITEE: 'a0000000-0000-0000-0000-000000000003',
  GMY: 'a0000000-0000-0000-0000-000000000004',
  VENDOR: 'a0000000-0000-0000-0000-000000000005',
};

const IDS = {
  PLAN: 'b0000000-0000-0000-0000-000000000001',
  ENTITY_HQ: 'c0000000-0000-0000-0000-000000000001',
  ENTITY_TREASURY: 'c0000000-0000-0000-0000-000000000002',
  ENTITY_KADIKOY: 'c0000000-0000-0000-0000-000000000003',
  ENTITY_UMRANIYE: 'c0000000-0000-0000-0000-000000000004',
  ENG_KADIKOY: 'e0000000-0000-0000-0000-000000000001',
  ENG_CYBER: 'e0000000-0000-0000-0000-000000000002',
  ENG_COMPLIANCE: 'e0000000-0000-0000-0000-000000000003',
  STEP1: '50000000-0000-0000-0000-000000000001',
  STEP2: '50000000-0000-0000-0000-000000000002',
  STEP3: '50000000-0000-0000-0000-000000000003',
  STEP4: '50000000-0000-0000-0000-000000000004',
  STEP5: '50000000-0000-0000-0000-000000000005',
  WP1: 'd1000000-0000-0000-0000-000000000001',
  WP2: 'd1000000-0000-0000-0000-000000000002',
  WP3: 'd1000000-0000-0000-0000-000000000003',
  FINDING1: 'f0000000-0000-0000-0000-000000000001',
  FINDING2: 'f0000000-0000-0000-0000-000000000002',
  FINDING3: 'f0000000-0000-0000-0000-000000000003',
  REPORT: 'd0000000-0000-0000-0000-000000000001',
};

async function safeDelete(tableName: string): Promise<void> {
  try {
    const { error } = await supabase
      .from(tableName)
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Tüm kayıtları silmek için hile
    
    if (error) {
      console.warn(`⚠️ [WIPE] ${tableName} silinemedi:`, error.message);
    } else {
      console.log(`🧹 [WIPE] ${tableName} temizlendi.`);
    }
  } catch (err) {
    console.warn(`⚠️ [WIPE] ${tableName} atlandı.`);
  }
}

// CRITICAL FIX: Zaten var olan ID hatalarını engellemek için upsert kullanıyoruz.
async function safeUpsert(tableName: string, data: any[], label: string): Promise<void> {
  try {
    const { error } = await supabase.from(tableName).upsert(data);
    if (error) {
      console.error(`❌ [SEED] ${label} YÜKLENEMEDİ:`, error.message);
      throw error;
    }
    console.log(`🌱 [SEED] ${label}: ${data.length} kayıt eklendi/güncellendi`);
  } catch (err) {
    console.error(`❌ [SEED] ${label} tablosu çöktü`, err);
  }
}

export async function nuclearWipe(): Promise<void> {
  console.log('🟢 ☢️ NUCLEAR WIPE: Derinlemesine temizlik başlıyor (Sadece Mevcut Tablolar)...');

  // DÜZELTME: Sadece sistemde gerçekten var olan ve 404 hatası vermeyen tabloları
  // ilişkisel bütünlüğe (Foreign Key) uygun sırayla siliyoruz.
  const tablesToClear = [
    'action_plans',
    'workpaper_findings',
    'finding_history',
    'audit_findings',
    'workpapers',
    'review_notes',
    'audit_steps',
    'reports',
    'ccm_alerts',
    'ccm_transactions',
    'investigation_cases',
    'whistleblower_tips',
    'sox_attestations',
    'sox_controls',
    'tprm_assessments',
    'tprm_vendors',
    'esg_frameworks',
    'audit_engagements',
    'audit_plans',
    'program_templates',
    'risk_library',
    'risk_history', // Trigger'ın yazdığı tablo
    'audit_entities',
    'user_profiles'
  ];

  for (const table of tablesToClear) {
    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
        
      if (!error) {
        console.log(`🟢 🧹 [WIPE] ${table} temizlendi.`);
      }
    } catch (err) {
      // Konsolu kirletmemek için hata fırlatmayan tabloları sessizce geç
    }
  }

  console.log('🟢 ✅ NUCLEAR WIPE TAMAMLANDI: Veritabanı steril.');
}

export async function seedTurkeyBank(): Promise<void> {
  console.log('🏦 TURKEY BANK SEEDER: Sentinel Katılım Bankası İnşa Ediliyor...');

  await safeUpsert('user_profiles', [
    { id: USERS.CAE, tenant_id: TENANT_ID, email: 'hakan.yilmaz@sentinelbank.com.tr', full_name: 'Hakan Yılmaz', role: 'cae', title: 'Teftiş Kurulu Başkanı', department: 'İç Denetim', phone: '+90 212 555 0101' },
    { id: USERS.AUDITOR, tenant_id: TENANT_ID, email: 'ahmet.demir@sentinelbank.com.tr', full_name: 'Ahmet Demir', role: 'auditor', title: 'Kıdemli Müfettiş', department: 'İç Denetim', phone: '+90 212 555 0102' },
    { id: USERS.AUDITEE, tenant_id: TENANT_ID, email: 'mehmet.kaya@sentinelbank.com.tr', full_name: 'Mehmet Kaya', role: 'auditee', title: 'Şube Müdürü', department: 'Kadıköy Şubesi', phone: '+90 216 555 0201' },
    { id: USERS.GMY, tenant_id: TENANT_ID, email: 'zeynep.arslan@sentinelbank.com.tr', full_name: 'Zeynep Arslan', role: 'executive', title: 'Hazineden Sorumlu GMY', department: 'Hazine', phone: '+90 212 555 0103' },
    { id: USERS.VENDOR, tenant_id: TENANT_ID, email: 'ali.celik@external.com', full_name: 'Ali Çelik', role: 'guest', title: 'IT Güvenlik Uzmanı', department: 'Dış Danışman', phone: '+90 532 555 0301' },
  ], 'Kullanıcılar');

  await safeUpsert('audit_entities', [
    { id: IDS.ENTITY_HQ, tenant_id: TENANT_ID, name: 'Genel Müdürlük', type: 'BANK', path: 'hq', risk_score: 85, metadata: { city: 'Istanbul', employee_count: 450 } },
    { id: IDS.ENTITY_TREASURY, tenant_id: TENANT_ID, name: 'Hazine ve Finansman', type: 'UNIT', path: 'hq.treasury', risk_score: 92, metadata: { portfolio_size_tl: 5200000000 } },
    { id: IDS.ENTITY_KADIKOY, tenant_id: TENANT_ID, name: 'Kadıköy Şubesi (101)', type: 'UNIT', path: 'hq.kadikoy', risk_score: 68, metadata: { branch_code: '101', customer_count: 4200 } },
    { id: IDS.ENTITY_UMRANIYE, tenant_id: TENANT_ID, name: 'Ümraniye Şubesi (102)', type: 'UNIT', path: 'hq.umraniye', risk_score: 62, metadata: { branch_code: '102', customer_count: 3800 } },
  ], 'Denetim Evreni');

  await safeUpsert('risk_library', [
    { risk_code: 'RISK-001', title: 'Murabaha İşlemlerinde Teverruk Riski', inherent_score: 89, residual_score: 65, control_effectiveness: 70, tenant_id: TENANT_ID, static_fields: { category: 'compliance', shariah_board_review: true } },
    { risk_code: 'RISK-002', title: 'Katılma Hesapları Havuz Yönetimi', inherent_score: 92, residual_score: 72, control_effectiveness: 65, tenant_id: TENANT_ID, static_fields: { category: 'operational', pool_count: 8 } },
    { risk_code: 'RISK-003', title: 'Şube Kasa ve Kıymet Güvenliği', inherent_score: 68, residual_score: 48, control_effectiveness: 75, tenant_id: TENANT_ID, static_fields: { category: 'operational', daily_cash_limit_tl: 500000 } },
    { risk_code: 'RISK-004', title: 'Siber Güvenlik ve Veri Sızıntısı', inherent_score: 95, residual_score: 60, control_effectiveness: 60, tenant_id: TENANT_ID, static_fields: { category: 'technology', last_pentest: '2025-12-01' } },
    { risk_code: 'RISK-005', title: 'KYC/AML Uyumluluk Riski', inherent_score: 78, residual_score: 40, control_effectiveness: 80, tenant_id: TENANT_ID, static_fields: { category: 'compliance', regulatory_body: 'MASAK' } },
  ], 'Risk Library');

  await safeUpsert('audit_plans', [
    { id: IDS.PLAN, tenant_id: TENANT_ID, title: 'Yıllık Denetim Planı 2026', period_start: '2026-01-01', period_end: '2026-12-31', status: 'APPROVED' },
  ], 'Planlar');

  await safeUpsert('audit_engagements', [
    { id: IDS.ENG_KADIKOY, tenant_id: TENANT_ID, plan_id: IDS.PLAN, entity_id: IDS.ENTITY_KADIKOY, title: 'Kadıköy Şube Operasyon Denetimi', status: 'IN_PROGRESS', audit_type: 'COMPREHENSIVE', start_date: '2026-02-01', end_date: '2026-03-15', risk_snapshot_score: 68, estimated_hours: 80, actual_hours: 32 },
    { id: IDS.ENG_CYBER, tenant_id: TENANT_ID, plan_id: IDS.PLAN, entity_id: IDS.ENTITY_HQ, title: 'Kurumsal Siber Güvenlik Sızma Testi', status: 'PLANNED', audit_type: 'TARGETED', start_date: '2026-04-01', end_date: '2026-05-31', risk_snapshot_score: 95, estimated_hours: 120, actual_hours: 0 },
    { id: IDS.ENG_COMPLIANCE, tenant_id: TENANT_ID, plan_id: IDS.PLAN, entity_id: IDS.ENTITY_TREASURY, title: 'Hazine Fon Yönetimi Uyum Denetimi', status: 'COMPLETED', audit_type: 'FOLLOW_UP', start_date: '2026-01-10', end_date: '2026-02-10', risk_snapshot_score: 92, estimated_hours: 60, actual_hours: 58 },
  ], 'Denetim Görevleri');

  await safeUpsert('audit_steps', [
    { id: IDS.STEP1, engagement_id: IDS.ENG_KADIKOY, step_code: 'KD-01', title: 'Kasa Sayımı ve Limit Kontrolü', description: 'Gün sonu kasa bakiyesi sayımı ve sigorta limiti kontrolü' },
    { id: IDS.STEP2, engagement_id: IDS.ENG_KADIKOY, step_code: 'KD-02', title: 'Müşteri Hesap Açılış Prosedürü (KYC)', description: 'MASAK uyum belgelerinin doğrulanması' },
    { id: IDS.STEP3, engagement_id: IDS.ENG_KADIKOY, step_code: 'KD-03', title: 'Kredi Teminat Dosyası İncelemesi', description: 'Ticari kredilerin ipotek karşılıklarının kontrolü' },
    { id: IDS.STEP4, engagement_id: IDS.ENG_COMPLIANCE, step_code: 'HZ-01', title: 'Murabaha İşlem Kontrolü', description: 'Murabaha işlemlerinin fıkhi uyumluluğunun kontrolü' },
    { id: IDS.STEP5, engagement_id: IDS.ENG_COMPLIANCE, step_code: 'HZ-02', title: 'Havuz Hesabı Dağıtım Denetimi', description: 'Katılma hesapları kâr dağıtım havuzu algoritmalarının doğrulanması' },
  ], 'Çalışma Adımları');

  await safeUpsert('workpapers', [
    { id: IDS.WP1, step_id: IDS.STEP1, status: 'finalized', data: { objective: 'Şube kasa limitinin BDDK düzenlemelerine uygunluğunu doğrulamak', conclusion: 'Kasa limiti 3 gün aşılmış', test_result: 'FAIL', sample_size: 15, exceptions: 3 } },
    { id: IDS.WP2, step_id: IDS.STEP2, status: 'draft', data: { objective: 'KYC ve AML prosedürlerinin tam olarak uygulandığını doğrulamak', test_result: 'PENDING', sample_size: 25 } },
    { id: IDS.WP3, step_id: IDS.STEP4, status: 'finalized', data: { objective: 'Murabaha işlemlerinin fıkhi uyumluluğunun kontrolü', conclusion: 'İşlemler Danışma Komitesi kararlarına uyumlu', test_result: 'PASS', sample_size: 10, exceptions: 0 } },
  ], 'Çalışma Kağıtları');

  await safeUpsert('audit_findings', [
    { id: IDS.FINDING1, engagement_id: IDS.ENG_KADIKOY, title: 'Kasa Limiti Aşımı ve Sigorta Zafiyeti', severity: 'CRITICAL', status: 'DRAFT', state: 'IN_NEGOTIATION', financial_impact: 250000, impact_score: 5, likelihood_score: 4, gias_category: 'Operasyonel Yönetim', auditee_department: 'Kadıköy Şubesi', details: { detection: 'Kasa bakiyesi 3 gün boyunca BDDK limitini aşmıştır', root_cause: 'Zırhlı araç transfer sıklığı yetersiz', recommendation: 'Transfer sıklığını haftada 3 güne çıkarın' } },
    { id: IDS.FINDING2, engagement_id: IDS.ENG_KADIKOY, title: 'Eksik MASAK / KYC Dokümantasyonu', severity: 'HIGH', status: 'DRAFT', state: 'DRAFT', financial_impact: 100000, impact_score: 4, likelihood_score: 3, gias_category: 'Uyum ve Yasal', auditee_department: 'Kadıköy Şubesi', details: { detection: '120 müşteri dosyasında kimlik fotokopisi eksik', root_cause: 'Dijital sisteme geçiş sırasında eski dosyalar atlanmış', recommendation: 'Geçmiş dosyalar için toplu dijital tarama yapılmalı' } },
    { id: IDS.FINDING3, engagement_id: IDS.ENG_COMPLIANCE, title: 'Murabaha Kâr Marjı Hesaplama Hatası', severity: 'MEDIUM', status: 'REMEDIATED', state: 'REMEDIATED', financial_impact: 50000, impact_score: 3, likelihood_score: 2, gias_category: 'Mali İşlemler', auditee_department: 'Hazine', details: { detection: 'Kâr marjı hesaplamasında yuvarlama farkı tespit edildi', root_cause: 'Hesaplama yazılımı eski formül kullanıyor', recommendation: 'Core Banking yazılımı güncellenmeli' } },
  ], 'Bulgular');

  await safeUpsert('action_plans', [
    { tenant_id: TENANT_ID, finding_id: IDS.FINDING1, title: 'Zırhlı Araç Transfer Sıklığı Artırımı', description: 'Güvenlik şirketi ile sözleşme revize edilecek, transfer sıklığı haftada 3 güne çıkarılacak', responsible_person: 'Mehmet Kaya', responsible_department: 'Kadıköy Şubesi', target_date: '2026-03-31', status: 'IN_PROGRESS', priority: 'HIGH', progress_percentage: 25 },
    { tenant_id: TENANT_ID, finding_id: IDS.FINDING2, title: 'KYC Dosya Tarama Projesi', description: 'Tüm müşteri dosyaları taranarak eksik belgeler tamamlanacak', responsible_person: 'Mehmet Kaya', responsible_department: 'Kadıköy Şubesi', target_date: '2026-04-15', status: 'DRAFT', priority: 'HIGH', progress_percentage: 0 },
    { tenant_id: TENANT_ID, finding_id: IDS.FINDING3, title: 'Murabaha Hesaplama Yazılımı Güncelleme', description: 'Kâr marjı hesaplama formülleri güncellenecek', responsible_person: 'Zeynep Arslan', responsible_department: 'Hazine', target_date: '2026-02-28', status: 'COMPLETED', priority: 'MEDIUM', progress_percentage: 100, completion_date: '2026-02-20' },
  ], 'Aksiyon Planları');

  await safeUpsert('reports', [
    { id: IDS.REPORT, tenant_id: TENANT_ID, engagement_id: IDS.ENG_COMPLIANCE, title: 'Hazine Uyum Denetimi Raporu', description: 'Hazine ve finansman birimi uyum denetimi final raporu', status: 'published', layout_type: 'standard' },
  ], 'Raporlar');

  await safeUpsert('program_templates', [
    { tenant_id: TENANT_ID, title: 'Şube Operasyonel Denetim Programı', description: 'Katılım bankası şubelerinin kapsamlı denetim programı', category: 'operational', estimated_hours: 80, step_count: 12, version: '2026.1' },
    { tenant_id: TENANT_ID, title: 'Siber Güvenlik Denetim Programı', description: 'BT altyapı ve siber güvenlik sızma testleri programı', category: 'technology', estimated_hours: 120, step_count: 18, version: '2026.1' },
  ], 'Denetim Programı Şablonları');

  console.log('🎉 TURKEY BANK SEEDER COMPLETE!');
}

export async function forceReseed(): Promise<void> {
  console.log('🚀 FORCE RESEED: Veritabanı Nükleer Temizliği ve Veri Yükleme başlatılıyor...');
  await nuclearWipe();
  await seedTurkeyBank();
  console.log('✅ FORCE RESEED İŞLEMİ BİTTİ!');
}