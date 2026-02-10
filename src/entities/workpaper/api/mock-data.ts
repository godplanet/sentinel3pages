import type { Workpaper, AuditStep, EvidenceItem, WorkpaperFinding } from '../model/types';

export const mockAuditSteps: AuditStep[] = [
  {
    id: 'step-001',
    engagement_id: 'eng-001',
    step_code: 'IT-GEN-001',
    title: 'Access Control Review',
    description: 'Review user access rights and segregation of duties',
    risk_weight: 1.5,
    required_evidence_types: ['screenshots', 'reports', 'documentation'],
    created_at: '2026-01-15T10:00:00Z',
  },
  {
    id: 'step-002',
    engagement_id: 'eng-001',
    step_code: 'IT-GEN-002',
    title: 'Password Policy Compliance',
    description: 'Verify password complexity and rotation requirements',
    risk_weight: 1.2,
    required_evidence_types: ['system_reports', 'policy_documents'],
    created_at: '2026-01-15T10:00:00Z',
  },
  {
    id: 'step-003',
    engagement_id: 'eng-001',
    step_code: 'IT-GEN-003',
    title: 'Backup and Recovery Testing',
    description: 'Test backup procedures and recovery capabilities',
    risk_weight: 1.8,
    required_evidence_types: ['test_results', 'logs', 'screenshots'],
    created_at: '2026-01-15T10:00:00Z',
  },
  {
    id: 'step-004',
    engagement_id: 'eng-001',
    step_code: 'FIN-ACC-001',
    title: 'Reconciliation Controls',
    description: 'Review account reconciliation processes and controls',
    risk_weight: 1.6,
    required_evidence_types: ['reconciliation_reports', 'approval_evidence'],
    created_at: '2026-01-15T10:00:00Z',
  },
];

export const mockWorkpapers: Workpaper[] = [
  {
    id: 'wp-001',
    step_id: 'step-001',
    assigned_auditor_id: 'user-001',
    status: 'draft',
    data: {
      test_results: {
        'admin_access_review': 'pass',
        'privileged_user_count': 'fail',
        'sod_matrix_review': 'n/a',
      },
      field_values: {
        'total_users': 150,
        'admin_users': 12,
        'review_date': '2026-02-01',
      },
      notes: 'Found 12 admin users, which exceeds the recommended 5% threshold.',
    },
    version: 1,
    updated_at: '2026-02-01T14:30:00Z',
  },
  {
    id: 'wp-002',
    step_id: 'step-002',
    assigned_auditor_id: 'user-001',
    status: 'review',
    data: {
      test_results: {
        'password_complexity': 'pass',
        'password_rotation': 'pass',
        'password_history': 'pass',
      },
      field_values: {
        'min_length': 12,
        'rotation_days': 90,
        'history_count': 5,
      },
      notes: 'All password policy controls are operating effectively.',
    },
    version: 2,
    updated_at: '2026-02-01T16:00:00Z',
  },
  {
    id: 'wp-003',
    step_id: 'step-003',
    assigned_auditor_id: 'user-002',
    status: 'draft',
    data: {
      test_results: {},
      notes: 'Backup testing scheduled for next week.',
    },
    version: 1,
    updated_at: '2026-02-01T09:00:00Z',
  },
];

export const mockEvidence: EvidenceItem[] = [
  {
    id: 'ev-001',
    workpaper_id: 'wp-001',
    storage_path: '/evidence/2026/Q1/access_control_report.pdf',
    file_name: 'access_control_report.pdf',
    file_size_bytes: 245760,
    sha256_hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    uploaded_by: 'user-001',
    uploaded_at: '2026-02-01T14:15:00Z',
  },
  {
    id: 'ev-002',
    workpaper_id: 'wp-001',
    storage_path: '/evidence/2026/Q1/admin_users_screenshot.png',
    file_name: 'admin_users_screenshot.png',
    file_size_bytes: 128512,
    sha256_hash: 'd7a8fbb307d7809469ca9abcb0082e4f8d5651e46d3cdb762d02d0bf37c9e592',
    uploaded_by: 'user-001',
    uploaded_at: '2026-02-01T14:20:00Z',
  },
  {
    id: 'ev-003',
    workpaper_id: 'wp-002',
    storage_path: '/evidence/2026/Q1/password_policy.pdf',
    file_name: 'password_policy.pdf',
    file_size_bytes: 89600,
    sha256_hash: 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3',
    uploaded_by: 'user-001',
    uploaded_at: '2026-02-01T15:45:00Z',
  },
];

export const mockFindings: WorkpaperFinding[] = [
  {
    id: 'finding-001',
    workpaper_id: 'wp-001',
    title: 'Otomatik Bulgu: privileged_user_count',
    description: 'Test başarısız oldu.',
    severity: 'Medium',
    source_ref: 'privileged_user_count',
    created_at: '2026-02-01T14:30:00Z',
  },
];
