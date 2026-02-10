export interface FindingSeverityCounts {
  count_critical: number;
  count_high: number;
  count_medium: number;
  count_low: number;
  total: number;
}

export interface DeductionStep {
  severity: string;
  count: number;
  pointsEach: number;
  totalDeduction: number;
  runningScore: number;
}

export interface CappingResult {
  triggered: boolean;
  reason: string | null;
  cappedFrom: number | null;
  cappedTo: number | null;
}

export interface GradingResult {
  baseScore: number;
  totalDeductions: number;
  scoreBeforeCapping: number;
  finalScore: number;
  finalGrade: string;
  assuranceOpinion: string;
  assuranceLabel: string;
  capping: CappingResult;
  waterfall: DeductionStep[];
  counts: FindingSeverityCounts;
}

export interface EngagementGradingRow {
  id: string;
  title: string;
  final_score: number | null;
  final_grade: string | null;
  assurance_opinion: string | null;
  capping_triggered: boolean;
  capping_reason: string | null;
  risk_weight_factor: number;
  total_deductions: number | null;
  grading_breakdown: DeductionStep[] | null;
}

export interface GroupConsolidationRow {
  tenant_id: string;
  plan_id: string;
  engagement_count: number;
  weighted_average_score: number;
  simple_average_score: number;
  capped_count: number;
  total_risk_weight: number;
  min_score: number;
  max_score: number;
}
