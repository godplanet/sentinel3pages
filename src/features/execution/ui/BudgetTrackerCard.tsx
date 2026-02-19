import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Flame,
  User,
  ChevronDown,
  ChevronUp,
  Activity,
} from 'lucide-react';
import type { BudgetSummary } from '../time-tracking';

export interface AuditorCostEntry {
  id: string;
  name: string;
  title: string;
  hoursLogged: number;
  hourlyRate: number;
}

export interface CostEngineProps {
  budget: BudgetSummary;
  auditorCosts?: AuditorCostEntry[];
  allocatedBudgetOverride?: number;
  currency?: string;
}

const DEFAULT_AUDITORS: AuditorCostEntry[] = [
  { id: 'a1', name: 'Hilmi Duru',       title: 'Lead Auditor',    hoursLogged: 42,  hourlyRate: 200 },
  { id: 'a2', name: 'Ayşe Kaya',        title: 'Senior Analyst',  hoursLogged: 38,  hourlyRate: 150 },
  { id: 'a3', name: 'Emre Şahin',       title: 'Analyst',         hoursLogged: 29,  hourlyRate: 120 },
  { id: 'a4', name: 'Zeynep Arslan',    title: 'Associate',       hoursLogged: 18,  hourlyRate: 90  },
];

function formatCurrency(value: number, currency = 'USD'): string {
  if (currency === 'TRY') {
    return `₺${value.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}`;
  }
  return `$${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

function AnimatedNumber({ value, currency }: { value: number; currency: string }) {
  const [displayed, setDisplayed] = useState(0);
  const animRef = useRef<ReturnType<typeof requestAnimationFrame>>();

  useEffect(() => {
    const start = displayed;
    const end = value;
    const duration = 900;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(start + (end - start) * eased));
      if (progress < 1) animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [value]);

  return <>{formatCurrency(displayed, currency)}</>;
}

export function BudgetTrackerCard({
  budget,
  auditorCosts = DEFAULT_AUDITORS,
  allocatedBudgetOverride,
  currency = 'USD',
}: CostEngineProps) {
  const [expanded, setExpanded] = useState(false);

  const totalBurn = auditorCosts.reduce(
    (sum, a) => sum + a.hoursLogged * a.hourlyRate,
    0,
  );

  const avgHourlyRate =
    auditorCosts.length > 0
      ? auditorCosts.reduce((sum, a) => sum + a.hourlyRate, 0) / auditorCosts.length
      : 150;

  const allocatedBudget =
    allocatedBudgetOverride ?? budget.estimated_hours * avgHourlyRate;

  const burnPercent = allocatedBudget > 0
    ? Math.min((totalBurn / allocatedBudget) * 100, 200)
    : 0;

  const isOverBudget  = burnPercent >= 100;
  const isWarning     = burnPercent >= 80 && !isOverBudget;
  const isHealthy     = burnPercent < 80;

  const barColor = isOverBudget
    ? 'from-red-600 to-rose-500'
    : isWarning
    ? 'from-amber-500 to-orange-400'
    : 'from-emerald-600 to-teal-400';

  const glowClass = isOverBudget
    ? 'shadow-red-500/20'
    : isWarning
    ? 'shadow-amber-500/20'
    : 'shadow-emerald-500/10';

  const borderClass = isOverBudget
    ? 'border-red-500/40'
    : isWarning
    ? 'border-amber-500/30'
    : 'border-white/10';

  const totalHoursLogged = auditorCosts.reduce((s, a) => s + a.hoursLogged, 0);
  const burnRatePerHour  = totalHoursLogged > 0
    ? totalBurn / totalHoursLogged
    : avgHourlyRate;

  return (
    <motion.div
      layout
      className={`
        relative rounded-2xl border backdrop-blur-xl overflow-hidden
        bg-slate-900/80 shadow-2xl ${glowClass} ${borderClass}
        transition-all duration-500
      `}
    >
      {isOverBudget && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2.5 px-5 py-2.5 bg-red-500/15 border-b border-red-500/30"
        >
          <Flame className="w-4 h-4 text-red-400 animate-pulse flex-shrink-0" />
          <span className="text-xs font-mono font-bold tracking-widest text-red-400 uppercase">
            ⚠ BUDGET OVERRUN — Immediate Escalation Required
          </span>
        </motion.div>
      )}

      {isWarning && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2.5 px-5 py-2 bg-amber-500/10 border-b border-amber-500/25"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
          <span className="text-[11px] font-mono font-semibold tracking-wider text-amber-400 uppercase">
            Burn Rate Warning — {Math.round(burnPercent)}% of budget consumed
          </span>
        </motion.div>
      )}

      <div className="p-5">
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <Activity className="w-4 h-4 text-slate-400" />
              <span className="text-[10px] font-mono font-semibold uppercase tracking-widest text-slate-400">
                Cost Engine
              </span>
            </div>
            <h3 className="text-sm font-semibold text-white leading-tight truncate max-w-[200px]">
              {budget.title}
            </h3>
          </div>

          <div
            className={`
              flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest border
              ${isOverBudget
                ? 'bg-red-500/20 border-red-500/40 text-red-300'
                : isWarning
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'}
            `}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isOverBudget ? 'bg-red-400 animate-ping' : isWarning ? 'bg-amber-400' : 'bg-emerald-400'
              }`}
            />
            {isOverBudget ? 'Overrun' : isWarning ? 'Warning' : 'Healthy'}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="rounded-xl bg-slate-800/60 border border-white/6 p-3">
            <p className="text-[9px] text-slate-500 uppercase tracking-widest font-mono mb-1">
              Allocated Budget
            </p>
            <p className="text-lg font-black text-white font-mono leading-none">
              <AnimatedNumber value={allocatedBudget} currency={currency} />
            </p>
            <p className="text-[9px] text-slate-500 mt-0.5">
              {budget.estimated_hours}h × avg {formatCurrency(avgHourlyRate, currency)}/h
            </p>
          </div>

          <div
            className={`
              rounded-xl border p-3
              ${isOverBudget
                ? 'bg-red-500/10 border-red-500/25'
                : isWarning
                ? 'bg-amber-500/10 border-amber-500/25'
                : 'bg-slate-800/60 border-white/6'}
            `}
          >
            <p className="text-[9px] text-slate-500 uppercase tracking-widest font-mono mb-1">
              Current Burn
            </p>
            <p
              className={`text-lg font-black font-mono leading-none ${
                isOverBudget ? 'text-red-300' : isWarning ? 'text-amber-300' : 'text-white'
              }`}
            >
              <AnimatedNumber value={totalBurn} currency={currency} />
            </p>
            <p className="text-[9px] text-slate-500 mt-0.5">
              {totalHoursLogged}h logged
            </p>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">
              Burn Rate
            </span>
            <span
              className={`text-xs font-black font-mono ${
                isOverBudget ? 'text-red-300' : isWarning ? 'text-amber-300' : 'text-emerald-300'
              }`}
            >
              {Math.round(burnPercent)}%
            </span>
          </div>

          <div className="h-3 rounded-full bg-slate-800 overflow-hidden relative">
            <motion.div
              className={`h-full rounded-full bg-gradient-to-r ${barColor} relative`}
              initial={{ width: '0%' }}
              animate={{ width: `${Math.min(burnPercent, 100)}%` }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            >
              {(isOverBudget || isWarning) && (
                <div
                  className={`absolute inset-0 rounded-full bg-gradient-to-r ${barColor} blur-sm opacity-60`}
                />
              )}
            </motion.div>

            {burnPercent > 100 && (
              <motion.div
                className="absolute top-0 right-0 bottom-0 w-px bg-red-400"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
            )}
          </div>

          <div className="flex justify-between mt-1">
            <span className="text-[9px] text-slate-600 font-mono">$0</span>
            <span className="text-[9px] text-slate-500 font-mono">
              80% = {formatCurrency(allocatedBudget * 0.8, currency)}
            </span>
            <span className="text-[9px] text-slate-600 font-mono">
              {formatCurrency(allocatedBudget, currency)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg bg-slate-800/40 border border-white/6 px-3 py-2 mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className={`w-3.5 h-3.5 ${isOverBudget ? 'text-red-400' : 'text-slate-400'}`} />
            <span className="text-[10px] text-slate-400 font-mono">Burn Rate / Hour</span>
          </div>
          <span
            className={`text-xs font-black font-mono ${
              isOverBudget ? 'text-red-300' : isWarning ? 'text-amber-300' : 'text-slate-200'
            }`}
          >
            {formatCurrency(burnRatePerHour, currency)}/h
          </span>
        </div>

        <button
          onClick={() => setExpanded((v) => !v)}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-slate-800/40 border border-white/6 hover:bg-slate-700/40 transition-colors text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-widest"
        >
          <div className="flex items-center gap-1.5">
            <User className="w-3 h-3" />
            Auditor Breakdown ({auditorCosts.length})
          </div>
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="pt-2 space-y-1.5">
                {auditorCosts.map((auditor) => {
                  const cost = auditor.hoursLogged * auditor.hourlyRate;
                  const share = totalBurn > 0 ? (cost / totalBurn) * 100 : 0;
                  return (
                    <div
                      key={auditor.id}
                      className="rounded-lg bg-slate-800/50 border border-white/5 px-3 py-2"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-[8px] font-bold text-slate-300">
                            {auditor.name.split(' ').map((n) => n[0]).join('')}
                          </div>
                          <div>
                            <p className="text-[10px] font-semibold text-slate-200 leading-none">{auditor.name}</p>
                            <p className="text-[9px] text-slate-500">{auditor.title}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-black font-mono text-slate-200">
                            {formatCurrency(cost, currency)}
                          </p>
                          <p className="text-[9px] text-slate-500 font-mono">
                            {auditor.hoursLogged}h × {formatCurrency(auditor.hourlyRate, currency)}
                          </p>
                        </div>
                      </div>
                      <div className="h-1 rounded-full bg-slate-700 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-sky-500/60"
                          style={{ width: `${share}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {(isOverBudget || isWarning) && (
        <div
          className={`
            absolute inset-0 rounded-2xl pointer-events-none
            ${isOverBudget
              ? 'shadow-[inset_0_0_40px_rgba(239,68,68,0.08)]'
              : 'shadow-[inset_0_0_40px_rgba(245,158,11,0.06)]'}
          `}
        />
      )}
    </motion.div>
  );
}
