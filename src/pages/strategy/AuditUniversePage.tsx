import React, { useState, useMemo } from 'react';
import { 
  Building2, Scale, ShieldAlert, Activity, 
  Search, Filter, Plus, ChevronRight, BrainCircuit, Info, Download,
  Server, ShieldCheck, Flame, Lock, TrendingDown, CheckCircle2,
  AlertTriangle
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
  path: string; 
  weight: number; 
  findings: { bordo: number; kizil: number; turuncu: number; sari: number; gozlem: number; shariah_systemic: number };
  lastAudit: string;
}

// --- MOCK VERİLER (Blueprint Senaryoları Birebir Uygulandı) ---
const MOCK_UNIVERSE: AuditEntity[] = [
  {
    id: 'hq-1', name: 'Hazine ve Fon Yönetimi', type: 'GM - Hazine / Krediler', path: 'sentinel.hq.treasury', weight: 10.0,
    findings: { bordo: 0, kizil: 0, turuncu: 1, sari: 2, gozlem: 0, shariah_systemic: 1 }, lastAudit: '2025-11-10' // Şer'i İhlal -> F!
  },
  {
    id: 'it-1', name: 'Bilgi Teknolojileri ve Siber Güvenlik', type: 'GM - BT / Dijital', path: 'sentinel.hq.it', weight: 8.0,
    findings: { bordo: 0, kizil: 4, turuncu: 5, sari: 10, gozlem: 2, shariah_systemic: 0 }, lastAudit: '2025-08-20' // >3 Kızıl -> Hacim Tavanı (C)
  },
  {
    id: 'br-101', name: 'Kadıköy Ticari Şubesi', type: 'Ticari Şubeler (Mega)', path: 'sentinel.branches.kadikoy', weight: 2.0,
    findings: { bordo: 1, kizil: 0, turuncu: 0, sari: 1, gozlem: 5, shariah_systemic: 0 }, lastAudit: '2025-12-01' // 1 Bordo -> Kritik Tavanı (D)
  },
  {
    id: 'br-102', name: 'Ümraniye Perakende Şubesi', type: 'Perakende Şubeler', path: 'sentinel.branches.umraniye', weight: 1.0,
    findings: { bordo: 0, kizil: 0, turuncu: 0, sari: 1, gozlem: 3, shariah_systemic: 0 }, lastAudit: '2024-05-10' // Kusursuz -> A+
  },
  {
    id: 'reg-1', name: 'Marmara Bölge Müdürlüğü', type: 'Bölge Müdürlükleri', path: 'sentinel.regions.marmara', weight: 3.0,
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
  let grade = 'F'; let opinion = 'Güvence Yok'; let color = 'bg-slate-100'; let freq = '6-9 Ay';
  
  if (finalScore >= 95) { grade = 'A+'; opinion = 'Tam Güvence'; color = 'bg-blue-100 text-blue-800 border-blue-200'; freq = '48 Ay'; }
  else if (finalScore >= 85) { grade = 'A'; opinion = 'Yüksek Güvence'; color = 'bg-emerald-100 text-emerald-800 border-emerald-200'; freq = '36 Ay'; }
  else if (finalScore >= 70) { grade = 'B'; opinion = 'Makul Güvence'; color = 'bg-yellow-100 text-yellow-800 border-yellow-200'; freq = '24 Ay'; }
  else if (finalScore >= 60) { grade = 'C'; opinion = 'Sınırlı Güvence'; color = 'bg-orange-100 text-orange-800 border-orange-200'; freq = '18 Ay'; }
  else if (finalScore >= 50) { grade = 'D'; opinion = 'Zayıf / Gelişim Gerekir'; color = 'bg-red-100 text-red-800 border-red-200'; freq = '12 Ay'; }
  else { grade = 'F'; opinion = 'Güvence Yok'; color = 'bg-fuchsia-100 text-fuchsia-900 border-fuchsia-200'; freq = 'Sürekli İzleme'; }

  if (finalScore === 0 && vetoReason?.includes("Şer'i")) {
    opinion = 'Batıl (Geçersiz)';
    color = 'bg-fuchsia-900 text-fuchsia-100 border-fuchsia-950';
  }

  return { rawScore, finalScore, vetoReason, grade, opinion, color, freq };
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
    else if (score >= 50) { grade = 'D'; opinion = 'Zayıf / Gelişim Gerekir'; }

    return { rwaScore: score.toFixed(2), rwaGrade: grade, rwaOpinion: opinion, totalWeight: weightTotal, cappedCount: caps };
  }, []);

  return (
    <div className="w-full max-w-full px-6 py-8 space-y-6 bg-slate-50 min-h-screen font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeader
          title="Denetim Evreni (Audit Universe)"
          description="KERD-2026 Çerçevesi & IIA 2024: Kısıt Bazlı Kesinti Modeli ve RWA Konsolidasyonu"
          icon={Building2}
        />
        <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium shadow-sm">
          <Plus size={18} /> Yeni Varlık Ekle
        </button>
      </div>

      {/* --- 1. VİTRİN: HİBRİT TASARIM (KONSOLİDE GÖRÜNÜM) --- */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 xl:grid-cols-3 gap-6"
      >
        {/* RWA Scorecard */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 shadow-md border border-slate-700 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute -right-6 -top-6 text-white/5"><Scale size={160} /></div>
          <div className="relative z-10">
            <h2 className="text-slate-300 text-xs font-bold uppercase tracking-widest mb-1 flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-400"/> Banka Geneli Güvence
            </h2>
            <p className="text-slate-500 text-xs font-medium">Risk Ağırlıklı Ortalama (RWA)</p>
          </div>
          <div className="mt-6 flex items-end gap-4 relative z-10">
            <div className="text-6xl font-black text-white tracking-tighter">{rwaScore}</div>
            <div className="mb-2">
              <div className={clsx("inline-flex px-2.5 py-0.5 rounded text-sm font-bold border", 
                Number(rwaScore) < 50 ? 'bg-fuchsia-900/50 text-fuchsia-300 border-fuchsia-800' : 
                Number(rwaScore) < 70 ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : 
                'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
              )}>
                {rwaGrade}
              </div>
              <div className="text-sm text-slate-300 mt-1 font-medium">{rwaOpinion}</div>
            </div>
          </div>
        </div>

        {/* Sentinel AI Yorumu */}
        <div className="xl:col-span-2 bg-gradient-to-br from-indigo-950 to-slate-900 rounded-xl p-6 shadow-md border border-indigo-900/50 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-indigo-500 rounded-full opacity-10 blur-3xl pointer-events-none"></div>
          
          <div className="flex items-start gap-4 relative z-10">
            <div className="p-3 bg-indigo-500/20 rounded-xl border border-indigo-500/30 shrink-0">
              <BrainCircuit className="w-6 h-6 text-indigo-300" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-indigo-200 font-bold flex items-center gap-2">
                  Sentinel AI Stratejik Gözlem
                  {Number(rwaScore) < 60 && (
                    <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 text-[10px] rounded-full border border-rose-500/30 uppercase tracking-wide animate-pulse">
                      Sistemik Risk Uyarısı
                    </span>
                  )}
                </h3>
                <div className="text-xs text-indigo-300/70 font-mono flex items-center gap-2">
                  <span>Aktif Veto: {cappedCount}</span>
                  <span>|</span>
                  <span>Toplam Ağırlık: {totalWeight.toFixed(1)}</span>
                </div>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">
                Aritmetik ortalamalar yanıltıcıdır. Şubeler genelinde operasyonel başarı <strong>(Örn: Ümraniye - A+)</strong> gözlemlenmesine rağmen, <strong>Hazine Bölümü (Risk Ağırlığı: 10.0)</strong> tarafındaki <em>Şer'i İhlal Vetosu</em> ve <strong>IT Bölümündeki</strong> <em>Yüksek Hacim Tavanı</em>, Banka Genel RWA Puanını <strong className="text-rose-400">{rwaScore} ({rwaOpinion})</strong> seviyesine çekmiştir. Yönetim Kurulu'na acil durum raporlaması (Flash Report) oluşturulması tavsiye edilir.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* BİLGİ BANDI */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start gap-3 shadow-sm">
        <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-blue-900 leading-relaxed">
          <strong>Kısıt Bazlı Kesinti Modeli (IIA Std 14.5):</strong> Doğrusal puanlama reddedilmiştir. Bir varlığın ham puanı yüksek olsa dahi, <em>Kritik Bulgu Varlığı</em> (Max D), <em>Yüksek Hacim</em> (Max C) veya <em>Şer'i İhlal</em> (Sıfırlama) gibi kurallar Nihai Notu ezer. <strong>Mükemmellik, her katmanda tutarlılık gerektirir.</strong>
        </div>
      </div>

      {/* --- 2. MUTFAK: KURUMSAL NETLİK (ENTERPRISE CLEAN DATA GRID) --- */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Varlık adı veya yoluna göre filtrele (örn: hq.treasury)..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 text-slate-600 rounded-md text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm">
              <Filter size={16} /> Detaylı Filtre
            </button>
            <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 text-slate-600 rounded-md text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm">
              <Download size={16} /> Excel Dışa Aktar
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Birim / Varlık (LTree Path)</th>
                <th className="px-6 py-4 text-center">Risk Ağırlığı</th>
                <th className="px-6 py-4 text-center">Ham Puan</th>
                <th className="px-6 py-4">Durdurma (Veto) Kısıtı</th>
                <th className="px-6 py-4 text-center">Nihai Not</th>
                <th className="px-6 py-4">Güvence Görüşü (IIA)</th>
                <th className="px-6 py-4 text-center" title="Bordo/Kızıl/Turuncu/Sarı">Bulgu Dağılımı</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {MOCK_UNIVERSE.filter(e => e.name.toLowerCase().includes(searchTerm.toLowerCase()) || e.path.toLowerCase().includes(searchTerm.toLowerCase())).map((entity) => {
                const { rawScore, finalScore, vetoReason, grade, opinion, color, freq } = calculateGrade(entity);
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
                            vetoReason.includes("Şer'i") ? "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200" :
                            vetoReason.includes("Kritik") ? "bg-red-50 text-red-700 border-red-200" :
                            "bg-orange-50 text-orange-700 border-orange-200"
                          )}>
                            {vetoReason.includes("Şer'i") ? <Flame size={12} className="animate-pulse" /> : 
                             vetoReason.includes("Kritik") ? <AlertTriangle size={12} /> : <TrendingDown size={12} />}
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
                          <span className={clsx("font-bold", vetoReason?.includes("Şer'i") ? "text-fuchsia-700" : "text-slate-800")}>
                            {opinion}
                          </span>
                          <span className="text-[11px] text-slate-500 mt-0.5">Denetim Sıklığı: {freq}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1 font-mono text-[11px]">
                          <span className={clsx("w-5 h-5 flex items-center justify-center rounded font-bold border", entity.findings.bordo > 0 ? "bg-fuchsia-950 text-white border-fuchsia-900" : "bg-slate-50 text-slate-300 border-slate-200")} title="Bordo (Kritik)">{entity.findings.bordo}</span>
                          <span className={clsx("w-5 h-5 flex items-center justify-center rounded font-bold border", entity.findings.kizil > 0 ? "bg-red-600 text-white border-red-700" : "bg-slate-50 text-slate-300 border-slate-200")} title="Kızıl (Yüksek)">{entity.findings.kizil}</span>
                          <span className={clsx("w-5 h-5 flex items-center justify-center rounded font-bold border", entity.findings.turuncu > 0 ? "bg-orange-500 text-white border-orange-600" : "bg-slate-50 text-slate-300 border-slate-200")} title="Turuncu (Orta)">{entity.findings.turuncu}</span>
                          <span className={clsx("w-5 h-5 flex items-center justify-center rounded font-bold border", entity.findings.sari > 0 ? "bg-yellow-400 text-slate-900 border-yellow-500" : "bg-slate-50 text-slate-300 border-slate-200")} title="Sarı (Düşük)">{entity.findings.sari}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-slate-400 group-hover:text-blue-600 transition-colors p-1 hover:bg-blue-100 rounded">
                          <ChevronRight size={18} className={clsx("transition-transform", selectedEntity?.id === entity.id ? "rotate-90" : "")} />
                        </button>
                      </td>
                    </tr>
                    
                    {/* Detay Paneli (Satır İçi Drawer) */}
                    <AnimatePresence>
                      {selectedEntity?.id === entity.id && (
                        <tr className="bg-slate-50/80 border-b border-slate-200">
                          <td colSpan={8} className="p-0">
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }} 
                              animate={{ height: 'auto', opacity: 1 }} 
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 border-t border-slate-200 shadow-inner">
                                <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
                                  <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Activity size={14} className="text-blue-500"/> Kesinti Matematiği (Deduction Model)
                                  </h5>
                                  <div className="space-y-3 font-mono text-sm text-slate-700">
                                    <div className="flex justify-between border-b border-slate-100 pb-2">
                                      <span className="text-slate-500">Başlangıç Puanı:</span>
                                      <span className="font-medium">100.00</span>
                                    </div>
                                    <div className="flex justify-between text-rose-600 border-b border-slate-100 pb-2">
                                      <span>Bulgu Kesintileri (Toplam):</span>
                                      <span>-{(100 - rawScore).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between font-bold pt-1 text-slate-900">
                                      <span>Ham Matematiksel Sonuç:</span>
                                      <span>{rawScore.toFixed(2)}</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm flex flex-col justify-center">
                                  <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Lock size={14} className="text-slate-500"/> Tavan & Veto Kararı (Capping Logic)
                                  </h5>
                                  {vetoReason ? (
                                    <div className={clsx("p-4 border rounded-lg text-sm leading-relaxed", 
                                      vetoReason.includes("Şer'i") ? "bg-fuchsia-50 border-fuchsia-200 text-fuchsia-900" :
                                      vetoReason.includes("Kritik") ? "bg-red-50 border-red-200 text-red-900" :
                                      "bg-orange-50 border-orange-200 text-orange-900"
                                    )}>
                                      <strong>KURAL İHLALİ TESPİT EDİLDİ:</strong> Sentinel algoritması, <strong>"{vetoReason}"</strong> sebebiyle {rawScore.toFixed(2)} olan matematiksel puanı geçersiz kılmış ve Nihai Notu <strong>{grade} ({finalScore.toFixed(2)})</strong> seviyesine zorunlu olarak sabitlemiştir. (IIA Std 14.5 uyarınca)
                                    </div>
                                  ) : (
                                    <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-800 text-sm flex items-center gap-3">
                                      <ShieldCheck size={24} className="text-emerald-600 flex-shrink-0" />
                                      <div>
                                        <strong>Kısıt Yok.</strong><br/>
                                        Herhangi bir Tavan (Capping) veya Veto kuralı tetiklenmemiştir. Ham puan onaylanmıştır.
                                      </div>
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
      </div>
    </div>
  );
}