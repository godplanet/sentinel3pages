import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Save, Loader2, Check, AlertTriangle, 
  BookOpen, ScrollText, Sun, Moon, CheckCircle2, 
  Clock, User, MessageSquare, History, Sparkles, X, ChevronRight
} from 'lucide-react';
import clsx from 'clsx';

import { useUIStore } from '@/shared/stores/ui-store';
import { ZenEditor, type FindingEditorData } from '@/features/finding-studio/components/ZenEditor';
import { zenFindingApi } from '@/features/finding-studio/api/zen-finding-api';

type SaveState = 'idle' | 'saving' | 'saved' | 'error';
type DrawerTab = 'chat' | 'history' | null;

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

  // --- UI YÖNETİMİ ---
  const { setSidebarOpen } = useUIStore();
  const [isTwoPageMode, setIsTwoPageMode] = useState(true); // Varsayılan Kitap Modu
  const [warmth, setWarmth] = useState(15);
  const [activeDrawer, setActiveDrawer] = useState<DrawerTab>(null);

  // --- VERİ STATE'LERİ ---
  const [loading, setLoading] = useState(true);
  const [findingId, setFindingId] = useState(isNew ? null : id);
  const [title, setTitle] = useState('Kasa İşlemlerinde Çift Anahtar Kuralı İhlali');
  const [severity, setSeverity] = useState<'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'OBSERVATION'>('HIGH');
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [editorData, setEditorData] = useState<FindingEditorData>({
    criteria: '',
    condition: '',
    root_cause_analysis: { method: 'five_whys', five_whys: ['', '', '', '', ''] },
    effect: '',
    recommendation: '',
  });

  // MOCK VERİ: AI ÖZETİ
  const aiSummary = "Vezne işlemlerinde çift anahtar (dual-control) prosedürü sistematik olarak ihlal edilmiştir. Bu durum, kurum içi suistimal riskini artırmakta ve BDDK yönergelerine aykırılık teşkil etmektedir. Şifrelerin yenilenmesi ve acil eğitim verilmesi gerekmektedir.";

  useEffect(() => {
    // Sayfaya girince menüyü otomatik daralt
    setSidebarOpen(false);
    return () => setSidebarOpen(true);
  }, [setSidebarOpen]);

  useEffect(() => {
    // Mock Veri Yükleme Simülasyonu
    setTimeout(() => {
      setLoading(false);
    }, 800);
  }, [id]);

  const handleSave = async () => {
    setSaveState('saving');
    setTimeout(() => {
      setSaveState('saved');
      setTimeout(() => setSaveState('idle'), 2000);
    }, 1500);
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#fdfcf8]">
        <Loader2 className="w-10 h-10 text-slate-400 animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Zen Modu Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className={clsx(
      "min-h-screen bg-[#fdfcf8] text-slate-800 transition-all duration-500 relative flex flex-col overflow-hidden", 
      isTwoPageMode ? "h-screen" : ""
    )}>
      
      {/* WARMTH (KAĞIT SICAKLIĞI) OVERLAY */}
      <div 
          className="absolute inset-0 pointer-events-none z-[45] transition-opacity duration-300"
          style={{ 
              backgroundColor: '#fcd34d', 
              opacity: warmth * 0.003,
              mixBlendMode: 'color-burn'
          }} 
      />

      {/* TOP HEADER */}
      <header className="h-16 px-6 border-b border-slate-200/60 bg-white/60 backdrop-blur-md flex items-center justify-between shrink-0 relative z-50">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/execution/findings')} className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-3">
             <div className="flex gap-1">
                {SEVERITY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setSeverity(opt.value as any)}
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
          {/* Çekmece (Drawer) Açma Butonları */}
          <div className="flex items-center gap-2 border-r border-slate-200 pr-4">
            <button 
              onClick={() => setActiveDrawer(activeDrawer === 'chat' ? null : 'chat')}
              className={clsx("p-2 rounded-lg transition-colors flex items-center gap-2", activeDrawer === 'chat' ? "bg-blue-100 text-blue-700" : "text-slate-500 hover:bg-slate-100")}
            >
              <MessageSquare size={18} /> <span className="text-xs font-bold">Yazışma</span>
            </button>
            <button 
              onClick={() => setActiveDrawer(activeDrawer === 'history' ? null : 'history')}
              className={clsx("p-2 rounded-lg transition-colors flex items-center gap-2", activeDrawer === 'history' ? "bg-purple-100 text-purple-700" : "text-slate-500 hover:bg-slate-100")}
            >
              <History size={18} /> <span className="text-xs font-bold">Tarihçe</span>
            </button>
          </div>

          {/* Warmth Ayarı */}
          <div className="flex items-center gap-3 bg-white/80 px-4 py-1.5 rounded-full border border-slate-200 shadow-sm">
            <Sun size={14} className={warmth < 50 ? 'text-slate-700' : 'text-slate-400'} />
            <input 
                type="range" min="0" max="100" value={warmth} 
                onChange={(e) => setWarmth(parseInt(e.target.value))}
                className="w-24 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-600"
            />
          </div>

          {/* Kitap / Dikey Geçişi */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button 
              onClick={() => setIsTwoPageMode(false)}
              className={clsx("p-1.5 rounded-md transition-all flex items-center gap-2", !isTwoPageMode ? "bg-white shadow-sm text-blue-600" : "text-slate-500 hover:text-slate-700")}
            >
              <ScrollText size={16} /> <span className="text-xs font-bold pr-1">Dikey</span>
            </button>
            <button 
              onClick={() => setIsTwoPageMode(true)}
              className={clsx("p-1.5 rounded-md transition-all flex items-center gap-2", isTwoPageMode ? "bg-white shadow-sm text-blue-600" : "text-slate-500 hover:text-slate-700")}
            >
              <BookOpen size={16} /> <span className="text-xs font-bold pr-1">Kitap</span>
            </button>
          </div>

          <button onClick={handleSave} disabled={saveState === 'saving'} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-lg shadow-sm">
            {saveState === 'saving' ? <Loader2 size={16} className="animate-spin" /> : saveState === 'saved' ? <Check size={16} /> : <Save size={16} />}
            Kaydet
          </button>
        </div>
      </header>

      {/* ================================================================================= */}
      {/* ANA İÇERİK: KİTAP MODU VEYA DİKEY MOD                                               */}
      {/* ================================================================================= */}
      
      <div className={clsx("flex-1 flex relative z-10 transition-all duration-300", isTwoPageMode ? "overflow-hidden bg-[#f4f1ea] p-6 pb-12" : "overflow-y-auto p-8")}>
        
        {/* SOL SAYFA: BULGU VE YÖNETİCİ ÖZETİ */}
        <div className={clsx(
          "flex flex-col bg-[#fdfcf8] transition-all duration-300 relative", 
          isTwoPageMode ? "flex-1 rounded-l-xl shadow-2xl border-y border-l border-slate-200/80 overflow-hidden" : "max-w-4xl mx-auto w-full rounded-2xl shadow-sm border border-slate-200 p-10 mb-12"
        )}>
          <div className={clsx("flex-1 custom-scrollbar", isTwoPageMode ? "overflow-y-auto p-12 pb-32" : "")}>
            <div className={clsx("max-w-3xl", isTwoPageMode ? "ml-auto" : "mx-auto")}>
              
              {/* AI YÖNETİCİ ÖZETİ KARTI */}
              <div className="mb-10 bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-2xl p-6 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                   <Sparkles className="w-24 h-24 text-indigo-500" />
                </div>
                <h3 className="text-sm font-black text-indigo-900 flex items-center gap-2 mb-3 uppercase tracking-wider">
                  <Sparkles size={16} className="text-indigo-600" /> Yönetici Özeti (AI)
                </h3>
                <p className="text-slate-700 leading-relaxed font-medium relative z-10">
                  {aiSummary}
                </p>
              </div>

              {/* EDİTÖR (5C DETAYLARI) */}
              <ZenEditor findingId={findingId || undefined} initialData={editorData} onChange={setEditorData} />
            </div>
          </div>
        </div>

        {/* KİTAP CİLDİ (Sadece Kitap Modunda Görünür) */}
        {isTwoPageMode && (
          <div className="w-12 shrink-0 bg-gradient-to-r from-[#e8e4db] via-[#dcd8ce] to-[#e8e4db] border-x border-slate-300/40 shadow-[inset_0_0_20px_rgba(0,0,0,0.08)] relative z-20 flex justify-center">
             <div className="w-px h-full bg-black/5" />
          </div>
        )}

        {/* SAĞ SAYFA: SADECE AKSİYON PLANLARI */}
        <div className={clsx(
          "flex flex-col bg-[#fdfcf8] transition-all duration-300 relative", 
          isTwoPageMode ? "flex-1 rounded-r-xl shadow-2xl border-y border-r border-slate-200/80 overflow-hidden" : "max-w-4xl mx-auto w-full rounded-2xl shadow-sm border border-slate-200 p-10"
        )}>
          <div className={clsx("flex-1 custom-scrollbar", isTwoPageMode ? "overflow-y-auto p-12 pb-32" : "")}>
            <div className={clsx("max-w-3xl", isTwoPageMode ? "mr-auto" : "mx-auto")}>
              
              <div className="text-center mb-10">
                <h2 className="text-2xl font-black text-slate-800 font-serif tracking-tight">Aksiyon Planları</h2>
                <div className="h-0.5 w-16 bg-slate-300 mx-auto mt-4 rounded-full" />
              </div>

              {/* AKSİYON KARTLARI */}
              <div className="space-y-6">
                 <div className="bg-white p-6 rounded-xl border border-slate-200/60 shadow-sm relative overflow-hidden group hover:border-orange-300 transition-colors">
                    <div className="absolute top-0 left-0 w-1 h-full bg-orange-400" />
                    <div className="flex justify-between items-start mb-4">
                       <h3 className="font-bold text-slate-800">Şube Kasa Prosedürünün Güncellenmesi</h3>
                       <span className="text-[10px] font-bold bg-orange-100 text-orange-700 px-2 py-1 rounded">İNCELEMEDE</span>
                    </div>
                    <p className="text-sm text-slate-600 mb-4">Vezne personeline çift anahtar kuralı hakkında eğitim verilecek ve mevcut şifreler yenilenecektir.</p>
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                       <div className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                          <User size={14} className="text-blue-500"/> Ahmet Yılmaz (Şube Müdürü)
                       </div>
                       <div className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                          <Clock size={14} className="text-orange-500"/> Termin: 15 Mart 2026
                       </div>
                    </div>
                 </div>
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* ================================================================================= */}
      {/* SAĞ ÇEKMECE (DRAWER) - YAZIŞMALAR VE TARİHÇE İÇİN                                  */}
      {/* ================================================================================= */}
      
      {/* Çekmece Arka Plan Karartması */}
      {activeDrawer && (
        <div 
          className="absolute inset-0 bg-slate-900/20 backdrop-blur-[2px] z-[65] transition-opacity"
          onClick={() => setActiveDrawer(null)}
        />
      )}

      {/* Çekmece Paneli */}
      <div className={clsx(
        "absolute top-16 right-0 bottom-0 w-[450px] bg-white shadow-[-10px_0_30px_rgba(0,0,0,0.1)] z-[70] transition-transform duration-300 ease-in-out border-l border-slate-200 flex flex-col",
        activeDrawer ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="h-16 px-6 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <h2 className="font-bold text-slate-800 flex items-center gap-2">
            {activeDrawer === 'chat' ? <><MessageSquare className="text-blue-600" size={18} /> Müzakere & Yazışmalar</> : <><History className="text-purple-600" size={18} /> Sistem Tarihçesi</>}
          </h2>
          <button onClick={() => setActiveDrawer(null)} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          {activeDrawer === 'chat' && (
            <div className="text-center py-20 text-slate-400">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="font-medium">Müzakere geçmişi burada görünecek.</p>
            </div>
          )}
          
          {activeDrawer === 'history' && (
            <div className="text-center py-20 text-slate-400">
              <History className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="font-medium">Audit Trail (Tarihçe) logları burada akacak.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}