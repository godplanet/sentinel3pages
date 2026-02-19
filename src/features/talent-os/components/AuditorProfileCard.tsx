import { motion } from 'framer-motion';
import { AlertTriangle, Star, Shield, Trophy, Zap, Gift, Lock } from 'lucide-react';
import type { TalentProfileEnriched } from '../hooks/useTalentData';
import { LEVEL_LABELS } from '@/shared/types/talent';

interface Props {
  profile: TalentProfileEnriched;
  isSelected: boolean;
  onSelect: () => void;
  onGiveKudos: () => void;
  isDiminishingActive?: boolean;
  memoryGateLocked?: boolean;
}

const LEVEL_GRADIENTS: Record<number, string> = {
  1: 'from-slate-600 to-slate-500',
  2: 'from-emerald-700 to-emerald-500',
  3: 'from-sky-700 to-sky-500',
  4: 'from-amber-700 to-amber-500',
  5: 'from-rose-700 via-orange-500 to-amber-400',
};

const TITLE_MAP: Record<string, string> = {
  Junior: 'Jr. Denetçi',
  Senior: 'Kd. Denetçi',
  Manager: 'Denetim Müdürü',
  Expert: 'Uzman Denetçi',
};

const CERT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  CIA:   { bg: 'bg-blue-500/20',   text: 'text-blue-300',   border: 'border-blue-500/40' },
  CISA:  { bg: 'bg-cyan-500/20',   text: 'text-cyan-300',   border: 'border-cyan-500/40' },
  CRISC: { bg: 'bg-amber-500/20',  text: 'text-amber-300',  border: 'border-amber-500/40' },
  CFE:   { bg: 'bg-rose-500/20',   text: 'text-rose-300',   border: 'border-rose-500/40' },
  SMMM:  { bg: 'bg-teal-500/20',   text: 'text-teal-300',   border: 'border-teal-500/40' },
  SPK:   { bg: 'bg-violet-500/20', text: 'text-violet-300', border: 'border-violet-500/40' },
  TKBB:  { bg: 'bg-emerald-500/20',text: 'text-emerald-300',border: 'border-emerald-500/40' },
};
const DEFAULT_CERT_COLOR = { bg: 'bg-slate-500/20', text: 'text-slate-300', border: 'border-slate-500/40' };

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase();
}

function FatigueMeter({ score }: { score: number }) {
  const pct = Math.min(1, Math.max(0, score / 100));
  const R = 34;
  const CX = 50;
  const CY = 50;

  const ptX = (a: number) => CX + R * Math.cos(a);
  const ptY = (a: number) => CY - R * Math.sin(a);

  const bgStart = { x: ptX(Math.PI), y: ptY(Math.PI) };
  const bgEnd   = { x: ptX(0),       y: ptY(0) };
  const bgPath  = `M ${bgStart.x} ${bgStart.y} A ${R} ${R} 0 0 0 ${bgEnd.x} ${bgEnd.y}`;

  const fillEnd   = Math.PI - pct * Math.PI;
  const fillEndPt = { x: ptX(fillEnd), y: ptY(fillEnd) };
  const largeArc  = pct > 0.5 ? 1 : 0;
  const fillPath  = pct > 0.001
    ? `M ${bgStart.x} ${bgStart.y} A ${R} ${R} 0 ${largeArc} 0 ${fillEndPt.x} ${fillEndPt.y}`
    : null;

  const needleAngle = Math.PI - pct * Math.PI;
  const needleLen   = R - 6;
  const needleTip   = { x: CX + needleLen * Math.cos(needleAngle), y: CY - needleLen * Math.sin(needleAngle) };

  const color    = score >= 80 ? '#f87171' : score >= 40 ? '#fbbf24' : '#34d399';
  const glow     = score >= 80 ? 'drop-shadow(0 0 4px #f87171)' : score >= 40 ? 'drop-shadow(0 0 4px #fbbf24)' : 'drop-shadow(0 0 4px #34d399)';
  const glowId   = `fatigue-glow-${score}`;

  const TICKS = [0, 0.25, 0.5, 0.75, 1];

  return (
    <svg viewBox="0 0 100 58" className="w-full max-w-[130px] mx-auto" style={{ filter: glow }}>
      <defs>
        <filter id={glowId}>
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      <path d={bgPath} fill="none" stroke="#1e293b" strokeWidth="9" strokeLinecap="round" />

      {fillPath && (
        <path
          d={fillPath}
          fill="none"
          stroke={color}
          strokeWidth="9"
          strokeLinecap="round"
          opacity={0.9}
        />
      )}

      {TICKS.map((t) => {
        const a   = Math.PI - t * Math.PI;
        const innerR = R + 2;
        const outerR = R + 8;
        return (
          <line
            key={t}
            x1={CX + innerR * Math.cos(a)}
            y1={CY - innerR * Math.sin(a)}
            x2={CX + outerR * Math.cos(a)}
            y2={CY - outerR * Math.sin(a)}
            stroke="#334155"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        );
      })}

      <line
        x1={CX}
        y1={CY}
        x2={needleTip.x}
        y2={needleTip.y}
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx={CX} cy={CY} r="3" fill={color} />

      <text x="50" y="50" textAnchor="middle" fontSize="13" fontWeight="bold" fill={color} fontFamily="monospace">
        {score}
      </text>
      <text x="50" y="57" textAnchor="middle" fontSize="6.5" fill="#64748b" fontFamily="sans-serif" letterSpacing="0.5">
        YORGUNLUK
      </text>
    </svg>
  );
}

function XPBar({
  current, next, level, showShield = false, memoryGateLocked = false,
}: {
  current: number; next: number; level: number; showShield?: boolean; memoryGateLocked?: boolean;
}) {
  const thresholds: Record<number, number> = { 1: 0, 2: 500, 3: 1500, 4: 3500, 5: 7000 };
  const levelStart = thresholds[level] ?? 0;
  const levelRange = next - levelStart;
  const progress   = levelRange > 0 ? Math.min(1, (current - levelStart) / levelRange) : 1;
  const gradient   = LEVEL_GRADIENTS[level] ?? LEVEL_GRADIENTS[1];
  const isGated    = memoryGateLocked && level >= 4;

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">XP</span>
          {showShield && (
            <span
              title="Diminishing Returns active — XP yield reduced for OBSERVATION / KUDOS"
              className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40"
            >
              <Shield size={8} className="text-amber-400" />
              <span className="text-[8px] text-amber-400 font-semibold tracking-wide">DR</span>
            </span>
          )}
          {isGated && (
            <span
              title="Memory Gate: Seviye 5'e ulaşmak için Playbook'a en az bir girdi ekleyin"
              className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded-full bg-slate-600/40 border border-slate-500/40"
            >
              <Lock size={8} className="text-slate-400" />
              <span className="text-[8px] text-slate-400 font-semibold tracking-wide">LV5</span>
            </span>
          )}
        </div>
        <span className="text-[10px] text-slate-300 font-mono">
          {current.toLocaleString()} / {next.toLocaleString()}
        </span>
      </div>
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden relative">
        <motion.div
          className={`h-full rounded-full bg-gradient-to-r ${isGated ? 'from-slate-600 to-slate-500' : gradient}`}
          initial={{ width: 0 }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
        />
        {!isGated && (
          <div
            className={`absolute inset-0 rounded-full bg-gradient-to-r ${gradient} opacity-30 blur-sm`}
            style={{ width: `${progress * 100}%` }}
          />
        )}
      </div>
      {isGated && (
        <p className="text-[9px] text-slate-500 flex items-center gap-1">
          <Lock size={7} />
          Seviye 5 için Playbook&apos;a girdi ekleyin
        </p>
      )}
    </div>
  );
}

export function AuditorProfileCard({ profile, isSelected, onSelect, onGiveKudos, isDiminishingActive = false, memoryGateLocked = false }: Props) {
  const gradient   = LEVEL_GRADIENTS[profile.current_level] ?? LEVEL_GRADIENTS[1];
  const levelLabel = LEVEL_LABELS[profile.current_level] ?? `Lv ${profile.current_level}`;
  const initials   = getInitials(profile.full_name);
  const isBurnout  = profile.fatigue_score > 80;

  const snapshot   = profile.skills_snapshot;
  const topSkills  = snapshot?.skills?.slice(0, 3) ?? [];

  return (
    <motion.div
      layout
      whileHover={{ y: -2, scale: 1.005 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      onClick={onSelect}
      className={`
        relative rounded-2xl p-5 cursor-pointer transition-all duration-300
        bg-slate-900/80 backdrop-blur-xl border
        ${isSelected
          ? 'border-sky-500/60 shadow-lg shadow-sky-500/10 ring-1 ring-sky-500/30'
          : 'border-white/8 hover:border-white/16'}
      `}
    >
      {isBurnout && (
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-red-500/20 border border-red-500/40 rounded-full px-2 py-0.5">
          <AlertTriangle className="w-3 h-3 text-red-400" />
          <span className="text-[9px] text-red-400 font-semibold tracking-wide uppercase">Burnout</span>
        </div>
      )}

      <div className="flex items-start gap-4 mb-4">
        <div className="relative flex-shrink-0">
          <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
            <span className="text-white font-bold text-lg tracking-tight">{initials}</span>
          </div>
          <div className={`absolute -bottom-1.5 -right-1.5 bg-gradient-to-br ${gradient} rounded-md px-1.5 py-0.5 border border-black/20 shadow`}>
            <span className="text-white text-[9px] font-black tracking-widest">LV{profile.current_level}</span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold text-sm leading-tight truncate">
            {profile.full_name}
          </h3>
          <p className="text-slate-400 text-xs mt-0.5">
            {TITLE_MAP[profile.title] ?? profile.title}
          </p>
          <p className="text-slate-500 text-[10px] mt-0.5 truncate">{profile.department}</p>

          <div className="flex items-center gap-2 mt-1.5">
            <div className="flex items-center gap-1">
              <Trophy className="w-3 h-3 text-amber-400" />
              <span className="text-[10px] text-amber-400 font-mono font-semibold">
                {levelLabel}
              </span>
            </div>
            {profile.is_available ? (
              <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full px-1.5 py-0.5">
                Müsait
              </span>
            ) : (
              <span className="text-[9px] bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-full px-1.5 py-0.5">
                Dolu
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mb-4">
        <XPBar
          current={profile.total_xp}
          next={profile.next_level_xp}
          level={profile.current_level}
          showShield={isDiminishingActive}
          memoryGateLocked={memoryGateLocked}
        />
      </div>

      <div className="flex items-start gap-3 mb-4">
        <div className="flex-1">
          <FatigueMeter score={profile.fatigue_score} />
        </div>

        {topSkills.length > 0 && (
          <div className="flex-1 space-y-1.5">
            <p className="text-[9px] text-slate-500 uppercase tracking-widest font-semibold">Top Beceriler</p>
            {topSkills.map((s) => (
              <div key={s.skill_name} className="flex items-center gap-1.5">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-1.5 h-1.5 rounded-full ${
                        i < s.proficiency_level ? 'bg-sky-400' : 'bg-slate-700'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-[9px] text-slate-400 truncate">{s.skill_name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {profile.certifications.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {profile.certifications.slice(0, 4).map((cert) => {
            const key = Object.keys(CERT_COLORS).find((k) => cert.name.includes(k)) ?? '';
            const style = CERT_COLORS[key] ?? DEFAULT_CERT_COLOR;
            return (
              <div
                key={cert.id}
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded border text-[9px] font-semibold uppercase tracking-wide
                  ${style.bg} ${style.text} ${style.border}`}
              >
                <Shield className="w-2.5 h-2.5" />
                {cert.name.split(' ')[0]}
              </div>
            );
          })}
          {profile.certifications.length > 4 && (
            <span className="text-[9px] text-slate-500 self-center">
              +{profile.certifications.length - 4}
            </span>
          )}
        </div>
      )}

      <div className="flex gap-2 pt-3 border-t border-white/6">
        <button
          onClick={(e) => { e.stopPropagation(); onSelect(); }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all
            ${isSelected
              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 hover:bg-sky-500/30'
              : 'bg-slate-800/60 text-slate-300 border border-white/8 hover:bg-slate-700/60 hover:text-white'}`}
        >
          <Star className="w-3 h-3" />
          Radar
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onGiveKudos(); }}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all
            bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 hover:text-amber-300"
        >
          <Zap className="w-3 h-3" />
          Kudos
        </button>
      </div>
    </motion.div>
  );
}
