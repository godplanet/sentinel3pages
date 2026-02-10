/**
 * Mock Data for Audit Execution Module
 *
 * Production-like test data for development and testing.
 */

import type { AuditStep, Workpaper, Evidence, WorkpaperFinding } from '../model/types';

export const mockAuditSteps: AuditStep[] = [
  {
    id: 'step-001',
    engagement_id: 'eng-2026-001',
    step_code: 'IT-GEN-001',
    title: 'Erişim Kontrolleri İncelemesi',
    description: 'Kullanıcı erişim haklarının ve ayrıcalıkların doğru şekilde atandığını doğrulayın.',
    risk_weight: 1.5,
    required_evidence_types: ['screenshot', 'log_export', 'policy_document'],
    created_at: new Date('2026-01-15').toISOString(),
  },
  {
    id: 'step-002',
    engagement_id: 'eng-2026-001',
    step_code: 'IT-GEN-002',
    title: 'Şifre Politikası Uyumluluğu',
    description: 'Tüm şifre politikası kontrollerinin etkin olduğunu test edin.',
    risk_weight: 1.2,
    required_evidence_types: ['configuration_export', 'test_result'],
    created_at: new Date('2026-01-15').toISOString(),
  },
  {
    id: 'step-003',
    engagement_id: 'eng-2026-001',
    step_code: 'IT-GEN-003',
    title: 'Yedekleme ve Kurtarma Testi',
    description: 'Yedekleme prosedürlerinin planlandığı gibi çalıştığını doğrulayın.',
    risk_weight: 2.0,
    required_evidence_types: ['backup_log', 'restore_test'],
    created_at: new Date('2026-01-15').toISOString(),
  },
  {
    id: 'step-004',
    engagement_id: 'eng-2026-001',
    step_code: 'FIN-001',
    title: 'Ödeme Süreç Kontrolü',
    description: 'Ödeme süreçlerinde ayrılma prensibi (segregation of duties) kontrolü.',
    risk_weight: 1.8,
    required_evidence_types: ['workflow_diagram', 'approval_matrix'],
    created_at: new Date('2026-01-16').toISOString(),
  },
  {
    id: 'step-005',
    engagement_id: 'eng-2026-001',
    step_code: 'FIN-002',
    title: 'Muhasebe Kayıtları Doğrulama',
    description: 'Muhasebe kayıtlarının eksiksiz ve doğru olduğunu test edin.',
    risk_weight: 1.3,
    required_evidence_types: ['journal_entries', 'reconciliation'],
    created_at: new Date('2026-01-16').toISOString(),
  },
];

export const mockWorkpapers: Workpaper[] = [
  {
    id: 'wp-001',
    step_id: 'step-001',
    assigned_auditor_id: null,
    status: 'draft',
    data: {
      type: 'test_of_design',
      objective: '12 admin kullanıcısının erişim haklarını incelemek ve %5 eşik değerini aşıp aşmadığını belirlemek.',
      scope: 'Tüm admin kullanıcıları (toplam 12 kullanıcı)',
      test_results: {
        admin_access_review: 'fail',
        privileged_user_count: 'fail',
        sod_matrix_review: 'na',
      },
      conclusion: '12 admin kullanıcı tespit edildi, bu da önerilen %5 eşik değerini aşmaktadır.',
      comments: [
        {
          text: '12 admin kullanıcı, önerilen %5 eşik değerini aşıyor.',
          author_id: 'user-1',
          timestamp: new Date('2026-02-01T10:30:00').toISOString(),
        },
      ],
    },
    version: 1,
    updated_at: new Date('2026-02-01T10:30:00').toISOString(),
  },
  {
    id: 'wp-002',
    step_id: 'step-002',
    assigned_auditor_id: null,
    status: 'review',
    data: {
      type: 'test_of_operating_effectiveness',
      objective: 'Şifre politikası kontrollerinin etkin olduğunu doğrulamak.',
      scope: 'Tüm aktif kullanıcılar',
      sample_size: 30,
      test_results: {
        password_complexity: 'pass',
        password_expiry: 'pass',
        account_lockout: 'pass',
      },
      exceptions_found: 0,
      conclusion: 'Tüm şifre politikası kontrolleri etkin şekilde çalışmaktadır.',
      comments: [],
    },
    version: 2,
    updated_at: new Date('2026-02-01T14:20:00').toISOString(),
  },
  {
    id: 'wp-003',
    step_id: 'step-003',
    assigned_auditor_id: null,
    status: 'draft',
    data: {
      type: 'walkthrough',
      objective: 'Yedekleme prosedürünü gözlemlemek ve test etmek.',
      scope: 'Gelecek hafta için planlanmış yedekleme testi',
      participants: ['IT Yöneticisi', 'Sistem Yöneticisi'],
      observations: ['Yedekleme planlandığı gibi çalıştı', 'Geri yükleme testi başarılı'],
      conclusion: '',
      comments: [],
    },
    version: 1,
    updated_at: new Date('2026-02-01T09:15:00').toISOString(),
  },
];

export const mockEvidence: Evidence[] = [
  {
    id: 'ev-001',
    workpaper_id: 'wp-001',
    storage_path: '/evidence/2026/access_control_report.pdf',
    file_name: 'access_control_report.pdf',
    file_size_bytes: 245760,
    sha256_hash: 'c8d84423847fc1c149d1e647f8d6bb7c21e3aa...',
    uploaded_by: 'user-1',
    uploaded_at: new Date('2026-02-01T10:00:00').toISOString(),
  },
  {
    id: 'ev-002',
    workpaper_id: 'wp-001',
    storage_path: '/evidence/2026/admin_users_screenshot.png',
    file_name: 'admin_users_screenshot.png',
    file_size_bytes: 89234,
    sha256_hash: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b...',
    uploaded_by: 'user-1',
    uploaded_at: new Date('2026-02-01T10:15:00').toISOString(),
  },
  {
    id: 'ev-003',
    workpaper_id: 'wp-002',
    storage_path: '/evidence/2026/password_policy_export.xlsx',
    file_name: 'password_policy_export.xlsx',
    file_size_bytes: 15678,
    sha256_hash: 'a665a45920422f9d417e4867efdc4fb8a04a1f3f...',
    uploaded_by: 'user-2',
    uploaded_at: new Date('2026-02-01T14:00:00').toISOString(),
  },
];

export const mockFindings: WorkpaperFinding[] = [
  {
    id: 'finding-001',
    workpaper_id: 'wp-001',
    title: 'Otomatik Bulgu: Admin Kullanıcı Sayısı Eşik Değeri Aşımı',
    description: 'Test başarısız oldu.',
    severity: 'Medium',
    source_ref: 'admin_access_review',
    created_at: new Date('2026-02-01T10:30:00').toISOString(),
  },
  {
    id: 'finding-002',
    workpaper_id: 'wp-001',
    title: 'Otomatik Bulgu: Ayrıcalıklı Kullanıcı Sayısı',
    description: 'Test başarısız oldu.',
    severity: 'Medium',
    source_ref: 'privileged_user_count',
    created_at: new Date('2026-02-01T10:30:00').toISOString(),
  },
];

// Mock engagements for audit assignments
export interface MockEngagement {
  id: string;
  title: string;
  client: string;
  period: string;
  status: 'planning' | 'execution' | 'review' | 'completed';
  assigned_to: string[];
  risk_level: 'low' | 'medium' | 'high';
  progress: number;
  workpaper_count: number;
  finding_count: number;
}

export const mockEngagements: MockEngagement[] = [
  {
    id: 'eng-2026-001',
    title: 'BT Genel Kontroller Denetimi 2026',
    client: 'ABC Bankası',
    period: '2026 Q1',
    status: 'execution',
    assigned_to: ['Denetçi 1', 'Denetçi 2'],
    risk_level: 'high',
    progress: 45,
    workpaper_count: 3,
    finding_count: 2,
  },
  {
    id: 'eng-2026-002',
    title: 'Kredi Süreç Denetimi',
    client: 'XYZ Bankası',
    period: '2026 Q1',
    status: 'planning',
    assigned_to: ['Denetçi 3'],
    risk_level: 'medium',
    progress: 15,
    workpaper_count: 0,
    finding_count: 0,
  },
  {
    id: 'eng-2026-003',
    title: 'Operasyonel Risk Değerlendirmesi',
    client: 'DEF Bankası',
    period: '2025 Q4',
    status: 'completed',
    assigned_to: ['Denetçi 1', 'Denetçi 4'],
    risk_level: 'low',
    progress: 100,
    workpaper_count: 8,
    finding_count: 3,
  },
];
