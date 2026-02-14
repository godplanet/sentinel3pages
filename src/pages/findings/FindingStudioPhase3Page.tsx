import { useState, useEffect } from 'react';
import { 
  FileText, AlertCircle, Plus, Save, 
  Scale, Users, CheckCircle2, XCircle, AlertOctagon 
} from 'lucide-react';
import clsx from 'clsx';

// --- MİMARİ BAĞLANTILAR ---
import { mockComprehensiveFindings } from '@/entities/finding/api/mock-comprehensive-data';
import type { ComprehensiveFinding, ActionPlan } from '@/entities/finding/model/types';
import { useParameterStore } from '@/shared/stores/parameter-store';

// --- BİLEŞENLER ---
import { GlassCard, RiskBadge } from '@/shared/ui/GlassCard'; // ZENGİN BİLEŞEN
import { FileUploader } from '@/shared/ui/FileUploader';
import { WorkflowStepper } from '@/widgets/FindingStudio/WorkflowStepper';
import { FindingSignOff } from '@/features/finding-studio/components/FindingSignOff';

interface Phase3Props {
  findingId: string;
  onNextPhase: () => void;
}

export default function FindingStudioPhase3Page({ findingId, onNextPhase }: Phase3Props) {
  const [finding, setFinding] = useState<ComprehensiveFinding | null>(null);
  const [actionPlans, setActionPlans] = useState<ActionPlan[]>([]);
  
  // Risk Kabul State'i
  const [riskAcceptanceMode, setRiskAcceptanceMode] = useState<Record<string, boolean>>({});
  const [riskJustification, setRiskJustification] = useState<Record<string, string>>({});

  useEffect(() => {
    const found = mockComprehensiveFindings.find(f => f.id === findingId);
    if (found) {
        setFinding(found);
        setActionPlans(found.action_plans as unknown as ActionPlan[] || []);
    }
  }, [findingId]);

  const toggleAgreement = (planId: string, isAgreed: boolean) => {
    setRiskAcceptanceMode(prev => ({ ...prev, [planId]: !isAgreed }));
  };

  if (!finding) return <div>Yükleniyor...</div>;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
      
      {/* Banner */}
      <GlassCard className="!bg-gradient-to-r from-indigo-600 to-purple-600 !border-0 text-white" neonGlow="blue">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm"><AlertCircle className="w-8 h-8" /></div>
            <div>
                <div className="font-bold text-xl mb-1">Mutabakat Aşaması Aktif</div>
                <div className="text-indigo-100 leading-relaxed text-sm">
                    Bu bulgu için denetlenen birim (Auditee) ile mutabakat süreci devam etmektedir. 
                    Her aksiyon için ya <strong>Mutabakat</strong> sağlanmalı ya da <strong>Risk Kabulü (İtiraz)</strong> süreci işletilmelidir.
                </div>
            </div>
          </div>
      </GlassCard>

      <div className="grid grid-cols-12 gap-8">
        
        {/* SOL: AKSİYONLAR */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          {actionPlans.map((plan) => (
            <GlassCard 
                key={plan.id} 
                className="p-8" 
                neonGlow={riskAcceptanceMode[plan.id] ? 'red' : 'none'} // Risk kabulünde kırmızı parlar
            >
                
                {/* 1. Başlık ve Risk Rozeti */}
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Aksiyon Planı</span>
                        <h3 className="text-lg font-bold text-slate-800 mt-1">{plan.title}</h3>
                    </div>
                    {riskAcceptanceMode[plan.id] ? (
                        <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm border border-red-200">
                            <AlertOctagon size={12}/> Risk Kabul Gerektirir
                        </span>
                    ) : (
                        <RiskBadge score={finding.impact_score || 5} showLabel={true} />
                    )}
                </div>

                {/* 2. Mutabakat Durumu Toggle */}
                <div className="bg-slate-50 p-1.5 rounded-xl flex mb-6 border border-slate-200 shadow-inner">
                    <button 
                        onClick={() => toggleAgreement(plan.id, true)}
                        className={clsx(
                            "flex-1 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all",
                            !riskAcceptanceMode[plan.id] 
                                ? "bg-white text-emerald-600 shadow-md ring-1 ring-black/5 scale-100" 
                                : "text-slate-500 hover:bg-slate-100 scale-95 opacity-70"
                        )}
                    >
                        <CheckCircle2 size={16}/> Mutabıkım
                    </button>
                    <button 
                        onClick={() => toggleAgreement(plan.id, false)}
                        className={clsx(
                            "flex-1 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all",
                            riskAcceptanceMode[plan.id] 
                                ? "bg-red-600 text-white shadow-md scale-100" 
                                : "text-slate-500 hover:bg-slate-100 scale-95 opacity-70"
                        )}
                    >
                        <XCircle size={16}/> Mutabık Değilim
                    </button>
                </div>

                {/* 3. İçerik Alanı */}
                <div className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Aksiyon Açıklaması</label>
                        <textarea 
                            className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                            rows={3}
                            defaultValue={plan.description}
                            disabled={riskAcceptanceMode[plan.id]}
                        />
                    </div>

                    {/* --- RİSK KABUL FORMU (Görseldeki Tasarım) --- */}
                    {riskAcceptanceMode[plan.id] && (
                        <div className="border border-red-200 bg-red-50/30 rounded-xl p-6 animate-in fade-in slide-in-from-top-4 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                            <div className="flex items-center gap-2 mb-4 text-red-800 font-bold text-sm">
                                <AlertOctagon size={18}/> RISK KABUL / İTİRAZ FORMU
                            </div>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-red-700 mb-2">İtiraz Gerekçesi (Min. 50 Karakter)</label>
                                    <textarea 
                                        className="w-full bg-white border border-red-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-red-500 outline-none text-slate-700 placeholder:text-red-300 shadow-sm"
                                        rows={3}
                                        placeholder="Neden bu aksiyon planını kabul etmiyorsunuz? Detaylı açıklayın..."
                                        onChange={(e) => setRiskJustification({...riskJustification, [plan.id]: e.target.value})}
                                    />
                                </div>

                                <div className="flex items-start gap-3 p-3 bg-white/60 rounded-lg border border-red-100">
                                    <input type="checkbox" className="mt-1 w-4 h-4 text-red-600 rounded focus:ring-red-500 cursor-pointer" />
                                    <p className="text-xs text-red-900/80 leading-snug">
                                        <span className="font-bold">Risk Kabulü Onayı:</span> Bu aksiyonun uygulanmamasından kaynaklanabilecek tüm risklerin ve olası sonuçların sorumluluğunu üstleniyorum.
                                    </p>
                                </div>

                                <FileUploader label="Kanıt / Belge (Zorunlu)" />
                            </div>
                        </div>
                    )}

                    {/* Normal Aksiyon Detayları */}
                    {!riskAcceptanceMode[plan.id] && (
                        <div className="grid grid-cols-2 gap-6 animate-in fade-in">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Sorumlu Kişi</label>
                                <select className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none">
                                    <option>Seçiniz...</option>
                                    <option>Mehmet Kara (Şube Müdürü)</option>
                                    <option>Ayşe Demir (Operasyon)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Termin Tarihi</label>
                                <input type="date" className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none" defaultValue={plan.target_date} />
                            </div>
                            
                            <div className="col-span-2">
                                <FileUploader label="Destekleyici Dokümanlar (Opsiyonel)" />
                            </div>
                        </div>
                    )}
                </div>

            </GlassCard>
          ))}

          {/* İMZA VE ONAY */}
          <div className="flex justify-end pt-6">
              <button 
                  onClick={onNextPhase}
                  className="px-8 py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 shadow-xl shadow-slate-200 flex items-center gap-3 transition-transform active:scale-95"
              >
                  <CheckCircle2 size={20} /> 
                  {Object.values(riskAcceptanceMode).some(v => v) ? 'Risk Kabulünü Onaya Gönder' : 'Mutabakatı Tamamla ve İmzala'}
              </button>
          </div>
        </div>

        {/* SAĞ PANEL: BİLGİ */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
           <GlassCard className="p-6 sticky top-24" neonGlow="none">
               <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                   <Users size={18} className="text-indigo-600"/> Onay Zinciri
               </h3>
               
               <div className="space-y-4 relative">
                   {/* Dikey Çizgi */}
                   <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-slate-200 -z-10"></div>

                   <div className="flex gap-4 items-center">
                       <div className="w-10 h-10 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">1</div>
                       <div className="flex-1 p-3 bg-slate-50 rounded-lg border border-slate-100">
                           <div className="text-xs text-slate-400 font-bold uppercase mb-1">Hazırlayan</div>
                           <div className="text-sm font-bold text-slate-700">Ahmet Yılmaz</div>
                       </div>
                   </div>

                   <div className="flex gap-4 items-center">
                       <div className="w-10 h-10 rounded-full bg-indigo-100 border-2 border-indigo-200 flex items-center justify-center text-xs font-bold text-indigo-600 ring-4 ring-indigo-50">2</div>
                       <div className="flex-1 p-3 bg-white rounded-lg border border-indigo-200 shadow-sm">
                           <div className="text-xs text-indigo-500 font-bold uppercase mb-1">Mevcut Aşama</div>
                           <div className="text-sm font-bold text-indigo-900">Şube Müdürü Onayı</div>
                       </div>
                   </div>

                   <div className="flex gap-4 items-center">
                       <div className="w-10 h-10 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center text-xs font-bold text-slate-400">3</div>
                       <div className="flex-1 p-3 bg-slate-50 rounded-lg border border-slate-100 opacity-60">
                           <div className="text-xs text-slate-400 font-bold uppercase mb-1">Nihai Onay</div>
                           <div className="text-sm font-bold text-slate-700">İç Denetim Başkanı</div>
                       </div>
                   </div>
               </div>
           </GlassCard>
        </div>

      </div>
    </div>
  );
}