import type { AuditEntity } from '@/entities/universe/model/types';

export interface RiskSignal {
  source: string;
  impact: number;
  reason: string;
}

export interface DynamicRiskResult {
  base_score: number;
  calculated_score: number;
  signals: RiskSignal[];
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  display_text: string;
}

export function calculateDynamicRisk(entity: AuditEntity): DynamicRiskResult {
  const signals: RiskSignal[] = [];
  let base_score = entity.risk_score || 50;
  let total_adjustment = 0;

  // BRANCH SIGNALS
  if (entity.type === 'BRANCH') {
    const turnover = entity.metadata?.turnover_rate;
    if (turnover && turnover > 20) {
      const impact = Math.min(30, (turnover - 20) * 2);
      signals.push({
        source: 'Personel Devir Oranı',
        impact,
        reason: `${turnover}% personel devri (>20% kritik)`,
      });
      total_adjustment += impact;
    }

    const volume = entity.metadata?.transaction_volume;
    if (volume && volume > 10000000) {
      signals.push({
        source: 'İşlem Hacmi',
        impact: 15,
        reason: `Yüksek işlem hacmi (${(volume / 1000000).toFixed(1)}M TL)`,
      });
      total_adjustment += 15;
    }
  }

  // IT ASSET SIGNALS
  if (entity.type === 'IT_ASSET') {
    const criticality = entity.metadata?.criticality_level;
    if (criticality === 'CRITICAL') {
      signals.push({
        source: 'Kritiklik Seviyesi',
        impact: 25,
        reason: 'Kritik BT varlığı',
      });
      total_adjustment += 25;
    }

    const lastPatch = entity.metadata?.last_patch_date;
    if (lastPatch) {
      const daysSincePatch = Math.floor(
        (new Date().getTime() - new Date(lastPatch).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSincePatch > 90) {
        const impact = Math.min(40, Math.floor(daysSincePatch / 30) * 10);
        signals.push({
          source: 'Yama Güncelliği',
          impact,
          reason: `${daysSincePatch} gündür yamanmamış (>90 gün kritik)`,
        });
        total_adjustment += impact;
      }
    }
  }

  // VENDOR SIGNALS
  if (entity.type === 'VENDOR') {
    const contractStatus = entity.metadata?.contract_status;
    if (contractStatus === 'EXPIRED') {
      signals.push({
        source: 'Sözleşme Durumu',
        impact: 50,
        reason: 'Sözleşme süresi dolmuş',
      });
      total_adjustment += 50;
    }

    const riskRating = entity.metadata?.risk_rating;
    if (riskRating === 'HIGH' || riskRating === 'CRITICAL') {
      signals.push({
        source: 'Tedarikçi Risk Notu',
        impact: 20,
        reason: `${riskRating} seviye tedarikçi riski`,
      });
      total_adjustment += 20;
    }

    const spend = entity.metadata?.annual_spend;
    if (spend && spend > 1000000) {
      signals.push({
        source: 'Yıllık Harcama',
        impact: 10,
        reason: `Yüksek bütçe (${(spend / 1000000).toFixed(1)}M TL)`,
      });
      total_adjustment += 10;
    }
  }

  // SUBSIDIARY SIGNALS
  if (entity.type === 'SUBSIDIARY') {
    const ownership = entity.metadata?.ownership_percentage;
    if (ownership && ownership < 51) {
      signals.push({
        source: 'Kontrol Seviyesi',
        impact: 15,
        reason: `Düşük sahiplik oranı (%${ownership})`,
      });
      total_adjustment += 15;
    }
  }

  const calculated_score = Math.min(100, Math.max(0, base_score + total_adjustment));

  let level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  if (calculated_score >= 80) level = 'CRITICAL';
  else if (calculated_score >= 60) level = 'HIGH';
  else if (calculated_score >= 40) level = 'MEDIUM';
  else level = 'LOW';

  const display_text = signals.length > 0
    ? `${calculated_score} (${signals[0].reason})`
    : `${calculated_score}`;

  return {
    base_score,
    calculated_score,
    signals,
    level,
    display_text,
  };
}

export function getRiskColor(level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'): string {
  switch (level) {
    case 'CRITICAL':
      return 'text-red-700 bg-red-100';
    case 'HIGH':
      return 'text-orange-700 bg-orange-100';
    case 'MEDIUM':
      return 'text-yellow-700 bg-yellow-100';
    case 'LOW':
      return 'text-green-700 bg-green-100';
  }
}

export function getTypeColor(type: string): { bg: string; text: string; icon: string } {
  switch (type) {
    case 'BRANCH':
    case 'HEADQUARTERS':
    case 'DEPARTMENT':
    case 'UNIT':
      return { bg: 'bg-blue-100', text: 'text-blue-700', icon: '🏢' };
    case 'IT_ASSET':
      return { bg: 'bg-purple-100', text: 'text-purple-700', icon: '💻' };
    case 'VENDOR':
      return { bg: 'bg-orange-100', text: 'text-orange-700', icon: '🚚' };
    case 'PROCESS':
      return { bg: 'bg-gray-100', text: 'text-gray-700', icon: '⚙️' };
    case 'SUBSIDIARY':
      return { bg: 'bg-indigo-100', text: 'text-indigo-700', icon: '🏛️' };
    default:
      return { bg: 'bg-slate-100', text: 'text-slate-700', icon: '📦' };
  }
}
