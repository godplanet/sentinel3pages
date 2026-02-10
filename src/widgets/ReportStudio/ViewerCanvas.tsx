import { useEffect } from 'react';
import { useEditor, EditorContent, ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import { Node, mergeAttributes } from '@tiptap/core';
import clsx from 'clsx';
import { FileWarning, BarChart3, Lightbulb, AlertTriangle } from 'lucide-react';

interface ViewerCanvasProps {
  content: string;
  warmth?: number;
  onFindingClick?: (findingId: string) => void;
}

export function ViewerCanvas({ content, warmth = 0, onFindingClick }: ViewerCanvasProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      Highlight,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      FindingNodeExtension.configure({
        onFindingClick,
      }),
      ChartNodeExtension,
      ExecutiveSummaryNodeExtension,
      CalloutNodeExtension,
    ],
    content: content,
    editable: false,
    editorProps: {
      attributes: {
        class: clsx(
          'prose prose-slate max-w-none focus:outline-none',
          'prose-headings:font-bold prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl',
          'prose-p:leading-relaxed prose-p:text-slate-700',
          'prose-ul:list-disc prose-ol:list-decimal',
          'print:prose-h1:text-3xl print:prose-h2:text-2xl print:prose-h3:text-xl'
        ),
      },
    },
  });

  useEffect(() => {
    if (content && editor) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  const backgroundColor = warmth > 0
    ? `rgb(${250 - warmth * 5}, ${248 - warmth * 4}, ${245 - warmth * 3})`
    : 'rgb(255, 255, 255)';

  return (
    <div
      className="rounded-xl p-12 shadow-2xl transition-all duration-300 print:shadow-none print:p-8 print:bg-white"
      style={{ backgroundColor }}
    >
      <EditorContent editor={editor} />
    </div>
  );
}

const FindingNodeExtension = Node.create({
  name: 'findingNode',
  group: 'block',
  atom: true,
  addOptions() {
    return {
      onFindingClick: null,
    };
  },
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
    return ReactNodeViewRenderer((props) => (
      <FindingNodeComponent {...props} onFindingClick={this.options.onFindingClick} />
    ));
  },
});

function FindingNodeComponent({ node, onFindingClick }: any) {
  const { findingId, title, severity } = node.attrs;
  const severityColors = {
    Critical: 'border-red-500 bg-red-50 hover:bg-red-100',
    High: 'border-orange-500 bg-orange-50 hover:bg-orange-100',
    Medium: 'border-yellow-500 bg-yellow-50 hover:bg-yellow-100',
    Low: 'border-blue-500 bg-blue-50 hover:bg-blue-100',
  };
  const borderClass = severityColors[severity as keyof typeof severityColors] || severityColors.High;

  return (
    <NodeViewWrapper className="my-4 print:break-inside-avoid">
      <button
        onClick={() => onFindingClick?.(findingId)}
        className={clsx(
          'w-full border-l-4 rounded-lg p-4 transition-all cursor-pointer print:cursor-default',
          borderClass,
          'print:hover:bg-transparent'
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileWarning className="text-slate-600" size={20} />
            <div className="text-left">
              <div className="font-semibold text-slate-900">{title}</div>
              <div className="text-xs text-slate-500 mt-1">Önem Seviyesi: {severity}</div>
            </div>
          </div>
          <div className="print:hidden text-xs text-slate-500 bg-white px-3 py-1.5 rounded-lg">
            Detay için tıkla
          </div>
        </div>
      </button>
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
    <NodeViewWrapper className="my-6 print:break-inside-avoid">
      <div className="border border-slate-200 rounded-lg p-6 bg-slate-50 print:bg-white">
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

const ExecutiveSummaryNodeExtension = Node.create({
  name: 'executiveSummaryNode',
  group: 'block',
  content: 'block+',
  parseHTML() {
    return [
      {
        tag: 'executive-summary-node',
      },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    return ['executive-summary-node', mergeAttributes(HTMLAttributes), 0];
  },
  addNodeView() {
    return ReactNodeViewRenderer(ExecutiveSummaryNodeComponent);
  },
});

function ExecutiveSummaryNodeComponent({ node }: any) {
  return (
    <NodeViewWrapper className="my-6 print:break-inside-avoid">
      <div
        className={clsx(
          'relative overflow-hidden rounded-xl p-6',
          'bg-gradient-to-br from-indigo-50 via-white to-purple-50',
          'border-l-4 border-indigo-500',
          'print:bg-white print:border print:border-slate-300'
        )}
        style={{
          backdropFilter: 'blur(12px)',
        }}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-200/20 rounded-full blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center">
              <Lightbulb className="text-white" size={20} />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Yönetici Özeti</h3>
          </div>
          <div className="prose prose-slate max-w-none text-slate-700">
            {node.content}
          </div>
        </div>
      </div>
    </NodeViewWrapper>
  );
}

const CalloutNodeExtension = Node.create({
  name: 'calloutNode',
  group: 'block',
  content: 'block+',
  addAttributes() {
    return {
      type: {
        default: 'info',
      },
    };
  },
  parseHTML() {
    return [
      {
        tag: 'callout-node',
      },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    return ['callout-node', mergeAttributes(HTMLAttributes), 0];
  },
  addNodeView() {
    return ReactNodeViewRenderer(CalloutNodeComponent);
  },
});

function CalloutNodeComponent({ node }: any) {
  const { type } = node.attrs;
  const typeConfig = {
    info: {
      icon: Lightbulb,
      gradient: 'from-blue-50 via-white to-cyan-50',
      border: 'border-blue-500',
      iconBg: 'bg-blue-500',
    },
    warning: {
      icon: AlertTriangle,
      gradient: 'from-amber-50 via-white to-yellow-50',
      border: 'border-amber-500',
      iconBg: 'bg-amber-500',
    },
    danger: {
      icon: AlertTriangle,
      gradient: 'from-red-50 via-white to-pink-50',
      border: 'border-red-500',
      iconBg: 'bg-red-500',
    },
  };

  const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.info;
  const Icon = config.icon;

  return (
    <NodeViewWrapper className="my-4 print:break-inside-avoid">
      <div
        className={clsx(
          'relative overflow-hidden rounded-xl p-5',
          `bg-gradient-to-br ${config.gradient}`,
          `border-l-4 ${config.border}`,
          'print:bg-white print:border print:border-slate-300'
        )}
        style={{
          backdropFilter: 'blur(12px)',
        }}
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/30 rounded-full blur-2xl" />
        <div className="relative flex items-start gap-3">
          <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', config.iconBg)}>
            <Icon className="text-white" size={16} />
          </div>
          <div className="flex-1 prose prose-slate max-w-none text-sm text-slate-700">
            {node.content}
          </div>
        </div>
      </div>
    </NodeViewWrapper>
  );
}
