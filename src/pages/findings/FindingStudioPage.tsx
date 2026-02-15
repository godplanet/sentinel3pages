import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Save, 
  CheckCircle, 
  Flame, 
  MoreVertical,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { cn } from '@/lib/utils'; // Classname birleştirici (clsx/tailwind-merge)

// --- Hooks & Stores ---
import { useFindingStudio } from '@/features/finding-studio/hooks/useFindingStudio';
import { useUIStore } from '@/shared/stores/ui-store'; // Global UI state

// --- Sub-Components (Lazy/Mock Imports) ---
import { FindingFormWidget } from '@/features/finding-studio/components/FindingFormWidget';
import { ZenEditor } from '@/features/finding-studio/components/ZenEditor';
import { NegotiationBoard } from '@/features/finding-studio/components/NegotiationBoard';
import { UniversalFindingDrawer } from '@/widgets/UniversalFindingDrawer';

export const FindingStudioPage: React.FC = () => {
  // 1. Logic Integration
  const { 
    finding, 
    mode, 
    liveRiskScore, 
    saveFinding, 
    advanceWorkflow, 
    isLoading, 
    isSaving,
    hasUnsavedChanges 
  } = useFindingStudio();

  const { isSidebarOpen } = useUIStore();
  const navigate = useNavigate();

  // 2. Local UI State
  const [scrolled, setScrolled] = useState(false);

  // Scroll Detection for Glassmorphism Header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Loading State
  if (isLoading || !finding) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "min-h-screen bg-slate-50 transition-[padding] duration-300 ease-in-out font-sans",
        isSidebarOpen ? "pl-[280px]" : "pl-[80px]" // Smart Layout Rule #1
      )}
    >
      
      {/* --- DYNAMIC HEADER --- */}
      <header 
        className={cn(
          "sticky top-0 z-40 px-8 py-4 transition-all duration-300 border-b border-transparent",
          scrolled 
            ? "bg-white/80 backdrop-blur-md border-slate-200 shadow-sm" // Glass Effect
            : "bg-transparent"
        )}
      >
        <div className="flex items-center justify-between">
          
          {/* Left: Navigation & Ref Info */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 rounded-full hover:bg-slate-200 text-slate-600 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Reference No
                </span>
                {/* Critical Veto Badge */}
                {liveRiskScore > 20 && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 border border-red-200 text-red-700 text-[10px] font-bold animate-pulse">
                    <Flame size={10} />
                    KRİTİK VETO
                  </span>
                )}
              </div>
              <h1 className="text-lg font-semibold text-slate-800 leading-tight">
                {finding.id === 'new' ? 'Yeni Bulgu Taslağı' : `#${finding.id.toUpperCase()}`}
              </h1>
            </div>
          </div>

          {/* Center: Mode Indicator (Optional Visual Queue) */}
          <div className="hidden md:flex items-center gap-2 px-4 py-1 bg-slate-100 rounded-full text-xs font-medium text-slate-500">
            Current Mode: <span className="text-slate-800 capitalize">{mode}</span>
          </div>

          {/* Right: Context Actions */}
          <div className="flex items-center gap-3">
            {hasUnsavedChanges && (
              <span className="text-xs text-amber-600 italic mr-2">Kaydedilmemiş değişiklikler...</span>
            )}

            {/* Mode-Specific Buttons */}
            {mode === 'edit' && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={saveFinding}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-sm"
              >
                <Save size={16} />
                {isSaving ? 'Kaydediliyor...' : 'Taslağı Kaydet'}
              </motion.button>
            )}

            {mode === 'zen' && (
              <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg p-1 px-3 shadow-sm">
                <Flame size={16} className="text-orange-500" />
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  className="w-24 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                  title="Odak Sıcaklığı"
                />
              </div>
            )}

            {mode === 'negotiation' && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => advanceWorkflow('approved')}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-200"
              >
                <CheckCircle size={16} />
                Mutabık Kal
              </motion.button>
            )}

            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md">
              <MoreVertical size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="px-8 py-6 pb-32">
        <AnimatePresence mode="wait">
          
          {/* SCENARIO 1: EDIT MODE (Split View) */}
          {mode === 'edit' && (
            <motion.div 
              key="edit-mode"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-12 gap-8"
            >
              {/* Left Column: Properties & Metadata */}
              <div className="col-span-12 lg:col-span-4 xl:col-span-3">
                <FindingFormWidget finding={finding} />
              </div>

              {/* Center Column: The Editor */}
              <div className="col-span-12 lg:col-span-8 xl:col-span-9">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 min-h-[600px] p-6">
                  <ZenEditor finding={finding} />
                </div>
              </div>
            </motion.div>
          )}

          {/* SCENARIO 2: ZEN MODE (Focused View) */}
          {mode === 'zen' && (
            <motion.div 
              key="zen-mode"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="max-w-4xl mx-auto"
            >
              <div className="relative">
                <button 
                  onClick={() => navigate(`?mode=edit`)}
                  className="absolute -right-12 top-0 p-2 text-slate-300 hover:text-slate-500 tooltip"
                  title="Exit Zen Mode"
                >
                  <Minimize2 size={24} />
                </button>
                <div className="p-6 bg-white rounded-xl">
                  <p className="text-slate-500 text-sm">Zen Reader Widget - Coming Soon</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* SCENARIO 3: NEGOTIATION MODE (Comparison View) */}
          {mode === 'negotiation' && (
            <motion.div 
              key="negotiation-mode"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-140px)]"
            >
              {/* Left: Original Finding (Read Only) */}
              <div className="bg-slate-100 rounded-xl p-6 border border-slate-200 overflow-y-auto">
                <div className="mb-4 text-xs font-bold text-slate-400 uppercase">Orijinal Bulgu</div>
                <div className="p-4 bg-white rounded-lg">
                  <p className="text-slate-500 text-sm">Read-Only Finding Detail - Coming Soon</p>
                </div>
              </div>

              {/* Right: Negotiation Board (Chat & Actions) */}
              <div className="bg-white rounded-xl shadow-lg border border-indigo-100 overflow-hidden flex flex-col">
                <div className="p-4 border-b border-slate-100 bg-indigo-50/30 flex justify-between items-center">
                  <span className="font-semibold text-indigo-900">Müzakere Panosu</span>
                  <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-1 rounded">Canlı Oturum</span>
                </div>
                <div className="flex-1 overflow-hidden">
                   <NegotiationBoard findingId={finding.id} />
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* --- UNIVERSAL DRAWER (Bottom Action Sheet) --- */}
      <UniversalFindingDrawer 
        finding={finding} 
        isOpen={true} // Default açık veya bir state ile yönetilebilir
      />

    </div>
  );
};

export default FindingStudioPage;