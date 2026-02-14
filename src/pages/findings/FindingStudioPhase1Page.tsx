import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Lock, ShieldCheck, Edit, Send, AlertCircle, FileText 
} from 'lucide-react';

// --- MİMARİ BAĞLANTILAR (Single Source) ---
import { mockComprehensiveFindings } from '@/entities/finding/api/mock-comprehensive-data';
import type { ComprehensiveFinding } from '@/entities/finding/model/types';
import { FindingPaper } from '@/widgets/FindingStudio/FindingPaper';

interface Phase1Props {
  findingId: string;
  onNextPhase: () => void; // Master sayfadan gelen "Sonraki Aşamaya Geç" fonksiyonu
}

export default function FindingStudioPhase1Page({ findingId, onNextPhase }: Phase1Props) {
  const navigate = useNavigate();
  const [finding, setFinding] = useState<ComprehensiveFinding | null>(null);

  // Veri Yükleme
  useEffect(() => {
    const data = mockComprehensiveFindings.find(f => f.id === findingId);
    if (data) setFinding(data);
  }, [findingId]);

  if (!finding) return <div className="p-8 text-center text-slate-500">Veriler yükleniyor...</div>;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Üst Bilgi Barı */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-start gap-3">
        <AlertCircle className="text-blue-600 mt-0.5 shrink-0" size={20} />
        <div>
          <h3 className="font-bold text-blue-900 text-sm">Taslak Aşaması (Draft)</h3>
          <p className="text-blue-800/80 text-xs mt-1 leading-relaxed">
            Bulgu şu an taslak halindedir. İçeriği kontrol edin, gizli notlarınızı ekleyin ve hazır olduğunda yönetici onayına (Review) gönderin.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* SOL PANEL: Finding Paper (Kağıt Görünümü - Read Only) */}
        <div className="lg:col-span-2 space-y-6">
          <FindingPaper finding={finding} />
        </div>

        {/* SAĞ PANEL: Denetçi Araçları */}
        <div className="space-y-6">
          
          {/* 1. Aksiyon Kutusu */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm sticky top-24">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <FileText size={18} className="text-indigo-600"/> İşlemler
            </h3>
            
            <div className="space-y-3">
              <button 
                onClick={() => navigate(`/execution/findings/${finding.id}`)} // Form moduna atar
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors"
              >
                <Edit size={16} /> Düzenle (Form Modu)
              </button>
              
              <button 
                onClick={onNextPhase} // Master sayfadaki handlePhaseComplete fonksiyonunu tetikler
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 shadow-md transition-all active:scale-95"
              >
                <Send size={16} /> Yöneticiye Gönder
              </button>
            </div>
          </div>

          {/* 2. Gizli Notlar */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Lock size={16} className="text-amber-500"/> Gizli Denetçi Notları
            </h3>
            <div className="bg-amber-50/50 p-4 rounded-lg border border-amber-100 text-sm text-slate-700 leading-relaxed italic">
              {finding.secrets?.internal_notes || 'Bu bulgu ile ilgili henüz özel bir not girilmemiştir.'}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Sadece Denetim Ekibi Görebilir
            </div>
          </div>

          {/* 3. AI Analizi */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-600"/> AI Kalite Kontrol
            </h3>
            <div className="space-y-3">
               <div className="flex items-center gap-2 text-xs text-slate-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div> 5N1K kuralına uygunluk: %95
               </div>
               <div className="flex items-center gap-2 text-xs text-slate-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div> Kök neden analizi: Mevcut
               </div>
               <div className="flex items-center gap-2 text-xs text-slate-600">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div> Kanıt dokümanı: Eksik olabilir
               </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}