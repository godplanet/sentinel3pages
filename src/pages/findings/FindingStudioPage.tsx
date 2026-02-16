import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  CheckCircle2,
  Maximize2,
  Minimize2,
  AlertTriangle,
  Loader2,
  Settings,
  BookOpen,
  ScrollText,
  Sun,
  Scale,
  Search,
  GitPullRequestArrow,
  Zap,
  Target,
  FileText,
  MessageSquare,
  History,
  Paperclip,
  Menu
} from 'lucide-react';

// --- Utils & Hooks ---
import { cn } from '@/shared/utils/cn';
import { useFindingStudio } from '@/features/finding-studio/hooks/useFindingStudio';
import { useUIStore } from '@/shared/stores/ui-store';

// --- Shared UI ---
import { RichTextEditor } from '@/shared/ui/RichTextEditor';

// --- WIDGETS ---
import { FindingFormWidget } from '@/features/finding-studio/components/FindingFormWidget';
import { ZenReaderWidget } from '@/features/finding-studio/components/ZenReaderWidget';
import { NegotiationBoardWidget } from '@/features/finding-studio/components/NegotiationBoardWidget';
import { UniversalFindingDrawer } from '@/widgets/UniversalFindingDrawer';

// ============================================================================
// CONFIGURATION & CONSTANTS
// ============================================================================

const EDITOR_TABS = [
  { id: 'criteria', label: '1. KRİTER', icon: Scale, color: 'text-blue-600', placeholder: 'İlgili mevzuat, standart veya prosedür maddesi...' },
  { id: 'condition', label: '2. TESPİT', icon: Search, color: 'text-amber-600', placeholder: 'Sahada gözlemlenen mevcut durum...' },
  { id: 'cause', label: '3. KÖK NEDEN', icon: GitPullRequestArrow, color: 'text-rose-600', placeholder: 'Bu durumun oluşmasına neden olan asıl sebep...' },
  { id: 'consequence', label: '4. ETKİ / RİSK', icon: Zap, color: 'text-orange-600', placeholder: 'Kurumun maruz kaldığı potansiyel risk...' },
  { id: 'corrective_action', label: '5. ÖNERİ', icon: Target, color: 'text-emerald-600', placeholder: 'Alınması gereken aksiyon önerisi...' },
];

// ============================================================================
// COMPONENT: MAIN PAGE
// ============================================================================

export const FindingStudioPage: React.FC = () => {
  // 1. Logic Hook
  const {
    finding,
    mode,
    setMode,
    isVetoed,
    isLoading,
    isSaving,
    saveFinding,
    updateField,
    riskScore,
    userRole
  } = useFindingStudio();

  // 2. UI State
  const { isSidebarOpen } = useUIStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('criteria');
  const [warmth, setWarmth] = useState(0); // 0 (White) -> 100 (Warm Sepia)
  const [zenLayout, setZenLayout] = useState<'flow' | 'book'>('flow');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState<'chat' | 'history' | 'files'>('chat');

  // Background Color Calculation for Zen Mode
  const pageStyle = useMemo(() => {
    if (mode !== 'zen') return {};
    const r = 255 - (warmth * 0.04);
    const g = 255 - (warmth * 0.18);
    const b = 255 - (warmth * 0.56);
    return { backgroundColor: `rgb(${r}, ${g}, ${b})` };
  }, [mode, warmth]);

  // Handle Drawer Toggle
  const toggleDrawer = (tab: 'chat' | 'history' | 'files') => {
    if (isDrawerOpen && drawerTab === tab) {
      setIsDrawerOpen(false);
    } else {
      setDrawerTab(tab);
      setIsDrawerOpen(true);
    }
  };

  // --- Loading State ---
  if (isLoading || !finding) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <Loader2 className="animate-spin text-indigo-600 mb-4" size={40} />
        <p className="text-sm font-medium text-slate-500 animate-pulse">Sentinel Studio Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div 
      className="flex flex-col h-[calc(100vh-1rem)] w-full overflow-hidden transition-colors duration-500 ease-in-out"
      style={mode === 'zen' ? pageStyle : { backgroundColor: '#f8fafc' }} // slate-50 equivalent
    >

      {/* ================= HEADER ================= */}
      <header className={cn(
        "shrink-0 h-16 flex items-center justify-between px-6 border-b z-30 transition-all",
        mode === 'zen' ? "border-transparent bg-transparent" : "bg-white/80 backdrop-blur-md border-slate-200"
      )}>
        {/* LEFT: Navigation & Info */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          
          <div className="h-6 w-px bg-slate-200" />

          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                #{finding.id === 'new' ? 'DRAFT-NEW' : finding.id.toUpperCase()}
              </span>
              {isVetoed && (
                <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-600 text-[9px] font-bold border border-rose-200 animate-pulse">
                  KRİTİK VETO
                </span>
              )}
            </div>
            <h1 className="text-sm font-semibold text-slate-800 truncate max-w-md">
              {finding.title || 'Adsız Bulgu Taslağı'}
            </h1>
          </div>
        </div>

        {/* CENTER: Mode Switcher */}
        <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex bg-slate-100/50 p-1 rounded-lg border border-slate-200/50 backdrop-blur-sm">
          {(['edit', 'zen', 'negotiation'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                "px-4 py-1.5 text-xs font-semibold rounded-md capitalize transition-all flex items-center gap-2",
                mode === m 
                  ? "bg-white text-slate-900 shadow-sm ring-1 ring-black/5" 
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
              )}
            >
              {m === 'edit' && <Settings size={14} />}
              {m === 'zen' && <BookOpen size={14} />}
              {m === 'negotiation' && <CheckCircle2 size={14} />}
              {m}
            </button>
          ))}
        </div>

        {/* RIGHT: Actions */}
        <div className="flex items-center gap-3">
          {mode === 'zen' && (
            <div className="flex items-center gap-2 bg-white/50 p-1 rounded-full border border-slate-200/50 px-3">
              <Sun size={14} className="text-amber-500" />
              <input 
                type="range" min="0" max="50" 
                value={warmth} onChange={(e) => setWarmth(parseInt(e.target.value))}
                className="w-20 h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-amber-500"
              />
              <div className="w-px h-4 bg-slate-300 mx-1" />
              <button onClick={() => setZenLayout('flow')} className={cn("p-1 rounded hover:bg-white/80", zenLayout === 'flow' && "text-indigo-600")}><ScrollText size={16}/></button>
              <button onClick={() => setZenLayout('book')} className={cn("p-1 rounded hover:bg-white/80", zenLayout === 'book' && "text-indigo-600")}><BookOpen size={16}/></button>
            </div>
          )}

          {mode === 'edit' && (
            <button
              onClick={saveFinding}
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-lg shadow-lg shadow-slate-200 transition-all active:scale-95 disabled:opacity-70"
            >
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          )}

          {mode === 'negotiation' && (
            <button className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg shadow-lg shadow-emerald-200 transition-all active:scale-95">
              <CheckCircle2 size={16} /> Onayla
            </button>
          )}
        </div>
      </header>

      {/* ================= MAIN CONTENT ================= */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* --- MOD A: EDIT (COCKPIT) --- */}
        {mode === 'edit' && (
          <main className="flex-1 flex gap-6 p-6 h-full overflow-hidden">
            
            {/* LEFT: Tabbed Editor (70%) */}
            <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
              {/* Tabs Header */}
              <div className="flex items-center px-2 pt-2 border-b border-slate-100 bg-slate-50/50 gap-1 overflow-x-auto no-scrollbar">
                {EDITOR_TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  // Check if field has content for "completed" indicator
                  const hasContent = finding[tab.id] && finding[tab.id].length > 10;
                  
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-wide rounded-t-lg transition-all min-w-max border-b-2",
                        isActive 
                          ? "bg-white text-slate-800 border-indigo-500 shadow-[0_-2px_10px_rgba(0,0,0,0.02)]" 
                          : "text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-100"
                      )}
                    >
                      <Icon size={14} className={cn(isActive ? tab.color : "text-slate-400")} />
                      {tab.label}
                      {hasContent && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-1" />}
                    </button>
                  );
                })}
              </div>

              {/* Editor Canvas */}
              <div className="flex-1 overflow-y-auto p-8 bg-white relative">
                 {/* Current Tab Context */}
                 <div className="max-w-4xl mx-auto min-h-full">
                    {EDITOR_TABS.map((tab) => (
                      <div key={tab.id} className={cn(activeTab === tab.id ? "block" : "hidden", "animate-in fade-in slide-in-from-bottom-2 duration-300")}>
                        <div className="mb-4 flex items-center gap-2 text-slate-400 text-xs">
                          <tab.icon size={14} />
                          <span>{tab.placeholder}</span>
                        </div>
                        
                        <RichTextEditor
                          value={finding[tab.id] || ''}
                          onChange={(val) => updateField(tab.id, val)}
                          placeholder="Buraya yazmaya başlayın..."
                          className="prose-lg min-h-[500px] outline-none"
                        />
                      </div>
                    ))}
                 </div>
              </div>
            </div>

            {/* RIGHT: Control Center (30%) */}
            <div className="w-[340px] shrink-0 flex flex-col gap-6 h-full overflow-hidden">
              <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <FindingFormWidget finding={finding} onUpdate={updateField} />
              </div>
            </div>
          </main>
        )}

        {/* --- MOD B: ZEN (READER) --- */}
        {mode === 'zen' && (
          <main className="flex-1 overflow-y-auto relative h-full">
             <div className="max-w-full h-full p-8">
                <ZenReaderWidget 
                  data={finding} 
                  layout={zenLayout} 
                  warmth={warmth} 
                />
             </div>
          </main>
        )}

        {/* --- MOD C: NEGOTIATION --- */}
        {mode === 'negotiation' && (
           <main className="flex-1 flex gap-6 p-6 h-full overflow-hidden bg-slate-100">
             {/* Left: Read Only View */}
             <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-y-auto p-8">
                <ZenReaderWidget data={finding} layout="flow" warmth={0} />
             </div>
             
             {/* Right: Negotiation Board */}
             <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <NegotiationBoardWidget id={finding.id} />
             </div>
           </main>
        )}

        {/* --- UNIVERSAL RIGHT RAIL (Drawer Triggers) --- */}
        <div className="w-16 border-l border-slate-200 bg-white z-20 flex flex-col items-center py-4 gap-4 shrink-0 shadow-[-4px_0_15px_rgba(0,0,0,0.02)]">
          <button 
            onClick={() => toggleDrawer('chat')}
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
              drawerTab === 'chat' && isDrawerOpen ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" : "text-slate-400 hover:bg-slate-100"
            )}
            title="Mesajlar"
          >
            <MessageSquare size={20} />
          </button>

          <button 
            onClick={() => toggleDrawer('history')}
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
              drawerTab === 'history' && isDrawerOpen ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" : "text-slate-400 hover:bg-slate-100"
            )}
            title="Tarihçe"
          >
            <History size={20} />
          </button>

          <div className="w-8 h-px bg-slate-200" />

          <button 
            onClick={() => toggleDrawer('files')}
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
              drawerTab === 'files' && isDrawerOpen ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" : "text-slate-400 hover:bg-slate-100"
            )}
            title="Dosyalar"
          >
            <Paperclip size={20} />
          </button>
        </div>

      </div>

      {/* --- SLIDING DRAWER --- */}
      <UniversalFindingDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        activeTab={drawerTab}
        finding={finding}
      />

    </div>
  );
};

export default FindingStudioPage;