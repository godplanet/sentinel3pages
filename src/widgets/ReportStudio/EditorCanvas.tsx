import { useEffect, useState } from 'react';
import { useEditor, EditorContent, ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import { Node, mergeAttributes } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import clsx from 'clsx';
import {
  Heading1,
  Heading2,
  List,
  FileWarning,
  BarChart3,
  ChevronRight,
} from 'lucide-react';

const SlashMenuPluginKey = new PluginKey('slashMenu');

interface SlashMenuItem {
  title: string;
  description: string;
  icon: any;
  command: (editor: any) => void;
}

const SlashMenuPlugin = (items: SlashMenuItem[]) => {
  return new Plugin({
    key: SlashMenuPluginKey,
    state: {
      init() {
        return {
          open: false,
          query: '',
          index: 0,
        };
      },
      apply(tr, value) {
        const slashMeta = tr.getMeta(SlashMenuPluginKey);
        if (slashMeta) {
          return slashMeta;
        }
        return value;
      },
    },
    props: {
      handleKeyDown(view, event) {
        const { state } = view;
        const pluginState = SlashMenuPluginKey.getState(state);

        if (pluginState?.open) {
          if (event.key === 'ArrowDown') {
            event.preventDefault();
            const newIndex = (pluginState.index + 1) % items.length;
            view.dispatch(
              state.tr.setMeta(SlashMenuPluginKey, { ...pluginState, index: newIndex })
            );
            return true;
          }

          if (event.key === 'ArrowUp') {
            event.preventDefault();
            const newIndex = (pluginState.index - 1 + items.length) % items.length;
            view.dispatch(
              state.tr.setMeta(SlashMenuPluginKey, { ...pluginState, index: newIndex })
            );
            return true;
          }

          if (event.key === 'Enter') {
            event.preventDefault();
            const item = items[pluginState.index];
            if (item) {
              item.command(view.state.tr.doc);
            }
            view.dispatch(
              state.tr.setMeta(SlashMenuPluginKey, { open: false, query: '', index: 0 })
            );
            return true;
          }

          if (event.key === 'Escape') {
            event.preventDefault();
            view.dispatch(
              state.tr.setMeta(SlashMenuPluginKey, { open: false, query: '', index: 0 })
            );
            return true;
          }
        }

        return false;
      },
    },
  });
};

interface EditorCanvasProps {
  initialContent?: string;
  onChange?: (content: string) => void;
  warmth?: number;
  zenMode?: boolean;
  onInsertFinding?: () => void;
}

export function EditorCanvas({
  initialContent = '',
  onChange,
  warmth = 0,
  zenMode = false,
  onInsertFinding,
}: EditorCanvasProps) {
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashMenuPos, setSlashMenuPos] = useState({ top: 0, left: 0 });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const slashCommands: SlashMenuItem[] = [
    {
      title: 'Başlık 1',
      description: 'Büyük bölüm başlığı',
      icon: Heading1,
      command: (editor) => {
        editor.chain().focus().toggleHeading({ level: 1 }).run();
      },
    },
    {
      title: 'Başlık 2',
      description: 'Orta bölüm başlığı',
      icon: Heading2,
      command: (editor) => {
        editor.chain().focus().toggleHeading({ level: 2 }).run();
      },
    },
    {
      title: 'Madde İşaretli Liste',
      description: 'Basit bir liste oluştur',
      icon: List,
      command: (editor) => {
        editor.chain().focus().toggleBulletList().run();
      },
    },
    {
      title: 'Bulgu Ekle',
      description: 'Denetim bulgusunu rapora ekle',
      icon: FileWarning,
      command: (editor) => {
        if (onInsertFinding) {
          onInsertFinding();
        }
      },
    },
    {
      title: 'Risk Matrisi Ekle',
      description: 'Görsel risk haritası',
      icon: BarChart3,
      command: (editor) => {
        editor.chain().focus().insertContent('<chart-node></chart-node>').run();
      },
    },
  ];

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder: 'Yazmaya başlamak için "/" tuşuna basın...',
        emptyEditorClass: 'is-editor-empty',
      }),
      Underline,
      Highlight,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      FindingNodeExtension,
      ChartNodeExtension,
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: clsx(
          'prose prose-slate max-w-none focus:outline-none min-h-[600px]',
          'prose-headings:font-bold prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl',
          'prose-p:leading-relaxed prose-p:text-slate-700',
          'prose-ul:list-disc prose-ol:list-decimal'
        ),
      },
      handleKeyDown: (view, event) => {
        if (event.key === '/') {
          setTimeout(() => {
            const { state } = view;
            const { from } = state.selection;
            const coords = view.coordsAtPos(from);
            setSlashMenuPos({ top: coords.top + 25, left: coords.left });
            setShowSlashMenu(true);
            setSelectedIndex(0);
          }, 50);
        }

        if (showSlashMenu) {
          if (event.key === 'ArrowDown') {
            event.preventDefault();
            setSelectedIndex((prev) => (prev + 1) % slashCommands.length);
            return true;
          }
          if (event.key === 'ArrowUp') {
            event.preventDefault();
            setSelectedIndex((prev) => (prev - 1 + slashCommands.length) % slashCommands.length);
            return true;
          }
          if (event.key === 'Enter') {
            event.preventDefault();
            const command = slashCommands[selectedIndex];
            if (command) {
              const { state, dispatch } = view;
              const { from } = state.selection;
              const textBefore = state.doc.textBetween(from - 1, from);
              if (textBefore === '/') {
                const tr = state.tr.delete(from - 1, from);
                dispatch(tr);
              }
              command.command(editor);
            }
            setShowSlashMenu(false);
            return true;
          }
          if (event.key === 'Escape') {
            event.preventDefault();
            setShowSlashMenu(false);
            return true;
          }
        }

        return false;
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange?.(html);

      const text = editor.getText();
      if (!text.endsWith('/')) {
        setShowSlashMenu(false);
      }
    },
  });

  useEffect(() => {
    if (initialContent && editor && !editor.getText()) {
      editor.commands.setContent(initialContent);
    }
  }, [initialContent, editor]);

  const backgroundColor = warmth > 0
    ? `rgb(${250 - warmth * 5}, ${248 - warmth * 4}, ${245 - warmth * 3})`
    : 'rgb(255, 255, 255)';

  return (
    <div className="relative">
      <div
        className={clsx(
          'rounded-xl p-12 transition-all duration-300',
          zenMode ? 'shadow-sm' : 'shadow-2xl'
        )}
        style={{ backgroundColor }}
      >
        <EditorContent editor={editor} />
      </div>

      {showSlashMenu && (
        <div
          className="fixed z-50 bg-white rounded-lg shadow-2xl border border-slate-200 py-2 w-80"
          style={{ top: slashMenuPos.top, left: slashMenuPos.left }}
        >
          {slashCommands.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={item.title}
                onClick={() => {
                  const { state, view } = editor!;
                  const { from } = state.selection;
                  const textBefore = state.doc.textBetween(from - 1, from);
                  if (textBefore === '/') {
                    const tr = state.tr.delete(from - 1, from);
                    view.dispatch(tr);
                  }
                  item.command(editor);
                  setShowSlashMenu(false);
                }}
                className={clsx(
                  'w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-100 transition-colors',
                  selectedIndex === index && 'bg-blue-50'
                )}
              >
                <div className={clsx(
                  'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                  selectedIndex === index ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600'
                )}>
                  <Icon size={20} />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-slate-900 text-sm">{item.title}</div>
                  <div className="text-xs text-slate-500">{item.description}</div>
                </div>
                {selectedIndex === index && (
                  <ChevronRight size={16} className="text-blue-500" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

const FindingNodeExtension = Node.create({
  name: 'findingNode',
  group: 'block',
  atom: true,
  addAttributes() {
    return {
      findingId: {
        default: '',
      },
      title: {
        default: 'Bulgu Başlığı',
      },
      severity: {
        default: 'High',
      },
    };
  },
  parseHTML() {
    return [
      {
        tag: 'finding-node',
      },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    return ['finding-node', mergeAttributes(HTMLAttributes)];
  },
  addNodeView() {
    return ReactNodeViewRenderer(FindingNodeComponent);
  },
});

function FindingNodeComponent({ node }: any) {
  const { title, severity } = node.attrs;
  const severityColors = {
    Critical: 'border-red-500 bg-red-50',
    High: 'border-orange-500 bg-orange-50',
    Medium: 'border-yellow-500 bg-yellow-50',
    Low: 'border-blue-500 bg-blue-50',
  };
  const borderClass = severityColors[severity as keyof typeof severityColors] || severityColors.High;

  return (
    <NodeViewWrapper className="my-4">
      <div className={clsx('border-l-4 rounded-lg p-4', borderClass)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileWarning className="text-slate-600" size={20} />
            <div>
              <div className="font-semibold text-slate-900">{title}</div>
              <div className="text-xs text-slate-500 mt-1">Önem Seviyesi: {severity}</div>
            </div>
          </div>
          <button className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-colors">
            Detay
          </button>
        </div>
      </div>
    </NodeViewWrapper>
  );
}

const ChartNodeExtension = Node.create({
  name: 'chartNode',
  group: 'block',
  atom: true,
  parseHTML() {
    return [
      {
        tag: 'chart-node',
      },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    return ['chart-node', mergeAttributes(HTMLAttributes)];
  },
  addNodeView() {
    return ReactNodeViewRenderer(ChartNodeComponent);
  },
});

function ChartNodeComponent() {
  return (
    <NodeViewWrapper className="my-6">
      <div className="border border-slate-200 rounded-lg p-6 bg-slate-50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900">Risk Dağılım Matrisi</h3>
          <BarChart3 className="text-slate-400" size={20} />
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Kritik', count: 3, color: 'bg-red-500' },
            { label: 'Yüksek', count: 7, color: 'bg-orange-500' },
            { label: 'Orta', count: 12, color: 'bg-yellow-500' },
            { label: 'Düşük', count: 5, color: 'bg-blue-500' },
          ].map((item) => (
            <div key={item.label} className="bg-white rounded-lg p-4 border border-slate-200">
              <div className={clsx('w-8 h-8 rounded-full', item.color, 'mb-2')} />
              <div className="text-2xl font-bold text-slate-900">{item.count}</div>
              <div className="text-xs text-slate-500">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </NodeViewWrapper>
  );
}
