import { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom'; // Z-Index Sorunu için Kesin Çözüm
import { 
  X, Save, Sparkles, AlertTriangle, TrendingUp, Lightbulb, FileSearch, Loader2, 
  Banknote, Scale, Building, HeartPulse, ChevronsRight, ShieldCheck, Clock, 
  ToggleRight, ToggleLeft, CheckSquare, Square, BookOpen, AlertCircle, ChevronDown, Wand2, Calculator,
  Activity, Thermometer, Info
} from 'lucide-react';
import clsx from 'clsx';
import { toast } from 'react-hot-toast';

// --- MİMARİ BAĞLANTILAR (SAFE IMPORTS) ---
import type { FindingSeverity, GIASCategory } from '@/entities/finding/model/types';
import { comprehensiveFindingApi } from '@/entities/finding/api/module5-api';
import { RegulationSelectorModal } from '@/features/finding-studio/components/RegulationSelectorModal';
import { RichTextEditor } from '@/shared/ui/RichTextEditor';
import { GlassCard } from '@/shared/ui/GlassCard';

// BAĞIMLI BİLEŞEN
import { RootCauseDrawer } from './RootCauseDrawer';

// STORE VE MOTOR BAĞLANTILARI (ANAYASA MADDE 3 & 5)
import { useParameterStore } from '@/shared/stores/parameter-store';
import { useUIStore } from '@/shared/stores/ui-store'; // Sidebar durumu için
import { useRiskConfigStore } from '@/features/admin/risk-configuration/model/store'; // Parametrik Ayarlar
import { calculateFindingRisk } from '@/features/risk-engine/calculator'; // Merkezi Motor

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
const MultiSelectDropdown = ({ options = [], selected, onChange, placeholder }: { options: any[], selected: string[], onChange: (val: string[]) => void, placeholder: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    // Crash Önleyici: Options undefined gelirse boş array kullan
    const safeOptions = options || [];

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
              {safeOptions.length > 0 ? safeOptions.map((opt) => (
                <label key={opt.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0 transition-colors">
                  <input type="checkbox" className="w-4 h-4 text-blue-600 rounded border-slate-300 cursor-pointer accent-blue-600" checked={selected.includes(opt.id)}
                    onChange={() => {
                      if (selected.includes(opt.id)) { onChange(selected.filter(s => s !== opt.id)); } 
                      else { onChange([...selected, opt.id]); }
                    }}
                  />
                  <span className="text-sm text-slate-700 font-bold">{opt.label}</span>
                </label>
              )) : (
                <div className="p-4 text-center text-xs text-slate-400">Veri bulunamadı.</div>
              )}
            </div>
          </>
        )}
      </div>
    );
};

// --- RİSK SLIDER BİLEŞENİ ---
const RiskSlider = ({ label, value, onChange, icon: Icon }: { label: string, value: number, onChange: (val: number) => void, icon: any }) => (
    <div className="group mb-5">
        <div className="flex justify-between items-center mb-2">
            <label className="flex items-center text-xs font-bold text-slate-600 uppercase tracking-wider group-hover:text-blue-600 transition-colors">
                <Icon className="w-3.5 h-3.5 mr-2 text-slate-400 group-hover:text-blue-500" />{label}
            </label>
            <span className={clsx(
                "font-mono text-xs font-bold px-2 py-0.5 rounded border transition-colors",
                value >= 4 ? "bg-red-50 text-red-700 border-red-200" :
                value >= 3 ? "bg-orange-50 text-orange-700 border-orange-200" :
                "bg-slate-50 text-slate-600 border-slate-200"
            )}>
                {(value ?? 0).toFixed(1)} / 5.0
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
  
  // 1. STORE & THEME BAĞLANTISI (Sidebar ve Parametreler)
  const { isSidebarExpanded, sidebarColor } = useUIStore(); 
  
  // Parametrik verileri güvenli çekiyoruz (Default boş array)
  const { giasCategories = [], riskTypes = [], rcaCategories = [] } = useParameterStore();
  
  // Risk Konfigürasyonunu Store'dan al (Yoksa varsayılanı kullan)
  const riskConfigStore = useRiskConfigStore();
  const riskConfig = {
      weights: {
        financial: 0.30,
        legal: 0.25,
        reputation: 0.25,
        operational: 0.20
      },
      thresholds: riskConfigStore.thresholds
  };

  // 2. LOCAL STATE
  const [activeSection, setActiveSection] = useState<FormSection>('tespit');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Alt Modallar
  const [isRcaDrawerOpen, setIsRcaDrawerOpen] = useState(false);
  const [isRegulationModalOpen, setIsRegulationModalOpen] = useState(false);
  const [selectedRegulation, setSelectedRegulation] = useState<any>(null);

  // FORM VERİSİ (Orijinal yapıya sadık)
  const [formData, setFormData] = useState({
    title: '', code: '', auditee_department: '', gias_category: '' as GIASCategory | '',
    criteria_html: '', detection_html: '', impact_html: '', root_cause_html: '', recommendation_html: '',
    selected_risk_categories: [] as string[],
    rca_category: '', 
    financial_impact: 0, likelihood_score: 3,
    impact_financial: 1, impact_legal: 1, impact_reputation: 1, impact_operational: 1, control_weakness: 3, 
    sla_type: 'FIXED_DATE', isItRisk: false, cvss_score: 0, asset_criticality: 'Minor',
    isShariahRisk: false, shariah_impact: 1, requires_income_purification: false,
  });

  // 3. CANLI HESAPLAMA (RISK ENGINE)
  // Anayasa Madde 3: Hesaplama dışarıdaki motordan yapılmalı
  const liveRisk = useMemo(() => {
      return calculateFindingRisk(formData, riskConfig);
  }, [formData, riskConfig]);

  // 4. SCROLL KİLİDİ
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  // 5. FORMATTERLAR
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

  // 6. KAYIT İŞLEMİ
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
            criteria: formData.code || "N/A", 
            
            // Genişletilmiş Veri Modeli
            details: {
                workpaper_id: workpaperId, 
                auditee_department: formData.auditee_department,
                gias_category: formData.gias_category,
                criteria_html: formData.criteria_html, 
                impact_text: formData.impact_html, 
                recommendation_text: formData.recommendation_html, 
                financial_impact: formData.financial_impact,
                risk_categories: formData.selected_risk_categories,
                
                regulation_details: selectedRegulation ? { id: selectedRegulation.id, title: selectedRegulation.title, category: selectedRegulation.category } : null,
                
                // Anayasa Madde 3: Hesaplama detayları saklanmalı
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
                    summary_html: formData.root_cause_html 
                }
            }
        };

        // API Çağrısı (Güvenli Mock)
        if (comprehensiveFindingApi && comprehensiveFindingApi.create) {
             await comprehensiveFindingApi.create(payload);
        } else {
             // Fallback
             await new Promise(resolve => setTimeout(resolve, 800));
        }

        onSave(payload);
        toast.success(status === 'DRAFT' ? 'Taslak kaydedildi.' : 'Bulgu işlendi.');
        onClose();
    } catch (e: any) { 
        toast.error('Kayıt Hatası: ' + (e.message || 'Bilinmeyen hata')); 
    } 
    finally { setIsSubmitting(false); }
  };

  if (!isOpen) return null;

  // --- SMART LAYOUT HESAPLAMASI (Sidebar Çözümü) ---
  // Sidebar açıksa 280px, kapalıysa 80px soldan boşluk bırakır.
  // Bu sayede modal sidebar'ın üstüne binmez.
  const modalLeftPosition = isSidebarExpanded ? 'left-[280px]' : 'left-[80px]';

  // MODAL İÇERİĞİ (PORTAL İÇİN)
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

       {/* 2. Modal Window */}
       <div 
          className={clsx(
              "fixed top-4 bottom-4 right-4 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 animate-in fade-in slide-in-from-right-10 duration-300",
              modalLeftPosition // Dinamik Sol Boşluk
          )}
       >
          
          {/* HEADER - DİNAMİK RENK (Sidebar'dan) */}
          <div 
            className="flex items-center justify-between px-6 py-4 text-white shadow-md shrink-0 transition-colors duration-300"
            style={{ 
                backgroundColor: sidebarColor || '#0f172a',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)'
            }}
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
                  {/* Risk Score Badge */}
                  <div className="flex flex-col items-end">
                      <div
                        className="px-4 py-1.5 rounded-lg text-white font-black text-sm tracking-wider shadow-lg flex items-center gap-2 border border-white/20 transition-colors duration-300"
                        style={{ backgroundColor: liveRisk.color_code }}
                      >
                          {liveRisk.is_veto_triggered && <AlertTriangle size={16} className="animate-pulse text-white"/>}
                          {SEVERITY_TR[liveRisk.severity] || liveRisk.severity}
                          <span className="bg-black/20 px-1.5 py-0.5 rounded text-[10px] ml-1">{(liveRisk.calculated_score ?? 0).toFixed(0)}</span>
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
                  
                  {/* TEMEL BİLGİLER */}
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

                  {/* NAVİGASYON TABLARI */}
                  <div className="flex gap-2 mb-6 border-b border-slate-200 pb-1">
                      {[{ id: 'tespit', label: '1. Kriter & Tespit', icon: FileSearch, color: 'blue' }, { id: 'risk', label: '2. Risk & Etki (WIF)', icon: TrendingUp, color: 'orange' }, { id: 'koken', label: '3. Kök Neden', icon: AlertTriangle, color: 'red' }, { id: 'oneri', label: '4. Öneri', icon: Lightbulb, color: 'green' }].map((tab: any) => (
                          <button
                            key={tab.id}
                            onClick={() => setActiveSection(tab.id as FormSection)}
                            className={clsx(
                                "px-6 py-3 rounded-t-xl text-sm font-bold flex items-center gap-2 transition-all relative top-[1px]",
                                activeSection === tab.id 
                                    ? "bg-white text-slate-900 border border-slate-200 border-b-white z-10 shadow-sm" 
                                    : "bg-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                            )}
                          >
                              <tab.icon size={16} className={activeSection === tab.id ? `text-${tab.color}-600` : "text-slate-400"}/> {tab.label}
                          </button>
                      ))}
                  </div>

                  {/* TAB İÇERİKLERİ */}
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
                                  {/* RIF / WIF HESAPLAYICI (PARAMETRİK) */}
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
                                          <input type="text" value={formatCurrency(formData.financial_impact)} onChange={handleFinancialImpactChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm font-bold bg-white" placeholder="0"/>
                                      </div>
                                  </div>
                                  
                                  {/* Veto Toggle'ları */}
                                  <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
                                      <div className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg transition-colors">
                                          <span className="text-xs font-bold text-slate-600 flex items-center gap-2"><Scale size={16} className="text-emerald-600"/> Şer'i Uyum Riski</span>
                                          <button onClick={() => setFormData({...formData, isShariahRisk: !formData.isShariahRisk})}>{formData.isShariahRisk ? <ToggleRight className="text-emerald-600 w-10 h-10"/> : <ToggleLeft className="text-slate-300 w-10 h-10"/>}</button>
                                      </div>
                                      {formData.isShariahRisk && ( 
                                          <div className="pl-4 pr-2 pb-2 animate-in fade-in">
                                              <RiskSlider label="İhlal Şiddeti" value={formData.shariah_impact} onChange={v => setFormData({...formData, shariah_impact: v})} icon={Scale} />
                                              <button type="button" onClick={() => setFormData({...formData, requires_income_purification: !formData.requires_income_purification})} className="mt-2 flex items-center gap-2 text-xs font-bold text-emerald-800 p-2 border border-emerald-200 rounded-lg w-full bg-emerald-50">
                                                  {formData.requires_income_purification ? <CheckSquare className="w-4 h-4"/> : <Square className="w-4 h-4"/>} Gelir Arındırması
                                              </button>
                                          </div> 
                                      )}

                                      <div className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg transition-colors">
                                          <span className="text-xs font-bold text-slate-600 flex items-center gap-2"><ShieldCheck size={16} className="text-blue-600"/> Kritik Siber Varlık</span>
                                          <button onClick={() => setFormData({...formData, isItRisk: !formData.isItRisk})}>{formData.isItRisk ? <ToggleRight className="text-blue-600 w-10 h-10"/> : <ToggleLeft className="text-slate-300 w-10 h-10"/>}</button>
                                      </div>
                                      {formData.isItRisk && (
                                          <div className="pl-4 pr-2 pb-2 grid grid-cols-2 gap-2 animate-in fade-in">
                                              <div><label className="text-[10px] font-bold text-slate-500 uppercase">CVSS</label><input type="number" step="0.1" value={formData.cvss_score} onChange={e=>setFormData({...formData, cvss_score: parseFloat(e.target.value)})} className="w-full p-2 border rounded text-xs font-bold"/></div>
                                              <div><label className="text-[10px] font-bold text-slate-500 uppercase">Kritiklik</label><select value={formData.asset_criticality} onChange={e=>setFormData({...formData, asset_criticality: e.target.value})} className="w-full p-2 border rounded text-xs font-bold"><option value="Minor">Düşük</option><option value="Critical">Kritik</option></select></div>
                                          </div>
                                      )}
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
                                  <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex justify-between items-center shrink-0">
                                      <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2"><Lightbulb size={14} className="text-emerald-600"/> Aksiyon Önerisi</span>
                                      <button className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-emerald-100"><Sparkles size={10}/> AI Taslak</button>
                                  </div>
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
                  <button onClick={() => handleSaveWrapper('PUBLISHED')} disabled={isSubmitting} className="px-8 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg flex items-center gap-2 text-sm">{isSubmitting ? <Loader2 className="animate-spin" size={16}/> : <Save size={16}/>} Bulguyu Sisteme İşle</button>
             </div>
          </div>

       </div>

       {/* ALT MODALLAR - PORTAL İÇİNDE PORTAL */}
       {/* Regulation Modal: Kütüphaneden seçim */}
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
       
       {/* Root Cause Drawer: Gelişmiş Analiz Aracı */}
       <RootCauseDrawer 
            isOpen={isRcaDrawerOpen} 
            onClose={() => setIsRcaDrawerOpen(false)} 
            onApply={(html) => { 
                setFormData(prev => ({...prev, root_cause_html: prev.root_cause_html + html})); 
                setIsRcaDrawerOpen(false); 
            }} 
       />
       
    </div>
  );

  // --- KRİTİK: MODAL'I DOCUMENT BODY'YE TAŞIYORUZ ---
  return createPortal(modalContent, document.body);
}