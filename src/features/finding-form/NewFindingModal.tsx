import { useState, useMemo } from 'react';
import { 
  X, Save, Sparkles, AlertTriangle, TrendingUp, Lightbulb, FileSearch, Loader2, 
  Banknote, Scale, Building, HeartPulse, ChevronsRight, ShieldCheck, Clock, 
  ToggleRight, ToggleLeft, CheckSquare, Square, BookOpen,
  Bold, Italic, List, ListOrdered, Heading1, Heading2
} from 'lucide-react';
import clsx from 'clsx';
import { toast } from 'react-hot-toast';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';

import type { FindingSeverity, GIASCategory } from '../../entities/finding/model/types';
import { comprehensiveFindingApi } from '../../entities/finding/api/module5-api';
import { RegulationSelectorModal } from '../finding-studio/components/RegulationSelectorModal';

// --- TIPTAP RICH TEXT EDITOR COMPONENT (Reusable & Clean) ---
const RichTextEditor = ({ value, onChange, placeholder }: { value: string, onChange: (val: string) => void, placeholder: string }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) return null;

  return (
    <div className="w-full border border-gray-300 rounded-lg bg-white overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
      {/* Editor Toolbar (Word-like) */}
      <div className="flex items-center gap-1 p-2 bg-slate-50 border-b border-gray-200">
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={clsx('p-1.5 rounded hover:bg-slate-200 transition-colors', editor.isActive('bold') ? 'bg-slate-200 text-blue-600' : 'text-slate-600')}><Bold size={16} /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={clsx('p-1.5 rounded hover:bg-slate-200 transition-colors', editor.isActive('italic') ? 'bg-slate-200 text-blue-600' : 'text-slate-600')}><Italic size={16} /></button>
        <div className="w-px h-5 bg-slate-300 mx-1" />
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={clsx('p-1.5 rounded hover:bg-slate-200 transition-colors', editor.isActive('heading', { level: 2 }) ? 'bg-slate-200 text-blue-600' : 'text-slate-600')}><Heading2 size={16} /></button>
        <div className="w-px h-5 bg-slate-300 mx-1" />
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={clsx('p-1.5 rounded hover:bg-slate-200 transition-colors', editor.isActive('bulletList') ? 'bg-slate-200 text-blue-600' : 'text-slate-600')}><List size={16} /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={clsx('p-1.5 rounded hover:bg-slate-200 transition-colors', editor.isActive('orderedList') ? 'bg-slate-200 text-blue-600' : 'text-slate-600')}><ListOrdered size={16} /></button>
      </div>
      {/* Editor Content Area */}
      <EditorContent editor={editor} className="p-4 prose prose-sm max-w-none min-h-[150px] focus:outline-none" />
    </div>
  );
};

// --- UI ÇEVİRİ SÖZLÜĞÜ ---
const SEVERITY_TR: Record<string, string> = { CRITICAL: 'Kritik', HIGH: 'Yüksek', MEDIUM: 'Orta', LOW: 'Düşük', OBSERVATION: 'Gözlem' };

// --- SENTINEL V3.0 RISK ENGINE ---
const BORDO = '#6A0000'; const KIZIL = '#DC143C'; const TURUNCU = '#FFA500'; const SARI = '#FFD700'; const YESIL = '#228B22';   

const calculateRiskEngine = (data: any) => {
    let finalScore = 0; let severity: FindingSeverity = 'OBSERVATION'; let color_code = YESIL; let is_veto_triggered = false; let veto_reason = undefined;

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

interface NewFindingModalProps { isOpen: boolean; onClose: () => void; onSave: (finding: any) => void; }
type FormSection = 'tespit' | 'risk' | 'koken' | 'oneri';

export const NewFindingModal = ({ isOpen, onClose, onSave }: NewFindingModalProps) => {
  const [activeSection, setActiveSection] = useState<FormSection>('tespit');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegulationModalOpen, setIsRegulationModalOpen] = useState(false);
  const [selectedRegulation, setSelectedRegulation] = useState<any>(null);

  const [formData, setFormData] = useState({
    title: '', code: '', gias_category: '' as GIASCategory | '', auditee_department: '',
    
    // Rich Text Fields (Artık HTML formatında tutulacak)
    detection_html: '', 
    impact_html: '',    
    root_cause_html: '', 
    recommendation_html: '', 
    
    rca_category: '', // Parametrik yapı için hazırlık (İnsan, Sistem, Süreç)
    
    financial_impact: 0, impact_score: 3, likelihood_score: 3,
    impact_financial: 1, impact_legal: 1, impact_reputation: 1, impact_operational: 1, control_weakness: 1,
    sla_type: 'FIXED_DATE', isItRisk: false, cvss_score: 0, asset_criticality: 'Minor',
    isShariahRisk: false, shariah_impact: 1, requires_income_purification: false,
  });

  const sections = [
    { id: 'tespit' as const, label: 'Tespit', icon: FileSearch, color: 'blue' },
    { id: 'risk' as const, label: 'Risk & Etki', icon: TrendingUp, color: 'orange' },
    { id: 'koken' as const, label: 'Kök Neden', icon: AlertTriangle, color: 'red' },
    { id: 'oneri' as const, label: 'Öneri', icon: Lightbulb, color: 'green' },
  ];

  const liveRisk = useMemo(() => calculateRiskEngine(formData), [formData]);

  const handleSave = async (status: 'DRAFT' | 'PUBLISHED' = 'DRAFT') => {
    if (!formData.title.trim()) { toast.error('Lütfen bulgu başlığı giriniz.'); return; }
    if (!formData.code.trim()) { toast.error('Lütfen ihlal edilen kriteri / mevzuatı belirtiniz.'); return; }

    setIsSubmitting(true);

    try {
      const payload = {
        title: formData.title, severity: liveRisk.severity, status: status, category: 'Audit', engagement_id: 'GENERAL_AUDIT',
        
        // Zengin Metin (HTML) Verileri
        description: formData.detection_html, // Tespit (HTML)
        criteria: formData.code,
        
        details: {
          gias_category: formData.gias_category, auditee_department: formData.auditee_department,
          impact_text: formData.impact_html, // Etki (HTML)
          recommendation_text: formData.recommendation_html, // Öneri (HTML)
          financial_impact: formData.financial_impact,
          
          regulation_details: selectedRegulation ? { id: selectedRegulation.id, title: selectedRegulation.title, category: selectedRegulation.category } : null,
          risk_engine: {
              calculated_score: liveRisk.calculated_score, is_veto_triggered: liveRisk.is_veto_triggered, veto_reason: liveRisk.veto_reason,
              sla_target: formData.sla_type === 'FIXED_DATE' ? liveRisk.due_date : `${liveRisk.target_sprints} Sprint`,
              inputs: { financial: formData.impact_financial, legal: formData.impact_legal, reputation: formData.impact_reputation, operational: formData.impact_operational, likelihood: formData.likelihood_score, control: formData.control_weakness }
          },
          root_cause_analysis: {
            category: formData.rca_category, // Yeni Kategori Alanı
            summary_html: formData.root_cause_html, // Zengin Metin Kök Neden Özeti
            has_advanced_analysis: false // Gelecekte Drawer'dan gelecek veri
          }
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
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[95vh] flex flex-col overflow-hidden">
          
          {/* Header */}
          <div className="bg-white border-b border-gray-200">
              <div className="flex items-center justify-between p-6 pb-4">
                <div><h2 className="text-2xl font-bold text-gray-900">Yeni Bulgu Oluştur</h2><p className="text-sm text-gray-600 mt-1">Sentinel V3.0 WIF ve Veto Motoru Devrede</p></div>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><X className="w-6 h-6 text-gray-500" /></button>
              </div>

              {/* LIVE SCORING BANNER */}
              <div className="px-6 pb-4 flex justify-between items-center bg-gray-50">
                  <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm mt-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-semibold text-gray-600">Hedef Aksiyon (SLA):</span>
                      <span className="font-bold text-gray-900">{formData.sla_type === 'FIXED_DATE' ? liveRisk.due_date : `${liveRisk.target_sprints} Sprint`}</span>
                  </div>
                  <div className="flex items-center gap-4 mt-2">
                    {liveRisk.is_veto_triggered && (
                        <div className="px-3 py-1.5 rounded-lg bg-red-100 text-red-800 text-xs font-bold border border-red-200 flex items-center gap-2 animate-pulse">
                            <AlertTriangle className="w-4 h-4" /> VETO: {liveRisk.veto_reason}
                        </div>
                    )}
                    <div style={{ backgroundColor: liveRisk.color_code }} className="px-6 py-2 rounded-xl text-white font-black text-sm tracking-widest shadow-lg transition-colors duration-300">
                        {SEVERITY_TR[liveRisk.severity]}: {liveRisk.calculated_score.toFixed(1)}
                    </div>
                  </div>
              </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="bg-gray-50 rounded-lg p-6 mb-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"><FileSearch className="text-blue-600"/> Temel Bilgiler</h3>
              <div className="grid grid-cols-2 gap-5">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bulgu Başlığı *</label>
                  <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white" placeholder="Örn: Kasa İşlemlerinde Çift Anahtar Kuralı İhlali" />
                </div>
                <div className="col-span-2">
                  <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-2">
                    <span>İhlal Edilen Kriter / Mevzuat *</span>
                    <button type="button" onClick={() => setIsRegulationModalOpen(true)} className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-2.5 py-1.5 rounded-md border border-blue-100 transition-colors"><BookOpen size={14} /> Mevzuat Kütüphanesinden Seç</button>
                  </label>
                  <input type="text" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white" placeholder="Mevzuat, Yönetmelik veya İç Kural Referansı girin..." />
                  {selectedRegulation && (
                      <div className="mt-3 p-3 bg-indigo-50 border border-indigo-100 rounded-lg flex items-start gap-3">
                          <Scale className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" />
                          <div><p className="text-sm font-bold text-indigo-900">{selectedRegulation.category} Mevzuatı</p><p className="text-xs text-indigo-700 mt-0.5">{selectedRegulation.title}</p></div>
                      </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sistem Tarafından Atanan Seviye</label>
                  <div className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-100 text-gray-600 font-bold cursor-not-allowed flex items-center">
                      <span className="w-3 h-3 rounded-full mr-2" style={{backgroundColor: liveRisk.color_code}}></span>{SEVERITY_TR[liveRisk.severity]} (Otomatik)
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">GIAS Kategorisi (Parametrik Olacak)</label>
                  <select value={formData.gias_category} onChange={(e) => setFormData({ ...formData, gias_category: e.target.value as any })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white">
                    <option value="">Seçiniz</option><option value="Operasyonel Risk">Operasyonel Risk</option><option value="Uyum Riski">Uyum Riski</option><option value="Finansal Risk">Finansal Risk</option><option value="Teknolojik Risk">Teknolojik Risk</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sorumlu Birim</label>
                  <input type="text" value={formData.auditee_department} onChange={(e) => setFormData({ ...formData, auditee_department: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white" placeholder="Örn: Şube Müdürlüğü" />
                </div>
              </div>
            </div>

            {/* Section Navigation */}
            <div className="flex gap-3 mb-6">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button key={section.id} onClick={() => setActiveSection(section.id)} className={clsx('flex-1 flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl font-bold text-sm transition-all', activeSection === section.id ? `bg-${section.color}-600 text-white shadow-md shadow-${section.color}-600/20` : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50')}>
                    <Icon className="w-4 h-4" />{section.label}
                  </button>
                );
              })}
            </div>

            {/* Section Content */}
            <div className="space-y-6">
              {activeSection === 'tespit' && (
                <div className="bg-white rounded-xl p-6 border border-blue-100 shadow-sm animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center"><FileSearch className="w-5 h-5 text-blue-600" /></div>
                        <div><h3 className="text-lg font-semibold text-gray-900">Tespit (Condition)</h3><p className="text-sm text-gray-500">Mevcut durumu zengin metin ile açıklayın</p></div>
                    </div>
                    <button className="px-4 py-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-sm font-bold flex items-center gap-2"><Sparkles className="w-4 h-4" /> AI Asistan</button>
                  </div>
                  {/* RICH TEXT EDITOR */}
                  <RichTextEditor value={formData.detection_html} onChange={(val) => setFormData({...formData, detection_html: val})} placeholder="Yapılan inceleme sonucunda tespit edilen bulguyu detaylı olarak açıklayın..." />
                </div>
              )}

              {activeSection === 'risk' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-2">
                    <div className="bg-white rounded-xl p-6 border border-orange-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center"><TrendingUp className="w-5 h-5 text-orange-600" /></div>
                            <div><h3 className="text-lg font-semibold text-gray-900">Etki Motoru (WIF)</h3><p className="text-sm text-gray-500">Otomatik risk değerlendirmesi</p></div>
                        </div>
                        <RiskSlider label="Finansal Etki" value={formData.impact_financial} onChange={v => setFormData({...formData, impact_financial: v})} icon={Banknote} />
                        <RiskSlider label="Yasal Etki" value={formData.impact_legal} onChange={v => setFormData({...formData, impact_legal: v})} icon={Scale} />
                        <RiskSlider label="İtibar Etkisi" value={formData.impact_reputation} onChange={v => setFormData({...formData, impact_reputation: v})} icon={Building} />
                        <RiskSlider label="Operasyonel Etki" value={formData.impact_operational} onChange={v => setFormData({...formData, impact_operational: v})} icon={HeartPulse} />
                        <div className="my-5 border-t border-orange-100"></div>
                        <RiskSlider label="Gerçekleşme Olasılığı" value={formData.likelihood_score} onChange={v => setFormData({...formData, likelihood_score: v})} icon={ChevronsRight} />
                        <RiskSlider label="Kontrol Zafiyeti" value={formData.control_weakness} onChange={v => setFormData({...formData, control_weakness: v})} icon={ShieldCheck} />
                        
                        <div className="mt-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Ölçülebilir Finansal Etki (TL)</label>
                            <input type="number" value={formData.financial_impact} onChange={(e) => setFormData({ ...formData, financial_impact: parseFloat(e.target.value) })} className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:bg-white" placeholder="0" />
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Veto ve SLA Modülleri (Kısa Tutuldu) */}
                        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Aksiyon Tipi (SLA)</label>
                            <select value={formData.sla_type} onChange={e => setFormData({...formData, sla_type: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"><option value="FIXED_DATE">Takvim Günü (Sabit SLA)</option><option value="AGILE_SPRINT">Agile Sprint</option></select>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                            <div className="flex items-center justify-between p-4 bg-gray-50">
                                <div><p className="font-bold text-sm text-gray-800">IT / Siber Risk Veto Kapısı</p></div>
                                <button onClick={() => setFormData({...formData, isItRisk: !formData.isItRisk})}>{formData.isItRisk ? <ToggleRight className="w-10 h-10 text-blue-600" /> : <ToggleLeft className="w-10 h-10 text-gray-400" />}</button>
                            </div>
                            {formData.isItRisk && (
                                <div className="p-4 grid grid-cols-2 gap-4 border-t border-gray-200 bg-white">
                                    <div><label className="text-xs font-bold mb-1 block">CVSS Skoru (0-10)</label><input type="number" step="0.1" value={formData.cvss_score} onChange={e=>setFormData({...formData, cvss_score: parseFloat(e.target.value)})} className="w-full p-2 border rounded-md"/></div>
                                    <div><label className="text-xs font-bold mb-1 block">Varlık Kritiği</label><select value={formData.asset_criticality} onChange={e=>setFormData({...formData, asset_criticality: e.target.value})} className="w-full p-2 border rounded-md"><option value="Minor">Düşük</option><option value="Major">Orta</option><option value="Critical">Kritik</option></select></div>
                                </div>
                            )}
                        </div>
                        
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Etki Açıklaması (Effect)</label>
                            {/* RICH TEXT EDITOR */}
                            <RichTextEditor value={formData.impact_html} onChange={(val) => setFormData({...formData, impact_html: val})} placeholder="Bulgunun organizasyon üzerindeki etkilerini açıklayın..." />
                        </div>
                    </div>
                </div>
              )}

              {/* SADELEŞTİRİLMİŞ KÖK NEDEN (RCA) ALANI */}
              {activeSection === 'koken' && (
                <div className="bg-white rounded-xl p-6 border border-red-100 shadow-sm animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center"><AlertTriangle className="w-5 h-5 text-red-600" /></div>
                        <div><h3 className="text-lg font-semibold text-gray-900">Kök Neden Özeti (Cause)</h3><p className="text-sm text-gray-500">Bulgunun kaynağına dair özet bilgi</p></div>
                    </div>
                    {/* AŞAMA 2 İÇİN HAZIRLIK BUTONU */}
                    <button className="px-5 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors text-sm font-bold flex items-center gap-2">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                        Gelişmiş Analiz Aracı (RCA Çekmecesi)
                    </button>
                  </div>
                  
                  <div className="mb-6">
                      <label className="block text-sm font-bold text-gray-700 mb-2">Kök Neden Kategorisi (Parametrik Olacak)</label>
                      <select value={formData.rca_category} onChange={(e) => setFormData({ ...formData, rca_category: e.target.value })} className="w-full md:w-1/2 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 bg-gray-50">
                        <option value="">Kategori Seçiniz...</option>
                        <option value="insan">İnsan Hatası / Farkındalık Eksikliği</option>
                        <option value="sistem">Sistem / Altyapı / Yazılım Hatası</option>
                        <option value="surec">Süreç Tasarımı / Prosedür Eksikliği</option>
                        <option value="dis">Dış Etken / Üçüncü Taraf</option>
                      </select>
                  </div>

                  <label className="block text-sm font-bold text-gray-700 mb-2">Kök Neden Özeti</label>
                  {/* RICH TEXT EDITOR */}
                  <RichTextEditor value={formData.root_cause_html} onChange={(val) => setFormData({...formData, root_cause_html: val})} placeholder="Kök neden analizinizin sonucunu özetleyin..." />
                </div>
              )}

              {activeSection === 'oneri' && (
                <div className="bg-white rounded-xl p-6 border border-green-100 shadow-sm animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center"><Lightbulb className="w-5 h-5 text-green-600" /></div>
                        <div><h3 className="text-lg font-semibold text-gray-900">Öneri (Recommendation)</h3><p className="text-sm text-gray-500">Yönetime sunulan aksiyon planı önerileri</p></div>
                    </div>
                    <button className="px-4 py-2 bg-green-50 text-green-600 border border-green-200 rounded-lg hover:bg-green-100 transition-colors text-sm font-bold flex items-center gap-2"><Sparkles className="w-4 h-4" /> AI ile Taslak Oluştur</button>
                  </div>
                  {/* RICH TEXT EDITOR */}
                  <RichTextEditor value={formData.recommendation_html} onChange={(val) => setFormData({...formData, recommendation_html: val})} placeholder="Bulgunun düzeltilmesi için önerilerinizi yazın..." />
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
            <button onClick={onClose} disabled={isSubmitting} className="px-6 py-2.5 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors font-bold">İptal</button>
            <div className="flex gap-3">
              <button onClick={() => handleSave('DRAFT')} className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-bold" disabled={isSubmitting}>Taslak Olarak Kaydet</button>
              <button onClick={() => handleSave('PUBLISHED')} disabled={isSubmitting} className="px-8 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-black flex items-center gap-2 shadow-lg shadow-blue-600/20 hover:scale-105 active:scale-95 disabled:opacity-70 disabled:hover:scale-100">
                {isSubmitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Kaydediliyor...</> : <><Save className="w-5 h-5" /> Bulguyu Kaydet</>}
              </button>
            </div>
          </div>
        </div>
      </div>

      <RegulationSelectorModal isOpen={isRegulationModalOpen} onClose={() => setIsRegulationModalOpen(false)} onSelect={(reg) => { setFormData(prev => ({ ...prev, code: reg.code })); setSelectedRegulation(reg); }} />
    </div>
  );
};