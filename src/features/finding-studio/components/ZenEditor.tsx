import { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import { Bold, Italic, List, ListOrdered, Highlighter, Underline as UnderlineIcon } from 'lucide-react';
import clsx from 'clsx';
import { RootCauseEngine } from './RootCauseEngine';

interface ZenEditorProps {
  findingId?: string;
  initialData?: FindingEditorData;
  onChange?: (data: FindingEditorData) => void;
}

export interface FindingEditorData {
  criteria: string;
  condition: string;
  root_cause_analysis: RootCauseAnalysisData;
  effect: string;
  recommendation: string;
}

export interface RootCauseAnalysisData {
  method: 'five_whys' | 'fishbone' | 'bowtie';
  five_whys?: string[];
  fishbone?: {
    human: string[];
    method: string[];
    machine: string[];
    material: string[];
    environment: string[];
    measurement: string[];
  };
  bowtie?: {
    threats: string[];
    top_event: string;
    consequences: string[];
  };
}

const SECTION_CONFIGS = [
  {
    id: 'criteria',
    title: '1. KRİTER (Criteria)',
    subtitle: 'İlgili kanun, mevzuat, standart veya düzenleme',
    placeholder: 'Örn: BDDK Bilişim Sistemleri ve Elektronik Bankacılık Hizmetleri Yönetmeliği Madde 7...',
    color: 'blue',
  },
  {
    id: 'condition',
    title: '2. BULGU (Condition)',
    subtitle: 'Ne tespit edildi? Olgu nedir?',
    placeholder: 'Örn: Veritabanı yedeklemelerinin off-site lokasyona düzenli olarak gönderilmediği tespit edilmiştir...',
    color: 'amber',
  },
  {
    id: 'effect',
    title: '4. ETKİ (Effect / Risk)',
    subtitle: 'Bu bulgunun potansiyel etkileri ve riskleri nedir?',
    placeholder: 'Örn: Felaket durumunda veri kaybı riski yüksektir. Bu durum operasyonel sürekliliği tehdit etmektedir...',
    color: 'red',
  },
  {
    id: 'recommendation',
    title: '5. ÖNERİ (Recommendation)',
    subtitle: 'Düzeltici aksiyon önerileri',
    placeholder: 'Örn: Yedekleme prosedürlerinin güncellenmesi ve off-site yedekleme mekanizmasının kurulması önerilmektedir...',
    color: 'emerald',
  },
];

export function ZenEditor({ findingId, initialData, onChange }: ZenEditorProps) {
  const [activeSection, setActiveSection] = useState<string>('criteria');
  const [editorData, setEditorData] = useState<FindingEditorData>(
    initialData || {
      criteria: '',
      condition: '',
      root_cause_analysis: {
        method: 'five_whys',
        five_whys: ['', '', '', '', ''],
      },
      effect: '',
      recommendation: '',
    }
  );

  const criteriaEditor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: SECTION_CONFIGS[0].placeholder }),
      Underline,
      Highlight,
    ],
    content: editorData.criteria,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      updateSection('criteria', html);
    },
  });

  const conditionEditor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: SECTION_CONFIGS[1].placeholder }),
      Underline,
      Highlight,
    ],
    content: editorData.condition,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      updateSection('condition', html);
    },
  });

  const effectEditor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: SECTION_CONFIGS[2].placeholder }),
      Underline,
      Highlight,
    ],
    content: editorData.effect,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      updateSection('effect', html);
    },
  });

  const recommendationEditor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: SECTION_CONFIGS[3].placeholder }),
      Underline,
      Highlight,
    ],
    content: editorData.recommendation,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      updateSection('recommendation', html);
    },
  });

  const updateSection = (section: string, value: string) => {
    const newData = { ...editorData, [section]: value };
    setEditorData(newData);
    onChange?.(newData);
  };

  const updateRootCause = (rcaData: RootCauseAnalysisData) => {
    const newData = { ...editorData, root_cause_analysis: rcaData };
    setEditorData(newData);
    onChange?.(newData);
  };

  const getEditor = (id: string) => {
    switch (id) {
      case 'criteria':
        return criteriaEditor;
      case 'condition':
        return conditionEditor;
      case 'effect':
        return effectEditor;
      case 'recommendation':
        return recommendationEditor;
      default:
        return null;
    }
  };

  const FloatingToolbar = ({ editor }: { editor: any }) => {
    if (!editor) return null;

    return (
      <div className="flex items-center gap-1 mb-3 p-1.5 bg-slate-100 rounded-lg border border-slate-200">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={clsx(
            'p-2 rounded hover:bg-white transition-colors',
            editor.isActive('bold') ? 'bg-white text-blue-600' : 'text-slate-600'
          )}
        >
          <Bold size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={clsx(
            'p-2 rounded hover:bg-white transition-colors',
            editor.isActive('italic') ? 'bg-white text-blue-600' : 'text-slate-600'
          )}
        >
          <Italic size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={clsx(
            'p-2 rounded hover:bg-white transition-colors',
            editor.isActive('underline') ? 'bg-white text-blue-600' : 'text-slate-600'
          )}
        >
          <UnderlineIcon size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          className={clsx(
            'p-2 rounded hover:bg-white transition-colors',
            editor.isActive('highlight') ? 'bg-white text-yellow-600' : 'text-slate-600'
          )}
        >
          <Highlighter size={16} />
        </button>
        <div className="w-px h-6 bg-slate-300 mx-1" />
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={clsx(
            'p-2 rounded hover:bg-white transition-colors',
            editor.isActive('bulletList') ? 'bg-white text-blue-600' : 'text-slate-600'
          )}
        >
          <List size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={clsx(
            'p-2 rounded hover:bg-white transition-colors',
            editor.isActive('orderedList') ? 'bg-white text-blue-600' : 'text-slate-600'
          )}
        >
          <ListOrdered size={16} />
        </button>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="max-w-4xl mx-auto space-y-8">
          {SECTION_CONFIGS.map((section, index) => {
            const editor = getEditor(section.id);
            const colorClasses = {
              blue: 'border-blue-200 bg-blue-50/50',
              amber: 'border-amber-200 bg-amber-50/50',
              red: 'border-red-200 bg-red-50/50',
              emerald: 'border-emerald-200 bg-emerald-50/50',
            };

            return (
              <div
                key={section.id}
                className={clsx(
                  'border-2 rounded-xl p-6 transition-all',
                  activeSection === section.id
                    ? colorClasses[section.color as keyof typeof colorClasses]
                    : 'border-slate-200 bg-white'
                )}
                onClick={() => setActiveSection(section.id)}
              >
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-slate-900">{section.title}</h3>
                  <p className="text-sm text-slate-600 mt-1">{section.subtitle}</p>
                </div>

                {editor && <FloatingToolbar editor={editor} />}

                <EditorContent
                  editor={editor}
                  className="prose prose-sm max-w-none focus:outline-none"
                />
              </div>
            );
          })}

          <div
            className={clsx(
              'border-2 rounded-xl p-6 transition-all',
              activeSection === 'root_cause'
                ? 'border-purple-200 bg-purple-50/50'
                : 'border-slate-200 bg-white'
            )}
            onClick={() => setActiveSection('root_cause')}
          >
            <div className="mb-4">
              <h3 className="text-lg font-bold text-slate-900">
                3. KÖK NEDEN ANALİZİ (Root Cause Analysis)
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                Bilimsel metodlar ile kök nedeni belirleyin
              </p>
            </div>

            <RootCauseEngine
              data={editorData.root_cause_analysis}
              onChange={updateRootCause}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
