import jsonLogic from 'json-logic-js';
import type {
  MethodologyConfig,
  FindingRiskInput,
  RiskCalculationResult,
  SeverityThreshold,
  VetoRule,
} from './methodology-types';

const ASSET_MULTIPLIERS: Record<string, number> = {
  Critical: 1.3,
  CRITICAL: 1.3,
  Major: 1.0,
  MAJOR: 1.0,
  Minor: 0.7,
  MINOR: 0.7,
};

export class RiskEngine {
  private config: MethodologyConfig;

  constructor(config: MethodologyConfig) {
    this.config = config;
  }

  calculate(finding: FindingRiskInput): RiskCalculationResult {
    const { risk_weights, scoring_matrix, severity_thresholds, veto_rules } = this.config;
    const maxImpact = scoring_matrix.impact_max || 5;
    const maxLikelihood = scoring_matrix.likelihood_max || 5;
    const maxControl = scoring_matrix.control_effectiveness_max || 5;

    const weightedImpact =
      (finding.impact_financial / maxImpact) * risk_weights.financial +
      (finding.impact_legal / maxImpact) * risk_weights.legal +
      (finding.impact_reputation / maxImpact) * risk_weights.reputation +
      (finding.impact_operational / maxImpact) * risk_weights.operational;

    const likelihoodFactor = finding.likelihood_score / maxLikelihood;
    const controlReduction = finding.control_effectiveness / maxControl;
    const assetMultiplier = ASSET_MULTIPLIERS[finding.asset_criticality] ?? 1.0;
    const rawScore = weightedImpact * likelihoodFactor * (1 - controlReduction * 0.5) * assetMultiplier * 100;

    let score = Math.min(100, Math.max(0, Number(rawScore.toFixed(2))));
    let vetoTriggered = false;
    let vetoReason: string | null = null;
    let vetoSource: 'jsonlogic' | 'legacy' | null = null;

    const jsonLogicResult = this.evaluateJsonLogicVeto(finding);
    if (jsonLogicResult) {
      score = jsonLogicResult.score;
      vetoTriggered = true;
      vetoReason = jsonLogicResult.reason;
      vetoSource = 'jsonlogic';
    } else {
      for (const rule of veto_rules) {
        if (this.evaluateLegacyVeto(rule, finding)) {
          score = 100;
          vetoTriggered = true;
          vetoReason = rule.reason;
          vetoSource = 'legacy';
          break;
        }
      }
    }

    const threshold = this.classifyScore(score, severity_thresholds);
    const severityLabel = threshold?.label ?? 'Bilinmiyor';
    const sla = this.config.sla_config?.[severityLabel] ?? null;
    const purificationAmount = finding.shariah_vector?.purification_amt ?? 0;

    return {
      score,
      severity: severityLabel,
      color: threshold?.color ?? '#94a3b8',
      vetoTriggered,
      vetoReason,
      vetoSource,
      sla,
      purificationAmount,
      breakdown: {
        weightedImpact: Number(weightedImpact.toFixed(4)),
        likelihoodFactor: Number(likelihoodFactor.toFixed(4)),
        controlReduction: Number(controlReduction.toFixed(4)),
        rawScore: Number(rawScore.toFixed(2)),
        assetMultiplier,
      },
    };
  }

  private evaluateJsonLogicVeto(finding: FindingRiskInput): { score: number; reason: string } | null {
    const { veto_logic } = this.config;
    if (!veto_logic) return null;

    const evalContext = {
      ...finding,
      shariah_vector: finding.shariah_vector ?? { status: 'HALAL', purification_amt: 0, fatwa_ref: '' },
      cyber_vector: finding.cyber_vector ?? { cvss_vector: '', cvss_score: finding.cvss_score ?? 0, asset_criticality: 'MINOR' },
      financial_vector: finding.financial_vector ?? { loss_amount: 0, impact_percent_equity: 0 },
    };

    try {
      const result = jsonLogic.apply(veto_logic as Record<string, unknown>, evalContext);
      if (result !== null && result !== undefined && typeof result === 'number') {
        return {
          score: Math.min(100, Math.max(0, result)),
          reason: this.detectVetoReason(evalContext),
        };
      }
    } catch {
      // JsonLogic evaluation failed, fall through to legacy
    }

    return null;
  }

  private detectVetoReason(ctx: Record<string, unknown>): string {
    const shariah = ctx.shariah_vector as { status?: string } | undefined;
    if (shariah?.status === 'BATIL') return "Ser'i Uyum Ihlali (BATIL)";

    const cyber = ctx.cyber_vector as { cvss_score?: number; asset_criticality?: string } | undefined;
    if (cyber && (cyber.cvss_score ?? 0) >= 9.0 && cyber.asset_criticality === 'CRITICAL') {
      return 'Kritik Siber Zafiyet (CVSS >= 9.0)';
    }

    return 'JsonLogic Veto';
  }

  private evaluateLegacyVeto(rule: VetoRule, finding: FindingRiskInput): boolean {
    const fieldValue = (finding as Record<string, unknown>)[rule.field];
    if (fieldValue === null || fieldValue === undefined) return false;
    const val = Number(fieldValue);
    if (isNaN(val)) return false;

    switch (rule.operator) {
      case '>=': return val >= rule.value;
      case '>':  return val > rule.value;
      case '<=': return val <= rule.value;
      case '<':  return val < rule.value;
      case '==': return val === rule.value;
      case '!=': return val !== rule.value;
      default:   return false;
    }
  }

  private classifyScore(score: number, thresholds: SeverityThreshold[]): SeverityThreshold | null {
    const sorted = [...thresholds].sort((a, b) => b.min - a.min);
    for (const t of sorted) {
      if (score >= t.min && score <= t.max) return t;
    }
    return sorted[sorted.length - 1] ?? null;
  }
}
