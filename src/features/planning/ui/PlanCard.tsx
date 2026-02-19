import { ArrowRight, Leaf, ShieldCheck, TrendingUp, TrendingDown, Minus, Zap } from 'lucide-react';
import type { DraftEngagement, RiskVelocity } from '@/entities/planning/model/types';
import { usePlanningStore } from '@/entities/planning/model/store';

interface PlanCardProps {
  engagement: DraftEngagement;
  isBacklog?: boolean;
}

const riskLabel = (score: number) => {
  if (score >= 75) return { label: 'Kritik', className: 'bg-red-50 text-red-700 border border-red-200' };
  if (score >= 50) return { label: 'Yüksek', className: 'bg-amber-50 text-amber-700 border border-amber-200' };
  return { label: 'Orta', className: 'bg-blue-50 text-blue-700 border border-blue-200' };
};

const velocityConfig: Record<RiskVelocity, { icon: typeof TrendingUp; label: string; className: string }> = {
  HIGH: { icon: TrendingUp, label: 'Hızlı', className: 'bg-rose-50 text-rose-700 border border-rose-200' },
  MEDIUM: { icon: Minus, label: 'Sabit', className: 'bg-slate-100 text-slate-600 border border-slate-200' },
  LOW: { icon: TrendingDown, label: 'Yavaş', className: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
};

export function PlanCard({ engagement, isBacklog = false }: PlanCardProps) {
  const pullToSprint = usePlanningStore((s) => s.pullToSprint);

  const risk = riskLabel(engagement.baseRisk);
  const vel = velocityConfig[engagement.velocity];
  const VelIcon = vel.icon;
  const isCCM = engagement.isCCMTriggered === true;

  return (
    <div
      className={[
        'bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-4 flex flex-col gap-3',
        isCCM
          ? 'border-2 border-red-400/60 ring-2 ring-red-300/40 animate-pulse'
          : 'border border-slate-200/80',
      ].join(' ')}
    >
      {isCCM && (
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-red-50 border border-red-200 rounded-lg">
          <Zap size={12} className="text-red-500 shrink-0" />
          <span className="text-xs font-bold text-red-700 leading-none">
            KCI Breach — Auto-Triggered
          </span>
        </div>
      )}

      <div className="flex items-start justify-between gap-2">
        <h3 className={`text-sm font-semibold leading-snug flex-1 ${isCCM ? 'text-red-900' : 'text-slate-800'}`}>
          {engagement.universeNodeName}
        </h3>
        <span className="text-xs font-bold text-slate-500 tabular-nums shrink-0">
          #{engagement.baseRisk}
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${risk.className}`}>
          Risk: {risk.label}
        </span>

        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${vel.className}`}>
          <VelIcon size={10} />
          V: {vel.label}
        </span>

        {engagement.shariah && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-teal-50 text-teal-700 border border-teal-200">
            <ShieldCheck size={10} />
            Şer. Uyum
          </span>
        )}

        {engagement.esg && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
            <Leaf size={10} />
            ESG
          </span>
        )}
      </div>

      {engagement.requiredSkills.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {engagement.requiredSkills.slice(0, 3).map((skill) => (
            <span key={skill} className="text-xs text-slate-500 bg-slate-50 border border-slate-100 rounded px-1.5 py-0.5">
              {skill}
            </span>
          ))}
          {engagement.requiredSkills.length > 3 && (
            <span className="text-xs text-slate-400">+{engagement.requiredSkills.length - 3}</span>
          )}
        </div>
      )}

      {isBacklog && (
        <button
          onClick={() => pullToSprint(engagement.id)}
          className="mt-1 w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100 hover:border-blue-300 transition-colors duration-150"
        >
          Q-Sprint'e Al
          <ArrowRight size={13} />
        </button>
      )}
    </div>
  );
}
