import { useState } from 'react';
import { 
  Sparkles, FileText, CheckCircle2, AlertCircle, 
  MessageSquare, Loader2, Check 
} from 'lucide-react';
import clsx from 'clsx';

// Sizin sisteminizdeki mevcut AI motorları
import { generateDraftFromNotes, analyzeSentiment, type GeneratedFinding } from '@/features/ai-audit/utils/findingGenerator';

interface AIPanelProps {
  findingId: string | null;
  // AI tarafından üretilen bulguyu ana forma (ZenEditor'e) aktarmak için callback
  onApplyDraft?: (draft: GeneratedFinding) => void; 
}

type SubTab = 'notes' | 'analysis';

export function AIPanel({ findingId, onApplyDraft }: AIPanelProps) {
  const [activeTab, setActiveTab] = useState<SubTab>('notes');
  
  // Notlar State
  const [notes, setNotes] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDraft, setGeneratedDraft] = useState<GeneratedFinding | null>(null);

  // SİZİN ORİJİNAL KODUNUZ: AI Dönüştürme İşlemi
  const handleGenerateFinding = async () => {
    if (!notes.trim()) return;
    setIsGenerating(true);
    
    // Gerçekçi bir AI bekleme süresi simülasyonu
    setTimeout(() => {
      const draft = generateDraftFromNotes(notes);
      setGeneratedDraft(draft);
      setIsGenerating(false);
    }, 1500);
  };

  const handleApplyToForm = () => {
    if (generatedDraft && onApplyDraft) {
      onApplyDraft(generatedDraft);
      setGeneratedDraft(null); // Aktardıktan sonra önizlemeyi temizle
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6 animate-in fade-in duration-300">
      
      {/* ALT SEKMELER (Notlar vs Analiz) */}
      <div className="flex items-center gap-2 bg-slate-200/50 p-1 rounded-lg shrink-0">
        <button 
          onClick={() => setActiveTab('notes')}
          className={clsx("flex-1 py-1.5 text-sm font-bold rounded-md transition-all flex items-center justify-center gap-2", activeTab === 'notes' ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-700")}
        >
          <FileText size={16} /> Notlar & Üretim
        </button>
        <button 
          onClick={() => setActiveTab('analysis')}
          className={clsx("flex-1 py-1.5 text-sm font-bold rounded-md transition-all flex items-center justify-center gap-2", activeTab === 'analysis' ? "bg-white text-purple-700 shadow-sm" : "text-slate-500 hover:text-slate-700")}
        >
          <Sparkles size={16} /> Akıllı Analiz
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pb-20">
        
        {/* ======================================================================= */}
        {/* SEKME 1: MÜFETTİŞ NOTLARI VE AI İLE BULGU ÜRETİMİ (Eski NotlarTab)      */}
        {/* ======================================================================= */}
        {activeTab === 'notes' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
                <FileText className="text-blue-600" size={16} /> Müfettiş Notları
              </h3>
              <p className="text-xs text-slate-600 mb-4">
                Saha notlarınızı buraya yazın. Sentinel AI bu karmaşık notları analiz ederek saniyeler içinde 5C formatında resmi bir bulguya dönüştürecektir.
              </p>
              
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Örn: Şubeye gittim, Ahmet beyle görüştüm. Kasada çift anahtar kullanılmıyor..."
                className="w-full h-40 px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white text-sm shadow-inner"
              />
              
              <div className="flex gap-2 mt-3">
                <button 
                  onClick={handleGenerateFinding}
                  disabled={!notes.trim() || isGenerating}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                >
                  {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {isGenerating ? 'AI Analiz Ediyor...' : 'Bulguya Dönüştür'}
                </button>
                <button className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300 transition-colors text-sm font-bold">
                  Kaydet
                </button>
              </div>
            </div>

            {/* AI ÜRETİM SONUCU (ÖNİZLEME) */}
            {generatedDraft && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-xl border border-blue-200 shadow-sm animate-in slide-in-from-top-4">
                <div className="flex items-center gap-2 mb-3 border-b border-blue-200/50 pb-2">
                  <Sparkles className="text-indigo-600 w-5 h-5" />
                  <h4 className="text-sm font-black text-indigo-900">AI Taslağı Hazır</h4>
                </div>
                
                <div className="space-y-3 text-sm">
                  <div><span className="font-bold text-slate-700">Başlık:</span> <span className="text-slate-900">{generatedDraft.title}</span></div>
                  <div><span className="font-bold text-slate-700">Kriter:</span> <span className="text-slate-900">{generatedDraft.criteria_suggestion}</span></div>
                  <div><span className="font-bold text-slate-700">Risk & Önem:</span> 
                    <span className={clsx("ml-2 px-2 py-0.5 rounded text-xs font-bold text-white", generatedDraft.severity === 'CRITICAL' ? 'bg-red-600' : generatedDraft.severity === 'HIGH' ? 'bg-orange-500' : 'bg-amber-500')}>
                      {generatedDraft.severity}
                    </span>
                  </div>
                  <div className="pt-2">
                    <span className="font-bold text-slate-700 block mb-1">Tespit (Detay):</span> 
                    <p className="text-slate-800 bg-white p-3 rounded-lg border border-blue-100 whitespace-pre-wrap">{generatedDraft.description}</p>
                  </div>
                </div>

                <button onClick={handleApplyToForm} className="w-full mt-4 py-2.5 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
                  <Check size={16} /> Ana Forma Aktar
                </button>
              </div>
            )}

            {/* ORİJİNAL KOD: Önceki Notlar */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Önceki Notlar</h3>
              <div className="space-y-3">
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg shadow-sm">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-xs text-yellow-800 font-medium">15.12.2025 - 14:30</span>
                    <button className="text-xs font-bold text-yellow-700 hover:text-yellow-900">Düzenle</button>
                  </div>
                  <p className="text-sm text-yellow-900 leading-relaxed">
                    CCTV kayıtlarında personel tek başına kasaya erişim sağlamıştır. İşlem personeli Ahmet Yılmaz. Yönetici tatilde.
                  </p>
                </div>
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg shadow-sm">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-xs text-yellow-800 font-medium">14.12.2025 - 10:15</span>
                    <button className="text-xs font-bold text-yellow-700 hover:text-yellow-900">Düzenle</button>
                  </div>
                  <p className="text-sm text-yellow-900 leading-relaxed">
                    Benzer durum 2024 yılında da gözlenmişti. İyileştirme yapılmamış.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================================= */}
        {/* SEKME 2: AKILLI ANALİZ VE KALİTE KONTROL (Eski AITab)                   */}
        {/* ======================================================================= */}
        {activeTab === 'analysis' && (
          <div className="space-y-6">
            
            {/* ORİJİNAL KOD: Benzerlik Analizi */}
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center shadow-md">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-purple-900">Benzerlik Analizi</h3>
                  <p className="text-xs font-medium text-purple-700">AI tarafından tarandı</p>
                </div>
              </div>
              <div className="text-center mb-5">
                <div className="text-5xl font-black text-purple-600 mb-2 drop-shadow-sm">%85</div>
                <p className="text-sm font-medium text-purple-800">
                  Bu bulgu, son 3 yıl içinde 5 farklı şubede tespit edilen benzer bulgulara çok yakın.
                </p>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-bold shadow-sm">
                  Kök Nedeni Eşleştir
                </button>
                <button className="flex-1 px-4 py-2 bg-white text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors text-sm font-bold">
                  Geçmiş Önerileri Gör
                </button>
              </div>
            </div>

            {/* ORİJİNAL KOD: Tekrar Eden Bulgular */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Geçmişteki Benzer Bulgular</h3>
              <div className="space-y-2">
                {[
                  { id: 1, title: 'Kasa İşlemlerinde Çift Onay Eksikliği', branch: 'Kadıköy', date: '14 Ocak 2025' },
                  { id: 2, title: 'Vezne Şifre Paylaşımı Tespiti', branch: 'Beşiktaş', date: '14 Kasım 2024' },
                ].map((item) => (
                  <div key={item.id} className="flex items-start gap-3 p-3 bg-white border border-slate-200 rounded-lg hover:border-blue-300 transition-colors cursor-pointer shadow-sm">
                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <History className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">{item.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-medium text-slate-500">{item.branch}</span>
                        <span className="text-xs text-slate-300">•</span>
                        <span className="text-xs font-medium text-slate-500">{item.date}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ORİJİNAL KOD: Kalite Kontrol */}
            <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-lg shadow-sm">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-orange-900 mb-1">AI Kalite Kontrol Uyarısı</h4>
                  <p className="text-sm text-orange-800 leading-relaxed font-medium">
                    Bulgu metni içinde mükerrer gönderilmiş kontrol tespiti var. "Dual-control" kelimesi 3 kez tekrar edilmiştir. Etki analizi (Risk) kısmı çok zayıf.
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}