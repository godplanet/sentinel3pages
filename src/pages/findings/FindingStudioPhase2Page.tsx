import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, ArrowLeft, Save, AlertTriangle, 
  MessageSquare, CheckSquare, ShieldCheck, XCircle, UserCheck
} from 'lucide-react';
import clsx from 'clsx';

// MİMARİ BAĞLANTILAR
import { mockComprehensiveFindings } from '@/entities/finding/api/mock-comprehensive-data';
import type { ComprehensiveFinding, ReviewNote } from '@/entities/finding/model/types';
import { useParameterStore } from '@/shared/stores/parameter-store';

// BİLEŞENLER
import { ViewSwitcher } from '@/features/finding-studio/components/ViewSwitcher';
import { FindingPaper } from '@/widgets/FindingStudio/FindingPaper';
import { WorkflowStepper } from '@/widgets/FindingStudio/WorkflowStepper';
import { UniversalFindingDrawer } from '@/widgets/UniversalFindingDrawer';

// QA KONTROL LİSTESİ (Mock - Bu normalde bir feature içinde olur)
const QA_CHECKLIST_ITEMS = [
  { id: 'qa1', label: 'Bulgu başlığı 5N1K kuralına uygun mu?', checked: true },
  { id: 'qa2', label: 'Kök neden analizi (5 Whys) yapılmış mı?', checked: true },
  { id: 'qa3', label: 'Kanıt dokümanları sisteme yüklenmiş mi?', checked: false },
  { id: 'qa4', label: 'Mevzuat referansı güncel mi?', checked: true },
  { id: 'qa5', label: 'Finansal etki hesaplaması doğru mu?', checked: false },
];

export default function FindingStudioPhase2Page() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getSeverityColor } = useParameterStore();

  // STATE
  const [finding, setFinding] = useState<ComprehensiveFinding | null>(null);
  const [loading, setLoading] = useState(true);
  const [qaList, setQaList] = useState(QA_CHECKLIST_ITEMS);
  const [newNote, setNewNote] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // 1. VERİ YÜKLEME
  useEffect(() => {
    const found = mockComprehensiveFindings.find(f => f.id === id) || mockComprehensiveFindings[0];
    setFinding(found);
    setLoading(false);
  }, [id]);

  // QA Check Toggle
  const toggleQa = (id: string) => {
    setQaList(prev => prev.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  // Yeni Not Ekleme (Mock)
  const handleAddNote = () => {
    if (!newNote.trim() || !finding) return;
    
    const note: ReviewNote = {
      id: `rn-${Date.now()}`,
      finding_id: finding.id,
      note_text: newNote,
      reviewer_id: 'u-me',
      reviewer_name: 'Siz (Yönetici)',
      status: 'OPEN',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // State'i güncelle (Gerçekte API çağrısı olur)
    setFinding({
      ...finding,
      review_notes: [...(finding.review_notes || []), note]
    });
    setNewNote('');
  };

  if (loading || !finding) return <div className="h-screen flex items-center justify-center bg-slate-50">Yükleniyor...</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* HEADER */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-6 h-16 flex items-center justify-between shadow-sm">
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
                <h1 className="text-sm font-bold text-slate-900 truncate max-w-[400px]">{finding.title}</h1>
            </div>
        </div>

        <ViewSwitcher findingId={finding.id} />

        <div className="flex items-center gap-2">
            <div className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full border border-orange-200 flex items-center gap-1">
                <AlertTriangle size={12}/> REVIEW MODE
            </div>
            <button onClick={() => setIsDrawerOpen(true)} className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50">
                AI Asistan
            </button>
        </div>
      </header>

      {/* MAIN CONTENT - SPLIT VIEW */}
      <main className="flex-1 flex overflow-hidden">
        
        {/* SOL PANEL: BULGU KAĞIDI (Değişmez Referans) */}
        <div className="flex-1 overflow-y-auto bg-slate-100 p-8 flex justify-center border-r border-slate-200">
            <div className="w-full max-w-[210mm] shadow-xl">
               {/* STEPPER'ı Kağıdın Üstüne Koyduk */}
               <div className="bg-white p-4 mb-4 rounded-lg border border-slate-200">
                  <WorkflowStepper currentStatus={finding.state} actionPlans={finding.action_plans as any} />
               </div>
               
               <FindingPaper finding={finding} />
            </div>
        </div>

        {/* SAĞ PANEL: YÖNETİCİ KOKPİTİ */}
        <div className="w-[450px] bg-white flex flex-col border-l border-slate-200 shadow-xl z-10">
            
            {/* 1. YÖNETİCİ AKSİYONLARI */}
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                <h2 className="text-lg font-bold text-slate-800 mb-1">Kalite Kontrol (QA)</h2>
                <p className="text-xs text-slate-500 mb-4">Bulguyu müzakereye açmadan önce kontrolleri tamamlayın.</p>
                
                <div className="grid grid-cols-2 gap-3">
                    <button className="flex items-center justify-center gap-2 py-3 bg-white border border-red-200 text-red-600 rounded-xl font-bold text-sm hover:bg-red-50 transition-all shadow-sm">
                        <XCircle size={16}/> Revize İste
                    </button>
                    <button className="flex items-center justify-center gap-2 py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200">
                        <CheckCircle2 size={16}/> Onayla
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
                
                {/* 2. QA CHECKLIST */}
                <div>
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <CheckSquare size={14}/> QA Kontrol Listesi
                    </h3>
                    <div className="space-y-2">
                        {qaList.map(item => (
                            <div 
                                key={item.id} 
                                onClick={() => toggleQa(item.id)}
                                className={clsx(
                                    "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all select-none",
                                    item.checked ? "bg-emerald-50 border-emerald-200" : "bg-white border-slate-200 hover:border-slate-300"
                                )}
                            >
                                <div className={clsx(
                                    "w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5 border",
                                    item.checked ? "bg-emerald-500 border-emerald-500 text-white" : "bg-white border-slate-300"
                                )}>
                                    {item.checked && <CheckCircle2 size={14} />}
                                </div>
                                <span className={clsx("text-sm", item.checked ? "text-emerald-900 font-medium" : "text-slate-600")}>
                                    {item.label}
                                </span>
                            </div>
                        ))}
                    </div>
                    {/* Progress Bar */}
                    <div className="mt-3 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-emerald-500 transition-all duration-500"
                            style={{ width: `${(qaList.filter(i=>i.checked).length / qaList.length) * 100}%` }}
                        />
                    </div>
                </div>

                {/* 3. REVIEW NOTES (CHAT) */}
                <div>
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <MessageSquare size={14}/> İnceleme Notları
                    </h3>
                    
                    <div className="space-y-3 mb-4">
                        {finding.review_notes?.map(note => (
                            <div key={note.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="font-bold text-slate-700 text-xs">{note.reviewer_name}</span>
                                    <span className="text-[10px] text-slate-400">{new Date(note.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                </div>
                                <p className="text-slate-600 leading-snug">{note.note_text}</p>
                                {note.status === 'CLEARED' && (
                                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center gap-1 text-xs text-emerald-600 font-bold">
                                        <CheckCircle2 size={12}/> Çözüldü
                                    </div>
                                )}
                            </div>
                        ))}
                        {(!finding.review_notes || finding.review_notes.length === 0) && (
                            <div className="text-center py-6 text-slate-400 text-xs italic bg-slate-50 rounded-lg border border-dashed border-slate-200">
                                Henüz not eklenmemiş.
                            </div>
                        )}
                    </div>

                    {/* Not Ekleme Alanı */}
                    <div className="relative">
                        <textarea
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                            placeholder="Düzeltme talebi veya not ekle..."
                            className="w-full p-3 pr-10 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none h-24"
                        />
                        <button 
                            onClick={handleAddNote}
                            disabled={!newNote.trim()}
                            className="absolute bottom-3 right-3 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ArrowLeft size={16} className="rotate-180" />
                        </button>
                    </div>
                </div>

                {/* 4. AI ANALİZİ */}
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-xl border border-indigo-100">
                    <h3 className="text-xs font-black text-indigo-800 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <ShieldCheck size={14}/> AI Risk Analizi
                    </h3>
                    <p className="text-xs text-indigo-900/80 leading-relaxed">
                        Bu bulgunun kök nedeni ile finansal etkisi arasında %85 tutarlılık tespit edildi. Ancak öneri kısmında "Süreç Sahibi" belirtilmemiş.
                    </p>
                </div>

            </div>
        </div>

      </main>

      {/* UNIVERSAL DRAWER */}
      <UniversalFindingDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        findingId={finding.id}
        defaultTab="ai"
        currentViewMode="studio"
      />

    </div>
  );
}