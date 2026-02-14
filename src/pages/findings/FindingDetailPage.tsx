import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Save, ArrowLeft, Calendar, User, Tag, AlertTriangle, 
  Hash, ShieldAlert, DollarSign, Building, Sparkles, FileText, CheckCircle2 
} from 'lucide-react';
import clsx from 'clsx';

// MİMARİ BAĞLANTILAR
import { mockComprehensiveFindings } from '@/entities/finding/api/mock-comprehensive-data';
import type { ComprehensiveFinding } from '@/entities/finding/model/types';
import { useParameterStore } from '@/shared/stores/parameter-store';
import { RichTextEditor } from '@/shared/ui/RichTextEditor';

// BİLEŞENLER
import { ViewSwitcher } from '@/features/finding-studio/components/ViewSwitcher';

export default function FindingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { severities, giasCategories, getSeverityColor } = useParameterStore();

  const [finding, setFinding] = useState<ComprehensiveFinding | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('identity');

  // Veri Yükleme
  useEffect(() => {
    const found = mockComprehensiveFindings.find(f => f.id === id) || mockComprehensiveFindings[0];
    if (found) setFinding(found);
    setLoading(false);
  }, [id]);

  // Form Değişiklik İşleyicisi
  const handleChange = (field: keyof ComprehensiveFinding, value: any) => {
    if (finding) setFinding({ ...finding, [field]: value });
  };

  if (loading || !finding) return <div className="p-10 text-center">Yükleniyor...</div>;

  return (
    <div className="min-h-screen bg-slate-50 pb-20 flex flex-col">
      
      {/* --- HEADER --- */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-6 h-16 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/execution/findings')} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
             <ArrowLeft size={20} />
          </button>
          <div>
             <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-400">{finding.code}</span>
                <span className={clsx("px-2 py-0.5 rounded text-[10px] font-bold border", getSeverityColor(finding.severity))}>
                    {finding.severity}
                </span>
             </div>
             <h1 className="text-sm font-bold text-slate-900">Bulgu Detay Formu</h1>
          </div>
        </div>

        {/* ORTAK GÖRÜNÜM DEĞİŞTİRİCİ */}
        <ViewSwitcher findingId={finding.id} />

        <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg font-bold text-xs hover:bg-slate-50 shadow-sm">
                <Sparkles size={14} className="text-indigo-500" /> AI ile Doldur
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-xs hover:bg-blue-700 shadow-sm">
                <Save size={14} /> Kaydet
            </button>
        </div>
      </header>

      <div className="flex flex-1 max-w-[1920px] mx-auto w-full">
        
        {/* SOL: NAVİGASYON (Form Outline) */}
        <aside className="w-64 bg-white border-r border-slate-200 p-6 hidden lg:block sticky top-16 h-[calc(100vh-64px)] overflow-y-auto">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4">Form Bölümleri</h3>
            <nav className="space-y-1">
                <NavItem id="identity" label="1. Kimlik & Risk" icon={ShieldAlert} active={activeSection === 'identity'} onClick={setActiveSection} />
                <NavItem id="criteria" label="2. Kriter & Mevzuat" icon={Building} active={activeSection === 'criteria'} onClick={setActiveSection} />
                <NavItem id="detection" label="3. Tespit Detayları" icon={FileText} active={activeSection === 'detection'} onClick={setActiveSection} />
                <NavItem id="rootcause" label="4. Kök Neden" icon={AlertTriangle} active={activeSection === 'rootcause'} onClick={setActiveSection} />
                <NavItem id="impact" label="5. Etki Analizi" icon={DollarSign} active={activeSection === 'impact'} onClick={setActiveSection} />
                <NavItem id="recommendation" label="6. Öneri & Aksiyon" icon={CheckCircle2} active={activeSection === 'recommendation'} onClick={setActiveSection} />
            </nav>
        </aside>

        {/* ORTA: FORM ALANI */}
        <main className="flex-1 p-8 space-y-8 overflow-y-auto">
          
           {/* 1. KİMLİK VE RİSK KARTI */}
           <div id="identity" className="scroll-mt-24">
             <SectionHeader title="1. Kimlik ve Risk Bilgileri" icon={ShieldAlert} />
             <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 grid grid-cols-2 gap-6">
                <div className="col-span-2">
                    <label className="input-label">Bulgu Başlığı</label>
                    <input 
                      type="text" 
                      value={finding.title} 
                      onChange={(e) => handleChange('title', e.target.value)}
                      className="form-input text-lg font-bold"
                    />
                </div>
                <div>
                    <label className="input-label">Risk Seviyesi</label>
                    <select 
                      value={finding.severity}
                      onChange={(e) => handleChange('severity', e.target.value as any)}
                      className="form-select"
                    >
                        {severities.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                </div>
                <div>
                    <label className="input-label">Kategori (GIAS)</label>
                    <select className="form-select">
                        {giasCategories.map(c => <option key={c.id} value={c.label}>{c.label}</option>)}
                    </select>
                </div>
                <div>
                    <label className="input-label">Denetlenen Birim</label>
                    <input type="text" value={finding.auditee_department || ''} className="form-input bg-slate-50" readOnly />
                </div>
                <div>
                    <label className="input-label">Finansal Etki (TL)</label>
                    <input type="number" value={finding.financial_impact || 0} className="form-input font-mono" />
                </div>
             </div>
           </div>

           {/* 2. KRİTER */}
           <div id="criteria" className="scroll-mt-24">
               <SectionHeader title="2. Kriter & Mevzuat (Ne Olmalıydı?)" icon={Building} color="text-blue-600" />
               <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                   <RichTextEditor value={finding.criteria_text || ''} onChange={(v) => handleChange('criteria_text', v)} minHeight="150px" />
               </div>
           </div>

           {/* 3. TESPİT */}
           <div id="detection" className="scroll-mt-24">
               <SectionHeader title="3. Tespit Detayları (Ne Oldu?)" icon={FileText} color="text-amber-600" />
               <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                   <RichTextEditor value={finding.detection_html || finding.description || ''} onChange={(v) => handleChange('detection_html', v)} minHeight="200px" />
               </div>
           </div>

           {/* 4. KÖK NEDEN */}
           <div id="rootcause" className="scroll-mt-24">
               <SectionHeader title="4. Kök Neden Analizi (Neden Oldu?)" icon={AlertTriangle} color="text-purple-600" />
               <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                   <div className="mb-4 p-4 bg-purple-50 rounded-lg border border-purple-100">
                       <h4 className="text-xs font-bold text-purple-700 mb-2 uppercase">5 Neden Analizi (Özet)</h4>
                       <ul className="list-decimal list-inside text-sm text-purple-800 space-y-1">
                           {finding.secrets?.why_1 && <li>{finding.secrets.why_1}</li>}
                           {finding.secrets?.why_2 && <li>{finding.secrets.why_2}</li>}
                       </ul>
                   </div>
                   <label className="input-label">Detaylı Analiz Metni</label>
                   <textarea 
                      className="form-textarea" 
                      rows={4}
                      defaultValue={finding.secrets?.root_cause_analysis_internal || ''}
                   />
               </div>
           </div>

           {/* 5. ETKİ */}
           <div id="impact" className="scroll-mt-24">
               <SectionHeader title="5. Etki & Risk (Sonuç Nedir?)" icon={DollarSign} color="text-red-600" />
               <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                   <RichTextEditor value={finding.impact_html || ''} onChange={(v) => handleChange('impact_html', v)} minHeight="120px" />
               </div>
           </div>

           {/* 6. ÖNERİ */}
           <div id="recommendation" className="scroll-mt-24">
               <SectionHeader title="6. Öneri & Aksiyon (Ne Yapılmalı?)" icon={CheckCircle2} color="text-emerald-600" />
               <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                   <RichTextEditor value={finding.recommendation_html || ''} onChange={(v) => handleChange('recommendation_html', v)} minHeight="150px" />
               </div>
           </div>

        </main>

        {/* SAĞ: HIZLI İŞLEMLER (Meta) */}
        <aside className="w-72 bg-white border-l border-slate-200 p-6 hidden xl:block sticky top-16 h-[calc(100vh-64px)]">
             <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4">Meta Veriler</h3>
             <div className="space-y-4">
                 <div className="text-sm">
                     <span className="block text-xs text-slate-500 mb-1">Oluşturan</span>
                     <div className="flex items-center gap-2 font-bold text-slate-700">
                         <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px]">AY</div>
                         Ahmet Yılmaz
                     </div>
                 </div>
                 <div className="text-sm">
                     <span className="block text-xs text-slate-500 mb-1">Tarih</span>
                     <div className="font-mono text-slate-700">{new Date().toLocaleDateString()}</div>
                 </div>
                 <div className="pt-4 border-t border-slate-100">
                     <button className="w-full py-2 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-200">
                         Kanıt Ekle
                     </button>
                 </div>
             </div>
        </aside>

      </div>
    </div>
  );
}

// --- YARDIMCI BİLEŞENLER ---

function NavItem({ id, label, icon: Icon, active, onClick }: any) {
    return (
        <button 
            onClick={() => {
                onClick(id);
                document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            className={clsx(
                "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-xs font-bold transition-colors text-left",
                active ? "bg-indigo-50 text-indigo-700" : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
            )}
        >
            <Icon size={14} className={active ? "text-indigo-500" : "text-slate-400"} />
            {label}
        </button>
    );
}

function SectionHeader({ title, icon: Icon, color = "text-slate-800" }: any) {
    return (
        <h2 className={clsx("text-base font-bold uppercase tracking-wide mb-4 flex items-center gap-2", color)}>
            <Icon size={18} /> {title}
        </h2>
    );
}