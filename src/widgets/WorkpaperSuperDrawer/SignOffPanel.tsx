import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileCheck, UserCheck, CheckCircle2, Clock, Shield, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import type { Workpaper } from '@/entities/workpaper/model/types';

interface SignOffPanelProps {
  workpaper: Workpaper | null;
  currentUserId: string;
  onSignOffPrepared: () => Promise<void>;
  onSignOffReviewed: () => Promise<void>;
}

export function SignOffPanel({
  workpaper,
  currentUserId,
  onSignOffPrepared,
  onSignOffReviewed,
}: SignOffPanelProps) {
  const [submitting, setSubmitting] = useState<'prepared' | 'reviewed' | null>(null);

  const handleSignOff = async (type: 'prepared' | 'reviewed') => {
    setSubmitting(type);
    try {
      if (type === 'prepared') {
        await onSignOffPrepared();
      } else {
        await onSignOffReviewed();
      }
    } catch (err) {
      console.error('Sign-off failed:', err);
    } finally {
      setSubmitting(null);
    }
  };

  const isPrepared = !!workpaper?.prepared_at;
  const isReviewed = !!workpaper?.reviewed_at;
  const canPrepare = !isPrepared;
  const canReview = isPrepared && !isReviewed;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-blue-100 rounded-xl">
          <FileCheck size={16} className="text-blue-600" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900">İmza Süreci</h3>
          <p className="text-xs text-slate-500">Hazırlayan ve Gözden Geçiren Onayları</p>
        </div>
      </div>

      <div className="space-y-3">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={clsx(
            'border-2 rounded-xl p-4 transition-all',
            isPrepared
              ? 'border-emerald-300 bg-emerald-50/50'
              : 'border-slate-200 bg-slate-50'
          )}
        >
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-start gap-3">
              <div
                className={clsx(
                  'p-2 rounded-lg shrink-0',
                  isPrepared ? 'bg-emerald-100' : 'bg-slate-200'
                )}
              >
                {isPrepared ? (
                  <CheckCircle2 size={18} className="text-emerald-600" />
                ) : (
                  <Clock size={18} className="text-slate-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-slate-900 mb-1">
                  Hazırlayan İmzası
                </h4>
                {isPrepared ? (
                  <div className="space-y-1">
                    <p className="text-xs text-slate-600">
                      <span className="font-medium">İmzalayan:</span> {workpaper?.prepared_by_name || 'Bilinmiyor'}
                    </p>
                    <p className="text-xs text-slate-500">
                      {workpaper?.prepared_at && new Date(workpaper.prepared_at).toLocaleString('tr-TR')}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">
                    Workpaper henüz hazırlayan tarafından imzalanmadı.
                  </p>
                )}
              </div>
            </div>
          </div>

          {canPrepare && (
            <button
              onClick={() => handleSignOff('prepared')}
              disabled={submitting === 'prepared'}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {submitting === 'prepared' ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  İmzalanıyor...
                </>
              ) : (
                <>
                  <UserCheck size={14} />
                  Hazırlayan Olarak İmzala
                </>
              )}
            </button>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={clsx(
            'border-2 rounded-xl p-4 transition-all',
            isReviewed
              ? 'border-emerald-300 bg-emerald-50/50'
              : !isPrepared
              ? 'border-slate-200 bg-slate-50 opacity-60'
              : 'border-slate-200 bg-slate-50'
          )}
        >
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-start gap-3">
              <div
                className={clsx(
                  'p-2 rounded-lg shrink-0',
                  isReviewed ? 'bg-emerald-100' : 'bg-slate-200'
                )}
              >
                {isReviewed ? (
                  <CheckCircle2 size={18} className="text-emerald-600" />
                ) : (
                  <Shield size={18} className="text-slate-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-slate-900 mb-1">
                  Gözden Geçiren İmzası
                </h4>
                {isReviewed ? (
                  <div className="space-y-1">
                    <p className="text-xs text-slate-600">
                      <span className="font-medium">İmzalayan:</span> {workpaper?.reviewed_by_name || 'Bilinmiyor'}
                    </p>
                    <p className="text-xs text-slate-500">
                      {workpaper?.reviewed_at && new Date(workpaper.reviewed_at).toLocaleString('tr-TR')}
                    </p>
                  </div>
                ) : isPrepared ? (
                  <p className="text-xs text-slate-500">
                    Workpaper gözden geçirme onayı bekliyor.
                  </p>
                ) : (
                  <p className="text-xs text-slate-400">
                    Önce hazırlayan imzası gerekli.
                  </p>
                )}
              </div>
            </div>
          </div>

          {canReview && (
            <button
              onClick={() => handleSignOff('reviewed')}
              disabled={submitting === 'reviewed'}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white text-sm font-bold rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {submitting === 'reviewed' ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  İmzalanıyor...
                </>
              ) : (
                <>
                  <Shield size={14} />
                  Gözden Geçiren Olarak İmzala
                </>
              )}
            </button>
          )}
        </motion.div>
      </div>

      {isPrepared && isReviewed && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-xl p-4 text-center"
        >
          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <CheckCircle2 className="text-emerald-600" size={24} />
          </div>
          <h4 className="text-sm font-bold text-emerald-900 mb-1">Workpaper Tamamlandı</h4>
          <p className="text-xs text-emerald-700">
            Bu workpaper hem hazırlayan hem de gözden geçiren tarafından onaylandı.
          </p>
        </motion.div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
        <div className="flex items-start gap-2">
          <Shield size={14} className="text-blue-600 mt-0.5 shrink-0" />
          <div className="text-xs text-blue-900 leading-relaxed space-y-1">
            <p className="font-bold">İmza Süreci Hakkında:</p>
            <ul className="list-disc list-inside space-y-0.5 text-blue-800 ml-1">
              <li>Hazırlayan imzası: Workpaper'ı hazırlayan denetçi tarafından atılır</li>
              <li>Gözden Geçiren imzası: Süpervizör veya kıdemli denetçi tarafından atılır</li>
              <li>Her imza kalıcıdır ve değiştirilemez</li>
              <li>Tüm imzalar denetim iz kaydında saklanır</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
