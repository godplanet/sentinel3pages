export interface AuditorProfile {
  user_id: string;
  title: string | null;
  department: string | null;
  certifications: string[];
  skills_matrix: Record<string, number>;
  cpe_credits: number;
  hire_date: string | null;
  tenant_id: string;
  created_at: string;
  updated_at: string;
}

export interface TrainingRecord {
  id: string;
  user_id: string;
  training_title: string;
  training_type: 'INTERNAL' | 'EXTERNAL' | 'CERTIFICATION' | 'ONLINE';
  hours: number;
  cpe_credits: number;
  completed_date: string | null;
  certificate_url: string | null;
  tenant_id: string;
  created_at: string;
}

export interface CreateAuditorProfileInput {
  user_id: string;
  title?: string;
  department?: string;
  certifications?: string[];
  skills_matrix?: Record<string, number>;
  hire_date?: string;
}

export interface CreateTrainingRecordInput {
  user_id: string;
  training_title: string;
  training_type: 'INTERNAL' | 'EXTERNAL' | 'CERTIFICATION' | 'ONLINE';
  hours: number;
  cpe_credits: number;
  completed_date?: string;
  certificate_url?: string;
}

export interface AuditorProfileWithTraining extends AuditorProfile {
  training_records: TrainingRecord[];
  total_training_hours: number;
}

export interface AuditorSkill {
  id: number;
  user_id: string;
  skill_category: string;
  proficiency_score: number;
  last_updated_at: string;
  assessed_by?: string;
  notes?: string;
}

export interface CreateAuditorSkillInput {
  user_id: string;
  skill_category: string;
  proficiency_score: number;
  notes?: string;
}

export interface SkillCategory {
  category: string;
  label: string;
  description: string;
}

export const SKILL_CATEGORIES: SkillCategory[] = [
  { category: 'IT_AUDIT', label: 'BT Denetimi', description: 'Bilgi teknolojileri denetim yetkinlikleri' },
  { category: 'FRAUD', label: 'Hile Denetimi', description: 'Hile tespiti ve arastirma' },
  { category: 'FINANCE', label: 'Finans', description: 'Mali denetim ve analiz' },
  { category: 'COMPLIANCE', label: 'Uyum', description: 'Duzenleyici uyum ve mevzuat' },
  { category: 'RISK_MGMT', label: 'Risk Yonetimi', description: 'Kurumsal risk yonetimi' },
  { category: 'DATA_ANALYTICS', label: 'Veri Analizi', description: 'Veri analizi ve istatistik' },
];
