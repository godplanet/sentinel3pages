/**
 * UNIVERSAL SEEDER - Browser-Based Database Population
 *
 * Runs entirely in the browser using Supabase client.
 * Provides a complete demo environment with realistic data.
 *
 * USAGE:
 * const seeder = new UniversalSeeder();
 * await seeder.runFullSeed();
 */

import { supabase } from '@/shared/api/supabase';

export interface SeedProgress {
  step: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  message: string;
  count?: number;
}

export class UniversalSeeder {
  private progress: SeedProgress[] = [];
  private onProgressUpdate?: (progress: SeedProgress[]) => void;

  constructor(onProgressUpdate?: (progress: SeedProgress[]) => void) {
    this.onProgressUpdate = onProgressUpdate;
  }

  private updateProgress(step: string, status: SeedProgress['status'], message: string, count?: number) {
    const existing = this.progress.find(p => p.step === step);
    if (existing) {
      existing.status = status;
      existing.message = message;
      existing.count = count;
    } else {
      this.progress.push({ step, status, message, count });
    }
    this.onProgressUpdate?.(this.progress);
  }

  async runFullSeed() {
    this.progress = [];

    try {
      await this.wipeAllData();
      await this.seedUniverse();
      await this.seedRiskMethodology();
      await this.seedRisks();
      await this.seedTalent();
      await this.seedEngagements();
      await this.seedFindings();
      await this.seedWorkpapers();
      await this.seedCCM();

      return { success: true, progress: this.progress };
    } catch (error) {
      console.error('Seeding failed:', error);
      return { success: false, error, progress: this.progress };
    }
  }

  async wipeAllData() {
    this.updateProgress('wipe', 'running', 'Clearing all data...');

    try {
      const tables = [
        'finding_comments',
        'finding_secrets',
        'finding_history',
        'action_plans',
        'audit_findings',
        'workpapers',
        'audit_engagements',
        'risk_assessments',
        'universe_risk_scores',
        'talent_assignments',
        'talent_profiles',
        'rkm_master_library',
      ];

      for (const table of tables) {
        await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
      }

      this.updateProgress('wipe', 'completed', 'All data cleared');
    } catch (error) {
      this.updateProgress('wipe', 'error', `Failed: ${error}`);
      throw error;
    }
  }

  async seedUniverse() {
    this.updateProgress('universe', 'running', 'Creating audit universe...');

    try {
      const { data: universe, error } = await supabase
        .from('audit_universe')
        .insert([
          {
            id: '11111111-1111-1111-1111-111111111111',
            name: 'Turkiye Bankasi A.S.',
            entity_type: 'LEGAL_ENTITY',
            path: '11111111-1111-1111-1111-111111111111',
            parent_id: null,
            inherent_risk: 85,
            residual_risk: 45,
            audit_frequency: 12,
          },
          {
            id: '22222222-2222-2222-2222-222222222222',
            name: 'Merkez Subesi',
            entity_type: 'BRANCH',
            path: '11111111-1111-1111-1111-111111111111.22222222-2222-2222-2222-222222222222',
            parent_id: '11111111-1111-1111-1111-111111111111',
            inherent_risk: 75,
            residual_risk: 40,
            audit_frequency: 12,
          },
          {
            id: '33333333-3333-3333-3333-333333333333',
            name: 'Kadikoy Subesi',
            entity_type: 'BRANCH',
            path: '11111111-1111-1111-1111-111111111111.33333333-3333-3333-3333-333333333333',
            parent_id: '11111111-1111-1111-1111-111111111111',
            inherent_risk: 70,
            residual_risk: 38,
            audit_frequency: 18,
          },
        ])
        .select();

      this.updateProgress('universe', 'completed', 'Audit universe created', 3);
    } catch (error) {
      this.updateProgress('universe', 'error', `Failed: ${error}`);
      throw error;
    }
  }

  async seedRiskMethodology() {
    this.updateProgress('methodology', 'running', 'Creating risk methodology...');

    try {
      await supabase.from('methodology_configs').upsert({
        id: '99999999-9999-9999-9999-999999999999',
        name: 'KERD 2026 - Hybrid Methodology',
        matrix_size: 5,
        impact_dimensions: ['financial', 'reputational', 'regulatory', 'operational'],
        likelihood_factors: ['frequency', 'vulnerability', 'threat_level'],
        color_scale: {
          '1-4': '#22c55e',
          '5-9': '#84cc16',
          '10-14': '#eab308',
          '15-19': '#f97316',
          '20-25': '#ef4444',
        },
        veto_rules: [
          { name: 'Critical Finding Limiter', condition: 'critical_findings >= 1', action: 'max_grade = 60' },
        ],
        is_active: true,
      });

      this.updateProgress('methodology', 'completed', 'Risk methodology created');
    } catch (error) {
      this.updateProgress('methodology', 'error', `Failed: ${error}`);
      throw error;
    }
  }

  async seedRisks() {
    this.updateProgress('risks', 'running', 'Creating risk library...');

    try {
      const risks = [
        {
          id: 'a1111111-1111-1111-1111-111111111111',
          title: 'Kredi Risk Yonetimi Zafiyeti',
          category: 'CREDIT_RISK',
          inherent_impact: 5,
          inherent_likelihood: 4,
          residual_impact: 3,
          residual_likelihood: 3,
          control_effectiveness: 70,
        },
        {
          id: 'a2222222-2222-2222-2222-222222222222',
          title: 'Siber Guvenlik Aciklari',
          category: 'TECHNOLOGY_RISK',
          inherent_impact: 5,
          inherent_likelihood: 5,
          residual_impact: 4,
          residual_likelihood: 3,
          control_effectiveness: 65,
        },
        {
          id: 'a3333333-3333-3333-3333-333333333333',
          title: 'Kara Para Aklama Riski',
          category: 'COMPLIANCE_RISK',
          inherent_impact: 5,
          inherent_likelihood: 3,
          residual_impact: 2,
          residual_likelihood: 2,
          control_effectiveness: 85,
        },
        {
          id: 'a4444444-4444-4444-4444-444444444444',
          title: 'Operasyonel Sureklilik Riski',
          category: 'OPERATIONAL_RISK',
          inherent_impact: 4,
          inherent_likelihood: 3,
          residual_impact: 2,
          residual_likelihood: 2,
          control_effectiveness: 75,
        },
        {
          id: 'a5555555-5555-5555-5555-555555555555',
          title: 'Uyum ve Duzenleme Riski',
          category: 'COMPLIANCE_RISK',
          inherent_impact: 4,
          inherent_likelihood: 4,
          residual_impact: 3,
          residual_likelihood: 2,
          control_effectiveness: 70,
        },
      ];

      await supabase.from('rkm_master_library').insert(risks);

      this.updateProgress('risks', 'completed', 'Risk library created', risks.length);
    } catch (error) {
      this.updateProgress('risks', 'error', `Failed: ${error}`);
      throw error;
    }
  }

  async seedTalent() {
    this.updateProgress('talent', 'running', 'Creating talent profiles...');

    try {
      const auditors = [
        {
          id: 'u1111111-1111-1111-1111-111111111111',
          full_name: 'Ahmet Aslan',
          email: 'ahmet.aslan@turkiyebankasi.com.tr',
          title: 'Senior Auditor',
          department: 'Internal Audit',
          skills: ['Credit Risk', 'Financial Analysis', 'Banking Operations'],
          certifications: ['CIA', 'CFE'],
          years_experience: 8,
          current_utilization: 75,
        },
        {
          id: 'u2222222-2222-2222-2222-222222222222',
          full_name: 'Zeynep Kaya',
          email: 'zeynep.kaya@turkiyebankasi.com.tr',
          title: 'IT Auditor',
          department: 'Internal Audit',
          skills: ['Cybersecurity', 'IT Audit', 'COBIT'],
          certifications: ['CISA', 'CISSP'],
          years_experience: 6,
          current_utilization: 80,
        },
        {
          id: 'u3333333-3333-3333-3333-333333333333',
          full_name: 'Mehmet Yilmaz',
          email: 'mehmet.yilmaz@turkiyebankasi.com.tr',
          title: 'Compliance Auditor',
          department: 'Internal Audit',
          skills: ['AML/CFT', 'Regulatory Compliance', 'BDDK Regulations'],
          certifications: ['ACAMS', 'CFE'],
          years_experience: 10,
          current_utilization: 70,
        },
        {
          id: 'u4444444-4444-4444-4444-444444444444',
          full_name: 'Ayse Demir',
          email: 'ayse.demir@turkiyebankasi.com.tr',
          title: 'Audit Manager',
          department: 'Internal Audit',
          skills: ['Risk Management', 'Audit Planning', 'Team Leadership'],
          certifications: ['CIA', 'CRMA'],
          years_experience: 12,
          current_utilization: 65,
        },
        {
          id: 'u5555555-5555-5555-5555-555555555555',
          full_name: 'Sentinel Prime',
          email: 'ai@sentinel.audit',
          title: 'AI Audit Assistant',
          department: 'Internal Audit',
          skills: ['Data Analytics', 'Pattern Recognition', 'Risk Assessment', 'Natural Language Processing'],
          certifications: ['AI-Powered'],
          years_experience: 1,
          current_utilization: 30,
        },
      ];

      await supabase.from('talent_profiles').insert(auditors);

      this.updateProgress('talent', 'completed', 'Talent profiles created', auditors.length);
    } catch (error) {
      this.updateProgress('talent', 'error', `Failed: ${error}`);
      throw error;
    }
  }

  async seedEngagements() {
    this.updateProgress('engagements', 'running', 'Creating audit engagements...');

    try {
      const engagements = [
        {
          id: 'e1111111-1111-1111-1111-111111111111',
          title: 'Kredi Sureciyet Denetimi 2026',
          engagement_type: 'ADVISORY',
          status: 'PLANNING',
          planned_start: new Date('2026-03-01').toISOString(),
          planned_end: new Date('2026-05-31').toISOString(),
          risk_rating: 'HIGH',
          budget_hours: 320,
          entity_id: '11111111-1111-1111-1111-111111111111',
        },
        {
          id: 'e2222222-2222-2222-2222-222222222222',
          title: 'Siber Guvenlik Denetimi',
          engagement_type: 'ASSURANCE',
          status: 'FIELDWORK',
          planned_start: new Date('2026-02-01').toISOString(),
          planned_end: new Date('2026-04-30').toISOString(),
          actual_start: new Date('2026-02-05').toISOString(),
          risk_rating: 'CRITICAL',
          budget_hours: 400,
          entity_id: '11111111-1111-1111-1111-111111111111',
        },
        {
          id: 'e3333333-3333-3333-3333-333333333333',
          title: 'Kara Para Aklama Uyum Denetimi',
          engagement_type: 'COMPLIANCE',
          status: 'REPORTING',
          planned_start: new Date('2025-11-01').toISOString(),
          planned_end: new Date('2026-01-31').toISOString(),
          actual_start: new Date('2025-11-03').toISOString(),
          actual_end: new Date('2026-02-05').toISOString(),
          risk_rating: 'MEDIUM',
          budget_hours: 280,
          entity_id: '22222222-2222-2222-2222-222222222222',
        },
      ];

      await supabase.from('audit_engagements').insert(engagements);

      this.updateProgress('engagements', 'completed', 'Audit engagements created', engagements.length);
    } catch (error) {
      this.updateProgress('engagements', 'error', `Failed: ${error}`);
      throw error;
    }
  }

  async seedFindings() {
    this.updateProgress('findings', 'running', 'Creating audit findings...');

    try {
      const findings = [
        {
          title: 'Kasa Islemlerinde Cift Anahtar Kurali Ihlali',
          severity: 'CRITICAL',
          state: 'NEGOTIATION',
          engagement_id: 'e2222222-2222-2222-2222-222222222222',
          impact_score: 5,
          likelihood_score: 4,
          financial_impact: 250000,
          gias_category: 'Operasyonel Yonetim',
          auditee_department: 'Kasa Operasyonlari',
          details: {
            detection: 'Yapilan incelemelerde, kasa acma islemlerinde cift anahtar kurali uygulanmadigi tespit edilmistir.',
            impact: 'Kasa guvenlik zafiyeti nedeniyle 250.000 TL risk alti.',
            root_cause: 'Personel operasyonel hiz onceligi nedeniyle proseduru atlamaktadir.',
            recommendation: 'Elektronik kilitli kasa sistemine gecilmeli.',
          },
        },
        {
          title: 'Sifrelenmeyen Musteri Yedekleri',
          severity: 'HIGH',
          state: 'DRAFT',
          engagement_id: 'e2222222-2222-2222-2222-222222222222',
          impact_score: 4,
          likelihood_score: 4,
          financial_impact: 500000,
          gias_category: 'Bilgi Teknolojileri',
          auditee_department: 'IT Department',
          details: {
            detection: 'Musteri veritabani yedekleri sifrelenmeden saklanmaktadir.',
            impact: 'Veri sizintisi durumunda 15.000 musterinin kisisel bilgileri aciga cikabilir.',
            root_cause: 'Yedekleme yazilimi eski versiyon kullaniyor.',
            recommendation: 'AES-256 ile yedek sifreleme aktif edilmeli.',
          },
        },
        {
          title: 'Eksik KYC Dokumantasyonu',
          severity: 'HIGH',
          state: 'CLOSED',
          engagement_id: 'e3333333-3333-3333-3333-333333333333',
          impact_score: 4,
          likelihood_score: 3,
          financial_impact: 100000,
          gias_category: 'Uyum ve Yasal',
          auditee_department: 'Compliance',
          details: {
            detection: '120 musteri dosyasinda kimlik fotokopisi eksik.',
            impact: 'BDDK denetiminde ceza riski.',
            root_cause: 'Sube personeli dijital sisteme gecis sirasinda eski dosyalari atladi.',
            recommendation: 'Gecmis dosyalar icin toplu tarama yapilmali.',
          },
        },
      ];

      const { data } = await supabase.from('audit_findings').insert(findings).select();

      this.updateProgress('findings', 'completed', 'Audit findings created', findings.length);
    } catch (error) {
      this.updateProgress('findings', 'error', `Failed: ${error}`);
      throw error;
    }
  }

  async seedWorkpapers() {
    this.updateProgress('workpapers', 'running', 'Creating workpapers...');

    try {
      const workpapers = [
        {
          id: 'w1111111-1111-1111-1111-111111111111',
          engagement_id: 'e2222222-2222-2222-2222-222222222222',
          title: 'Firewall Konfigurasyonu Testi',
          workpaper_code: 'WP-IT-001',
          status: 'IN_PROGRESS',
          assigned_to: 'u2222222-2222-2222-2222-222222222222',
          objective: 'Firewall kurallarinin guncel ve guvenli oldugunu dogrulamak',
          scope: 'Tum giris/cikis kurallari',
          budget_hours: 16,
          actual_hours: 12,
        },
        {
          id: 'w2222222-2222-2222-2222-222222222222',
          engagement_id: 'e2222222-2222-2222-2222-222222222222',
          title: 'Yedekleme Proseduru Incelemesi',
          workpaper_code: 'WP-IT-002',
          status: 'DRAFT',
          assigned_to: 'u2222222-2222-2222-2222-222222222222',
          objective: 'Yedekleme prosedurlerinin etkinligini test etmek',
          scope: 'Gunluk/haftalik/aylik yedekler',
          budget_hours: 12,
          actual_hours: 8,
        },
        {
          id: 'w3333333-3333-3333-3333-333333333333',
          engagement_id: 'e3333333-3333-3333-3333-333333333333',
          title: 'KYC Dosya Orneklemesi',
          workpaper_code: 'WP-CMP-001',
          status: 'APPROVED',
          assigned_to: 'u3333333-3333-3333-3333-333333333333',
          objective: 'KYC dokumantasyonunun eksiksiz oldugunu dogrulamak',
          scope: '50 musteriden rastgele orneklem',
          budget_hours: 20,
          actual_hours: 22,
        },
      ];

      await supabase.from('workpapers').insert(workpapers);

      this.updateProgress('workpapers', 'completed', 'Workpapers created', workpapers.length);
    } catch (error) {
      this.updateProgress('workpapers', 'error', `Failed: ${error}`);
      throw error;
    }
  }

  async seedCCM() {
    this.updateProgress('ccm', 'running', 'Creating CCM anomalies...');

    try {
      this.updateProgress('ccm', 'completed', 'CCM data created (placeholder)', 0);
    } catch (error) {
      this.updateProgress('ccm', 'error', `Failed: ${error}`);
      throw error;
    }
  }

  async getTableCounts() {
    const tables = [
      'audit_universe',
      'rkm_master_library',
      'talent_profiles',
      'audit_engagements',
      'audit_findings',
      'workpapers',
      'action_plans',
    ];

    const counts: Record<string, number> = {};

    for (const table of tables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });

        counts[table] = count || 0;
      } catch {
        counts[table] = -1;
      }
    }

    return counts;
  }
}
