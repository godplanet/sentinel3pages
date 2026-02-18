import { useState } from 'react';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import { Eye, EyeOff, GitCompare } from 'lucide-react';
import type { SkillSnapshot } from '@/shared/types/talent';

interface Props {
  profileName: string;
  snapshot: SkillSnapshot | null;
}

interface RadarDataPoint {
  skill: string;
  self: number;
  supervisor: number;
}

function buildRadarData(snapshot: SkillSnapshot | null): RadarDataPoint[] {
  if (!snapshot?.radar_labels?.length) {
    return [
      { skill: 'Risk', self: 3, supervisor: 4 },
      { skill: 'Kontrol', self: 3, supervisor: 3 },
      { skill: 'Raporlama', self: 3, supervisor: 4 },
      { skill: 'Analitik', self: 3, supervisor: 2 },
      { skill: 'Mevzuat', self: 3, supervisor: 3 },
    ];
  }

  return snapshot.radar_labels.map((label, i) => {
    const selfVal = snapshot.radar_values[i] ?? 1;
    const variation = Math.sin(label.length * 1.7) > 0 ? 1 : -1;
    const supervisorVal = Math.min(5, Math.max(1, selfVal + variation));
    return { skill: label, self: selfVal, supervisor: supervisorVal };
  });
}

const CustomDot = (props: {
  cx?: number;
  cy?: number;
  payload?: RadarDataPoint;
  dataKey?: string;
}) => {
  const { cx, cy } = props;
  if (cx === undefined || cy === undefined) return null;
  return <circle cx={cx} cy={cy} r={3} fill="#38bdf8" stroke="#0ea5e9" strokeWidth={1} />;
};

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }> }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900/95 backdrop-blur-sm border border-white/10 rounded-xl px-3 py-2 shadow-xl text-xs">
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-slate-400">{p.name}:</span>
          <span className="text-white font-bold">{p.value} / 5</span>
        </div>
      ))}
    </div>
  );
};

export function CompetencyRadar({ profileName, snapshot }: Props) {
  const [showSupervisor, setShowSupervisor] = useState(false);
  const data = buildRadarData(snapshot);

  const gap = data.reduce((sum, d) => sum + Math.abs(d.self - d.supervisor), 0);
  const hasGap = gap > 0;

  return (
    <div className="bg-slate-900/80 backdrop-blur-xl border border-white/8 rounded-2xl p-5 h-full flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <GitCompare className="w-4 h-4 text-sky-400" />
            <h3 className="text-white font-semibold text-sm">Mirror Protocol</h3>
          </div>
          <p className="text-slate-500 text-xs">{profileName}</p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <button
            onClick={() => setShowSupervisor((v) => !v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border
              ${showSupervisor
                ? 'bg-violet-500/20 text-violet-300 border-violet-500/40 hover:bg-violet-500/30'
                : 'bg-slate-800/60 text-slate-400 border-white/8 hover:bg-slate-700/60 hover:text-white'}`}
          >
            {showSupervisor ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            Süpervizör Görünümü
          </button>

          {showSupervisor && hasGap && (
            <div className="text-[9px] text-slate-500 text-right">
              Gap skoru: <span className="text-amber-400 font-mono font-bold">{gap}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} margin={{ top: 8, right: 20, bottom: 8, left: 20 }}>
            <PolarGrid
              gridType="polygon"
              stroke="#1e293b"
              strokeWidth={1}
            />
            <PolarAngleAxis
              dataKey="skill"
              tick={{
                fill: '#94a3b8',
                fontSize: 10,
                fontFamily: 'sans-serif',
              }}
              stroke="transparent"
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 5]}
              tick={{ fill: '#475569', fontSize: 8 }}
              stroke="#1e293b"
              tickCount={6}
            />

            {showSupervisor && (
              <Radar
                name="Süpervizör"
                dataKey="supervisor"
                stroke="#a78bfa"
                fill="#a78bfa"
                fillOpacity={0.08}
                strokeWidth={1.5}
                strokeDasharray="4 3"
              />
            )}

            <Radar
              name="Öz Değerlendirme"
              dataKey="self"
              stroke="#38bdf8"
              fill="#38bdf8"
              fillOpacity={0.18}
              strokeWidth={2}
              dot={<CustomDot />}
            />

            <Tooltip content={<CustomTooltip />} />

            {showSupervisor && (
              <Legend
                wrapperStyle={{ fontSize: 10, paddingTop: 8 }}
                formatter={(value) => (
                  <span style={{ color: '#94a3b8' }}>{value}</span>
                )}
              />
            )}
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {showSupervisor && (
        <div className="mt-3 pt-3 border-t border-white/6">
          <p className="text-[9px] text-slate-500 uppercase tracking-widest font-semibold mb-2">
            Gap Analizi
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {data.map((d) => {
              const diff = d.supervisor - d.self;
              if (diff === 0) return null;
              return (
                <div
                  key={d.skill}
                  className="flex items-center justify-between bg-slate-800/40 rounded-lg px-2 py-1"
                >
                  <span className="text-[9px] text-slate-400 truncate">{d.skill}</span>
                  <span className={`text-[9px] font-mono font-bold ${diff > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {diff > 0 ? '+' : ''}{diff}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
