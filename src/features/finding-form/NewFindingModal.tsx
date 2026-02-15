import { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, Save, Sparkles, AlertTriangle, TrendingUp, Lightbulb, FileSearch, Loader2, 
  Banknote, Scale, Building, HeartPulse, ChevronsRight, ShieldCheck, Clock, 
  ToggleRight, ToggleLeft, BookOpen, AlertCircle, ChevronDown, Wand2, Calculator, 
  Activity
} from 'lucide-react';
import clsx from 'clsx';
import { toast } from 'react-hot-toast';

// --- MİMARİ BAĞLANTILAR ---
import { SENTINEL_CONSTITUTION } from '@/shared/config/constitution';
import { useParameterStore } from '@/shared/stores/parameter-store'; 
import { useUIStore } from '@/shared/stores/ui-store'; // Sidebar durumu için kritik
import { RichTextEditor } from '@/shared/ui/RichTextEditor'; 
import { GlassCard } from '@/shared/ui/GlassCard'; // Görsel Anayasa

// --- RİSK MOTORU VE API (Iron Rule #3 & #6) ---
import { calculateFindingRisk } from '@/features/risk-engine/calculator';
import { useRiskConfigurationStore } from '@/features/admin/risk-configuration/model/store';
import { comprehensiveFindingApi } from '@/entities/finding/api/module5-api';
import type { FindingSeverity } from '@/entities/finding/model/types';

// --- ALT BİLEŞENLER ---
import { RootCauseDrawer } from './RootCauseDrawer';
import { RegulationSelectorModal } from '@/features/finding-studio/components/RegulationSelectorModal'; 

type FormSection = 'tespit' | 'risk' | 'koken' | 'oneri';

interface NewFindingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (finding: any) => void;
  workpaperId?: string | null;
}

// --- YARDIMCI BİLEŞENLER ---

const RiskSlider = ({ label, value, onChange, icon: Icon }: { label: string, value: number, onChange: (val: number) => void, icon: any }) => (
    <div className="group mb-5">
        <div className="flex justify-between items-center mb-2">
            <label className="flex items-center text-xs font-bold text-slate-600 uppercase tracking-wider group-hover:text-blue-600 transition-colors">
                <Icon className="w-3.5 h-3.5 mr-2 text-slate-400 group-hover:text-blue-500" />{label}
            </label>
            <span className={clsx("font-mono text-xs font-bold px-2 py-0.5 rounded border", value >= 4 ? "bg-red-50 text-red-700 border-red-200" : value >= 3 ? "bg-orange-50 text-orange-700 border-orange-200" : "bg-slate-50 text-slate-600 border-slate-200")}>
                {value.toFixed(1)}
            </span>
        </div>
        <input type="range" min="1" max="5" step="0.5" value={value} onChange={e => onChange(parseFloat(e.target.value))} className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900 hover:accent-blue-600 transition-all" />
    </div>
);

const MultiSelectDropdown = ({ options = [], selected, onChange, placeholder }: { options: any[], selected: string[], onChange: (val: string[]) => void, placeholder: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <div className="relative">
        <div className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-white cursor-pointer flex items-center justify-between hover:border-blue-400 transition-all shadow-sm" onClick={() => setIsOpen(!isOpen)}>
          <span className={clsx("truncate text-sm font-bold", selected.length === 0 ? "text-slate-400" : "text-slate-700")}>
            {selected.length === 0 ? placeholder : `${selected.length} Seçildi`}
          </span>
          <ChevronDown className={clsx("w-4 h-4 text-slate-400 transition-transform", isOpen && "rotate-180")} />
        </div>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
            <div className="absolute z-20 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-2xl max-h-60 overflow-auto animate-in fade-in slide-in-from-top-2">
              {options.map((opt) => (
                <label key={opt.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0 transition-colors">
                  <input type="checkbox" className="w-4 h-4 text-blue-600 rounded border-slate-300 cursor-pointer accent-blue-600" checked={selected.includes(opt.id)}
                    onChange={() => {
                      if (selected.includes(opt.id)) { onChange(selected.filter(s => s !== opt.id)); } 
                      else { onChange([...selected, opt.id]); }
                    }}
                  />
                  <span className="text-sm text-slate-700 font-bold">{opt.label}</span>
                </label>
              ))}
            </div>
          </>
        )}
      </div>
    );
};

// --- ANA BİLEŞEN ---

export function NewFindingModal({ isOpen, onClose, onSave, workpaperId }: NewFindingModalProps) {
  
  // 1. STORE & THEME BAĞLANTISI
  const { isSidebarExpanded, sidebarColor } = useUIStore(); // Sidebar rengini ve durumunu buradan alıyoruz
  const { giasCategories = [], riskTypes = [], rcaCategories = [] } = useParameterStore();
  
  // RİSK KONFİGÜRASYONU (Store'dan Parametrik Okuma)
  const riskConfig = useRiskConfigurationStore((state) => state.config) || {
      // Fallback defaults if store is empty
      weights: { financial: 0.30, legal: 0.25, reputation: 0.25, operational: 0.20 },
      thresholds: { critical: 80, high: 60, medium: 30, low: 10 }
  };

  // 2. LOCAL STATE
  const [activeSection, setActiveSection] = useState<FormSection>('tespit');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRcaDrawerOpen, setIsRcaDrawerOpen] = useState(false);
  const [isRegulationModalOpen, setIsRegulationModalOpen] = useState(false);
  const [selectedRegulation, setSelectedRegulation] = useState<any>(null);

  // Form Verisi (Orijinal yapıya sadık)
  const [formData, setFormData] = useState({
    title: '', code: '', auditee_department: '', gias_category: '',
    criteria_html: '', detection_html: '', impact_html: '', root_cause_html: '', recommendation_html: '',
    selected_risk_categories: [] as string[],
    rca_category: '', 
    financial_impact: 0, likelihood_score: 3, control_weakness: 3,
    impact_financial: 1, impact_legal: 1, impact_reputation: 1, impact_operational: 1,
    sla_type: 'FIXED_DATE', isItRisk: false, cvss_score: 0, asset_criticality: 'Minor',
    isShariahRisk: false, shariah_impact: 1, requires_income_purification: false,
  });

  // 3. CANLI RİSK HESAPLAMA (Motoru Dışarıdan Çağırma)
  const liveRisk = useMemo(() => {
      // calculateFindingRisk fonksiyonu src/features/risk-engine/calculator.ts'den gelir
      return calculateFindingRisk(formData, riskConfig);
  }, [formData, riskConfig]);

  // 4. SCROLL KİLİDİ
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  // 5. HANDLERS
  const handleFinancialImpactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value.replace(/\./g, ''); 
      if (rawValue === '') { setFormData({ ...formData, financial_impact: 0 }); return; }
      const numericValue = parseInt(rawValue, 10);
      if (!isNaN(numericValue)) { setFormData({ ...formData, financial_impact: numericValue }); }
  };

  const formatCurrency = (val: number) => {
      if (val === 0) return '';
      return new Intl.NumberFormat('tr-TR').format(val);
  };

  const handleSaveWrapper = async (status: 'DRAFT' | 'PUBLISHED' = 'DRAFT') => {
    if (!formData.title.trim()) { toast.error('Lütfen bulgu başlığı giriniz.'); return; }
    setIsSubmitting(true);
    try {
        const payload = {
            title: formData.title, 
            severity: liveRisk.severity, 
            status: status, 
            description: formData.detection_html, 
            risk_score: liveRisk.calculated_score,
            
            // Genişletilmiş Veri Modeli
            extended_data: {
                workpaper_id: workpaperId, 
                auditee_department: formData.auditee_department,
                gias_category: formData.gias_category,
                root_cause: formData.root_cause_html, 
                recommendation: formData.recommendation_html,
                criteria: formData.criteria_html,
                risk_details: { 
                    financial_impact: formData.financial_impact, 
                    sla_target: formData.sla_type === 'FIXED_DATE' ? liveRisk.due_date : `${liveRisk.target_sprints} Sprint`,
                    risk_categories: formData.selected_risk_categories,
                    engine_inputs: { 
                        impact_financial: formData.impact_financial, 
                        likelihood: formData.likelihood_score, 
                        control_weakness: formData.control_weakness 
                    }
                },
                root_cause_analysis: { 
                    category: formData.rca_category, 
                    summary_html: formData.root_cause_html 
                }
            }
        };

        // API Çağrısı (Mock veya Gerçek)
        if (comprehensiveFindingApi && comprehensiveFindingApi.create) {
             await comprehensiveFindingApi.create(payload);
        } else {
             await new Promise(resolve => setTimeout(resolve, 800)); // Fallback mock delay
        }

        onSave(payload);
        toast.success(status === 'DRAFT' ? 'Taslak kaydedildi.' : 'Bulgu sisteme işlendi.');
        onClose();
    } catch (e: any) { 
        toast.error('Kayıt sırasında hata oluştu.'); 
        console.error(e);
    } 
    finally { setIsSubmitting(false); }
  };

  if (!isOpen) return null;

  // --- SMART LAYOUT (SIDEBAR HESAPLAMASI) ---
  // Sidebar açıksa 280px, kapalıysa 80px soldan boşluk bırak.
  const modalLeftPosition = isSidebarExpanded ? 'left-[280px]' : 'left-[80px]';

  // Modal İçeriği (Portal ile render edilecek)
  const modalContent = (
    <div className="relative z-[9999]">
       {/* 1. Backdrop */}
       <div 
          className={clsx(
              "fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-all duration-300",
              modalLeftPosition // Backdrop da sidebar'a saygı duyar
          )}
          onClick={onClose} 
       />

       {/* 2. Modal Penceresi */}
       <div 
          className={clsx(
              "fixed top-4 bottom-4 right-4 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 animate-in fade-in slide-in-from-right-10 duration-300",
              modalLeftPosition // Dinamik Sol Boşluk
          )}
       >
          
          {/* HEADER - DİNAMİK RENK (Sidebar'dan) */}
          <div 
            className="flex items-center justify-between px-6 py-4 text-white shadow-md shrink-0 transition-colors duration-300" 
            style={{ backgroundColor: sidebarColor || '#0f172a' }}
          >
              <div>
                  <h2 className="text-xl font-bold flex items-center gap-2 tracking-tight">
                      <ShieldCheck className="text-emerald-400" size={24}/> 
                      Yeni Bulgu Oluşturucusu
                  </h2>
                  <div className="flex items-center gap-3 text-xs text-white/60 mt-1">
                      <span className="font-mono bg-white/10 px-1.5 py-0.5 rounded border border-white/20 flex items-center gap-1">
                          <Activity size={10}/> WIF Engine v3.0
                      </span>
                      <span className="w-1 h-1 bg-white/50 rounded-full"></span>
                      <span>WP: <strong className="text-white">{workpaperId || 'GENEL'}</strong></span>
                  </div>
              </div>
              <div className="flex items-center gap-4">
                  {/* Risk Skoru Badge */}
                  <div className="flex flex-col items-end">
                      <div className="px-4 py-1.5 rounded-lg text-white font-black text-sm tracking-wider shadow-lg flex items-center gap-2 border border-white/20" style={{ backgroundColor: liveRisk.color_code }}>
                          {liveRisk.is_veto_triggered && <AlertTriangle size={16} className="animate-pulse text-white"/>}
                          {liveRisk.severity} 
                          <span className="bg-black/20 px-1.5 py-0.5 rounded text-[10px] ml-1">{liveRisk.calculated_score.toFixed(0)}</span>
                      </div>
                  </div>
                  <div className="h-8 w-px bg-white/20"></div>
                  <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-white/70 hover:text-white transition-colors">
                      <X size={24}/>
                  </button>
              </div>
          </div>

          {/* CONTENT BODY */}
          <div className="flex-1 overflow-hidden flex bg-slate-50">
              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                  
                  {/* Başlık ve Kategori */}
                  <GlassCard className="p-6 mb-6 !bg-white">
                      <div className="grid grid-cols-12 gap-6">
                          <div className="col-span-8">
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Bulgu Başlığı *</label>
                              <input 
                                  type="text" 
                                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 text-slate-900 font-bold transition-all text-base"
                                  placeholder="Örn: Kasa İşlemlerinde Çift Anahtar Kuralı İhlali"
                                  value={formData.title}
                                  onChange={e => setFormData({...formData, title: e.target.value})}
                                  autoFocus
                              />
                          </div>
                          <div className="col-span-4">
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">GIAS Kategori</label>
                              <select 
                                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-slate-900"
                                  value={formData.gias_category}
                                  onChange={e => setFormData({...formData, gias_category: e.target.value})}
                              >
                                  <option value="">Seçiniz...</option>
                                  {giasCategories.map(cat => <option key={cat.id} value={cat.label}>{cat.label}</option>)}
                              </select>
                          </div>
                      </div>
                  </GlassCard>

                  {/* Navigasyon Sekmeleri */}
                  <div className="flex gap-2 mb-6 border-b border-slate-200 pb-1">
                      {[{ id: 'tespit', label: '1. Kriter & Tespit', icon: FileSearch, color: 'blue' }, { id: 'risk', label: '2. Risk & Etki (WIF)', icon: TrendingUp, color: 'orange' }, { id: 'koken', label: '3. Kök Neden', icon: AlertTriangle, color: 'red' }, { id: 'oneri', label: '4. Öneri', icon: Lightbulb, color: 'green' }].map((tab: any) => (
                          <button key={tab.id} onClick={() => setActiveSection(tab.id as FormSection)} className={clsx("px-6 py-3 rounded-t-xl text-sm font-bold flex items-center gap-2 transition-all relative top-[1px]", activeSection === tab.id ? "bg-white text-slate-900 border border-slate-200 border-b-white z-10 shadow-sm" : "bg-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-700")}>
                              <tab.icon size={16} className={activeSection === tab.id ? `text-${tab.color}-600` : "text-slate-400"}/> {tab.label}
                          </button>
                      ))}
                  </div>

                  {/* Sekme İçeriği */}
                  <div className="min-h-[400px]">
                      
                      {/* 1. KRİTER & TESPİT */}
                      {activeSection === 'tespit' && (
                          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                             <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[300px]">
                                <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex justify-between items-center shrink-0">
                                    <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2"><BookOpen size={14} className="text-indigo-600"/> Kriter (Olması Gereken)</span>
                                    <button onClick={() => setIsRegulationModalOpen(true)} className="text-[10px] bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-bold hover:bg-indigo-100 border border-indigo-200 transition-colors">Kütüphaneden Seç</button>
                                </div>
                                <div className="p-0 flex-1 relative"><RichTextEditor value={formData.criteria_html} onChange={v => setFormData({...formData, criteria_html: v})} placeholder="İlgili mevzuat maddesi veya prosedür referansı..." minHeight="min-h-full"/></div>
                             </div>
                             <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[300px]">
                                <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex justify-between items-center shrink-0">
                                    <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2"><FileSearch size={14} className="text-blue-600"/> Tespit (Mevcut Durum)</span>
                                    <span className="text-[10px] bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full font-bold flex gap-1 border border-emerald-100"><Sparkles size={10} className="mt-0.5"/> AI Destekli</span>
                                </div>
                                <div className="p-0 flex-1 relative"><RichTextEditor value={formData.detection_html} onChange={v => setFormData({...formData, detection_html: v})} placeholder="Sahada gözlemlenen aykırılığı detaylıca anlatın..." minHeight="min-h-full"/></div>
                             </div>
                          </div>
                      )}
                      
                      {/* 2. RİSK VE WIF ENGINE */}
                      {activeSection === 'risk' && (
                          <div className="grid grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-2">
                              <div className="col-span-7 space-y-6">
                                  <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                                      <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Risk Kategorileri</label>
                                      <MultiSelectDropdown options={riskTypes} selected={formData.selected_risk_categories} onChange={v => setFormData({...formData, selected_risk_categories: v})} placeholder="Risk Türlerini Seçiniz..."/>
                                  </div>
                                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-[400px] flex flex-col">
                                      <div className="bg-slate-50 px-5 py-3 border-b border-slate-200">
                                          <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2"><TrendingUp size={14} className="text-orange-600"/> Risk ve Etki Analizi</span>
                                      </div>
                                      <div className="p-0 flex-1 relative"><RichTextEditor value={formData.impact_html} onChange={v => setFormData({...formData, impact_html: v})} placeholder="Bu bulgu sonucunda kurum ne tür kayıplara uğrayabilir?" minHeight="min-h-full"/></div>
                                  </div>
                              </div>
                              <div className="col-span-5 space-y-6">
                                  <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 shadow-inner">
                                      <h4 className="text-sm font-black text-slate-700 mb-5 flex items-center gap-2 border-b border-slate-200 pb-3"><Calculator size={16}/> WIF Hesaplayıcı</h4>
                                      <RiskSlider label="Finansal Etki" value={formData.impact_financial} onChange={v => setFormData({...formData, impact_financial: v})} icon={Banknote} />
                                      <RiskSlider label="Yasal Etki" value={formData.impact_legal} onChange={v => setFormData({...formData, impact_legal: v})} icon={Scale} />
                                      <RiskSlider label="İtibar Etkisi" value={formData.impact_reputation} onChange={v => setFormData({...formData, impact_reputation: v})} icon={Building} />
                                      <RiskSlider label="Operasyonel" value={formData.impact_operational} onChange={v => setFormData({...formData, impact_operational: v})} icon={HeartPulse} />
                                      <div className="my-5 border-t border-slate-200 border-dashed"></div>
                                      <RiskSlider label="Olasılık" value={formData.likelihood_score} onChange={v => setFormData({...formData, likelihood_score: v})} icon={ChevronsRight} />
                                      <RiskSlider label="Kontrol Zafiyeti" value={formData.control_weakness} onChange={v => setFormData({...formData, control_weakness: v})} icon={ShieldCheck} />
                                      <div className="mt-5 pt-4 border-t border-slate-200">
                                          <label className="block text-xs font-bold text-slate-500 mb-2">Finansal Karşılık (TL)</label>
                                          <input type="text" value={formatCurrency(formData.financial_impact)} onChange={handleFinancialImpactChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm font-bold" placeholder="0"/>
                                      </div>
                                  </div>
                                  {/* Vetolar */}
                                  <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
                                      <div className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg transition-colors"><span className="text-xs font-bold text-slate-600 flex items-center gap-2"><Scale size={16} className="text-emerald-600"/> Şer'i Uyum Riski</span><button onClick={() => setFormData({...formData, isShariahRisk: !formData.isShariahRisk})}>{formData.isShariahRisk ? <ToggleRight className="text-emerald-600 w-10 h-10"/> : <ToggleLeft className="text-slate-300 w-10 h-10"/>}</button></div>
                                      {formData.isShariahRisk && ( <div className="pl-4 pr-2 pb-2 animate-in fade-in"><RiskSlider label="İhlal Şiddeti" value={formData.shariah_impact} onChange={v => setFormData({...formData, shariah_impact: v})} icon={Scale} /></div> )}
                                      <div className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg transition-colors"><span className="text-xs font-bold text-slate-600 flex items-center gap-2"><ShieldCheck size={16} className="text-blue-600"/> Kritik Siber Varlık</span><button onClick={() => setFormData({...formData, isItRisk: !formData.isItRisk})}>{formData.isItRisk ? <ToggleRight className="text-blue-600 w-10 h-10"/> : <ToggleLeft className="text-slate-300 w-10 h-10"/>}</button></div>
                                  </div>
                              </div>
                          </div>
                      )}
                      
                      {/* 3. KÖK NEDEN */}
                      {activeSection === 'koken' && (
                          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 h-[500px] flex flex-col">
                              <div className="flex justify-between items-center shrink-0">
                                  <div className="w-1/3">
                                      <select className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700" value={formData.rca_category} onChange={e => setFormData({...formData, rca_category: e.target.value})}>
                                          <option value="">Kök Neden Kategorisi...</option>
                                          {rcaCategories.map(cat => <option key={cat.id} value={cat.label}>{cat.label}</option>)}
                                      </select>
                                  </div>
                                  <button onClick={() => setIsRcaDrawerOpen(true)} className="px-5 py-2 bg-red-50 text-red-700 rounded-xl border border-red-200 hover:bg-red-100 transition-colors text-xs font-bold flex items-center gap-2 shadow-sm"><Wand2 size={14}/> RCA Laboratuvarını Aç</button>
                              </div>
                              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex-1 relative">
                                  <RichTextEditor value={formData.root_cause_html} onChange={v => setFormData({...formData, root_cause_html: v})} placeholder="Kök neden analizinin sonucunu buraya girin..." minHeight="min-h-full" />
                              </div>
                          </div>
                      )}

                      {/* 4. ÖNERİ */}
                      {activeSection === 'oneri' && (
                          <div className="animate-in fade-in slide-in-from-bottom-2 h-[500px] flex flex-col">
                              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex-1 relative">
                                  <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex justify-between items-center shrink-0"><span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2"><Lightbulb size={14} className="text-emerald-600"/> Aksiyon Önerisi</span></div>
                                  <div className="p-0 flex-1 relative"><RichTextEditor value={formData.recommendation_html} onChange={v => setFormData({...formData, recommendation_html: v})} placeholder="Yönetime sunulacak çözüm önerisi..." minHeight="min-h-full" /></div>
                              </div>
                          </div>
                      )}
                  </div>
              </div>
          </div>

          {/* FOOTER */}
          <div className="flex items-center justify-between p-5 border-t border-slate-200 bg-white rounded-b-xl shrink-0">
             <button onClick={onClose} disabled={isSubmitting} className="px-6 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-bold border border-transparent hover:border-slate-200">İptal Et</button>
             <div className="flex gap-3">
                  <button onClick={() => handleSaveWrapper('DRAFT')} disabled={isSubmitting} className="px-6 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors text-sm">Taslak Olarak Sakla</button>
                  <button onClick={() => handleSaveWrapper('PUBLISHED')} disabled={isSubmitting} className="px-8 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg flex items-center gap-2 text-sm">{isSubmitting ? <Loader2 className="animate-spin" size={16}/> : <Save size={16}/>} İşle</button>
             </div>
          </div>

       </div>

       {/* ALT MODALLAR - PORTAL İÇİNDE PORTAL */}
       <RootCauseDrawer 
            isOpen={isRcaDrawerOpen} 
            onClose={() => setIsRcaDrawerOpen(false)} 
            onApply={(html) => { 
                setFormData(prev => ({...prev, root_cause_html: prev.root_cause_html + html})); 
                setIsRcaDrawerOpen(false); 
            }} 
       />
       {RegulationSelectorModal && (
           <RegulationSelectorModal 
                isOpen={isRegulationModalOpen} 
                onClose={() => setIsRegulationModalOpen(false)} 
                onSelect={(reg: any) => { 
                    const regHtml = `<p><strong>${reg.category}</strong>: ${reg.title}</p><p>${reg.description}</p>`;
                    setFormData(prev => ({ ...prev, code: reg.code, criteria_html: regHtml })); 
                    setSelectedRegulation(reg); 
                    setIsRegulationModalOpen(false); 
                }} 
            />
       )}
    </div>
  );

  // --- KRİTİK: MODAL'I DOCUMENT BODY'YE TAŞIYORUZ ---
  return createPortal(modalContent, document.body);
}