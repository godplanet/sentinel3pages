import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Save, Loader2, Check, AlertTriangle,
  BookOpen, ScrollText, Sun, Clock,
  MessageSquare, History, Sparkles, User, Calendar
} from 'lucide-react';
import clsx from 'clsx';

// MİMARİ BAĞLANTILAR
import { useUIStore } from '@/shared/stores/ui-store';
import { useRiskConstitution } from '@/features/risk-constitution'; // Risk renkleri buradan gelecek
import { ZenEditor, type FindingEditorData } from '@/features/finding-studio/components/ZenEditor';
import { UniversalFindingDrawer, type DrawerTab } from '@/widgets/UniversalFindingDrawer';

// AYRIŞTIRILMIŞ VERİ KAYNAĞI
import { ZEN_DEMO_DATA, ZEN_DEMO_ACTIONS } from '@/features/finding-studio/api/mock-zen-data';

export default function FindingStudioZenPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new';

  // STORE BAĞLANTILARI
  const { isSidebarOpen, toggleSidebar } = useUIStore();
  const { constitution } = useRiskConstitution(); // Risk kuralları

  // STATE YÖNETİMİ
  const [isTwoPageMode, setIsTwoPageMode] = useState(true);
  const [warmth, setWarmth] = useState(20);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeDrawerTab, setActiveDrawerTab] = useState<DrawerTab>('ai');
  const [loading, setLoading] = useState(true);
  
  // FORM VERİSİ
  const [title, setTitle] = useState('SWIFT İşlemlerinde Görev Ayrılığı (SoD) İhlali');
  const [severity, setSeverity] = useState('CRITICAL');
  const [editorData, setEditorData] = useState<FindingEditorData>(ZEN_DEMO_DATA);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');

  // BAŞLANGIÇ AYARLARI
  useEffect(() => {
    // Sidebar'ı kapat (sadece açıksa)
    if (isSidebarOpen) {
      toggleSidebar();
    }

    // Veri Yükleme Simülasyonu (API çağrısı burada yapılır)
    setTimeout(() => {
      setLoading(false);
      // Demo modunda olduğumuz için dışarıdan import ettiğimiz ZEN_DEMO_DATA'yı kullanıyoruz.
      // Gerçek senaryoda: if (!isNew) loadFindingFromApi(id);
      setEditorData(ZEN_DEMO_DATA);
    }, 600);
  }, [isSidebarOpen, toggleSidebar]);

  const handleSave = () => {
    setSaveState('saving');
    // API Kayıt işlemi burada yapılacak
    setTimeout(() => setSaveState('saved'), 1000);
    setTimeout(() => setSaveState('idle'), 2500);
  };

  const openDrawer = (tab: DrawerTab) => {
    setActiveDrawerTab(tab);
    setIsDrawerOpen(true);
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-slate-400 w-8 h-8"/></div>;

  return (
    <div className={clsx("min-h-screen bg-slate-100 text-slate-800 flex flex-col overflow-hidden", isTwoPageMode ? "h-screen" : "")}>
      
      {/* Kağıt Dokusu */}
      <div className="absolute inset-0 pointer-events-none z-50 mix-blend-multiply" style={{ backgroundColor: '#fdf6e3', opacity: warmth * 0.01 }} />

      {/* HEADER */}
      <header className="h-16 px-6 border-b border-slate-200 bg-white/90 backdrop-blur-sm flex items-center justify-between shrink-0 z-[60] shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/execution/findings')} className="p-2 hover:bg-slate-100 rounded-full text-slate-500"><ArrowLeft size={20}/></button>
          <div className="flex items-center gap-3">
             <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs font-bold border border-red-200">KRİTİK</span>
             <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="text-lg font-bold text-slate-900 bg-transparent border-none focus:ring-0 w-[500px]" />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
             <button onClick={() => openDrawer('chat')} className="p-2 hover:bg-white rounded text-slate-500 hover:text-blue-600 hover:shadow-sm transition-all"><MessageSquare size={18}/></button>
             <button onClick={() => openDrawer('history')} className="p-2 hover:bg-white rounded text-slate-500 hover:text-purple-600 hover:shadow-sm transition-all"><History size={18}/></button>
             <button onClick={() => openDrawer('ai')} className="p-2 hover:bg-white rounded text-slate-500 hover:text-indigo-600 hover:shadow-sm transition-all"><Sparkles size={18}/></button>
          </div>
          
          <div className="h-6 w-px bg-slate-300" />

          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
             <button onClick={() => setIsTwoPageMode(false)} className={clsx("p-1.5 rounded", !isTwoPageMode ? "bg-white shadow text-slate-900" : "text-slate-400")}><ScrollText size={18}/></button>
             <button onClick={() => setIsTwoPageMode(true)} className={clsx("p-1.5 rounded", isTwoPageMode ? "bg-white shadow text-slate-900" : "text-slate-400")}><BookOpen size={18}/></button>
          </div>

          <button onClick={handleSave} className="flex items-center gap-2 px-5 py-2 bg-slate-900 text-white rounded-lg font-bold text-sm hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200">
             {saveState === 'saving' ? <Loader2 size={16} className="animate-spin" /> : saveState === 'saved' ? <Check size={16} /> : <Save size={16} />}
             {saveState === 'saved' ? 'Kaydedildi' : 'Kaydet'}
          </button>
        </div>
      </header>

      {/* ANA İÇERİK */}
      <div className="flex-1 flex p-6 gap-6 overflow-hidden relative z-10">
        
        {/* SOL: EDİTÖR */}
        <div className={clsx(
            "bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col transition-all duration-500",
            isTwoPageMode ? "flex-[2]" : "flex-1 max-w-4xl mx-auto w-full mb-12"
        )}>
           <div className="flex-1 overflow-y-auto p-12 pb-32 custom-scrollbar">
              <div className="max-w-3xl mx-auto">
                 {/* AI Banner */}
                 <div className="mb-8 p-5 bg-gradient-to-r from-indigo-50 to-white border-l-4 border-indigo-500 rounded-r-xl shadow-sm">
                    <div className="flex items-center gap-2 mb-2 text-indigo-700 font-bold text-xs uppercase tracking-wider">
                       <Sparkles size={14} /> Sentinel AI Analizi
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">
                        Hazine operasyonlarında 3.2 Milyon USD tutarındaki işlemlerde Maker-Checker prensibi ihlal edilmiştir.
                    </p>
                 </div>

                 <ZenEditor initialData={editorData} onChange={setEditorData} />
              </div>
           </div>
        </div>

        {/* ORTA: CİLT */}
        {isTwoPageMode && (
           <div className="w-4 shrink-0 bg-gradient-to-r from-slate-300 via-slate-100 to-slate-300 rounded-full opacity-50" />
        )}

        {/* SAĞ: AKSİYONLAR */}
        <div className={clsx(
            "bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col transition-all duration-500",
            isTwoPageMode ? "flex-1" : "hidden"
        )}>
           <div className="p-6 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h2 className="font-bold text-slate-800">Aksiyon Planları</h2>
              <span className="bg-slate-200 text-slate-600 px-2 py-1 rounded text-xs font-bold">{ZEN_DEMO_ACTIONS.length} Kayıt</span>
           </div>
           
           <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
              {/* Aksiyonları dışarıdan gelen veriden dönüyoruz */}
              {ZEN_DEMO_ACTIONS.map(action => (
                <div key={action.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group">
                    <div className="flex justify-between items-start mb-2">
                        <span className={clsx("px-2 py-0.5 rounded text-[10px] font-bold", action.statusColor)}>
                            {action.status}
                        </span>
                        <Clock size={14} className="text-slate-400" />
                    </div>
                    <h3 className="font-bold text-slate-800 text-sm mb-1 group-hover:text-blue-600">{action.title}</h3>
                    <p className="text-xs text-slate-500 mb-3 line-clamp-2">{action.description}</p>
                    <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400">
                        <div className="flex items-center gap-1"><User size={12}/> {action.owner}</div>
                        <div className="flex items-center gap-1"><Calendar size={12}/> {action.dueDate}</div>
                    </div>
                </div>
              ))}

              <button className="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-400 font-bold text-xs hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
                 + Yeni Aksiyon Planı Ekle
              </button>
           </div>
        </div>

      </div>

      <UniversalFindingDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        defaultTab={activeDrawerTab}
        findingId={id === 'new' ? undefined : id}
        currentViewMode="zen"
      />

    </div>
  );
}