import { useState, useEffect } from 'react';
import { 
  History, Upload, CheckCircle2, Clock, 
  ExternalLink, FileCheck, AlertOctagon, XCircle, Filter
} from 'lucide-react';
import clsx from 'clsx';

// --- MİMARİ BAĞLANTILAR ---
import { mockComprehensiveFindings } from '@/entities/finding/api/mock-comprehensive-data';
import type { ComprehensiveFinding, ActionPlan } from '@/entities/finding/model/types';
import { GlassCard } from '@/shared/ui/GlassCard';

interface Phase5Props {
  findingId: string;
}

export default function FindingStudioPhase5Page({ findingId }: Phase5Props) {
  const [finding, setFinding] = useState<ComprehensiveFinding | null>(null);
  const [actionPlans, setActionPlans] = useState<ActionPlan[]>([]);
  
  // Reddetme State
  const [rejectingProofId, setRejectingProofId] = useState<string | null>(null);
  const [proofRejectionReason, setProofRejectionReason] = useState('');

  useEffect(() => {
    const data = mockComprehensiveFindings.find(f => f.id === findingId);
    if (data) {
        setFinding(data);
        setActionPlans(data.action_plans as unknown as ActionPlan[] || []);
    }
  }, [findingId]);

  const confirmProofRejection = (id: string) => {
    if (!proofRejectionReason.trim()) return;
    setActionPlans(prev => prev.map(p => p.id === id ? { ...p, status: 'IN_PROGRESS', current_state: 'REJECTED' } : p));
    setRejectingProofId(null);
    setProofRejectionReason('');
  };

  const handleApproveProof = (id: string) => {
    setActionPlans(prev => prev.map(p => p.id === id ? { ...p, status: 'COMPLETED', current_state: 'ACCEPTED' } : p));
  };

  if (!finding) return <div className="p-8 text-center">Veriler yükleniyor...</div>;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8 pb-24">
      
      {/* Banner */}
      <GlassCard className="!bg-gradient-to-r from-blue-600 to-indigo-600 text-white !border-0" neonGlow="blue">
        <div className="flex items-start gap-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm"><History className="text-white" size={24} /></div>
            <div>
              <h3 className="font-bold text-lg mb-1">Takip Süreci (Follow-up)</h3>
              <p className="text-blue-100 text-sm leading-relaxed opacity-90">
                Bu bulgu <strong>{new Date().toLocaleDateString('tr-TR')}</strong> tarihinde kapatılmıştır. Takip süreci aktiftir.
              </p>
            </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-8 space-y-6">
              <GlassCard className="p-0 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2"><Clock size={18} className="text-indigo-600"/> Aksiyon Takip</h3>
                    <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full">{actionPlans.length} Aksiyon</span>
                </div>
                
                <div className="divide-y divide-slate-100">
                    {actionPlans.map(plan => (
                      <div key={plan.id} className="p-6 hover:bg-slate-50/80 transition-colors">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <div className="font-bold text-slate-800 text-lg">{plan.title}</div>
                                <span className={clsx("px-2 py-0.5 rounded text-[10px] font-bold border mt-1 inline-block", 
                                    plan.status === 'COMPLETED' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-blue-50 text-blue-700 border-blue-100'
                                )}>
                                    {plan.status === 'COMPLETED' ? 'TAMAMLANDI' : 'DEVAM EDİYOR'}
                                </span>
                            </div>
                            
                            {/* İşlem Butonları */}
                            {plan.status !== 'COMPLETED' && rejectingProofId !== plan.id && (
                                <div className="flex gap-2">
                                    <button className="px-3 py-1.5 text-slate-500 hover:bg-slate-100 rounded text-xs font-bold flex items-center gap-1"><ExternalLink size={14}/> İncele</button>
                                    <button onClick={() => setRejectingProofId(plan.id)} className="px-3 py-1.5 border border-red-200 text-red-600 rounded text-xs font-bold hover:bg-red-50">Reddet</button>
                                    <button onClick={() => handleApproveProof(plan.id)} className="px-3 py-1.5 bg-emerald-600 text-white rounded text-xs font-bold hover:bg-emerald-700">Onayla</button>
                                </div>
                            )}
                        </div>

                        {/* Reddetme Formu */}
                        {rejectingProofId === plan.id && (
                            <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-xl animate-in fade-in">
                                <h4 className="text-xs font-bold text-red-800 mb-2 flex items-center gap-2"><AlertOctagon size={14}/> Red Gerekçesi</h4>
                                <textarea 
                                    className="w-full bg-white border border-red-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-red-500 mb-3"
                                    value={proofRejectionReason}
                                    onChange={(e) => setProofRejectionReason(e.target.value)}
                                    placeholder="Neden bu kanıtı reddediyorsunuz?"
                                />
                                <div className="flex justify-end gap-2">
                                    <button onClick={() => setRejectingProofId(null)} className="px-3 py-1.5 text-slate-500 text-xs font-bold">İptal</button>
                                    <button onClick={() => confirmProofRejection(plan.id)} className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-bold">Reddet</button>
                                </div>
                            </div>
                        )}
                      </div>
                    ))}
                </div>
              </GlassCard>
          </div>

          {/* Sağ Panel: Audit Trail */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
              <GlassCard className="p-6 sticky top-24" neonGlow="none">
                  <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                      <FileCheck size={18} className="text-emerald-600"/> Son Aktiviteler
                  </h3>
                  <div className="space-y-6 pl-2 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                      <div className="flex gap-4 items-start relative">
                          <div className="w-9 h-9 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center text-slate-500 shrink-0 z-10"><Upload size={14}/></div>
                          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 w-full">
                              <p className="text-sm text-slate-800"><span className="font-bold">Sistem</span> bulguyu kapattı ve takibe aldı.</p>
                              <span className="text-[10px] text-slate-400 font-mono mt-1 block">Bugün, 09:00</span>
                          </div>
                      </div>
                  </div>
              </GlassCard>
          </div>
      </div>
    </div>
  );
}