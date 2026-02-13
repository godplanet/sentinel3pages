import type { GradingRules, CappingRule } from '@/features/risk-engine/methodology-types';
import type {
  FindingSeverityCounts,
  DeductionStep,
  CappingResult,
  GradingResult,
} from './types';

const DEFAULT_GRADING_RULES: GradingRules = {
  deductions: { critical: 25, high: 10, medium: 3, low: 1 },
  capping: [
    { condition: 'count_critical >= 1', field: 'count_critical', operator: '>=', value: 1, max_score: 60, reason: 'Kritik bulgu mevcut - Maksimum not D' },
    { condition: 'count_high > 3', field: 'count_high', operator: '>', value: 3, max_score: 69, reason: '3+ Yüksek bulgu - Maksimum not C-' },
  ],
  scale: [
    { grade: 'A+', min: 95, max: 100, opinion: 'TAM_GUVENCE', label: 'Tam Güvence' },
    { grade: 'A',  min: 90, max: 94,  opinion: 'TAM_GUVENCE', label: 'Tam Güvence' },
    { grade: 'B+', min: 85, max: 89,  opinion: 'MAKUL_GUVENCE', label: 'Makul Güvence' },
    { grade: 'B',  min: 80, max: 84,  opinion: 'MAKUL_GUVENCE', label: 'Makul Güvence' },
    { grade: 'C+', min: 75, max: 79,  opinion: 'MAKUL_GUVENCE', label: 'Makul Güvence' },
    { grade: 'C',  min: 70, max: 74,  opinion: 'SINIRLI_GUVENCE', label: 'Sınırlı Güvence' },
    { grade: 'C-', min: 65, max: 69,  opinion: 'SINIRLI_GUVENCE', label: 'Sınırlı Güvence' },
    { grade: 'D',  min: 50, max: 64,  opinion: 'SINIRLI_GUVENCE', label: 'Sınırlı Güvence' },
    { grade: 'E',  min: 25, max: 49,  opinion: 'GUVENCE_YOK', label: 'Güvence Yok' },
    { grade: 'F',  min: 0,  max: 24,  opinion: 'GUVENCE_YOK', label: 'Güvence Yok' },
  ],
};

// SENTINEL V3.0: Veto Flags Interface
export interface VetoFlags {
    hasShariahVeto?: boolean;
    hasCyberVeto?: boolean;
    hasLegalVeto?: boolean;
}

export class GradingCalculator {
  private rules: GradingRules;

  constructor(rules?: GradingRules | null) {
    this.rules = rules ?? DEFAULT_GRADING_RULES;
  }

  // SENTINEL V3.0 UPDATE: calculate method now accepts optional vetoFlags
  calculate(counts: FindingSeverityCounts, vetoFlags?: VetoFlags): GradingResult {
    const baseScore = 100;
    const waterfall = this.buildWaterfall(counts, baseScore);
    const totalDeductions = waterfall.reduce((sum, s) => sum + s.totalDeduction, 0);
    const scoreBeforeCapping = Math.max(0, baseScore - totalDeductions);

    // 1. Check Standard Capping Rules
    let capping = this.applyCapping(counts, scoreBeforeCapping);

    // 2. SENTINEL V3.0 ZERO TOLERANCE OVERRIDE (ACİL DURDURMA)
    // If any veto is triggered, it crushes all other calculations and forces a 0 score (F)
    if (vetoFlags?.hasShariahVeto || vetoFlags?.hasCyberVeto || vetoFlags?.hasLegalVeto) {
        let vetoReason = "Sıfır Tolerans İhlali";
        if (vetoFlags.hasShariahVeto) vetoReason = "Şer'i Uyum İhlali (Sıfır Tolerans)";
        else if (vetoFlags.hasCyberVeto) vetoReason = "Kritik Siber Zafiyet (Sıfır Tolerans)";
        else if (vetoFlags.hasLegalVeto) vetoReason = "Aşırı Yasal Risk (Sıfır Tolerans)";

        capping = {
            triggered: true,
            reason: vetoReason,
            cappedFrom: scoreBeforeCapping,
            cappedTo: 0 // FATALITY
        };
    }

    const finalScore = capping.triggered
      ? Math.min(scoreBeforeCapping, capping.cappedTo ?? scoreBeforeCapping)
      : scoreBeforeCapping;

    const scaleEntry = this.resolveGrade(finalScore);

    return {
      baseScore,
      totalDeductions,
      scoreBeforeCapping,
      finalScore,
      finalGrade: scaleEntry.grade,
      assuranceOpinion: scaleEntry.opinion,
      assuranceLabel: scaleEntry.label,
      capping,
      waterfall,
      counts,
    };
  }

  private buildWaterfall(counts: FindingSeverityCounts, baseScore: number): DeductionStep[] {
    const { deductions } = this.rules;
    const steps: DeductionStep[] = [];
    let running = baseScore;

    const severities: { key: keyof FindingSeverityCounts; label: string; points: number }[] = [
      { key: 'count_critical', label: 'Kritik', points: deductions.critical },
      { key: 'count_high', label: 'Yüksek', points: deductions.high },
      { key: 'count_medium', label: 'Orta', points: deductions.medium },
      { key: 'count_low', label: 'Düşük', points: deductions.low },
    ];

    for (const { key, label, points } of severities) {
      const count = counts[key];
      if (count > 0) {
        const totalDeduction = count * points;
        running = Math.max(0, running - totalDeduction);
        steps.push({
          severity: label,
          count,
          pointsEach: points,
          totalDeduction,
          runningScore: running,
        });
      }
    }

    return steps;
  }

  private applyCapping(counts: FindingSeverityCounts, currentScore: number): CappingResult {
    let lowestCap = Infinity;
    let activeReason: string | null = null;

    for (const rule of this.rules.capping) {
      if (this.evaluateCappingRule(rule, counts) && rule.max_score < lowestCap) {
        lowestCap = rule.max_score;
        activeReason = rule.reason;
      }
    }

    if (lowestCap < Infinity && currentScore > lowestCap) {
      return {
        triggered: true,
        reason: activeReason,
        cappedFrom: currentScore,
        cappedTo: lowestCap,
      };
    }

    return { triggered: false, reason: null, cappedFrom: null, cappedTo: null };
  }

  private evaluateCappingRule(rule: CappingRule, counts: FindingSeverityCounts): boolean {
    const fieldValue = (counts as Record<string, number>)[rule.field] ?? 0;

    switch (rule.operator) {
      case '>=': return fieldValue >= rule.value;
      case '>':  return fieldValue > rule.value;
      case '<=': return fieldValue <= rule.value;
      case '<':  return fieldValue < rule.value;
      case '==': return fieldValue === rule.value;
      case '!=': return fieldValue !== rule.value;
      default:   return false;
    }
  }

  private resolveGrade(score: number): { grade: string; opinion: string; label: string } {
    const sorted = [...this.rules.scale].sort((a, b) => b.min - a.min);
    for (const entry of sorted) {
      if (score >= entry.min && score <= entry.max) {
        return { grade: entry.grade, opinion: entry.opinion, label: entry.label };
      }
    }
    const last = sorted[sorted.length - 1];
    return last
      ? { grade: last.grade, opinion: last.opinion, label: last.label }
      : { grade: 'F', opinion: 'GUVENCE_YOK', label: 'Güvence Yok' };
  }
}