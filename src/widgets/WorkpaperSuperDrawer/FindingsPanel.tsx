import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, AlertCircle, Info, Plus, Loader2, ShieldAlert, Sparkles, ExternalLink, FileSearch } from 'lucide-react';
import clsx from 'clsx';
import type { WorkpaperFindingRow, FindingSeverity } from '@/entities/workpaper/model/detail-types';
import type { TestStep } from '@/entities/workpaper/model/detail-types';

interface FindingsPanelProps {
  findings: WorkpaperFindingRow[];
  loading: boolean;
  workpaperId: string;
  controlId?: string;
  failedSteps?: TestStep[];
  onAddFinding: (title: string, description: string, severity: FindingSeverity, sourceRef: string) => void;
}

const SEVERITY_CONFIG: Record<FindingSeverity, { label: string; color: string; bg: string; border: string; icon: typeof AlertTriangle }> = {
  CRITICAL: { label: 'Kritik', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-300', icon: ShieldAlert },
  HIGH: { label: 'Yuksek', color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-300', icon: AlertTriangle },
  MEDIUM: { label: 'Orta', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-300', icon: AlertCircle },
  LOW: { label: 'Dusuk', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-300', icon: Info },
};

const SEVERITY_OPTIONS: FindingSeverity[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

export function FindingsPanel({ findings, loading, workpaperId, controlId, failedSteps = [], onAddFinding }: FindingsPanelProps) {
  const navigate = useNavigate();

  const handleOpenStudio = () => {
    navigate('/execution/findings/new', {
      state: {
        workpaperId,
        controlId,
        failedSteps: failedSteps.length,
      },
    });
  };

  const critical = findings.filter(f => f.severity === 'CRITICAL').length;
  const high = findings.filter(f => f.severity === 'HIGH').length;
  const medium = findings.filter(f => f.severity === 'MEDIUM').length;
  const low = findings.filter(f => f.severity === 'LOW').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="animate-spin text-blue-600 mr-2" size={20} />
        <span className="text-sm text-slate-500">Yukleniyor...</span>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {findings.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          <div className="bg-red-50 border border-red-200 rounded-xl p-2.5 text-center">
            <p className="text-xl font-bold text-red-700">{critical}</p>
            <p className="text-[9px] font-bold text-red-600 uppercase tracking-wider">Kritik</p>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-2.5 text-center">
            <p className="text-xl font-bold text-orange-700">{high}</p>
            <p className="text-[9px] font-bold text-orange-600 uppercase tracking-wider">Yuksek</p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-center">
            <p className="text-xl font-bold text-amber-700">{medium}</p>
            <p className="text-[9px] font-bold text-amber-600 uppercase tracking-wider">Orta</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-2.5 text-center">
            <p className="text-xl font-bold text-blue-700">{low}</p>
            <p className="text-[9px] font-bold text-blue-600 uppercase tracking-wider">Dusuk</p>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {findings.map((finding) => {
          const cfg = SEVERITY_CONFIG[finding.severity];
          const SevIcon = cfg.icon;

          return (
            <div
              key={finding.id}
              className={clsx('border rounded-xl p-4 transition-all hover:shadow-sm', cfg.border, `${cfg.bg}/40`)}
            >
              <div className="flex items-start gap-3">
                <div className={clsx('mt-0.5 p-2 rounded-lg shrink-0', cfg.bg)}>
                  <SevIcon size={16} className={cfg.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-bold text-slate-900 truncate">{finding.title}</h4>
                    <span className={clsx(
                      'shrink-0 px-2 py-0.5 text-[10px] font-bold rounded-full border',
                      cfg.bg, cfg.color, cfg.border
                    )}>
                      {cfg.label}
                    </span>
                  </div>
                  {finding.description && (
                    <p className="text-xs text-slate-600 leading-relaxed mb-2 line-clamp-3">{finding.description}</p>
                  )}
                  <div className="flex items-center gap-3 text-[11px] text-slate-500">
                    {finding.source_ref && (
                      <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                        {finding.source_ref}
                      </span>
                    )}
                    <span>{new Date(finding.created_at).toLocaleDateString('tr-TR')}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {findings.length === 0 && (
        <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-xl">
          <FileSearch className="mx-auto text-slate-300 mb-3" size={40} />
          <p className="text-sm text-slate-500 font-medium">Henuz bulgu kaydedilmedi</p>
          <p className="text-xs text-slate-400 mt-1">Test sonuclarina gore bulgu olusturmak icin Stüdyo'yu kullanin</p>
        </div>
      )}

      {failedSteps.length > 0 && (
        <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 border-2 border-amber-200 rounded-xl">
          <AlertTriangle size={18} className="text-amber-600 shrink-0" />
          <div className="flex-1">
            <p className="text-xs font-bold text-amber-800">
              <span className="text-base">{failedSteps.length}</span> tamamlanmamis test adimi mevcut
            </p>
            <p className="text-[11px] text-amber-700 mt-0.5">
              Bulgu Stüdyosu'nda detayli analiz ve dokümantasyon yapabilirsiniz
            </p>
          </div>
        </div>
      )}

      <div className="border-t-2 border-slate-100 pt-5 mt-2">
        <button
          onClick={handleOpenStudio}
          className="w-full group relative overflow-hidden flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-rose-600 via-pink-600 to-rose-600 text-white rounded-xl font-bold text-base shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          <Sparkles className="shrink-0 animate-pulse" size={22} />
          <span>Detaylı Bulgu Stüdyosunu Aç</span>
          <ExternalLink className="shrink-0" size={18} />
        </button>
        <p className="text-center text-xs text-slate-500 mt-3 px-4">
          Stüdyo: 5-Whys RCA, GIAS kategorileme, risk skorlama, mevzuat eşleştirme ve müzakere akışı
        </p>
      </div>
    </div>
  );
}
