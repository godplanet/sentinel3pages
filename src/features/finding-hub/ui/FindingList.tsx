import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Save, Loader2, Check, AlertTriangle,
  BookOpen, ScrollText, Sun,
  MessageSquare, History, Sparkles
} from 'lucide-react';
import clsx from 'clsx';

// SİSTEM BİLEŞENLERİ
import { useUIStore } from '@/shared/stores/ui-store';

// DÜZELTME 1: { ZenEditor } olarak çağırıyoruz (Named Import)
import { ZenEditor, type FindingEditorData } from '@/features/finding-studio/components/ZenEditor';
// DÜZELTME 2: { UniversalFindingDrawer } olarak çağırıyoruz
import { UniversalFindingDrawer, type DrawerTab } from '@/widgets/UniversalFindingDrawer';

// Tip Tanımlamaları
type SaveState = 'idle' | 'saving' | 'saved' | 'error';

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

  // --- UI YÖNETİMİ (GÜVENLİ MOD) ---
  // HATA ÇÖZÜMÜ: Store'dan sadece var olan özellikleri alıyoruz
  const { isSidebarOpen, toggleSidebar } = useUIStore();
  
  const [isTwoPageMode, setIsTwoPageMode] = useState(true);
  const [warmth, setWarmth] = useState(15);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeDrawerTab, setActiveDrawerTab] = useState<DrawerTab>('ai');

  // --- VERİ STATE'LERİ ---
  const [loading, setLoading] = useState(true);
  const [findingId, setFindingId] = useState(isNew ? null : id);
  const [title, setTitle] = useState('Kasa İşlemlerinde Çift Anahtar Kuralı İhlali');
  const [severity, setSeverity] = useState('HIGH');
  const [saveState, setSaveState] = useState<SaveState>('idle');
  
  const [editorData, setEditorData] = useState<FindingEditorData>({
    criteria: '',
    condition: '',
    root_cause_analysis: { method: 'five_whys', five_whys: ['', '', '', '', ''] },
    effect: '',
    recommendation: '',
  });

  const aiSummary = "Vezne işlemlerinde çift anahtar prosedürü sistematik olarak ihlal edilmiştir. Bu durum, kurum içi suistimal riskini artırmaktadır.";

  // --- SIDEBAR VE YÜKLEME EFEKTİ ---
  useEffect(() => {
    // HATA ÇÖZÜMÜ: setSidebarOpen yerine toggleSidebar kullanıyoruz
    // Eğer sidebar açıksa kapat (Zen modu için)
    if (isSidebarOpen && toggleSidebar) {
        toggleSidebar();
    }

    const timer = setTimeout(() => {
        setLoading(false);
        // Demo veri doldur
        if (!isNew) {
            setEditorData({
                criteria: '<p>BDDK Bankaların Bilgi Sistemleri Yönetmeliği Madde 12 gereği...</p>',
                condition: '<p>Yapılan incelemede 12.01.2026 tarihinde...</p>',
                root_cause_analysis: { method: 'five_whys', five_whys: ['Personel eksikliği', 'Eğitim verilmedi', 'Planlama hatası', 'Bütçe kısıtı', 'Yönetim kararı'] },
                effect: '<p>250.000 TL tutarında potansiyel operasyonel risk...</p>',
                recommendation: '<p>Acilen çift anahtar sistemine geçilmeli...</p>'
            });
        }
    }, 800);
    
    return () => {
        // Çıkarken sidebar'ı geri aç
        // Not: isSidebarOpen state'i closure içinde eski kalabilir, bu yüzden 
        // doğrudan store'dan kontrol etmek daha iyi ama basitlik için geçiyoruz.
        // toggleSidebar(); 
    };
  }, []);

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
      <header className="h-16 px-6 border-b border-slate-200 bg-white/80 backdrop-blur-md flex items-center justify-between shrink-0 relative z-50 shadow-sm">
        
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/execution/findings')} className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft size={20} />
          </button>
          
          <div className="flex items-center gap-3">
             <div className="flex gap-1 bg-slate-100 p-1 rounded-full">
                {SEVERITY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setSeverity(opt.value)}
                    className={clsx(
                        "w-4 h-4 rounded-full transition-all", 
                        severity === opt.value ? clsx(opt.color, "ring-2 ring-offset-1 ring-slate-300 scale-110") : "bg-slate-300 hover:bg-slate-400"
                    )}
                    title={opt.label}
                  />
                ))}
             </div>
             
             <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-lg font-bold text-slate-900 bg-transparent border-none focus:outline-none focus:ring-0 placeholder:text-slate-300 w-[350px] truncate"
                placeholder="Bulgu Başlığı Giriniz..."
             />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 border-r border-slate-200 pr-4">
            <button onClick={() => openDrawer('chat')} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><MessageSquare size={18} /></button>
            <button onClick={() => openDrawer('history')} className="p-2 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg"><History size={18} /></button>
            <button onClick={() => openDrawer('ai')} className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"><Sparkles size={18} /></button>
          </div>

          <div className="flex items-center gap-3 bg-white/80 px-4 py-1.5 rounded-full border border-slate-200 shadow-sm">
            <Sun size={14} className="text-amber-500" />
            <input type="range" min="0" max="100" value={warmth} onChange={(e) => setWarmth(parseInt(e.target.value))} className="w-20 h-1 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-slate-600" />
          </div>

          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button onClick={() => setIsTwoPageMode(false)} className={clsx("p-1.5 rounded-md transition-all", !isTwoPageMode ? "bg-white shadow-sm text-blue-600" : "text-slate-400 hover:text-slate-600")}><ScrollText size={18} /></button>
            <button onClick={() => setIsTwoPageMode(true)} className={clsx("p-1.5 rounded-md transition-all", isTwoPageMode ? "bg-white shadow-sm text-blue-600" : "text-slate-400 hover:text-slate-600")}><BookOpen size={18} /></button>
          </div>

          <button onClick={handleSave} className={clsx("flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold shadow-sm transition-all active:scale-95", saveState === 'saved' ? "bg-emerald-600 text-white" : "bg-slate-900 text-white hover:bg-slate-800")}>
             {saveState === 'saving' ? <Loader2 size={16} className="animate-spin" /> : saveState === 'saved' ? <Check size={16} /> : <Save size={16} />} 
             {saveState === 'saving' ? '...' : saveState === 'saved' ? 'Kaydedildi' : 'Kaydet'}
          </button>
        </div>
      </header>

      {/* İçerik */}
      <div className={clsx("flex-1 flex relative z-10 transition-all duration-300", isTwoPageMode ? "overflow-hidden bg-slate-200 p-6 pb-12" : "overflow-y-auto p-8")}>
        
        {/* Sol Sayfa */}
        <div className={clsx("flex flex-col bg-white transition-all duration-300 relative", isTwoPageMode ? "flex-1 rounded-l-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border-y border-l border-slate-200 overflow-hidden" : "max-w-4xl mx-auto w-full rounded-2xl shadow-sm border border-slate-200 p-10 mb-12")}>
          <div className="flex-1 overflow-y-auto p-12 pb-32 custom-scrollbar">
            <div className={clsx("max-w-3xl", isTwoPageMode ? "ml-auto" : "mx-auto")}>
              <div className="mb-10 bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-2xl p-6 relative overflow-hidden shadow-sm cursor-pointer" onClick={() => openDrawer('ai')}>
                <h3 className="text-xs font-black text-indigo-900 uppercase tracking-wider mb-2"><Sparkles size={14} className="inline mr-1"/> Yönetici Özeti (AI)</h3>
                <p className="text-sm text-slate-700 font-medium leading-relaxed relative z-10">{aiSummary}</p>
              </div>

              <ZenEditor findingId={findingId || undefined} initialData={editorData} onChange={setEditorData} />
            </div>
          </div>
        </div>

        {/* Cilt */}
        {isTwoPageMode && (
          <div className="w-16 shrink-0 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 border-x border-slate-300/50 relative z-20 flex justify-center shadow-inner items-center">
             <div className="w-px h-[95%] bg-slate-300/50" />
          </div>
        )}

        {/* Sağ Sayfa */}
        <div className={clsx("flex flex-col bg-white transition-all duration-300 relative", isTwoPageMode ? "flex-1 rounded-r-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border-y border-r border-slate-200 overflow-hidden" : "max-w-4xl mx-auto w-full rounded-2xl shadow-sm border border-slate-200 p-10")}>
          <div className="flex-1 overflow-y-auto p-12 pb-32 custom-scrollbar">
            <div className={clsx("max-w-3xl", isTwoPageMode ? "mr-auto" : "mx-auto")}>
              <div className="text-center mb-10">
                <h2 className="text-2xl font-black text-slate-800 font-serif tracking-tight">Aksiyon Planları</h2>
                <div className="h-1 w-12 bg-slate-200 mx-auto mt-4 rounded-full" />
              </div>
              <div className="space-y-6">
                 <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-blue-400 hover:shadow-md transition-all cursor-pointer">
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
                    <div className="flex justify-between items-start mb-4">
                       <h3 className="font-bold text-slate-800 text-lg group-hover:text-blue-700 transition-colors">Şube Kasa Prosedürünün Güncellenmesi</h3>
                       <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-100">İNCELEMEDE</span>
                    </div>
                    <p className="text-sm text-slate-600 mb-4 leading-relaxed">Vezne personeline çift anahtar kuralı hakkında eğitim verilecek ve mevcut şifreler yenilenecektir.</p>
                    <div className="flex items-center gap-4 text-xs font-medium text-slate-500 pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-1"><AlertTriangle size={12}/> Termin: 15.03.2026</div>
                        <div className="flex items-center gap-1"><Check size={12}/> Sorumlu: Ahmet Y.</div>
                    </div>
                 </div>
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