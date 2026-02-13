import { useState } from 'react';
import { 
  X, MessageSquare, History, Network, ShieldCheck, 
  Sparkles, Bot, AlertCircle 
} from 'lucide-react';
import clsx from 'clsx';

// ALT SEKMELER (Birazdan bunları kodlayacağız)
// import { ChatPanel } from './components/ChatPanel';
// import { HistoryPanel } from './components/HistoryPanel';
// import { RCAPanel } from './components/RCAPanel';
// import { ReviewPanel } from './components/ReviewPanel';
// import { AIPanel } from './components/AIPanel';

export type DrawerTab = 'chat' | 'ai' | 'rca' | 'review' | 'history' | null;

interface UniversalFindingDrawerProps {
  findingId: string | null;
  isOpen: boolean;
  defaultTab?: DrawerTab;
  onClose: () => void;
  // Sizin harika fikriniz: Görünüm değiştirici (View Switcher) desteği
  currentViewMode?: 'zen' | 'studio' | 'glass'; 
  onViewModeChange?: (mode: 'zen' | 'studio' | 'glass') => void;
}

export function UniversalFindingDrawer({ 
  findingId, 
  isOpen, 
  defaultTab = 'ai',
  onClose,
  currentViewMode,
  onViewModeChange
}: UniversalFindingDrawerProps) {
  
  const [activeTab, setActiveTab] = useState<DrawerTab>(defaultTab);

  if (!isOpen) return null;

  return (
    <>
      {/* ARKA PLAN KARARTMASI */}
      <div 
        className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[90] transition-opacity duration-300"
        onClick={onClose}
      />

      {/* ÇEKMECE PANELİ - Eski RootCauseDrawer'daki gibi sol üst köşesi yuvarlatıldı */}
      <div className={clsx(
        "fixed bottom-0 right-0 top-[64px] w-full max-w-[500px] shadow-[rgba(0,0,0,0.56)_0px_22px_70px_4px] z-[100] flex flex-col transform transition-transform duration-300 ease-in-out border-l rounded-tl-2xl",
        currentViewMode === 'glass' 
            ? "bg-slate-900/95 backdrop-blur-xl border-white/20" 
            : "bg-white border-slate-200"
      )}>
        
        {/* HEADER */}
        <div className={clsx(
            "h-16 px-6 border-b flex items-center justify-between shrink-0 rounded-tl-2xl z-10",
            currentViewMode === 'glass' ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"
        )}>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                <TabButton 
                  active={activeTab === 'ai'} onClick={() => setActiveTab('ai')} 
                  icon={<Sparkles size={16} className={activeTab === 'ai' ? "text-purple-600" : ""} />} 
                  label="Sentinel AI" 
                  isGlass={currentViewMode === 'glass'}
                />
                <TabButton 
                  active={activeTab === 'chat'} onClick={() => setActiveTab('chat')} 
                  icon={<MessageSquare size={16} className={activeTab === 'chat' ? "text-blue-600" : ""} />} 
                  label="Müzakere" 
                  isGlass={currentViewMode === 'glass'}
                />
                <TabButton 
                  active={activeTab === 'rca'} onClick={() => setActiveTab('rca')} 
                  icon={<Network size={16} className={activeTab === 'rca' ? "text-emerald-600" : ""} />} 
                  label="Kök Neden" 
                  isGlass={currentViewMode === 'glass'}
                />
                <TabButton 
                  active={activeTab === 'review'} onClick={() => setActiveTab('review')} 
                  icon={<ShieldCheck size={16} className={activeTab === 'review' ? "text-orange-600" : ""} />} 
                  label="Gözetim" 
                  isGlass={currentViewMode === 'glass'}
                />
                <TabButton 
                  active={activeTab === 'history'} onClick={() => setActiveTab('history')} 
                  icon={<History size={16} className={activeTab === 'history' ? "text-slate-600" : ""} />} 
                  label="Tarihçe" 
                  isGlass={currentViewMode === 'glass'}
                />
            </div>
            
            <button onClick={onClose} className={clsx("p-2 rounded-full transition-colors ml-2 shrink-0", currentViewMode === 'glass' ? "text-white/60 hover:text-white hover:bg-white/10" : "text-slate-400 hover:text-red-500 hover:bg-red-50")}>
                <X size={20} />
            </button>
        </div>

        {/* İÇERİK ALANI */}
        <div className={clsx(
            "flex-1 overflow-y-auto custom-scrollbar relative",
            currentViewMode === 'glass' ? "bg-transparent text-slate-200" : "bg-white text-slate-800"
        )}>
            <div className="p-6 h-full">
              {/* ALT BİLEŞENLER BURADA ÇAĞRILACAK */}
              {activeTab === 'ai' && (
                  <div className="text-center mt-20 text-slate-400 animate-pulse">
                      <Bot size={48} className="mx-auto mb-4 opacity-50" />
                      <p>Sizin "AITab" ve "NotlarTab" birleşimi buraya gelecek.<br/>(Benzerlik Analizi, Notlardan Bulgu Üretme)</p>
                  </div>
              )}
              {activeTab === 'chat' && <div className="text-center mt-20 text-slate-400">"YorumTab" Müzakere Ekranı Gelecek</div>}
              {activeTab === 'rca' && <div className="text-center mt-20 text-slate-400">"RootCauseDrawer" Kodları Buraya Gelecek</div>}
              {activeTab === 'review' && <div className="text-center mt-20 text-slate-400">Gözden Geçirme Notları Gelecek</div>}
              {activeTab === 'history' && <div className="text-center mt-20 text-slate-400">"TarihceTab" Logları Gelecek</div>}
            </div>
        </div>

      </div>
    </>
  );
}

// YARDIMCI BİLEŞEN: SEKME BUTONU
function TabButton({ active, onClick, icon, label, isGlass }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string; isGlass: boolean }) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all shrink-0",
        active 
          ? isGlass 
            ? "bg-white/15 text-white shadow-sm ring-1 ring-white/20" 
            : "bg-white text-slate-800 shadow-sm ring-1 ring-slate-200" 
          : isGlass
            ? "text-white/60 hover:text-white hover:bg-white/5"
            : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
      )}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}