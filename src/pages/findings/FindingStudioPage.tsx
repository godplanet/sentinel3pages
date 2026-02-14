import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, ArrowLeft, Save, AlertTriangle, Scale, 
  Lock, FileText, Users, MessageSquare, History, Menu
} from 'lucide-react';
import clsx from 'clsx';

// --- MİMARİ BAĞLANTILAR ---
import { mockComprehensiveFindings } from '@/entities/finding/api/mock-comprehensive-data';
import type { ComprehensiveFinding, ActionPlan } from '@/entities/finding/model/types';
import { useParameterStore } from '@/shared/stores/parameter-store';

// --- BİLEŞENLER ---
import { ViewSwitcher } from '@/features/finding-studio/components/ViewSwitcher';
import { WorkflowStepper } from '@/widgets/FindingStudio/WorkflowStepper';
import { UniversalFindingDrawer } from '@/widgets/UniversalFindingDrawer';

// --- SAYFA PARÇALARI (FAZLAR) ---
import FindingStudioPhase1Page from './FindingStudioPhase1Page'; // Taslak
import FindingStudioPhase2Page from './FindingStudioPhase2Page'; // Gözden Geçirme
import FindingStudioPhase3Page from './FindingStudioPhase3Page'; // Müzakere
import FindingStudioPhase4Page from './FindingStudioPhase4Page'; // Final Onay
import FindingStudioPhase5Page from './FindingStudioPhase5Page'; // Takip

export default function FindingStudioPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getSeverityColor } = useParameterStore();

  // STATE
  const [finding, setFinding] = useState<ComprehensiveFinding | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Aktif Sekme (Fazlar)
  const [activeTab, setActiveTab] = useState<'overview' | 'review' | 'negotiation' | 'final' | 'followup'>('overview');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // 1. VERİ YÜKLEME
  useEffect(() => {
    const found = mockComprehensiveFindings.find(f => f.id === id) || mockComprehensiveFindings[0];
    if (found) {
        setFinding(found);
        
        // Akıllı Başlangıç Sekmesi
        switch (found.state) {
            case 'DRAFT': setActiveTab('overview'); break;
            case 'IN_REVIEW': case 'PENDING_APPROVAL': setActiveTab('review'); break;
            case 'NEGOTIATION': setActiveTab('negotiation'); break;
            case 'FINAL': setActiveTab('final'); break;
            case 'CLOSED': case 'FOLLOW_UP': setActiveTab('followup'); break;
            default: setActiveTab('overview');
        }
    }
    setLoading(false);
  }, [id]);

  if (loading || !finding) return <div className="h-screen flex items-center justify-center bg-slate-50">Yükleniyor...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 flex flex-col font-sans">
      
      {/* HEADER */}
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
            <button onClick={() => setIsDrawerOpen(true)} className="px-4 py-2 border border-slate-200 bg-white text-slate-600 rounded-lg font-bold text-xs hover:bg-slate-50 flex items-center gap-2">
                <Menu size={14}/> Araçlar
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold text-xs hover:bg-indigo-700 shadow-sm transition-all active:scale-95">
                <Save size={14} /> Kaydet
            </button>
        </div>
      </header>

      {/* CONTENT */}
      <main className="flex-1 max-w-[1600px] mx-auto w-full p-8 pb-20">
        
        {/* Workflow Stepper */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
             <WorkflowStepper 
                currentStatus={finding.state} 
                actionPlans={finding.action_plans as any} 
             />
        </div>

        {/* Phase Tabs */}
        <div className="flex gap-2 mb-6 border-b border-slate-200 pb-1 overflow-x-auto">
            <PhaseTab id="overview" label="1. Genel Bakış" icon={FileText} active={activeTab} onClick={setActiveTab} />
            <PhaseTab id="review" label="2. Review" icon={Users} active={activeTab} onClick={setActiveTab} notification={finding.review_notes?.length} />
            <PhaseTab id="negotiation" label="3. Müzakere" icon={Scale} active={activeTab} onClick={setActiveTab} notification={finding.action_plans?.length} />
            <PhaseTab id="final" label="4. Kapanış" icon={Lock} active={activeTab} onClick={setActiveTab} />
            <PhaseTab id="followup" label="5. Takip" icon={History} active={activeTab} onClick={setActiveTab} />
        </div>

        {/* DYNAMIC COMPONENT RENDERER */}
        <div className="min-h-[500px]">
            {activeTab === 'overview' && <FindingStudioPhase1Page findingId={finding.id} onNextPhase={() => setActiveTab('review')} />}
            {activeTab === 'review' && <FindingStudioPhase2Page />}
            {activeTab === 'negotiation' && <FindingStudioPhase3Page />}
            {activeTab === 'final' && <FindingStudioPhase4Page />}
            {activeTab === 'followup' && <FindingStudioPhase5Page findingId={finding.id} />}
        </div>
      </main>

      {/* UNIVERSAL SIDEBAR */}
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

// Sekme Butonu
function PhaseTab({ id, label, icon: Icon, active, onClick, notification }: any) {
    const isActive = active === id;
    return (
        <button onClick={() => onClick(id)} className={clsx("flex items-center gap-2 px-6 py-3 rounded-t-lg font-bold text-sm transition-all border-b-2 relative shrink-0", isActive ? "border-indigo-600 text-indigo-700 bg-indigo-50/50" : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50")}>
            <Icon size={16} /> {label}
            {notification > 0 && <span className="ml-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full min-w-[18px] text-center font-bold shadow-sm">{notification}</span>}
        </button>
    );
}