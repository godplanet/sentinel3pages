import React, { useState, useMemo } from 'react';
import { 
  Building2, Scale, AlertOctagon, ShieldAlert, Activity, 
  Search, Filter, Plus, ChevronRight, BrainCircuit, Info, Download,
  Server, ShieldCheck, Flame, Calculator, Lock
} from 'lucide-react';
import { PageHeader } from '@/shared/ui/PageHeader';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

// --- KERD-2026 BLUEPRINT TİPLERİ ---
type EntityType = 'GM - Hazine / Krediler' | 'GM - BT / Dijital' | 'Bölge Müdürlükleri' | 'Ticari Şubeler (Mega)' | 'Perakende Şubeler' | 'Uydu / Mobil Şubeler';
type Grade = 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';

interface AuditEntity {
  id: string;
  name: string;
  type: EntityType;
  manager: string;
  path: string; 
  risk_weight: number; 
  findings: { bordo: number; kizil: number; turuncu: number; sari: number; gozlem: number; shariah_systemic: number };
  lastAudit: string;
}

// --- MOCK VERİLER (Blueprint Senaryoları) ---
const MOCK_UNIVERSE: AuditEntity[] = [
  {
    id: 'hq-1', name: 'Hazine ve Fon Yönetimi', type: 'GM - Hazine / Krediler', manager: 'Zeynep Arslan', path: 'sentinel.hq.treasury', weight: 10.0,
    findings: { bordo: 0, kizil: 0, turuncu: 1, sari: 2, gozlem: 0, shariah_systemic: 1 }, lastAudit: '2025-11-10' // Şer'i İhlal -> F!
  },
  {
    id: 'it-1', name: 'Bilgi Teknolojileri ve Siber Güvenlik', type: 'GM - BT / Dijital', manager: 'Ali Çelik', path: 'sentinel.hq.it', weight: 8.0,
    findings: { bordo: 0, kizil: 4, turuncu: 5, sari: 10, gozlem: 2, shariah_systemic: 0 }, lastAudit: '2025-08-20' // >3 Kızıl -> Hacim Tavanı (C)
  },
  {
    id: 'br-101', name: 'Kadıköy Ticari Şubesi', type: 'Ticari Şubeler (Mega)', manager: 'Mehmet Kaya', path: 'sentinel.branches.kadikoy', weight: 2.0,
    findings: { bordo: 1, kizil: 0, turuncu: 0, sari: 1, gozlem: 5, shariah_systemic: 0 }, lastAudit: '2025-12-01' // 1 Bordo -> Kritik Tavanı (D)
  },
  {
    id: 'br-102', name: 'Ümraniye Perakende Şubesi', type: 'Perakende Şubeler', manager: 'Ayşe Yılmaz', path: 'sentinel.branches.umraniye', weight: 1.0,
    findings: { bordo: 0, kizil: 0, turuncu: 0, sari: 1, gozlem: 3, shariah_systemic: 0 }, lastAudit: '2024-05-10' // Kusursuz -> A+
  },
  {
    id: 'reg-1', name: 'Marmara Bölge Müdürlüğü', type: 'Bölge Müdürlükleri', manager: 'Ahmet Demir', path: 'sentinel.regions.marmara', weight: 3.0,
    findings: { bordo: 0, kizil: 1, turuncu: 2, sari: 4, gozlem: 1, shariah_systemic: 0 }, lastAudit: '2025-02-15' // Normal Kesinti -> B
  }
];

// --- HESAPLAMA MOTORU (KERD-2026 Kısıt Bazlı Kesinti Modeli) ---
const calculateGrade = (entity: AuditEntity) => {
  // 1. Kesinti Mantığı
  let rawScore = 100.0;
  rawScore -= (entity.findings.bordo * 25);
  rawScore -= (entity.findings.kizil * 10);
  rawScore -= (entity.findings.turuncu * 3);
  rawScore -= (entity.findings.sari * 0.5);
  rawScore += Math.min(entity.findings.gozlem * 1.0, 5); // Maks 5 bonus

  // 2. Acil Durdurma Tavan Kuralları (Veto)
  let finalScore = rawScore;
  let vetoReason = null;

  if (entity.findings.shariah_systemic > 0) {
    finalScore = 0.0;
    vetoReason = "Sistemik Şer'i İhlal";
  } else if (entity.findings.bordo >= 1) {
    finalScore = Math.min(finalScore, 59.99);
    vetoReason = "Kritik (Bordo) Tavanı";
  } else if (entity.findings.kizil > 3) {
    finalScore = Math.min(finalScore, 69.99);
    vetoReason = "Yüksek Hacim (Kızıl) Tavanı";
  }

  // 3. Derecelendirme Tablosu
  let grade = 'F'; let opinion = 'Güvence Yok'; let color = 'bg-slate-100'; let frequency = '6-9 Ay';
  
  if (finalScore >= 95) { grade = 'A+'; opinion = 'Tam Güvence'; color = 'bg-blue-100 text-blue-800 border-blue-200'; frequency = '48 Ay'; }
  else if (finalScore >= 85) { grade = 'A'; opinion = 'Yüksek Güvence'; color = 'bg-emerald-100 text-emerald-800 border-emerald-200'; frequency = '36 Ay'; }
  else if (finalScore >= 70) { grade = 'B'; opinion = 'Makul Güvence'; color = 'bg-yellow-100 text-yellow-800 border-yellow-200'; frequency = '24 Ay'; }
  else if (finalScore >= 60) { grade = 'C'; opinion = 'Sınırlı Güvence'; color = 'bg-orange-100 text-orange-800 border-orange-200'; frequency = '18 Ay'; }
  else if (finalScore >= 50) { grade = 'D'; opinion = 'Zayıf / Gelişim Gerekir'; color = 'bg-red-100 text-red-800 border-red-200'; frequency = '12 Ay'; }
  else { grade = 'F'; opinion = 'Güvence Yok'; color = 'bg-rose-900 text-white border-rose-950'; frequency = 'Sürekli İzleme'; }

  if (finalScore === 0 && vetoReason?.includes("Şer'i")) {
    opinion = 'Batıl (Geçersiz)';
    color = 'bg-rose-950 text-rose-100 border-rose-900';
  }

  return { rawScore, finalScore, vetoReason, grade, opinion, color, frequency };
};

export default function AuditUniversePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntity, setSelectedEntity] = useState<AuditEntity | null>(null);

  // Banka Geneli RWA (Risk Ağırlıklı Ortalama) Hesaplaması
  const { rwaScore, rwaGrade, rwaOpinion, totalWeight, cappedCount } = useMemo(() => {
    let weightedSum = 0;
    let weightTotal = 0;
    let caps = 0;

    MOCK_UNIVERSE.forEach(e => {
      const { finalScore, vetoReason } = calculateGrade(e);
      weightedSum += (finalScore * e.weight);
      weightTotal += e.weight;
      if (vetoReason) caps++;
    });

    const score = weightTotal > 0 ? (weightedSum / weightTotal) : 0;
    
    let grade = 'F'; let opinion = 'Güvence Yok';
    if (score >= 95) { grade = 'A+'; opinion = 'Tam Güvence'; }
    else if (score >= 85) { grade = 'A'; opinion = 'Yüksek Güvence'; }
    else if (score >= 70) { grade = 'B'; opinion = 'Makul Güvence'; }
    else if (score >= 60) { grade = 'C'; opinion = 'Sınırlı Güvence'; }
    else if (score >= 50) { grade = 'D'; opinion = 'Zayıf'; }

    return { rwaScore: score.toFixed(2), rwaGrade: grade, rwaOpinion: opinion, totalWeight: weightTotal, cappedCount: caps };
  }, []);

  return (
    <div className="w-full max-w-full px-6 py-8 space-y-6 bg-slate-50 min-h-screen font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeader
          title="Denetim Evreni (Audit Universe)"
          description="KERD-2026 Çerçevesi ve IIA 2024 Standartları: RWA Konsolide Kurumsal Güvence Görünümü"
          icon={Building2}
        />
        <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium shadow-sm">
          <Plus size={18} /> Yeni Varlık Ekle
        </button>
      </div>

      {/* --- 1. VİTRİN: HİBRİT TASARIM (KONSOLİDE GÖRÜNÜM) --- */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* RWA Scorecard */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 shadow-xl border border-slate-700 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute -right-8 -top-8 text-white/5"><Scale size={160} /></div>
          <div className="relative z-10">
            <h2 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1 flex items-center gap-2">
              <ShieldCheck size={16} /> Banka Geneli Konsolide Güvence
            </h2>
            <p className="text-slate-500 text-xs">Risk Ağırlıklı Ortalama (RWA) Modeli</p>
          </div>
          <div className="mt-6 flex items-end gap-4 relative z-10">
            <div className="text-7xl font-black text-white tracking-tighter">{rwaScore}</div>
            <div className="mb-2">
              <div className={clsx("inline-flex px-3 py-1 rounded text-lg font-bold border", 
                Number(rwaScore) < 60 ? 'bg-rose-900/50 text-rose-300 border-rose-800' : 
                Number(rwaScore) < 85 ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : 
                'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
              )}>
                Not: {rwaGrade}
              </div>
              <div className="text-sm text-slate-300 mt-1 font-medium">{rwaOpinion}</div>
            </div>
          </div>
        </div>

        {/* Sentinel AI Yorumu */}
        <div className="lg:col-span-2 bg-gradient-to-br from-indigo-950 to-slate-900 rounded-2xl p-6 shadow-xl border border-indigo-900/50 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-indigo-500 rounded-full opacity-10 blur-3xl pointer-events-none"></div>
          
          <div className="flex items-start gap-4 relative z-10">
            <div className="p-3 bg-indigo-500/20 rounded-xl border border-indigo-500/30 shrink-0">
              <BrainCircuit className="w-6 h-6 text-indigo-300" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-indigo-200 font-bold flex items-center gap-2">
                  Sentinel AI Stratejik Gözlem
                  <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 text-[10px] rounded-full border border-rose-500/30 uppercase tracking-wide animate-pulse">
                    Sistemik Risk Uyarısı
                  </span>
                </h3>
                <div className="text-xs text-indigo-300/70 font-mono">
                  Aktif Veto: {cappedCount} | Toplam RWA: {totalWeight.toFixed(1)}
                </div>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">
                Şubeler genelinde (Örn: Ümraniye) operasyonel başarı <strong>(A Notu)</strong> gözlemlenmesine rağmen, <strong>Hazine ve Fon Yönetimi (Ağırlık: 10.0)</strong> biriminde tespit edilen Şer'i İhlal, <span className="text-rose-400 font-semibold">"Acil Durdurma Anahtarı"nı (Veto)</span> devreye sokarak birim puanını sıfırlamıştır. Yüksek RWA ağırlığı nedeniyle Banka Genel Puanı <strong>{rwaScore} (Güvence Yok)</strong> seviyesine çakılmıştır. Derhal Denetim Komitesi müdahalesi önerilir.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* BİLGİ BANDI */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-blue-900 leading-relaxed">
          <strong>Kısıt Bazlı Kesinti Modeli (IIA Std 14.5):</strong> Doğrusal puanlama terk edilmiştir. Bir varlığın ham puanı yüksek olsa dahi, <em>Kritik Bulgu</em> (Max D), <em>Yüksek Hacim</em> (Max C) veya <em>Şer'i İhlal</em> (Sıfırlama) gibi kurallar matematiksel sonucu ezer. <strong>Mükemmellik tutarlılık gerektirir.</strong>
        </div>
      </div>

      {/* --- 2. MUTFAK: KURUMSAL NETLİK (ENTERPRISE CLEAN DATA GRID) --- */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Varlık adı, LTree veya tipine göre ara..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-md text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-md text-sm font-medium hover:bg-slate-50 transition-colors">
              <Filter size={16} /> Filtrele
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-md text-sm font-medium hover:bg-slate-50 transition-colors">
              <Download size={16} /> Dışa Aktar
            </button>
          </div>
        </div>

        {/* Tablo */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider text-xs border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Birim / Varlık (LTree)</th>
                <th className="px-6 py-4 text-center">Risk Ağırlığı</th>
                <th className="px-6 py-4 text-center">Ham Puan</th>
                <th className="px-6 py-4">Durdurma (Veto) Kısıtı</th>
                <th className="px-6 py-4 text-center">Nihai Not</th>
                <th className="px-6 py-4">Güvence Görüşü (IIA)</th>
                <th className="px-6 py-4 text-center">Bulgu (B/K/T/S)</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {MOCK_UNIVERSE.filter(e => e.name.toLowerCase().includes(searchTerm.toLowerCase()) || e.path.toLowerCase().includes(searchTerm.toLowerCase())).map((entity) => {
                const { rawScore, finalScore, vetoReason, grade, opinion, color } = calculateGrade(entity);
                const isCapped = rawScore !== finalScore;
                
                return (
                  <React.Fragment key={entity.id}>
                    <tr 
                      onClick={() => setSelectedEntity(selectedEntity?.id === entity.id ? null : entity)}
                      className={clsx(
                        "hover:bg-blue-50/50 transition-colors group cursor-pointer",
                        selectedEntity?.id === entity.id ? "bg-blue-50/50" : ""
                      )}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={clsx(
                            "w-8 h-8 rounded flex items-center justify-center text-white flex-shrink-0 shadow-sm",
                            entity.type.includes('Hazine') ? 'bg-indigo-600' :
                            entity.type.includes('BT') ? 'bg-purple-600' :
                            entity.type.includes('Bölge') ? 'bg-blue-500' : 'bg-emerald-500'
                          )}>
                            {entity.type.includes('BT') ? <Server size={14} /> : <Building2 size={14} />}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors">{entity.name}</div>
                            <div className="text-[11px] text-slate-400 font-mono mt-0.5">{entity.path}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center px-2 py-1 rounded bg-slate-100 text-slate-700 font-mono text-xs font-bold border border-slate-200">
                          {entity.weight.toFixed(1)}x
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={clsx("font-mono font-medium", isCapped ? "line-through text-slate-400" : "text-slate-700")}>
                          {rawScore.toFixed(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {vetoReason ? (
                          <span className={clsx(
                            "inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold w-max border shadow-sm",
                            vetoReason.includes("Şer'i") ? "bg-rose-50 text-rose-700 border-rose-200" :
                            vetoReason.includes("Kritik") ? "bg-red-50 text-red-700 border-red-200" :
                            "bg-amber-50 text-amber-700 border-amber-200"
                          )}>
                            {vetoReason.includes("Şer'i") ? <Flame size={12} className="animate-pulse" /> : 
                             vetoReason.includes("Kritik") ? <ShieldAlert size={12} /> : <TrendingDown size={12} />}
                            {vetoReason}
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                            <CheckCircle2 size={12} /> Kısıt Yok
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={clsx("inline-flex items-center justify-center w-8 h-8 rounded font-bold border text-sm shadow-sm", color)}>
                          {grade}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className={clsx("font-bold", vetoReason?.includes("Şer'i") ? "text-rose-700" : "text-slate-800")}>
                            {opinion}
                          </span>
                          <span className="text-xs text-slate-500 mt-0.5">Puan: {finalScore.toFixed(2)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1.5 font-mono text-xs">
                          <span className={clsx("w-6 text-center py-0.5 rounded font-bold border", entity.findings.bordo > 0 ? "bg-rose-950 text-white border-rose-900" : "bg-slate-50 text-slate-400 border-slate-200")} title="Bordo (Kritik)">{entity.findings.bordo}</span>
                          <span className={clsx("w-6 text-center py-0.5 rounded font-bold border", entity.findings.kizil > 0 ? "bg-red-600 text-white border-red-700" : "bg-slate-50 text-slate-400 border-slate-200")} title="Kızıl (Yüksek)">{entity.findings.kizil}</span>
                          <span className={clsx("w-6 text-center py-0.5 rounded font-bold border", entity.findings.turuncu > 0 ? "bg-orange-500 text-white border-orange-600" : "bg-slate-50 text-slate-400 border-slate-200")} title="Turuncu (Orta)">{entity.findings.turuncu}</span>
                          <span className={clsx("w-6 text-center py-0.5 rounded font-bold border", entity.findings.sari > 0 ? "bg-yellow-400 text-slate-900 border-yellow-500" : "bg-slate-50 text-slate-400 border-slate-200")} title="Sarı (Düşük)">{entity.findings.sari}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-slate-400 group-hover:text-blue-600 transition-colors">
                          <ChevronRight size={20} className={clsx("transition-transform", selectedEntity?.id === entity.id ? "rotate-90" : "")} />
                        </button>
                      </td>
                    </tr>
                    
                    {/* Detay Paneli (Satır İçi Drawer) */}
                    <AnimatePresence>
                      {selectedEntity?.id === entity.id && (
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <td colSpan={8} className="p-0">
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }} 
                              animate={{ height: 'auto', opacity: 1 }} 
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 border-t border-slate-200">
                                <div className="bg-white border border-slate-200 rounded-lg p-5">
                                  <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <Activity size={14} /> Kesinti Matematiği (Deduction)
                                  </h5>
                                  <div className="space-y-2 font-mono text-sm text-slate-700">
                                    <div className="flex justify-between border-b border-slate-100 pb-2">
                                      <span>Başlangıç Puanı:</span>
                                      <span>100.00</span>
                                    </div>
                                    <div className="flex justify-between text-rose-600 border-b border-slate-100 py-2">
                                      <span>Kümülatif Kesintiler:</span>
                                      <span>-{(100 - rawScore).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between font-bold pt-2">
                                      <span>Matematiksel Ham Puan:</span>
                                      <span>{rawScore.toFixed(2)}</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="bg-white border border-slate-200 rounded-lg p-5">
                                  <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <Lock size={14} /> Durdurma Kısıtları (Capping)
                                  </h5>
                                  {vetoReason ? (
                                    <div className="p-4 bg-rose-50 border border-rose-100 rounded-lg text-rose-800 text-sm leading-relaxed">
                                      <strong>KURAL İHLALİ:</strong> Sistem, <strong>"{vetoReason}"</strong> sebebiyle matematiksel puanı geçersiz kılmış ve notu <strong>{grade} ({finalScore.toFixed(2)})</strong> seviyesine sabitlemiştir. (IIA 14.5)
                                    </div>
                                  ) : (
                                    <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-800 text-sm flex items-center gap-3">
                                      <ShieldCheck size={20} className="text-emerald-600" />
                                      Tavan (Capping) veya Veto kuralı tetiklenmemiştir.
                                    </div>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          </td>
                        </tr>
                      )}
                    </AnimatePresence>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {/* Footer Pagination */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-sm text-slate-500">
          <div>Gösterilen: 1-5 / Toplam: 142 Aktif Varlık</div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 border border-slate-300 rounded bg-white hover:bg-slate-50 text-slate-600 font-medium transition-colors disabled:opacity-50" disabled>Önceki</button>
            <button className="px-3 py-1.5 border border-slate-300 rounded bg-white hover:bg-slate-50 text-slate-600 font-medium transition-colors">Sonraki</button>
          </div>
        </div>

      </div>
    </div>
  );
}