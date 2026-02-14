import { useState } from 'react';
import { 
  Save, GitMerge, ShieldAlert, Users, CheckCircle2, 
  ToggleLeft, ToggleRight, Lock, Building 
} from 'lucide-react';
import clsx from 'clsx';

// --- UI BİLEŞENLERİ ---
import { GlassCard, EnvironmentBanner } from '@/shared/ui/GlassCard';

export default function WorkflowSettingsPage() {
  // Mock State (Gerçekte API'den gelir ve Store'a yazılır)
  const [fourEyes, setFourEyes] = useState(true);
  const [autoRiskEscalation, setAutoRiskEscalation] = useState(true);
  const [riskAcceptanceThreshold, setRiskAcceptanceThreshold] = useState('HIGH');

  return (
    <div className="min-h-screen bg-slate-50 p-8 pb-24 font-sans">
      
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8 flex items-center justify-between">
        <div>
            <h1 className="text-2xl font-bold text-slate-900">İş Akışı ve Yetki Parametreleri</h1>
            <p className="text-slate-500 text-sm mt-1">Denetim süreçlerinin onay mekanizmalarını ve risk kabul limitlerini yapılandırın.</p>
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
                <div className="flex justify-between items-center p-4 bg-white/50 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex gap-3">
                        <Users className="text-slate-400 mt-1" size={20}/>
                        <div>
                            <span className="block text-sm font-bold text-slate-800">4 Göz Prensibi (Four Eyes)</span>
                            <p className="text-xs text-slate-500 leading-snug max-w-[250px]">
                                Hazırlayan ve Onaylayan kişi aynı olamaz. Sistem bunu zorunlu kılar.
                            </p>
                        </div>
                    </div>
                    <button onClick={() => setFourEyes(!fourEyes)} className={clsx("transition-all duration-300 text-3xl", fourEyes ? "text-emerald-500" : "text-slate-300")}>
                        {fourEyes ? <ToggleRight size={40}/> : <ToggleLeft size={40}/>}
                    </button>
                </div>

                {/* Risk Bazlı Onay */}
                <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Risk Bazlı Onay Matrisi</label>
                    
                    <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg">
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                            <span className="text-sm font-bold text-slate-700">Düşük / Orta Risk</span>
                        </div>
                        <select className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 rounded-lg py-2 px-3 outline-none focus:ring-2 focus:ring-blue-500">
                            <option>Kıdemli Denetçi</option>
                            <option>Yönetici (Manager)</option>
                        </select>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg">
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-orange-500"></span>
                            <span className="text-sm font-bold text-slate-700">Yüksek Risk</span>
                        </div>
                        <select className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 rounded-lg py-2 px-3 outline-none focus:ring-2 focus:ring-blue-500">
                            <option>Yönetici (Manager)</option>
                            <option>Direktör</option>
                        </select>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-red-600 animate-pulse"></span>
                            <span className="text-sm font-bold text-red-900">Kritik Risk</span>
                        </div>
                        <select className="bg-white border border-red-200 text-xs font-bold text-red-700 rounded-lg py-2 px-3 outline-none focus:ring-2 focus:ring-red-500">
                            <option>Başdenetçi (CAE)</option>
                            <option>Denetim Komitesi</option>
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
                    <Lock size={32} className="shrink-0"/>
                    GIAS Standartlarına göre; yönetim aksiyon almamayı tercih edebilir (Risk Kabulü). Ancak bu karar, risk seviyesine göre belirli makamlarca onaylanmalıdır.
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Otomatik Eskalasyon</label>
                    <div className="flex justify-between items-center p-3 bg-white border border-slate-200 rounded-lg">
                        <span className="text-sm font-bold text-slate-700">Risk Kabulü Taleplerini Üst Yönetime İlet</span>
                        <button onClick={() => setAutoRiskEscalation(!autoRiskEscalation)} className={clsx("transition-all duration-300 text-3xl", autoRiskEscalation ? "text-emerald-500" : "text-slate-300")}>
                            {autoRiskEscalation ? <ToggleRight size={40}/> : <ToggleLeft size={40}/>}
                        </button>
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Limitler ve Yetkililer</label>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                            <span className="block text-xs text-slate-400 mb-1">Operasyonel Risk (< 1M ₺)</span>
                            <div className="flex items-center gap-2 font-bold text-slate-700 text-sm">
                                <Building size={14}/> Birim Müdürü
                            </div>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                            <span className="block text-xs text-slate-400 mb-1">Taktik Risk (< 10M ₺)</span>
                            <div className="flex items-center gap-2 font-bold text-slate-700 text-sm">
                                <Building size={14}/> GMY / Grup Md.
                            </div>
                        </div>
                        <div className="col-span-2 p-3 bg-slate-900 rounded-lg border border-slate-700 shadow-lg">
                            <span className="block text-xs text-slate-400 mb-1">Stratejik / Kritik Risk (> 10M ₺)</span>
                            <div className="flex items-center gap-2 font-bold text-white text-sm">
                                <Building size={14}/> Yönetim Kurulu
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </GlassCard>

      </div>
      
      {/* Footer Action */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-slate-200 p-4 z-50">
          <div className="max-w-6xl mx-auto flex justify-end">
              <button className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-95">
                  <Save size={18}/> Değişiklikleri Kaydet
              </button>
          </div>
      </div>

    </div>
  );
}