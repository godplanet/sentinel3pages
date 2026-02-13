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

  // ------------------------------------------------------------------
  // YENİ: SENTINEL V3.0 WIF & RISK ENGINE ALANLARI
  // ------------------------------------------------------------------
  impact_score?: number;     // Legacy
  likelihood_score?: number; // 1-5 arası olasılık
  impact_financial?: number; // 1-5 arası skor
  impact_legal?: number;     // 1-5 arası skor
  impact_reputation?: number; // 1-5 arası skor
  impact_operational?: number; // 1-5 arası skor
  control_weakness?: number;   // 1-5 arası kontrol zafiyeti
  
  // Risk Kategorizasyonu (Çoklu Seçim)
  selected_risk_categories?: string[]; 
  
  // Şer'i Uyum & IT Risk (Özel Veto Alanları)
  is_shariah_risk?: boolean;
  shariah_impact?: number;
  requires_income_purification?: boolean;
  is_it_risk?: boolean;
  cvss_score?: number;
  asset_criticality?: 'Minor' | 'Major' | 'Critical';
  
  // BDDK, Süreç veya Kurum İçi Özel Kod (SİZİN İSTEĞİNİZ)
  regulatory_code?: string;

  // GIAS 2024
  gias_category?: GIASCategory;

  // Finansal
  financial_impact?: number; // Ölçülebilir finansal etki (TL/USD)

  // ------------------------------------------------------------------
  // İÇERİK: 5C STANDART METİN ALANLARI (ZENGİN HTML)
  // ------------------------------------------------------------------
  detection_html?: string;       // 1. Tespit (Condition)
  criteria_text?: string;        // 2. Kriter / Mevzuat
  cause_text?: string;           // 3. Kök Neden Açıklaması
  impact_html?: string;          // 4. Etki (Effect)
  recommendation_html?: string;  // 5. Öneri (Recommendation)
  description?: string;          // Geriye dönük uyumluluk için (Legacy)

  // RCA
  root_cause_analysis?: any;     // Zen Editor / Drawer RCA verisi
  criteria_json?: any[];
  rca_category?: string;         // İnsan, Sistem, Süreç vb.

  // ------------------------------------------------------------------
  // MÜFETTİŞİN SON SÖZÜ
  // ------------------------------------------------------------------
  auditor_conclusion?: string;   // Kapanışta denetçinin nihai görüşü

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
  closed_at?: string; // Tamamen kapatılma tarihi
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

  // Kök Neden Çekmecesinin Gizli Verileri
  rca_details?: {
    method: 'five_whys' | 'fishbone' | 'bowtie';
    five_whys?: string[];
    fishbone?: Record<string, string>;
    bowtie?: Record<string, string>;
  };

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

  progress_percentage?: number; // %0 - %100 İlerleme
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

// YENİ: AKSİYON ERTELEME TALEPLERİ (Çoklu Revize Tarihi İçin)
export interface ActionPlanExtension {
  id: string;
  action_plan_id: string;
  requested_date: string; 
  reason: string;         
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  auditor_response?: string; 
  created_at: string;
}

// Finding History
export type ChangeType = 'STATE_CHANGE' | 'CONTENT_EDIT' | 'SEVERITY_CHANGE' | 'ASSIGNMENT' | 'ACTION_PLAN_ADDED' | 'COMMENT_ADDED' | 'AI_GENERATION';

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
export type CommentType = 'DISCUSSION' | 'AGREEMENT' | 'DISPUTE' | 'CLARIFICATION' | 'SYSTEM_LOG';
export type AuthorRole = 'AUDITOR' | 'AUDITEE' | 'AUDIT_MANAGER' | 'SYSTEM';

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
  action_plans?: (ActionPlan & { extensions?: ActionPlanExtension[] })[];
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