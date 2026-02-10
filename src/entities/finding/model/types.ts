export type FindingSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'OBSERVATION';
export type FindingMainStatus = 'ACIK' | 'KAPALI';
export type FindingProcessStage = 'DRAFT' | 'NEGOTIATION' | 'FOLLOWUP';
export type AuditType = 'SUBE' | 'SUREC_BS' | 'GENEL';

// Module 5: Negotiation States
export type FindingState = 'DRAFT' | 'PUBLISHED' | 'NEGOTIATION' | 'PENDING_APPROVAL' | 'FOLLOW_UP' | 'CLOSED' | 'FINAL' | 'REMEDIATED' | 'DISPUTED' | 'DISPUTING';
export type RiskRating = 'HIGH' | 'MEDIUM' | 'LOW';
export type GIASCategory = 'Operasyonel Risk' | 'Uyum Riski' | 'Finansal Risk' | 'Teknolojik Risk' | 'Yönetişim' | 'İç Kontrol' | 'Risk Yönetimi' | 'BT Güvenliği';

export interface Finding {
  id: string;
  tenant_id: string;
  engagement_id: string;
  audit_id?: string;
  workpaper_id?: string;

  // Tanımlama
  code: string;
  title: string;
  severity: FindingSeverity;

  // Legacy status (backward compatibility)
  main_status?: FindingMainStatus;
  process_stage?: FindingProcessStage;
  audit_type?: AuditType;

  // Yeni State Machine
  state: FindingState;
  status?: string;

  // Risk Scoring
  impact_score?: number;
  likelihood_score?: number;

  // GIAS 2024
  gias_category?: GIASCategory;

  // Finansal
  financial_impact?: number;

  // İçerik (HTML format)
  detection_html?: string;
  impact_html?: string;
  recommendation_html?: string;
  description?: string;

  // RCA
  root_cause_analysis?: any;
  criteria_json?: any[];

  // Denetlenen bilgileri
  auditee_id?: string;
  auditee_department?: string;

  // Module 5: Public Layer (Auditee-Visible)
  description_public?: string;
  risk_rating?: RiskRating;
  assigned_auditee_id?: string;
  published_at?: string;
  finding_code?: string;

  // Tarihler
  negotiation_started_at?: string;
  agreed_at?: string;
  agreement_date?: string;
  finalized_at?: string;
  finding_year?: number;
  created_at: string;
  updated_at: string;
}

// Module 5: Finding Secrets (IRON CURTAIN - Auditor-Only)
export interface FindingSecret {
  finding_id: string;

  // Iron Curtain Fields (DB Schema)
  auditor_notes_raw?: Record<string, any>;
  root_cause_analysis_internal?: string;
  detection_methodology?: string;

  // Legacy 5-Whys Support
  why_1?: string;
  why_2?: string;
  why_3?: string;
  why_4?: string;
  why_5?: string;
  root_cause_summary?: string;

  internal_notes?: string;
  technical_details?: Record<string, any>;
  auditor_only_comments?: string;

  updated_at?: string;
}

// Module 5: Action Plan (Auditee Remediation Proposals)
export type ActionPlanStatus = 'DRAFT' | 'IN_REVIEW' | 'APPROVED' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
export type ActionPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type NegotiationState = 'PROPOSED' | 'REJECTED' | 'ACCEPTED';

export interface ActionPlan {
  id: string;
  tenant_id?: string;
  finding_id: string;

  title: string;
  description: string;
  responsible_person: string;
  responsible_person_title?: string;
  responsible_department?: string;

  target_date: string;
  original_due_date?: string;
  completion_date?: string;

  status: ActionPlanStatus;
  priority?: ActionPriority;

  progress_percentage?: number;
  extension_count?: number;
  milestones?: any[];

  // Module 5: Negotiation Fields
  plan_details?: Record<string, any>;
  current_state?: NegotiationState;
  auditor_rejection_reason?: string;

  auditee_response?: string;
  auditee_agreed?: boolean;
  auditee_agreed_at?: string;

  evidence_links?: any[];

  created_at: string;
  updated_at?: string;
  created_by?: string;
}

// Finding History
export type ChangeType = 'STATE_CHANGE' | 'CONTENT_EDIT' | 'SEVERITY_CHANGE' | 'ASSIGNMENT' | 'ACTION_PLAN_ADDED' | 'COMMENT_ADDED';

export interface FindingHistory {
  id: string;
  tenant_id: string;
  finding_id: string;

  previous_state?: string;
  new_state: string;

  change_type: ChangeType;
  changed_fields?: Record<string, any>;
  change_description?: string;

  changed_by?: string;
  changed_by_role?: string;
  changed_at: string;
}

// Finding Comments
export type CommentType = 'DISCUSSION' | 'AGREEMENT' | 'DISPUTE' | 'CLARIFICATION';
export type AuthorRole = 'AUDITOR' | 'AUDITEE' | 'AUDIT_MANAGER';

export interface FindingComment {
  id: string;
  tenant_id: string;
  finding_id: string;

  comment_text: string;
  comment_type: CommentType;

  author_id: string;
  author_role: AuthorRole;
  author_name?: string;

  parent_comment_id?: string;
  attachments?: any[];

  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

// Comprehensive Finding (tüm ilişkili verilerle)
export interface ComprehensiveFinding extends Finding {
  secrets?: FindingSecret;
  action_plans?: ActionPlan[];
  history?: FindingHistory[];
  comments?: FindingComment[];
}

export type PortalStatus = 'PENDING' | 'AGREED' | 'DISAGREED';
export type WorkflowStage = 'SELF' | 'DELEGATED' | 'MANAGER_REVIEW' | 'SUBMITTED';
export type Priority = 'ACIL' | 'ONCELIKLI' | 'STANDART';

export interface Assignment {
  id: string;
  finding_id: string;
  assignee_id?: string;

  portal_status: PortalStatus;
  workflow_stage: WorkflowStage;
  is_locked: boolean;

  auditee_opinion?: string;
  rejection_reason?: string;
  priority: Priority;

  created_at: string;
  updated_at: string;
}

export type ActionStepStatus = 'OPEN' | 'PENDING_VERIFICATION' | 'CLOSED';

export interface ActionStep {
  id: string;
  assignment_id: string;
  description: string;
  due_date: string;
  completion_date?: string;
  status: ActionStepStatus;
  created_at: string;
}

export interface FindingWithAssignment extends Finding {
  assignment?: Assignment;
  action_steps?: ActionStep[];
}
