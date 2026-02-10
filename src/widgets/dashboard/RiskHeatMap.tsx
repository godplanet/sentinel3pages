import { useState, useMemo } from 'react';
import { Grid3x3, TrendingDown, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { useHeatmapData, type AssessmentWithDetails } from '@/entities/risk/heatmap-api';

type MatrixMode = 'inherent' | 'residual';

const CELL_COLORS: Record<number, string> = {
  1: 'bg-emerald-100 hover:bg-emerald-200',
  2: 'bg-emerald-100 hover:bg-emerald-200',
  3: 'bg-yellow-100 hover:bg-yellow-200',
  4: 'bg-yellow-100 hover:bg-yellow-200',
  5: 'bg-amber-100 hover:bg-amber-200',
  6: 'bg-amber-200 hover:bg-amber-300',
  8: 'bg-orange-200 hover:bg-orange-300',
  9: 'bg-orange-200 hover:bg-orange-300',
  10: 'bg-orange-300 hover:bg-orange-400',
  12: 'bg-red-200 hover:bg-red-300',
  15: 'bg-red-300 hover:bg-red-400',
  16: 'bg-red-400 hover:bg-red-500',
  20: 'bg-red-500 hover:bg-red-600',
  25: 'bg-red-600 hover:bg-red-700',
};

function getCellColor(score: number): string {
  const keys = Object.keys(CELL_COLORS).map(Number).sort((a, b) => a - b);
  for (let i = keys.length - 1; i >= 0; i--) {
    if (score >= keys[i]) return CELL_COLORS[keys[i]];
  }
  return 'bg-slate-50';
}

export function RiskHeatMap() {
  const { data: assessments = [], isLoading } = useHeatmapData();
  const [mode, setMode] = useState<MatrixMode>('inherent');
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);

  const cellMap = useMemo(() => {
    const map: Record<string, AssessmentWithDetails[]> = {};
    for (const a of assessments) {
      const imp = a.impact;
      const lik = a.likelihood;
      const key = `${imp}-${lik}`;
      if (!map[key]) map[key] = [];
      map[key].push(a);
    }
    return map;
  }, [assessments]);

  const stats = useMemo(() => {
    let critical = 0, high = 0, medium = 0, low = 0;
    for (const a of assessments) {
      const score = mode === 'inherent' ? a.inherent_risk_score : Math.round(a.residual_score);
      if (score >= 15) critical++;
      else if (score >= 10) high++;
      else if (score >= 5) medium++;
      else low++;
    }
    return { critical, high, medium, low };
  }, [assessments, mode]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 flex items-center justify-center">
        <Loader2 className="animate-spin text-slate-400" size={24} />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center">
            <Grid3x3 size={18} className="text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Risk Isi Haritasi</h3>
            <p className="text-[10px] text-slate-500">{assessments.length} canli degerlendirme</p>
          </div>
        </div>
        <div className="flex bg-slate-100 p-0.5 rounded-lg">
          <button
            onClick={() => setMode('inherent')}
            className={clsx(
              'px-3 py-1.5 text-xs font-bold rounded-md transition-all',
              mode === 'inherent' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            )}
          >
            Dogal Risk
          </button>
          <button
            onClick={() => setMode('residual')}
            className={clsx(
              'px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1',
              mode === 'residual' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            )}
          >
            <TrendingDown size={12} />
            Artik Risk
          </button>
        </div>
      </div>

      <div className="p-5">
        <div className="grid grid-cols-4 gap-3 mb-4">
          <StatBadge label="Kritik" count={stats.critical} color="bg-red-600" />
          <StatBadge label="Yuksek" count={stats.high} color="bg-orange-500" />
          <StatBadge label="Orta" count={stats.medium} color="bg-yellow-500" />
          <StatBadge label="Dusuk" count={stats.low} color="bg-emerald-500" />
        </div>

        <div className="flex">
          <div className="flex flex-col justify-between pr-2 pt-0 pb-0">
            <span className="text-[9px] text-slate-400 font-bold -rotate-90 whitespace-nowrap origin-center translate-y-24">
              ETKI
            </span>
          </div>

          <div className="flex-1">
            <div className="grid grid-cols-6 gap-px bg-slate-200 rounded-lg overflow-hidden">
              <div className="bg-slate-50" />
              {[1, 2, 3, 4, 5].map(x => (
                <div key={x} className="bg-slate-50 p-1.5 text-center">
                  <span className="text-[9px] font-bold text-slate-500">{x}</span>
                </div>
              ))}

              {[5, 4, 3, 2, 1].map(y => (
                <div key={`row-${y}`} className="contents">
                  <div className="bg-slate-50 p-1.5 flex items-center justify-center">
                    <span className="text-[9px] font-bold text-slate-500">{y}</span>
                  </div>
                  {[1, 2, 3, 4, 5].map(x => {
                    const key = `${x}-${y}`;
                    const score = x * y;
                    const risksInCell = cellMap[key] || [];
                    const isHovered = hoveredCell === key;

                    return (
                      <div
                        key={key}
                        className={clsx(
                          'relative p-1 min-h-[44px] flex items-center justify-center cursor-pointer transition-all',
                          getCellColor(score),
                          isHovered && 'ring-2 ring-slate-800 ring-inset z-10'
                        )}
                        onMouseEnter={() => setHoveredCell(key)}
                        onMouseLeave={() => setHoveredCell(null)}
                      >
                        {risksInCell.length > 0 && (
                          <div className={clsx(
                            'w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-sm transition-transform',
                            score >= 15 ? 'bg-red-700' : score >= 10 ? 'bg-orange-600' : score >= 5 ? 'bg-yellow-600' : 'bg-emerald-600',
                            isHovered && 'scale-110'
                          )}>
                            {risksInCell.length}
                          </div>
                        )}

                        {isHovered && risksInCell.length > 0 && (
                          <div className="absolute z-20 bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-slate-800 text-white rounded-lg shadow-xl p-2.5 pointer-events-none">
                            <div className="text-[10px] font-bold text-slate-300 mb-1.5">
                              Etki: {x} / Olasilik: {y} (Skor: {score})
                            </div>
                            {risksInCell.slice(0, 4).map(r => (
                              <div key={r.id} className="text-[10px] text-slate-200 truncate py-0.5">
                                {r.risk_title} - {r.entity_name}
                              </div>
                            ))}
                            {risksInCell.length > 4 && (
                              <div className="text-[10px] text-slate-400 mt-1">
                                +{risksInCell.length - 4} daha
                              </div>
                            )}
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-slate-800 rotate-45" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="text-center mt-2">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                OLASILIK
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBadge({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2">
      <div className={clsx('w-2.5 h-2.5 rounded-full', color)} />
      <span className="text-[10px] font-bold text-slate-600">{label}</span>
      <span className="text-sm font-black text-slate-800 ml-auto tabular-nums">{count}</span>
    </div>
  );
}
