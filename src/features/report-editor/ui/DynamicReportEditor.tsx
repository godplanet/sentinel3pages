/**
 * Dynamic Report Editor - Drag-and-Drop Live Document Builder
 *
 * Enhanced TipTap editor with live block components:
 * - {{RiskHeatmap}} - Embeds live risk visualization
 * - {{FindingTable}} - Dynamic findings table
 * - {{ExecutiveSummary}} - AI-generated summary
 */

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import { useState } from 'react';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Heading1,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Table as TableIcon,
  BarChart3,
  FileText,
  Download,
  Save,
  Sparkles,
} from 'lucide-react';
import clsx from 'clsx';
import { RiskHeatmapBlock } from '../blocks/RiskHeatmapBlock';
import { FindingTableBlock } from '../blocks/FindingTableBlock';
import { ExecutiveSummaryBlock } from '../blocks/ExecutiveSummaryBlock';
import { exportReportWithLiveData } from '../utils/pdf-live-data';

interface DynamicReportEditorProps {
  initialContent?: string;
  reportTitle?: string;
  onSave?: (content: string, html: string) => void;
}

export function DynamicReportEditor({
  initialContent = '',
  reportTitle = 'Untitled Report',
  onSave,
}: DynamicReportEditorProps) {
  const [showBlockMenu, setShowBlockMenu] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [insertedBlocks, setInsertedBlocks] = useState<Array<{
    id: string;
    type: 'heatmap' | 'findings' | 'summary';
    position: number;
  }>>([]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      Highlight,
      Placeholder.configure({
        placeholder: 'Start writing your report... Use the toolbar to insert live data blocks.',
      }),
    ],
    content: initialContent || '<h1>Audit Report</h1><p>Begin your executive report here...</p>',
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[500px] px-8 py-6',
      },
    },
  });

  const insertLiveBlock = (blockType: 'heatmap' | 'findings' | 'summary') => {
    if (!editor) return;

    const blockId = `block-${Date.now()}`;
    const position = editor.state.selection.anchor;

    const blockMarkers = {
      heatmap: '{{RiskHeatmap}}',
      findings: '{{FindingTable}}',
      summary: '{{ExecutiveSummary}}',
    };

    editor
      .chain()
      .focus()
      .insertContent(`<p>${blockMarkers[blockType]}</p>`)
      .run();

    setInsertedBlocks([...insertedBlocks, { id: blockId, type: blockType, position }]);
    setShowBlockMenu(false);
  };

  const handleSave = () => {
    if (!editor || !onSave) return;

    const content = editor.getJSON();
    const html = editor.getHTML();

    onSave(JSON.stringify(content), html);
  };

  const handleExportPDF = async () => {
    if (!editor) return;

    setIsExporting(true);
    try {
      await exportReportWithLiveData(editor, reportTitle, {
        author: 'Sentinel GRC',
        orientation: 'portrait',
        includeHeader: true,
        includeFooter: true,
      });
    } catch (error) {
      console.error('Failed to export PDF:', error);
      alert('Failed to export PDF. Please check browser console for details.');
    } finally {
      setIsExporting(false);
    }
  };

  const renderBlockPreview = (html: string) => {
    if (html.includes('{{RiskHeatmap}}')) {
      return (
        <div className="my-6">
          <RiskHeatmapBlock width={700} height={400} showTitle />
        </div>
      );
    }

    if (html.includes('{{FindingTable}}')) {
      return (
        <div className="my-6">
          <FindingTableBlock statusFilter="OPEN" limit={10} showStats />
        </div>
      );
    }

    if (html.includes('{{ExecutiveSummary}}')) {
      return (
        <div className="my-6">
          <ExecutiveSummaryBlock autoGenerate reportTitle={reportTitle} />
        </div>
      );
    }

    return null;
  };

  if (!editor) {
    return <div>Loading editor...</div>;
  }

  const currentHtml = editor.getHTML();

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="border-b border-slate-200 bg-slate-50 px-4 py-2">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-bold text-slate-900">{reportTitle}</h2>
          <div className="flex items-center gap-2">
            {onSave && (
              <button
                onClick={handleSave}
                className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
            )}
            <button
              onClick={handleExportPDF}
              disabled={isExporting}
              className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Download className={`w-4 h-4 ${isExporting ? 'animate-spin' : ''}`} />
              {isExporting ? 'Exporting...' : 'Export PDF'}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1 flex-wrap">
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={clsx(
              'p-2 rounded hover:bg-slate-200 transition-colors',
              editor.isActive('heading', { level: 1 }) && 'bg-slate-200'
            )}
            title="Heading 1"
          >
            <Heading1 className="w-4 h-4" />
          </button>

          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={clsx(
              'p-2 rounded hover:bg-slate-200 transition-colors',
              editor.isActive('heading', { level: 2 }) && 'bg-slate-200'
            )}
            title="Heading 2"
          >
            <Heading2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={clsx(
              'p-2 rounded hover:bg-slate-200 transition-colors',
              editor.isActive('heading', { level: 3 }) && 'bg-slate-200'
            )}
            title="Heading 3"
          >
            <Heading3 className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-slate-300 mx-1" />

          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={clsx(
              'p-2 rounded hover:bg-slate-200 transition-colors',
              editor.isActive('bold') && 'bg-slate-200'
            )}
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </button>

          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={clsx(
              'p-2 rounded hover:bg-slate-200 transition-colors',
              editor.isActive('italic') && 'bg-slate-200'
            )}
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </button>

          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={clsx(
              'p-2 rounded hover:bg-slate-200 transition-colors',
              editor.isActive('underline') && 'bg-slate-200'
            )}
            title="Underline"
          >
            <UnderlineIcon className="w-4 h-4" />
          </button>

          <button
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            className={clsx(
              'p-2 rounded hover:bg-slate-200 transition-colors',
              editor.isActive('highlight') && 'bg-slate-200'
            )}
            title="Highlight"
          >
            <Sparkles className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-slate-300 mx-1" />

          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={clsx(
              'p-2 rounded hover:bg-slate-200 transition-colors',
              editor.isActive('bulletList') && 'bg-slate-200'
            )}
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </button>

          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={clsx(
              'p-2 rounded hover:bg-slate-200 transition-colors',
              editor.isActive('orderedList') && 'bg-slate-200'
            )}
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-slate-300 mx-1" />

          <button
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={clsx(
              'p-2 rounded hover:bg-slate-200 transition-colors',
              editor.isActive({ textAlign: 'left' }) && 'bg-slate-200'
            )}
            title="Align Left"
          >
            <AlignLeft className="w-4 h-4" />
          </button>

          <button
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={clsx(
              'p-2 rounded hover:bg-slate-200 transition-colors',
              editor.isActive({ textAlign: 'center' }) && 'bg-slate-200'
            )}
            title="Align Center"
          >
            <AlignCenter className="w-4 h-4" />
          </button>

          <button
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={clsx(
              'p-2 rounded hover:bg-slate-200 transition-colors',
              editor.isActive({ textAlign: 'right' }) && 'bg-slate-200'
            )}
            title="Align Right"
          >
            <AlignRight className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-slate-300 mx-1" />

          <div className="relative">
            <button
              onClick={() => setShowBlockMenu(!showBlockMenu)}
              className="p-2 rounded bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-colors flex items-center gap-1"
              title="Insert Live Block"
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-medium">Insert Block</span>
            </button>

            {showBlockMenu && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 w-64">
                <button
                  onClick={() => insertLiveBlock('heatmap')}
                  className="w-full px-4 py-3 text-left hover:bg-slate-50 flex items-center gap-3 border-b border-slate-100"
                >
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="font-medium text-sm">Risk Heatmap</div>
                    <div className="text-xs text-slate-500">Live risk visualization</div>
                  </div>
                </button>

                <button
                  onClick={() => insertLiveBlock('findings')}
                  className="w-full px-4 py-3 text-left hover:bg-slate-50 flex items-center gap-3 border-b border-slate-100"
                >
                  <TableIcon className="w-5 h-5 text-orange-600" />
                  <div>
                    <div className="font-medium text-sm">Finding Table</div>
                    <div className="text-xs text-slate-500">Dynamic findings list</div>
                  </div>
                </button>

                <button
                  onClick={() => insertLiveBlock('summary')}
                  className="w-full px-4 py-3 text-left hover:bg-slate-50 flex items-center gap-3"
                >
                  <FileText className="w-5 h-5 text-purple-600" />
                  <div>
                    <div className="font-medium text-sm">Executive Summary</div>
                    <div className="text-xs text-slate-500">AI-generated overview</div>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-slate-100 p-8">
        <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg border border-slate-200">
          <EditorContent editor={editor} />

          {currentHtml.includes('{{RiskHeatmap}}') && (
            <div className="px-8 py-6">
              {renderBlockPreview('{{RiskHeatmap}}')}
            </div>
          )}

          {currentHtml.includes('{{FindingTable}}') && (
            <div className="px-8 py-6">
              {renderBlockPreview('{{FindingTable}}')}
            </div>
          )}

          {currentHtml.includes('{{ExecutiveSummary}}') && (
            <div className="px-8 py-6">
              {renderBlockPreview('{{ExecutiveSummary}}')}
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-slate-200 bg-slate-50 px-4 py-2 text-xs text-slate-600 flex items-center justify-between">
        <div>
          {editor.storage.characterCount?.characters() || 0} characters |{' '}
          {editor.storage.characterCount?.words() || 0} words
        </div>
        <div className="flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-blue-500" />
          <span>Live blocks update automatically</span>
        </div>
      </div>
    </div>
  );
}
