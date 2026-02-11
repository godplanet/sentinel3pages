import { supabase } from '../../api/supabase';

const TENANT_ID = '11111111-1111-1111-1111-111111111111';

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
      .neq('id', '00000000-0000-0000-0000-000000000000');
    if (error) console.warn(`  ${tableName}: ${error.message}`);
    else console.log(`  ${tableName}: cleared`);
  } catch {
    console.warn(`  ${tableName}: skipped`);
  }
}

async function safeInsert(tableName: string, data: any[], label: string): Promise<void> {
  const { error } = await supabase.from(tableName).insert(data);
  if (error) {
    console.error(`  ${label} FAILED:`, error.message);
    throw error;
  }
  console.log(`  ${label}: ${data.length} rows inserted`);
}

export async function nuclearWipe(): Promise<void> {
  console.log('NUCLEAR WIPE: Starting...');

  await safeDelete('action_plans');
  await safeDelete('workpaper_findings');
  await safeDelete('finding_history');
  await safeDelete('audit_findings');
  await safeDelete('workpapers');
  await safeDelete('audit_steps');
  await safeDelete('review_notes');
  await safeDelete('reports');
  await safeDelete('audit_engagements');
  await safeDelete('audit_plans');
  await safeDelete('risk_library');
  await safeDelete('program_templates');
  await safeDelete('audit_entities');
  await safeDelete('user_profiles');

  console.log('NUCLEAR WIPE COMPLETE');
}

export async function seedTurkeyBank(): Promise<void> {
  console.log('TURKEY BANK SEEDER: Starting...');

  await safeInsert('user_profiles', [
    { id: USERS.CAE, tenant_id: TENANT_ID, email: 'hakan.yilmaz@sentinelbank.com.tr', full_name: 'Hakan Yilmaz', role: 'cae', title: 'Bas Mufettis', department: 'Ic Denetim', phone: '+90 212 555 0101' },
    { id: USERS.AUDITOR, tenant_id: TENANT_ID, email: 'ahmet.demir@sentinelbank.com.tr', full_name: 'Ahmet Demir', role: 'auditor', title: 'Kidemli Mufettis', department: 'Ic Denetim', phone: '+90 212 555 0102' },
    { id: USERS.AUDITEE, tenant_id: TENANT_ID, email: 'mehmet.kaya@sentinelbank.com.tr', full_name: 'Mehmet Kaya', role: 'auditee', title: 'Sube Muduru', department: 'Kadikoy Subesi', phone: '+90 216 555 0201' },
    { id: USERS.GMY, tenant_id: TENANT_ID, email: 'zeynep.arslan@sentinelbank.com.tr', full_name: 'Zeynep Arslan', role: 'executive', title: 'Hazineden Sorumlu GMY', department: 'Hazine', phone: '+90 212 555 0103' },
    { id: USERS.VENDOR, tenant_id: TENANT_ID, email: 'ali.celik@external.com', full_name: 'Ali Celik', role: 'guest', title: 'IT Guvenlik Danismani', department: 'Dis Danisman', phone: '+90 532 555 0301' },
  ], 'Users');

  await safeInsert('audit_entities', [
    { id: IDS.ENTITY_HQ, tenant_id: TENANT_ID, name: 'Genel Mudurluk', type: 'BANK', path: 'hq', risk_score: 85, metadata: { city: 'Istanbul', employee_count: 450 } },
    { id: IDS.ENTITY_TREASURY, tenant_id: TENANT_ID, name: 'Hazine ve Finansman', type: 'UNIT', path: 'hq.treasury', risk_score: 92, metadata: { portfolio_size_tl: 5200000000 } },
    { id: IDS.ENTITY_KADIKOY, tenant_id: TENANT_ID, name: 'Kadikoy Subesi (101)', type: 'UNIT', path: 'hq.kadikoy', risk_score: 68, metadata: { branch_code: '101', customer_count: 4200 } },
    { id: IDS.ENTITY_UMRANIYE, tenant_id: TENANT_ID, name: 'Umraniye Subesi (102)', type: 'UNIT', path: 'hq.umraniye', risk_score: 62, metadata: { branch_code: '102', customer_count: 3800 } },
  ], 'Audit Entities');

  await safeInsert('risk_library', [
    { risk_code: 'RISK-001', title: 'Murabaha Islemlerinde Teverruk Riski', inherent_score: 89, residual_score: 65, control_effectiveness: 70, tenant_id: TENANT_ID, static_fields: { category: 'compliance', shariah_board_review: true } },
    { risk_code: 'RISK-002', title: 'Katilma Hesaplari Havuz Yonetimi', inherent_score: 92, residual_score: 72, control_effectiveness: 65, tenant_id: TENANT_ID, static_fields: { category: 'operational', pool_count: 8 } },
    { risk_code: 'RISK-003', title: 'Sube Kasa ve Kiymet Guvenligi', inherent_score: 68, residual_score: 48, control_effectiveness: 75, tenant_id: TENANT_ID, static_fields: { category: 'operational', daily_cash_limit_tl: 500000 } },
    { risk_code: 'RISK-004', title: 'Siber Guvenlik ve Veri Sizintisi', inherent_score: 95, residual_score: 60, control_effectiveness: 60, tenant_id: TENANT_ID, static_fields: { category: 'technology', last_pentest: '2025-12-01' } },
    { risk_code: 'RISK-005', title: 'KYC/AML Uyumluluk Riski', inherent_score: 78, residual_score: 40, control_effectiveness: 80, tenant_id: TENANT_ID, static_fields: { category: 'compliance', regulatory_body: 'MASAK' } },
  ], 'Risk Library');

  await safeInsert('audit_plans', [
    { id: IDS.PLAN, tenant_id: TENANT_ID, title: 'Yillik Denetim Plani 2026', period_start: '2026-01-01', period_end: '2026-12-31', status: 'APPROVED' },
  ], 'Audit Plan');

  await safeInsert('audit_engagements', [
    { id: IDS.ENG_KADIKOY, tenant_id: TENANT_ID, plan_id: IDS.PLAN, entity_id: IDS.ENTITY_KADIKOY, title: 'Kadikoy Sube Denetimi 2026-Q1', status: 'IN_PROGRESS', audit_type: 'COMPREHENSIVE', start_date: '2026-02-01', end_date: '2026-03-15', risk_snapshot_score: 68, estimated_hours: 80, actual_hours: 32 },
    { id: IDS.ENG_CYBER, tenant_id: TENANT_ID, plan_id: IDS.PLAN, entity_id: IDS.ENTITY_HQ, title: 'Siber Guvenlik Denetimi', status: 'PLANNED', audit_type: 'TARGETED', start_date: '2026-04-01', end_date: '2026-05-31', risk_snapshot_score: 95, estimated_hours: 120, actual_hours: 0 },
    { id: IDS.ENG_COMPLIANCE, tenant_id: TENANT_ID, plan_id: IDS.PLAN, entity_id: IDS.ENTITY_TREASURY, title: 'Hazine Uyum Denetimi', status: 'COMPLETED', audit_type: 'FOLLOW_UP', start_date: '2026-01-10', end_date: '2026-02-10', risk_snapshot_score: 92, estimated_hours: 60, actual_hours: 58 },
  ], 'Engagements');

  await safeInsert('audit_steps', [
    { id: IDS.STEP1, engagement_id: IDS.ENG_KADIKOY, step_code: 'KD-01', title: 'Kasa Sayimi ve Limit Kontrolu', description: 'Gun sonu kasa bakiyesi sayimi' },
    { id: IDS.STEP2, engagement_id: IDS.ENG_KADIKOY, step_code: 'KD-02', title: 'Musteri Hesap Acilis Proseduru', description: 'KYC/AML dokumanlarinin kontrolu' },
    { id: IDS.STEP3, engagement_id: IDS.ENG_KADIKOY, step_code: 'KD-03', title: 'Kredi Dosyasi Incelemesi', description: 'Kredi tahsis ve teminat dosyalarinin kontrolu' },
    { id: IDS.STEP4, engagement_id: IDS.ENG_COMPLIANCE, step_code: 'HZ-01', title: 'Murabaha Islem Kontrolu', description: 'Murabaha islemlerinin fikhi uyumlulugunun kontrolu' },
    { id: IDS.STEP5, engagement_id: IDS.ENG_COMPLIANCE, step_code: 'HZ-02', title: 'Havuz Hesabi Denetimi', description: 'Katilma hesaplari kar dagitim hesaplamalarinin dogrulanmasi' },
  ], 'Audit Steps');

  await safeInsert('workpapers', [
    { id: IDS.WP1, step_id: IDS.STEP1, status: 'finalized', data: { objective: 'Sube kasa limitinin BDDK duzenlemelerine uygunlugunu dogrulamak', conclusion: 'Kasa limiti 3 gun asilmis', test_result: 'FAIL', sample_size: 15, exceptions: 3 } },
    { id: IDS.WP2, step_id: IDS.STEP2, status: 'draft', data: { objective: 'KYC ve AML prosedurlerinin tam olarak uygulandigini dogrulamak', test_result: 'PENDING', sample_size: 25 } },
    { id: IDS.WP3, step_id: IDS.STEP4, status: 'finalized', data: { objective: 'Murabaha islemlerinin fikhi uyumlulugunun kontrolu', conclusion: 'Islemler uyumlu', test_result: 'PASS', sample_size: 10, exceptions: 0 } },
  ], 'Workpapers');

  await safeInsert('audit_findings', [
    { id: IDS.FINDING1, engagement_id: IDS.ENG_KADIKOY, title: 'Kasa Limiti Asimi ve Sigorta Zafiyeti', severity: 'CRITICAL', status: 'DRAFT', state: 'IN_NEGOTIATION', financial_impact: 250000, impact_score: 5, likelihood_score: 4, gias_category: 'Operasyonel Yonetim', auditee_department: 'Kadikoy Subesi', details: { detection: 'Kasa bakiyesi 3 gun boyunca BDDK limitini asmistir', root_cause: 'Zirhli arac transfer sikligi yetersiz', recommendation: 'Transfer sikligini haftada 3 gune cikarin' } },
    { id: IDS.FINDING2, engagement_id: IDS.ENG_KADIKOY, title: 'Eksik KYC Dokumantasyonu', severity: 'HIGH', status: 'DRAFT', state: 'DRAFT', financial_impact: 100000, impact_score: 4, likelihood_score: 3, gias_category: 'Uyum ve Yasal', auditee_department: 'Kadikoy Subesi', details: { detection: '120 musteri dosyasinda kimlik fotokopisi eksik', root_cause: 'Dijital sisteme gecis sirasinda eski dosyalar atlanmis', recommendation: 'Gecmis dosyalar icin toplu tarama yapilmali' } },
    { id: IDS.FINDING3, engagement_id: IDS.ENG_COMPLIANCE, title: 'Murabaha Kar Marji Hesaplama Hatasi', severity: 'MEDIUM', status: 'REMEDIATED', state: 'REMEDIATED', financial_impact: 50000, impact_score: 3, likelihood_score: 2, gias_category: 'Mali Islemler', auditee_department: 'Hazine', details: { detection: 'Kar marji hesaplamasinda yuvarlama farki tespit edildi', root_cause: 'Hesaplama yazilimi eski formul kullaniyor', recommendation: 'Yazilim guncellenmeli' } },
  ], 'Findings');

  await safeInsert('action_plans', [
    { tenant_id: TENANT_ID, finding_id: IDS.FINDING1, title: 'Zirhli Arac Transfer Sikligi Artirimi', description: 'Guvenlik sirketi ile sozlesme revize edilecek, transfer sikligi haftada 3 gune cikarilacak', responsible_person: 'Mehmet Kaya', responsible_department: 'Kadikoy Subesi', target_date: '2026-03-31', status: 'IN_PROGRESS', priority: 'HIGH', progress_percentage: 25 },
    { tenant_id: TENANT_ID, finding_id: IDS.FINDING2, title: 'KYC Dosya Tarama Projesi', description: 'Tum musteri dosyalari taranarak eksik belgeler tamamlanacak', responsible_person: 'Mehmet Kaya', responsible_department: 'Kadikoy Subesi', target_date: '2026-04-15', status: 'DRAFT', priority: 'HIGH', progress_percentage: 0 },
    { tenant_id: TENANT_ID, finding_id: IDS.FINDING3, title: 'Murabaha Hesaplama Yazilimi Guncelleme', description: 'Kar marji hesaplama formulleri guncellenecek', responsible_person: 'Zeynep Arslan', responsible_department: 'Hazine', target_date: '2026-02-28', status: 'COMPLETED', priority: 'MEDIUM', progress_percentage: 100, completion_date: '2026-02-20' },
  ], 'Action Plans');

  await safeInsert('reports', [
    { id: IDS.REPORT, tenant_id: TENANT_ID, engagement_id: IDS.ENG_COMPLIANCE, title: 'Hazine Uyum Denetimi Raporu', description: 'Hazine ve finansman birimi uyum denetimi final raporu', status: 'published', layout_type: 'standard' },
  ], 'Reports');

  await safeInsert('program_templates', [
    { tenant_id: TENANT_ID, title: 'Sube Operasyonel Denetim Programi', description: 'Katilim bankasi subelerinin kapsamli denetim programi', category: 'operational', estimated_hours: 80, step_count: 12, version: '2026.1' },
    { tenant_id: TENANT_ID, title: 'Siber Guvenlik Denetim Programi', description: 'BT altyapi ve siber guvenlik denetim programi', category: 'operational', estimated_hours: 120, step_count: 18, version: '2026.1' },
  ], 'Program Templates');

  console.log('TURKEY BANK SEEDER COMPLETE!');
  console.log('  5 Users | 4 Entities | 5 Risks | 1 Plan | 3 Engagements');
  console.log('  5 Steps | 3 Workpapers | 3 Findings | 3 Actions | 1 Report | 2 Templates');
}

export async function forceReseed(): Promise<void> {
  console.log('FORCE RESEED: Starting full database reset...');
  await nuclearWipe();
  await seedTurkeyBank();
  console.log('FORCE RESEED COMPLETE!');
}
