import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Zap, Award, Activity, ChevronRight, X, Send, AlertTriangle } from 'lucide-react';
import { useTalentData, type TalentProfileEnriched } from '@/features/talent-os/hooks/useTalentData';
import { AuditorProfileCard } from '@/features/talent-os/components/AuditorProfileCard';
import { CompetencyRadar } from '@/features/talent-os/components/CompetencyRadar';

const KUDOS_CATEGORIES = [
  { value: 'QUALITY',      label: 'Kalite',     color: 'border-sky-500/40 bg-sky-500/10 text-sky-300' },
  { value: 'TEAMWORK',     label: 'Takım Ruhu', color: 'border-teal-500/40 bg-teal-500/10 text-teal-300' },
  { value: 'INNOVATION',   label: 'İnovasyon',  color: 'border-amber-500/40 bg-amber-500/10 text-amber-300' },
  { value: 'LEADERSHIP',   label: 'Liderlik',   color: 'border-rose-500/40 bg-rose-500/10 text-rose-300' },
  { value: 'MENTORING',    label: 'Mentorluk',  color: 'border-violet-500/40 bg-violet-500/10 text-violet-300' },
  { value: 'GENERAL',      label: 'Genel',      color: 'border-slate-500/40 bg-slate-500/10 text-slate-300' },
] as const;

const KUDOS_AMOUNTS = [10, 25, 50] as const;

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  accent: string;
}) {
  return (
    <div className="bg-slate-900/60 backdrop-blur-sm border border-white/8 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${accent}`}>
          <Icon className="w-3.5 h-3.5" />
        </div>
        <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">{label}</span>
      </div>
      <p className="text-2xl font-bold text-white font-mono">{value}</p>
      {sub && <p className="text-[10px] text-slate-500 mt-0.5">{sub}</p>}
    </div>
  );
}

interface KudosModalProps {
  profiles: TalentProfileEnriched[];
  defaultReceiver: TalentProfileEnriched | null;
  onClose: () => void;
}

function KudosModal({ profiles, defaultReceiver, onClose }: KudosModalProps) {
  const [receiver, setReceiver] = useState<string>(defaultReceiver?.id ?? '');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState<string>('QUALITY');
  const [amount, setAmount] = useState<number>(25);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!receiver || !message.trim()) return;
    setSending(true);
    await new Promise((r) => setTimeout(r, 800));
    setSending(false);
    setSent(true);
    setTimeout(onClose, 1800);
  };

  const receiverProfile = profiles.find((p) => p.id === receiver);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, y: 10 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.92, y: 10 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-500/20 border border-amber-500/30 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm">Kudos Gönder</h3>
              <p className="text-slate-500 text-[10px]">Ekip üyelerini ödüllendir</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-600 hover:text-slate-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {sent ? (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-8"
          >
            <div className="w-16 h-16 bg-amber-500/20 border border-amber-500/30 rounded-full flex items-center justify-center mx-auto mb-3">
              <Zap className="w-8 h-8 text-amber-400" />
            </div>
            <p className="text-white font-semibold">Kudos gönderildi!</p>
            <p className="text-slate-400 text-xs mt-1">{amount} XP → {receiverProfile?.full_name}</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold block mb-1.5">
                Alıcı
              </label>
              <select
                value={receiver}
                onChange={(e) => setReceiver(e.target.value)}
                className="w-full bg-slate-800 border border-white/8 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-sky-500/50 transition-colors"
              >
                <option value="" disabled>Seçin...</option>
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>{p.full_name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold block mb-1.5">
                Kategori
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {KUDOS_CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setCategory(cat.value)}
                    className={`px-2 py-1.5 rounded-lg text-[10px] font-semibold border transition-all
                      ${category === cat.value ? cat.color : 'bg-slate-800/60 text-slate-500 border-white/6 hover:border-white/12'}`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold block mb-1.5">
                XP Miktarı
              </label>
              <div className="flex gap-2">
                {KUDOS_AMOUNTS.map((a) => (
                  <button
                    key={a}
                    onClick={() => setAmount(a)}
                    className={`flex-1 py-2 rounded-xl text-sm font-bold font-mono border transition-all
                      ${amount === a
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-slate-800 text-slate-400 border-white/6 hover:border-white/14'}`}
                  >
                    +{a}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold block mb-1.5">
                Mesaj
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Neden bu kudos'u hak etti?"
                rows={3}
                className="w-full bg-slate-800 border border-white/8 rounded-xl px-3 py-2.5 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-sky-500/50 transition-colors resize-none"
              />
            </div>

            <button
              onClick={handleSend}
              disabled={!receiver || !message.trim() || sending}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {sending ? (
                <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {sending ? 'Gönderiliyor...' : `${amount} XP Gönder`}
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

export default function TalentDashboardPage() {
  const { profiles, loading, error, teamStats } = useTalentData();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [kudosTarget, setKudosTarget] = useState<TalentProfileEnriched | null>(null);

  const selectedProfile = profiles.find((p) => p.id === selectedId) ?? null;

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Talent OS yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[200px] flex items-center justify-center">
        <div className="flex items-center gap-2 text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      </div>
    );
  }

  const fatigueColor =
    teamStats.avgFatigue >= 75 ? 'bg-rose-500/20 text-rose-300'
    : teamStats.avgFatigue >= 40 ? 'bg-amber-500/20 text-amber-300'
    : 'bg-emerald-500/20 text-emerald-300';

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={Users}
          label="Ekip Büyüklüğü"
          value={profiles.length}
          sub={`${teamStats.availableCount} müsait`}
          accent="bg-sky-500/20 text-sky-400"
        />
        <StatCard
          icon={Activity}
          label="Ort. Yorgunluk"
          value={teamStats.avgFatigue}
          sub="0–100 ölçeği"
          accent={`${fatigueColor}`}
        />
        <StatCard
          icon={Zap}
          label="Toplam XP"
          value={teamStats.totalXP.toLocaleString()}
          sub="Ekip birikimi"
          accent="bg-amber-500/20 text-amber-400"
        />
        <StatCard
          icon={Award}
          label="Sertifikalar"
          value={teamStats.totalCerts}
          sub="Aktif & doğrulanmış"
          accent="bg-violet-500/20 text-violet-400"
        />
      </div>

      {teamStats.topPerformer && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-900/50 border border-amber-500/20 rounded-xl text-sm">
          <Zap className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span className="text-slate-400">En yüksek seviye:</span>
          <span className="text-amber-300 font-semibold">{teamStats.topPerformer}</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600 ml-auto" />
        </div>
      )}

      <div className={`grid gap-4 ${selectedProfile ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'}`}>
        <div className={`grid gap-4 ${selectedProfile ? 'lg:col-span-2 grid-cols-1 sm:grid-cols-2' : 'col-span-full grid-cols-1 md:grid-cols-2 xl:grid-cols-3'}`}>
          {profiles.map((profile) => (
            <AuditorProfileCard
              key={profile.id}
              profile={profile}
              isSelected={selectedId === profile.id}
              onSelect={() => setSelectedId(selectedId === profile.id ? null : profile.id)}
              onGiveKudos={() => setKudosTarget(profile)}
            />
          ))}

          {profiles.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-slate-500">
              <Users className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm">Henüz denetçi profili yok</p>
            </div>
          )}
        </div>

        <AnimatePresence mode="wait">
          {selectedProfile && (
            <motion.div
              key={selectedProfile.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ type: 'spring', stiffness: 400, damping: 35 }}
              className="lg:col-span-1"
            >
              <div className="sticky top-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
                    Yetkinlik Radarı
                  </p>
                  <button
                    onClick={() => setSelectedId(null)}
                    className="text-slate-600 hover:text-slate-400 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <CompetencyRadar
                  profileName={selectedProfile.full_name}
                  snapshot={selectedProfile.skills_snapshot}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {kudosTarget && (
          <KudosModal
            profiles={profiles}
            defaultReceiver={kudosTarget}
            onClose={() => setKudosTarget(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
