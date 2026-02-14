import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Save, ArrowLeft, ShieldAlert, FileText, Activity,
  GitBranch, Target, Sparkles
} from 'lucide-react';
import clsx from 'clsx';

// MİMARİ BAĞLANTILAR
import { mockComprehensiveFindings } from '@/entities/finding/api/mock-comprehensive-data';
import type { ComprehensiveFinding } from '@/entities/finding/model/types';
import { useParameterStore } from '@/shared/stores/parameter-store';
import { RichTextEditor } from '@/shared/ui/RichTextEditor';

// ORTAK BİLEŞENLER
import { UniversalFindingDrawer } from '@/widgets/UniversalFindingDrawer';
import { ViewSwitcher } from '@/features/finding-studio/components/ViewSwitcher';

export default function FindingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { severities, giasCategories, getSeverityColor } = useParameterStore();

  const [finding, setFinding] = useState<ComprehensiveFinding | null>(null);
  const [activeSection, setActiveSection] = useState<'tespit' | 'risk' | 'koken' | 'oneri'>('tespit');
  const [loading, setLoading] = useState(true);
  
  // Çekmece Kontrolü
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState<'ai' | 'chat' | 'history' | 'rca'>('ai');

  useEffect(() => {
    const found = mockComprehensiveFindings.find(f => f.id === id) || mockComprehensiveFindings[0];
    if (found) setFinding(found);
    setLoading(false);
  }, [id]);

  const handleChange = (field: keyof ComprehensiveFinding, value: any) => {
    if (finding) setFinding({ ...finding, [field]: value });
  };

  const openDrawer = (tab: 'rca' | 'ai') => {
      setDrawerTab(tab);
      setIsDrawerOpen(true);
  };

  if (loading || !finding) return <div className="h-screen flex items-center justify-center bg-slate-50">Yükleniyor...</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      
      {/* --- HEADER --- */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-6 h-16 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/execution/findings')} className="p-2 hover:bg-slate-100 rounded-full text-slate-500"><ArrowLeft size={20}/></button>
          <div>
            <div className="flex items-center gap-2">
               <span className="text-xs font-mono font-bold text-slate-400">{finding.code}</span>
               <span className={clsx("px-2 py-0.5 rounded text-[10px] font-bold border", getSeverityColor(finding.severity))}>{finding.severity}</span>
            </div>
            <h1 className="text-sm font-bold text-slate-900 truncate max-w-[300px]">{finding.title}</h1>
          </div>
        </div>

        <ViewSwitcher findingId={finding.id} />

        <div className="flex gap-2">
            <button onClick={() => openDrawer('ai')} className="flex items-center gap-2 px-4 py-2 bg-white border border-indigo-200 text-indigo-600 rounded-lg font-bold text-xs hover:bg-indigo-50 shadow-sm transition-all">
                <Sparkles size={14} /> AI Analiz
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg font-bold text-xs hover:bg-slate-800 shadow-sm transition-all">
                <Save size={14} /> Kaydet
            </button>
        </div>
      </header>

      {/* --- ANA İÇERİK --- */}
      <div className="flex flex-1 overflow-hidden max-w-[1920px] mx-auto w-full">
        
        {/* SOL: BÖLÜM NAVİGASYONU (NewFindingModal yapısı) */}
        <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
           <div className="p-6">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4">Bulgu Bölümleri</h3>
              <nav className="space-y-1">
                 <NavButton id="tespit" label="1. Tespit & Kriter" icon={FileText} active={activeSection} onClick={setActiveSection} />
                 <NavButton id="risk" label="2. Risk & Etki" icon={ShieldAlert} active={activeSection} onClick={setActiveSection} />
                 <NavButton id="koken" label="3. Kök Neden" icon={GitBranch} active={activeSection} onClick={setActiveSection} />
                 <NavButton id="oneri" label="4. Öneri & Aksiyon" icon={Target} active={activeSection} onClick={setActiveSection} />
              </nav>
           </div>
           
           {/* Meta Bilgiler */}
           <div className="mt-auto p-6 border-t border-slate-100 bg-slate-50">
               <div className="text-xs text-slate-500 font-bold mb-2">Denetlenen Birim</div>
               <div className="text-sm font-bold text-slate-800 truncate">{finding.auditee_department || 'Seçilmedi'}</div>
           </div>
        </aside>

        {/* ORTA: DİNAMİK FORM ALANI */}
        <main className="flex-1 overflow-y-auto p-8 bg-slate-50">
           <div className="max-w-4xl mx-auto space-y-6">
              
              {/* --- BÖLÜM 1: TESPİT --- */}
              {activeSection === 'tespit' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                          <label className="block text-xs font-bold text-slate-500 mb-2">Bulgu Başlığı</label>
                          <input 
                            type="text" 
                            value={finding.title} 
                            onChange={(e) => handleChange('title', e.target.value)}
                            className="w-full text-lg font-bold border-b border-slate-200 pb-2 focus:border-indigo-500 outline-none transition-colors"
                            placeholder="Bulgu başlığını giriniz..."
                          />
                      </div>

                      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                          <label className="block text-xs font-bold text-blue-600 mb-3 uppercase flex items-center gap-2">
                              <Layout size={14}/> Kriter / Mevzuat (Ne Olmalıydı?)
                          </label>
                          <RichTextEditor 
                             value={finding.criteria_text || ''} 
                             onChange={(v) => handleChange('criteria_text', v)} 
                             minHeight="150px" 
                          />
                      </div>

                      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                          <label className="block text-xs font-bold text-amber-600 mb-3 uppercase flex items-center gap-2">
                              <FileText size={14}/> Tespit Detayı (Ne Oldu?)
                          </label>
                          <RichTextEditor 
                             value={finding.detection_html || finding.description || ''} 
                             onChange={(v) => handleChange('detection_html', v)} 
                             minHeight="200px" 
                          />
                      </div>
                  </div>
              )}

              {/* --- BÖLÜM 2: RİSK --- */}
              {activeSection === 'risk' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                      <div className="grid grid-cols-2 gap-6">
                          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                              <label className="block text-xs font-bold text-slate-500 mb-2">Risk Seviyesi</label>
                              <select 
                                value={finding.severity} 
                                onChange={(e) => handleChange('severity', e.target.value as any)}
                                className="w-full border p-2 rounded-lg font-bold"
                              >
                                  {severities.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                              </select>
                          </div>
                          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                              <label className="block text-xs font-bold text-slate-500 mb-2">GIAS Kategorisi</label>
                              <select className="w-full border p-2 rounded-lg bg-white">
                                  {giasCategories.map(c => <option key={c.id} value={c.label}>{c.label}</option>)}
                              </select>
                          </div>
                      </div>

                      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                          <label className="block text-xs font-bold text-red-600 mb-3 uppercase flex items-center gap-2">
                              <Activity size={14}/> Etki Analizi (Sonuç Nedir?)
                          </label>
                          <RichTextEditor 
                             value={finding.impact_html || ''} 
                             onChange={(v) => handleChange('impact_html', v)} 
                             minHeight="150px" 
                          />
                      </div>
                  </div>
              )}

              {/* --- BÖLÜM 3: KÖK NEDEN --- */}
              {activeSection === 'koken' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                      <div className="bg-purple-50 border border-purple-100 p-6 rounded-xl text-center">
                          <GitBranch className="w-12 h-12 text-purple-400 mx-auto mb-3" />
                          <h3 className="font-bold text-purple-900">Kök Neden Analizi</h3>
                          <p className="text-sm text-purple-700 mb-4">Balık Kılçığı veya 5 Neden metodolojisi ile derinlemesine analiz yapın.</p>
                          <button 
                             onClick={() => openDrawer('rca')}
                             className="px-6 py-2 bg-purple-600 text-white rounded-lg font-bold text-sm hover:bg-purple-700 shadow-lg shadow-purple-200 transition-all"
                          >
                             Analiz Sihirbazını Aç
                          </button>
                      </div>

                      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                          <label className="block text-xs font-bold text-slate-500 mb-2">Kök Neden Özeti</label>
                          <textarea 
                             className="w-full border border-slate-300 rounded-lg p-3 min-h-[100px] text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                             defaultValue={finding.secrets?.root_cause_analysis_internal || ''}
                             placeholder="Sihirbazdan gelen çıktı buraya otomatik dolacaktır..."
                          />
                      </div>
                  </div>
              )}

              {/* --- BÖLÜM 4: ÖNERİ --- */}
              {activeSection === 'oneri' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                          <label className="block text-xs font-bold text-emerald-600 mb-3 uppercase flex items-center gap-2">
                              <Target size={14}/> Öneri ve Aksiyon Beklentisi
                          </label>
                          <RichTextEditor 
                             value={finding.recommendation_html || ''} 
                             onChange={(v) => handleChange('recommendation_html', v)} 
                             minHeight="200px" 
                          />
                      </div>
                  </div>
              )}

           </div>
        </main>
      </div>

      {/* EVRENSEL ÇEKMECE (Universal Drawer) */}
      <UniversalFindingDrawer 
         isOpen={isDrawerOpen} 
         onClose={() => setIsDrawerOpen(false)} 
         defaultTab={drawerTab as any}
         findingId={finding.id}
         currentViewMode="form"
      />
    </div>
  );
}

// --- YARDIMCI NAV BUTTON ---
function NavButton({ id, label, icon: Icon, active, onClick }: any) {
    const isActive = active === id;
    return (
        <button 
            onClick={() => onClick(id)}
            className={clsx(
                "flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-bold transition-all text-left",
                isActive ? "bg-slate-900 text-white shadow-md" : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            )}
        >
            <Icon size={16} className={isActive ? "text-indigo-400" : "text-slate-400"} />
            {label}
        </button>
    );
}