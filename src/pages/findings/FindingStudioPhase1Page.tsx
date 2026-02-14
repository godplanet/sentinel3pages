import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Lock, ShieldCheck, Edit, Send, AlertCircle, FileText, 
  Lightbulb, AlertTriangle 
} from 'lucide-react';

// --- MİMARİ BAĞLANTILAR ---
import { mockComprehensiveFindings } from '@/entities/finding/api/mock-comprehensive-data';
import type { ComprehensiveFinding } from '@/entities/finding/model/types';

// --- UI BİLEŞENLERİ ---
import { FindingPaper } from '@/widgets/FindingStudio/FindingPaper';
import { GlassCard } from '@/shared/ui/GlassCard';

interface Phase1Props {
  findingId: string;
  onNextPhase: () => void;
}

export default function FindingStudioPhase1Page({ findingId, onNextPhase }: Phase1Props) {
  const navigate = useNavigate();
  const [finding, setFinding] = useState<ComprehensiveFinding | null>(null);

  // 1. VERİ YÜKLEME
  useEffect(() => {
    const data = mockComprehensiveFindings.find(f => f.id === findingId);
    if (data) setFinding(data);
  }, [findingId]);

  if (!finding) return <div className="p-12 text-center text-slate-400">Veriler yükleniyor...</div>;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* ÜST BİLGİ BARI (Liquid Glass) */}
      <GlassCard className="mb-6 !bg-gradient-to-r from-blue-50 to-indigo-50 !border-blue-100" neonGlow="none">
        <div className="flex items-start gap-4">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg shadow-sm">
                <AlertCircle size={20} />
            </div>
            <div>
              <h3 className="font-bold text-blue-900 text-sm">Taslak Aşaması (Draft)</h3>
              <p className="text-blue-800/80 text-xs mt-1 leading-relaxed">
                Bulgu şu an taslak halindedir. Sol taraftaki raporu kontrol edin, sağ panelden gizli notlarınızı ekleyin ve hazır olduğunda <strong>Yönetici Onayına</strong> gönderin.
              </p>
            </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* SOL PANEL: RAPOR KAĞIDI (Finding Paper) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Paper bileşeni zaten kendi içinde stilize edilmiştir */}
          <FindingPaper finding={finding} />
        </div>

        {/* SAĞ PANEL: DENETÇİ KOKPİTİ */}
        <div className="space-y-6">
          
          {/* 1. İŞLEMLER (Sticky) */}
          <GlassCard className="p-6 sticky top-24 z-20" neonGlow="blue">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <FileText size={18} className="text-indigo-600"/> İşlemler
            </h3>
            
            <div className="space-y-3">
              <button 
                onClick={() => navigate(`/execution/findings/${finding.id}`)} 
                className="w-full flex items-center justify-center gap-2 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
              >
                <Edit size={16} /> Düzenle (Form Modu)
              </button>
              
              <button 
                onClick={onNextPhase}
                className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-95"
              >
                <Send size={16} /> Yöneticiye Gönder
              </button>
            </div>
          </GlassCard>

          {/* 2. GİZLİ NOTLAR (Sadece Denetçi Görür) */}
          <GlassCard className="p-6" neonGlow="none">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Lock size={16} className="text-amber-500"/> Gizli Denetçi Notları
            </h3>
            <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100 text-sm text-slate-700 leading-relaxed italic relative">
              <div className="absolute top-0 left-0 w-1 h-full bg-amber-300 rounded-l-xl"></div>
              {finding.secrets?.internal_notes || 'Bu bulgu ile ilgili henüz özel bir not girilmemiştir.'}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck size={10}/> Sadece Denetim Ekibi Görebilir
            </div>
          </GlassCard>

          {/* 3. AI KALİTE KONTROL */}
          <GlassCard className="p-6" neonGlow="none">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-600"/> AI Kalite Analizi
            </h3>
            
            <div className="space-y-4">
               {/* 5N1K Skoru */}
               <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 font-medium">5N1K Uyumu</span>
                  <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded text-xs">%95</span>
               </div>
               <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[95%]"></div>
               </div>

               {/* Uyarılar */}
               <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-2">
                  <div className="flex items-start gap-2">
                      <div className="mt-0.5"><CheckCircle2 size={12} className="text-emerald-500"/></div>
                      <p className="text-xs text-slate-600">Kök neden analizi (5 Whys) tespit edildi.</p>
                  </div>
                  <div className="flex items-start gap-2">
                      <div className="mt-0.5"><AlertTriangle size={12} className="text-orange-500"/></div>
                      <p className="text-xs text-slate-600">Kanıt dokümanı sayısı (1) asgari seviyede.</p>
                  </div>
                  <div className="flex items-start gap-2">
                      <div className="mt-0.5"><Lightbulb size={12} className="text-blue-500"/></div>
                      <p className="text-xs text-slate-600">Öneri paragrafı daha net eylemler içerebilir.</p>
                  </div>
               </div>
            </div>
          </GlassCard>

        </div>
      </div>
    </div>
  );
}

// Yardımcı ikon (Yukarıda kullanılmadıysa diye local tanım)
function CheckCircle2({ size, className }: { size: number, className?: string }) {
    return (
        <svg 
            width={size} 
            height={size} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className={className}
        >
            <circle cx="12" cy="12" r="10" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    );
}