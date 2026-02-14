import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Save, Loader2, Check,
  BookOpen, ScrollText, Sun,
  MessageSquare, History, Sparkles, MoreVertical, Calendar, User, Layout, Tag
} from 'lucide-react';
import clsx from 'clsx';

// --- MİMARİ BAĞLANTILAR (Store & Hooks) ---
import { useUIStore } from '@/shared/stores/ui-store';
import { useParameterStore } from '@/shared/stores/parameter-store'; 

// --- GERÇEK VERİ MODELLERİ VE MOCK DATA (Entities Katmanı) ---
import { mockComprehensiveFindings } from '@/entities/finding/api/mock-comprehensive-data';
import type { ComprehensiveFinding, ActionPlan } from '@/entities/finding/model/types';

// --- BİLEŞENLER ---
import { ZenEditor, type FindingEditorData } from '@/features/finding-studio/components/ZenEditor';
import { UniversalFindingDrawer, type DrawerTab } from '@/widgets/UniversalFindingDrawer';

export default function FindingStudioZenPage() {
  const { id } = useParams(); // URL'den ID'yi al (örn: find-001)
  const navigate = useNavigate();
  
  // STORE ÇAĞRILARI
  const { isSidebarOpen, toggleSidebar } = useUIStore();
  const { getSeverityColor, initParameters } = useParameterStore();

  // UI STATE
  const [isBookMode, setIsBookMode] = useState(true);
  const [warmth, setWarmth] = useState(20);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeDrawerTab, setActiveDrawerTab] = useState<DrawerTab>('ai');
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');

  // VERİ STATE (Component içinde hardcoded veri YOK)
  const [currentFinding, setCurrentFinding] = useState<ComprehensiveFinding | null>(null);
  const [editorData, setEditorData] = useState<FindingEditorData | null>(null);

  // BAŞLANGIÇ AYARLARI VE VERİ ÇEKME
  useEffect(() => {
    initParameters(); 
    
    // Odaklanma Modu: Sidebar açıksa kapat
    if (isSidebarOpen) {
        toggleSidebar(); 
    }

    // VERİTABANI SİMÜLASYONU
    // URL'deki ID'ye göre mock dosyasından veriyi buluyoruz.
    // Eğer ID yoksa veya bulunamazsa demo amaçlı ilk kaydı (Kasa İşlemleri) getiriyoruz.
    const finding = mockComprehensiveFindings.find(f => f.id === id) || mockComprehensiveFindings[0];

    if (finding) {
        setCurrentFinding(finding);

        // Veri Modeli Dönüşümü: (ComprehensiveFinding -> EditorData)
        // Veritabanındaki 'secrets' ve 'description' alanlarını editöre mapliyoruz.
        setEditorData({
            criteria: '<p><strong>BDDK Yönetmeliği ve İç Prosedürler:</strong> Çift anahtar kuralı esastır.</p>', // Mock datada criteria alanı olmadığı için generic
            condition: finding.description || '',
            effect: `<p><strong>Finansal Etki:</strong> ${finding.financial_impact?.toLocaleString()} TL<br/><strong>Kategori:</strong> ${finding.gias_category}</p>`,
            recommendation: '<p>Süreç kontrolleri artırılmalı ve personel eğitimi yenilenmelidir.</p>',
            root_cause_analysis: {
                method: 'five_whys',
                five_whys: [
                    finding.secrets?.why_1 || '',
                    finding.secrets?.why_2 || '',
                    finding.secrets?.why_3 || '',
                    finding.secrets?.why_4 || '',
                    finding.secrets?.why_5 || ''
                ]
            }
        });
    }

    setTimeout(() => setLoading(false), 600);
  }, [id]);

  const handleSave = () => {
    setSaveState('saving');
    // Burada API update çağrısı yapılacak
    setTimeout(() => setSaveState('saved'), 1000);
    setTimeout(() => setSaveState('idle'), 2500);
  };

  const openDrawer = (tab: DrawerTab) => {
    setActiveDrawerTab(tab);
    setIsDrawerOpen(true);
  };

  // Yükleniyor veya Veri Yoksa
  if (loading || !currentFinding || !editorData) {
      return <div className="h-screen flex items-center justify-center bg-stone-50"><Loader2 className="animate-spin text-stone-400 w-8 h-8"/></div>;
  }

  return (
    <div className={clsx("min-h-screen bg-stone-50 text-slate-800 flex flex-col overflow-hidden transition-colors duration-500", isBookMode ? "h-screen" : "")}>
      
      {/* SARI FİLTRE (Remarkable Tablet Hissi) */}
      <div className="absolute inset-0 pointer-events-none z-[45] mix-blend-multiply transition-opacity duration-300" style={{ backgroundColor: '#fdf6e3', opacity: warmth * 0.01 }} />

      {/* --- HEADER --- */}
      <header className="h-16 px-6 border-b border-stone-200 bg-white/80 backdrop-blur-md flex items-center justify-between shrink-0 z-[50] shadow-sm relative">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/execution/findings')} className="p-2 hover:bg-stone-100 rounded-full text-slate-500 transition-colors"><ArrowLeft size={20} /></button>
          
          <div className="flex items-center gap-3">
             <span className={clsx("px-2 py-0.5 rounded text-xs font-bold border border-white/20 shadow-sm", getSeverityColor(currentFinding.severity))}>
                {currentFinding.severity}
             </span>
             <div>
                <div className="text-xs text-slate-400 font-mono font-bold">{currentFinding.code}</div>
                <div className="text-lg font-bold text-slate-900 truncate max-w-[500px] leading-tight">{currentFinding.title}</div>
             </div>
          </div>
        </div>

        {/* ORTA KONTROLLER (Sıcaklık & Mod) */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-4 bg-stone-100/50 p-1.5 rounded-full border border-stone-200/50 backdrop-blur-sm">
            <div className="flex items-center gap-2 px-3 border-r border-stone-300/50">
                <Sun size={14} className="text-amber-500" />
                <input type="range" min="0" max="50" step="5" value={warmth} onChange={(e) => setWarmth(parseInt(e.target.value))} className="w-20 h-1 bg-stone-300 rounded-lg cursor-pointer accent-stone-600" />
            </div>
            <div className="flex items-center gap-1">
                <button onClick={() => setIsBookMode(false)} className={clsx("p-1.5 rounded transition-all", !isBookMode ? "bg-white shadow text-slate-900" : "text-slate-400 hover:text-slate-600")}><ScrollText size={16}/></button>
                <button onClick={() => setIsBookMode(true)} className={clsx("p-1.5 rounded transition-all", isBookMode ? "bg-white shadow text-slate-900" : "text-slate-400 hover:text-slate-600")}><BookOpen size={16}/></button>
            </div>
        </div>

        {/* SAĞ AKSİYONLAR */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-slate-400">
             <button onClick={() => openDrawer('chat')} className="p-2 hover:bg-stone-100 rounded-lg hover:text-blue-600 transition-colors"><MessageSquare size={18}/></button>
             <button onClick={() => openDrawer('ai')} className="p-2 hover:bg-stone-100 rounded-lg hover:text-indigo-600 transition-colors"><Sparkles size={18}/></button>
          </div>
          <div className="h-6 w-px bg-stone-300 mx-1" />
          <button onClick={handleSave} className="flex items-center gap-2 px-5 py-2 bg-slate-900 text-white rounded-lg font-bold text-sm hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200/50 active:scale-95">
             {saveState === 'saving' ? <Loader2 size={16} className="animate-spin" /> : saveState === 'saved' ? <Check size={16} /> : <Save size={16} />} 
             {saveState === 'saving' ? '...' : saveState === 'saved' ? 'Kaydedildi' : 'Kaydet'}
          </button>
        </div>
      </header>

      {/* --- ANA ÇALIŞMA ALANI --- */}
      <div className="flex-1 flex p-6 gap-0 overflow-hidden relative z-10 items-stretch justify-center max-w-[1920px] mx-auto w-full">
        
        {/* SOL: ZEN EDITOR (BULGU DETAYLARI) */}
        <div className={clsx(
            "bg-white border-y border-l border-stone-200 overflow-hidden flex flex-col transition-all duration-500 relative shadow-sm",
            isBookMode ? "flex-1 rounded-l-2xl max-w-[800px]" : "w-full max-w-4xl mx-auto rounded-2xl border-r shadow-md mb-8"
        )}>
           <div className="flex-1 overflow-y-auto p-12 pb-32 custom-scrollbar">
              <div className="max-w-2xl mx-auto">
                 {/* Kategori Etiketi */}
                 <div className="mb-6 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                    <Tag size={12} /> {currentFinding.gias_category}
                 </div>

                 {/* EDİTÖR: Veritabanından gelen veriyi kullanır */}
                 <ZenEditor initialData={editorData} onChange={setEditorData} />
                 
                 {/* Müfettiş Özel Notları (Iron Curtain) */}
                 {currentFinding.secrets?.internal_notes && (
                    <div className="mt-12 p-6 bg-slate-50 border border-slate-200 rounded-xl">
                        <div className="flex items-center gap-2 mb-2 text-slate-700 font-bold text-sm">
                            <Layout size={16} /> Denetçi Özel Notları (Gizli)
                        </div>
                        <p className="text-sm text-slate-600 italic">{currentFinding.secrets.internal_notes}</p>
                    </div>
                 )}
              </div>
           </div>
        </div>

        {/* CİLT (Sadece Kitap Modunda) */}
        {isBookMode && (
           <div className="w-16 shrink-0 bg-gradient-to-r from-stone-200 via-stone-100 to-stone-200 border-x border-stone-300/40 relative z-20 shadow-inner flex items-center justify-center">
               <div className="w-px h-[95%] bg-stone-300/50" />
           </div>
        )}

        {/* SAĞ: AKSİYON PLANLARI (Veritabanından) */}
        <div className={clsx(
            "bg-white border-y border-r border-stone-200 overflow-hidden flex flex-col transition-all duration-500 relative shadow-sm",
            isBookMode ? "flex-1 rounded-r-2xl max-w-[800px]" : "hidden"
        )}>
           <div className="flex-1 overflow-y-auto p-12 pb-32 custom-scrollbar bg-stone-50/30">
              <div className="max-w-2xl mx-auto">
                 <div className="mb-8 flex justify-between items-end">
                    <h2 className="text-3xl font-serif font-medium text-slate-900 mt-1">Aksiyon Planı</h2>
                    <span className="text-xs font-bold bg-stone-200 px-2 py-1 rounded text-stone-600">{currentFinding.action_plans?.length || 0} Adet</span>
                 </div>

                 <div className="space-y-6">
                    {/* Mock Data'dan Gelen Aksiyonlar */}
                    {currentFinding.action_plans && currentFinding.action_plans.length > 0 ? (
                        currentFinding.action_plans.map((action) => (
                            <div key={action.id} className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm hover:shadow-md transition-all cursor-pointer group relative overflow-hidden">
                                <div className={clsx("absolute left-0 top-0 bottom-0 w-1", action.priority === 'CRITICAL' ? 'bg-red-500' : 'bg-blue-500')} />
                                
                                <div className="flex justify-between items-start mb-3">
                                    <span className={clsx("px-2 py-1 rounded text-[10px] font-bold tracking-wide bg-stone-100 text-stone-600")}>
                                        {action.status}
                                    </span>
                                    <MoreVertical size={16} className="text-stone-300 group-hover:text-slate-600" />
                                </div>
                                
                                <h3 className="font-bold text-slate-800 text-lg mb-2 group-hover:text-blue-700 transition-colors">
                                    {action.title}
                                </h3>
                                <p className="text-sm text-stone-500 mb-4 line-clamp-2">{action.description}</p>
                                
                                <div className="flex items-center gap-4 text-xs font-medium text-stone-500 pt-4 border-t border-stone-100">
                                    <div className="flex items-center gap-1.5">
                                        <User size={14} />
                                        {action.responsible_person}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Calendar size={14} />
                                        {action.target_date}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12 border-2 border-dashed border-stone-200 rounded-xl text-stone-400">
                            Henüz aksiyon planı eklenmemiş.
                        </div>
                    )}

                    <button className="w-full py-3 border-2 border-dashed border-stone-300 rounded-xl text-stone-400 font-bold hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-2">
                        + Yeni Aksiyon Ekle
                    </button>
                 </div>
              </div>
           </div>
        </div>

      </div>

      <UniversalFindingDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} defaultTab={activeDrawerTab} findingId={currentFinding.id} currentViewMode="zen" />
    </div>
  );
}