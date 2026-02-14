import { useState, useEffect } from 'react';
import { 
  CheckCircle2, AlertTriangle, MessageSquare, CheckSquare, 
  ShieldCheck, XCircle, ArrowRight 
} from 'lucide-react';
import clsx from 'clsx';

// --- MİMARİ BAĞLANTILAR ---
import { mockComprehensiveFindings } from '@/entities/finding/api/mock-comprehensive-data';
import type { ComprehensiveFinding, ReviewNote } from '@/entities/finding/model/types';

// --- UI BİLEŞENLERİ ---
import { FindingPaper } from '@/widgets/FindingStudio/FindingPaper';
import { GlassCard } from '@/shared/ui/GlassCard';

// QA Kontrol Listesi (Mock Veri - Gerçekte Config'den gelir)
const QA_CHECKLIST_ITEMS = [
  { id: 'qa1', label: 'Bulgu başlığı 5N1K kuralına uygun mu?', checked: true },
  { id: 'qa2', label: 'Kök neden analizi (5 Whys) yapılmış mı?', checked: true },
  { id: 'qa3', label: 'Kanıt dokümanları sisteme yüklenmiş mi?', checked: false },
  { id: 'qa4', label: 'Mevzuat referansı güncel mi?', checked: true },
  { id: 'qa5', label: 'Finansal etki hesaplaması doğru mu?', checked: false },
];

interface Phase2Props {
  findingId: string;
  onNextPhase: () => void; // Onayla -> Müzakere
  onRevision: () => void;  // Revize İste -> Taslak
}

export default function FindingStudioPhase2Page({ findingId, onNextPhase, onRevision }: Phase2Props) {
  // STATE
  const [finding, setFinding] = useState<ComprehensiveFinding | null>(null);
  const [qaList, setQaList] = useState(QA_CHECKLIST_ITEMS);
  const [newNote, setNewNote] = useState('');

  // 1. VERİ YÜKLEME
  useEffect(() => {
    const found = mockComprehensiveFindings.find(f => f.id === findingId);
    if (found) setFinding(found);
  }, [findingId]);

  // HANDLERS
  const toggleQa = (id: string) => {
    setQaList(prev => prev.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

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

    setFinding({
      ...finding,
      review_notes: [...(finding.review_notes || []), note]
    });
    setNewNote('');
  };

  if (!finding) return <div className="p-12 text-center text-slate-400">Veriler yükleniyor...</div>;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex h-[calc(100vh-200px)] overflow-hidden">
      
      {/* SOL PANEL: BULGU KAĞIDI (Scrollable) */}
      <div className="flex-1 overflow-y-auto bg-slate-100 p-8 flex justify-center border-r border-slate-200 custom-scrollbar relative">
          {/* Kağıt Gölgelendirmesi */}
          <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none"></div>
          
          <div className="w-full max-w-[210mm] shadow-2xl mb-24 z-10">
             <FindingPaper finding={finding} />
          </div>
      </div>

      {/* SAĞ PANEL: YÖNETİCİ KOKPİTİ (Sabit Genişlik) */}
      <div className="w-[450px] bg-white flex flex-col border-l border-slate-200 shadow-2xl z-20 shrink-0">
          
          {/* 1. ÜST AKSİYON BÖLÜMÜ */}
          <div className="p-6 border-b border-slate-100 bg-gradient-to-b from-white to-slate-50">
              <div className="flex items-center gap-2 mb-3">
                  <div className="px-3 py-1 bg-orange-100 text-orange-700 text-[10px] font-bold rounded-full border border-orange-200 flex items-center gap-1 shadow-sm w-fit uppercase tracking-wider">
                      <AlertTriangle size={10}/> REVIEW MODE
                  </div>
              </div>
              <h2 className="text-lg font-bold text-slate-800 mb-1">Kalite Kontrol (QA)</h2>
              <p className="text-xs text-slate-500 mb-5">Bulguyu müzakereye açmadan önce kontrolleri tamamlayın.</p>
              
              <div className="grid grid-cols-2 gap-3">
                  <button 
                      onClick={onRevision}
                      className="flex items-center justify-center gap-2 py-3 bg-white border border-red-200 text-red-600 rounded-xl font-bold text-sm hover:bg-red-50 hover:border-red-300 transition-all shadow-sm active:scale-95 group"
                  >
                      <XCircle size={16} className="group-hover:rotate-90 transition-transform"/> Revize İste
                  </button>
                  <button 
                      onClick={onNextPhase}
                      className="flex items-center justify-center gap-2 py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 active:scale-95 group"
                  >
                      <CheckCircle2 size={16}/> Onayla <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform"/>
                  </button>
              </div>
          </div>

          {/* 2. SCROLLABLE İÇERİK */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
              
              {/* A. QA CHECKLIST (Liquid Glass) */}
              <GlassCard className="p-5 !bg-white" neonGlow="none">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <CheckSquare size={14}/> Kontrol Listesi
                  </h3>
                  <div className="space-y-2.5">
                      {qaList.map(item => (
                          <div 
                              key={item.id} 
                              onClick={() => toggleQa(item.id)}
                              className={clsx(
                                  "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all select-none group",
                                  item.checked ? "bg-emerald-50 border-emerald-200" : "bg-slate-50 border-slate-100 hover:border-indigo-200 hover:bg-white"
                              )}
                          >
                              <div className={clsx(
                                  "w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5 border transition-colors",
                                  item.checked ? "bg-emerald-500 border-emerald-500 text-white" : "bg-white border-slate-300 group-hover:border-indigo-300"
                              )}>
                                  {item.checked && <CheckCircle2 size={14} />}
                              </div>
                              <span className={clsx("text-xs font-medium leading-relaxed", item.checked ? "text-emerald-900" : "text-slate-600")}>
                                  {item.label}
                              </span>
                          </div>
                      ))}
                  </div>
                  {/* Progress Bar */}
                  <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                          className="h-full bg-emerald-500 transition-all duration-500 ease-out"
                          style={{ width: `${(qaList.filter(i=>i.checked).length / qaList.length) * 100}%` }}
                      />
                  </div>
              </GlassCard>

              {/* B. REVIEW NOTES (CHAT) */}
              <div>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2 pl-1">
                      <MessageSquare size={14}/> İnceleme Notları
                  </h3>
                  
                  <div className="space-y-3 mb-4 max-h-64 overflow-y-auto custom-scrollbar p-1">
                      {finding.review_notes?.map(note => (
                          <div key={note.id} className="bg-slate-50 border border-slate-200 rounded-xl rounded-tl-none p-3 text-sm animate-in fade-in slide-in-from-left-2 shadow-sm">
                              <div className="flex justify-between items-start mb-1">
                                  <span className="font-bold text-slate-700 text-xs">{note.reviewer_name}</span>
                                  <span className="text-[10px] text-slate-400">{new Date(note.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                              </div>
                              <p className="text-slate-600 leading-snug text-xs">{note.note_text}</p>
                              {note.status === 'CLEARED' && (
                                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center gap-1 text-[10px] text-emerald-600 font-bold">
                                      <CheckCircle2 size={12}/> Çözüldü
                                  </div>
                              )}
                          </div>
                      ))}
                      {(!finding.review_notes || finding.review_notes.length === 0) && (
                          <div className="text-center py-8 text-slate-400 text-xs italic bg-slate-50 rounded-xl border border-dashed border-slate-200">
                              Henüz not eklenmemiş.
                          </div>
                      )}
                  </div>

                  {/* Not Ekleme Input */}
                  <div className="relative group">
                      <textarea
                          value={newNote}
                          onChange={(e) => setNewNote(e.target.value)}
                          placeholder="Düzeltme talebi veya not ekle..."
                          className="w-full p-3 pr-10 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none h-20 transition-all group-hover:border-slate-400"
                      />
                      <button 
                          onClick={handleAddNote}
                          disabled={!newNote.trim()}
                          className="absolute bottom-2 right-2 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                      >
                          <ArrowRight size={14} />
                      </button>
                  </div>
              </div>

              {/* C. AI RİSK ANALİZİ */}
              <GlassCard className="p-4 !bg-gradient-to-br !from-indigo-50 !to-purple-50 !border-indigo-100" neonGlow="none">
                  <h3 className="text-xs font-black text-indigo-800 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <ShieldCheck size={14}/> AI Risk Analizi
                  </h3>
                  <p className="text-xs text-indigo-900/80 leading-relaxed font-medium">
                      Bu bulgunun kök nedeni ile finansal etkisi arasında <strong>%85 tutarlılık</strong> tespit edildi. Ancak öneri kısmında "Süreç Sahibi" belirtilmemiş olabilir.
                  </p>
              </GlassCard>

          </div>
      </div>
    </div>
  );
}