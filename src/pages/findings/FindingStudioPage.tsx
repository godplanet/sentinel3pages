import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, ArrowLeft, Save, AlertTriangle, Scale, 
  Lock, FileText, Users, Clock, Send
} from 'lucide-react';
import clsx from 'clsx';

// MİMARİ BAĞLANTILAR
import { mockComprehensiveFindings } from '@/entities/finding/api/mock-comprehensive-data';
import type { ComprehensiveFinding } from '@/entities/finding/model/types';
import { useParameterStore } from '@/shared/stores/parameter-store';
import { ViewSwitcher } from '@/features/finding-studio/components/ViewSwitcher';

// BİLEŞENLER (Eğer bu bileşenler yoksa basit versiyonlarını render eder)
import { ActionPlanCard } from '@/features/finding-studio/components/ActionPlanCard';
import { FindingSignOff } from '@/features/finding-studio/components/FindingSignOff';
import { UniversalFindingDrawer } from '@/widgets/UniversalFindingDrawer';
import { FindingPaper } from '@/widgets/FindingStudio/FindingPaper';
import { WorkflowStepper } from '@/widgets/FindingStudio/WorkflowStepper';

export default function FindingStudioPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getSeverityColor } = useParameterStore();

  // STATE
  const [finding, setFinding] = useState<ComprehensiveFinding | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'review' | 'negotiation' | 'final'>('overview');
  
  // DRAWER
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // 1. VERİ YÜKLEME
  useEffect(() => {
    const found = mockComprehensiveFindings.find(f => f.id === id) || mockComprehensiveFindings[0];
    if (found) {
        setFinding(found);
        
        // Başlangıç sekmesini duruma göre akıllı seç
        if (found.state === 'NEGOTIATION') setActiveTab('negotiation');
        else if (found.state === 'FINAL' || found.state === 'CLOSED') setActiveTab('final');
        else if (found.state === 'IN_REVIEW' || found.state === 'PENDING_APPROVAL') setActiveTab('review');
        else setActiveTab('overview');
    }
    setLoading(false);
  }, [id]);

  if (loading || !finding) return <div className="h-screen flex items-center justify-center bg-slate-50">Yükleniyor...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 flex flex-col font-sans">
      
      {/* HEADER */}
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

        {/* ORTAK NAVİGASYON */}
        <ViewSwitcher findingId={finding.id} />

        <div className="flex items-center gap-2">
            <button 
                onClick={() => setIsDrawerOpen(true)}
                className="px-4 py-2 border border-slate-200 bg-white text-slate-600 rounded-lg font-bold text-xs hover:bg-slate-50"
            >
                Detaylar
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold text-xs hover:bg-indigo-700 shadow-sm shadow-indigo-200 transition-all active:scale-95">
                <Save size={14} /> Kaydet
            </button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 max-w-[1600px] mx-auto w-full p-8 pb-20">
        
        {/* WORKFLOW STEPPER */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
             <WorkflowStepper 
                currentStatus={finding.state} 
                actionPlans={finding.action_plans as any} 
             />
        </div>

        {/* PHASE TABS */}
        <div className="flex gap-2 mb-6 border-b border-slate-200 pb-1 overflow-x-auto">
            <PhaseTab id="overview" label="1. Genel Bakış" icon={FileText} active={activeTab} onClick={setActiveTab} />
            <PhaseTab id="review" label="2. Gözden Geçirme" icon={Users} active={activeTab} onClick={setActiveTab} notification={finding.review_notes?.length} />
            <PhaseTab id="negotiation" label="3. Müzakere & Aksiyon" icon={Scale} active={activeTab} onClick={setActiveTab} notification={finding.action_plans?.length} />
            <PhaseTab id="final" label="4. Kapanış & Onay" icon={Lock} active={activeTab} onClick={setActiveTab} />
        </div>

        {/* DYNAMIC CONTENT AREA */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* 1. OVERVIEW (Read-Only Summary) */}
            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <FindingPaper finding={finding} />
                    </div>
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Lock size={16}/> Gizli Denetçi Notları</h3>
                            <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100">
                                {finding.secrets?.internal_notes || 'Henüz özel bir not eklenmemiş.'}
                            </p>
                            <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-400">
                                Bu alan sadece denetim ekibi tarafından görülebilir.
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 2. REVIEW (Review Notes) */}
            {activeTab === 'review' && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 min-h-[400px]">
                    <div className="flex items-center justify-between mb-8">
                         <div className="flex items-center gap-3 p-4 bg-orange-50 border border-orange-100 rounded-lg text-orange-800 max-w-2xl">
                            <AlertTriangle size={24} />
                            <div>
                                <h4 className="font-bold text-sm">Gözden Geçirme Modu</h4>
                                <p className="text-xs mt-1">Yönetici olarak bulguyu onaylayabilir veya düzeltme (Review Note) talep edebilirsiniz.</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                             <button className="px-4 py-2 border border-red-200 text-red-700 rounded-lg text-sm font-bold hover:bg-red-50">Revize İste</button>
                             <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 flex items-center gap-2"><CheckCircle2 size={16}/> Onayla</button>
                        </div>
                    </div>
                    
                    {/* Review Notes Listesi */}
                    <div className="space-y-4 max-w-3xl">
                        {finding.review_notes?.map(note => (
                            <div key={note.id} className="border border-slate-200 rounded-lg p-4 hover:border-indigo-300 transition-colors bg-slate-50/50">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">MÖ</div>
                                        <span className="font-bold text-sm text-slate-700">{note.reviewer_name}</span>
                                        <span className="text-xs text-slate-400">• {new Date(note.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <span className={clsx("text-[10px] px-2 py-0.5 rounded font-bold uppercase", note.status === 'OPEN' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700')}>{note.status}</span>
                                </div>
                                <p className="text-sm text-slate-800 pl-8">{note.note_text}</p>
                                {note.resolution_text && (
                                    <div className="mt-3 ml-8 p-3 bg-green-50 border border-green-100 rounded-lg">
                                        <p className="text-xs text-green-700 font-bold mb-1 flex items-center gap-1"><CheckCircle2 size={12}/> Çözüldü:</p>
                                        <p className="text-xs text-green-800">{note.resolution_text}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                        {(!finding.review_notes || finding.review_notes.length === 0) && (
                            <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-xl">
                                <div className="text-slate-300 mb-2"><CheckCircle2 size={32} className="mx-auto"/></div>
                                <div className="text-slate-500 font-medium">Henüz bir inceleme notu bulunmuyor.</div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* 3. NEGOTIATION (Action Plans) */}
            {activeTab === 'negotiation' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <div>
                            <h2 className="text-lg font-bold text-slate-800">Aksiyon Planları</h2>
                            <p className="text-sm text-slate-500">Denetlenen birim ile mutabakat süreci.</p>
                        </div>
                        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 flex items-center gap-2">
                             <Send size={16} /> Müzakereyi Başlat
                        </button>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-6">
                        {finding.action_plans && finding.action_plans.length > 0 ? (
                            finding.action_plans.map(plan => (
                                <ActionPlanCard 
                                    key={plan.id} 
                                    actionPlan={plan} 
                                    onUpdate={() => {}} 
                                    onDelete={() => {}} 
                                    availableOwners={[]} 
                                />
                            ))
                        ) : (
                            <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-16 text-center">
                                <Scale className="mx-auto text-slate-300 mb-4" size={48} />
                                <h3 className="font-bold text-slate-600">Henüz Aksiyon Planı Yok</h3>
                                <p className="text-sm text-slate-500 mt-2 mb-6">Denetlenen birim henüz sisteme bir aksiyon girmedi.</p>
                                <button className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-100">
                                    + Müfettiş Olarak Ekle
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* 4. FINAL (Sign-off) */}
            {activeTab === 'final' && (
                <div className="max-w-4xl mx-auto">
                    <FindingSignOff 
                        findingId={finding.id}
                        currentUserId="u1"
                        currentUserName="Ahmet Yılmaz"
                        currentUserRole="AUDITOR"
                        tenantId="t1"
                        riskLevel={finding.severity}
                    />
                </div>
            )}

        </div>

      </main>

      {/* SIDEBAR (Universal Drawer) */}
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
                <span className="ml-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full min-w-[18px] text-center font-bold">
                    {notification}
                </span>
            )}
        </button>
    );
}