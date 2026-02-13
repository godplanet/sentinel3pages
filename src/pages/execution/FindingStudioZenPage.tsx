import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Save, Loader2, Check, AlertTriangle, FileText,
  Eye, EyeOff, BookOpen, ScrollText, Sun, Moon,
  MessageSquare, History, User
} from 'lucide-react';
import clsx from 'clsx';
import { ZenEditor, type FindingEditorData } from '@/features/finding-studio/components/ZenEditor';
import { zenFindingApi } from '@/features/finding-studio/api/zen-finding-api';
import { useUIStore } from '@/shared/stores/ui-store';

type SaveState = 'idle' | 'saving' | 'saved' | 'error';
type RightPanelTab = 'actions' | 'comments' | 'history';

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

  // --- UI STATE: ZEN & KITAP MODU ---
  const { setSidebarOpen } = useUIStore();
  const [isTwoPageMode, setIsTwoPageMode] = useState(false); // Kitap (İki Sayfa) vs Dikey
  const [warmth, setWarmth] = useState(20); // Kağıt Sıcaklığı (0-100)
  const [rightTab, setRightTab] = useState<RightPanelTab>('actions');

  // --- ORİJİNAL VERİ STATE'LERİ ---
  const [loading, setLoading] = useState(false);
  const [findingId, setFindingId] = useState(isNew ? null : id);
  const [title, setTitle] = useState('Yeni Bulgu');
  const [severity, setSeverity] = useState<'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'OBSERVATION'>('MEDIUM');
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [editorData, setEditorData] = useState<FindingEditorData>({
    criteria: '',
    condition: '',
    root_cause_analysis: {
      method: 'five_whys',
      five_whys: ['', '', '', '', ''],
    },
    effect: '',
    recommendation: '',
  });

  // --- YENİ EKLENEN: OTOMATİK SIDEBAR DARALTMA ---
  useEffect(() => {
    setSidebarOpen(false);
    return () => setSidebarOpen(true); // Çıkarken eski haline döndür
  }, [setSidebarOpen]);

  // --- ORİJİNAL VERİ YÜKLEME ---
  useEffect(() => {
    if (!isNew && id) {
      loadFinding();
    }
  }, [id, isNew]);

  const loadFinding = async () => {
    setLoading(true);
    try {
      const data = await zenFindingApi.getFindingMetadata(id!);
      if (data) {
        setTitle(data.title);
        setSeverity(data.severity as any);
        // Not: Gerçek API'den detayları getiren servis eklendiğinde bura güncellenmeli.
        // Şimdilik sadece skeleton render ediyoruz.
      }
    } catch (error) {
      console.error('Failed to load finding:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaveState('saving');
    try {
      const result = await zenFindingApi.saveFinding({
        id: findingId || undefined,
        title,
        severity,
        editor_data: editorData,
      });

      if (result.success) {
        setSaveState('saved');
        setFindingId(result.id);
        if (isNew) {
          window.history.replaceState(null, '', `/execution/findings/zen/${result.id}`);
        }
        setTimeout(() => setSaveState('idle'), 2000);
      } else {
        setSaveState('error');
      }
    } catch (error) {
      console.error('Save failed:', error);
      setSaveState('error');
    }
  };

  if (loading) {
    return (
      <div className=\"flex items-center justify-center h-screen bg-[#fdfcf8]\">
        <Loader2 className=\"w-8 h-8 text-slate-400 animate-spin\" />
      </div>
    );
  }

  // --- SAĞ PANEL (AKSİYONLAR / YORUMLAR) MOCK İÇERİĞİ ---
  const RightPanelContent = () => (
    <div className=\"h-full flex flex-col animate-in fade-in duration-500\">
      <div className=\"flex items-center gap-4 border-b border-slate-200/60 pb-4 mb-6\">
        <button onClick={() => setRightTab('actions')} className={clsx(\"text-sm font-bold pb-1 border-b-2 transition-colors\", rightTab === 'actions' ? \"border-slate-800 text-slate-900\" : \"border-transparent text-slate-500 hover:text-slate-800\")}>
          Aksiyon Planları
        </button>
        <button onClick={() => setRightTab('comments')} className={clsx(\"text-sm font-bold pb-1 border-b-2 transition-colors\", rightTab === 'comments' ? \"border-slate-800 text-slate-900\" : \"border-transparent text-slate-500 hover:text-slate-800\")}>
          Tartışma & Yorumlar
        </button>
        <button onClick={() => setRightTab('history')} className={clsx(\"text-sm font-bold pb-1 border-b-2 transition-colors\", rightTab === 'history' ? \"border-slate-800 text-slate-900\" : \"border-transparent text-slate-500 hover:text-slate-800\")}>
          Tarihçe (Audit Trail)
        </button>
      </div>

      <div className=\"flex-1 overflow-y-auto custom-scrollbar pr-2\">
        {rightTab === 'actions' && (
          <div className=\"space-y-6\">
             <div className=\"bg-white p-6 rounded-xl border border-slate-200/60 shadow-sm relative overflow-hidden\">
                <div className=\"absolute top-0 left-0 w-1 h-full bg-orange-400\" />
                <div className=\"flex justify-between items-start mb-4\">
                   <h3 className=\"font-bold text-slate-800\">Şube Kasa Prosedürünün Güncellenmesi</h3>
                   <span className=\"text-[10px] font-bold bg-orange-100 text-orange-700 px-2 py-1 rounded\">İNCELEMEDE</span>
                </div>
                <p className=\"text-sm text-slate-600 mb-4\">Vezne personeline çift anahtar kuralı hakkında eğitim verilecek ve mevcut şifreler yenilenecektir.</p>
                <div className=\"flex items-center justify-between text-xs text-slate-500\">
                   <span className=\"flex items-center gap-1\"><User size={14}/> Ahmet Yılmaz</span>
                   <span>Termin: 15 Mart 2026</span>
                </div>
             </div>
             {/* Burası gerçek aksiyon verisiyle dolacak */}
          </div>
        )}
        {rightTab === 'comments' && (
          <div className=\"text-center py-20 text-slate-400\"><MessageSquare className=\"w-10 h-10 mx-auto mb-3 opacity-50\"/>Henüz yorum yapılmamış.</div>
        )}
        {rightTab === 'history' && (
          <div className=\"text-center py-20 text-slate-400\"><History className=\"w-10 h-10 mx-auto mb-3 opacity-50\"/>Tarihçe kayıtları temiz.</div>
        )}
      </div>
    </div>
  );

  return (
    <div className={clsx(
      \"min-h-screen bg-[#fdfcf8] text-slate-800 transition-all duration-500 relative\", 
      isTwoPageMode ? \"h-screen overflow-hidden flex flex-col\" : \"flex flex-col\"
    )}>
      
      {/* WARMTH (KAĞIT SICAKLIĞI) OVERLAY */}
      <div 
          className=\"absolute inset-0 pointer-events-none z-[60] transition-opacity duration-300\"
          style={{ 
              backgroundColor: '#fcd34d', 
              opacity: warmth * 0.003, // 0 ile 0.3 arası saydamlık
              mixBlendMode: 'color-burn'
          }} 
      />

      {/* TOP HEADER (GÖRÜNÜM KONTROLLERİ VE ORİJİNAL KAYDETME) */}
      <header className=\"h-16 px-6 border-b border-slate-200/60 bg-white/60 backdrop-blur-md flex items-center justify-between shrink-0 relative z-50\">
        
        {/* Sol Grup: Geri Dönüş ve Başlık */}
        <div className=\"flex items-center gap-4\">
          <button onClick={() => navigate('/execution/findings')} className=\"p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors\">
            <ArrowLeft size={20} />
          </button>
          <div className=\"flex items-center gap-3\">
             <div className=\"flex gap-1\">
                {SEVERITY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setSeverity(opt.value as any)}
                    className={clsx(\"w-4 h-4 rounded-full transition-all\", severity === opt.value ? clsx(opt.color, \"ring-2 ring-offset-2 ring-slate-300\") : \"bg-slate-200 hover:bg-slate-300\")}
                    title={opt.label}
                  />
                ))}
             </div>
             <input
                type=\"text\"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className=\"text-lg font-bold text-slate-900 bg-transparent border-none focus:outline-none focus:ring-0 placeholder:text-slate-300 w-96\"
                placeholder=\"Bulgu Başlığı\"
             />
          </div>
        </div>

        {/* Sağ Grup: Araçlar ve Kaydet */}
        <div className=\"flex items-center gap-6\">
          
          {/* Orijinal Okuma Modu İkonları */}
          <div className=\"flex items-center gap-2 border-r border-slate-200 pr-4\">
            <button className=\"p-2 text-slate-400 hover:text-slate-700 transition-colors\" title=\"Read-only görünüm\"><Eye size={18} /></button>
            <button className=\"p-2 text-blue-600 bg-blue-50 rounded-lg\" title=\"Düzenleme Modu\"><FileText size={18} /></button>
          </div>

          {/* SİZİN İSTEĞİNİZ: Sıcaklık (Warmth) Ayarı */}
          <div className=\"flex items-center gap-3 bg-white/80 px-4 py-1.5 rounded-full border border-slate-200 shadow-sm\">
            <Sun size={14} className={warmth < 50 ? 'text-slate-700' : 'text-slate-400'} />
            <input 
                type=\"range\" min=\"0\" max=\"100\" value={warmth} 
                onChange={(e) => setWarmth(parseInt(e.target.value))}
                className=\"w-24 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-600\"
            />
            <Moon size={14} className={warmth >= 50 ? 'text-slate-700' : 'text-slate-400'} />
          </div>

          {/* SİZİN İSTEĞİNİZ: Görünüm Değiştirici (Dikey / Kitap) */}
          <div className=\"flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200\">
            <button 
              onClick={() => setIsTwoPageMode(false)}
              className={clsx(\"p-1.5 rounded-md transition-all flex items-center gap-2\", !isTwoPageMode ? \"bg-white shadow-sm text-blue-600\" : \"text-slate-500 hover:text-slate-700\")}
              title=\"Dikey Kaydırma (Klasik)\"
            >
              <ScrollText size={16} /> <span className=\"text-xs font-bold pr-1\">Dikey</span>
            </button>
            <button 
              onClick={() => setIsTwoPageMode(true)}
              className={clsx(\"p-1.5 rounded-md transition-all flex items-center gap-2\", isTwoPageMode ? \"bg-white shadow-sm text-blue-600\" : \"text-slate-500 hover:text-slate-700\")}
              title=\"İki Sayfa (Kitap Görünümü)\"
            >
              <BookOpen size={16} /> <span className=\"text-xs font-bold pr-1\">Kitap</span>
            </button>
          </div>

          <div className=\"w-px h-6 bg-slate-200\" />

          {/* Orijinal Kaydet Butonu */}
          <button
            onClick={handleSave}
            disabled={saveState === 'saving'}
            className={clsx(
              \"flex items-center gap-2 px-6 py-2 rounded-lg font-bold text-sm transition-all shadow-sm\",
              saveState === 'saved' ? \"bg-emerald-500 text-white\" : 
              saveState === 'error' ? \"bg-red-500 text-white\" : 
              \"bg-slate-900 text-white hover:bg-slate-800\"
            )}
          >
            {saveState === 'saving' ? <Loader2 className=\"w-4 h-4 animate-spin\" /> :
             saveState === 'saved' ? <Check className=\"w-4 h-4\" /> :
             saveState === 'error' ? <AlertTriangle className=\"w-4 h-4\" /> :
             <Save className=\"w-4 h-4\" />}
            {saveState === 'saving' ? 'Kaydediliyor' :
             saveState === 'saved' ? 'Kaydedildi' :
             saveState === 'error' ? 'Hata!' :
             'Taslağı Kaydet'}
          </button>
        </div>
      </header>

      {/* ================================================================================= */}
      {/* İÇERİK ALANI: KİTAP MODU (İki Sayfa) vs DİKEY MOD (Tek Sayfa)                       */}
      {/* ================================================================================= */}
      {isTwoPageMode ? (
        // --- İKİ SAYFALI KİTAP GÖRÜNÜMÜ ---
        <div className=\"flex-1 flex overflow-hidden relative z-10 bg-[#f4f1ea] p-6 pb-12\">
          
          {/* Sol Sayfa (Bulgu Editörü) */}
          <div className=\"flex-1 flex bg-[#fdfcf8] rounded-l-xl shadow-2xl border-y border-l border-slate-200/80 overflow-hidden relative\">
            <div className=\"flex-1 overflow-y-auto p-12 custom-scrollbar pb-32\">
               <div className=\"max-w-3xl ml-auto\">
                 <ZenEditor findingId={findingId || undefined} initialData={editorData} onChange={setEditorData} />
               </div>
            </div>
          </div>

          {/* Kitap Cildi (Spine Effect) */}
          <div className=\"w-12 shrink-0 bg-gradient-to-r from-[#e8e4db] via-[#dcd8ce] to-[#e8e4db] border-x border-slate-300/40 shadow-[inset_0_0_20px_rgba(0,0,0,0.08)] relative z-20 flex justify-center\">
             <div className=\"w-px h-full bg-black/5\" />
          </div>

          {/* Sağ Sayfa (Aksiyonlar ve Yorumlar) */}
          <div className=\"flex-1 flex bg-[#fdfcf8] rounded-r-xl shadow-2xl border-y border-r border-slate-200/80 overflow-hidden relative\">
            <div className=\"flex-1 overflow-y-auto p-12 custom-scrollbar pb-32\">
               <div className=\"max-w-3xl mr-auto h-full\">
                  <RightPanelContent />
               </div>
            </div>
          </div>

        </div>
      ) : (
        // --- KLASİK DİKEY KAYDIRMA GÖRÜNÜMÜ ---
        <div className=\"flex-1 overflow-y-auto p-8 custom-scrollbar relative z-10\">
          <div className=\"max-w-4xl mx-auto space-y-12 pb-32\">
            
            {/* Bulgu Editörü (Ana Form) */}
            <div className=\"bg-white p-10 md:p-14 rounded-2xl shadow-sm border border-slate-200/60\">
              <ZenEditor findingId={findingId || undefined} initialData={editorData} onChange={setEditorData} />
            </div>

            {/* Ayırıcı Sembol (Zarif Kitap Ayracı) */}
            <div className=\"flex items-center justify-center gap-4 text-slate-300\">
               <div className=\"h-px w-24 bg-slate-200\" />
               <span className=\"text-2xl\">❦</span>
               <div className=\"h-px w-24 bg-slate-200\" />
            </div>

            {/* Yanıtlar ve Tarihçe (Alt Kısım) */}
            <div className=\"bg-[#fcfbf9] p-10 md:p-14 rounded-2xl shadow-sm border border-slate-200/60\">
               <RightPanelContent />
            </div>

          </div>
        </div>
      )}

    </div>
  );
}