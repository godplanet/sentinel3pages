import { useState } from 'react';
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import { 
  Bold, Italic, List, ListOrdered, Highlighter, 
  Underline as UnderlineIcon, GitBranch 
} from 'lucide-react';
import clsx from 'clsx';

// --- TİP TANIMLARI ---
export interface RootCauseAnalysisData {
  method: 'five_whys' | 'fishbone' | 'bowtie';
  five_whys?: string[];
}

export interface FindingEditorData {
  criteria: string;
  condition: string;
  root_cause_analysis: RootCauseAnalysisData;
  effect: string;
  recommendation: string;
}

interface ZenEditorProps {
  findingId?: string;
  initialData?: FindingEditorData;
  onChange?: (data: FindingEditorData) => void;
}

// --- EDİTÖR KONFİGÜRASYONU ---
const SECTION_CONFIGS = [
  { id: 'criteria', title: '1. KRİTER (Criteria)', subtitle: 'Mevzuat, Politika veya Standart', placeholder: 'İlgili kanun maddesi veya prosedür referansı...', color: 'border-blue-200 bg-blue-50/30' },
  { id: 'condition', title: '2. TESPİT (Condition)', subtitle: 'Saha Bulgusu ve Kanıtlar', placeholder: 'Sahada gözlemlenen durum...', color: 'border-amber-200 bg-amber-50/30' },
  { id: 'effect', title: '4. ETKİ (Effect / Risk)', subtitle: 'Finansal ve Operasyonel Risk', placeholder: 'Kurumun maruz kaldığı risk...', color: 'border-red-200 bg-red-50/30' },
  { id: 'recommendation', title: '5. ÖNERİ (Recommendation)', subtitle: 'Düzeltici Aksiyon', placeholder: 'Kök nedeni ortadan kaldıracak öneri...', color: 'border-emerald-200 bg-emerald-50/30' },
];

export function ZenEditor({ findingId, initialData, onChange }: ZenEditorProps) {
  const [activeSection, setActiveSection] = useState<string>('criteria');
  
  // Veri State'i (Mock data ile beslenecek)
  const [data, setData] = useState<FindingEditorData>(initialData || {
    criteria: '', condition: '', effect: '', recommendation: '',
    root_cause_analysis: { method: 'five_whys', five_whys: ['', '', '', '', ''] }
  });

  // --- TIPTAP EDİTÖR KURULUMU ---
  const createEditor = (field: keyof FindingEditorData, placeholder: string) => useEditor({
    extensions: [
      StarterKit,
      Underline,
      Highlight.configure({ multicolor: true }),
      Placeholder.configure({ placeholder }),
    ],
    content: (data as any)[field], // HTML içeriği buradan alır
    onUpdate: ({ editor }) => {
      const val = editor.getHTML();
      const newData = { ...data, [field]: val };
      setData(newData);
      onChange?.(newData);
    },
  });

  // Her alan için ayrı editör instance'ı
  const editors = {
    criteria: createEditor('criteria', SECTION_CONFIGS[0].placeholder),
    condition: createEditor('condition', SECTION_CONFIGS[1].placeholder),
    effect: createEditor('effect', SECTION_CONFIGS[2].placeholder),
    recommendation: createEditor('recommendation', SECTION_CONFIGS[3].placeholder),
  };

  // Kök Neden Güncelleme
  const updateFiveWhys = (index: number, val: string) => {
    const newWhys = [...(data.root_cause_analysis.five_whys || [])];
    newWhys[index] = val;
    const newData = { ...data, root_cause_analysis: { ...data.root_cause_analysis, five_whys: newWhys } };
    setData(newData);
    onChange?.(newData);
  };

  // --- FLOATING TOOLBAR (Metin Seçince Çıkan Menü) ---
  const EditorToolbar = ({ editor }: { editor: any }) => {
    if (!editor) return null;
    return (
      <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }} className="flex items-center gap-1 p-1 bg-slate-900 text-white rounded-lg shadow-xl border border-slate-700 z-50">
        <button onClick={() => editor.chain().focus().toggleBold().run()} className={clsx("p-1.5 rounded hover:bg-slate-700", editor.isActive('bold') && "bg-slate-700 text-blue-400")}><Bold size={14}/></button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()} className={clsx("p-1.5 rounded hover:bg-slate-700", editor.isActive('italic') && "bg-slate-700 text-blue-400")}><Italic size={14}/></button>
        <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={clsx("p-1.5 rounded hover:bg-slate-700", editor.isActive('underline') && "bg-slate-700 text-blue-400")}><UnderlineIcon size={14}/></button>
        <button onClick={() => editor.chain().focus().toggleHighlight().run()} className={clsx("p-1.5 rounded hover:bg-slate-700", editor.isActive('highlight') && "bg-slate-700 text-yellow-400")}><Highlighter size={14}/></button>
        <div className="w-px h-4 bg-slate-600 mx-1" />
        <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={clsx("p-1.5 rounded hover:bg-slate-700", editor.isActive('bulletList') && "bg-slate-700 text-blue-400")}><List size={14}/></button>
      </BubbleMenu>
    );
  };

  return (
    <div className="space-y-8 pb-20">
      {/* 1. KRİTER */}
      <SectionWrapper 
        config={SECTION_CONFIGS[0]} 
        isActive={activeSection === 'criteria'} 
        onClick={() => setActiveSection('criteria')}
      >
        <EditorToolbar editor={editors.criteria} />
        <EditorContent editor={editors.criteria} className="prose prose-sm max-w-none min-h-[80px] focus:outline-none" />
      </SectionWrapper>

      {/* 2. TESPİT */}
      <SectionWrapper 
        config={SECTION_CONFIGS[1]} 
        isActive={activeSection === 'condition'} 
        onClick={() => setActiveSection('condition')}
      >
        <EditorToolbar editor={editors.condition} />
        <EditorContent editor={editors.condition} className="prose prose-sm max-w-none min-h-[120px] focus:outline-none" />
      </SectionWrapper>

      {/* 3. KÖK NEDEN (ÖZEL BİLEŞEN) */}
      <div 
        className={clsx(
          "rounded-xl border-2 transition-all duration-300 p-6 cursor-pointer relative overflow-hidden group",
          activeSection === 'root_cause' ? "border-purple-300 bg-purple-50/40 shadow-sm" : "border-slate-200 bg-white hover:border-slate-300"
        )}
        onClick={() => setActiveSection('root_cause')}
      >
        <div className="flex items-center gap-3 mb-4">
           <div className="p-2 bg-purple-100 text-purple-700 rounded-lg"><GitBranch size={20}/></div>
           <div>
              <h3 className="font-bold text-slate-800 text-sm">3. KÖK NEDEN (Root Cause)</h3>
              <p className="text-xs text-slate-500">5-Neden Analizi</p>
           </div>
        </div>
        
        <div className="space-y-3 relative pl-4 border-l-2 border-purple-200 ml-3">
           {data.root_cause_analysis.five_whys?.map((why, idx) => (
             <div key={idx} className="relative">
                <span className="absolute -left-[25px] top-2.5 w-5 h-5 rounded-full bg-white border border-purple-300 flex items-center justify-center text-[10px] font-bold text-purple-600 shadow-sm">{idx + 1}</span>
                <input 
                  type="text" 
                  value={why} 
                  onChange={(e) => updateFiveWhys(idx, e.target.value)}
                  placeholder={`${idx === 0 ? 'Sorun neden oluştu?' : 'Bunun nedeni neydi?'}`}
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-sm"
                />
             </div>
           ))}
        </div>
      </div>

      {/* 4. ETKİ */}
      <SectionWrapper 
        config={SECTION_CONFIGS[2]} 
        isActive={activeSection === 'effect'} 
        onClick={() => setActiveSection('effect')}
      >
        <EditorToolbar editor={editors.effect} />
        <EditorContent editor={editors.effect} className="prose prose-sm max-w-none min-h-[80px] focus:outline-none" />
      </SectionWrapper>

      {/* 5. ÖNERİ */}
      <SectionWrapper 
        config={SECTION_CONFIGS[3]} 
        isActive={activeSection === 'recommendation'} 
        onClick={() => setActiveSection('recommendation')}
      >
        <EditorToolbar editor={editors.recommendation} />
        <EditorContent editor={editors.recommendation} className="prose prose-sm max-w-none min-h-[80px] focus:outline-none" />
      </SectionWrapper>

    </div>
  );
}

// Yardımcı Wrapper Bileşen
function SectionWrapper({ config, isActive, onClick, children }: any) {
  return (
    <div 
      onClick={onClick}
      className={clsx(
        "rounded-xl border-2 transition-all duration-300 p-6 cursor-pointer relative group",
        isActive ? `${config.color} shadow-sm ring-1 ring-black/5` : "border-slate-200 bg-white hover:border-slate-300"
      )}
    >
      <div className="flex items-center gap-3 mb-4">
         <div className={clsx("w-1 h-8 rounded-full", isActive ? "bg-slate-800" : "bg-slate-300")} />
         <div>
            <h3 className="font-bold text-slate-800 text-sm tracking-tight">{config.title}</h3>
            <p className="text-xs text-slate-500 font-medium">{config.subtitle}</p>
         </div>
      </div>
      {children}
    </div>
  );
}