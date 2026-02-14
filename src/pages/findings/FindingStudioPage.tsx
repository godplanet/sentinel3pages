import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, ArrowLeft, Save, AlertTriangle, Scale, 
  Lock, FileText, Users, Send, Plus, Clock, MoreVertical,
  MessageSquare, ShieldCheck, History, XCircle, FileCheck,
  Upload, ExternalLink, AlertOctagon
} from 'lucide-react';
import clsx from 'clsx';

// --- MİMARİ BAĞLANTILAR (Single Source) ---
import { mockComprehensiveFindings } from '@/entities/finding/api/mock-comprehensive-data';
import type { ComprehensiveFinding, ActionPlan, FindingState } from '@/entities/finding/model/types';
import { useParameterStore } from '@/shared/stores/parameter-store';

// --- BİLEŞENLER ---
import { ViewSwitcher } from '@/features/finding-studio/components/ViewSwitcher';
import { FindingPaper } from '@/widgets/FindingStudio/FindingPaper';
import { WorkflowStepper } from '@/widgets/FindingStudio/WorkflowStepper';
import { UniversalFindingDrawer } from '@/widgets/UniversalFindingDrawer';
import { ActionPlanCard } from '@/features/finding-studio/components/ActionPlanCard';
import { FindingSignOff } from '@/features/finding-studio/components/FindingSignOff';

// --- MOCK KULLANICILAR (Atama için) ---
const MOCK_USERS = [
  { id: 'u1', name: 'Ahmet Yılmaz', role: 'Kıdemli Denetçi' },
  { id: 'u2', name: 'Mehmet Kara', role: 'Şube Müdürü' },
  { id: 'u3', name: 'Ayşe Demir', role: 'Operasyon Yöneticisi' },
];

export default function FindingStudioPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getSeverityColor } = useParameterStore();

  // STATE YÖNETİMİ
  const [finding, setFinding] = useState<ComprehensiveFinding | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Aktif Sekme (Fazlar)
  const [activeTab, setActiveTab] = useState<'overview' | 'review' | 'negotiation' | 'final' | 'followup'>('overview');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Aksiyon Planları ve Değerlendirme State'leri
  const [actionPlans, setActionPlans] = useState<ActionPlan[]>([]);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // 1. VERİ YÜKLEME VE FAZ TAYİNİ
  useEffect(() => {
    const found = mockComprehensiveFindings.find(f => f.id === id) || mockComprehensiveFindings[0];
    
    if (found) {
        setFinding(found);
        // Tip güvenliği için cast işlemi (Mock verideki uyumsuzlukları önlemek için)
        setActionPlans(found.action_plans as unknown as ActionPlan[] || []);
        
        // Akıllı Başlangıç Sekmesi (State -> Tab)
        switch (found.state) {
            case 'IN_REVIEW':
            case 'PENDING_APPROVAL':
                setActiveTab('review');
                break;
            case 'NEGOTIATION':
                setActiveTab('negotiation');
                break;
            case 'FINAL':
                setActiveTab('final');
                break;
            case 'CLOSED':
            case 'FOLLOW_UP':
                setActiveTab('followup'); // Phase 5
                break;
            default:
                setActiveTab('overview');
        }
    }
    setLoading(false);
  }, [id]);

  // --- HANDLERS ---

  const handleAddActionPlan = () => {
    const newPlan: ActionPlan = {
      id: `ap-${Date.now()}`,
      finding_id: finding?.id || '',
      title: 'Yeni Aksiyon Planı',
      description: '',
      responsible_person: '',
      target_date: new Date().toISOString().split('T')[0],
      status: 'DRAFT',
      current_state: 'PROPOSED',
      created_at: new Date().toISOString()
    };
    setActionPlans([...actionPlans, newPlan]);
  };

  const handleUpdateActionPlan = (planId: string, updates: Partial<ActionPlan>) => {
    setActionPlans(prev => prev.map(p => p.id === planId ? { ...p, ...updates } : p));
  };

  const handleDeleteActionPlan = (planId: string) => {
    setActionPlans(prev => prev.filter(p => p.id !== planId));
  };

  // Phase 4: Değerlendirme Fonksiyonları
  const handleApprovePlan = (planId: string) => {
    setActionPlans(prev => prev.map(p => 
      p.id === planId ? { ...p, status: 'APPROVED', current_state: 'ACCEPTED' } : p
    ));
  };

  const confirmRejection = (planId: string) => {
    if (!rejectionReason.trim()) return;
    setActionPlans(prev => prev.map(p => 
      p.id === planId ? { 
          ...p, 
          status: 'DRAFT', 
          current_state: 'REJECTED', 
          auditor_rejection_reason: rejectionReason 
      } : p
    ));
    setRejectingId(null);
    setRejectionReason('');
  };

  if (loading || !finding) return <div className="h-screen flex items-center justify-center bg-slate-50">Yükleniyor...</div>;

  // Tüm aksiyonlar onaylandı mı? (Finale geçiş için)
  const allPlansEvaluated = actionPlans.length > 0 && actionPlans.every(p => p.current_state === 'ACCEPTED');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 flex flex-col font-sans">
      
      {/* --- HEADER --- */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 px-6 h-16 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
            <button onClick={() => navigate('/execution/findings')} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
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
            <button 
                onClick={() => setIsDrawerOpen(true)}
                className="px-4 py-2 border border-slate-200 bg-white text-slate-600 rounded-lg font-bold text-xs hover:bg-slate-50 flex items-center gap-2"
            >
                <MessageSquare size={14}/> Bağlam
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold text-xs hover:bg-indigo-700 shadow-sm shadow-indigo-200 transition-all active:scale-95">
                <Save size={14} /> Kaydet
            </button>
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 max-w-[1600px] mx-auto w-full p-8 pb-20">
        
        {/* WORKFLOW STEPPER */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
             <WorkflowStepper 
                currentStatus={finding.state} 
                actionPlans={actionPlans as any} 
             />
        </div>

        {/* PHASE TABS (5 FAZLI YAPI) */}
        <div className="flex gap-2 mb-6 border-b border-slate-200 pb-1 overflow-x-auto">
            <PhaseTab id="overview" label="1. Genel Bakış" icon={FileText} active={activeTab} onClick={setActiveTab} />
            <PhaseTab id="review" label="2. QA / Gözden Geçirme" icon={Users} active={activeTab} onClick={setActiveTab} notification={finding.review_notes?.length} />
            <PhaseTab id="negotiation" label="3. Müzakere" icon={Scale} active={activeTab} onClick={setActiveTab} notification={actionPlans.length} />
            <PhaseTab id="final" label="4. Değerlendirme & Kapanış" icon={Lock} active={activeTab} onClick={setActiveTab} />
            <PhaseTab id="followup" label="5. Takip (Follow-up)" icon={History} active={activeTab} onClick={setActiveTab} />
        </div>

        {/* --- DYNAMIC CONTENT AREA --- */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-[500px]">
            
            {/* =========================================================
                PHASE 1: GENEL BAKIŞ (Overview)
               ========================================================= */}
            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <FindingPaper finding={finding} />
                    </div>
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Lock size={16} className="text-amber-500"/> Gizli Denetçi Notları</h3>
                            <div className="bg-amber-50/50 p-4 rounded-lg border border-amber-100 text-sm text-slate-700 leading-relaxed italic">
                                {finding.secrets?.internal_notes || 'Bu bulgu ile ilgili henüz özel bir not girilmemiştir.'}
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                             <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><ShieldCheck size={16}/> AI Analizi</h3>
                             <p className="text-xs text-slate-600 leading-relaxed">{finding.secrets?.root_cause_analysis_internal || 'Analiz verisi yok.'}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* =========================================================
                PHASE 2: GÖZDEN GEÇİRME (Review)
               ========================================================= */}
            {activeTab === 'review' && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
                    <div className="flex items-center justify-between mb-8">
                         <div className="flex items-center gap-3 p-4 bg-orange-50 border border-orange-100 rounded-lg text-orange-800 max-w-2xl">
                            <AlertTriangle size={24} />
                            <div>
                                <h4 className="font-bold text-sm">Yönetici Kontrolü</h4>
                                <p className="text-xs mt-1">Bulgu taslak aşamasındadır. Onaylanmadan denetlenen birime gönderilemez.</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                             <button className="px-5 py-2.5 border border-red-200 text-red-700 bg-red-50 rounded-lg text-sm font-bold hover:bg-red-100">Revize İste</button>
                             <button className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 shadow-lg">Onayla ve Yayınla</button>
                        </div>
                    </div>
                    {/* Review Notes Alanı */}
                    <div className="space-y-4 max-w-3xl">
                        {finding.review_notes?.map(note => (
                            <div key={note.id} className="border border-slate-200 rounded-lg p-4 bg-slate-50/30">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-bold text-sm text-slate-800">{note.reviewer_name}</span>
                                    <span className="text-[10px] bg-slate-200 px-2 py-1 rounded">{note.status}</span>
                                </div>
                                <p className="text-sm text-slate-600">{note.note_text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* =========================================================
                PHASE 3: MÜZAKERE (Negotiation)
               ========================================================= */}
            {activeTab === 'negotiation' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg"><Scale size={24} /></div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-800">Aksiyon Planı Müzakeresi</h2>
                                <p className="text-sm text-slate-500">Denetlenen birim ile mutabakat ve aksiyon oluşturma.</p>
                            </div>
                        </div>
                        <button onClick={handleAddActionPlan} className="px-5 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800 flex items-center gap-2 shadow-md active:scale-95">
                             <Plus size={16} /> Yeni Aksiyon Ekle
                        </button>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-6">
                        {actionPlans.length > 0 ? (
                            actionPlans.map((plan, index) => (
                                <ActionPlanCard 
                                    key={plan.id || index}
                                    actionPlan={plan}
                                    onUpdate={(updates: any) => handleUpdateActionPlan(plan.id, updates)}
                                    onDelete={() => handleDeleteActionPlan(plan.id)}
                                    availableOwners={MOCK_USERS}
                                />
                            ))
                        ) : (
                            <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-16 text-center">
                                <h3 className="font-bold text-slate-600">Henüz Aksiyon Planı Yok</h3>
                                <p className="text-sm text-slate-500 mt-2 mb-6">Denetlenen birim henüz bir aksiyon girmedi.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* =========================================================
                PHASE 4: FİNAL & ONAY (Evaluation)
               ========================================================= */}
            {activeTab === 'final' && (
                <div className="space-y-8">
                    {/* Aksiyon Değerlendirme Listesi */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                            <h3 className="font-bold text-slate-800">Müfettiş Değerlendirmesi</h3>
                            <p className="text-xs text-slate-500">Gelen aksiyon planlarını inceleyip onaylayın veya iade edin.</p>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {actionPlans.map(plan => (
                                <div key={plan.id} className="p-6 hover:bg-slate-50/50 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold text-slate-800">{plan.title}</h4>
                                        <div className="flex gap-2">
                                            {plan.current_state === 'ACCEPTED' ? (
                                                <span className="text-emerald-600 flex items-center gap-1 text-xs font-bold"><CheckCircle2 size={14}/> ONAYLANDI</span>
                                            ) : plan.current_state === 'REJECTED' ? (
                                                <span className="text-red-600 flex items-center gap-1 text-xs font-bold"><XCircle size={14}/> İADE EDİLDİ</span>
                                            ) : (
                                                <>
                                                    <button onClick={() => { setRejectingId(plan.id); setRejectionReason(''); }} className="px-3 py-1 border border-red-200 text-red-600 rounded text-xs font-bold hover:bg-red-50">İade Et</button>
                                                    <button onClick={() => handleApprovePlan(plan.id)} className="px-3 py-1 bg-emerald-600 text-white rounded text-xs font-bold hover:bg-emerald-700">Onayla</button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-600 mb-2">{plan.description}</p>
                                    
                                    {/* İade Formu */}
                                    {rejectingId === plan.id && (
                                        <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-100 animate-in fade-in">
                                            <h5 className="text-xs font-bold text-red-800 mb-2 flex items-center gap-1"><AlertOctagon size={12}/> İade Gerekçesi</h5>
                                            <textarea 
                                                className="w-full p-2 border border-red-200 rounded text-sm mb-2" 
                                                value={rejectionReason}
                                                onChange={(e) => setRejectionReason(e.target.value)}
                                                placeholder="Neden iade ediyorsunuz?"
                                            />
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => setRejectingId(null)} className="text-xs font-bold text-slate-500">İptal</button>
                                                <button onClick={() => confirmRejection(plan.id)} className="text-xs font-bold bg-red-600 text-white px-3 py-1.5 rounded">Onayla</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Final Sign-Off (Sadece hepsi onaylıysa aktif) */}
                    <div className={clsx("transition-all duration-500", allPlansEvaluated ? "opacity-100" : "opacity-50 pointer-events-none grayscale")}>
                        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
                             <div className="mb-6 pb-6 border-b border-slate-100 text-center">
                                 <h2 className="text-xl font-bold text-slate-900">Dosya Kapanış Onayı</h2>
                                 <p className="text-sm text-slate-500 mt-1">Tüm aksiyonlar onaylanmıştır. Raporu kapatmak için imzalayınız.</p>
                             </div>
                             <FindingSignOff 
                                findingId={finding.id}
                                currentUserId="u1"
                                currentUserName="Ahmet Yılmaz"
                                currentUserRole="AUDITOR"
                                tenantId="t1"
                                riskLevel={finding.severity}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* =========================================================
                PHASE 5: TAKİP (Follow-up) - YENİ ÖZELLİK
               ========================================================= */}
            {activeTab === 'followup' && (
                <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 flex items-start gap-4">
                        <History className="text-blue-600 mt-1" size={24} />
                        <div>
                            <h3 className="font-bold text-blue-900 text-lg">Takip Süreci (Follow-up)</h3>
                            <p className="text-blue-800/80 text-sm mt-1">
                                Bu bulgu kapatılmıştır. Şu an aksiyon planlarının gerçekleşme durumları izlenmektedir.
                                Termin tarihi gelen aksiyonlar için kanıt yüklenmesi bekleniyor.
                            </p>
                        </div>
                    </div>

                    {/* Aksiyon Takip Tablosu */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-200">
                                <tr>
                                    <th className="p-4 w-1/3">Aksiyon Başlığı</th>
                                    <th className="p-4">Sorumlu</th>
                                    <th className="p-4">Vade</th>
                                    <th className="p-4">Kalan Süre</th>
                                    <th className="p-4">Durum</th>
                                    <th className="p-4 text-right">Kanıt</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {actionPlans.map(plan => (
                                    <tr key={plan.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-4">
                                            <div className="font-bold text-slate-800">{plan.title}</div>
                                            <div className="text-xs text-slate-500 line-clamp-1">{plan.description}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-[10px] font-bold">
                                                    {plan.responsible_person?.[0]}
                                                </div>
                                                <span className="text-slate-700">{plan.responsible_person}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 font-mono text-slate-600">{plan.target_date}</td>
                                        <td className="p-4">
                                            <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded border border-orange-100">
                                                12 Gün Kaldı
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={clsx("px-2 py-1 rounded text-xs font-bold border", 
                                                plan.status === 'COMPLETED' ? 'bg-green-100 text-green-700 border-green-200' : 
                                                'bg-blue-50 text-blue-700 border-blue-100'
                                            )}>
                                                {plan.status === 'COMPLETED' ? 'TAMAMLANDI' : 'DEVAM EDİYOR'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button className="text-indigo-600 font-bold hover:underline text-xs flex items-center gap-1 justify-end">
                                                <Upload size={14}/> Kanıt Yükle
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

        </div>
      </main>

      {/* --- UNIVERSAL SIDEBAR --- */}
      <UniversalFindingDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        findingId={finding.id}
        defaultTab="history"
        currentViewMode="studio"
      />

    </div>
  );
}

// --- YARDIMCI BİLEŞEN: SEKME ---
function PhaseTab({ id, label, icon: Icon, active, onClick, notification }: any) {
    const isActive = active === id;
    return (
        <button 
            onClick={() => onClick(id)}
            className={clsx(
                "flex items-center gap-2 px-6 py-3 rounded-t-lg font-bold text-sm transition-all border-b-2 relative shrink-0",
                isActive 
                    ? "border-indigo-600 text-indigo-700 bg-indigo-50/50" 
                    : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
            )}
        >
            <Icon size={16} />
            {label}
            {notification > 0 && (
                <span className="ml-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full min-w-[18px] text-center font-bold shadow-sm">
                    {notification}
                </span>
            )}
        </button>
    );
}