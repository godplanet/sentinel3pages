/**
 * SENTINEL v3.0 - TURKEY PARTICIPATION BANK SEEDER (FINAL VERSION)
 *
 * MISSION: Create a complete, deterministic dataset for "Sentinel Katılım Bankası"
 * FEATURES:
 * - Fixed UUIDs (repeatable seeds)
 * - Nuclear wipe with correct FK cascade order
 * - Rich scenario: HQ + 2 Branches + Islamic Finance Risks + Active Audit
 *
 * USAGE: Call nuclearWipe() then seedTurkeyBank()
 */

import { supabase } from '../../api/supabase';

// ==================== FIXED USER IDs (DETERMINISTIC) ====================
export const USERS = {
  CAE: 'a0000000-0000-0000-0000-000000000001', // Hakan (Chief Audit Executive)
  AUDITOR: 'a0000000-0000-0000-0000-000000000002', // Ahmet (Senior Auditor)
  AUDITEE: 'a0000000-0000-0000-0000-000000000003', // Mehmet (Branch Manager)
  GMY: 'a0000000-0000-0000-0000-000000000004', // Zeynep (GM Treasury)
  VENDOR: 'a0000000-0000-0000-0000-000000000005', // Ali (External Consultant)
};

// ==================== NUCLEAR WIPE (FK-SAFE DELETION) ====================
/**
 * Deletes ALL data in REVERSE dependency order to avoid FK constraint violations.
 * Order: Children -> Parents (Actions -> Findings -> Workpapers -> Engagements -> Risks -> Universe -> Users)
 */
export async function nuclearWipe(): Promise<void> {
  console.log('🔴 NUCLEAR WIPE: Starting database cleanup...');

  // Helper function to safely delete with error handling
  async function safeDelete(tableName: string, phase: string): Promise<void> {
    try {
      const { error, count } = await supabase
        .from(tableName)
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000')
        .select('id', { count: 'exact', head: true });

      if (error) {
        console.warn(`  ⚠️ ${tableName}: ${error.message} (might not exist)`);
      } else {
        console.log(`  ✓ ${tableName}: deleted ${count || 0} records`);
      }
    } catch (err) {
      console.warn(`  ⚠️ ${tableName}: ${err instanceof Error ? err.message : 'Unknown error'} (skipped)`);
    }
  }

  try {
    // PHASE 1: ACTION & FINDING CHILDREN
    console.log('Phase 1: Cleaning action and finding children...');
    await safeDelete('action_evidence', '1');
    await safeDelete('action_plans', '1');
    await safeDelete('finding_history', '1');
    await safeDelete('finding_responses', '1');
    await safeDelete('finding_signoffs', '1');

    // PHASE 2: FINDINGS
    console.log('Phase 2: Cleaning findings...');
    await safeDelete('audit_findings', '2');

    // PHASE 3: WORKPAPER CHILDREN
    console.log('Phase 3: Cleaning workpaper children...');
    await safeDelete('workpaper_time_logs', '3');
    await safeDelete('workpaper_steps', '3');
    await safeDelete('workpaper_evidence', '3');
    await safeDelete('workpaper_findings', '3');
    await safeDelete('review_notes', '3');

    // PHASE 4: WORKPAPERS
    console.log('Phase 4: Cleaning workpapers...');
    await safeDelete('workpapers', '4');

    // PHASE 5: ENGAGEMENTS & SPRINTS
    console.log('Phase 5: Cleaning engagements...');
    await safeDelete('sprint_tasks', '5');
    await safeDelete('sprints', '5');
    await safeDelete('audit_engagements', '5');

    // PHASE 6: PROGRAM LIBRARY
    console.log('Phase 6: Cleaning program templates...');
    await safeDelete('program_steps', '6');
    await safeDelete('program_sections', '6');
    await safeDelete('program_templates', '6');

    // PHASE 7: RISKS & CONTROLS
    console.log('Phase 7: Cleaning risks...');
    await safeDelete('risk_assessments', '7');
    await safeDelete('risk_controls', '7');
    await safeDelete('audit_risks', '7');

    // PHASE 8: UNIVERSE (ENTITIES)
    console.log('Phase 8: Cleaning audit universe...');
    await safeDelete('audit_universe', '8');

    // PHASE 9: REPORTS
    console.log('Phase 9: Cleaning reports...');
    await safeDelete('report_sections', '9');
    await safeDelete('audit_reports', '9');

    // PHASE 10: USERS (DELETE LAST)
    console.log('Phase 10: Cleaning users...');
    await safeDelete('user_profiles', '10');

    console.log('✅ NUCLEAR WIPE COMPLETE: Database is now clean.');
  } catch (error) {
    console.error('❌ Nuclear wipe failed:', error);
    throw error;
  }
}

// ==================== TURKEY BANK SEEDER ====================
export async function seedTurkeyBank(): Promise<void> {
  console.log('🇹🇷 TURKEY BANK SEEDER: Starting data population...');

  // Helper function to safely insert with error handling
  async function safeInsert(tableName: string, data: any[], step: string): Promise<void> {
    try {
      const { error } = await supabase.from(tableName).insert(data);

      if (error) {
        console.error(`  ❌ ${step} failed:`, error.message);
        throw error;
      } else {
        console.log(`  ✓ ${step} success: ${data.length} records inserted`);
      }
    } catch (err) {
      console.error(`  ❌ ${step} error:`, err);
      throw err;
    }
  }

  try {
    // STEP 1: CREATE USERS (With Profile Data)
    console.log('1️⃣ Creating users...');
    const users = [
      {
        id: USERS.CAE,
        email: 'hakan.yilmaz@sentinelbank.com.tr',
        full_name: 'Hakan Yılmaz',
        role: 'cae',
        department: 'İç Denetim',
        title: 'Baş Müfettiş',
        phone: '+90 212 555 0101',
      },
      {
        id: USERS.AUDITOR,
        email: 'ahmet.demir@sentinelbank.com.tr',
        full_name: 'Ahmet Demir',
        role: 'auditor',
        department: 'İç Denetim',
        title: 'Kıdemli Müfettiş',
        phone: '+90 212 555 0102',
      },
      {
        id: USERS.AUDITEE,
        email: 'mehmet.kaya@sentinelbank.com.tr',
        full_name: 'Mehmet Kaya',
        role: 'auditee',
        department: 'Kadıköy Şubesi',
        title: 'Şube Müdürü',
        phone: '+90 216 555 0201',
      },
      {
        id: USERS.GMY,
        email: 'zeynep.arslan@sentinelbank.com.tr',
        full_name: 'Zeynep Arslan',
        role: 'gmy',
        department: 'Hazine',
        title: 'Hazineden Sorumlu GMY',
        phone: '+90 212 555 0103',
      },
      {
        id: USERS.VENDOR,
        email: 'ali.celik@external.com',
        full_name: 'Ali Çelik',
        role: 'vendor',
        department: 'Dış Danışman',
        title: 'IT Güvenlik Danışmanı',
        phone: '+90 532 555 0301',
      },
    ];

    await safeInsert('user_profiles', users, 'Users');

    // STEP 2: CREATE AUDIT UNIVERSE (HQ + 2 Branches)
    console.log('2️⃣ Creating audit universe...');
    const universeEntities = [
      {
        id: 'u0000000-0000-0000-0000-000000000001',
        name: 'Genel Müdürlük',
        type: 'headquarters',
        parent_id: null,
        path: 'genel_mudurluk',
        risk_score: 85,
        control_score: 75,
        inherent_risk: 90,
        residual_risk: 70,
        metadata: { city: 'İstanbul', employee_count: 450 },
      },
      {
        id: 'u0000000-0000-0000-0000-000000000002',
        name: 'Hazineden Sorumlu GMY',
        type: 'department',
        parent_id: 'u0000000-0000-0000-0000-000000000001',
        path: 'genel_mudurluk.hazine_gmy',
        risk_score: 92,
        control_score: 80,
        inherent_risk: 95,
        residual_risk: 75,
        metadata: { gmy_name: 'Zeynep Arslan', portfolio_size_tl: 5200000000 },
      },
      {
        id: 'u0000000-0000-0000-0000-000000000003',
        name: 'Kadıköy Şubesi (101)',
        type: 'branch',
        parent_id: 'u0000000-0000-0000-0000-000000000001',
        path: 'genel_mudurluk.kadikoy_subesi',
        risk_score: 68,
        control_score: 72,
        inherent_risk: 70,
        residual_risk: 55,
        metadata: { branch_code: '101', city: 'İstanbul', customer_count: 4200 },
      },
      {
        id: 'u0000000-0000-0000-0000-000000000004',
        name: 'Ümraniye Şubesi (102)',
        type: 'branch',
        parent_id: 'u0000000-0000-0000-0000-000000000001',
        path: 'genel_mudurluk.umraniye_subesi',
        risk_score: 62,
        control_score: 78,
        inherent_risk: 65,
        residual_risk: 50,
        metadata: { branch_code: '102', city: 'İstanbul', customer_count: 3800 },
      },
    ];

    await safeInsert('audit_universe', universeEntities, 'Audit Universe');

    // STEP 3: CREATE RISK LIBRARY (Islamic Finance Specific)
    console.log('3️⃣ Creating risk library...');
    const risks = [
      {
        id: 'r0000000-0000-0000-0000-000000000001',
        risk_id: 'RISK-2026-001',
        title: 'Murabaha İşlemlerinde Teverruk Riski',
        description: 'Murabaha ve teverruk işlemlerinde fıkhi uyumluluk ve operasyonel risk',
        category: 'compliance',
        likelihood: 4,
        impact: 5,
        risk_score: 89,
        entity_id: 'u0000000-0000-0000-0000-000000000002',
        owner_id: USERS.GMY,
        status: 'active',
        metadata: {
          shariah_board_review: true,
          last_fatwa_date: '2026-01-15',
        },
      },
      {
        id: 'r0000000-0000-0000-0000-000000000002',
        risk_id: 'RISK-2026-002',
        title: 'Katılma Hesapları Havuz Yönetimi',
        description: 'Kar-zarar paylaşımında matematiksel hata ve hesap karıştırma riski',
        category: 'operational',
        likelihood: 3,
        impact: 5,
        risk_score: 92,
        entity_id: 'u0000000-0000-0000-0000-000000000002',
        owner_id: USERS.GMY,
        status: 'active',
        metadata: {
          pool_count: 8,
          monthly_distribution: true,
        },
      },
      {
        id: 'r0000000-0000-0000-0000-000000000003',
        risk_id: 'RISK-2026-003',
        title: 'Şube Kasa ve Kıymet Güvenliği',
        description: 'Nakit taşıma, kasa limiti ve fiziksel güvenlik riskleri',
        category: 'operational',
        likelihood: 3,
        impact: 4,
        risk_score: 68,
        entity_id: 'u0000000-0000-0000-0000-000000000003',
        owner_id: USERS.AUDITEE,
        status: 'active',
        metadata: {
          daily_cash_limit_tl: 500000,
          vault_type: 'grade_3',
        },
      },
    ];

    await safeInsert('audit_risks', risks, 'Audit Risks');

    // STEP 4: CREATE AUDIT PROGRAM TEMPLATE
    console.log('4️⃣ Creating program template...');
    const programTemplate = {
      id: 'p0000000-0000-0000-0000-000000000001',
      name: 'Şube Operasyonel Denetimi v2026',
      description: 'Katılım bankası şubelerinin kapsamlı operasyonel denetim programı',
      category: 'operational',
      risk_areas: ['cash_management', 'customer_service', 'compliance'],
      estimated_hours: 80,
      created_by: USERS.CAE,
      status: 'active',
      metadata: {
        version: '2026.1',
        bddk_compliant: true,
      },
    };

    await safeInsert('program_templates', [programTemplate], 'Program Template');

    // STEP 5: CREATE ACTIVE ENGAGEMENT
    console.log('5️⃣ Creating active engagement...');
    const engagement = {
      id: 'e0000000-0000-0000-0000-000000000001',
      engagement_code: 'AUD-2026-Q1-001',
      title: '2026 Q1 - Kadıköy Şube Denetimi',
      entity_id: 'u0000000-0000-0000-0000-000000000003',
      audit_type: 'operational',
      start_date: '2026-02-01',
      end_date: '2026-02-28',
      status: 'fieldwork',
      lead_auditor_id: USERS.AUDITOR,
      team_members: [USERS.AUDITOR],
      program_template_id: 'p0000000-0000-0000-0000-000000000001',
      budget_hours: 80,
      actual_hours: 32,
      metadata: {
        charter_approved_date: '2026-01-25',
        fieldwork_start: '2026-02-05',
      },
    };

    await safeInsert('audit_engagements', [engagement], 'Audit Engagement');

    // STEP 6: CREATE WORKPAPERS (THE CONNECTION!)
    console.log('6️⃣ Creating workpapers...');
    const workpapers = [
      {
        id: 'w0000000-0000-0000-0000-000000000001',
        engagement_id: 'e0000000-0000-0000-0000-000000000001',
        wp_code: 'WP-01',
        title: 'Kasa Sayımı ve Limit Kontrolü',
        objective: 'Şube kasa limitinin BDDK düzenlemelerine uygunluğunu doğrulamak',
        procedure: 'Gün sonu kasa bakiyesini sayın ve limit ile karşılaştırın',
        assigned_to: USERS.AUDITOR,
        status: 'completed',
        test_result: 'fail',
        conclusion: 'Kasa limiti 3 gün boyunca aşılmış (Ortalama %18 fazla)',
        metadata: {
          sample_size: 15,
          exceptions: 3,
        },
      },
      {
        id: 'w0000000-0000-0000-0000-000000000002',
        engagement_id: 'e0000000-0000-0000-0000-000000000001',
        wp_code: 'WP-02',
        title: 'Müşteri Hesap Açılış Prosedürü',
        objective: 'KYC ve AML prosedürlerinin tam olarak uygulandığını doğrulamak',
        procedure: 'Son 3 ay içinde açılan 25 hesabı örnekle ve belgeleri kontrol et',
        assigned_to: USERS.AUDITOR,
        status: 'in_progress',
        test_result: 'pending',
        metadata: {
          sample_size: 25,
        },
      },
    ];

    await safeInsert('workpapers', workpapers, 'Workpapers');

    // STEP 7: CREATE FINDING (Linked to WP-01)
    console.log('7️⃣ Creating finding...');
    const finding = {
      id: 'f0000000-0000-0000-0000-000000000001',
      finding_number: 'FND-2026-001',
      title: 'Kasa Limiti Aşımı ve Sigorta Zafiyeti',
      description: 'Kadıköy Şubesi kasa bakiyesi, BDDK düzenlemelerinde belirtilen günlük limiti (500.000 TL) sürekli olarak aşmaktadır.',
      severity: 'high',
      category: 'operational',
      engagement_id: 'e0000000-0000-0000-0000-000000000001',
      entity_id: 'u0000000-0000-0000-0000-000000000003',
      risk_id: 'r0000000-0000-0000-0000-000000000003',
      workpaper_id: 'w0000000-0000-0000-0000-000000000001',
      identified_by: USERS.AUDITOR,
      status: 'draft',
      root_cause: 'Zırhlı araç transfer sıklığı yetersiz (Haftada 2 gün yerine 1 gün)',
      recommendation: 'Transfer sıklığını haftada 3 güne çıkarın ve ek nakit sigortası yapın',
      metadata: {
        avg_excess_tl: 90000,
        days_exceeded: 12,
      },
    };

    await safeInsert('audit_findings', [finding], 'Audit Finding');

    // STEP 8: CREATE ACTION PLAN
    console.log('8️⃣ Creating action plan...');
    const actionPlan = {
      id: 'a0000000-0000-0000-0000-000000000001',
      finding_id: 'f0000000-0000-0000-0000-000000000001',
      action_title: 'Zırhlı Araç Transfer Sıklığı Artırımı',
      action_description: 'Güvenlik şirketi ile sözleşme revize edilecek, transfer sıklığı haftada 3 güne çıkarılacak',
      responsible_person_id: USERS.AUDITEE,
      due_date: '2026-03-31',
      status: 'not_started',
      priority: 'high',
      metadata: {
        budget_impact_tl: 48000,
        contract_vendor: 'Güven Zırhlı Taşımacılık A.Ş.',
      },
    };

    await safeInsert('action_plans', [actionPlan], 'Action Plan');

    console.log('✅ TURKEY BANK SEEDER COMPLETE!');
    console.log('📊 Summary:');
    console.log('   - 5 Users (CAE, Auditor, Auditee, GMY, Vendor)');
    console.log('   - 4 Entities (HQ + 2 Branches + Treasury)');
    console.log('   - 3 Islamic Finance Risks');
    console.log('   - 1 Active Engagement (Kadıköy - Fieldwork)');
    console.log('   - 2 Workpapers (1 FAIL = Finding Triggered)');
    console.log('   - 1 Finding + 1 Action Plan');
    console.log('🔗 ALL MODULES NOW CONNECTED TO LIVE DATA!');

  } catch (error) {
    console.error('❌ Turkey Bank seeding failed:', error);
    throw error;
  }
}

// ==================== MAIN ENTRY POINT ====================
export async function forceReseed(): Promise<void> {
  console.log('🚀 FORCE RESEED: Starting full database reset...');
  await nuclearWipe();
  await seedTurkeyBank();
  console.log('🎉 FORCE RESEED COMPLETE: Database is ready for testing!');
}
