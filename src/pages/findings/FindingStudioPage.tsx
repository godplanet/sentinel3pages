import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, ArrowLeft, Save, AlertTriangle, Scale, 
  Lock, FileText, Users, Send, Layout, Plus, Clock, MoreVertical,
  ChevronDown, MessageSquare
} from 'lucide-react';
import clsx from 'clsx';

// --- MİMARİ BAĞLANTILAR (Single Source) ---
import { mockComprehensiveFindings } from '@/entities/finding/api/mock-comprehensive-data';
import type { ComprehensiveFinding, ActionPlan } from '@/entities/finding/model/types';
import { useParameterStore } from '@/shared/stores/parameter-store';

// --- BİLEŞENLER ---
import { ViewSwitcher } from '@/features/finding-studio/components/ViewSwitcher';
import { FindingPaper } from '@/widgets/FindingStudio/FindingPaper';
import { WorkflowStepper } from '@/widgets/FindingStudio/WorkflowStepper';
import { UniversalFindingDrawer } from '@/widgets/UniversalFindingDrawer';
import { FindingSignOff } from '@/features/finding-studio/components/FindingSignOff'; // Varsa kullanılır, yoksa fallback

// --- MOCK KULLANICILAR (Atama işlemleri için) ---
const MOCK_USERS = [
  { id: 'u1', name: 'Ahmet Yılmaz', role: 'Kıdemli Denetçi', avatar: 'bg-blue-100 text-blue-700' },
  { id: 'u2', name: 'Mehmet Kara', role: 'Şube Müdürü', avatar: 'bg-green-100 text-green-700' },
  { id: 'u3', name: 'Ayşe Demir', role: 'Operasyon Yöneticisi', avatar: 'bg-purple-100 text-purple-700' },
];

export default function FindingStudioPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getSeverityColor } = useParameterStore();

  // STATE
  const [finding, setFinding] = useState<ComprehensiveFinding | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'review' | 'negotiation' | 'final'>('overview');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Aksiyon Planları State'i (UI üzerinde oynamak için)
  const [actionPlans, setActionPlans] = useState<ActionPlan[]>([]);

  // 1. VERİ YÜKLEME
  useEffect(() => {
    // Gerçek API'den veri çekiliyormuş gibi
    const found = mockComprehensiveFindings.find(f => f.id === id) || mockComprehensiveFindings[0];
    
    if (found) {
        setFinding(found);
        setActionPlans(found.action_plans as unknown as ActionPlan[] || []);
        
        // Akıllı Sekme Seçimi
        if (found.state === 'NEGOTIATION') setActiveTab('negotiation');
        else if (found.state === 'FINAL' || found.state === 'CLOSED') setActiveTab('final');
        else if (found.state === 'IN_REVIEW' || found.state === 'PENDING_APPROVAL') setActiveTab('review');
        else setActiveTab('overview');
    }
    setLoading(false);
  }, [id]);

  // Aksiyon Planı Ekleme (Mock)
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

  if (loading || !finding) return <div className="h-screen flex items-center justify-center bg-slate-50">Yükleniyor...</div>;

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
        
        {/* WORKFLOW STEPPER (Süreç Çubuğu) */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
             <WorkflowStepper 
                currentStatus={finding.state} 
                actionPlans={actionPlans as any} 
             />
        </div>

        {/* PHASE TABS (Sekmeler) */}
        <div className="flex gap-2 mb-6 border-b border-slate-200 pb-1 overflow-x-auto">
            <PhaseTab id="overview" label="1. Genel Bakış" icon={FileText} active={activeTab} onClick={setActiveTab} />
            <PhaseTab id="review" label="2. Gözden Geçirme" icon={Users} active={activeTab} onClick={setActiveTab} notification={finding.review_notes?.length} />
            <PhaseTab id="negotiation" label="3. Müzakere & Aksiyon" icon={Scale} active={activeTab} onClick={setActiveTab} notification={actionPlans.length} />
            <PhaseTab id="final" label="4. Kapanış & Onay" icon={Lock} active={activeTab} onClick={setActiveTab} />
        </div>

        {/* --- DYNAMIC CONTENT AREA --- */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-[500px]">
            
            {/* TAB 1: GENEL BAKIŞ (Finding Paper) */}
            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <FindingPaper finding={finding} />
                    </div>
                    <div className="space-y-6">
                        {/* Sağ Panel: Gizli Notlar */}
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Lock size={16} className="text-amber-500"/> Gizli Denetçi Notları</h3>
                            <div className="bg-amber-50/50 p-4 rounded-lg border border-amber-100 text-sm text-slate-700 leading-relaxed italic">
                                {finding.secrets?.internal_notes || 'Bu bulgu ile ilgili henüz özel bir not girilmemiştir.'}
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                Sadece Denetim Ekibi Görebilir
                            </div>
                        </div>
                        
                        {/* Sağ Panel: Kök Neden Özeti */}
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                             <h3 className="font-bold text-slate-800 mb-4">RCA Özeti</h3>
                             <ul className="space-y-2">
                                {finding.secrets?.rca_details?.five_whys?.slice(0,3).map((why, i) => (
                                    <li key={i} className="text-xs text-slate-600 flex gap-2">
                                        <span className="font-bold text-indigo-600">{i+1}.</span> {why}
                                    </li>
                                ))}
                             </ul>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 2: GÖZDEN GEÇİRME (Manager Review) */}
            {activeTab === 'review' && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
                    <div className="flex items-center justify-between mb-8">
                         <div className="flex items-center gap-3 p-4 bg-purple-50 border border-purple-100 rounded-lg text-purple-900 max-w-2xl">
                            <Users size={24} className="shrink-0" />
                            <div>
                                <h4 className="font-bold text-sm">Yönetici Gözden Geçirme</h4>
                                <p className="text-xs mt-1 opacity-80">Kalite güvence standartları gereği bu bulgu yayınlanmadan önce onaylanmalıdır.</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                             <button className="px-5 py-2.5 border border-red-200 text-red-700 bg-red-50 rounded-lg text-sm font-bold hover:bg-red-100 transition-colors">
                                 Düzeltme İste
                             </button>
                             <button className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 flex items-center gap-2 shadow-lg shadow-emerald-100 transition-all">
                                 <CheckCircle2 size={16}/> Onayla ve Yayınla
                             </button>
                        </div>
                    </div>
                    
                    {/* Review Notes */}
                    <div className="space-y-4 max-w-3xl">
                        {finding.review_notes?.map(note => (
                            <div key={note.id} className="border border-slate-200 rounded-lg p-5 hover:border-indigo-300 transition-colors bg-slate-50/30">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold border border-indigo-200">
                                            {note.reviewer_name.charAt(0)}
                                        </div>
                                        <div>
                                            <span className="font-bold text-sm text-slate-800 block">{note.reviewer_name}</span>
                                            <span className="text-[10px] text-slate-400 font-medium">{new Date(note.created_at).toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <span className={clsx("text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wide", note.status === 'OPEN' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700')}>{note.status}</span>
                                </div>
                                <div className="pl-11">
                                    <p className="text-sm text-slate-700 leading-relaxed p-3 bg-white border border-slate-200 rounded-lg rounded-tl-none">{note.note_text}</p>
                                    {note.resolution_text && (
                                        <div className="mt-3 flex gap-3">
                                            <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] shrink-0">AY</div>
                                            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg rounded-tl-none flex-1">
                                                <p className="text-xs text-emerald-800">{note.resolution_text}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* TAB 3: MÜZAKERE (Action Plans - Phase 3 Logic) */}
            {activeTab === 'negotiation' && (
                <div className="space-y-6">
                    {/* Üst Bar */}
                    <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                                <Scale size={24} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-800">Aksiyon Planı Müzakeresi</h2>
                                <p className="text-sm text-slate-500">Denetlenen birim ile mutabakat ve aksiyon atama süreci.</p>
                            </div>
                        </div>
                        <button 
                            onClick={handleAddActionPlan}
                            className="px-5 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800 flex items-center gap-2 shadow-md transition-all active:scale-95"
                        >
                             <Plus size={16} /> Yeni Aksiyon Ekle
                        </button>
                    </div>
                    
                    {/* Aksiyon Kartları */}
                    <div className="grid grid-cols-1 gap-6">
                        {actionPlans.length > 0 ? (
                            actionPlans.map((plan, index) => (
                                <ActionPlanCardComponent 
                                    key={plan.id || index}
                                    plan={plan}
                                    users={MOCK_USERS}
                                />
                            ))
                        ) : (
                            <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-16 text-center">
                                <Scale className="mx-auto text-slate-300 mb-4" size={48} />
                                <h3 className="font-bold text-slate-600">Henüz Aksiyon Planı Yok</h3>
                                <p className="text-sm text-slate-500 mt-2 mb-6">Denetlenen birim henüz bir aksiyon girmedi veya siz eklemediniz.</p>
                                <button onClick={handleAddActionPlan} className="text-indigo-600 font-bold hover:underline text-sm">
                                    İlk aksiyonu oluşturun
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* TAB 4: FINAL (Sign-off) */}
            {activeTab === 'final' && (
                <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
                    <div className="p-8 text-center border-b border-slate-100 bg-slate-50/50">
                        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                            <Lock size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">Dosya Kapanışı</h2>
                        <p className="text-slate-500 mt-2">Bu bulgu için tüm süreçler tamamlanmıştır.</p>
                    </div>
                    
                    <div className="p-8">
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
            )}

        </div>
      </main>

      {/* --- UNIVERSAL SIDEBAR --- */}
      <UniversalFindingDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        findingId={finding.id}
        defaultTab="detay"
        currentViewMode="studio"
      />

    </div>
  );
}

// --- YARDIMCI BİLEŞENLER ---

// 1. Sekme Butonu
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
                <span className="ml-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full min-w-[18px] text-center font-bold shadow-sm">
                    {notification}
                </span>
            )}
        </button>
    );
}

// 2. Basitleştirilmiş Aksiyon Kartı (Feature bileşeni yoksa diye burada tanımladım)
function ActionPlanCardComponent({ plan, users }: { plan: ActionPlan, users: any[] }) {
    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className={clsx("px-2 py-0.5 rounded text-[10px] font-bold uppercase", 
                            plan.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                        )}>
                            {plan.status}
                        </span>
                        {plan.current_state === 'ACCEPTED' && <span className="text-emerald-600 flex items-center gap-1 text-[10px] font-bold"><CheckCircle2 size={10}/> Mutabık</span>}
                    </div>
                    <h3 className="font-bold text-slate-800 text-lg group-hover:text-indigo-600 transition-colors">{plan.title || 'Başlıksız Aksiyon'}</h3>
                </div>
                <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400">
                    <MoreVertical size={16} />
                </button>
            </div>
            
            <div className="grid grid-cols-2 gap-6 text-sm mb-4">
                 <div>
                     <span className="text-xs text-slate-400 block mb-1">Sorumlu Kişi</span>
                     <div className="flex items-center gap-2">
                         <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold">
                             {plan.responsible_person ? plan.responsible_person.charAt(0) : '?'}
                         </div>
                         <span className="font-medium text-slate-700">{plan.responsible_person || 'Atanmadı'}</span>
                     </div>
                 </div>
                 <div>
                     <span className="text-xs text-slate-400 block mb-1">Hedef Tarih</span>
                     <div className="flex items-center gap-2 font-medium text-slate-700">
                         <Clock size={14} className="text-slate-400"/> {plan.target_date}
                     </div>
                 </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg text-sm text-slate-600 line-clamp-2 border border-slate-100">
                {plan.description || 'Açıklama girilmemiş.'}
            </div>
        </div>
    );
}