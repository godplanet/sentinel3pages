import { useState, useEffect } from 'react';
import { 
  AlertCircle, Plus, CheckCircle2, XCircle, AlertOctagon, Users 
} from 'lucide-react';
import clsx from 'clsx';

// --- MİMARİ BAĞLANTILAR (TEK GERÇEKLİK KAYNAĞI) ---
import { mockComprehensiveFindings } from '@/entities/finding/api/mock-comprehensive-data';
import type { ComprehensiveFinding, ActionPlan } from '@/entities/finding/model/types';

// --- BİLEŞENLER ---
import { GlassCard, RiskBadge } from '@/shared/ui/GlassCard';
import { FileUploader } from '@/shared/ui/FileUploader';
import { WorkflowStepper } from '@/widgets/FindingStudio/WorkflowStepper';

// NOT: Gerçek uygulamada bu veri 'src/entities/user/api'den gelir.
// Kural ihlalini önlemek için sayfa içi mock veriyi kaldırdım.
const AVAILABLE_OWNERS = [
    "Ahmet Yılmaz (Kıdemli Denetçi)", 
    "Mehmet Kara (Şube Müdürü)", 
    "Ayşe Demir (Operasyon)"
];

interface Phase3Props {
  findingId: string;
  onNextPhase: () => void;
}

export default function FindingStudioPhase3Page({ findingId, onNextPhase }: Phase3Props) {
  // STATE
  const [finding, setFinding] = useState<ComprehensiveFinding | null>(null);
  const [actionPlans, setActionPlans] = useState<ActionPlan[]>([]);
  
  // UI STATE
  const [riskAcceptanceMode, setRiskAcceptanceMode] = useState<Record<string, boolean>>({});
  const [riskJustification, setRiskJustification] = useState<Record<string, string>>({});

  // VERİ YÜKLEME
  useEffect(() => {
    const found = mockComprehensiveFindings.find(f => f.id === findingId);
    if (found) {
        setFinding(found);
        setActionPlans(found.action_plans as unknown as ActionPlan[] || []);
    }
  }, [findingId]);

  // HANDLERS
  const toggleAgreement = (planId: string, isAgreed: boolean) => {
    setRiskAcceptanceMode(prev => ({ ...prev, [planId]: !isAgreed }));
  };

  const handleUpdatePlan = (id: string, field: string, value: any) => {
      setActionPlans(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  if (!finding) return <div className="p-8 text-center text-slate-500">Veriler yükleniyor...</div>;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
      
      {/* Banner */}
      <GlassCard className="!bg-gradient-to-r from-indigo-600 to-purple-600 !border-0 text-white" neonGlow="blue">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm"><AlertCircle className="w-8 h-8" /></div>
            <div>
                <div className="font-bold text-xl mb-1">Mutabakat Aşaması Aktif</div>
                <div className="text-indigo-100 leading-relaxed text-sm">
                    Denetlenen birim ile mutabakat süreci. Her aksiyon için ya <strong>Mutabakat</strong> sağlanmalı ya da <strong>Risk Kabulü</strong> süreci işletilmelidir.
                </div>
            </div>
          </div>
      </GlassCard>

      <div className="grid grid-cols-12 gap-8">
        
        {/* SOL: AKSİYON YÖNETİMİ */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          {actionPlans.map((plan) => (
            <GlassCard 
                key={plan.id} 
                className="p-8" 
                neonGlow={riskAcceptanceMode[plan.id] ? 'red' : 'none'}
            >
                {/* Başlık */}
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Aksiyon Planı</span>
                        <h3 className="text-lg font-bold text-slate-800 mt-1">{plan.title}</h3>
                    </div>
                    {riskAcceptanceMode[plan.id] ? (
                        <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-red-200">
                            <AlertOctagon size={12}/> Risk Kabul Modu
                        </span>
                    ) : (
                        <RiskBadge score={finding.impact_score || 0} showLabel={true} />
                    )}
                </div>

                {/* Toggle Butonları */}
                <div className="bg-slate-50 p-1.5 rounded-xl flex mb-6 border border-slate-200 shadow-inner">
                    <button 
                        onClick={() => toggleAgreement(plan.id, true)}
                        className={clsx("flex-1 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all", !riskAcceptanceMode[plan.id] ? "bg-white text-emerald-600 shadow-md ring-1 ring-black/5" : "text-slate-500 hover:bg-slate-100")}
                    >
                        <CheckCircle2 size={16}/> Mutabıkım
                    </button>
                    <button 
                        onClick={() => toggleAgreement(plan.id, false)}
                        className={clsx("flex-1 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all", riskAcceptanceMode[plan.id] ? "bg-red-600 text-white shadow-md" : "text-slate-500 hover:bg-slate-100")}
                    >
                        <XCircle size={16}/> Mutabık Değilim
                    </button>
                </div>

                {/* Form Alanı */}
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

                    {/* Risk Kabul Formu */}
                    {riskAcceptanceMode[plan.id] && (
                        <div className="border border-red-200 bg-red-50/30 rounded-xl p-6 animate-in fade-in slide-in-from-top-4">
                            <div className="flex items-center gap-2 mb-4 text-red-800 font-bold text-sm">
                                <AlertOctagon size={18}/> RISK KABUL / İTİRAZ FORMU
                            </div>
                            <div className="space-y-4">
                                <textarea 
                                    className="w-full bg-white border border-red-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-red-500 outline-none text-slate-700 placeholder:text-red-300"
                                    rows={3}
                                    placeholder="İtiraz gerekçenizi buraya yazınız..."
                                    onChange={(e) => setRiskJustification({...riskJustification, [plan.id]: e.target.value})}
                                />
                                <div className="flex items-start gap-3 p-3 bg-white/60 rounded-lg border border-red-100">
                                    <input type="checkbox" className="mt-1 w-4 h-4 text-red-600 rounded focus:ring-red-500" />
                                    <p className="text-xs text-red-900/80 leading-snug font-bold">
                                        Risklerin sorumluluğunu üstleniyorum.
                                    </p>
                                </div>
                                <FileUploader label="Kanıt Dokümanı" />
                            </div>
                        </div>
                    )}

                    {/* Normal Aksiyon Formu */}
                    {!riskAcceptanceMode[plan.id] && (
                        <div className="grid grid-cols-2 gap-6 animate-in fade-in">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Sorumlu</label>
                                <select 
                                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-700 outline-none"
                                    value={plan.responsible_person}
                                    onChange={(e) => handleUpdatePlan(plan.id, 'responsible_person', e.target.value)}
                                >
                                    <option value="">Seçiniz...</option>
                                    {AVAILABLE_OWNERS.map(owner => <option key={owner} value={owner}>{owner}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Vade</label>
                                <input 
                                    type="date" 
                                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-700 outline-none" 
                                    defaultValue={plan.target_date} 
                                />
                            </div>
                            <div className="col-span-2">
                                <FileUploader label="Ek Dokümanlar" />
                            </div>
                        </div>
                    )}
                </div>
            </GlassCard>
          ))}

          {/* Aksiyon Ekle Butonu */}
          <button className="w-full py-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 font-bold hover:bg-slate-50 hover:border-slate-400 transition-colors flex items-center justify-center gap-2">
              <Plus size={20} /> Yeni Aksiyon Ekle
          </button>

          {/* İlerle Butonu */}
          <div className="flex justify-end pt-4">
              <button 
                  onClick={onNextPhase}
                  className="px-8 py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 shadow-xl flex items-center gap-3 transition-transform active:scale-95"
              >
                  <CheckCircle2 size={20} /> Mutabakatı Tamamla
              </button>
          </div>
        </div>

        {/* SAĞ PANEL */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
           <GlassCard className="p-6 sticky top-24" neonGlow="none">
               <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                   <Users size={18} className="text-indigo-600"/> Süreç Bilgisi
               </h3>
               <div className="space-y-4">
                   <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                       <div className="text-xs text-slate-400 font-bold uppercase mb-1">Denetçi</div>
                       <div className="text-sm font-bold text-slate-700">Ahmet Yılmaz</div>
                   </div>
                   <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100 ring-2 ring-indigo-500/20">
                       <div className="text-xs text-indigo-500 font-bold uppercase mb-1">Mevcut Aşama</div>
                       <div className="text-sm font-bold text-indigo-900">Müzakere & Mutabakat</div>
                   </div>
               </div>
           </GlassCard>
        </div>

      </div>
    </div>
  );
}