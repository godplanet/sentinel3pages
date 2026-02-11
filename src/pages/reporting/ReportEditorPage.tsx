import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Eye,
  Clock,
  CheckCircle,
  Glasses,
  FileText,
  Sidebar as SidebarIcon,
  X,
  Sparkles,
  Download,
  Share2,
  Loader2,
  Check,
} from 'lucide-react';
import clsx from 'clsx';
import { MOCK_REPORT_ARCHIVE } from '@/shared/data/mock-reports';
import { EditorCanvas, ResourceSidebar, WarmthSlider } from '@/widgets/ReportStudio';
import type { Finding } from '@/entities/finding/model/types';
import { AIWriterModal } from '@/features/report-editor/ui/AIWriterModal';
import { reportApi } from '@/entities/report/api';
import { exportReportToPDF } from '@/features/report-editor/utils/pdf-export';

const STATUS_CONFIG = {
  draft: { label: 'Taslak', color: 'bg-slate-100 text-slate-700', icon: Clock },
  review: { label: 'İncelemede', color: 'bg-amber-100 text-amber-700', icon: Eye },
  published: { label: 'Yayımlandı', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
};

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

export default function ReportEditorPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();

  const isNew = id === 'new';
  const [reportId, setReportId] = useState(isNew ? null : id);
  const [loading, setLoading] = useState(!isNew);
  const [report, setReport] = useState<any>(null);

  const [title, setTitle] = useState('Yeni Rapor');
  const [status, setStatus] = useState<'draft' | 'review' | 'published'>('draft');
  const [zenMode, setZenMode] = useState(false);
  const [warmth, setWarmth] = useState(0);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showAIWriter, setShowAIWriter] = useState(false);
  const [content, setContent] = useState('');
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [shareToast, setShareToast] = useState(false);

  useEffect(() => {
    if (!isNew && id) {
      setLoading(true);
      reportApi
        .getReport(id)
        .then((dbReport) => {
          if (dbReport) {
            setReport(dbReport);
            setTitle(dbReport.title || 'Rapor');
            setStatus((dbReport.status as any) || 'draft');
            if (typeof dbReport.tiptap_content === 'string') {
              setContent(dbReport.tiptap_content);
            } else if (dbReport.tiptap_content) {
              setContent(JSON.stringify(dbReport.tiptap_content));
            }
          } else {
            const mockReport = MOCK_REPORT_ARCHIVE.find((r) => r.id === id);
            if (mockReport) {
              setReport(mockReport);
              setTitle(mockReport.title);
              setStatus((mockReport.status as any) || 'draft');
              setContent(mockReport.content || '');
            }
          }
        })
        .catch((err) => {
          console.error('Failed to load report:', err);
          const mockReport = MOCK_REPORT_ARCHIVE.find((r) => r.id === id);
          if (mockReport) {
            setReport(mockReport);
            setTitle(mockReport.title);
            setContent(mockReport.content || '');
          }
        })
        .finally(() => setLoading(false));
    }
  }, [id, isNew]);

  const statusCfg = STATUS_CONFIG[status];
  const StatusIcon = statusCfg.icon;

  const handleInsertFinding = useCallback((finding: Finding) => {
    const findingHTML = `
      <div class="finding-card" style="border-left: 4px solid ${finding.severity === 'CRITICAL' ? '#ef4444' : finding.severity === 'HIGH' ? '#f59e0b' : '#3b82f6'}; padding: 1rem; margin: 1rem 0; background: #f8fafc; border-radius: 0.5rem;">
        <h4 style="font-weight: 600; margin-bottom: 0.5rem; color: #1e293b;">${finding.title}</h4>
        <p style="font-size: 0.875rem; color: #64748b; margin-bottom: 0.5rem;"><strong>Ref:</strong> ${finding.finding_ref || 'N/A'}</p>
        <p style="font-size: 0.875rem; color: #475569;">${finding.impact_description || finding.description || ''}</p>
        <span style="display: inline-block; margin-top: 0.5rem; padding: 0.25rem 0.75rem; background: ${finding.severity === 'CRITICAL' ? '#fee2e2' : finding.severity === 'HIGH' ? '#fef3c7' : '#dbeafe'}; color: ${finding.severity === 'CRITICAL' ? '#991b1b' : finding.severity === 'HIGH' ? '#92400e' : '#1e40af'}; border-radius: 0.375rem; font-size: 0.75rem; font-weight: 600;">${finding.severity}</span>
      </div>
    `;
    setContent((prev) => prev + findingHTML);
  }, []);

  const handleInsertChart = useCallback(() => {
    const chartHTML = `
      <div class="chart-placeholder" style="border: 2px dashed #cbd5e1; padding: 2rem; margin: 1rem 0; text-align: center; border-radius: 0.5rem; background: #f8fafc;">
        <p style="color: #64748b; font-weight: 500;">📊 Grafik Yer Tutucu - Gerçek veri ile değiştirilecek</p>
      </div>
    `;
    setContent((prev) => prev + chartHTML);
  }, []);

  const handleSave = async () => {
    setSaveState('saving');
    try {
      if (reportId && !isNew) {
        await reportApi.updateReport(reportId, { title, status });
        await reportApi.saveTiptapContent(reportId, content);
      } else {
        const newReport = await reportApi.createReport({
          title,
          description: title,
          layout_type: 'standard',
          status: 'draft',
        });
        await reportApi.saveTiptapContent(newReport.id, content);
        setReportId(newReport.id);
        window.history.replaceState(null, '', `/reporting/editor/${newReport.id}`);
      }
      setSaveState('saved');
      setTimeout(() => setSaveState('idle'), 2000);
    } catch (err) {
      console.error('Save failed:', err);
      setSaveState('error');
      setTimeout(() => setSaveState('idle'), 3000);
    }
  };

  const handleExportPDF = async () => {
    await exportReportToPDF(content, {
      title,
      author: report?.auditor_name || 'Sentinel GRC',
      orientation: 'portrait',
      includeHeader: true,
      includeFooter: true,
    });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setShareToast(true);
      setTimeout(() => setShareToast(false), 2000);
    });
  };

  const handlePreview = () => {
    if (reportId) {
      navigate(`/reporting/view/${reportId}`);
    }
  };

  const handleAIInsert = useCallback((aiContent: string) => {
    setContent((prev) => prev + aiContent);
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 print:bg-white">
      {!zenMode && (
        <div className="flex-shrink-0 bg-white border-b border-slate-200 px-6 py-4 print:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/reporting/library')}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} className="text-slate-600" />
              </button>

              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <SidebarIcon size={20} className="text-slate-600" />
              </button>

              <div className="flex items-center gap-2">
                <FileText className="text-slate-400" size={20} />
                <span className="text-sm text-slate-500">Rapor Düzenleyici</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAIWriter(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:shadow-lg transition-all font-medium text-sm"
              >
                <Sparkles size={16} />
                AI ile Oluştur
              </button>

              <button
                onClick={handleExportPDF}
                className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Download size={16} />
                PDF
              </button>

              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Share2 size={16} />
                Paylaş
              </button>

              <button
                onClick={handlePreview}
                className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Eye size={16} />
                Önizleme
              </button>

              <button
                onClick={() => setZenMode(true)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Glasses size={16} />
                Zen
              </button>

              <div className="relative">
                <button
                  className={clsx(
                    'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    statusCfg.color
                  )}
                >
                  <StatusIcon size={14} />
                  {statusCfg.label}
                </button>
              </div>

              <button
                onClick={handleSave}
                disabled={saveState === 'saving'}
                className={clsx(
                  'flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors',
                  saveState === 'saved'
                    ? 'bg-emerald-600 text-white'
                    : saveState === 'error'
                    ? 'bg-red-600 text-white'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                )}
              >
                {saveState === 'saving' && <Loader2 size={16} className="animate-spin" />}
                {saveState === 'saved' && <Check size={16} />}
                {saveState === 'idle' && <Save size={16} />}
                {saveState === 'error' && 'Hata'}
                {saveState === 'saved' && 'Kaydedildi'}
                {saveState === 'saving' && 'Kaydediliyor'}
                {saveState === 'idle' && 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        {showSidebar && !zenMode && (
          <div className="w-80 flex-shrink-0 overflow-hidden print:hidden">
            <ResourceSidebar
              engagementId={report?.engagement_id}
              onInsertFinding={handleInsertFinding}
              onInsertChart={handleInsertChart}
            />
          </div>
        )}

        <div className="flex-1 overflow-y-auto py-12 px-6 print:py-0 print:px-0">
          <div className="max-w-4xl mx-auto print:max-w-full">
            <div className="mb-8 print:hidden">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-4xl font-bold text-slate-900 border-none focus:outline-none focus:ring-0 placeholder-slate-300 bg-transparent mb-4"
                placeholder="Rapor Başlığı..."
              />
              <div className="flex items-center gap-4">
                <span className="text-sm text-slate-500">
                  {isNew
                    ? 'Yeni Rapor'
                    : `Oluşturulma: ${new Date(report?.created_at || '').toLocaleDateString('tr-TR')}`}
                </span>
                {report?.auditor_name && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span className="text-sm text-slate-500">{report.auditor_name}</span>
                  </>
                )}
              </div>
            </div>

            <EditorCanvas
              initialContent={content}
              onChange={setContent}
              warmth={warmth}
              zenMode={false}
              onInsertFinding={() => {}}
            />
          </div>
        </div>

        {!zenMode && (
          <div className="w-72 flex-shrink-0 bg-white border-l border-slate-200 p-4 space-y-4 overflow-y-auto print:hidden">
            <WarmthSlider value={warmth} onChange={setWarmth} />

            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Kısayollar</h3>
              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Kaydet</span>
                  <kbd className="px-2 py-1 bg-white rounded border border-slate-300">Ctrl+S</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Zen Modu</span>
                  <kbd className="px-2 py-1 bg-white rounded border border-slate-300">Ctrl+Z</kbd>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {zenMode && (
        <div className="fixed inset-0 bg-slate-900 z-50 flex print:hidden">
          <button
            onClick={() => setZenMode(false)}
            className="absolute top-6 right-6 p-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
          >
            <X size={20} />
          </button>

          <div className="flex-1 flex items-center justify-center p-6">
            <div className="max-w-4xl w-full">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-3xl font-bold text-white border-none focus:outline-none focus:ring-0 placeholder-slate-400 mb-8 bg-transparent"
                placeholder="Rapor Başlığı..."
              />

              <EditorCanvas
                initialContent={content}
                onChange={setContent}
                warmth={warmth}
                zenMode={true}
                onInsertFinding={() => {}}
              />
            </div>
          </div>

          <div className="w-72 bg-slate-800 p-4 space-y-4 overflow-y-auto">
            <WarmthSlider value={warmth} onChange={setWarmth} zenMode={true} />

            <div className="bg-slate-700/50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-white mb-3">Zen Modu</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Dikkatinizi yazıya odaklayın. Tüm dikkat dağıtıcı unsurlar gizlendi.
              </p>
            </div>
          </div>
        </div>
      )}

      {showAIWriter && (
        <AIWriterModal
          onClose={() => setShowAIWriter(false)}
          onInsert={handleAIInsert}
          findingCount={7}
        />
      )}

      {shareToast && (
        <div className="fixed bottom-4 right-4 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 print:hidden">
          <Check size={16} />
          Link panoya kopyalandı
        </div>
      )}
    </div>
  );
}
