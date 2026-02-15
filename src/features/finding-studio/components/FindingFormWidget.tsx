import { useState, useMemo, useEffect } from 'react';
import { 
  X, Save, Sparkles, AlertTriangle, TrendingUp, Lightbulb, FileSearch, Loader2, 
  Banknote, Scale, Building, HeartPulse, ChevronsRight, ShieldCheck, Clock, 
  ToggleRight, ToggleLeft, CheckSquare, Square, BookOpen, AlertCircle, ChevronDown, Wand2
} from 'lucide-react';
import clsx from 'clsx';
import { toast } from 'react-hot-toast';

// --- MİMARİ BAĞLANTILAR ---
import type { FindingSeverity } from '@/entities/finding/model/types';
import { SENTINEL_CONSTITUTION } from '@/shared/config/constitution';
import { useParameterStore } from '@/shared/stores/parameter-store'; // Faz 3 Store
// Eğer RichTextEditor projenizde yoksa burayı textarea yapabilirsiniz, ama importu korudum.
import { RichTextEditor } from '@/shared/ui/RichTextEditor'; 

// --- BAĞIMLI BİLEŞENLER ---
import { RootCauseDrawer } from './RootCauseDrawer';

interface FindingFormWidgetProps {
  workpaperId?: string;
  onClose: () => void;
  onSave: (finding: any) => void;
}

type FormSection = 'tespit' | 'risk' | 'koken' | 'oneri';

// --- UI SABİTLERİ (Constitution'dan Beslenebilir) ---
const SEVERITY_TR: Record<string, string> = { 
    CRITICAL: 'Kritik', 
    HIGH: 'Yüksek', 
    MEDIUM: 'Orta', 
    LOW: 'Düşük', 
    OBSERVATION: 'Gözlem' 
};

// --- YARDIMCI BİLEŞENLER (LOCAL) ---

// 1. Multi-Select Dropdown
const MultiSelectDropdown = ({ options, selected, onChange, placeholder }: { options: any[], selected: string[], onChange: (val: string[]) => void, placeholder: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <div className="relative">
        <div className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-white cursor-pointer flex items-center justify-between hover:border-blue-400 transition-colors" onClick={() => setIsOpen(!isOpen)}>
          <span className={clsx("truncate text-sm font-medium", selected.length === 0 ? "text-slate-400" : "text-slate-800")}>
            {selected.length === 0 ? placeholder : `${selected.length} Risk Kategorisi Seçildi`}
          </span>
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </div>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
            <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-60 overflow-auto animate-in fade-in slide-in-from-top-2">
              {options.map((opt) => (
                <label key={opt.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0 transition-colors">
                  <input type="checkbox" className="w-4 h-4 text-blue-600 rounded border-slate-300 cursor-pointer" checked={selected.includes(opt.id)}
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

// 2. Risk Slider
const RiskSlider = ({ label, value, onChange, icon: Icon }: { label: string, value: number, onChange: (val: number) => void, icon: any }) => (
    <div className="group mb-4">
        <label className="flex items-center text-sm font-medium text-gray-700 mb-2 group-hover:text-blue-600 transition-colors">
            <Icon className="w-4 h-4 mr-2 text-gray-400 group-hover:text-blue-500" />{label}
        </label>
        <div className="flex items-center gap-4">
            <input type="range" min="1" max="5" step="0.1" value={value} onChange={e => onChange(parseFloat(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
            <span className="font-bold text-sm text-blue-700 w-12 text-center bg-blue-50 rounded-md py-1 border border-blue-100">{value.toFixed(1)}</span>
        </div>
    </div>
);

// --- RISK MOTORU (LOGIC) ---
const BORDO = '#6A0000'; 
const KIZIL = '#DC143C'; 
const TURUNCU = '#FFA500'; 
const SARI = '#FFD700';    
const YESIL = '#228B22';   

const calculateRiskEngine = (data: any) => {
    let finalScore = 0; 
    let severity: FindingSeverity = 'LOW'; // Default mapping to valid type
    let color_code = YESIL; 
    let is_veto_triggered = false; 
    let veto_reason = undefined;

    // VETO 1: Şer'i Uyum
    if (data.isShariahRisk && (data.shariah_impact >= 4 || data.requires_income_purification)) {
        finalScore = 100; 
        severity = 'CRITICAL'; 
        color_code = BORDO; 
        is_veto_triggered = true; 
        veto_reason = "Şer'i Uyum İhlali (Sıfır Tolerans)";
    } 
    // VETO 2: Kritik Siber Risk
    else if (data.isItRisk && data.cvss_score >= 9.0 && data.asset_criticality === 'Critical') {
        finalScore = 100; 
        severity = 'CRITICAL'; 
        color_code = BORDO; 
        is_veto_triggered = true; 
        veto_reason = "Kritik Siber Zafiyet (CVSS >= 9.0)";
    } 
    // VETO 3: Yasal Risk
    else if (data.impact_legal === 5) {
        finalScore = 90; 
        severity = 'HIGH'; 
        color_code = KIZIL; 
        is_veto_triggered = true; 
        veto_reason = "Aşırı Yasal/Düzenleyici Risk";
    } 
    // STANDART HESAPLAMA (WIF)
    else {
        const wif = (data.impact_financial * 0.30) + (data.impact_legal * 0.25) + (data.impact_reputation * 0.25) + (data.impact_operational * 0.20);
        const rawScore = wif * data.likelihood_score * (data.control_weakness / 2.5);
        finalScore = Math.min(100, (rawScore / 12.5) * 100);

        if (finalScore >= 80) { severity = 'CRITICAL'; color_code = BORDO; }
        else if (finalScore >= 60) { severity = 'HIGH'; color_code = KIZIL; }
        else if (finalScore >= 30) { severity = 'MEDIUM'; color_code = TURUNCU; }
        else if (finalScore >= 10) { severity = 'LOW'; color_code = SARI; }
        else { severity = 'LOW'; color_code = YESIL; } // 'OBSERVATION' mapped to LOW for type safety or handle separately
    }

    // SLA HESAPLAMA
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

// --- ANA BİLEŞEN: FINDING FORM WIDGET ---
export function FindingFormWidget({ workpaperId, onClose, onSave }: FindingFormWidgetProps) {
  // STATE
  const [activeSection, setActiveSection] = useState<FormSection>('tespit');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRcaDrawerOpen, setIsRcaDrawerOpen] = useState(false);

  // PARAMETRİK VERİLER
  const { giasCategories, rcaCategories, riskTypes } = useParameterStore();

  const [formData, setFormData] = useState({
    title: '', 
    code: '', 
    auditee_department: '', 
    gias_category: '',
    
    criteria_html: '',   
    detection_html: '',  
    impact_html: '',    
    root_cause_html: '', 
    recommendation_html: '', 
    
    selected_risk_categories: [] as string[],
    rca_category: '', 
    
    financial_impact: 0, 
    likelihood_score: 3,
    impact_financial: 1, 
    impact_legal: 1, 
    impact_reputation: 1, 
    impact_operational: 1, 
    control_weakness: 1,
    
    sla_type: 'FIXED_DATE', 
    isItRisk: false, 
    cvss_score: 0, 
    asset_criticality: 'Minor',
    isShariahRisk: false, 
    shariah_impact: 1, 
    requires_income_purification: false,
  });

  // CANLI RİSK HESAPLAMA
  const liveRisk = useMemo(() => calculateRiskEngine(formData), [formData]);

  // SEKME YAPISI
  const sections = [
    { id: 'tespit' as const, label: 'Kriter & Tespit', icon: FileSearch, color: 'blue' },
    { id: 'risk' as const, label: 'Risk & Etki', icon: TrendingUp, color: 'orange' },
    { id: 'koken' as const, label: 'Kök Neden', icon: AlertTriangle, color: 'red' },
    { id: 'oneri' as const, label: 'Öneri', icon: Lightbulb, color: 'green' },
  ];

  // FORMATTERLAR
  const handleFinancialImpactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value.replace(/\./g, ''); 
      if (rawValue === '') {
          setFormData({ ...formData, financial_impact: 0 });
          return;
      }
      const numericValue = parseInt(rawValue, 10);
      if (!isNaN(numericValue)) {
          setFormData({ ...formData, financial_impact: numericValue });
      }
  };

  const formatCurrency = (val: number) => {
      if (val === 0) return '';
      return new Intl.NumberFormat('tr-TR').format(val);
  };

  // KAYIT İŞLEMİ
  const handleSaveWrapper = async (status: 'DRAFT' | 'PUBLISHED' = 'DRAFT') => {
    if (!formData.title.trim()) { toast.error('Lütfen bulgu başlığı giriniz.'); return; }
    
    setIsSubmitting(true);

    try {
        // Sentinel v3.0 Veri Modeline Uygun Payload
        const payload = {
            title: formData.title, 
            severity: liveRisk.severity, 
            status: status, 
            description: formData.detection_html, 
            risk_score: liveRisk.calculated_score,
            
            // Genişletilmiş Veri
            extended_data: {
                workpaper_id: workpaperId,
                gias_category: formData.gias_category,
                root_cause: formData.root_cause_html,
                recommendation: formData.recommendation_html,
                risk_details: {
                    financial_impact: formData.financial_impact,
                    categories: formData.selected_risk_categories,
                    sla_target: formData.sla_type === 'FIXED_DATE' ? liveRisk.due_date : `${liveRisk.target_sprints} Sprint`,
                    engine_inputs: {
                        impact_financial: formData.impact_financial,
                        likelihood: formData.likelihood_score,
                        control_weakness: formData.control_weakness
                    }
                }
            }
        };

        // Simüle edilmiş API çağrısı
        await new Promise(resolve => setTimeout(resolve, 800)); 
        
        onSave(payload);
        toast.success(status === 'DRAFT' ? 'Taslak kaydedildi.' : 'Bulgu işlendi.');
        
    } catch (error) {
        toast.error('Kayıt sırasında hata oluştu.');
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 relative animate-in fade-in zoom-in-95 duration-300">
      
      {/* HEADER: Siyah Sentinel Başlığı */}
      <div className="flex items-center justify-between p-4 bg-slate-900 text-white shadow-md sticky top-0 z-20">
        <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
               Yeni Bulgu Oluştur
               <span className="px-2 py-0.5 bg-white/10 rounded text-[10px] font-normal text-white/70 border border-white/10">v3.0</span>
            </h2>
            <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                <span className="font-mono text-emerald-400">WIF Motoru Devrede</span>
                <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                <span>WP: {workpaperId || 'GENEL'}</span>
            </div>
        </div>
        
        <div className="flex items-center gap-4">
            {/* SLA Badge */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-black/30 border border-white/10 rounded-lg">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs font-bold text-slate-400">SLA:</span>
                <span className="text-xs font-mono font-bold text-white">
                    {formData.sla_type === 'FIXED_DATE' ? liveRisk.due_date : `${liveRisk.target_sprints} Sprint`}
                </span>
            </div>

            {/* Veto Badge */}
            {liveRisk.is_veto_triggered && (
                <div className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-200 text-xs font-bold border border-red-500/40 flex items-center gap-1.5 animate-pulse">
                    <AlertTriangle className="w-3.5 h-3.5" /> VETO
                </div>
            )}

            {/* Risk Skoru */}
            <div style={{ backgroundColor: liveRisk.color_code }} className="px-3 py-1.5 rounded-lg text-white font-black text-xs tracking-wider shadow-md border border-white/20">
                {SEVERITY_TR[liveRisk.severity] || liveRisk.severity}: {liveRisk.calculated_score.toFixed(1)}
            </div>

            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors">
                <X size={20}/>
            </button>
        </div>
      </div>

      {/* BODY */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        
        {/* TEMEL BİLGİLER KARTI (Her zaman görünür veya üstte) */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <FileSearch size={16}/> Temel Bilgiler
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Bulgu Başlığı *</label>
                    <input 
                        type="text" 
                        value={formData.title} 
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 bg-white transition-all text-sm font-semibold" 
                        placeholder="Örn: Kasa İşlemlerinde Çift Anahtar Kuralı İhlali" 
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Referans No</label>
                    <input 
                        type="text" 
                        value={formData.code} 
                        onChange={(e) => setFormData({ ...formData, code: e.target.value })} 
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-slate-50 text-sm font-mono" 
                        placeholder="Otomatik Üretilir"
                        disabled 
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">GIAS Kategorisi</label>
                    <select 
                        value={formData.gias_category} 
                        onChange={(e) => setFormData({ ...formData, gias_category: e.target.value })} 
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 text-sm font-medium bg-white"
                    >
                      <option value="">Seçiniz...</option>
                      {giasCategories.map(cat => <option key={cat.id} value={cat.label}>{cat.label}</option>)}
                    </select>
                </div>
            </div>
        </div>

        {/* SECTION TABS */}
        <div className="flex gap-2 p-1 bg-slate-200/50 rounded-xl">
            {sections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              return (
                <button 
                    key={section.id} 
                    onClick={() => setActiveSection(section.id)} 
                    className={clsx(
                        'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-bold text-xs transition-all', 
                        isActive 
                            ? `bg-white text-${section.color}-700 shadow-sm ring-1 ring-black/5` 
                            : 'text-slate-500 hover:bg-white/50 hover:text-slate-700'
                    )}
                >
                  <Icon className="w-4 h-4" />{section.label}
                </button>
              );
            })}
        </div>

        {/* --- TAB 1: KRİTER & TESPİT --- */}
        {activeSection === 'tespit' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-4">
                {/* Kriter */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[500px]">
                    <div className="p-3 border-b border-slate-100 bg-slate-50/50 rounded-t-xl flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-700 uppercase flex items-center gap-2">
                            <BookOpen size={14} className="text-blue-600"/> Kriter (Criteria)
                        </span>
                        <button className="text-[10px] font-bold bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:border-blue-200 transition-colors">
                            Kütüphaneden Seç
                        </button>
                    </div>
                    <div className="flex-1 flex flex-col">
                        <RichTextEditor 
                            value={formData.criteria_html} 
                            onChange={(val) => setFormData({...formData, criteria_html: val})} 
                            placeholder="Mevzuat, politika veya prosedür maddesi..." 
                            minHeight="min-h-full" 
                        />
                    </div>
                </div>

                {/* Tespit */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[500px]">
                    <div className="p-3 border-b border-slate-100 bg-slate-50/50 rounded-t-xl flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-700 uppercase flex items-center gap-2">
                            <FileSearch size={14} className="text-blue-600"/> Tespit (Condition)
                        </span>
                        <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded border border-emerald-100">
                            <Sparkles size={10}/> AI Destek
                        </span>
                    </div>
                    <div className="flex-1 flex flex-col">
                        <RichTextEditor 
                            value={formData.detection_html} 
                            onChange={(val) => setFormData({...formData, detection_html: val})} 
                            placeholder="Saha çalışmasında tespit edilen bulguyu detaylı olarak açıklayın..." 
                            minHeight="min-h-full" 
                        />
                    </div>
                </div>
            </div>
        )}

        {/* --- TAB 2: RİSK & ETKİ --- */}
        {activeSection === 'risk' && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-in fade-in slide-in-from-right-4">
                <div className="xl:col-span-2 flex flex-col gap-6">
                    {/* Çoklu Risk Seçimi */}
                    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-violet-50 rounded-lg text-violet-600"><AlertCircle size={20} /></div>
                            <div>
                                <h3 className="font-bold text-slate-800 text-sm">Risk Kategorizasyonu</h3>
                                <p className="text-xs text-slate-500">Bu bulgu hangi risk türlerini barındırıyor?</p>
                            </div>
                        </div>
                        <MultiSelectDropdown 
                            options={riskTypes} 
                            selected={formData.selected_risk_categories} 
                            onChange={(val) => setFormData({...formData, selected_risk_categories: val})} 
                            placeholder="Risk Türlerini Seçiniz..." 
                        />
                        {formData.selected_risk_categories.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-2">
                                {formData.selected_risk_categories.map(id => {
                                    const category = riskTypes.find(c => c.id === id);
                                    return <span key={id} className="px-2.5 py-1 bg-violet-50 text-violet-700 text-[10px] font-bold rounded-md border border-violet-100">{category?.label}</span>
                                })}
                            </div>
                        )}
                    </div>

                    {/* Etki Editörü */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col min-h-[400px]">
                        <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                            <TrendingUp size={16} className="text-orange-600"/> Risk ve Etki Açıklaması (Effect)
                        </h3>
                        <div className="flex-1">
                            <RichTextEditor 
                                value={formData.impact_html} 
                                onChange={(val) => setFormData({...formData, impact_html: val})} 
                                placeholder="Kurum üzerindeki etkileri açıklayın..." 
                                minHeight="min-h-[250px]" 
                            />
                        </div>
                    </div>
                </div>

                {/* Sağ Panel: WIF Motoru */}
                <div className="flex flex-col gap-6">
                    <div className="bg-white rounded-xl p-5 border border-orange-100 shadow-sm ring-1 ring-inset ring-orange-50/50">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-5 pb-3 border-b border-slate-100">Etki Motoru (WIF)</h3>
                        
                        <RiskSlider label="Finansal Etki" value={formData.impact_financial} onChange={v => setFormData({...formData, impact_financial: v})} icon={Banknote} />
                        <RiskSlider label="Yasal Etki" value={formData.impact_legal} onChange={v => setFormData({...formData, impact_legal: v})} icon={Scale} />
                        <RiskSlider label="İtibar Etkisi" value={formData.impact_reputation} onChange={v => setFormData({...formData, impact_reputation: v})} icon={Building} />
                        <RiskSlider label="Operasyonel Etki" value={formData.impact_operational} onChange={v => setFormData({...formData, impact_operational: v})} icon={HeartPulse} />
                        
                        <div className="my-5 border-t border-slate-100"></div>
                        
                        <RiskSlider label="Olasılık" value={formData.likelihood_score} onChange={v => setFormData({...formData, likelihood_score: v})} icon={ChevronsRight} />
                        <RiskSlider label="Kontrol Zafiyeti" value={formData.control_weakness} onChange={v => setFormData({...formData, control_weakness: v})} icon={ShieldCheck} />
                        
                        <div className="mt-6 pt-5 border-t border-slate-100">
                            <label className="block text-xs font-bold text-slate-500 mb-2">Ölçülebilir Finansal Etki (TL)</label>
                            <input 
                                type="text" 
                                value={formatCurrency(formData.financial_impact)} 
                                onChange={handleFinancialImpactChange} 
                                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white text-sm font-bold text-slate-800" 
                                placeholder="0" 
                            />
                        </div>
                    </div>

                    {/* Veto Kapıları */}
                    <div className="space-y-3">
                        <div className="bg-emerald-50 rounded-xl border border-emerald-100 p-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Scale className="w-4 h-4 text-emerald-600"/>
                                <span className="text-xs font-bold text-emerald-900">Şer'i Uyum İhlali</span>
                            </div>
                            <button onClick={() => setFormData({...formData, isShariahRisk: !formData.isShariahRisk})}>
                                {formData.isShariahRisk ? <ToggleRight className="w-8 h-8 text-emerald-600" /> : <ToggleLeft className="w-8 h-8 text-emerald-300" />}
                            </button>
                        </div>
                        {formData.isShariahRisk && (
                            <div className="p-4 bg-white border border-emerald-100 rounded-xl animate-in fade-in">
                                <RiskSlider label="İhlal Şiddeti" value={formData.shariah_impact} onChange={v => setFormData({...formData, shariah_impact: v})} icon={Scale} />
                            </div>
                        )}

                        <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-blue-600"/>
                                <span className="text-xs font-bold text-slate-700">Siber Risk (Veto)</span>
                            </div>
                            <button onClick={() => setFormData({...formData, isItRisk: !formData.isItRisk})}>
                                {formData.isItRisk ? <ToggleRight className="w-8 h-8 text-blue-600" /> : <ToggleLeft className="w-8 h-8 text-slate-300" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* --- TAB 3: KÖK NEDEN --- */}
        {activeSection === 'koken' && (
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm animate-in fade-in slide-in-from-right-4 h-[500px] flex flex-col">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                    <h3 className="text-sm font-bold text-slate-700 uppercase flex items-center gap-2">
                        <AlertTriangle size={16} className="text-red-600"/> Kök Neden Analizi
                    </h3>
                    <button 
                        onClick={() => setIsRcaDrawerOpen(true)} 
                        className="px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition-colors text-xs font-bold flex items-center gap-2 shadow-sm"
                    >
                        <Wand2 size={14}/> RCA Laboratuvarı
                    </button>
                </div>
                
                <div className="mb-4">
                    <label className="block text-xs font-bold text-slate-500 mb-2">Kategori</label>
                    <select 
                        value={formData.rca_category} 
                        onChange={(e) => setFormData({ ...formData, rca_category: e.target.value })} 
                        className="w-full md:w-1/2 px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 bg-white text-sm"
                    >
                      <option value="">Seçiniz...</option>
                      {rcaCategories.map(cat => <option key={cat.id} value={cat.label}>{cat.label}</option>)}
                    </select>
                </div>

                <div className="flex-1 flex flex-col">
                    <RichTextEditor 
                        value={formData.root_cause_html} 
                        onChange={(val) => setFormData({...formData, root_cause_html: val})} 
                        placeholder="Kök neden analiz sonucunu buraya yazın..." 
                        minHeight="min-h-full" 
                    />
                </div>
            </div>
        )}

        {/* --- TAB 4: ÖNERİ --- */}
        {activeSection === 'oneri' && (
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm animate-in fade-in slide-in-from-right-4 h-[500px] flex flex-col">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                    <h3 className="text-sm font-bold text-slate-700 uppercase flex items-center gap-2">
                        <Lightbulb size={16} className="text-emerald-600"/> Öneri (Recommendation)
                    </h3>
                    <button className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold flex items-center gap-1">
                        <Sparkles size={12}/> AI Öneri Üret
                    </button>
                </div>
                <div className="flex-1 flex flex-col">
                    <RichTextEditor 
                        value={formData.recommendation_html} 
                        onChange={(val) => setFormData({...formData, recommendation_html: val})} 
                        placeholder="Aksiyon önerilerinizi buraya yazın..." 
                        minHeight="min-h-full" 
                    />
                </div>
            </div>
        )}

      </div>

      {/* FOOTER ACTION BAR */}
      <div className="p-4 bg-white border-t border-slate-200 sticky bottom-0 z-20 flex justify-between items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <button onClick={onClose} disabled={isSubmitting} className="px-6 py-2.5 text-slate-500 font-bold hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors text-sm">
              İptal Et
          </button>
          
          <div className="flex gap-3">
              <button onClick={() => handleSaveWrapper('DRAFT')} disabled={isSubmitting} className="px-6 py-2.5 bg-white border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 rounded-lg transition-colors text-sm shadow-sm">
                  Taslak Olarak Kaydet
              </button>
              <button onClick={() => handleSaveWrapper('PUBLISHED')} disabled={isSubmitting} className="px-8 py-2.5 bg-slate-900 text-white font-bold hover:bg-slate-800 rounded-lg transition-all shadow-lg flex items-center gap-2 text-sm disabled:opacity-70">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin"/> : <Save size={16}/>} Bulguyu Sisteme İşle
              </button>
          </div>
      </div>

      {/* RCA DRAWER BAĞLANTISI */}
      <RootCauseDrawer 
        isOpen={isRcaDrawerOpen} 
        onClose={() => setIsRcaDrawerOpen(false)} 
        onApply={(html) => { 
            setFormData({...formData, root_cause_html: formData.root_cause_html + html}); 
            setIsRcaDrawerOpen(false); 
        }} 
      />

    </div>
  );
}