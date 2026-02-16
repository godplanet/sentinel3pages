import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  CheckCircle2,
  Maximize2,
  AlertTriangle,
  Loader2,
  Sparkles,
  History,
  MessageSquare,
  FileText,
  Settings,
} from 'lucide-react';

// --- Utils & Hooks ---
// DÜZELTME 1: cn util dosyası
import { cn } from '@/shared/utils/cn';
// DÜZELTME 2: Hook yolu
import { useFindingStudio } from '@/features/finding-studio/hooks/useFindingStudio';
// DÜZELTME 3: Dosya adı "ui" değil "ui-store" olarak değiştirildi
import { useUIStore } from '@/shared/stores/ui-store';

// --- WIDGETS (The Organs) ---
import { FindingFormWidget } from '@/features/finding-studio/components/FindingFormWidget';
import { ZenEditor } from '@/features/finding-studio/components/ZenEditor';
import { ZenReaderWidget } from '@/features/finding-studio/components/ZenReaderWidget';
import { NegotiationBoardWidget } from '@/features/finding-studio/components/NegotiationBoardWidget';
// DÜZELTME 4: Drawer bileşeni "widgets" klasöründen çekiliyor
import { UniversalFindingDrawer } from '@/widgets/UniversalFindingDrawer';

// ============================================================================
// COMPONENT: STUDIO HEADER (Glassmorphism)
// ============================================================================
const StudioHeader = ({
  title,
  id,
  mode,
  setMode,
  onSave,
  isSaving,
  isVetoed,
  navigate,
}: any) => (
  <header
    className={cn(
      'sticky top-0 z-50 h-16 px-6 flex items-center justify-between transition-all duration-300',
      // MODA GÖRE STİL DEĞİŞİMİ
      mode === 'zen'
        ? 'bg-[#FDFBF7]/90 backdrop-blur-md border-b border-stone-200/50' // Kağıt Hissi Header
        : 'bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-sm supports-[backdrop-filter]:bg-white/60' // Apple Glass Header
    )}
  >
    {/* LEFT: Context */}
    <div className="flex items-center gap-4">
      <button
        onClick={() => navigate(-1)}
        className="p-2 -ml-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-black/5 transition-colors"
      >
        <ArrowLeft size={20} />
      </button>

      <div className="h-6 w-px bg-slate-200 mx-1" />

      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-slate-400 font-bold tracking-wider uppercase">
            #{id === 'new' ? 'DRAFT' : id}
          </span>
          {isVetoed && (
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-50 text-rose-600 border border-rose-100 animate-pulse">
              <AlertTriangle size={10} /> KRİTİK VETO
            </span>
          )}
        </div>
        <h1 className="text-sm font-semibold text-slate-800 truncate max-w-md leading-tight">
          {title || 'Adsız Taslak'}
        </h1>
      </div>
    </div>

    {/* RIGHT: Mode Switcher & Actions */}
    <div className="flex items-center gap-3">
      {/* Mode Switcher */}
      <div className="flex bg-slate-100/80 p-1 rounded-lg border border-slate-200/60">
        {(['edit', 'zen', 'negotiation'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={cn(
              'px-3 py-1.5 text-xs font-semibold rounded-md capitalize transition-all flex items-center gap-1.5',
              mode === m
                ? 'bg-white text-slate-900 shadow-sm border border-slate-100'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
            )}
          >
            {m === 'edit' && <Settings size={12} />}
            {m === 'zen' && <FileText size={12} />}
            {m === 'negotiation' && <MessageSquare size={12} />}
            {m}
          </button>
        ))}
      </div>

      <div className="h-6 w-px bg-slate-200 mx-1" />

      {/* Primary Action */}
      {mode === 'edit' && (
        <button
          onClick={onSave}
          disabled={isSaving}
          className={cn(
            'flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-lg transition-all shadow-md shadow-slate-200 active:scale-95 disabled:opacity-70',
            isSaving && 'cursor-wait'
          )}
        >
          {isSaving ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}
          {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      )}

      {mode === 'zen' && (
        <button
          className="p-2 text-slate-400 hover:text-slate-600"
          title="Tam Ekran"
        >
          <Maximize2 size={18} />
        </button>
      )}

      {mode === 'negotiation' && (
        <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg shadow-md shadow-emerald-100">
          <CheckCircle2 size={16} /> Mutabık Kal
        </button>
      )}
    </div>
  </header>
);

// ============================================================================
// MAIN PAGE COMPONENT (THE ORCHESTRATOR)
// ============================================================================

export const FindingStudioPage: React.FC = () => {
  // 1. The Brain (Logic)
  const {
    finding,
    mode,
    setMode,
    isVetoed,
    isLoading,
    isSaving,
    saveFinding,
    updateField,
  } = useFindingStudio();

  // 2. Global UI
  const { isSidebarOpen } = useUIStore();
  const navigate = useNavigate();
  const [activeTool, setActiveTool] = useState<'ai' | 'history' | null>(null);

  // --- Loading Screen ---
  if (isLoading || !finding) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <Loader2 className="animate-spin text-indigo-600 mb-2" size={32} />
        <p className="text-sm font-medium text-slate-400">
          Stüdyo hazırlanıyor...
        </p>
      </div>
    );
  }

  // ==========================================================================
  // RENDER STRATEGY: 1. ZEN MODE (PAPER)
  // ==========================================================================
  if (mode === 'zen') {
    return (
      <div
        className={cn(
          'min-h-screen bg-[#FDFBF7] transition-[padding] duration-300',
          isSidebarOpen ? 'pl-[280px]' : 'pl-[80px]'
        )}
      >
        <StudioHeader
          title={finding.title}
          id={finding.id}
          mode={mode}
          setMode={setMode}
          isVetoed={isVetoed}
          navigate={navigate}
        />

        <main className="max-w-5xl mx-auto p-8 lg:p-12">
          {/* Sadece Okuma Widget'ı - Remarkable Estetiği */}
          <ZenReaderWidget data={finding} layout="flow" warmth={20} />
        </main>

        <UniversalFindingDrawer />
      </div>
    );
  }

  // ==========================================================================
  // RENDER STRATEGY: 2. NEGOTIATION MODE (SPLIT)
  // ==========================================================================
  if (mode === 'negotiation') {
    return (
      <div
        className={cn(
          'min-h-screen bg-slate-100 transition-[padding] duration-300 flex flex-col',
          isSidebarOpen ? 'pl-[280px]' : 'pl-[80px]'
        )}
      >
        <StudioHeader
          title={finding.title}
          id={finding.id}
          mode={mode}
          setMode={setMode}
          isVetoed={isVetoed}
          navigate={navigate}
        />

        <main className="flex-1 p-6 h-[calc(100vh-4rem)]">
          <NegotiationBoardWidget findingId={finding.id} />
        </main>
      </div>
    );
  }

  // ==========================================================================
  // RENDER STRATEGY: 3. STUDIO / EDIT MODE (APPLE GLASS - DEFAULT)
  // ==========================================================================
  return (
    <div
      className={cn(
        'min-h-screen bg-slate-50/80 transition-[padding] duration-300 flex flex-col font-sans',
        isSidebarOpen ? 'pl-[280px]' : 'pl-[80px]'
      )}
    >
      <StudioHeader
        title={finding.title}
        id={finding.id}
        mode={mode}
        setMode={setMode}
        onSave={saveFinding}
        isSaving={isSaving}
        isVetoed={isVetoed}
        navigate={navigate}
      />

      {/* --- WORKSPACE LAYOUT (3 COLUMNS) --- */}
      <main className="flex-1 flex gap-6 p-6 h-[calc(100vh-4rem)] overflow-hidden">
        {/* COL 1: CONTROL PANEL (Sticky Left) */}
        <aside className="w-[320px] shrink-0 flex flex-col bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden h-full">
          <FindingFormWidget finding={finding} onUpdate={updateField} />
        </aside>

        {/* COL 2: THE EDITOR (Center Stage) */}
        <section className="flex-1 flex flex-col min-w-0 bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden relative">
          {/* Editor Toolbar Area (Mock) */}
          <div className="h-10 border-b border-slate-100 flex items-center px-4 gap-2 bg-slate-50/50">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Rich Text Editor
            </span>
            {/* Toolbar Buttons would go here */}
          </div>

          {/* Scrollable Editor Area */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
            <div className="max-w-3xl mx-auto">
              <ZenEditor finding={finding} />
            </div>
          </div>

          {/* Bottom Gradient Fade */}
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent pointer-events-none" />
        </section>

        {/* COL 3: TOOLS RAIL (Right) */}
        <aside className="w-14 shrink-0 flex flex-col gap-4 items-center pt-2">
          <button
            onClick={() => setActiveTool(activeTool === 'ai' ? null : 'ai')}
            className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-sm border',
              activeTool === 'ai'
                ? 'bg-indigo-600 text-white border-indigo-600 ring-2 ring-indigo-200'
                : 'bg-white text-slate-400 border-slate-200 hover:text-indigo-600 hover:border-indigo-200'
            )}
            title="AI Asistanı"
          >
            <Sparkles size={20} />
          </button>

          <button
            onClick={() =>
              setActiveTool(activeTool === 'history' ? null : 'history')
            }
            className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-sm border',
              activeTool === 'history'
                ? 'bg-slate-800 text-white border-slate-800'
                : 'bg-white text-slate-400 border-slate-200 hover:text-slate-800 hover:border-slate-300'
            )}
            title="Tarihçe"
          >
            <History size={20} />
          </button>

          <div className="h-px w-6 bg-slate-200 my-2" />

          <button className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-rose-500 hover:border-rose-200 flex items-center justify-center transition-all shadow-sm">
            <AlertTriangle size={18} />
          </button>
        </aside>
      </main>

      <UniversalFindingDrawer />
    </div>
  );
};

export default FindingStudioPage;