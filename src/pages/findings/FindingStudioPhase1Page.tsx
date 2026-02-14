import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Lock, ShieldCheck, Edit, Send, AlertCircle, FileText, 
  Lightbulb, AlertTriangle, Link2, Search, X, Network 
} from 'lucide-react';
import clsx from 'clsx';

// --- MİMARİ BAĞLANTILAR ---
import { mockComprehensiveFindings } from '@/entities/finding/api/mock-comprehensive-data';
import type { ComprehensiveFinding } from '@/entities/finding/model/types';

// --- UI BİLEŞENLERİ ---
import { FindingPaper } from '@/widgets/FindingStudio/FindingPaper';
import { GlassCard, RiskBadge } from '@/shared/ui/GlassCard';

interface Phase1Props {
  findingId: string;
  onNextPhase: () => void;
}

export default function FindingStudioPhase1Page({ findingId, onNextPhase }: Phase1Props) {
  const navigate = useNavigate();
  
  // STATE
  const [finding, setFinding] = useState<ComprehensiveFinding | null>(null);
  const [showLinker, setShowLinker] = useState(false); // Linker modunu aç/kapa
  const [linkedFindings, setLinkedFindings] = useState<string[]>([]); // Bağlanmış bulgular

  // 1. VERİ YÜKLEME
  useEffect(() => {
    const data = mockComprehensiveFindings.find(f => f.id === findingId);
    if (data) setFinding(data);
  }, [findingId]);

  // Mock "Benzer Bulgu" Getirme Mantığı
  // Gerçekte burası Vector DB (Embeddings) üzerinden çalışır.
  const similarFindings = mockComprehensiveFindings
    .filter(f => f.id !== findingId) // Kendisini hariç tut
    .slice(0, 3); // İlk 3 taneyi al

  const handleLinkToggle = (id: string) => {
    if (linkedFindings.includes(id)) {
        setLinkedFindings(prev => prev.filter(lid => lid !== id));
    } else {
        setLinkedFindings(prev => [...prev, id]);
    }
  };

  if (!finding) return <div className="p-12 text-center text-slate-400">Veriler yükleniyor...</div>;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* ÜST BİLGİ BARI (Liquid Glass) */}
      <GlassCard className="mb-6 !bg-gradient-to-r from-blue-50 to-indigo-50 !border-blue-100" neonGlow="none">
        <div className="flex items-start gap-4">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg shadow-sm">
                <AlertCircle size={20} />
            </div>
            <div>
              <h3 className="font-bold text-blue-900 text-sm">Taslak Aşaması (Draft)</h3>
              <p className="text-blue-800/80 text-xs mt-1 leading-relaxed">
                Bulgu şu an taslak halindedir. Sol taraftaki raporu kontrol edin, benzer bulguları ilişkilendirin ve hazır olduğunda <strong>Yönetici Onayına</strong> gönderin.
              </p>
            </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* SOL PANEL: RAPOR KAĞIDI (Finding Paper) */}
        <div className="lg:col-span-2 space-y-6">
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

              {/* YENİ: İLİŞKİLENDİRME BUTONU */}
              <button 
                onClick={() => setShowLinker(!showLinker)}
                className={clsx(
                    "w-full flex items-center justify-center gap-2 py-3 border rounded-xl text-sm font-bold transition-all shadow-sm",
                    showLinker 
                        ? "bg-indigo-50 border-indigo-200 text-indigo-700" 
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                )}
              >
                <Network size={16} /> {showLinker ? 'İlişkilendirmeyi Kapat' : 'Benzer Bulguları Bağla'}
              </button>
              
              <button 
                onClick={onNextPhase}
                className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-95"
              >
                <Send size={16} /> Yöneticiye Gönder
              </button>
            </div>
          </GlassCard>

          {/* 2. YENİ: SMART LINKER PANELİ (Sadece butona basınca veya ilişkili varsa görünür) */}
          {(showLinker || linkedFindings.length > 0) && (
              <GlassCard className="p-5 animate-in fade-in slide-in-from-right-4" neonGlow="none">
                  <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-slate-800 flex items-center gap-2">
                          <Link2 size={16} className="text-purple-600"/> İlişkili Bulgular
                      </h3>
                      {linkedFindings.length > 0 && (
                          <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              {linkedFindings.length} Bağlı
                          </span>
                      )}
                  </div>

                  {/* Arama Input */}
                  {showLinker && (
                      <div className="relative mb-4">
                          <input 
                              type="text" 
                              placeholder="Bulgu kodu veya başlık ara..."
                              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-indigo-400 transition-colors"
                          />
                          <Search size={14} className="absolute left-3 top-2.5 text-slate-400"/>
                      </div>
                  )}

                  <div className="space-y-3">
                      {/* Seçilmişler (Üstte) */}
                      {linkedFindings.length > 0 && (
                          <div className="mb-2 pb-2 border-b border-slate-100 space-y-2">
                              {linkedFindings.map(id => (
                                  <div key={id} className="flex items-center justify-between p-2 bg-purple-50 border border-purple-100 rounded-lg">
                                      <span className="text-xs font-bold text-purple-900">{id}</span>
                                      <button onClick={() => handleLinkToggle(id)} className="text-purple-400 hover:text-purple-700">
                                          <X size={14}/>
                                      </button>
                                  </div>
                              ))}
                          </div>
                      )}

                      {/* Önerilenler (AI Suggestions) */}
                      {showLinker && similarFindings.map(sim => (
                          <div key={sim.id} className="p-3 bg-white border border-slate-200 rounded-lg hover:border-indigo-300 transition-colors group">
                              <div className="flex justify-between items-start mb-2">
                                  <span className="text-[10px] font-mono font-bold text-slate-400">{sim.code}</span>
                                  <div className="flex items-center gap-1 bg-green-50 text-green-700 px-1.5 py-0.5 rounded text-[10px] font-bold border border-green-100">
                                      <Network size={10}/> %85
                                  </div>
                              </div>
                              <p className="text-xs font-bold text-slate-700 line-clamp-2 mb-2">{sim.title}</p>
                              
                              <div className="flex items-center justify-between mt-2">
                                  <RiskBadge score={sim.impact_score || 0} showLabel={false} />
                                  <button 
                                      onClick={() => handleLinkToggle(sim.id)}
                                      className={clsx(
                                          "px-2 py-1 rounded text-[10px] font-bold transition-colors flex items-center gap-1",
                                          linkedFindings.includes(sim.id)
                                              ? "bg-purple-100 text-purple-700"
                                              : "bg-slate-100 text-slate-600 hover:bg-indigo-100 hover:text-indigo-700"
                                      )}
                                  >
                                      {linkedFindings.includes(sim.id) ? 'Bağlandı' : 'Bağla'}
                                  </button>
                              </div>
                          </div>
                      ))}
                  </div>
              </GlassCard>
          )}

          {/* 3. GİZLİ NOTLAR */}
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

          {/* 4. AI KALİTE KONTROL */}
          <GlassCard className="p-6" neonGlow="none">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-600"/> AI Kalite Analizi
            </h3>
            <div className="space-y-4">
               <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 font-medium">5N1K Uyumu</span>
                  <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded text-xs">%95</span>
               </div>
               <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[95%]"></div>
               </div>
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