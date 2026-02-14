import { useState } from 'react';
import { 
  Save, GitMerge, ShieldAlert, Users, CheckCircle2, 
  ToggleLeft, ToggleRight, Lock, Building, Scale, AlertTriangle, HelpCircle
} from 'lucide-react';
import clsx from 'clsx';

// --- MİMARİ BAĞLANTILAR ---
import { SENTINEL_CONSTITUTION } from '@/shared/config/constitution';
import { GlassCard, EnvironmentBanner, RiskBadge } from '@/shared/ui/GlassCard';

export default function WorkflowSettingsPage() {
  // MOCK STATE (Gerçekte API'den gelir ve Store'a yazılır)
  // Bu state'ler Sentinel Constitution'daki kuralları override eder.
  const [fourEyes, setFourEyes] = useState(true);
  const [autoRiskEscalation, setAutoRiskEscalation] = useState(true);
  const [forceEvidence, setForceEvidence] = useState(true);
  
  // Onay Matrisi State'i
  const [approvalMatrix, setApprovalMatrix] = useState({
    low: 'SENIOR_AUDITOR',
    medium: 'MANAGER',
    high: 'DIRECTOR',
    critical: 'CAE' // Chief Audit Executive
  });

  // Risk Kabul Limitleri
  const [riskLimits, setRiskLimits] = useState({
    operational: 'UNIT_MANAGER', // < 1M TL
    tactical: 'GROUP_HEAD',      // < 10M TL
    strategic: 'BOARD'           // > 10M TL
  });

  return (
    <div className="min-h-screen bg-slate-50 p-8 pb-24 font-sans">
      
      {/* HEADER */}
      <div className="max-w-6xl mx-auto mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-900 text-white rounded-xl shadow-lg">
                <Scale size={28}/>
            </div>
            <div>
                <h1 className="text-2xl font-bold text-slate-900">İş Akışı ve Yetki Parametreleri</h1>
                <p className="text-slate-500 text-sm mt-1">Denetim süreçlerinin onay mekanizmalarını ve risk kabul limitlerini yapılandırın.</p>
            </div>
        </div>
        <EnvironmentBanner environment="DEVELOPMENT" />
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* 1. ONAY HİYERARŞİSİ (Approval Hierarchy) */}
        <GlassCard className="p-8" neonGlow="blue">
            <div className="flex items-center gap-4 mb-6 border-b border-slate-100 pb-4">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-xl"><GitMerge size={24}/></div>
                <div>
                    <h3 className="font-bold text-slate-800 text-lg">Onay Zinciri Kuralları</h3>
                    <p className="text-xs text-slate-500">Bulguların kapanış onay mekanizması</p>
                </div>
            </div>
            
            <div className="space-y-6">
                {/* 4 Göz Prensibi */}
                <div className="flex justify-between items-center p-4 bg-white/50 rounded-xl border border-slate-200 shadow-sm transition-all hover:border-blue-300">
                    <div className="flex gap-3">
                        <Users className="text-blue-500 mt-1" size={20}/>
                        <div>
                            <span className="block text-sm font-bold text-slate-800">4 Göz Prensibi (Four Eyes)</span>
                            <p className="text-xs text-slate-500 leading-snug max-w-[250px]">
                                Hazırlayan ve Onaylayan kişi aynı olamaz. Sistem bunu zorunlu kılar.
                            </p>
                        </div>
                    </div>
                    <button onClick={() => setFourEyes(!fourEyes)} className={clsx("transition-all duration-300 text-3xl", fourEyes ? "text-emerald-500" : "text-slate-300")}>
                        {fourEyes ? <ToggleRight size={48}/> : <ToggleLeft size={48}/>}
                    </button>
                </div>

                {/* Risk Bazlı Onay Matrisi */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Risk Bazlı Onay Matrisi</label>
                        <HelpCircle size={14} className="text-slate-400 cursor-help" title="Bulgunun risk seviyesine göre en az kimin onayı gerektiği."/>
                    </div>
                    
                    {/* Düşük Risk */}
                    <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg group hover:border-emerald-300 transition-colors">
                        <div className="flex items-center gap-3">
                            <RiskBadge score={3} showLabel={true} />
                            <span className="text-xs text-slate-400 font-mono">(1-4 Puan)</span>
                        </div>
                        <select 
                            value={approvalMatrix.low}
                            onChange={(e) => setApprovalMatrix({...approvalMatrix, low: e.target.value})}
                            className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 rounded-lg py-2 px-3 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        >
                            <option value="SENIOR_AUDITOR">Kıdemli Denetçi</option>
                            <option value="MANAGER">Yönetici (Manager)</option>
                        </select>
                    </div>

                    {/* Orta Risk */}
                    <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg group hover:border-yellow-300 transition-colors">
                        <div className="flex items-center gap-3">
                            <RiskBadge score={7} showLabel={true} />
                            <span className="text-xs text-slate-400 font-mono">(5-9 Puan)</span>
                        </div>
                        <select 
                            value={approvalMatrix.medium}
                            onChange={(e) => setApprovalMatrix({...approvalMatrix, medium: e.target.value})}
                            className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 rounded-lg py-2 px-3 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        >
                            <option value="SENIOR_AUDITOR">Kıdemli Denetçi</option>
                            <option value="MANAGER">Yönetici (Manager)</option>
                        </select>
                    </div>

                    {/* Yüksek Risk */}
                    <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg group hover:border-orange-300 transition-colors">
                        <div className="flex items-center gap-3">
                            <RiskBadge score={12} showLabel={true} />
                            <span className="text-xs text-slate-400 font-mono">(10-15 Puan)</span>
                        </div>
                        <select 
                            value={approvalMatrix.high}
                            onChange={(e) => setApprovalMatrix({...approvalMatrix, high: e.target.value})}
                            className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 rounded-lg py-2 px-3 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        >
                            <option value="MANAGER">Yönetici (Manager)</option>
                            <option value="DIRECTOR">Direktör / SVP</option>
                        </select>
                    </div>

                    {/* Kritik Risk */}
                    <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg shadow-sm">
                        <div className="flex items-center gap-3">
                            <RiskBadge score={20} showLabel={true} />
                            <span className="text-xs text-red-400 font-mono font-bold">(16-25 Puan)</span>
                        </div>
                        <select 
                            value={approvalMatrix.critical}
                            onChange={(e) => setApprovalMatrix({...approvalMatrix, critical: e.target.value})}
                            className="bg-white border border-red-200 text-xs font-bold text-red-700 rounded-lg py-2 px-3 outline-none focus:ring-2 focus:ring-red-500 cursor-pointer"
                        >
                            <option value="DIRECTOR">Direktör / SVP</option>
                            <option value="CAE">Başdenetçi (CAE)</option>
                            <option value="AUDIT_COMMITTEE">Denetim Komitesi</option>
                        </select>
                    </div>
                </div>
            </div>
        </GlassCard>

        {/* 2. RİSK KABUL YETKİSİ (Risk Acceptance Authority) */}
        <GlassCard className="p-8" neonGlow="red">
            <div className="flex items-center gap-4 mb-6 border-b border-slate-100 pb-4">
                <div className="p-3 bg-red-100 text-red-600 rounded-xl"><ShieldAlert size={24}/></div>
                <div>
                    <h3 className="font-bold text-slate-800 text-lg">Risk Kabul Yetkisi</h3>
                    <p className="text-xs text-slate-500">Phase 3'teki "Aksiyon Almama" kararını kim onaylar?</p>
                </div>
            </div>

            <div className="space-y-6">
                <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl text-xs text-orange-800 leading-relaxed flex gap-3">
                    <Lock size={32} className="shrink-0 text-orange-600"/>
                    <div>
                        <span className="font-bold block mb-1">GIAS 2024 Prensibi:</span>
                        Yönetim aksiyon almamayı tercih edebilir (Risk Kabulü). Ancak bu karar, potansiyel kayıp tutarına göre belirli makamlarca onaylanmalıdır.
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Genel Ayarlar</label>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-white border border-slate-200 rounded-lg">
                            <span className="text-sm font-bold text-slate-700">Otomatik Eskalasyon</span>
                            <button onClick={() => setAutoRiskEscalation(!autoRiskEscalation)} className={clsx("transition-all duration-300 text-3xl", autoRiskEscalation ? "text-emerald-500" : "text-slate-300")}>
                                {autoRiskEscalation ? <ToggleRight size={40}/> : <ToggleLeft size={40}/>}
                            </button>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-white border border-slate-200 rounded-lg">
                            <span className="text-sm font-bold text-slate-700">Kanıt Yükleme Zorunluluğu</span>
                            <button onClick={() => setForceEvidence(!forceEvidence)} className={clsx("transition-all duration-300 text-3xl", forceEvidence ? "text-emerald-500" : "text-slate-300")}>
                                {forceEvidence ? <ToggleRight size={40}/> : <ToggleLeft size={40}/>}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Mali Limitler ve Yetkililer</label>
                    
                    <div className="grid grid-cols-1 gap-4">
                        {/* Operasyonel */}
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                                    <span className="text-xs text-slate-500 font-bold uppercase">Operasyonel Risk</span>
                                </div>
                                <span className="text-xs font-mono text-slate-400 ml-4">&lt; 1.000.000 ₺</span>
                            </div>
                            <div className="flex items-center gap-2 font-bold text-slate-700 text-sm bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                                <Building size={14} className="text-indigo-500"/> 
                                <select 
                                    className="bg-transparent outline-none cursor-pointer"
                                    value={riskLimits.operational}
                                    onChange={(e) => setRiskLimits({...riskLimits, operational: e.target.value})}
                                >
                                    <option value="UNIT_MANAGER">Birim Müdürü</option>
                                    <option value="GROUP_HEAD">Grup Müdürü</option>
                                </select>
                            </div>
                        </div>

                        {/* Taktik */}
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                                    <span className="text-xs text-slate-500 font-bold uppercase">Taktik Risk</span>
                                </div>
                                <span className="text-xs font-mono text-slate-400 ml-4">&lt; 10.000.000 ₺</span>
                            </div>
                            <div className="flex items-center gap-2 font-bold text-slate-700 text-sm bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                                <Building size={14} className="text-indigo-500"/>
                                <select 
                                    className="bg-transparent outline-none cursor-pointer"
                                    value={riskLimits.tactical}
                                    onChange={(e) => setRiskLimits({...riskLimits, tactical: e.target.value})}
                                >
                                    <option value="GROUP_HEAD">Grup Müdürü</option>
                                    <option value="EVP">Genel Müdür Yrd.</option>
                                </select>
                            </div>
                        </div>

                        {/* Stratejik */}
                        <div className="p-4 bg-slate-900 rounded-xl border border-slate-700 shadow-xl flex items-center justify-between relative overflow-hidden">
                            {/* Arka plan efekti */}
                            <div className="absolute -right-4 -top-4 w-20 h-20 bg-red-600 rounded-full blur-2xl opacity-20 pointer-events-none"></div>
                            
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-1">
                                    <AlertTriangle size={14} className="text-red-500"/>
                                    <span className="text-xs text-slate-300 font-bold uppercase">Stratejik / Kritik Risk</span>
                                </div>
                                <span className="text-xs font-mono text-slate-500 ml-6">&gt; 10.000.000 ₺</span>
                            </div>
                            <div className="relative z-10 flex items-center gap-2 font-bold text-white text-sm bg-white/10 px-4 py-2 rounded-lg border border-white/10 backdrop-blur-md">
                                <Building size={14} className="text-red-400"/>
                                <select 
                                    className="bg-transparent outline-none cursor-pointer text-white option:text-black"
                                    value={riskLimits.strategic}
                                    onChange={(e) => setRiskLimits({...riskLimits, strategic: e.target.value})}
                                >
                                    <option value="BOARD">Yönetim Kurulu</option>
                                    <option value="AUDIT_COMMITTEE">Denetim Komitesi</option>
                                    <option value="CEO">Genel Müdür (CEO)</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </GlassCard>

      </div>
      
      {/* Footer Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-200 p-4 z-50">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
              <div className="text-xs text-slate-500 font-mono">
                  Son Güncelleme: Ahmet Yılmaz (Başdenetçi) • 12.02.2026 14:30
              </div>
              <div className="flex gap-4">
                  <button className="px-6 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-lg transition-colors text-sm">
                      Varsayılanlara Dön
                  </button>
                  <button className="px-8 py-2.5 bg-slate-900 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 shadow-lg shadow-slate-300 transition-all active:scale-95 text-sm">
                      <Save size={18}/> Ayarları Kaydet ve Yayınla
                  </button>
              </div>
          </div>
      </div>

    </div>
  );
}