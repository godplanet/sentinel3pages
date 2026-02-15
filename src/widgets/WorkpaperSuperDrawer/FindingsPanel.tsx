import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, Plus, ChevronRight, ExternalLink, 
  Trash2, ShieldAlert, Shield, ShieldCheck, Activity 
} from 'lucide-react';
import clsx from 'clsx';
import { SENTINEL_CONSTITUTION } from '@/shared/config/constitution';
import { mockComprehensiveFindings } from '@/entities/finding/api/mock-comprehensive-data';
import type { WorkpaperFindingRow } from '@/entities/workpaper/model/detail-types';

interface FindingsPanelProps {
  workpaperId: string;
  controlId?: string;
  failedSteps?: any[];
  findings?: WorkpaperFindingRow[]; // Parent'tan gelebilir
  loading?: boolean;
  onAddFinding: () => void;
}

export function FindingsPanel({ 
  workpaperId, 
  findings: propFindings, 
  loading, 
  onAddFinding 
}: FindingsPanelProps) {
  const navigate = useNavigate();
  
  // Eğer dışarıdan prop olarak gelmezse, mock veriyi kullan (Geliştirme için)
  // Gerçek entegrasyonda burası propFindings'e dayalı olacak.
  const displayFindings = propFindings || mockComprehensiveFindings.filter(f => f.workpaper_id === workpaperId) || [];

  const getRiskIcon = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return { icon: ShieldAlert, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' };
      case 'HIGH': return { icon: ShieldAlert, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' };
      case 'MEDIUM': return { icon: Shield, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' };
      default: return { icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' };
    }
  };

  const handleOpenStudio = (findingId: string) => {
    // 5 Fazlı Stüdyoya Yönlendir
    navigate(`/execution/findings/${findingId}`);
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-400">Yükleniyor...</div>;
  }

  return (
    <div className="space-y-6 pb-20">
      
      {/* BAŞLIK & ÖZET */}
      <div className="flex items-center justify-between">
         <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Tespit Edilen Bulgular</h3>
            <p className="text-xs text-slate-500 mt-1">Bu çalışma kağıdına bağlı {displayFindings.length} adet risk kaydı bulundu.</p>
         </div>
         <button 
            onClick={onAddFinding}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-all flex items-center gap-2 shadow-md active:scale-95"
         >
            <Plus size={14}/> Yeni Bulgu Ekle
         </button>
      </div>

      {/* BOŞ DURUM (EMPTY STATE) */}
      {displayFindings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white border-2 border-dashed border-slate-200 rounded-2xl group hover:border-slate-300 transition-colors">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-slate-100 transition-colors">
                  <AlertTriangle className="text-slate-400 group-hover:text-slate-500" size={32} />
              </div>
              <h3 className="text-slate-900 font-bold text-lg">Temiz Görünüyor</h3>
              <p className="text-slate-500 text-sm mt-1 mb-6 text-center max-w-xs">
                  Bu çalışma kağıdı için henüz bir bulgu kaydı oluşturulmamış. Risk tespit ettiyseniz ekleyin.
              </p>
              <button 
                  onClick={onAddFinding}
                  className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 shadow-lg shadow-red-200 transition-all active:scale-95 flex items-center gap-2"
              >
                  <Plus size={18}/> Risk / Bulgu Ekle
              </button>
          </div>
      ) : (
          /* BULGU LİSTESİ (CARDS) */
          <div className="space-y-4">
              {displayFindings.map((finding: any) => {
                  const style = getRiskIcon(finding.severity);
                  const Icon = style.icon;
                  
                  return (
                      <div 
                        key={finding.id} 
                        className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
                      >
                          {/* Sol Renk Çubuğu */}
                          <div className={clsx("absolute left-0 top-0 bottom-0 w-1", style.bg.replace('bg-', 'bg-').replace('50', '500'))}></div>

                          <div className="flex justify-between items-start mb-3">
                              <div className="flex items-center gap-3">
                                  <div className={clsx("p-2 rounded-lg", style.bg, style.color)}>
                                      <Icon size={20} />
                                  </div>
                                  <div>
                                      <div className="flex items-center gap-2">
                                          <span className="text-[10px] font-mono font-bold text-slate-400 border border-slate-200 px-1.5 py-0.5 rounded">
                                              {finding.code || 'DRAFT'}
                                          </span>
                                          <span className={clsx("text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase", style.bg, style.color, style.border)}>
                                              {finding.severity}
                                          </span>
                                      </div>
                                      <h4 className="font-bold text-slate-800 text-base mt-1 line-clamp-1 group-hover:text-blue-600 transition-colors">
                                          {finding.title}
                                      </h4>
                                  </div>
                              </div>

                              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Sil">
                                      <Trash2 size={16}/>
                                  </button>
                              </div>
                          </div>

                          <p className="text-xs text-slate-600 line-clamp-2 mb-4 pl-[52px]">
                              {finding.description}
                          </p>

                          <div className="flex items-center justify-between pl-[52px]">
                              <div className="flex items-center gap-4 text-xs text-slate-400">
                                  <span className="flex items-center gap-1"><Activity size={12}/> Durum: <strong className="text-slate-600">{finding.status}</strong></span>
                                  <span>{new Date(finding.created_at).toLocaleDateString('tr-TR')}</span>
                              </div>
                              
                              <button 
                                  onClick={() => handleOpenStudio(finding.id)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-600 border border-slate-200 rounded-lg text-xs font-bold hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all"
                              >
                                  Stüdyoya Git <ExternalLink size={12}/>
                              </button>
                          </div>
                      </div>
                  );
              })}
          </div>
      )}
    </div>
  );
}