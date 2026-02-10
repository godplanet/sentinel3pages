import { X, User, CheckCircle2 } from 'lucide-react';
import { usePlanningStore } from '@/entities/planning/model/store';
import { MOCK_AUDITORS, type Auditor } from '@/entities/planning/api/mock-data';
import type { AuditEngagement } from '@/entities/planning/model/types';

interface ResourceAssignmentModalProps {
  engagement: AuditEngagement;
  onClose: () => void;
}

export function ResourceAssignmentModal({
  engagement,
  onClose,
}: ResourceAssignmentModalProps) {
  const assignAuditor = usePlanningStore((s) => s.assignAuditor);

  const handleAssign = (auditor: Auditor) => {
    assignAuditor(engagement.id, auditor.id);
    onClose();
  };

  const handleUnassign = () => {
    assignAuditor(engagement.id, null);
    onClose();
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

      <div className="relative w-full max-w-lg glass-panel rounded-xl p-6 shadow-2xl">
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

        <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-lg">
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

        <div className="space-y-2 mb-4">
          {MOCK_AUDITORS.map((auditor) => {
            const isAssigned = engagement.assigned_auditor_id === auditor.id;

            return (
              <button
                key={auditor.id}
                onClick={() => handleAssign(auditor)}
                className={`
                  w-full flex items-center gap-4 p-4 rounded-lg border transition-all
                  ${
                    isAssigned
                      ? 'bg-emerald-50 border-emerald-200 ring-2 ring-emerald-500/20'
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
                  <div className="flex items-center gap-2">
                    <div className="font-semibold text-slate-900">
                      {auditor.name}
                    </div>
                    {isAssigned && (
                      <CheckCircle2
                        size={16}
                        className="text-emerald-600"
                      />
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
