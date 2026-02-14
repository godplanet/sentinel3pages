import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Save, Loader2, Check,
  BookOpen, ScrollText, Sun,
  MessageSquare, History, Sparkles
} from 'lucide-react';
import clsx from 'clsx';

// --- MİMARİ BAĞLANTILAR ---
import { useUIStore } from '@/shared/stores/ui-store';
import { useFindingStore, findingApi } from '@/entities/finding'; // Store ve API bağlantısı
import { useRiskConstitution } from '@/features/risk-constitution'; // Risk Anayasası
import { ZenEditor, type FindingEditorData } from '@/features/finding-studio/components/ZenEditor';
import { UniversalFindingDrawer, type DrawerTab } from '@/widgets/UniversalFindingDrawer';

// Tip Tanımlamaları
type SaveState = 'idle' | 'saving' | 'saved' | 'error';

export default function FindingStudioZenPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new';

  // 1. UI STORE (DOĞRU KULLANIM)
  const { isSidebarOpen, toggleSidebar } = useUIStore();
  
  // 2. DATA STORE & RISK CONSTITUTION
  const { currentFinding, setCurrentFinding, isLoading: isStoreLoading } = useFindingStore();
  const { constitution } = useRiskConstitution();

  // Local UI State
  const [isTwoPageMode, setIsTwoPageMode] = useState(true);
  const [warmth, setWarmth] = useState(15);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeDrawerTab, setActiveDrawerTab] = useState<DrawerTab>('ai');
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [loading, setLoading] = useState(true);

  // Editör Verisi (Başlangıçta boş, API'den gelince dolacak)
  const [editorData, setEditorData] = useState<FindingEditorData>({
    criteria: '',
    condition: '',
    root_cause_analysis: { method: 'five_whys', five_whys: ['', '', '', '', ''] },
    effect: '',
    recommendation: '',
  });

  // --- BAŞLANGIÇ YÜKLEMESİ ---
  useEffect(() => {
    // Zen moduna girerken Sidebar açıksa kapat
    if (isSidebarOpen) {
      toggleSidebar();
    }

    async function init() {
      if (isNew) {
        setLoading(false);
        return;
      }

      try {
        // GERÇEK VERİ ÇEKME İŞLEMİ
        const data = await findingApi.getById(id!);
        if (data) {
          setCurrentFinding(data);
          
          // API verisini Editör formatına dönüştür
          setEditorData({
            criteria: (data as any).criteria || '',
            condition: (data as any).condition || '',
            root_cause_analysis: (data as any).root_cause_analysis || { method: 'five_whys' },
            effect: (data as any).impact || '', // Veritabanındaki karşılığı 'impact' olabilir
            recommendation: (data as any).recommendation || ''
          });
        }
      } catch (error) {
        console.error("Bulgu yüklenirken hata:", error);
      } finally {
        setLoading(false);
      }
    }

    init();

    // Çıkarken temizlik (Opsiyonel: Sidebar'ı geri açmak isterseniz)
    return () => {
      // if (!isSidebarOpen) toggleSidebar(); 
    };
  }, [id, isNew]); // Dependency array'i sadeleştirdik

  // --- RİSK ANAYASASINDAN RENK GETİRME ---
  const getSeverityColor = (severity: string) => {
    if (!constitution) return 'bg-slate-500';
    // Basit bir eşleştirme (Constitution yapısına göre özelleştirilebilir)
    switch(severity) {
      case 'CRITICAL': return 'bg-red-600';
      case 'HIGH': return 'bg-orange-500';
      case 'MEDIUM': return 'bg-amber-500';
      case 'LOW': return 'bg-blue-500';
      default: return 'bg-slate-500';
    }
  };

  const handleSave = async () => {
    setSaveState('saving');
    try {
      if (currentFinding?.id) {
        // API'ye kaydetme işlemi burada yapılacak
        // await findingApi.update(currentFinding.id, { ...currentFinding, ...editorData });
        
        // Şimdilik simülasyon
        setTimeout(() => {
          setSaveState('saved');
          setTimeout(() => setSaveState('idle'), 2000);
        }, 1000);
      }
    } catch (error) {
      setSaveState('error');
    }
  };

  const openDrawer = (tab: DrawerTab) => {
    setActiveDrawerTab(tab);
    setIsDrawerOpen(true);
  };

  if (loading || isStoreLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 text-slate-400 animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Veriler Hazırlanıyor...</p>
      </div>
    );
  }

  return (
    <div className={clsx("min-h-screen bg-slate-50 text-slate-800 flex flex-col overflow-hidden", isTwoPageMode ? "h-screen" : "")}>
      
      {/* Kağıt Dokusu Katmanı */}
      <div 
          className="absolute inset-0 pointer-events-none z-[45] mix-blend-multiply transition-opacity duration-300"
          style={{ backgroundColor: '#fdf6e3', opacity: warmth * 0.01 }} 
      />

      {/* --- HEADER --- */}
      <header className="h-16 px-6 border-b border-slate-200 bg-white/90 backdrop-blur-sm flex items-center justify-between shrink-0 z-[50] shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/execution/findings')} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
            <ArrowLeft size={20} />
          </button>
          
          <div className="flex items-center gap-3">
             {/* Risk Badge (Constitution Bağlantılı) */}
             <span className={clsx(
               "px-2 py-0.5 rounded text-xs font-bold text-white",
               getSeverityColor(currentFinding?.severity || 'LOW')
             )}>
                {currentFinding?.severity || 'TASLAK'}
             </span>
             
             {/* Başlık (Store'dan gelen gerçek veri) */}
             <h1 className="text-lg font-bold text-slate-900 truncate max-w-[500px]">
               {currentFinding?.title || 'Yeni Bulgu Tanımlama'}
             </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Araç Çubuğu */}
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
             <button onClick={() => openDrawer('chat')} className="p-2 hover:bg-white rounded text-slate-500 hover:text-blue-600 transition-all" title="Yazışmalar"><MessageSquare size={18}/></button>
             <button onClick={() => openDrawer('history')} className="p-2 hover:bg-white rounded text-slate-500 hover:text-purple-600 transition-all" title="Tarihçe"><History size={18}/></button>
             <button onClick={() => openDrawer('ai')} className="p-2 hover:bg-white rounded text-slate-500 hover:text-indigo-600 transition-all" title="AI Asistan"><Sparkles size={18}/></button>
          </div>

          <div className="flex items-center gap-3 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
            <Sun size={14} className="text-amber-500" />
            <input type="range" min="0" max="100" value={warmth} onChange={(e) => setWarmth(parseInt(e.target.value))} className="w-20 h-1 bg-slate-300 rounded-lg cursor-pointer accent-slate-600" />
          </div>

          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button onClick={() => setIsTwoPageMode(false)} className={clsx("p-1.5 rounded transition-all", !isTwoPageMode ? "bg-white shadow text-blue-600" : "text-slate-400")}><ScrollText size={18}/></button>
            <button onClick={() => setIsTwoPageMode(true)} className={clsx("p-1.5 rounded transition-all", isTwoPageMode ? "bg-white shadow text-blue-600" : "text-slate-400")}><BookOpen size={18}/></button>
          </div>

          <button onClick={handleSave} className="flex items-center gap-2 px-5 py-2 bg-slate-900 text-white rounded-lg font-bold text-sm hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200/50">
             {saveState === 'saving' ? <Loader2 size={16} className="animate-spin" /> : saveState === 'saved' ? <Check size={16} /> : <Save size={16} />} 
             {saveState === 'saving' ? '...' : saveState === 'saved' ? 'Kaydedildi' : 'Kaydet'}
          </button>
        </div>
      </header>

      {/* --- ANA İÇERİK --- */}
      <div className="flex-1 flex p-6 gap-6 overflow-hidden relative z-10">
        
        {/* SOL: ZEN EDİTÖR (KİTAP SAYFASI) */}
        <div className={clsx(
            "bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col transition-all duration-500 relative",
            isTwoPageMode ? "flex-[2] rounded-r-none border-r-0" : "flex-1 max-w-4xl mx-auto w-full mb-12"
        )}>
           <div className="flex-1 overflow-y-auto p-12 pb-32 custom-scrollbar">
              <div className="max-w-3xl mx-auto">
                 {/* AI ÖZETİ (Universal Drawer'dan beslenebilir) */}
                 <div className="mb-10 bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-2xl p-6 relative overflow-hidden shadow-sm cursor-pointer hover:border-indigo-300 transition-colors" onClick={() => openDrawer('ai')}>
                    <h3 className="text-xs font-black text-indigo-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <Sparkles size={14} /> Sentinel AI Analizi
                    </h3>
                    <p className="text-sm text-slate-700 font-medium leading-relaxed relative z-10">
                        Bu bulgu için AI tarafından oluşturulan özet henüz hazır değil. Analiz başlatmak için tıklayın.
                    </p>
                 </div>

                 {/* EDİTÖR BİLEŞENİ */}
                 <ZenEditor 
                    findingId={findingId || undefined} 
                    initialData={editorData} 
                    onChange={setEditorData} 
                 />
              </div>
           </div>
        </div>

        {/* ORTA: KİTAP CİLDİ (Sadece 2 Sayfa Modunda) */}
        {isTwoPageMode && (
           <div className="w-12 shrink-0 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 border-x border-slate-300/50 relative z-20 shadow-[inset_0_0_20px_rgba(0,0,0,0.05)] flex items-center justify-center">
               <div className="w-px h-[95%] bg-slate-300/30" />
           </div>
        )}

        {/* SAĞ: DETAYLAR & AKSİYONLAR */}
        <div className={clsx(
            "bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col transition-all duration-500",
            isTwoPageMode ? "flex-1 rounded-l-none border-l-0" : "hidden"
        )}>
           <div className="p-6 bg-slate-50 border-b border-slate-200">
              <h2 className="font-bold text-slate-800 text-lg">Aksiyon Planları</h2>
              <p className="text-xs text-slate-500 mt-1">Bu bulguya bağlı düzeltici faaliyetler</p>
           </div>
           
           <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30 space-y-4">
              {/* Buraya ActionStore'dan gelen gerçek aksiyonlar bağlanacak */}
              <div className="text-center py-10 text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-xl">
                 Henüz aksiyon planı eklenmemiş.
              </div>
              
              <button className="w-full py-3 bg-white border border-slate-300 text-slate-600 rounded-xl font-bold text-xs hover:border-blue-500 hover:text-blue-600 hover:shadow-md transition-all">
                 + Yeni Aksiyon Ekle
              </button>
           </div>
        </div>

      </div>

      {/* EVRENSEL ÇEKMECE */}
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