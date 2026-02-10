import type { AuditPlan, AuditEngagement } from '../model/types';

const MOCK_TENANT_ID = '00000000-0000-0000-0000-000000000001';
const MOCK_USER_ID = '00000000-0000-0000-0000-000000000002';

export interface Auditor {
  id: string;
  name: string;
  role: string;
  avatarUrl: string;
  capacity: number;
}

export const MOCK_AUDITORS: Auditor[] = [
  {
    id: 'auditor-001',
    name: 'Ahmet Yılmaz',
    role: 'Lead Auditor',
    avatarUrl: 'https://i.pravatar.cc/150?img=12',
    capacity: 160,
  },
  {
    id: 'auditor-002',
    name: 'Ayşe Demir',
    role: 'IT Auditor',
    avatarUrl: 'https://i.pravatar.cc/150?img=45',
    capacity: 160,
  },
  {
    id: 'auditor-003',
    name: 'Mehmet Kaya',
    role: 'Risk Specialist',
    avatarUrl: 'https://i.pravatar.cc/150?img=33',
    capacity: 140,
  },
  {
    id: 'auditor-004',
    name: 'Zeynep Şahin',
    role: 'Financial Auditor',
    avatarUrl: 'https://i.pravatar.cc/150?img=47',
    capacity: 160,
  },
  {
    id: 'auditor-005',
    name: 'Can Öztürk',
    role: 'Compliance Auditor',
    avatarUrl: 'https://i.pravatar.cc/150?img=68',
    capacity: 120,
  },
];

export const mockAuditPlan: AuditPlan = {
  id: 'plan-2026-001',
  tenant_id: MOCK_TENANT_ID,
  title: '2026 Annual Audit Plan',
  period_start: '2026-01-01',
  period_end: '2026-12-31',
  status: 'APPROVED',
  version: 1,
  created_at: '2026-01-15T10:00:00Z',
  updated_at: '2026-01-20T14:30:00Z',
  created_by: MOCK_USER_ID,
  approved_at: '2026-01-20T14:30:00Z',
  approved_by: MOCK_USER_ID,
};

export const mockEngagements: AuditEngagement[] = [
  {
    id: 'eng-001',
    tenant_id: MOCK_TENANT_ID,
    plan_id: 'plan-2026-001',
    entity_id: '5',
    title: 'Mortgage Origination Process Audit',
    status: 'IN_PROGRESS',
    audit_type: 'COMPREHENSIVE',
    start_date: '2026-02-01',
    end_date: '2026-03-15',
    assigned_auditor_id: 'auditor-001',
    strategic_objective_ids: ['obj-004', 'obj-007'],
    risk_snapshot_score: 115.5,
    estimated_hours: 240,
    actual_hours: 85,
    created_at: '2026-01-20T15:00:00Z',
    updated_at: '2026-02-01T09:00:00Z',
  },
  {
    id: 'eng-002',
    tenant_id: MOCK_TENANT_ID,
    plan_id: 'plan-2026-001',
    entity_id: '13',
    title: 'Corporate Credit Approval Audit',
    status: 'PLANNED',
    audit_type: 'COMPREHENSIVE',
    start_date: '2026-03-20',
    end_date: '2026-05-10',
    assigned_auditor_id: 'auditor-004',
    strategic_objective_ids: ['obj-004'],
    risk_snapshot_score: 132.9,
    estimated_hours: 320,
    actual_hours: 0,
    created_at: '2026-01-20T15:15:00Z',
    updated_at: '2026-01-20T15:15:00Z',
  },
  {
    id: 'eng-003',
    tenant_id: MOCK_TENANT_ID,
    plan_id: 'plan-2026-001',
    entity_id: '22',
    title: 'Real-time Risk Monitoring Audit',
    status: 'PLANNED',
    audit_type: 'TARGETED',
    start_date: '2026-04-01',
    end_date: '2026-04-30',
    assigned_auditor_id: 'auditor-002',
    strategic_objective_ids: ['obj-001', 'obj-003'],
    risk_snapshot_score: 161.2,
    estimated_hours: 160,
    actual_hours: 0,
    created_at: '2026-01-20T15:30:00Z',
    updated_at: '2026-01-20T15:30:00Z',
  },
  {
    id: 'eng-004',
    tenant_id: MOCK_TENANT_ID,
    plan_id: 'plan-2026-001',
    entity_id: '24',
    title: 'Derivatives Pricing & Valuation Audit',
    status: 'PLANNED',
    audit_type: 'COMPREHENSIVE',
    start_date: '2026-06-01',
    end_date: '2026-07-31',
    strategic_objective_ids: ['obj-004', 'obj-005'],
    risk_snapshot_score: 178.0,
    estimated_hours: 400,
    actual_hours: 0,
    created_at: '2026-01-20T15:45:00Z',
    updated_at: '2026-01-20T15:45:00Z',
  },
  {
    id: 'eng-005',
    tenant_id: MOCK_TENANT_ID,
    plan_id: 'plan-2026-001',
    entity_id: '7',
    title: 'Personal Loan Underwriting Audit',
    status: 'PLANNED',
    audit_type: 'TARGETED',
    start_date: '2026-08-01',
    end_date: '2026-09-15',
    assigned_auditor_id: 'auditor-003',
    strategic_objective_ids: ['obj-004'],
    risk_snapshot_score: 105.7,
    estimated_hours: 180,
    actual_hours: 0,
    created_at: '2026-01-20T16:00:00Z',
    updated_at: '2026-01-20T16:00:00Z',
  },
  {
    id: 'eng-006',
    tenant_id: MOCK_TENANT_ID,
    plan_id: 'plan-2026-001',
    entity_id: '17',
    title: 'Trade Finance Operations Audit',
    status: 'PLANNED',
    audit_type: 'FOLLOW_UP',
    start_date: '2026-10-01',
    end_date: '2026-11-15',
    risk_snapshot_score: 93.6,
    estimated_hours: 120,
    actual_hours: 0,
    created_at: '2026-01-20T16:15:00Z',
    updated_at: '2026-01-20T16:15:00Z',
  },
];

export const mockPlanningData = {
  plan: mockAuditPlan,
  engagements: mockEngagements,
};
