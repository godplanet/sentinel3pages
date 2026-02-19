import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ShieldX,
  ShieldCheck,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Brain,
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { DraftEngagement } from '@/entities/planning/model/types';
import {
  evaluateAssignment,
  type AuditorProfile,
  type AssessmentResult,
} from '../lib/ResourceAllocator';

interface IronGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  draftEngagement: DraftEngagement;
  onAssigned?: (auditorId: string, auditorName: string) => void;
}

function buildDemoRoster(requiredSkills: string[]): AuditorProfile[] {
  return [
    {
      id: 'aud-alpha',
      name: 'Zeynep Kaya',
      fatigueScore: 42,
      skills: [...requiredSkills, 'Risk Management', 'CISA', 'Data Analytics'],
    },
    {
      id: 'aud-beta',
      name: 'Mehmet Demir',
      fatigueScore: 90,
      skills: [...requiredSkills, 'Compliance'],
    },
    {
      id: 'aud-gamma',
      name: 'Ali Yilmaz',
      fatigueScore: 61,
      skills: ['General Audit', 'Documentation', 'Interview'],
    },
  ];
}

function FatigueGauge({ score }: { score: number }) {
  const clamped = Math.min(100, Math.max(0, score));
  const isHot = clamped > 85;
  const isWarm = clamped > 65;
  const barColor = isHot ? 'bg-red-500' : isWarm ? 'bg-amber-400' : 'bg-emerald-400';
  const textColor = isHot ? 'text-red-400' : isWarm ? 'text-amber-400' : 'text-emerald-400';

  return (
    <div className="flex items-center gap-2 w-full">
      <Zap size={10} className={textColor} />
      <div className="flex-1 h-1.5 bg-slate-700/70 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={`h-full rounded-full ${barColor}`}
        />
      </div>
      <span className={`text-[11px] font-bold tabular-nums w-8 text-right ${textColor}`}>
        {score}%
      </span>
    </div>
  );
}

function IronGateBadge({ result }: { result: AssessmentResult }) {
  if (result.isAllowed) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/15 border border-emerald-500/35 rounded-lg">
        <ShieldCheck size={11} className="text-emerald-400" />
        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wide">UYGUN</span>
      </div>
    );
  }

  if (result.blockReason === 'FATIGUE_CRITICAL') {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-500/20 border border-red-500/50 rounded-lg">
        <Lock size={11} className="text-red-400" />
        <span className="text-[10px] font-bold text-red-400 uppercase tracking-wide">
          ENGEL: YORGUNLUK {result.fatigueScore}%
        </span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-orange-500/20 border border-orange-500/50 rounded-lg">
      <Lock size={11} className="text-orange-400" />
      <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wide">
        ENGEL: YETKİNLİK EKSİK
      </span>
    </div>
  );
}

function AuditorRow({
  auditor,
  result,
  requiredSkills,
  isSelected,
  onSelect,
}: {
  auditor: AuditorProfile;
  result: AssessmentResult;
  requiredSkills: string[];
  isSelected: boolean;
  onSelect: () => void;
}) {
  const isBlocked = !result.isAllowed;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        rounded-xl border transition-all duration-200 overflow-hidden
        ${isBlocked
          ? 'border-red-500/20 bg-red-950/15 opacity-80'
          : isSelected
            ? 'border-blue-500/60 bg-blue-500/10 shadow-[0_0_18px_rgba(59,130,246,0.12)]'
            : 'border-slate-700/50 bg-slate-800/40 hover:border-slate-600/70 hover:bg-slate-800/60'}
      `}
    >
      <button
        type="button"
        disabled={isBlocked}
        onClick={onSelect}
        className="w-full text-left p-4 disabled:cursor-not-allowed"
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className={`
              w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 border
              ${isBlocked
                ? 'bg-red-500/15 text-red-400 border-red-500/25'
                : isSelected
                  ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                  : 'bg-slate-700/50 text-slate-300 border-slate-600/40'}
            `}>
              {auditor.name.split(' ').map((n) => n[0]).join('')}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-100 leading-tight">{auditor.name}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Kıdemli Denetçi</p>
            </div>
          </div>
          <IronGateBadge result={result} />
        </div>

        <FatigueGauge score={auditor.fatigueScore} />

        <div className="flex flex-wrap gap-1 mt-3">
          {auditor.skills.map((sk) => {
            const matched = requiredSkills.some(
              (r) =>
                r.toLowerCase().includes(sk.toLowerCase()) ||
                sk.toLowerCase().includes(r.toLowerCase()),
            );
            return (
              <span
                key={sk}
                className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium border
                  ${matched
                    ? 'bg-emerald-500/12 text-emerald-300 border-emerald-500/25'
                    : 'bg-slate-700/50 text-slate-400 border-slate-600/35'}
                `}
              >
                {sk}
              </span>
            );
          })}
        </div>

        {isBlocked && (
          <div className="mt-3 space-y-1.5">
            {result.blockReason === 'FATIGUE_CRITICAL' && (
              <div className="flex items-start gap-2 p-2.5 bg-red-500/10 border border-red-500/20 rounded-lg">
                <AlertTriangle size={11} className="text-red-400 mt-0.5 flex-shrink-0" />
                <p className="text-[10px] text-red-300/90 leading-relaxed">
                  GIAS 2024 — Yorgunluk skoru kritik eşiği ({result.fatigueScore}% &gt; 85%) aşıyor. Bu denetçi atama yapılamaz.
                </p>
              </div>
            )}
            {result.blockReason === 'SKILL_GAP' && result.missingSkills.length > 0 && (
              <div className="flex items-start gap-2 p-2.5 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                <ShieldX size={11} className="text-orange-400 mt-0.5 flex-shrink-0" />
                <p className="text-[10px] text-orange-300/90 leading-relaxed">
                  GIAS 2024 — Eksik yetkinlik:{' '}
                  <span className="font-bold">{result.missingSkills.join(', ')}</span>
                </p>
              </div>
            )}
          </div>
        )}
      </button>
    </motion.div>
  );
}

export function IronGateModal({
  isOpen,
  onClose,
  draftEngagement,
  onAssigned,
}: IronGateModalProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const roster = useMemo(
    () => buildDemoRoster(draftEngagement.requiredSkills),
    [draftEngagement.requiredSkills],
  );

  const assessments = useMemo((): Map<string, AssessmentResult> => {
    const map = new Map<string, AssessmentResult>();
    for (const aud of roster) {
      map.set(aud.id, evaluateAssignment(aud, draftEngagement.requiredSkills));
    }
    return map;
  }, [roster, draftEngagement.requiredSkills]);

  const selectedResult = selectedId ? assessments.get(selectedId) ?? null : null;
  const canAssign = !!selectedId && selectedResult?.isAllowed === true;

  const handleConfirm = () => {
    if (!canAssign || !selectedId) return;
    const auditor = roster.find((a) => a.id === selectedId);
    if (!auditor) return;
    onAssigned?.(auditor.id, auditor.name);
    toast.success(`${auditor.name} atandı — ${draftEngagement.universeNodeName}`, {
      icon: '✅',
      style: { background: '#1e293b', color: '#e2e8f0', border: '1px solid #334155' },
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          key="panel"
          initial={{ scale: 0.94, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.94, y: 20, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 340, damping: 30 }}
          className="bg-slate-900 border border-slate-700/70 rounded-2xl shadow-2xl w-full max-w-[520px] flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-5 py-4 border-b border-slate-700/50 bg-gradient-to-r from-slate-800 to-slate-900">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-blue-500/20 border border-blue-500/35 flex items-center justify-center">
                  <Brain size={14} className="text-blue-400" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-100 leading-tight">
                    Demir Kapı — GIAS 2024 Kaynak Atama
                  </h2>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {draftEngagement.universeNodeName}
                    {' · '}Risk:{' '}
                    <span className={`font-bold ${draftEngagement.cascadeRisk > 70 ? 'text-red-400' : draftEngagement.cascadeRisk > 40 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {draftEngagement.cascadeRisk.toFixed(1)}
                    </span>
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-lg bg-slate-700/60 hover:bg-slate-600 flex items-center justify-center transition-colors"
              >
                <X size={13} className="text-slate-400" />
              </button>
            </div>

            <div className="flex items-center gap-1.5 mt-3">
              <span className="text-[10px] text-slate-500 font-medium">Gerekli yetkinlik:</span>
              {draftEngagement.requiredSkills.map((sk) => (
                <span
                  key={sk}
                  className="px-2 py-0.5 bg-blue-500/15 border border-blue-500/30 text-blue-300 text-[10px] font-semibold rounded-md"
                >
                  {sk}
                </span>
              ))}
            </div>
          </div>

          <div className="p-4 space-y-2.5 overflow-auto max-h-[440px]">
            {roster.map((auditor) => (
              <AuditorRow
                key={auditor.id}
                auditor={auditor}
                result={assessments.get(auditor.id)!}
                requiredSkills={draftEngagement.requiredSkills}
                isSelected={selectedId === auditor.id}
                onSelect={() =>
                  setSelectedId((prev) => (prev === auditor.id ? null : auditor.id))
                }
              />
            ))}
          </div>

          <div className="px-5 py-3.5 border-t border-slate-700/50 bg-slate-900/80 flex items-center justify-between gap-3">
            <p className="text-[11px] text-slate-500 leading-tight">
              {canAssign
                ? `Seçili: ${roster.find((a) => a.id === selectedId)?.name}`
                : selectedId && !canAssign
                  ? 'GIAS 2024 kurallarına göre bu denetçi atanamaz'
                  : 'Uygun bir denetçi seçin'}
            </p>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={onClose}
                className="px-4 py-2 text-[12px] text-slate-400 bg-slate-800 border border-slate-700/60 rounded-lg hover:bg-slate-700 transition-colors font-medium"
              >
                İptal
              </button>
              <button
                onClick={handleConfirm}
                disabled={!canAssign}
                className={`
                  flex items-center gap-1.5 px-5 py-2 rounded-lg text-[12px] font-bold transition-all
                  ${canAssign
                    ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-[0_0_14px_rgba(59,130,246,0.28)] hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]'
                    : 'bg-slate-700/60 text-slate-500 cursor-not-allowed'}
                `}
              >
                <CheckCircle2 size={13} />
                Atamayı Onayla
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
