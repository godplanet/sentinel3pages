import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  CheckCircle2, 
  MoreVertical,
  Calendar,
  AlertTriangle,
  LayoutTemplate, 
  BookOpen,
  ScrollText,
  Clock,
  ChevronRight,
  Loader2
} from 'lucide-react';

// --- Utils & Hooks ---
import { cn } from '@/shared/utils/cn';
import { useFindingStudio } from '@/features/finding-studio/hooks/useFindingStudio';
import { useUIStore } from '@/shared/stores/ui'; 
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

// --- PLACEHOLDER WIDGETS (Light Theme Adapted) ---
const FindingEditorWidget = ({ data, onUpdate }: any) => (
  <div className="bg-white border border-slate-200 rounded-xl shadow-sm min-h-[600px] p-8">
    <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4">
      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
        <MoreVertical size={24} />
      </div>
      <p>Editör Alanı (Rich Text & Inputs)</p>
    </div>
  </div>
);

const ZenReaderWidget = ({ data, layout }: { data: any, layout: 'flow' | 'book' }) => {
  if (layout === 'book') {
    return (
      <div className="grid grid-cols-2 gap-8 h-full">
        <div className="bg-[#FDFBF7] border border-stone-200 rounded-l-xl p-10 shadow-sm overflow-y-auto font-serif text-slate-800 leading-relaxed">
          <h2 className="text-2xl font-bold mb-4">{data?.title}</h2>
          <p>Sol Sayfa: Bulgu Detayları (Kağıt Hissi)...</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-r-xl p-8 shadow-sm overflow-y-auto">
          <h3 className="font-sans font-semibold text-slate-900 mb-4">Aksiyon Planı & Notlar</h3>
          <p className="text-slate-500">Sağ Sayfa: Çalışma Alanı...</p>
        </div>
      </div>
    );
  }
  
  // Flow Layout
  return (
    <div className="bg-[#FDFBF7] border border-stone-200 max-w-3xl mx-auto rounded-xl shadow-sm min-h-[80vh] p-12 font-serif text-slate-800 leading-relaxed relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-300/50 via-red-300/50 to-indigo-300/50 opacity-50" />
      <h1 className="text-3xl font-bold mb-6 text-slate-900">{data?.title || 'Başlıksız Bulgu'}</h1>
      <p>Zen Modu (Akış): Tüm içerik tek sütunda, dikkat dağıtıcı unsurlar olmadan okunur.</p>
    </div>
  );
};

const NegotiationBoardWidget = ({ id }: any) => (
  <div className="grid grid-cols-12 gap-6 h-[600px]">
    <div className="col-span-4 bg-slate-50 rounded-xl border border-slate-200 p-6">
      <h3 className="font-bold text-slate-700">Özet Bilgi</h3>
    </div>
    <div className="col-span-8 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <h3 className="font-bold text-indigo-700">Mutabakat Paneli</h3>
    </div>
  </div>
);

const UniversalFindingDrawer = () => (
  <div className="fixed bottom-0 left-0 right-0 h-10 bg-white border-t border-slate-200 flex items-center justify-between px-6 text-xs text-slate-500 z-50">
    <span>Universal Drawer</span>
    <span>Comments (3) • Files (1)</span>
  </div>
);

// ============================================================================
// THE ORCHESTRATOR (Light & Liquid)
// ============================================================================

export const FindingStudioPage: React.FC = () => {
  // 1. The Brain (Logic)
  const { 
    finding, 
    mode, 
    setMode, 
    isVetoed, 
    riskScore, 
    isLoading, 
    isSaving, 
    saveFinding,
    updateField 
  } = useFindingStudio();

  // 2. Local State (Zen Layout Engine)
  const [zenLayout, setZenLayout] = useState<'flow' | 'book'>('flow');

  // 3. Global UI
  const { isSidebarOpen } = useUIStore();
  const navigate = useNavigate();

  // --- Loading Screen ---
  if (isLoading || !finding) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <div className="bg-white p-4 rounded-full shadow-lg mb-4">
           <Loader2 className="animate-spin text-indigo-600" size={32} />
        </div>
        <p className="text-sm font-medium text-slate-400">Stüdyo hazırlanıyor...</p>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "min-h-screen bg-slate-50 transition-[padding] duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] font-sans selection:bg-indigo-100 selection:text-indigo-900",
        // Smart Layout Rule: Sidebar Width
        isSidebarOpen ? "pl-[280px]" : "pl-[80px]"
      )}
    >
      
      {/* --- LIQUID GLASS HEADER --- */}
      <header 
        className={cn(
          "fixed top-0 right-0 z-40 h-16 flex items-center justify-between px-6 transition-[left] duration-300",
          "bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm supports-[backdrop-filter]:bg-white/60",
          isSidebarOpen ? "left-[280px]" : "left-[80px]"
        )}
      >
        {/* LEFT: Identity & Context */}
        <div className="flex items-center gap-4 min-w-0">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="h-6 w-px bg-slate-200 mx-1" />

          <div className="flex flex-col min-w-0">
             {/* Metadata Row */}
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-slate-400 font-bold tracking-wider uppercase">
                #{finding.id === 'new' ? 'DRAFT' : finding.id}
              </span>
              
              {isVetoed && (
                <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-50 text-rose-600 border border-rose-100 animate-pulse">
                  <AlertTriangle size={10} />
                  KRİTİK VETO
                </span>
              )}

              {/* Advanced Header Info (Visible in Zen Mode) */}
              {mode === 'zen' && (
                <>
                  <span className="text-[10px] text-slate-300">•</span>
                  <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                    <Clock size={10} />
                    {finding.target_date 
                      ? format(new Date(finding.target_date), 'dd MMM yyyy', { locale: tr }) 
                      : 'Vade Yok'}
                  </div>
                </>
              )}
            </div>

            {/* Title */}
            <h1 className="text-sm font-semibold text-slate-800 truncate max-w-md leading-tight">
              {finding.title || 'Adsız Taslak'}
            </h1>
          </div>
        </div>

        {/* RIGHT: Layout Engine & Actions */}
        <div className="flex items-center gap-3">
          
          {/* A. Zen Layout Toggles (Flow vs Book) */}
          {mode === 'zen' && (
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 mr-2">
              <button
                onClick={() => setZenLayout('flow')}
                className={cn(
                  "p-1.5 rounded-md transition-all",
                  zenLayout === 'flow' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                )}
                title="Akış Modu (Tek Sayfa)"
              >
                <ScrollText size={16} />
              </button>
              <button
                onClick={() => setZenLayout('book')}
                className={cn(
                  "p-1.5 rounded-md transition-all",
                  zenLayout === 'book' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                )}
                title="Kitap Modu (Çift Sayfa)"
              >
                <BookOpen size={16} />
              </button>
            </div>
          )}

          {/* B. Mode Switcher (Tab Style) */}
          <div className="hidden lg:flex bg-slate-100/80 p-1 rounded-lg border border-slate-200/60">
            {(['edit', 'zen', 'negotiation'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={cn(
                  "px-3 py-1.5 text-xs font-semibold rounded-md capitalize transition-all",
                  mode === m 
                    ? "bg-white text-slate-900 shadow-sm border border-slate-100" 
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                )}
              >
                {m}
              </button>
            ))}
          </div>

          {/* C. Primary Action Button */}
          {mode === 'edit' && (
            <button
              onClick={saveFinding}
              disabled={isSaving}
              className={cn(
                "flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-lg transition-all shadow-md shadow-slate-200 active:scale-95 disabled:opacity-70",
                isSaving && "cursor-wait"
              )}
            >
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          )}

          {mode === 'negotiation' && (
            <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-all shadow-md shadow-emerald-100 active:scale-95">
              <CheckCircle2 size={16} />
              Mutabık Kal
            </button>
          )}

          <div className="h-6 w-px bg-slate-200 mx-1" />

          <button className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
            <MoreVertical size={18} />
          </button>
        </div>
      </header>

      {/* --- MAIN CONTENT AREA --- */}
      <main 
        className={cn(
          "pt-24 pb-20 px-6 md:px-8 mx-auto min-h-[calc(100vh-40px)]",
          // Layout Constraints based on Mode & ZenLayout
          mode === 'zen' && zenLayout === 'book' ? "max-w-full h-screen overflow-hidden pb-0" : "max-w-[1600px]"
        )}
      >
        {/* Render Logic */}
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 h-full">
          
          {mode === 'edit' && (
             <FindingEditorWidget data={finding} onUpdate={updateField} />
          )}

          {mode === 'zen' && (
            <ZenReaderWidget data={finding} layout={zenLayout} />
          )}

          {mode === 'negotiation' && (
            <NegotiationBoardWidget id={finding.id} />
          )}

        </div>
      </main>

      {/* --- UNIVERSAL DRAWER (Sticky Bottom) --- */}
      <UniversalFindingDrawer />

    </div>
  );
};

export default FindingStudioPage;