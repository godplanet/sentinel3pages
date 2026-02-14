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
import { GlassCard } from '@/shared/ui/GlassCard'; // LİKİT TASARIM
import { FileUploader } from '@/shared/ui/FileUploader'; // DOSYA YÜKLEME
import { WorkflowStepper } from '@/widgets/FindingStudio/WorkflowStepper';
import { FindingSignOff } from '@/features/finding-studio/components/FindingSignOff';

interface Phase3Props {
  findingId: string;
  onNextPhase: () => void;
}

export default function FindingStudioPhase3Page({ findingId, onNextPhase }: Phase3Props) {
  const [finding, setFinding] = useState<ComprehensiveFinding | null>(null);
  const [actionPlans, setActionPlans] = useState<ActionPlan[]>([]);
  
  // Risk Kabul State'i (Screenshot'taki mantık)
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
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl px-8 py-6 shadow-xl flex items-start gap-4">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm"><AlertCircle className="w-8 h-8" /></div>
          <div>
              <div className="font-bold text-xl mb-1">Mutabakat Aşaması Aktif</div>
              <div className="text-indigo-100 leading-relaxed text-sm">
                  Bu bulgu için denetlenen birim (Auditee) ile mutabakat süreci devam etmektedir. 
                  Her aksiyon için ya <strong>Mutabakat</strong> sağlanmalı ya da <strong>Risk Kabulü (İtiraz)</strong> süreci işletilmelidir.
              </div>
          </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        
        {/* SOL: AKSİYONLAR */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          {actionPlans.map((plan) => (
            <GlassCard key={plan.id} className="p-8">
                
                {/* 1. Başlık ve Toggle */}
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Aksiyon Planı</span>
                        <h3 className="text-lg font-bold text-slate-800 mt-1">{plan.title}</h3>
                    </div>
                    {riskAcceptanceMode[plan.id] && (
                        <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                            <AlertOctagon size={12}/> Risk Kabul Gerektirir
                        </span>
                    )}
                </div>

                {/* 2. Mutabakat Durumu (SCREENSHOT'taki Toggle) */}
                <div className="bg-slate-50 p-1.5 rounded-xl flex mb-6 border border-slate-200">
                    <button 
                        onClick={() => toggleAgreement(plan.id, true)}
                        className={clsx(
                            "flex-1 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all",
                            !riskAcceptanceMode[plan.id] 
                                ? "bg-white text-emerald-600 shadow-md ring-1 ring-black/5" 
                                : "text-slate-500 hover:bg-slate-100"
                        )}
                    >
                        <CheckCircle2 size={16}/> Mutabıkım
                    </button>
                    <button 
                        onClick={() => toggleAgreement(plan.id, false)}
                        className={clsx(
                            "flex-1 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all",
                            riskAcceptanceMode[plan.id] 
                                ? "bg-red-600 text-white shadow-md" 
                                : "text-slate-500 hover:bg-slate-100"
                        )}
                    >
                        <XCircle size={16}/> Mutabık Değilim
                    </button>
                </div>

                {/* 3. İçerik Alanı */}
                <div className="space-y-6">
                    {/* Aksiyon Açıklaması */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Aksiyon Açıklaması</label>
                        <textarea 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            rows={3}
                            defaultValue={plan.description}
                            disabled={riskAcceptanceMode[plan.id]} // Risk kabulünde ise burası kilitlenir
                        />
                    </div>

                    {/* --- RİSK KABUL FORMU (Kırmızı Alan) --- */}
                    {riskAcceptanceMode[plan.id] && (
                        <div className="border-2 border-red-100 bg-red-50/50 rounded-xl p-6 animate-in fade-in slide-in-from-top-4">
                            <div className="flex items-center gap-2 mb-4 text-red-800 font-bold text-sm">
                                <AlertOctagon size={18}/> RISK KABUL / İTİRAZ FORMU
                            </div>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-red-700 mb-2">İtiraz Gerekçesi (Min. 50 Karakter)</label>
                                    <textarea 
                                        className="w-full bg-white border border-red-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-red-500 outline-none text-slate-700 placeholder:text-red-300"
                                        rows={3}
                                        placeholder="Neden bu aksiyon planını kabul etmiyorsunuz? Detaylı açıklayın..."
                                        onChange={(e) => setRiskJustification({...riskJustification, [plan.id]: e.target.value})}
                                    />
                                </div>

                                <div className="flex items-start gap-3 p-3 bg-white/50 rounded-lg border border-red-100">
                                    <input type="checkbox" className="mt-1 w-4 h-4 text-red-600 rounded focus:ring-red-500" />
                                    <p className="text-xs text-red-800/80 leading-snug">
                                        <span className="font-bold">Risk Kabulü Onayı:</span> Bu aksiyonun uygulanmamasından kaynaklanabilecek tüm risklerin ve olası sonuçların sorumluluğunu üstleniyorum.
                                    </p>
                                </div>

                                {/* Kanıt Yükleme */}
                                <FileUploader label="Kanıt / Belge (Opsiyonel)" />
                            </div>
                        </div>
                    )}

                    {/* Normal Aksiyon Detayları (Sadece Mutabıksa Görünür) */}
                    {!riskAcceptanceMode[plan.id] && (
                        <div className="grid grid-cols-2 gap-6 animate-in fade-in">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Sorumlu Kişi</label>
                                <select className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-700">
                                    <option>Seçiniz...</option>
                                    <option>Mehmet Kara (Şube Müdürü)</option>
                                    <option>Ayşe Demir (Operasyon)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Termin Tarihi</label>
                                <input type="date" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-700" defaultValue={plan.target_date} />
                            </div>
                            
                            {/* Dosya Yükleme */}
                            <div className="col-span-2">
                                <FileUploader label="Destekleyici Dokümanlar" />
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
           <GlassCard className="p-6 sticky top-24">
               <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                   <Users size={18} className="text-indigo-600"/> Onay Zinciri (Parametrik)
               </h3>
               
               <div className="space-y-4">
                   {/* Burası Parametrik Ayarlardan Gelecek */}
                   <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 opacity-50">
                       <div className="text-xs text-slate-400 font-bold uppercase mb-1">Hazırlayan</div>
                       <div className="text-sm font-bold text-slate-700">Ahmet Yılmaz</div>
                   </div>
                   <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100 ring-2 ring-indigo-500/20">
                       <div className="text-xs text-indigo-500 font-bold uppercase mb-1">Mevcut Aşama</div>
                       <div className="text-sm font-bold text-indigo-900">Şube Müdürü Onayı</div>
                   </div>
                   <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                       <div className="text-xs text-slate-400 font-bold uppercase mb-1">Nihai Onay</div>
                       <div className="text-sm font-bold text-slate-700">İç Denetim Başkanı</div>
                   </div>
               </div>
           </GlassCard>
        </div>

      </div>
    </div>
  );
}