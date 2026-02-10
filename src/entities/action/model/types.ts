export type ActionStatus =
  | 'pending'
  | 'in_progress'
  | 'evidence_uploaded'
  | 'auditor_review'
  | 'auditor_rejected'
  | 'risk_acceptance_requested'
  | 'risk_accepted'
  | 'closed';

export type ActionPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type RequestType = 'extension' | 'risk_acceptance';
export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface Action {
  id: string;
  tenant_id: string;
  finding_id: string;

  finding_snapshot: {
    finding_id: string;
    title: string;
    severity: string;
    risk_rating: string;
    created_at: string;
    gias_category?: string;
    description?: string;
  };

  assignee_unit_name?: string;
  assignee_user_id?: string;
  auditor_owner_id?: string;

  original_due_date: string;
  current_due_date: string;
  closed_at?: string;

  status: ActionStatus;

  auto_fix_config?: {
    enabled: boolean;
    endpoint: string;
    params?: Record<string, any>;
  };

  title: string;
  description?: string;
  priority: ActionPriority;
  cost_estimation?: number;

  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface ActionEvidence {
  id: string;
  tenant_id: string;
  action_id: string;

  file_name: string;
  storage_path: string;
  file_size?: number;
  mime_type?: string;

  file_hash: string;

  description?: string;
  uploaded_by?: string;
  created_at: string;
}

export interface ActionRequest {
  id: string;
  tenant_id: string;
  action_id: string;

  type: RequestType;

  requested_date?: string;

  justification: string;
  impact_analysis?: string;

  status: RequestStatus;
  reviewer_id?: string;
  reviewer_comments?: string;
  reviewed_at?: string;

  requested_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ActionLog {
  id: string;
  tenant_id: string;
  action_id: string;

  event_type: string;

  previous_status?: string;
  new_status?: string;

  description?: string;
  metadata: Record<string, any>;

  actor_id?: string;
  actor_role?: string;

  created_at: string;
}

export interface ActionAging {
  id: string;
  tenant_id: string;
  finding_id: string;
  title: string;
  status: ActionStatus;
  priority: ActionPriority;
  assignee_unit_name?: string;
  assignee_user_id?: string;
  original_due_date: string;
  current_due_date: string;
  created_at: string;

  age_from_detection: number;
  performance_delay_days: number;
  operational_overdue_days: number;
  extension_days: number;

  is_operationally_overdue: boolean;
  is_performance_delayed: boolean;

  evidence_count: number;
  pending_requests: number;
}

export interface ActionWithDetails extends Action {
  evidence?: ActionEvidence[];
  requests?: ActionRequest[];
  logs?: ActionLog[];
  aging?: Partial<ActionAging>;
}

export interface CreateActionInput {
  finding_id: string;
  assignee_user_id: string;
  assignee_unit_name?: string;
  original_due_date: string;
  current_due_date: string;
  title: string;
  description?: string;
  priority?: ActionPriority;
  auto_fix_config?: Action['auto_fix_config'];
}

export interface UpdateActionInput {
  status?: ActionStatus;
  current_due_date?: string;
  description?: string;
  priority?: ActionPriority;
  assignee_user_id?: string;
  assignee_unit_name?: string;
}
