import { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom'; // Portal EKLENDİ
import { 
  X, Save, Sparkles, AlertTriangle, TrendingUp, Lightbulb, FileSearch, Loader2, 
  Banknote, Scale, Building, HeartPulse, ChevronsRight, ShieldCheck, Clock, 
  ToggleRight, ToggleLeft, CheckSquare, Square, BookOpen, AlertCircle, ChevronDown, Wand2, Calculator,
  Activity, Thermometer
} from 'lucide-react';
import clsx from 'clsx';
import { toast } from 'react-hot-toast';

// --- MİMARİ BAĞLANTILAR (SAFE IMPORTS) ---
import type { FindingSeverity, GIASCategory } from '@/entities/finding/model/types';
import { comprehensiveFindingApi } from '@/entities/finding/api/module5-api';
import { RegulationSelectorModal } from '@/features/finding-studio/components/RegulationSelectorModal';
import { RichTextEditor } from '@/shared/ui/RichTextEditor';

// BAĞIMLI BİLEŞEN
import { RootCauseDrawer } from './RootCauseDrawer';

// STORE BAĞLANTILARI
import { useParameterStore } from '@/shared/stores/parameter-store';
import { useUIStore } from '@/shared/stores/ui-store'; 

interface NewFindingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (finding: any) => void;
  workpaperId?: string | null;
}

type FormSection = 'tespit' | 'risk' | 'koken' | 'oneri';

// --- UI ÇEVİRİ SÖZLÜĞÜ ---
const SEVERITY_TR: Record<string, string> = { 
    CRITICAL: 'Kritik', 
    HIGH: 'Yüksek', 
    MEDIUM: 'Orta', 
    LOW: 'Düşük', 
    OBSERVATION: 'Gözlem' 
};

// --- ÖZEL ÇOKLU SEÇİM (MULTI-SELECT) BİLEŞENİ ---
const MultiSelectDropdown = ({ options, selected, onChange, placeholder }: { options: any[], selected: string[], onChange: (val: string[]) => void, placeholder: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <div className="relative">
        <div className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-white cursor-pointer flex items-center justify-between hover:border-blue-400 transition-all shadow-sm" onClick={() => setIsOpen(!isOpen)}>
          <span className={clsx("truncate text-sm font-bold", selected.length === 0 ? "text-slate-400" : "text-slate-700")}>
            {selected.length === 0 ? placeholder : `${selected.length} Risk Kategorisi Seçildi`}
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

// --- SENTINEL V3.0 RISK ENGINE (SAFE LOGIC) ---
const BORDO = '#7f1d1d'; 
const KIZIL = '#dc2626'; 
const TURUNCU = '#d97706'; 
const SARI = '#ca8a04';    
const YESIL = '#16a34a';   

const calculateRiskEngine = (data: any) => {
    let finalScore = 0; 
    let severity: FindingSeverity = 'OBSERVATION'; 
    let color_code = YESIL; 
    let is_veto_triggered = false; 
    let veto_reason: string | undefined = undefined;

    // 1. VETO KONTROLLERİ
    if (data.isShariahRisk && (data.shariah_impact >= 4 || data.requires_income_purification)) {
        finalScore = 100; 
        severity = 'CRITICAL'; 
        color_code = BORDO; 
        is_veto_triggered = true; 
        veto_reason = "Şer'i Uyum İhlali (Sıfır Tolerans)";
    } 
    else if (data.isItRisk && data.cvss_score >= 9.0 && data.asset_criticality === 'Critical') {
        finalScore = 100; 
        severity = 'CRITICAL'; 
        color_code = BORDO; 
        is_veto_triggered = true; 
        veto_reason = "Kritik Siber Zafiyet (CVSS >= 9.0)";
    } 
    else if (data.impact_legal === 5) {
        finalScore = 95; 
        severity = 'HIGH'; 
        color_code = KIZIL; 
        is_veto_triggered = true; 
        veto_reason = "Yasal/Düzenleyici İhlal (Lisans Riski)";
    } 
    // 2. WIF HESAPLAMASI
    else {
        const wif = (data.impact_financial * 0.30) + (data.impact_legal * 0.25) + (data.impact_reputation * 0.25) + (data.impact_operational * 0.20);
        const rawScore = wif * data.likelihood_score * (data.control_weakness / 2.0); // 2.5 yerine 2.0 (Daha hassas)
        finalScore = Math.min(100, (rawScore / 12.5) * 100);

        if (finalScore >= 80) { severity = 'CRITICAL'; color_code = BORDO; }
        else if (finalScore >= 60) { severity = 'HIGH'; color_code = KIZIL; }
        else if (finalScore >= 30) { severity = 'MEDIUM'; color_code = TURUNCU; }
        else if (finalScore >= 10) { severity = 'LOW'; color_code = SARI; } // SARI (LOW)
        else { severity = 'OBSERVATION'; color_code = YESIL; }
    }

    // 3. SLA HESAPLAMA
    const getFutureDate = (days: number) => {
        const d = new Date(); 
        d.setDate(d.getDate() + days);
        return d.toISOString().split('T')[0];
    };

    let due_date = ''; 
    let target_sprints = 0;
    
    if (data.sla_type === 'FIXED_DATE') {
        if (severity === 'CRITICAL') due_date = getFutureDate(2);
        else if (severity === 'HIGH') due_date = getFutureDate(30);
        else if (severity === 'MEDIUM') due_date = getFutureDate(60);
        else due_date = getFutureDate(90);
    } else {
        if (severity === 'CRITICAL') target_sprints = 1;
        else if (severity === 'HIGH') target_sprints = 2;
        else if (severity === 'MEDIUM') target_sprints = 4;
        else target_sprints = 6;
    }
    return { calculated_score: finalScore, severity, color_code, is_veto_triggered, veto_reason, due_date, target_sprints };
};

// --- YARDIMCI BİLEŞEN (SLIDER) ---
const RiskSlider = ({ label, value, onChange, icon: Icon }: { label: string, value: number, onChange: (val: number) => void, icon: any }) => (
    <div className="group mb-5">
        <div className="flex justify-between items-center mb-2">
            <label className="flex items-center text-xs font-bold text-slate-600 uppercase tracking-wider group-hover:text-blue-600 transition-colors">
                <Icon className="w-3.5 h-3.5 mr-2 text-slate-400 group-hover:text-blue-500" />{label}
            </label>
            <span className={clsx(
                "font-mono text-xs font-bold px-2 py-0.5 rounded border",
                value >= 4 ? "bg-red-50 text-red-700 border-red-200" :
                value >= 3 ? "bg-orange-50 text-orange-700 border-orange-200" :
                "bg-slate-50 text-slate-600 border-slate-200"
            )}>
                {value.toFixed(1)}
            </span>
        </div>
        <div className="flex items-center gap-4">
            <input 
                type="range" 
                min="1" max="5" step="0.5" 
                value={value} 
                onChange={e => onChange(parseFloat(e.target.value))} 
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900 hover:accent-blue-600 transition-all" 
            />
        </div>
        <div className="flex justify-between mt-1 text-[9px] text-slate-400 font-medium px-1">
            <span>Düşük</span>
            <span>Orta</span>
            <span>Yüksek</span>
            <span>Kritik</span>
        </div>
    </div>
);

// --- ANA BİLEŞEN ---
export function NewFindingModal({ isOpen, onClose, onSave, workpaperId }: NewFindingModalProps) {
  // STATE VE STORE
  const [activeSection, setActiveSection] = useState<FormSection>('tespit');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegulationModalOpen, setIsRegulationModalOpen] = useState(false);
  const [selectedRegulation, setSelectedRegulation] = useState<any>(null);
  const [isRcaDrawerOpen, setIsRcaDrawerOpen] = useState(false);

  // STORE BAĞLANTILARI
  const { giasCategories, rcaCategories, riskTypes } = useParameterStore();
  const { isSidebarExpanded, sidebarColor } = useUIStore(); // Sidebar Durumu

  // FORM VERİSİ
  const [formData, setFormData] = useState({
    title: '', code: '', auditee_department: '', gias_category: '' as GIASCategory | '',
    criteria_html: '', detection_html: '', impact_html: '', root_cause_html: '', recommendation_html: '',
    selected_risk_categories: [] as string[],
    rca_category: '', 
    financial_impact: 0, likelihood_score: 3,
    impact_financial: 1, impact_legal: 1, impact_reputation: 1, impact_operational: 1, control_weakness: 3, // Default 3
    sla_type: 'FIXED_DATE', isItRisk: false, cvss_score: 0, asset_criticality: 'Minor',
    isShariahRisk: false, shariah_impact: 1, requires_income_purification: false,
  });

  const sections = [
    { id: 'tespit' as const, label: 'Kriter & Tespit', icon: FileSearch, color: 'blue' },
    { id: 'risk' as const, label: 'Risk & Etki (WIF)', icon: TrendingUp, color: 'orange' },
    { id: 'koken' as const, label: 'Kök Neden', icon: AlertTriangle, color: 'red' },
    { id: 'oneri' as const, label: 'Öneri', icon: Lightbulb, color: 'green' },
  ];

  // CANLI HESAPLAMA
  const liveRisk = useMemo(() => calculateRiskEngine(formData), [formData]);

  // SCROLL KİLİDİ
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  // FORMATTERLAR
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
            title: formData.title, severity: liveRisk.severity, status: status, description: formData.detection_html, risk_score: liveRisk.calculated_score,
            
            // Genişletilmiş Veri Modeli
            details: {
                workpaper_id: workpaperId, // EKLENDİ
                auditee_department: formData.auditee_department,
                gias_category: formData.gias_category,
                criteria_html: formData.criteria_html, 
                impact_text: formData.impact_html, 
                recommendation_text: formData.recommendation_html, 
                financial_impact: formData.financial_impact,
                risk_categories: formData.selected_risk_categories,
                
                regulation_details: selectedRegulation ? { id: selectedRegulation.id, title: selectedRegulation.title, category: selectedRegulation.category } : null,
                risk_engine: {
                    calculated_score: liveRisk.calculated_score, 
                    is_veto_triggered: liveRisk.is_veto_triggered, 
                    veto_reason: liveRisk.veto_reason,
                    sla_target: formData.sla_type === 'FIXED_DATE' ? liveRisk.due_date : `${liveRisk.target_sprints} Sprint`,
                    inputs: { 
                        financial: formData.impact_financial, 
                        legal: formData.impact_legal, 
                        reputation: formData.impact_reputation, 
                        operational: formData.impact_operational, 
                        likelihood: formData.likelihood_score, 
                        control: formData.control_weakness 
                    }
                },
                root_cause_analysis: { 
                    category: formData.rca_category, 
                    summary_html: formData.root_cause_html, 
                    has_advanced_analysis: false 
                }
            }
        };

        // Eğer API varsa çağır, yoksa mockla
        if (comprehensiveFindingApi && comprehensiveFindingApi.create) {
             await comprehensiveFindingApi.create(payload);
        } else {
             console.log("API Mock Call:", payload);
             await new Promise(resolve => setTimeout(resolve, 800));
        }

        onSave(payload);
        toast.success(status === 'DRAFT' ? 'Taslak kaydedildi.' : 'Bulgu işlendi.');
        onClose();
    } catch (e: any) { 
        toast.error('Hata: ' + (e.message || 'Kayıt başarısız')); 
    } 
    finally { setIsSubmitting(false); }
  };

  if (!isOpen) return null;

  // LAYOUT & PORTAL (BU KISIM ÖNEMLİ - Sidebar Çözümü)
  const modalContent = (
    <div className="relative z-[9999]">
       {/* 1. Backdrop */}
       <div 
          className={clsx(
              "fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-all duration-300",
              isSidebarExpanded ? "left-[280px]" : "left-[80px]" // Sidebar'a saygı duyan backdrop
          )}
          onClick={onClose} 
       />

       {/* 2. Modal Window */}
       <div 
          className={clsx(
              "fixed top-4 bottom-4 right-4 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 animate-in fade-in slide-in-from-right-10 duration-300",
              isSidebarExpanded ? "left-[296px]" : "left-[96px]" // Sidebar genişliği + 16px boşluk
          )}
       >
          {/* HEADER */}
          <div className="flex items-center justify-between px-6 py-4 text-white shadow-md shrink-0 transition-colors duration-300" style={{ backgroundColor: sidebarColor || '#0f172a' }}>
              <div>
                  <h2 className="text-xl font-bold flex items-center gap-2 tracking-tight"><ShieldCheck className="text-emerald-400" size={24}/> Yeni Bulgu Oluşturucusu</h2>
                  <div className="flex items-center gap-3 text-xs text-white/60 mt-1">
                      <span className="font-mono bg-white/10 px-1.5 py-0.5 rounded border border-white/20 flex items-center gap-1"><Activity size={10}/> WIF Engine v3.0</span>
                      <span className="w-1 h-1 bg-white/50 rounded-full"></span>
                      <span>WP: <strong className="text-white">{workpaperId || 'WP-GENEL'}</strong></span>
                  </div>
              </div>
              <div className="flex items-center gap-4">
                  <div className="flex flex-col items-end">
                      <div className="px-4 py-1.5 rounded-lg text-white font-black text-sm tracking-wider shadow-lg flex items-center gap-2 border border-white/20 transition-colors duration-300" style={{ backgroundColor: liveRisk.color_code }}>
                          {liveRisk.is_veto_triggered && <AlertTriangle size={16} className="animate-pulse text-white"/>}
                          {SEVERITY_TR[liveRisk.severity] || liveRisk.severity} 
                          <span className="bg-black/20 px-1.5 py-0.5 rounded text-[10px] ml-1">{liveRisk.calculated_score.toFixed(0)}</span>
                      </div>
                  </div>
                  <div className="h-8 w-px bg-white/20"></div>
                  <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-white/70 hover:text-white transition-colors"><X size={24}/></button>
              </div>
          </div>

          {/* CONTENT BODY */}
          <div className="flex-1 overflow-hidden flex bg-slate-50">
              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                  
                  {/* Form - Başlık */}
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
                      <div className="grid grid-cols-12 gap-6">
                          <div className="col-span-8">
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Bulgu Başlığı *</label>
                              <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 text-slate-900 font-bold transition-all text-base" placeholder="Örn: Kasa İşlemlerinde Çift Anahtar Kuralı İhlali" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} autoFocus />
                          </div>
                          <div className="col-span-4">
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">GIAS Kategori</label>
                              <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-slate-900" value={formData.gias_category} onChange={e => setFormData({...formData, gias_category: e.target.value})}>
                                  <option value="">Seçiniz...</option>
                                  {giasCategories.map(cat => <option key={cat.id} value={cat.label}>{cat.label}</option>)}
                              </select>
                          </div>
                      </div>
                  </div>

                  {/* Tabs */}
                  <div className="flex gap-2 mb-6 border-b border-slate-200 pb-1">
                      {[{ id: 'tespit', label: '1. Kriter & Tespit', icon: FileSearch }, { id: 'risk', label: '2. Risk & Etki (WIF)', icon: TrendingUp }, { id: 'koken', label: '3. Kök Neden', icon: AlertTriangle }, { id: 'oneri', label: '4. Öneri', icon: Lightbulb }].map((tab: any) => (
                          <button key={tab.id} onClick={() => setActiveSection(tab.id as FormSection)} className={clsx("px-6 py-3 rounded-t-xl text-sm font-bold flex items-center gap-2 transition-all relative top-[1px]", activeSection === tab.id ? "bg-white text-slate-900 border border-slate-200 border-b-white z-10 shadow-sm" : "bg-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-700")}>
                              <tab.icon size={16} className={activeSection === tab.id ? `text-blue-600` : "text-slate-400"}/> {tab.label}
                          </button>
                      ))}
                  </div>

                  {/* Tab Contents */}
                  <div className="min-h-[400px]">
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
                      
                      {activeSection === 'risk' && (
                          <div className="grid grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-2">
                              <div className="col-span-7 space-y-6">
                                  <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm"><label className="block text-xs font-bold text-slate-500 uppercase mb-3">Risk Kategorileri</label><MultiSelectDropdown options={riskTypes} selected={formData.selected_risk_categories} onChange={v => setFormData({...formData, selected_risk_categories: v})} placeholder="Risk Türlerini Seçiniz..."/></div>
                                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-[400px] flex flex-col"><div className="bg-slate-50 px-5 py-3 border-b border-slate-200"><span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2"><TrendingUp size={14} className="text-orange-600"/> Risk ve Etki Analizi</span></div><div className="p-0 flex-1 relative"><RichTextEditor value={formData.impact_html} onChange={v => setFormData({...formData, impact_html: v})} placeholder="Bu bulgu sonucunda kurum ne tür kayıplara uğrayabilir?" minHeight="min-h-full"/></div></div>
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

       {/* Drawers (Bu da portallanmış olacak çünkü parent portallandı) */}
       <RootCauseDrawer isOpen={isRcaDrawerOpen} onClose={() => setIsRcaDrawerOpen(false)} onApply={(html) => { setFormData(prev => ({...prev, root_cause_html: prev.root_cause_html + html})); setIsRcaDrawerOpen(false); }} />
       {RegulationSelectorModal && <RegulationSelectorModal isOpen={isRegulationModalOpen} onClose={() => setIsRegulationModalOpen(false)} onSelect={(reg: any) => { const regHtml = `<p><strong>${reg.category}</strong>: ${reg.title}</p><p>${reg.description}</p>`; setFormData(prev => ({ ...prev, code: reg.code, criteria_html: regHtml })); setSelectedRegulation(reg); setIsRegulationModalOpen(false); }} />}
    </div>
  );

  // Portal kullanımı: Modalı document.body'ye taşı.
  return createPortal(modalContent, document.body);
}