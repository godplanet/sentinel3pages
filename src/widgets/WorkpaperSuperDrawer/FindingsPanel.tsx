import { AlertTriangle, Plus, ShieldAlert, Shield, ShieldCheck, Activity, Trash2, ExternalLink } from 'lucide-react';
import clsx from 'clsx';
import { useNavigate } from 'react-router-dom'; // Stüdyoya gitmek için

// Types
import type { WorkpaperFindingRow } from '@/entities/workpaper/model/detail-types';

interface FindingsPanelProps {
  findings: WorkpaperFindingRow[];
  loading: boolean;
  workpaperId: string;
  controlId?: string;
  failedSteps?: any[];
  onAddFinding: () => void; // DİKKAT: Artık parametre almıyor, sadece tetikleyici.
}

export function FindingsPanel({ findings, loading, onAddFinding }: FindingsPanelProps) {
  const navigate = useNavigate();

  // Risk İkonu Helper
  const getRiskStyle = (severity: string) => {
      switch(severity) {
          case 'CRITICAL': return { color: 'text-red-700', bg: 'bg-red-50', icon: ShieldAlert };
          case 'HIGH': return { color: 'text-orange-700', bg: 'bg-orange-50', icon: AlertTriangle };
          case 'MEDIUM': return { color: 'text-amber-700', bg: 'bg-amber-50', icon: Shield };
          default: return { color: 'text-blue-700', bg: 'bg-blue-50', icon: ShieldCheck };
      }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
          <h3 className="font-bold text-slate-800">Bulgu Listesi ({findings.length})</h3>
          <button 
            onClick={onAddFinding} // Sadece tıklama olayını yukarı iletiyor
            className="px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 flex items-center gap-2 transition-all shadow-sm active:scale-95"
          >
              <Plus size={16}/> Yeni Bulgu Ekle
          </button>
      </div>

      {/* LİSTE */}
      {findings.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm text-slate-400">
                  <AlertTriangle size={24}/>
              </div>
              <p className="text-sm text-slate-500 font-medium">Henüz kayıtlı bulgu yok.</p>
              <p className="text-xs text-slate-400 mt-1">Eksiklik tespit ettiyseniz yukarıdaki butondan ekleyin.</p>
          </div>
      ) : (
          <div className="grid gap-4">
              {findings.map(finding => {
                  const style = getRiskStyle(finding.severity);
                  const Icon = style.icon;
                  return (
                      <div key={finding.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                          <div className="flex justify-between items-start">
                              <div className="flex gap-3">
                                  <div className={`p-2 rounded-lg ${style.bg} ${style.color}`}>
                                      <Icon size={20}/>
                                  </div>
                                  <div>
                                      <h4 className="font-bold text-slate-900 text-sm">{finding.title}</h4>
                                      <div className="flex items-center gap-2 mt-1">
                                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${style.bg} ${style.color} border-current opacity-80`}>
                                              {finding.severity}
                                          </span>
                                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                              <Activity size={10}/> {finding.status}
                                          </span>
                                      </div>
                                  </div>
                              </div>
                              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button onClick={() => navigate(`/execution/findings/${finding.id}`)} className="p-2 bg-slate-50 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 rounded-lg transition-colors" title="Stüdyoda Aç">
                                      <ExternalLink size={16}/>
                                  </button>
                              </div>
                          </div>
                          <p className="text-xs text-slate-600 mt-3 line-clamp-2 pl-[50px]">{finding.description}</p>
                      </div>
                  );
              })}
          </div>
      )}
    </div>
  );
}