export interface GovernanceDoc {
  id: string;
  doc_type: 'CHARTER' | 'DECLARATION' | 'MINUTES' | 'POLICY' | 'PROCEDURE';
  title: string;
  version: string | null;
  content_url: string | null;
  approval_status: 'DRAFT' | 'APPROVED' | 'ARCHIVED';
  approved_by: string | null;
  approved_at: string | null;
  tenant_id: string;
  created_at: string;
  updated_at: string;
}

export interface AuditorDeclaration {
  id: string;
  user_id: string | null;
  declaration_type: 'INDEPENDENCE' | 'CONFLICT_OF_INTEREST' | 'CODE_OF_CONDUCT';
  period_year: number;
  content: Record<string, any> | null;
  signed_at: string;
  signature_hash: string | null;
  tenant_id: string;
  created_at: string;
}

export interface CreateGovernanceDocInput {
  doc_type: 'CHARTER' | 'DECLARATION' | 'MINUTES' | 'POLICY' | 'PROCEDURE';
  title: string;
  version?: string;
  content_url?: string;
  approval_status?: 'DRAFT' | 'APPROVED' | 'ARCHIVED';
}

export interface CreateDeclarationInput {
  user_id: string;
  declaration_type: 'INDEPENDENCE' | 'CONFLICT_OF_INTEREST' | 'CODE_OF_CONDUCT';
  period_year: number;
  content?: Record<string, any>;
}

export interface GovernanceStats {
  total_docs: number;
  approved_docs: number;
  declarations_this_year: number;
  compliance_rate: number;
}
