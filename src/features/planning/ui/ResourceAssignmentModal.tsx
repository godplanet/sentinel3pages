import { useState } from 'react';
import { X, User, CheckCircle2, Sparkles, AlertTriangle, ChevronDown, ChevronUp, Loader2, Star } from 'lucide-react';
import { usePlanningStore } from '@/entities/planning/model/store';
import { MOCK_AUDITORS, type Auditor } from '@/entities/planning/api/mock-data';
import type { AuditEngagement } from '@/entities/planning/model/types';
import { fetchProfilesWithSkills } from '@/features/talent-os/api';
import { suggestAuditors, type AllocationResult } from '@/features/planning/lib/ResourceAllocator';

interface ResourceAssignmentModalProps {
  engagement: AuditEngagement;
  onClose: () => void;
}

const ENGAGEMENT_SKILLS: Record<string, string[]> = {
  COMPREHENSIVE: ['RISK_ASSESSMENT', 'CONTROL_TESTING', 'REPORT_WRITING', 'DATA_ANALYTICS'],
  TARGETED: ['CONTROL_TESTING', 'IT_AUDIT', 'DATA_ANALYTICS'],
  FOLLOW_UP: ['REPORT_WRITING', 'INTERVIEW_TECHNIQUE'],
};

function FitScoreBadge({ score }: { score: number }) {
  const color = score >= 70 ? 'text-emerald-600 bg-emerald-50 border-emerald-200'
    : score >= 45 ? 'text-amber-600 bg-amber-50 border-amber-200'
    : 'text-rose-600 bg-rose-50 border-rose-200';
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-bold ${color}`}>
      <Star size={9} />
      {score}%
    </span>
  );
}

function SuggestionCard({ result, rank }: { result: AllocationResult; rank: number }) {
  const { auditor, matchScore, matchedSkills, missingSkills, blocked, blockReason } = result;
  const isBestMatch = rank === 0 && !blocked;

  return (
    <div className={`rounded-xl border p-3 transition-all ${
      blocked
        ? 'bg-slate-50 border-slate-200 opacity-60'
        : isBestMatch
          ? 'bg-emerald-50 border-emerald-200 ring-1 ring-emerald-300/50'
          : 'bg-white border-slate-200'
    }`}>
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 flex-shrink-0">
          {auditor.full_name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-900 text-sm truncate">{auditor.full_name}</span>
            {isBestMatch && (
              <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold">
                EN İYİ EŞLEŞME
              </span>
            )}
            <FitScoreBadge score={matchScore} />
          </div>
          <div className="text-xs text-slate-500 mt-0.5">{auditor.title} · Yorgunluk: {auditor.fatigue_score}%</div>

          {blocked && blockReason && (
            <div className="flex items-center gap-1 mt-1.5 text-xs text-rose-600">
              <AlertTriangle size={11} />
              {blockReason}
            </div>
          )}

          {!blocked && matchedSkills.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {matchedSkills.slice(0, 3).map((s) => (
                <span key={s} className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-200">
                  {s}
                </span>
              ))}
              {missingSkills.slice(0, 2).map((s) => (
                <span key={s} className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200 line-through">
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ResourceAssignmentModal({
  engagement,
  onClose,
}: ResourceAssignmentModalProps) {
  const assignAuditor = usePlanningStore((s) => s.assignAuditor);
  const [suggestions, setSuggestions] = useState<AllocationResult[]>([]);
  const [loadingSuggest, setLoadingSuggest] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleAssign = (auditor: Auditor) => {
    assignAuditor(engagement.id, auditor.id);
    onClose();
  };

  const handleUnassign = () => {
    assignAuditor(engagement.id, null);
    onClose();
  };

  const handleSuggest = async () => {
    try {
      setLoadingSuggest(true);
      const profiles = await fetchProfilesWithSkills();
      const auditType = (engagement as any).audit_type ?? 'COMPREHENSIVE';
      const required = ENGAGEMENT_SKILLS[auditType] ?? ENGAGEMENT_SKILLS.COMPREHENSIVE;
      const results = suggestAuditors(required, profiles, { topN: 5 });
      setSuggestions(results);
      setShowSuggestions(true);
    } catch {
      setSuggestions([]);
    } finally {
      setLoadingSuggest(false);
    }
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(date));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg glass-panel rounded-xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Denetçi Ata</h2>
            <p className="text-sm text-slate-600 mt-1">
              Denetim için uygun bir denetçi seçin
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <div className="mb-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
          <div className="text-sm font-semibold text-slate-900 mb-1">
            {engagement.title}
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-600">
            <span>{formatDate(engagement.start_date)}</span>
            <span>-</span>
            <span>{formatDate(engagement.end_date)}</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Tahmini Süre: {engagement.estimated_hours} saat
          </div>
        </div>

        <div className="mb-4">
          <button
            onClick={handleSuggest}
            disabled={loadingSuggest}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-60 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-sm hover:shadow-md"
          >
            {loadingSuggest ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Analiz ediliyor...
              </>
            ) : (
              <>
                <Sparkles size={15} />
                AI Öneri — En İyi Ekip Adayları
              </>
            )}
          </button>
        </div>

        {showSuggestions && suggestions.length > 0 && (
          <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50/50 overflow-hidden">
            <button
              className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-blue-800"
              onClick={() => setShowSuggestions((v) => !v)}
            >
              <span className="flex items-center gap-2">
                <Sparkles size={14} />
                AI Önerileri ({suggestions.length} aday)
              </span>
              {showSuggestions ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            <div className="px-3 pb-3 space-y-2">
              {suggestions.map((result, i) => (
                <SuggestionCard key={result.auditor.id} result={result} rank={i} />
              ))}
            </div>
          </div>
        )}

        <div className="border-t border-slate-200 pt-4 mb-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Tüm Denetçiler
          </p>
        </div>

        <div className="space-y-2 mb-4">
          {MOCK_AUDITORS.map((auditor) => {
            const isAssigned = engagement.assigned_auditor_id === auditor.id;
            const aiRank = suggestions.findIndex((s) => s.auditor.full_name === auditor.name);
            const isTopAI = aiRank === 0;

            return (
              <button
                key={auditor.id}
                onClick={() => handleAssign(auditor)}
                className={`
                  w-full flex items-center gap-4 p-4 rounded-lg border transition-all
                  ${
                    isAssigned
                      ? 'bg-emerald-50 border-emerald-200 ring-2 ring-emerald-500/20'
                      : isTopAI
                        ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-300/50'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }
                `}
              >
                <img
                  src={auditor.avatarUrl}
                  alt={auditor.name}
                  className="w-12 h-12 rounded-full border-2 border-white shadow-sm"
                />

                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="font-semibold text-slate-900">
                      {auditor.name}
                    </div>
                    {isAssigned && (
                      <CheckCircle2 size={16} className="text-emerald-600" />
                    )}
                    {isTopAI && !isAssigned && (
                      <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded-full font-bold">
                        AI #1
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-slate-600">{auditor.role}</div>
                  <div className="text-xs text-slate-500 mt-1">
                    Kapasite: {auditor.capacity} saat/ay
                  </div>
                </div>

                {isAssigned && (
                  <div className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
                    Atanmış
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {engagement.assigned_auditor_id && (
          <div className="pt-4 border-t border-slate-200">
            <button
              onClick={handleUnassign}
              className="w-full px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
            >
              <User size={16} />
              Atamayı Kaldır
            </button>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-slate-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium text-sm transition-colors"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
