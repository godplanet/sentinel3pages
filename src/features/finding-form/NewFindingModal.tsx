import { useState, useMemo } from 'react';
import { 
  X, Save, Sparkles, AlertTriangle, TrendingUp, Lightbulb, FileSearch, Loader2, 
  Banknote, Scale, Building, HeartPulse, ChevronsRight, ShieldCheck, Clock, 
  ToggleRight, ToggleLeft, CheckSquare, Square, BookOpen, AlertCircle
} from 'lucide-react';
import clsx from 'clsx';
import { toast } from 'react-hot-toast';

import type { FindingSeverity } from '../../entities/finding/model/types';
import { comprehensiveFindingApi } from '../../entities/finding/api/module5-api';
import { RegulationSelectorModal } from '../finding-studio/components/RegulationSelectorModal';

// YENİ HARİKA BİLEŞENİMİZİ İÇE AKTARIYORUZ
import { RichTextEditor } from '@/shared/ui/RichTextEditor';

interface NewFindingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (finding: any) => void;
}

type FormSection = 'tespit' | 'risk' | 'koken' | 'oneri';

// --- UI ÇEVİRİ SÖZLÜĞÜ ---
const SEVERITY_TR: Record<string, string> = { CRITICAL: 'Kritik', HIGH: 'Yüksek', MEDIUM: 'Orta', LOW: 'Düşük', OBSERVATION: 'Gözlem' };

// --- BASEL RİSK KATEGORİLERİ (Parametrik Yapıya Hazırlık) ---
const RISK_CATEGORIES = [
  { id: 'operational', label: 'Operasyonel Risk', color: 'blue' },
  { id: 'legal', label: 'Yasal / Uyum Riski', color: 'indigo' },
  { id: 'reputation', label: 'İtibar Riski', color: 'violet' },
  { id: 'financial', label: 'Finansal Raporlama Riski', color: 'emerald' },
  { id: 'credit', label: 'Kredi Riski', color: 'rose' },
  { id: 'market', label: 'Piyasa Riski', color: 'orange' },
  { id: 'liquidity', label: 'Likidite Riski', color: 'cyan' },
  { id: 'strategic', label: 'Stratejik Risk', color: 'purple' },
  { id: 'cyber', label: 'Siber / Bilgi Güvenliği Riski', color: 'slate' },
];

// --- SENTINEL V3.0 RISK ENGINE ---
const BORDO = '#6A0000'; const KIZIL = '#DC143C'; const TURUNCU = '#FFA500'; const SARI = '#FFD700'; const YESIL = '#228B22';   

const calculateRiskEngine = (data: any) => {
    let finalScore = 0; let severity: FindingSeverity = 'OBSERVATION'; let color_code = YESIL; let is_veto_triggered = false; let veto_reason = undefined;

    // VETO GATES
    if (data.isShariahRisk && (data.shariah_impact >= 4 || data.requires_income_purification)) {
        finalScore = 100; severity = 'CRITICAL'; color_code = BORDO; is_veto_triggered = true; veto_reason = "Şer'i Uyum İhlali (Sıfır Tolerans)";
    } else if (data.isItRisk && data.cvss_score >= 9.0 && data.asset_criticality === 'Critical') {
        finalScore = 100; severity = 'CRITICAL'; color_code = BORDO; is_veto_triggered = true; veto_reason = "Kritik Siber Zafiyet (CVSS >= 9.0)";
    } else if (data.impact_legal === 5) {
        finalScore = 90; severity = 'HIGH'; color_code = KIZIL; is_veto_triggered = true; veto_reason = "Aşırı Yasal/Düzenleyici Risk";
    } else {
        const wif = (data.impact_financial * 0.30) + (data.impact_legal * 0.25) + (data.impact_reputation * 0.25) + (data.impact_operational * 0.20);
        const rawScore = wif * data.likelihood_score * (data.control_weakness / 2.5);
        finalScore = Math.min(100, (rawScore / 12.5) * 100);

        if (finalScore >= 80) { severity = 'CRITICAL'; color_code = BORDO; }
        else if (finalScore >= 60) { severity = 'HIGH'; color_code = KIZIL; }
        else if (finalScore >= 30) { severity = 'MEDIUM'; color_code = TURUNCU; }
        else if (finalScore >= 10) { severity = 'LOW'; color_code = SARI; }
        else { severity = 'OBSERVATION'; color_code = YESIL; }
    }

    const getFutureDate = (days: number) => {
        const d = new Date(); d.setDate(d.getDate() + days);
        return d.toISOString().split('T')[0];
    };

    let due_date = ''; let target_sprints = 0;
    if (data.sla_type === 'FIXED_DATE') {
        if (severity === 'CRITICAL') due_date = getFutureDate(2);
        else if (severity === 'HIGH') due_date = getFutureDate(30);
        else if (severity === 'MEDIUM') due_date = getFutureDate(60);
        else if (severity === 'LOW') due_date = getFutureDate(90);
    } else {
        if (severity === 'CRITICAL') target_sprints = 1;
        else if (severity === 'HIGH') target_sprints = 2;
        else if (severity === 'MEDIUM') target_sprints = 4;
        else target_sprints = 6;
    }
    return { calculated_score: finalScore, severity, color_code, is_veto_triggered, veto_reason, due_date, target_sprints };
};

const RiskSlider = ({ label, value, onChange, icon: Icon }: { label: string, value: number, onChange: (val: number) => void, icon: any }) => (
    <div className="group mb-4">
        <label className="flex items-center text-sm font-medium text-gray-700 mb-2 group-hover:text-blue-600 transition-colors">
            <Icon className="w-4 h-4 mr-2 text-gray-400 group-hover:text-blue-500" />{label}
        </label>
        <div className="flex items-center gap-4">
            <input type="range" min="1" max="5" step="0.1" value={value} onChange={e => onChange(parseFloat(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
            <span className="font-bold text-sm text-blue-700 w-12 text-center bg-blue-50 rounded-md py-1 border border-blue-100">{value.toFixed(1)}</span>
        </div>
    </div>
);


export const NewFindingModal = ({ isOpen, onClose, onSave }: NewFindingModalProps) => {
  const [activeSection, setActiveSection] = useState<FormSection>('tespit');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegulationModalOpen, setIsRegulationModalOpen] = useState(false);
  const [selectedRegulation, setSelectedRegulation] = useState<any>(null);

  const [formData, setFormData] = useState({
    title: '', code: '', auditee_department: '',
    
    // Zengin Metin Alanları
    criteria_html: '',   
    detection_html: '',  
    impact_html: '',    
    root_cause_html: '', 
    recommendation_html: '', 
    
    // Çoklu Risk Seçimi Array'i
    selected_risk_categories: [] as string[],
    
    rca_category: '', 
    financial_impact: 0, likelihood_score: 3,
    impact_financial: 1, impact_legal: 1, impact_reputation: 1, impact_operational: 1, control_weakness: 1,
    sla_type: 'FIXED_DATE', isItRisk: false, cvss_score: 0, asset_criticality: 'Minor',
    isShariahRisk: false, shariah_impact: 1, requires_income_purification: false,
  });

  const sections = [
    { id: 'tespit' as const, label: 'Kriter & Tespit', icon: FileSearch, color: 'blue' },
    { id: 'risk' as const, label: 'Risk & Etki', icon: TrendingUp, color: 'orange' },
    { id: 'koken' as const, label: 'Kök Neden', icon: AlertTriangle, color: 'red' },
    { id: 'oneri' as const, label: 'Öneri', icon: Lightbulb, color: 'green' },
  ];

  const liveRisk = useMemo(() => calculateRiskEngine(formData), [formData]);

  const toggleRiskCategory = (categoryId: string) => {
    setFormData(prev => {
        const current = prev.selected_risk_categories;
        if (current.includes(categoryId)) {
            return { ...prev, selected_risk_categories: current.filter(id => id !== categoryId) };
        } else {
            return { ...prev, selected_risk_categories: [...current, categoryId] };
        }
    });
  };

  const handleSave = async (status: 'DRAFT' | 'PUBLISHED' = 'DRAFT') => {
    if (!formData.title.trim()) { toast.error('Lütfen bulgu başlığı giriniz.'); return; }
    
    setIsSubmitting(true);

    try {
      const payload = {
        title: formData.title, severity: liveRisk.severity, status: status, category: 'Audit', engagement_id: 'GENERAL_AUDIT',
        
        description: formData.detection_html, 
        criteria: formData.code || "N/A", 
        
        details: {
          auditee_department: formData.auditee_department,
          criteria_html: formData.criteria_html, 
          impact_text: formData.impact_html, 
          recommendation_text: formData.recommendation_html, 
          financial_impact: formData.financial_impact,
          
          // Yeni Eklenen Çoklu Risk Kategorileri
          risk_categories: formData.selected_risk_categories,
          
          regulation_details: selectedRegulation ? { id: selectedRegulation.id, title: selectedRegulation.title, category: selectedRegulation.category } : null,
          risk_engine: {
              calculated_score: liveRisk.calculated_score, is_veto_triggered: liveRisk.is_veto_triggered, veto_reason: liveRisk.veto_reason,
              sla_target: formData.sla_type === 'FIXED_DATE' ? liveRisk.due_date : `${liveRisk.target_sprints} Sprint`,
              inputs: { financial: formData.impact_financial, legal: formData.impact_legal, reputation: formData.impact_reputation, operational: formData.impact_operational, likelihood: formData.likelihood_score, control: formData.control_weakness }
          },
          root_cause_analysis: { category: formData.rca_category, summary_html: formData.root_cause_html, has_advanced_analysis: false }
        }
      };

      await comprehensiveFindingApi.create(payload);
      toast.success(status === 'DRAFT' ? 'Bulgu taslak olarak kaydedildi!' : 'Bulgu başarıyla yayınlandı!');
      onSave(payload); onClose();
    } catch (error: any) {
      console.error('Kayıt Hatası Detayı:', error);
      toast.error(`Kayıt Başarısız: ${error?.message || error?.details || 'Bilinmeyen veritabanı hatası'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative min-h-screen flex items-center justify-center p-4">
        
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[95vh] flex flex-col overflow-hidden">
          
          {/* HEADER (SABİT BİLGİ ALANI - STICKY HEADER) */}
          <div className="bg-white border-b border-gray-200 z-10 shrink-0">
              <div className="flex items-start justify-between p-6 pb-4">
                <div className="flex-1 mr-8">
                  <div className="flex items-center gap-3 mb-3">
                      <div className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md font-mono text-xs font-bold border border-slate-200">
                          {formData.code || 'AUD-####'}
                      </div>
                      <div style={{ backgroundColor: liveRisk.color_code }} className="px-3 py-1 rounded-md text-white font-black text-xs tracking-wider shadow-sm transition-colors duration-300">
                          {SEVERITY_TR[liveRisk.severity]}
                      </div>
                      {liveRisk.is_veto_triggered && (
                          <div className="px-3 py-1 rounded-md bg-red-100 text-red-800 text-xs font-bold border border-red-200 flex items-center gap-1.5 animate-pulse">
                              <AlertTriangle className="w-3.5 h-3.5" /> VETO
                          </div>
                      )}
                  </div>
                  
                  <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
                         className="w-full text-2xl font-black text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-0 bg-transparent border-none p-0" 
                         placeholder="Bulgu başlığını buraya girin..." />
                  
                  <div className="flex items-center gap-4 mt-3 text-sm text-slate-500 font-medium">
                      <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-slate-400" />
                          <input type="text" value={formData.auditee_department} onChange={(e) => setFormData({ ...formData, auditee_department: e.target.value })} 
                                 className="w-64 focus:outline-none focus:border-b focus:border-blue-500 bg-transparent placeholder:text-slate-300" placeholder="Sorumlu Birim..." />
                      </div>
                      <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
                          <Clock className="w-4 h-4 text-slate-400" />
                          <span>SLA: <strong className="text-slate-700">{formData.sla_type === 'FIXED_DATE' ? liveRisk.due_date : `${liveRisk.target_sprints} Sprint`}</strong></span>
                      </div>
                  </div>
                </div>
                
                <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors bg-slate-50 border border-slate-200"><X className="w-5 h-5 text-slate-500" /></button>
              </div>

              {/* NAVIGATION TABS */}
              <div className="px-6 flex gap-1 -mb-px overflow-x-auto">
                {sections.map((section) => {
                  const Icon = section.icon;
                  const isActive = activeSection === section.id;
                  return (
                    <button key={section.id} onClick={() => setActiveSection(section.id)} 
                            className={clsx(
                                'flex items-center gap-2 px-6 py-3 font-bold text-sm transition-all border-b-2 whitespace-nowrap', 
                                isActive ? `border-${section.color}-500 text-${section.color}-700 bg-${section.color}-50/50` : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                            )}>
                      <Icon className={clsx("w-4 h-4", isActive ? `text-${section.color}-500` : "text-slate-400")} />
                      {section.label}
                    </button>
                  );
                })}
              </div>
          </div>

          {/* MAIN CONTENT AREA */}
          <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
            <div className="space-y-6 max-w-6xl mx-auto h-full">
              
              {/* KRİTER & TESPİT */}
              {activeSection === 'tespit' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-2 h-full min-h-[500px]">
                  {/* SOL: KRİTER */}
                  <div className="bg-white rounded-xl p-5 border border-indigo-100 shadow-sm flex flex-col h-full ring-1 ring-inset ring-indigo-50">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
                      <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center"><BookOpen className="w-4 h-4 text-indigo-600" /></div>
                          <div><h3 className="text-base font-bold text-slate-900">Kriter (Criteria)</h3></div>
                      </div>
                      <div className="flex flex-col xl:flex-row gap-2">
                          <button type="button" onClick={() => setIsRegulationModalOpen(true)} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-md hover:bg-indigo-100 transition-colors text-xs font-bold flex items-center gap-1.5 shadow-sm"><BookOpen size={14} /> Kütüphane</button>
                      </div>
                    </div>
                    {selectedRegulation && (
                        <div className="mb-4 p-3 bg-indigo-50/50 border border-indigo-100 rounded-lg flex items-start gap-3">
                            <Scale className="w-5 h-5 text-indigo-500 mt-0.5 shrink-0" />
                            <div><p className="text-xs font-bold text-indigo-900">{selectedRegulation.category} Mevzuatı</p><p className="text-xs text-indigo-700 mt-0.5 line-clamp-2">{selectedRegulation.title}</p></div>
                        </div>
                    )}
                    <div className="flex-1 flex flex-col min-h-0">
                        <RichTextEditor value={formData.criteria_html} onChange={(val) => setFormData({...formData, criteria_html: val})} placeholder="İhlal edilen kanun, mevzuat, standart veya düzenleme maddesini yazın..." minHeight="min-h-[250px] max-h-full" />
                    </div>
                  </div>

                  {/* SAĞ: TESPİT */}
                  <div className="bg-white rounded-xl p-5 border border-blue-100 shadow-sm flex flex-col h-full ring-1 ring-inset ring-blue-50">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center"><FileSearch className="w-4 h-4 text-blue-600" /></div>
                          <div><h3 className="text-base font-bold text-slate-900">Tespit (Condition)</h3></div>
                      </div>
                      <button type="button" className="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors text-xs font-bold flex items-center gap-1.5 shadow-sm"><Sparkles size={14} /> AI ile İyileştir</button>
                    </div>
                    <div className="flex-1 flex flex-col min-h-0">
                        <RichTextEditor value={formData.detection_html} onChange={(val) => setFormData({...formData, detection_html: val})} placeholder="Saha çalışmasında tespit edilen bulguyu detaylı olarak açıklayın..." minHeight="min-h-[250px] max-h-full" />
                    </div>
                  </div>
                </div>
              )}

              {/* RİSK & ETKİ */}
              {activeSection === 'risk' && (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2 h-full">
                    {/* SOL SÜTUN: RİSK TİPLERİ VE ETKİ AÇIKLAMASI (GENİŞLETİLDİ) */}
                    <div className="xl:col-span-2 flex flex-col gap-6">
                        
                        {/* ÇOKLU RİSK KATEGORİSİ SEÇİMİ (BASEL) */}
                        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                             <div className="flex items-center gap-3 mb-5">
                                <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center"><AlertCircle className="w-4 h-4 text-violet-600" /></div>
                                <div><h3 className="text-base font-bold text-slate-900">Risk Kategorizasyonu</h3><p className="text-xs text-slate-500">Bulgunun içerdiği risk türlerini seçin (Çoklu seçim yapılabilir)</p></div>
                             </div>
                             
                             <div className="flex flex-wrap gap-2.5">
                                 {RISK_CATEGORIES.map(cat => {
                                     const isSelected = formData.selected_risk_categories.includes(cat.id);
                                     return (
                                         <button type="button" key={cat.id} onClick={() => toggleRiskCategory(cat.id)}
                                            className={clsx(
                                                "px-4 py-2 rounded-lg text-sm font-bold border transition-all flex items-center gap-2",
                                                isSelected 
                                                    ? `bg-${cat.color}-50 border-${cat.color}-200 text-${cat.color}-700 shadow-sm ring-1 ring-${cat.color}-500/20` 
                                                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                                            )}
                                         >
                                             {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 opacity-40" />}
                                             {cat.label}
                                         </button>
                                     )
                                 })}
                             </div>
                        </div>

                        {/* ETKİ AÇIKLAMASI (RICH TEXT) */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col flex-1 min-h-[300px]">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center"><TrendingUp className="w-4 h-4 text-orange-600" /></div>
                                <div><h3 className="text-base font-bold text-slate-900">Etki Açıklaması (Effect)</h3><p className="text-xs text-slate-500">Seçilen risklerin organizasyon üzerindeki potansiyel etkileri</p></div>
                            </div>
                            <RichTextEditor value={formData.impact_html} onChange={(val) => setFormData({...formData, impact_html: val})} placeholder="Bu bulgunun kuruma maliyeti, operasyonel zorlukları veya yasal sonuçları neler olabilir?" minHeight="min-h-full" />
                        </div>
                    </div>

                    {/* SAĞ SÜTUN: VETO VE WIF MOTORU */}
                    <div className="flex flex-col gap-6">
                        {/* WIF MOTORU */}
                        <div className="bg-white rounded-xl p-5 border border-orange-100 shadow-sm ring-1 ring-inset ring-orange-50">
                            <h3 className="text-sm font-black text-slate-800 mb-4 pb-2 border-b border-slate-100">Etki Motoru (WIF)</h3>
                            <RiskSlider label="Finansal Etki" value={formData.impact_financial} onChange={v => setFormData({...formData, impact_financial: v})} icon={Banknote} />
                            <RiskSlider label="Yasal Etki" value={formData.impact_legal} onChange={v => setFormData({...formData, impact_legal: v})} icon={Scale} />
                            <RiskSlider label="İtibar Etkisi" value={formData.impact_reputation} onChange={v => setFormData({...formData, impact_reputation: v})} icon={Building} />
                            <RiskSlider label="Operasyonel Etki" value={formData.impact_operational} onChange={v => setFormData({...formData, impact_operational: v})} icon={HeartPulse} />
                            <div className="my-4 border-t border-slate-100"></div>
                            <RiskSlider label="Gerçekleşme Olasılığı" value={formData.likelihood_score} onChange={v => setFormData({...formData, likelihood_score: v})} icon={ChevronsRight} />
                            <RiskSlider label="Kontrol Zafiyeti" value={formData.control_weakness} onChange={v => setFormData({...formData, control_weakness: v})} icon={ShieldCheck} />
                            
                            <div className="mt-5 pt-4 border-t border-slate-100">
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">Ölçülebilir Finansal Etki (TL)</label>
                                <input type="number" value={formData.financial_impact} onChange={(e) => setFormData({ ...formData, financial_impact: parseFloat(e.target.value) })} className="w-full px-3 py-2 border border-slate-300 rounded-md bg-slate-50 focus:bg-white text-sm" placeholder="0" />
                            </div>
                        </div>

                        {/* VETO KAPILARI */}
                        <div className="space-y-4">
                            <div className="bg-emerald-50/50 rounded-xl border-2 border-emerald-100 overflow-hidden shadow-sm">
                                <div className="flex items-center justify-between p-3.5 bg-emerald-100/50">
                                    <div className="flex items-center gap-2"><Scale className="w-4 h-4 text-emerald-700"/><p className="font-bold text-xs text-emerald-900">Şer'i Uyum İhlali</p></div>
                                    <button type="button" onClick={() => setFormData({...formData, isShariahRisk: !formData.isShariahRisk})}>{formData.isShariahRisk ? <ToggleRight className="w-8 h-8 text-emerald-600" /> : <ToggleLeft className="w-8 h-8 text-emerald-200" />}</button>
                                </div>
                                {formData.isShariahRisk && (
                                    <div className="p-4 border-t border-emerald-100 bg-white">
                                        <RiskSlider label="Şer'i İhlal Etkisi" value={formData.shariah_impact} onChange={v => setFormData({...formData, shariah_impact: v})} icon={Scale} />
                                        <button type="button" onClick={() => setFormData({...formData, requires_income_purification: !formData.requires_income_purification})} className="mt-3 flex items-center gap-2 text-xs font-bold text-emerald-800 p-2.5 border border-emerald-200 rounded-md w-full bg-emerald-50 hover:bg-emerald-100 transition-colors">
                                            {formData.requires_income_purification ? <CheckSquare className="w-4 h-4 text-emerald-600"/> : <Square className="w-4 h-4 text-emerald-400"/>} Gelir Arındırması Gerektirir
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="bg-slate-50/50 rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                                <div className="flex items-center justify-between p-3.5 bg-slate-100/50">
                                    <div><p className="font-bold text-xs text-slate-800">IT / Siber Risk Veto Kapısı</p></div>
                                    <button type="button" onClick={() => setFormData({...formData, isItRisk: !formData.isItRisk})}>{formData.isItRisk ? <ToggleRight className="w-8 h-8 text-blue-600" /> : <ToggleLeft className="w-8 h-8 text-slate-300" />}</button>
                                </div>
                                {formData.isItRisk && (
                                    <div className="p-4 grid grid-cols-2 gap-3 border-t border-slate-200 bg-white">
                                        <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">CVSS Skoru</label><input type="number" step="0.1" value={formData.cvss_score} onChange={e=>setFormData({...formData, cvss_score: parseFloat(e.target.value)})} className="w-full p-2 border border-slate-300 rounded-md text-sm"/></div>
                                        <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Varlık Kritiği</label><select value={formData.asset_criticality} onChange={e=>setFormData({...formData, asset_criticality: e.target.value})} className="w-full p-2 border border-slate-300 rounded-md text-sm"><option value="Minor">Düşük</option><option value="Major">Orta</option><option value="Critical">Kritik</option></select></div>
                                    </div>
                                )}
                            </div>
                            
                            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
                                <div><p className="font-bold text-xs text-slate-800">Aksiyon Tipi (SLA)</p><p className="text-[10px] text-slate-500 mt-0.5">Teslim tarihi algoritması</p></div>
                                <select value={formData.sla_type} onChange={e => setFormData({...formData, sla_type: e.target.value})} className="px-3 py-1.5 border border-slate-300 rounded-md bg-slate-50 text-sm font-medium"><option value="FIXED_DATE">Takvim Günü</option><option value="AGILE_SPRINT">Agile Sprint</option></select>
                            </div>
                        </div>
                    </div>
                </div>
              )}

              {/* SADELEŞTİRİLMİŞ KÖK NEDEN (RCA) ALANI */}
              {activeSection === 'koken' && (
                <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-2 h-full flex flex-col">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-4 border-b border-slate-100 gap-4 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center"><AlertTriangle className="w-5 h-5 text-red-600" /></div>
                        <div><h3 className="text-lg font-semibold text-slate-900">Kök Neden Özeti (Cause)</h3><p className="text-sm text-slate-500">Bulgunun kaynağına dair temel değerlendirme</p></div>
                    </div>
                    <button type="button" className="px-5 py-2.5 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition-colors text-sm font-bold flex items-center justify-center gap-2 shadow-sm ring-1 ring-inset ring-red-100">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                        Gelişmiş RCA Aracı (5-Whys, Ishikawa)
                    </button>
                  </div>
                  
                  <div className="mb-6 shrink-0">
                      <label className="block text-sm font-bold text-slate-700 mb-2">Kök Neden Kategorisi</label>
                      <select value={formData.rca_category} onChange={(e) => setFormData({ ...formData, rca_category: e.target.value })} className="w-full md:w-1/2 px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 bg-white shadow-sm">
                        <option value="">Kategori Seçiniz...</option>
                        <option value="insan">İnsan Hatası / Farkındalık Eksikliği</option>
                        <option value="sistem">Sistem / Altyapı / Yazılım Hatası</option>
                        <option value="surec">Süreç Tasarımı / Prosedür Eksikliği</option>
                        <option value="dis">Dış Etken / Üçüncü Taraf</option>
                      </select>
                  </div>

                  <div className="flex-1 flex flex-col min-h-0">
                      <label className="block text-sm font-bold text-slate-700 mb-2">Kök Neden Açıklaması</label>
                      <RichTextEditor value={formData.root_cause_html} onChange={(val) => setFormData({...formData, root_cause_html: val})} placeholder="Kök neden analizinizin sonucunu detaylı olarak açıklayın..." minHeight="min-h-full" />
                  </div>
                </div>
              )}

              {/* ÖNERİ */}
              {activeSection === 'oneri' && (
                <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-2 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-5 shrink-0 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center"><Lightbulb className="w-5 h-5 text-emerald-600" /></div>
                        <div><h3 className="text-lg font-semibold text-slate-900">Öneri (Recommendation)</h3><p className="text-sm text-slate-500">Yönetime sunulan aksiyon planı önerileri</p></div>
                    </div>
                    <button type="button" className="px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors text-sm font-bold flex items-center gap-2 shadow-sm"><Sparkles className="w-4 h-4" /> AI Taslak Oluştur</button>
                  </div>
                  <div className="flex-1 flex flex-col min-h-0">
                    <RichTextEditor value={formData.recommendation_html} onChange={(val) => setFormData({...formData, recommendation_html: val})} placeholder="Bulgunun düzeltilmesi için önerilerinizi zengin metin olarak yazın..." minHeight="min-h-full" />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between p-5 border-t border-slate-200 bg-white rounded-b-xl shrink-0">
            <button onClick={onClose} disabled={isSubmitting} className="px-6 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-bold border border-transparent hover:border-slate-200">İptal Et</button>
            <div className="flex gap-3">
              <button onClick={() => handleSave('DRAFT')} className="px-6 py-2.5 bg-white text-slate-700 border border-slate-300 shadow-sm rounded-lg hover:bg-slate-50 transition-colors font-bold" disabled={isSubmitting}>Taslak Olarak Kaydet</button>
              <button onClick={() => handleSave('PUBLISHED')} disabled={isSubmitting} className="px-8 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all font-black flex items-center gap-2 shadow-md hover:shadow-lg disabled:opacity-70">
                {isSubmitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Kaydediliyor...</> : <><Save className="w-5 h-5" /> Bulguyu Sisteme İşle</>}
              </button>
            </div>
          </div>
        </div>
      </div>

      <RegulationSelectorModal isOpen={isRegulationModalOpen} onClose={() => setIsRegulationModalOpen(false)} onSelect={(reg) => { const regHtml = `<p><strong>Kategori:</strong> ${reg.category}</p><p><strong>Mevzuat:</strong> ${reg.title}</p><p><strong>Detay:</strong> ${reg.description}</p>`; setFormData(prev => ({ ...prev, code: reg.code, criteria_html: regHtml })); setSelectedRegulation(reg); }} />
    </div>
  );
};