import { useState, useEffect } from 'react';
import { 
  History, Upload, CheckCircle2, Clock, 
  ExternalLink, FileCheck, AlertOctagon, XCircle, Filter
} from 'lucide-react';
import clsx from 'clsx';

// --- MİMARİ BAĞLANTILAR ---
import { mockComprehensiveFindings } from '@/entities/finding/api/mock-comprehensive-data';
import type { ComprehensiveFinding, ActionPlan } from '@/entities/finding/model/types';

// --- UI BİLEŞENLERİ ---
import { GlassCard } from '@/shared/ui/GlassCard';

interface Phase5Props {
  findingId: string;
}

export default function FindingStudioPhase5Page({ findingId }: Phase5Props) {
  // STATE
  const [finding, setFinding] = useState<ComprehensiveFinding | null>(null);
  const [actionPlans, setActionPlans] = useState<ActionPlan[]>([]);
  
  // Kanıt Reddetme State'i
  const [rejectingProofId, setRejectingProofId] = useState<string | null>(null);
  const [proofRejectionReason, setProofRejectionReason] = useState('');

  // 1. VERİ YÜKLEME
  useEffect(() => {
    const data = mockComprehensiveFindings.find(f => f.id === findingId);
    if (data) {
        setFinding(data);
        setActionPlans(data.action_plans as unknown as ActionPlan[] || []);
    }
  }, [findingId]);

  // --- HANDLERS ---
  const handleRejectProofClick = (planId: string) => {
    setRejectingProofId(planId);
    setProofRejectionReason('');
  };

  const confirmProofRejection = (planId: string) => {
    if (!proofRejectionReason.trim()) return;
    
    // Mock Update: Statüyü geri çek
    setActionPlans(prev => prev.map(p => 
      p.id === planId ? { 
          ...p, 
          status: 'IN_PROGRESS', // Tekrar işleme alındı
          current_state: 'REJECTED', // Kanıt reddedildi
          auditor_rejection_reason: proofRejectionReason 
      } : p
    ));
    
    setRejectingProofId(null);
    setProofRejectionReason('');
  };

  const handleApproveProof = (planId: string) => {
    // Mock Update: Tamamlandı
    setActionPlans(prev => prev.map(p => 
      p.id === planId ? { ...p, status: 'COMPLETED', current_state: 'ACCEPTED' } : p
    ));
  };

  if (!finding) return <div className="p-8 text-center text-slate-500">Veriler yükleniyor...</div>;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8 pb-24">
      
      {/* 1. Header Banner (Likit Glass) */}
      <GlassCard className="!bg-gradient-to-r from-blue-600 to-indigo-600 text-white !border-0" neonGlow="blue">
        <div className="flex items-start gap-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm shadow-inner">
                <History className="text-white" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">Takip Süreci (Follow-up)</h3>
              <p className="text-blue-100 text-sm leading-relaxed opacity-90">
                Bu bulgu <strong>{new Date().toLocaleDateString('tr-TR')}</strong> tarihinde kapatılmıştır. 
                Aksiyon planlarının gerçekleşme durumları ve kanıt yüklemeleri bu ekrandan takip edilir.
              </p>
            </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-12 gap-8">
          
          {/* SOL: AKSİYON LİSTESİ */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
              <GlassCard className="p-0 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Clock size={18} className="text-indigo-600"/> Aksiyon Takip Listesi
                    </h3>
                    <div className="flex gap-2">
                        <span className="text-xs font-bold bg-white border border-slate-200 text-slate-600 px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                            <Filter size={12}/> Tümü
                        </span>
                        <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full">
                            {actionPlans.length} Aksiyon
                        </span>
                    </div>
                </div>
                
                <div className="divide-y divide-slate-100">
                    {actionPlans.map(plan => (
                      <div key={plan.id} className="p-6 hover:bg-slate-50/80 transition-colors">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <div className="font-bold text-slate-800 text-lg">{plan.title}</div>
                                <div className="text-xs text-slate-500 mt-1">{plan.description}</div>
                            </div>
                            <span className={clsx("px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 shadow-sm", 
                                plan.status === 'COMPLETED' 
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                    : 'bg-blue-50 text-blue-700 border-blue-100'
                            )}>
                                {plan.status === 'COMPLETED' ? <CheckCircle2 size={14}/> : <Clock size={14}/>}
                                {plan.status === 'COMPLETED' ? 'TAMAMLANDI' : 'DEVAM EDİYOR'}
                            </span>
                        </div>

                        <div className="flex items-center gap-6 text-sm text-slate-600 mt-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-400 uppercase">Sorumlu:</span>
                                <span className="font-bold text-slate-700">{plan.responsible_person || 'Atanmadı'}</span>
                            </div>
                            <div className="w-px h-4 bg-slate-300"></div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-400 uppercase">Vade:</span>
                                <span className="font-mono font-bold text-slate-700">{plan.target_date}</span>
                            </div>
                            <div className="ml-auto">
                                {/* Mock Kalan Süre */}
                                <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded border border-orange-100 inline-flex items-center gap-1">
                                    <Clock size={10}/> 12 Gün Kaldı
                                </span>
                            </div>
                        </div>

                        {/* KANIT VE İŞLEM BUTONLARI */}
                        <div className="mt-4 flex justify-between items-center pt-4 border-t border-slate-100 border-dashed">
                            <div className="text-xs text-slate-400 font-bold uppercase flex items-center gap-2">
                                <FileCheck size={14}/> Kanıt Durumu:
                                <span className={clsx("text-slate-600", rejectingProofId === plan.id && "text-red-600")}>
                                    {rejectingProofId === plan.id ? 'İade Ediliyor...' : 'Bekleniyor / İnceleniyor'}
                                </span>
                            </div>
                            
                            <div className="flex gap-2">
                                {plan.status !== 'COMPLETED' && rejectingProofId !== plan.id && (
                                    <>
                                        <button className="px-3 py-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg text-xs font-bold transition-colors flex items-center gap-1">
                                            <ExternalLink size={14}/> Kanıtı İncele
                                        </button>
                                        <button 
                                            onClick={() => handleRejectProofClick(plan.id)}
                                            className="px-3 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                                        >
                                            <XCircle size={14}/> Reddet
                                        </button>
                                        <button 
                                            onClick={() => handleApproveProof(plan.id)}
                                            className="px-3 py-1.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 shadow-sm"
                                        >
                                            <CheckCircle2 size={14}/> Onayla ve Kapat
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* REDDETME FORMU */}
                        {rejectingProofId === plan.id && (
                            <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-xl animate-in fade-in slide-in-from-top-2">
                                <h4 className="text-xs font-bold text-red-800 mb-2 flex items-center gap-2">
                                    <AlertOctagon size={14}/> Kanıt Red Gerekçesi
                                </h4>
                                <textarea 
                                    className="w-full border border-red-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-red-500 mb-3 min-h-[80px] bg-white"
                                    placeholder="Neden bu kanıtı yetersiz buldunuz? (Örn: Ekran görüntüsü güncel değil, imza eksik...)"
                                    value={proofRejectionReason}
                                    onChange={(e) => setProofRejectionReason(e.target.value)}
                                />
                                <div className="flex justify-end gap-2">
                                    <button 
                                        onClick={() => setRejectingProofId(null)} 
                                        className="px-3 py-1.5 text-slate-500 text-xs font-bold hover:text-slate-800"
                                    >
                                        İptal
                                    </button>
                                    <button 
                                        onClick={() => confirmProofRejection(plan.id)} 
                                        className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 shadow-sm"
                                    >
                                        İadeyi Onayla
                                    </button>
                                </div>
                            </div>
                        )}
                      </div>
                    ))}
                </div>
              </GlassCard>
          </div>

          {/* SAĞ: AUDIT TRAIL (LOGLAR) */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
              <GlassCard className="p-6 sticky top-24" neonGlow="none">
                  <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                      <FileCheck size={18} className="text-emerald-600"/> Son Aktiviteler (Audit Trail)
                  </h3>
                  
                  <div className="space-y-6 pl-2 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                      
                      {/* Log 1 */}
                      <div className="flex gap-4 items-start relative group">
                          <div className="w-9 h-9 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center text-slate-500 shrink-0 z-10 group-hover:border-indigo-400 group-hover:text-indigo-600 transition-colors">
                              <Upload size={14}/>
                          </div>
                          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 w-full group-hover:bg-white group-hover:shadow-sm transition-all">
                              <div className="flex justify-between items-start">
                                  <p className="text-sm text-slate-800 leading-snug"><span className="font-bold">Mehmet Kara</span> "Kasa Tutanakları.pdf" dosyasını yükledi.</p>
                              </div>
                              <div className="flex justify-between items-center mt-2">
                                  <span className="text-[10px] text-slate-400 font-mono">14:30</span>
                                  <button className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1">
                                      <ExternalLink size={10}/> İncele
                                  </button>
                              </div>
                          </div>
                      </div>

                      {/* Log 2 */}
                      <div className="flex gap-4 items-start relative group">
                          <div className="w-9 h-9 rounded-full bg-white border-2 border-orange-200 flex items-center justify-center text-orange-500 shrink-0 z-10 group-hover:bg-orange-50 transition-colors">
                              <AlertOctagon size={14}/>
                          </div>
                          <div className="bg-orange-50 p-3 rounded-lg border border-orange-100 w-full">
                              <div className="flex justify-between items-start">
                                  <p className="text-sm text-orange-900 leading-snug"><span className="font-bold">Sistem</span> aksiyon vadesine 3 gün kaldığı için sorumluya hatırlatma gönderdi.</p>
                              </div>
                              <span className="text-[10px] text-orange-400 font-mono mt-1 block">Dün, 09:00</span>
                          </div>
                      </div>

                  </div>
              </GlassCard>
          </div>

      </div>
    </div>
  );
}