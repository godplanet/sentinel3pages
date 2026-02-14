import { useState, useEffect } from 'react';

import { useParams, useNavigate } from 'react-router-dom';

import {

  ArrowLeft, Save, Loader2, Check, AlertTriangle,

  BookOpen, ScrollText, Sun, Clock,

  MessageSquare, History, Sparkles, User, Calendar,

  MoreVertical, Share2, Printer

} from 'lucide-react';

import clsx from 'clsx';



// --- MİMARİ BAĞLANTILAR ---

import { useUIStore } from '@/shared/stores/ui-store';

import { useRiskConstitution } from '@/features/risk-constitution';

import { ZenEditor, type FindingEditorData } from '@/features/finding-studio/components/ZenEditor';

import { UniversalFindingDrawer, type DrawerTab } from '@/widgets/UniversalFindingDrawer';



// --- AYRIŞTIRILMIŞ VERİ KAYNAKLARI (Mock Data Dosyalarından) ---

// Not: Gerçek projede bu importlar src/entities altından gelir.

// Şimdilik vizyonu göstermek için mapleyeceğimiz veriyi burada simüle ediyoruz.

const MOCK_ACTIONS = [

  { id: 1, title: 'IAM Rol Tanımlarının Düzeltilmesi', owner: 'Hakan Y.', date: '15.03.2026', status: 'DEVAM EDİYOR', color: 'bg-orange-100 text-orange-700' },

  { id: 2, title: 'Acil Durum (Override) Prosedürü', owner: 'Merve K.', date: '01.02.2026', status: 'GECİKMİŞ', color: 'bg-red-100 text-red-700' },

  { id: 3, title: 'Eğitim Eksikliklerinin Giderilmesi', owner: 'İK Direktörlüğü', date: '20.04.2026', status: 'PLANLANDI', color: 'bg-blue-100 text-blue-700' }

];



export default function FindingStudioZenPage() {

  const { id } = useParams();

  const navigate = useNavigate();

  

  // UI STORE (Güvenli Erişim)

  const { isSidebarOpen, toggleSidebar } = useUIStore();

  const { constitution } = useRiskConstitution();



  // STATE YÖNETİMİ

  const [isTwoPageMode, setIsTwoPageMode] = useState(true); // Varsayılan: KİTAP MODU

  const [warmth, setWarmth] = useState(20); // Kağıt Sıcaklığı

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [activeDrawerTab, setActiveDrawerTab] = useState<DrawerTab>('ai');

  const [loading, setLoading] = useState(true);

  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');



  // Bulgu Verisi (ZenEditor'e gidecek)

  const [editorData, setEditorData] = useState<FindingEditorData>({

    criteria: '', condition: '', effect: '', recommendation: '', 

    root_cause_analysis: { method: 'five_whys', five_whys: [] }

  });



  // BAŞLANGIÇ EFEKTLERİ

  useEffect(() => {

    // 1. Sidebar'ı Otomatik Kapat (Odaklanma Modu)

    if (isSidebarOpen) {

        toggleSidebar(); 

    }



    // 2. Veri Yükleme (Simülasyon)

    // Gerçek entegrasyonda burası findingApi.getById(id) olacak

    setTimeout(() => {

        setLoading(false);

        // Demo Veri Doldurma

        setEditorData({

            criteria: '<p><strong>BDDK Bilgi Sistemleri Yönetmeliği - Madde 12/3:</strong> "Bankalar, hassas varlıklara erişimi ve kritik işlem adımlarını sınırlandırmak zorundadır."</p>',

            condition: '<p>Hazine Operasyonları departmanında yapılan incelemede, 3.2 Milyon USD tutarındaki 14 işlemin tek kullanıcı tarafından onaylandığı tespit edilmiştir.</p>',

            root_cause_analysis: { method: 'five_whys', five_whys: ['Personel yetkisi kısıtlanmamış', 'Rol matrisi güncel değil', 'Değişiklik yönetimi işletilmedi'] },

            effect: '<p>Kurum, potansiyel dolandırıcılık riskine açık hale gelmiştir.</p>',

            recommendation: '<p>Derhal Maker-Checker yapısına geçilmeli ve IAM rolleri gözden geçirilmelidir.</p>'

        });

    }, 800);



    // Sayfadan çıkarken Sidebar'ı eski haline getirmek isterseniz cleanup function kullanabiliriz.

    // return () => { if (!isSidebarOpen) toggleSidebar(); };

  }, []);



  const handleSave = () => {

    setSaveState('saving');

    setTimeout(() => setSaveState('saved'), 1000);

    setTimeout(() => setSaveState('idle'), 2500);

  };



  const openDrawer = (tab: DrawerTab) => {

    setActiveDrawerTab(tab);

    setIsDrawerOpen(true);

  };



  if (loading) return <div className="h-screen flex items-center justify-center bg-stone-50"><Loader2 className="animate-spin text-stone-400 w-8 h-8"/></div>;



  return (

    <div className={clsx("min-h-screen bg-stone-50 text-slate-800 flex flex-col overflow-hidden transition-colors duration-500", isTwoPageMode ? "h-screen" : "")}>

      

      {/* --- KAĞIT SICAKLIĞI (WARMTH OVERLAY) --- */}

      {/* Remarkable Tablet Hissi */}

      <div 

        className="absolute inset-0 pointer-events-none z-[45] mix-blend-multiply transition-opacity duration-300" 

        style={{ backgroundColor: '#fdf6e3', opacity: warmth * 0.01 }} 

      />



      {/* --- HEADER (ARAÇ ÇUBUĞU) --- */}

      <header className="h-16 px-6 border-b border-stone-200 bg-white/80 backdrop-blur-md flex items-center justify-between shrink-0 z-[50] shadow-sm relative">

        

        {/* Sol: Geri Dön ve Başlık */}

        <div className="flex items-center gap-4">

          <button onClick={() => navigate('/execution/findings')} className="p-2 hover:bg-stone-100 rounded-full text-slate-500 transition-colors">

            <ArrowLeft size={20} />

          </button>

          

          <div className="flex items-center gap-3">

             <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs font-bold border border-red-200">KRİTİK</span>

             <h1 className="text-lg font-bold text-slate-900 truncate max-w-[400px]">

               SWIFT İşlemlerinde Görev Ayrılığı (SoD) İhlali

             </h1>

          </div>

        </div>



        {/* Orta: Görünüm Kontrolleri */}

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-4 bg-stone-100/50 p-1.5 rounded-full border border-stone-200/50 backdrop-blur-sm">

            <div className="flex items-center gap-2 px-3 border-r border-stone-300/50">

                <Sun size={14} className="text-amber-500" />

                <input 

                  type="range" min="0" max="50" step="5"

                  value={warmth} onChange={(e) => setWarmth(parseInt(e.target.value))} 

                  className="w-20 h-1 bg-stone-300 rounded-lg cursor-pointer accent-stone-600" 

                  title="Ekran Sıcaklığı"

                />

            </div>

            <div className="flex items-center gap-1">

                <button onClick={() => setIsTwoPageMode(false)} className={clsx("p-1.5 rounded transition-all", !isTwoPageMode ? "bg-white shadow text-slate-900" : "text-slate-400 hover:text-slate-600")} title="Akış Modu"><ScrollText size={16}/></button>

                <button onClick={() => setIsTwoPageMode(true)} className={clsx("p-1.5 rounded transition-all", isTwoPageMode ? "bg-white shadow text-slate-900" : "text-slate-400 hover:text-slate-600")} title="Kitap Modu (iPad)"><BookOpen size={16}/></button>

            </div>

        </div>



        {/* Sağ: Aksiyonlar */}

        <div className="flex items-center gap-3">

          <div className="flex items-center gap-1 text-slate-400">

             <button onClick={() => openDrawer('chat')} className="p-2 hover:bg-stone-100 rounded-lg hover:text-blue-600 transition-colors"><MessageSquare size={18}/></button>

             <button onClick={() => openDrawer('ai')} className="p-2 hover:bg-stone-100 rounded-lg hover:text-indigo-600 transition-colors"><Sparkles size={18}/></button>

             <button className="p-2 hover:bg-stone-100 rounded-lg hover:text-slate-700 transition-colors"><Share2 size={18}/></button>

          </div>

          

          <div className="h-6 w-px bg-stone-300 mx-1" />



          <button onClick={handleSave} className="flex items-center gap-2 px-5 py-2 bg-slate-900 text-white rounded-lg font-bold text-sm hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200/50 active:scale-95">

             {saveState === 'saving' ? <Loader2 size={16} className="animate-spin" /> : saveState === 'saved' ? <Check size={16} /> : <Save size={16} />} 

             {saveState === 'saving' ? '...' : saveState === 'saved' ? 'Kaydedildi' : 'Kaydet'}

          </button>

        </div>

      </header>



      {/* --- ANA ÇALIŞMA ALANI (KİTAP GÖRÜNÜMÜ) --- */}

      <div className="flex-1 flex p-6 gap-0 overflow-hidden relative z-10 items-stretch justify-center max-w-[1920px] mx-auto w-full">

        

        {/* SOL SAYFA: BULGU METNİ (ZEN EDITOR) */}

        <div className={clsx(

            "bg-white border-y border-l border-stone-200 overflow-hidden flex flex-col transition-all duration-500 relative shadow-sm",

            isTwoPageMode ? "flex-1 rounded-l-2xl max-w-[800px]" : "w-full max-w-4xl mx-auto rounded-2xl border-r shadow-md mb-8"

        )}>

           <div className="flex-1 overflow-y-auto p-12 pb-32 custom-scrollbar">

              <div className="max-w-2xl mx-auto">

                 <div className="mb-8">

                    <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">Bölüm 1</span>

                    <h2 className="text-3xl font-serif font-medium text-slate-900 mt-1">Bulgu Detayları</h2>

                    <div className="h-1 w-12 bg-red-500 mt-4" />

                 </div>

                 

                 {/* Sizin Hazırladığınız ZenEditor Bileşeni */}

                 <ZenEditor 

                    initialData={editorData} 

                    onChange={setEditorData} 

                 />

              </div>

           </div>

        </div>



        {/* ORTA: KİTAP CİLDİ (SPINE) */}

        {isTwoPageMode && (

           <div className="w-16 shrink-0 bg-gradient-to-r from-stone-200 via-stone-100 to-stone-200 border-x border-stone-300/40 relative z-20 shadow-[inset_0_0_15px_rgba(0,0,0,0.05)] flex items-center justify-center">

               <div className="w-px h-[95%] bg-stone-300/50" />

           </div>

        )}



        {/* SAĞ SAYFA: AKSİYONLAR & METADATA */}

        <div className={clsx(

            "bg-white border-y border-r border-stone-200 overflow-hidden flex flex-col transition-all duration-500 relative shadow-sm",

            isTwoPageMode ? "flex-1 rounded-r-2xl max-w-[800px]" : "hidden"

        )}>

           <div className="flex-1 overflow-y-auto p-12 pb-32 custom-scrollbar bg-stone-50/30">

              <div className="max-w-2xl mx-auto">

                 <div className="mb-8 flex justify-between items-end">

                    <div>

                        <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">Bölüm 2</span>

                        <h2 className="text-3xl font-serif font-medium text-slate-900 mt-1">Aksiyon Planı</h2>

                    </div>

                    <button className="text-xs font-bold text-blue-600 hover:underline">+ Yeni Ekle</button>

                 </div>



                 <div className="space-y-6">

                    {/* Aksiyon Kartları */}

                    {MOCK_ACTIONS.map((action) => (

                        <div key={action.id} className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm hover:shadow-md transition-all cursor-pointer group relative overflow-hidden">

                            <div className={clsx("absolute left-0 top-0 bottom-0 w-1", action.color.split(' ')[0].replace('bg-', 'bg-') )} />

                            

                            <div className="flex justify-between items-start mb-3">

                                <span className={clsx("px-2 py-1 rounded text-[10px] font-bold tracking-wide", action.color)}>

                                    {action.status}

                                </span>

                                <MoreVertical size={16} className="text-stone-300 group-hover:text-slate-600" />

                            </div>

                            

                            <h3 className="font-bold text-slate-800 text-lg mb-2 group-hover:text-blue-700 transition-colors">

                                {action.title}

                            </h3>

                            

                            <div className="flex items-center gap-4 text-xs font-medium text-stone-500 pt-4 border-t border-stone-100 mt-4">

                                <div className="flex items-center gap-1.5">

                                    <User size={14} />

                                    {action.owner}

                                </div>

                                <div className="flex items-center gap-1.5">

                                    <Calendar size={14} />

                                    {action.date}

                                </div>

                            </div>

                        </div>

                    ))}



                    {/* AI Özet Kartı */}

                    <div className="mt-12 p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">

                        <div className="flex items-center gap-2 mb-3 text-indigo-700 font-bold text-xs uppercase tracking-wider">

                            <Sparkles size={14} /> Sentinel AI Özeti

                        </div>

                        <p className="text-sm text-slate-700 leading-relaxed font-medium">

                            Bulgu, operasyonel risk kategorisinde olup finansal etki 3.2M USD seviyesindedir. Kök neden analizi, yetki matrisi eksikliğine işaret etmektedir. Önerilen aksiyonlar risk iştahı sınırları içindedir.

                        </p>

                    </div>

                 </div>

              </div>

           </div>

        </div>



      </div>



      {/* --- EVRENSEL ÇEKMECE (Universal Drawer) --- */}

      {/* Sağ taraftan kayarak gelir, chat ve tarihçe buradadır */}

      <UniversalFindingDrawer 

        isOpen={isDrawerOpen} 

        onClose={() => setIsDrawerOpen(false)} 

        defaultTab={activeDrawerTab} 

        findingId={id} 

        currentViewMode="zen" 

      />



    </div>

  );

}