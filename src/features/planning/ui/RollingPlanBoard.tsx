import { Lock, LayoutList, Info } from 'lucide-react';
import { usePlanningStore } from '@/entities/planning/model/store';
import { PlanCard } from './PlanCard';

export function RollingPlanBoard() {
  const backlog = usePlanningStore((s) => s.backlog);
  const qSprint = usePlanningStore((s) => s.qSprint);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center">
              <LayoutList size={15} className="text-slate-500" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">9 Aylık Dinamik Havuz</h2>
              <p className="text-xs text-slate-500">Tentative Backlog</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 border border-slate-200 rounded-full px-2.5 py-1">
            {backlog.length} görev
          </span>
        </div>

        <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/60 p-4 flex flex-col gap-3 min-h-[320px]">
          {backlog.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 py-12 gap-2 text-center">
              <Info size={28} className="text-slate-300" />
              <p className="text-sm text-slate-400 font-medium">Havuz boş</p>
              <p className="text-xs text-slate-400">Risk evreninden düğüm ekleyerek havuzu doldurun.</p>
            </div>
          ) : (
            backlog.map((item) => (
              <PlanCard key={item.id} engagement={item} isBacklog />
            ))
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm shadow-blue-200">
              <Lock size={15} className="text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">3 Aylık Kilitli Q-Sprint</h2>
              <p className="text-xs text-slate-500">Locked — aktif çeyrek</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-full px-2.5 py-1">
            {qSprint.length} görev
          </span>
        </div>

        <div className="rounded-xl border-2 border-blue-200 bg-blue-50/30 p-4 flex flex-col gap-3 min-h-[320px]">
          {qSprint.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 py-12 gap-2 text-center">
              <Lock size={28} className="text-blue-200" />
              <p className="text-sm text-blue-400 font-medium">Sprint boş</p>
              <p className="text-xs text-blue-400">Havuzdan görev çekerek sprint'i doldurun.</p>
            </div>
          ) : (
            qSprint.map((item) => (
              <PlanCard key={item.id} engagement={item} isBacklog={false} />
            ))
          )}
        </div>

        <div className="flex items-start gap-2 text-xs text-slate-500 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5">
          <Lock size={12} className="text-amber-500 mt-0.5 shrink-0" />
          <span>
            Q-Sprint kilitli çeyrektir. Değişiklikler Denetim Komitesi onayı gerektirir.
          </span>
        </div>
      </div>
    </div>
  );
}
