import { useState, useMemo } from 'react';
import { 
  X, Save, Sparkles, AlertTriangle, TrendingUp, Lightbulb, FileSearch, Loader2, 
  Banknote, Scale, Building, HeartPulse, ChevronsRight, ShieldCheck, Clock, 
  ToggleRight, ToggleLeft, CheckSquare, Square 
} from 'lucide-react';
import clsx from 'clsx';
import { toast } from 'react-hot-toast';

import type { FindingSeverity, GIASCategory } from '../../entities/finding/model/types';
import { comprehensiveFindingApi } from '../../entities/finding/api/module5-api';

interface NewFindingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (finding: any) => void;
}

type FormSection = 'tespit' | 'risk' | 'koken' | 'oneri';

// --- SENTINEL V3.0 RISK ENGINE (WIF + VETO + SLA) ---
const BORDO = '#6A0000'; 
const KIZIL = '#DC143C'; 
const TURUNCU = '#FFA500'; 
const SARI = '#FFD700';    
const YESIL = '#228B22';   

const calculateRiskEngine = (data: any) => {
    let finalScore = 0;
    let severity: FindingSeverity = 'OBSERVATION';
    let color_code = YESIL;
    let is_veto_triggered = false;
    let veto_reason = undefined;

    // 1. VETO GATES
    if (data.isShariahRisk && (data.shariah_impact >= 4 || data.requires_income_purification)) {
        finalScore = 100; severity = 'CRITICAL'; color_code = BORDO; is_veto_triggered = true; veto_reason = "Şer'i Uyum İhlali (Sıfır Tolerans)";
    }
    else if (data.isItRisk && data.cvss_score >= 9.0 && data.asset_criticality === 'Critical') {
        finalScore = 100; severity = 'CRITICAL'; color_code = BORDO; is_veto_triggered = true; veto_reason = "Kritik Siber Zafiyet (CVSS >= 9.0)";
    }
    else if (data.impact_legal === 5) {
        finalScore = 90; severity = 'HIGH'; color_code = KIZIL; is_veto_triggered = true; veto_reason = "Aşırı Yasal/Düzenleyici Risk";
    }
    // 2. STANDARD WIF CALCULATION
    else {
        const wif = (data.impact_financial * 0.30) + (data.impact_legal * 0.25) + (data.impact_reputation * 0.25) + (data.impact_operational * 0.20);
        const rawScore = wif * data.likelihood_score * (data.control_weakness / 2.5);
        finalScore = Math.min(100, (rawScore / 12.5) * 100);

        if (finalScore >= 80) { severity = 'CRITICAL'; color_code = BORDO; }
        else if (finalScore >= 60) { severity = 'HIGH'; color_code = KIZIL; }
        else if (finalScore >= 30) { severity = 'MEDIUM'; color_code = TURUNCU; }
        else if (finalScore >= 10) { severity = 'LOW'; color_code = SARI; }
        else { severity = 'OBSERVATION'; color_code = YESIL; }
    }

    // 3. DYNAMIC SLA ENGINE (Native JS Date)
    const getFutureDate = (days: number) => {
        const d = new Date();
        d.setDate(d.getDate() + days);
        return d.toISOString().split('T')[0];
    };

    let due_date = '';
    let target_sprints = 0;

    if (data.sla_type === 'FIXED_DATE') {
        if (severity === 'CRITICAL') due_date = getFutureDate(2); // 48 Hours
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

// --- REUSABLE SLIDER COMPONENT ---
const RiskSlider = ({ label, value, onChange, icon: Icon }: { label: string, value: number, onChange: (val: number) => void, icon: any }) => (
    <div className="group mb-4">
        <label className="flex items-center text-sm font-medium text-gray-700 mb-2 group-hover:text-blue-600 transition-colors">
            <Icon className="w-4 h-4 mr-2 text-gray-400 group-hover:text-blue-500" />
            {label}
        </label>
        <div className="flex items-center gap-4">
            <input type="range" min="1" max="5" step="0.1" value={value} onChange={e => onChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
            <span className="font-bold text-sm text-blue-700 w-12 text-center bg-blue-50 rounded-md py-1 border border-blue-100">
                {value.toFixed(1)}
            </span>
        </div>
    </div>
);

export const NewFindingModal = ({ isOpen, onClose, onSave }: NewFindingModalProps) => {
  const [activeSection, setActiveSection] = useState<FormSection>('tespit');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State (Combined original state + new risk engine state)
  const [formData, setFormData] = useState({
    title: '',
    code: '',
    gias_category: '' as GIASCategory | '',
    auditee_department: '',
    detection: '', 
    impact: '',    
    root_cause: '', 
    recommendation: '', 
    financial_impact: 0,
    
    // Legacy mapping (kept for backward compatibility with your DB)
    impact_score: 3,
    likelihood_score: 3,

    // 5-Whys
    why_1: '', why_2: '', why_3: '', why_4: '', why_5: '',

    // Sentinel V3 Risk Variables
    impact_financial: 1,
    impact_legal: 1,
    impact_reputation: 1,
    impact_operational: 1,
    control_weakness: 1,
    sla_type: 'FIXED_DATE',

    // Veto Modules
    isItRisk: false,
    cvss_score: 0,
    asset_criticality: 'Minor',
    isShariahRisk: false,
    shariah_impact: 1,
    requires_income_purification: false,
  });

  const sections = [
    { id: 'tespit' as const, label: 'Tespit', icon: FileSearch, color: 'blue' },
    { id: 'risk' as const, label: 'Risk & Etki', icon: TrendingUp, color: 'orange' },
    { id: 'koken' as const, label: 'Kök Neden', icon: AlertTriangle, color: 'red' },
    { id: 'oneri' as const, label: 'Öneri', icon: Lightbulb, color: 'green' },
  ];

  // Live Risk Calculation
  const liveRisk = useMemo(() => calculateRiskEngine(formData), [formData]);

  const handleSave = async (status: 'DRAFT' | 'PUBLISHED' = 'DRAFT') => {
    // 1. Validasyon
    if (!formData.title.trim()) {
      toast.error('Lütfen bulgu başlığı giriniz.');
      return;
    }
    if (!formData.code.trim()) {
      toast.error('Lütfen referans no giriniz.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 2. API Payload Hazırlığı (Sizin orijinal yapınıza risk motoru eklendi)
      const payload = {
        title: formData.title,
        severity: liveRisk.severity, // Motorun belirlediği seviye
        status: status,
        category: 'Audit',
        engagement_id: 'GENERAL_AUDIT',
        
        description: formData.detection,
        criteria: formData.code,
        
        details: {
          gias_category: formData.gias_category,
          auditee_department: formData.auditee_department,
          impact_text: formData.impact,
          recommendation_text: formData.recommendation,
          financial_impact: formData.financial_impact,
          
          // Legacy support
          risk_scores: {
            impact: formData.impact_score,
            likelihood: formData.likelihood_score,
            total: formData.impact_score * formData.likelihood_score
          },

          // Sentinel V3.0 Engine Results
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
                  likelihood: formData.likelihood_score, // Using original state
                  control: formData.control_weakness
              }
          },

          root_cause_analysis: {
            summary: formData.root_cause,
            method: '5-Whys',
            whys: [
              formData.why_1, formData.why_2, formData.why_3, formData.why_4, formData.why_5
            ].filter(w => w)
          }
        }
      };

      // 3. API Çağrısı
      await comprehensiveFindingApi.create(payload);

      // 4. Başarı İşlemleri
      toast.success(status === 'DRAFT' ? 'Bulgu taslak olarak kaydedildi!' : 'Bulgu başarıyla yayınlandı!');
      onSave(payload);
      onClose();
      
    } catch (error) {
      console.error('Kayıt hatası:', error);
      toast.error('Bulgu kaydedilirken bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    // Z-INDEX DÜZELTİLDİ: Sidebar'ın altında kalmasını engellemek için z-50 yerine z-[9999] yapıldı
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden">
          
          {/* Header */}
          <div className="bg-white border-b border-gray-200">
              <div className="flex items-center justify-between p-6 pb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Yeni Bulgu Oluştur</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Sentinel V3.0 WIF ve Veto Motoru Devrede
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              {/* LIVE SCORING BANNER */}
              <div className="px-6 pb-4 flex justify-between items-center bg-gray-50">
                  <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm mt-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-semibold text-gray-600">Hedef Aksiyon (SLA):</span>
                      <span className="font-bold text-gray-900">
                          {formData.sla_type === 'FIXED_DATE' ? liveRisk.due_date : `${liveRisk.target_sprints} Sprint`}
                      </span>
                  </div>
                  <div className="flex items-center gap-4 mt-2">
                    {liveRisk.is_veto_triggered && (
                        <div className="px-3 py-1.5 rounded-lg bg-red-100 text-red-800 text-xs font-bold border border-red-200 flex items-center gap-2 animate-pulse">
                            <AlertTriangle className="w-4 h-4" /> VETO: {liveRisk.veto_reason}
                        </div>
                    )}
                    <div style={{ backgroundColor: liveRisk.color_code }} className="px-6 py-2 rounded-xl text-white font-black text-sm tracking-widest shadow-lg transition-colors duration-300">
                        {liveRisk.severity}: {liveRisk.calculated_score.toFixed(1)}
                    </div>
                  </div>
              </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Basic Info */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Temel Bilgiler</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bulgu Başlığı *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    placeholder="Örn: Kasa İşlemlerinde Çift Anahtar Kuralı İhlali"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Referans No *
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white font-mono"
                    placeholder="AUD-2025-SR-XX"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sistem Tarafından Atanan Seviye
                  </label>
                  <div className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-200 text-gray-700 font-bold cursor-not-allowed flex items-center">
                      <span className="w-3 h-3 rounded-full mr-2" style={{backgroundColor: liveRisk.color_code}}></span>
                      {liveRisk.severity} (Otomatik)
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    GIAS Kategorisi
                  </label>
                  <select
                    value={formData.gias_category}
                    onChange={(e) =>
                      setFormData({ ...formData, gias_category: e.target.value as any })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="">Seçiniz</option>
                    <option value="Operasyonel Risk">Operasyonel Risk</option>
                    <option value="Uyum Riski">Uyum Riski</option>
                    <option value="Finansal Risk">Finansal Risk</option>
                    <option value="Teknolojik Risk">Teknolojik Risk</option>
                    <option value="Yönetişim">Yönetişim</option>
                    <option value="İç Kontrol">İç Kontrol</option>
                    <option value="Risk Yönetimi">Risk Yönetimi</option>
                    <option value="BT Güvenliği">BT Güvenliği</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sorumlu Birim
                  </label>
                  <input
                    type="text"
                    value={formData.auditee_department}
                    onChange={(e) =>
                      setFormData({ ...formData, auditee_department: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    placeholder="Örn: Şube Müdürlüğü"
                  />
                </div>
              </div>
            </div>

            {/* Section Navigation */}
            <div className="flex gap-2 mb-6">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={clsx(
                      'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-all',
                      activeSection === section.id
                        ? `bg-${section.color}-600 text-white shadow-md`
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {section.label}
                  </button>
                );
              })}
            </div>

            {/* Section Content */}
            <div className="space-y-6">
              
              {/* TESPİT */}
              {activeSection === 'tespit' && (
                <div className="bg-blue-50 rounded-lg p-6 animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                      <FileSearch className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-blue-900">Tespit</h3>
                      <p className="text-sm text-blue-700">Bulgunun detaylı açıklaması</p>
                    </div>
                  </div>
                  <textarea
                    value={formData.detection}
                    onChange={(e) => setFormData({ ...formData, detection: e.target.value })}
                    className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white"
                    rows={12}
                    placeholder="Yapılan inceleme sonucunda tespit edilen bulguyu detaylı olarak açıklayın..."
                  />
                  <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    AI ile İyileştir
                  </button>
                </div>
              )}

              {/* RİSK & ETKİ (SENTINEL V3 MOTORU) */}
              {activeSection === 'risk' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-2">
                    {/* Engine Inputs */}
                    <div className="bg-orange-50 rounded-lg p-6 border border-orange-100">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-orange-900">Etki Motoru (WIF)</h3>
                                <p className="text-sm text-orange-700">Sentinel V3.0 Algoritması</p>
                            </div>
                        </div>

                        <RiskSlider label="Finansal Etki" value={formData.impact_financial} onChange={v => setFormData({...formData, impact_financial: v})} icon={Banknote} />
                        <RiskSlider label="Yasal Etki" value={formData.impact_legal} onChange={v => setFormData({...formData, impact_legal: v})} icon={Scale} />
                        <RiskSlider label="İtibar Etkisi" value={formData.impact_reputation} onChange={v => setFormData({...formData, impact_reputation: v})} icon={Building} />
                        <RiskSlider label="Operasyonel Etki" value={formData.impact_operational} onChange={v => setFormData({...formData, impact_operational: v})} icon={HeartPulse} />
                        <div className="my-5 border-t border-orange-200"></div>
                        <RiskSlider label="Gerçekleşme Olasılığı" value={formData.likelihood_score} onChange={v => setFormData({...formData, likelihood_score: v})} icon={ChevronsRight} />
                        <RiskSlider label="Kontrol Zafiyeti" value={formData.control_weakness} onChange={v => setFormData({...formData, control_weakness: v})} icon={ShieldCheck} />
                        
                        <div className="mt-6">
                            <label className="block text-sm font-medium text-orange-900 mb-2">
                                Ölçülebilir Finansal Etki (TL)
                            </label>
                            <input type="number" value={formData.financial_impact} onChange={(e) => setFormData({ ...formData, financial_impact: parseFloat(e.target.value) })} className="w-full px-4 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 bg-white" placeholder="0" />
                        </div>
                    </div>

                    {/* Veto & Details */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Aksiyon Tipi (SLA)</label>
                            <select value={formData.sla_type} onChange={e => setFormData({...formData, sla_type: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50">
                                <option value="FIXED_DATE">Takvim Günü (Sabit SLA)</option>
                                <option value="AGILE_SPRINT">Agile Sprint</option>
                            </select>
                        </div>

                        {/* Veto Toggles */}
                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                            <div className="flex items-center justify-between p-4 bg-gray-50">
                                <div><p className="font-bold text-sm text-gray-800">IT / Siber Risk mi?</p></div>
                                <button onClick={() => setFormData({...formData, isItRisk: !formData.isItRisk})}>
                                    {formData.isItRisk ? <ToggleRight className="w-10 h-10 text-blue-600" /> : <ToggleLeft className="w-10 h-10 text-gray-400" />}
                                </button>
                            </div>
                            {formData.isItRisk && (
                                <div className="p-4 grid grid-cols-2 gap-4 border-t border-gray-200 bg-white">
                                    <div><label className="text-xs font-bold mb-1 block">CVSS Skoru (0-10)</label><input type="number" step="0.1" value={formData.cvss_score} onChange={e=>setFormData({...formData, cvss_score: parseFloat(e.target.value)})} className="w-full p-2 border rounded-md"/></div>
                                    <div><label className="text-xs font-bold mb-1 block">Varlık Kritiği</label><select value={formData.asset_criticality} onChange={e=>setFormData({...formData, asset_criticality: e.target.value})} className="w-full p-2 border rounded-md"><option>Minor</option><option>Major</option><option>Critical</option></select></div>
                                </div>
                            )}
                        </div>

                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                            <div className="flex items-center justify-between p-4 bg-gray-50">
                                <div><p className="font-bold text-sm text-gray-800">Şer'i Uyum İhlali mi?</p></div>
                                <button onClick={() => setFormData({...formData, isShariahRisk: !formData.isShariahRisk})}>
                                    {formData.isShariahRisk ? <ToggleRight className="w-10 h-10 text-emerald-600" /> : <ToggleLeft className="w-10 h-10 text-gray-400" />}
                                </button>
                            </div>
                            {formData.isShariahRisk && (
                                <div className="p-4 border-t border-gray-200 bg-white">
                                    <RiskSlider label="Şer'i İhlal Etkisi" value={formData.shariah_impact} onChange={v => setFormData({...formData, shariah_impact: v})} icon={Scale} />
                                    <button onClick={() => setFormData({...formData, requires_income_purification: !formData.requires_income_purification})} className="mt-2 flex items-center gap-2 text-sm font-bold text-gray-700 p-2 border rounded-lg w-full bg-gray-50">
                                        {formData.requires_income_purification ? <CheckSquare className="w-5 h-5 text-emerald-600"/> : <Square className="w-5 h-5 text-gray-400"/>} Gelir Arındırması Gerektirir
                                    </button>
                                </div>
                            )}
                        </div>
                        
                        <textarea
                            value={formData.impact}
                            onChange={(e) => setFormData({ ...formData, impact: e.target.value })}
                            className="w-full px-4 py-3 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none bg-white"
                            rows={4}
                            placeholder="Bulgunun organizasyon üzerindeki genel etkisini yazıyla özetleyin..."
                        />
                    </div>
                </div>
              )}

              {/* KÖK NEDEN ANALİZİ (5-WHYS) */}
              {activeSection === 'koken' && (
                <div className="bg-red-50 rounded-lg p-6 animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-red-900">Kök Neden Analizi</h3>
                      <p className="text-sm text-red-700">5-Whys metodu ile kök neden tespiti</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <div key={num} className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm mt-2">
                          {num}
                        </div>
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-red-900 mb-2">
                            Neden {num} - Neden?
                          </label>
                          <input
                            type="text"
                            value={formData[`why_${num}` as keyof typeof formData] as string}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                [`why_${num}`]: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
                            placeholder={`${num}. nedenin açıklaması...`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 bg-red-100 border-l-4 border-red-600 p-4">
                    <h4 className="text-sm font-semibold text-red-900 mb-2">Kök Neden Özeti</h4>
                    <textarea
                      value={formData.root_cause}
                      onChange={(e) => setFormData({ ...formData, root_cause: e.target.value })}
                      className="w-full px-4 py-3 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none bg-white"
                      rows={3}
                      placeholder="5-Whys analizi sonucu belirlenen kök nedeni özetleyin..."
                    />
                  </div>
                </div>
              )}

              {/* ÖNERİ */}
              {activeSection === 'oneri' && (
                <div className="bg-green-50 rounded-lg p-6 animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                      <Lightbulb className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-green-900">Öneri</h3>
                      <p className="text-sm text-green-700">
                        İyileştirme ve düzeltici aksiyon önerileri
                      </p>
                    </div>
                  </div>
                  <textarea
                    value={formData.recommendation}
                    onChange={(e) => setFormData({ ...formData, recommendation: e.target.value })}
                    className="w-full px-4 py-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none bg-white"
                    rows={12}
                    placeholder="Bulgunun düzeltilmesi ve gelecekte tekrarlanmaması için önerilerinizi yazın..."
                  />
                  <button className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    AI Öneri Oluştur
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors font-medium disabled:opacity-50"
            >
              İptal
            </button>
            <div className="flex gap-3">
              <button 
                onClick={() => handleSave('DRAFT')}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium disabled:opacity-50"
                disabled={isSubmitting}
              >
                Taslak Olarak Kaydet
              </button>
              <button
                onClick={() => handleSave('PUBLISHED')}
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Bulguyu Kaydet
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};