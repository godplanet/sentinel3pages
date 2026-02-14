import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, XCircle, ArrowLeft, Save, ShieldCheck, 
  MessageSquare, History, FileCheck, Lock, AlertOctagon 
} from 'lucide-react';
import clsx from 'clsx';

// --- MİMARİ BAĞLANTILAR (Single Source) ---
import { mockComprehensiveFindings } from '@/entities/finding/api/mock-comprehensive-data';
import type { ComprehensiveFinding, ActionPlan } from '@/entities/finding/model/types';
import { useParameterStore } from '@/shared/stores/parameter-store';

// --- BİLEŞENLER ---
import { ViewSwitcher } from '@/features/finding-studio/components/ViewSwitcher';
import { WorkflowStepper } from '@/widgets/FindingStudio/WorkflowStepper';
import { UniversalFindingDrawer } from '@/widgets/UniversalFindingDrawer';
import { FindingSignOff } from '@/features/finding-studio/components/FindingSignOff';

export default function FindingStudioPhase4Page() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getSeverityColor } = useParameterStore();

  // STATE
  const [finding, setFinding] = useState<ComprehensiveFinding | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionPlans, setActionPlans] = useState<ActionPlan[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  // Değerlendirme State'leri
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // 1. VERİ YÜKLEME
  useEffect(() => {
    const found = mockComprehensiveFindings.find(f => f.id === id) || mockComprehensiveFindings[0];
    if (found) {
        setFinding(found);
        setActionPlans(found.action_plans as unknown as ActionPlan[] || []);
    }
    setLoading(false);
  }, [id]);

  // --- HANDLERS ---

  const handleApprovePlan = (planId: string) => {
    setActionPlans(prev => prev.map(p => 
      p.id === planId ? { ...p, status: 'APPROVED', current_state: 'ACCEPTED' } : p
    ));
  };

  const handleRejectClick = (planId: string) => {
    setRejectingId(planId);
    setRejectionReason('');
  };

  const confirmRejection = (planId: string) => {
    if (!rejectionReason.trim()) return;
    
    setActionPlans(prev => prev.map(p => 
      p.id === planId ? { 
          ...p, 
          status: 'DRAFT', // Geri gönderildiği için Draft olur
          current_state: 'REJECTED', 
          auditor_rejection_reason: rejectionReason 
      } : p
    ));
    
    setRejectingId(null);
    setRejectionReason('');
  };

  const cancelRejection = () => {
    setRejectingId(null);
    setRejectionReason('');
  };

  if (loading || !finding) return <div className="h-screen flex items-center justify-center bg-slate-50">Yükleniyor...</div>;

  const allPlansEvaluated = actionPlans.every(p => p.current_state === 'ACCEPTED');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-blue-50/30 font-sans">
      
      {/* --- HEADER --- */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 px-6 h-16 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
            <button onClick={() => navigate('/execution/findings')} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
                <ArrowLeft size={20} />
            </button>
            <div>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-400">{finding.code}</span>
                    <span className={clsx("px-2 py-0.5 rounded text-[10px] font-bold border", getSeverityColor(finding.severity))}>
                        {finding.severity}
                    </span>
                </div>
                <h1 className="text-sm font-bold text-slate-900 truncate max-w-[400px]">{finding.title}</h1>
            </div>
        </div>

        <ViewSwitcher findingId={finding.id} />

        <div className="flex items-center gap-2">
            <button onClick={() => setIsDrawerOpen(true)} className="px-4 py-2 border border-slate-200 bg-white text-slate-600 rounded-lg font-bold text-xs hover:bg-slate-50">
                Detaylar
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg font-bold text-xs hover:bg-slate-800 shadow-sm transition-all active:scale-95">
                <Save size={14} /> Kapanışı Onayla
            </button>
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <div className="max-w-[1600px] mx-auto px-8 py-8 pb-24">
        
        {/* Sayfa Başlığı */}
        <div className="mb-6 flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center shadow-sm">
                <ShieldCheck size={20} />
            </div>
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Değerlendirme ve Kapanış</h1>
                <p className="text-sm text-slate-600">Phase 4: Aksiyon Planı Değerlendirmesi ve Nihai Onay</p>
            </div>
        </div>

        {/* Stepper */}
        <div className="mb-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <WorkflowStepper currentStatus="PENDING_APPROVAL" actionPlans={actionPlans as any} />
        </div>

        <div className="grid grid-cols-12 gap-8">
          
          {/* SOL: AKSİYON DEĞERLENDİRME */}
          <div className="col-span-12 lg:col-span-8 space-y-8">
            
            {/* Değerlendirme Listesi */}
            <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Aksiyon Planı Değerlendirmesi</h3>
                
                {actionPlans.map((plan) => (
                    <div 
                        key={plan.id} 
                        className={clsx(
                            "bg-white rounded-xl border p-6 transition-all shadow-sm",
                            plan.current_state === 'ACCEPTED' ? "border-emerald-200 ring-1 ring-emerald-100" :
                            plan.current_state === 'REJECTED' ? "border-red-200 bg-red-50/10" :
                            "border-slate-200 hover:border-indigo-200"
                        )}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={clsx("px-2 py-0.5 rounded text-[10px] font-bold uppercase", 
                                        plan.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                                    )}>
                                        {plan.status}
                                    </span>
                                    {plan.current_state === 'ACCEPTED' && <span className="text-emerald-600 flex items-center gap-1 text-[10px] font-bold"><CheckCircle2 size={12}/> ONAYLANDI</span>}
                                    {plan.current_state === 'REJECTED' && <span className="text-red-600 flex items-center gap-1 text-[10px] font-bold"><XCircle size={12}/> İADE EDİLDİ</span>}
                                </div>
                                <h3 className="font-bold text-slate-800 text-lg">{plan.title}</h3>
                            </div>
                            
                            {/* Değerlendirme Butonları (Sadece Karar Verilmemişse veya İade Modunda Değilse) */}
                            {plan.current_state !== 'ACCEPTED' && rejectingId !== plan.id && (
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => handleRejectClick(plan.id)}
                                        className="px-3 py-1.5 border border-red-200 text-red-600 rounded-lg text-xs font-bold hover:bg-red-50 transition-colors"
                                    >
                                        İade Et
                                    </button>
                                    <button 
                                        onClick={() => handleApprovePlan(plan.id)}
                                        className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 shadow-md transition-colors flex items-center gap-1"
                                    >
                                        <CheckCircle2 size={14}/> Onayla
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="text-sm text-slate-600 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                            {plan.description}
                        </div>

                        {/* İade Formu */}
                        {rejectingId === plan.id && (
                            <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-xl animate-in fade-in slide-in-from-top-2">
                                <h4 className="text-xs font-bold text-red-800 mb-2 flex items-center gap-2">
                                    <AlertOctagon size={14}/> İade Gerekçesi Yazın
                                </h4>
                                <textarea 
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    className="w-full border border-red-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-red-500 mb-3 min-h-[80px]"
                                    placeholder="Neden iade ediyorsunuz? (Örn: Termin tarihi çok geç, kök neden ile uyuşmuyor...)"
                                />
                                <div className="flex justify-end gap-2">
                                    <button onClick={cancelRejection} className="px-3 py-1.5 text-slate-500 text-xs font-bold hover:text-slate-800">İptal</button>
                                    <button onClick={() => confirmRejection(plan.id)} className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700">İadeyi Onayla</button>
                                </div>
                            </div>
                        )}

                        {/* Geçmiş İade Nedeni */}
                        {plan.current_state === 'REJECTED' && plan.auditor_rejection_reason && (
                            <div className="mt-3 pl-3 border-l-2 border-red-400">
                                <div className="text-xs font-bold text-red-600 mb-1">Müfettiş İade Notu:</div>
                                <div className="text-sm text-slate-700">{plan.auditor_rejection_reason}</div>
                            </div>
                        )}
                        
                        <div className="flex items-center gap-6 text-xs text-slate-400 mt-4 border-t border-slate-100 pt-3">
                            <div className="flex items-center gap-1">
                                <span className="font-bold text-slate-500">Sorumlu:</span> {plan.responsible_person}
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="font-bold text-slate-500">Termin:</span> {plan.target_date}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* FİNAL ONAY (Sign-Off) - Sadece her şey onaylıysa aktifleşebilir mantığı */}
            <div className={clsx("transition-all duration-500", allPlansEvaluated ? "opacity-100" : "opacity-50 pointer-events-none grayscale")}>
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden mt-8">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Lock size={20} className="text-slate-400" />
                            <h2 className="text-lg font-bold text-slate-900">Dosya Kapanışı ve Başkan Onayı</h2>
                        </div>
                        {!allPlansEvaluated && (
                            <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded">
                                Önce tüm aksiyonları değerlendirin
                            </span>
                        )}
                    </div>
                    <div className="p-6">
                        <FindingSignOff 
                            findingId={finding.id}
                            currentUserId="u1"
                            currentUserName="Ahmet Yılmaz"
                            currentUserRole="AUDITOR" // Bu kullanıcı hazırlar
                            tenantId="t1"
                            riskLevel={finding.severity}
                        />
                    </div>
                </div>
            </div>

          </div>

          {/* SAĞ PANEL: ÖZET VE TARİHÇE */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
             
             {/* Durum Kartı */}
             <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm sticky top-24">
                 <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                     <FileCheck size={18} className="text-emerald-600"/> Değerlendirme Özeti
                 </h3>
                 
                 <div className="space-y-4 mb-6">
                     <div className="flex justify-between items-center text-sm">
                         <span className="text-slate-500">Toplam Aksiyon</span>
                         <span className="font-bold text-slate-800">{actionPlans.length}</span>
                     </div>
                     <div className="flex justify-between items-center text-sm">
                         <span className="text-emerald-600 font-medium">Onaylanan</span>
                         <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                             {actionPlans.filter(p => p.current_state === 'ACCEPTED').length}
                         </span>
                     </div>
                     <div className="flex justify-between items-center text-sm">
                         <span className="text-red-600 font-medium">İade Edilen</span>
                         <span className="font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded">
                             {actionPlans.filter(p => p.current_state === 'REJECTED').length}
                         </span>
                     </div>
                     
                     <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                         <div 
                            className="h-full bg-emerald-500 transition-all duration-700" 
                            style={{ width: `${(actionPlans.filter(p => p.current_state === 'ACCEPTED').length / actionPlans.length) * 100}%`}}
                         />
                     </div>
                 </div>

                 <button 
                    onClick={() => setIsDrawerOpen(true)}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-slate-50 border border-slate-200 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-100 transition-colors"
                 >
                     <History size={16}/> Geçmişi Görüntüle
                 </button>
             </div>

             {/* Hızlı Bilgi */}
             <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                 <div className="flex gap-3">
                     <MessageSquare className="text-blue-600 shrink-0" size={20} />
                     <div>
                         <h4 className="text-sm font-bold text-blue-900">Müzakere Notu</h4>
                         <p className="text-xs text-blue-800/80 mt-1 leading-relaxed">
                             Aksiyon planları iade edildiğinde, denetlenen birime otomatik bildirim gönderilir ve süreç "Müzakere" fazına geri döner.
                         </p>
                     </div>
                 </div>
             </div>

          </div>

        </div>
      </div>

      {/* UNIVERSAL DRAWER */}
      <UniversalFindingDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        findingId={finding.id}
        defaultTab="history" // Varsayılan tarihçe
        currentViewMode="studio"
      />

    </div>
  );
}