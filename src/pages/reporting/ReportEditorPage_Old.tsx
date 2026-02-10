import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { EditorCanvas } from '@/features/report-editor/ui/EditorCanvas';
import { FindingPool } from '@/features/report-editor/ui/FindingPool';
import { AICopilotPanel } from '@/features/report-editor/ui/AICopilotPanel';
import { ZenReader } from '@/features/report-editor/ui/ZenReader';
import { useAutoSave } from '@/features/report-editor/hooks/useAutoSave';
import { reportApi } from '@/entities/report/api';
import { useReportStore } from '@/entities/report/model/store';
import { useAISettingsStore } from '@/shared/stores/ai-settings-store';
import { createEngine } from '@/shared/api/ai/engine';
import type { Report, ReportBlock } from '@/entities/report/model/types';
import {
  ArrowLeft,
  Save,
  Glasses,
  Loader2,
  Check,
  PanelLeftOpen,
  PanelRightOpen,
  PanelLeftClose,
  PanelRightClose,
  Cloud,
  CloudOff,
  FileText,
  Variable,
} from 'lucide-react';
import { SentinelDocs } from '@/widgets/SentinelOffice';
import clsx from 'clsx';

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-700',
  review: 'bg-amber-100 text-amber-700',
  published: 'bg-green-100 text-green-700',
};
const STATUS_LABELS: Record<string, string> = {
  draft: 'Taslak',
  review: 'Inceleme',
  published: 'Yayinlandi',
};

function blocksToTiptap(blocks: ReportBlock[]): any {
  const content: any[] = [];

  for (const block of blocks) {
    const c = block.content as any;
    switch (block.block_type) {
      case 'heading':
        content.push({
          type: 'heading',
          attrs: { level: c.level || 1 },
          content: c.text ? [{ type: 'text', text: c.text }] : [],
        });
        break;
      case 'paragraph':
        content.push({
          type: 'paragraph',
          content: c.text ? [{ type: 'text', text: c.text }] : [],
        });
        break;
      case 'finding_ref':
        content.push({
          type: 'paragraph',
          content: [{
            type: 'text',
            marks: [{ type: 'bold' }],
            text: `[BULGU: ${c.finding_ref || c.finding_id || ''}] ${c.title || ''}`,
          }],
        });
        break;
      case 'live_chart':
        content.push({
          type: 'paragraph',
          content: [{ type: 'text', text: `[Grafik: ${c.chart_type || 'chart'}]` }],
        });
        break;
      case 'signature':
        content.push({ type: 'horizontalRule' });
        content.push({
          type: 'paragraph',
          content: [{ type: 'text', text: `${c.signer_name || '________________'} - ${c.signer_title || ''}` }],
        });
        break;
      case 'divider':
        content.push({ type: 'horizontalRule' });
        break;
      default:
        if (c.text) {
          content.push({
            type: 'paragraph',
            content: [{ type: 'text', text: c.text }],
          });
        }
    }
  }

  return { type: 'doc', content: content.length > 0 ? content : [{ type: 'paragraph' }] };
}

export default function ReportEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { comments, fetchComments, addComment, resolveComment } = useReportStore();

  const [report, setReport] = useState<Report | null>(null);
  const [tiptapContent, setTiptapContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [zenMode, setZenMode] = useState(false);
  const [manualSaving, setManualSaving] = useState(false);
  const [manualSaved, setManualSaved] = useState(false);
  const [aiLoading, setAILoading] = useState(false);
  const [smartEditorMode, setSmartEditorMode] = useState(false);
  const [smartEditorFullScreen, setSmartEditorFullScreen] = useState(false);

  const aiSettings = useAISettingsStore();

  const { save: autoSave, saving: autoSaving, lastSaved } = useAutoSave(id);

  useEffect(() => {
    if (!id) return;
    loadReport(id);
    fetchComments(id);
  }, [id, fetchComments]);

  const loadReport = async (reportId: string) => {
    setLoading(true);
    try {
      const r = await reportApi.getReport(reportId);
      if (!r) {
        navigate('/reporting/library');
        return;
      }
      setReport(r);
      setTitle(r.title);

      if (r.tiptap_content) {
        setTiptapContent(r.tiptap_content);
      } else {
        const blocks = await reportApi.getBlocks(reportId);
        const doc = blocksToTiptap(blocks);
        setTiptapContent(doc);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditorUpdate = useCallback(
    (json: any) => {
      setTiptapContent(json);
      autoSave(json);
    },
    [autoSave]
  );

  const handleInsertFinding = useCallback(() => {
    /* drag & drop handled inside EditorCanvas */
  }, []);

  const handleManualSave = async () => {
    if (!id) return;
    setManualSaving(true);
    try {
      await reportApi.updateReport(id, { title });
      if (tiptapContent) {
        await reportApi.saveTiptapContent(id, tiptapContent);
      }
      setManualSaved(true);
      setTimeout(() => setManualSaved(false), 2000);
    } finally {
      setManualSaving(false);
    }
  };

  const handleStatusChange = async (status: string) => {
    if (!id) return;
    await reportApi.updateReport(id, { status } as any);
    setReport((prev) => prev ? { ...prev, status: status as any } : prev);
  };

  const handleAIGenerate = async (prompt: string) => {
    if (!aiSettings.isConfigured()) {
      addComment({ report_id: id!, text: '[AI] Motor yapilandirilmamis. Ayarlar > AI Motor sayfasindan API anahtarini girin.', type: 'SUGGESTION' });
      return;
    }
    setAILoading(true);
    try {
      const engine = createEngine(aiSettings.getConfig());
      const docText = tiptapContent?.content
        ?.map((n: any) => n.content?.map((c: any) => c.text).join('') || '')
        .join('\n') || '';
      const result = await engine.generateText(prompt, aiSettings.persona, docText);
      addComment({ report_id: id!, text: `[AI Yanit] ${result}`, type: 'SUGGESTION' });
    } catch (err: any) {
      addComment({ report_id: id!, text: `[AI Hata] ${err.message}`, type: 'COMMENT' });
    } finally {
      setAILoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  if (zenMode && tiptapContent) {
    return <ZenReader content={tiptapContent} title={title} onClose={() => setZenMode(false)} />;
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col -mx-6 -my-8 lg:-mx-8 xl:-mx-12">
      <div className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/reporting/library')}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-base font-bold text-slate-900 bg-transparent border-none outline-none min-w-[200px]"
            placeholder="Rapor basligi..."
          />
          {report && (
            <span className={clsx('px-2 py-0.5 rounded-md text-[10px] font-bold', STATUS_COLORS[report.status])}>
              {STATUS_LABELS[report.status]}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mr-2">
            {autoSaving ? (
              <>
                <Cloud size={12} className="animate-pulse text-blue-500" />
                <span>Kaydediliyor...</span>
              </>
            ) : lastSaved ? (
              <>
                <Cloud size={12} className="text-green-500" />
                <span>{lastSaved.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
              </>
            ) : (
              <>
                <CloudOff size={12} />
                <span>Kaydedilmedi</span>
              </>
            )}
          </div>

          <button
            onClick={() => setShowLeftPanel(!showLeftPanel)}
            className={clsx('p-2 rounded-lg border transition-colors', showLeftPanel ? 'bg-blue-50 border-blue-200 text-blue-600' : 'border-slate-200 text-slate-400')}
            title="Bulgu Havuzu"
          >
            {showLeftPanel ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
          </button>
          <button
            onClick={() => setShowRightPanel(!showRightPanel)}
            className={clsx('p-2 rounded-lg border transition-colors', showRightPanel ? 'bg-blue-50 border-blue-200 text-blue-600' : 'border-slate-200 text-slate-400')}
            title="AI Copilot & Yorumlar"
          >
            {showRightPanel ? <PanelRightClose size={16} /> : <PanelRightOpen size={16} />}
          </button>

          <div className="w-px h-6 bg-slate-200" />

          <button
            onClick={() => setSmartEditorMode(!smartEditorMode)}
            className={clsx(
              'p-2 rounded-lg border transition-colors flex items-center gap-1',
              smartEditorMode
                ? 'bg-blue-50 border-blue-200 text-blue-600'
                : 'border-slate-200 text-slate-500 hover:bg-blue-50 hover:border-blue-200'
            )}
            title="Smart Editor (Degiskenler)"
          >
            <Variable size={16} />
          </button>

          <button
            onClick={() => setZenMode(true)}
            className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700 transition-colors"
            title="Zen Okuma Modu"
          >
            <Glasses size={16} />
          </button>

          <select
            value={report?.status || 'draft'}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="text-[10px] font-bold border border-slate-200 rounded-lg px-2 py-2 bg-white"
          >
            <option value="draft">Taslak</option>
            <option value="review">Inceleme</option>
            <option value="published">Yayinla</option>
          </select>

          <button
            onClick={handleManualSave}
            disabled={manualSaving}
            className={clsx(
              'px-4 py-2 rounded-lg font-semibold text-xs flex items-center gap-1.5 transition-all',
              manualSaved ? 'bg-green-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'
            )}
          >
            {manualSaving ? <Loader2 size={14} className="animate-spin" /> : manualSaved ? <Check size={14} /> : <Save size={14} />}
            {manualSaved ? 'Kaydedildi' : 'Kaydet'}
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {showLeftPanel && (
          <div className="w-64 border-r border-slate-200 bg-white flex-shrink-0 overflow-hidden">
            <FindingPool onInsertFinding={handleInsertFinding} />
          </div>
        )}

        <div className="flex-1 overflow-auto bg-slate-50">
          {smartEditorMode ? (
            <div className={clsx(smartEditorFullScreen ? '' : 'max-w-[900px] mx-auto my-4')}>
              <SentinelDocs
                reportId={id || null}
                initialContent={tiptapContent}
                onContentChange={handleEditorUpdate}
                editable={report?.status !== 'published'}
                isFullScreen={smartEditorFullScreen}
                onFullScreen={() => setSmartEditorFullScreen(!smartEditorFullScreen)}
              />
            </div>
          ) : (
            <div className="max-w-[816px] mx-auto my-8 bg-white rounded-xl shadow-sm border border-slate-200 min-h-[800px]">
              {tiptapContent && (
                <EditorCanvas
                  content={tiptapContent}
                  onUpdate={handleEditorUpdate}
                  editable={report?.status !== 'published'}
                />
              )}
            </div>
          )}
        </div>

        {showRightPanel && (
          <div className="w-72 border-l border-slate-200 bg-white flex-shrink-0 overflow-hidden">
            {id && (
              <AICopilotPanel
                comments={comments}
                reportId={id}
                onAddComment={addComment}
                onResolve={resolveComment}
                onAIGenerate={handleAIGenerate}
                aiLoading={aiLoading}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
