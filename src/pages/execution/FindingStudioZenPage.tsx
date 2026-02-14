import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Save, Loader2, Check,
  BookOpen, ScrollText, Sun,
  MessageSquare, History, Sparkles
} from 'lucide-react';
import clsx from 'clsx';

// SİSTEM BİLEŞENLERİ
import { useUIStore } from '@/shared/stores/ui-store';
// DİKKAT: ZenEditor default export olarak çağrılıyor
import ZenEditor from '@/features/finding-studio/components/ZenEditor'; 
// DİKKAT: UniversalDrawer named export olarak çağrılıyor
import { UniversalFindingDrawer, type DrawerTab } from '@/widgets/UniversalFindingDrawer';

// Tip Tanımları
interface FindingEditorData {
  criteria: string;
  condition: string;
  root_cause_analysis: {
    method: 'five_whys' | 'fishbone' | 'bowtie';
    five_whys?: string[];
  };
  effect: string;
  recommendation: string;
}

const SEVERITY_OPTIONS = [
  { value: 'CRITICAL', label: 'Kritik', color: 'bg-red-600' },
  { value: 'HIGH', label: 'Yüksek', color: 'bg-orange-500' },
  { value: 'MEDIUM', label: 'Orta', color: 'bg-amber-500' },
  { value: 'LOW', label: 'Düşük', color: 'bg-blue-500' },
  { value: 'OBSERVATION', label: 'Gözlem', color: 'bg-slate-500' },
];

export default function FindingStudioZenPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new';

  // UI State
  const { setSidebarOpen } = useUIStore();
  const [isTwoPageMode, setIsTwoPageMode] = useState(true);
  const [warmth, setWarmth] = useState(15);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeDrawerTab, setActiveDrawerTab] = useState<DrawerTab>('ai');

  // Data State
  const [loading, setLoading] = useState(true);
  const [findingId, setFindingId] = useState(isNew ? null : id);
  const [title, setTitle] = useState('Kasa İşlemlerinde Çift Anahtar Kuralı İhlali');
  const [severity, setSeverity] = useState('HIGH');
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  
  const [editorData, setEditorData] = useState<FindingEditorData>({
    criteria: '',
    condition: '',
    root_cause_analysis: { method: 'five_whys', five_whys: ['', '', '', '', ''] },
    effect: '',
    recommendation: '',
  });

  const aiSummary = "Vezne işlemlerinde çift anahtar prosedürü sistematik olarak ihlal edilmiştir. Bu durum, kurum içi suistimal riskini artırmaktadır.";

  useEffect(() => {
    setSidebarOpen(false);
    const timer = setTimeout(() => setLoading(false), 800);
    return () => {
        setSidebarOpen(true);
        clearTimeout(timer);
    };
  }, [setSidebarOpen]);

  const handleSave = () => {
    setSaveState('saving');
    setTimeout(() => {
      setSaveState('saved');
      setTimeout(() => setSaveState('idle'), 2000);
    }, 1500);
  };

  const openDrawer = (tab: DrawerTab) => {
    setActiveDrawerTab(tab);
    setIsDrawerOpen(true);
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 text-slate-400 animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Zen Modu Hazırlanıyor...</p>
      </div>
    );
  }

  return (
    <div className={clsx(
      "min-h-screen bg-slate-50 text-slate-800 transition-all duration-500 relative flex flex-col overflow-hidden", 
      isTwoPageMode ? "h-screen" : ""
    )}>
      
      {/* Warmth Overlay */}
      <div 
          className="absolute inset-0 pointer-events-none z-[45] transition-opacity duration-300"
          style={{ 
              backgroundColor: '#fcd34d', 
              opacity: warmth * 0.003,
              mixBlendMode: 'color-burn'
          }} 
      />

      {/* Header */}
      <header className="h-16 px-6 border-b border-slate-200 bg-white/60 backdrop-blur-md flex items-center justify-between shrink-0 relative z-50">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/execution/findings')} className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-3">
             <div className="flex gap-1">
                {SEVERITY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setSeverity(opt.value)}
                    className={clsx("w-4 h-4 rounded-full transition-all", severity === opt.value ? clsx(opt.color, "ring-2 ring-offset-2 ring-slate-300") : "bg-slate-200 hover:bg-slate-300")}
                    title={opt.label}
                  />
                ))}
             </div>
             <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-lg font-bold text-slate-900 bg-transparent border-none focus:outline-none focus:ring-0 placeholder:text-slate-300 w-[400px]"
                placeholder="Bulgu Başlığı"
             />
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 border-r border-slate-200 pr-4">
            <button onClick={() => openDrawer('chat')} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><MessageSquare size={18} /></button>
            <button onClick={() => openDrawer('history')} className="p-2 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg"><History size={18} /></button>
            <button onClick={() => openDrawer('ai')} className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"><Sparkles size={18} /></button>
          </div>

          <div className="flex items-center gap-3 bg-white/80 px-4 py-1.5 rounded-full border border-slate-200 shadow-sm">
            <Sun size={14} className="text-slate-400" />
            <input type="range" min="0" max="100" value={warmth} onChange={(e) => setWarmth(parseInt(e.target.value))} className="w-24 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-600" />
          </div>

          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button onClick={() => setIsTwoPageMode(false)} className={clsx("p-1.5 rounded-md", !isTwoPageMode ? "bg-white shadow-sm text-blue-600" : "text-slate-500")}><ScrollText size={16} /></button>
            <button onClick={() => setIsTwoPageMode(true)} className={clsx("p-1.5 rounded-md", isTwoPageMode ? "bg-white shadow-sm text-blue-600" : "text-slate-500")}><BookOpen size={16} /></button>
          </div>

          <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-lg shadow-sm hover:bg-slate-800 transition-colors">
             {saveState === 'saving' ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 
             {saveState === 'saved' ? 'Kaydedildi' : 'Kaydet'}
          </button>
        </div>
      </header>

      {/* Ana İçerik */}
      <div className={clsx("flex-1 flex relative z-10 transition-all duration-300", isTwoPageMode ? "overflow-hidden bg-slate-100 p-6 pb-12" : "overflow-y-auto p-8")}>
        
        {/* Sol Sayfa (Bulgu) */}
        <div className={clsx(
          "flex flex-col bg-white transition-all duration-300 relative", 
          isTwoPageMode ? "flex-1 rounded-l-xl shadow-2xl border-y border-l border-slate-200 overflow-hidden" : "max-w-4xl mx-auto w-full rounded-2xl shadow-sm border border-slate-200 p-10 mb-12"
        )}>
          <div className="flex-1 overflow-y-auto p-12 pb-32 custom-scrollbar">
            <div className={clsx("max-w-3xl", isTwoPageMode ? "ml-auto" : "mx-auto")}>
              {/* AI Özeti */}
              <div className="mb-10 bg-indigo-50 border border-indigo-100 rounded-2xl p-6 relative overflow-hidden">
                <h3 className="text-xs font-black text-indigo-900 mb-2 flex items-center gap-2 uppercase tracking-wider"><Sparkles size={14}/> Yönetici Özeti</h3>
                <p className="text-sm text-slate-700 font-medium relative z-10">{aiSummary}</p>
              </div>

              {/* EDİTÖR ÇAĞRISI */}
              <ZenEditor findingId={findingId || undefined} initialData={editorData} onChange={setEditorData} />
            </div>
          </div>
        </div>

        {/* Cilt (Spine) */}
        {isTwoPageMode && (
          <div className="w-12 shrink-0 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 border-x border-slate-300 relative z-20 flex justify-center shadow-inner">
             <div className="w-px h-full bg-black/5" />
          </div>
        )}

        {/* Sağ Sayfa (Aksiyonlar) */}
        <div className={clsx(
          "flex flex-col bg-white transition-all duration-300 relative", 
          isTwoPageMode ? "flex-1 rounded-r-xl shadow-2xl border-y border-r border-slate-200 overflow-hidden" : "max-w-4xl mx-auto w-full rounded-2xl shadow-sm border border-slate-200 p-10"
        )}>
          <div className="flex-1 overflow-y-auto p-12 pb-32 custom-scrollbar">
            <div className={clsx("max-w-3xl", isTwoPageMode ? "mr-auto" : "mx-auto")}>
              <h2 className="text-2xl font-black text-slate-800 font-serif text-center mb-10">Aksiyon Planları</h2>
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-orange-300 transition-colors">
                  <div className="absolute top-0 left-0 w-1 h-full bg-orange-400" />
                  <h3 className="font-bold text-slate-800 mb-2">Şube Kasa Prosedürünün Güncellenmesi</h3>
                  <p className="text-sm text-slate-600">Vezne personeline çift anahtar eğitimi verilecek.</p>
               </div>
            </div>
          </div>
        </div>

      </div>

      <UniversalFindingDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        defaultTab={activeDrawerTab}
        findingId={findingId}
        currentViewMode="zen"
      />

    </div>
  );
}