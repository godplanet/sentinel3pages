import { useState, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Eye,
  Clock,
  CheckCircle,
  Glasses,
  FileText,
  MoreVertical,
  Sidebar as SidebarIcon,
  X,
} from 'lucide-react';
import clsx from 'clsx';
import { MOCK_REPORT_ARCHIVE, MOCK_REPORT_TEMPLATES } from '@/shared/data/mock-reports';
import { EditorCanvas, ResourceSidebar, WarmthSlider } from '@/widgets/ReportStudio';
import { applyTemplate } from '@/features/reporting/templates';
import type { Finding } from '@/entities/finding/model/types';

const STATUS_CONFIG = {
  draft: { label: 'Taslak', color: 'bg-slate-100 text-slate-700', icon: Clock },
  review: { label: 'İncelemede', color: 'bg-amber-100 text-amber-700', icon: Eye },
  published: { label: 'Yayımlandı', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
};

export default function ReportEditorPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get('template');

  const isNew = id === 'new';
  const report = isNew ? null : MOCK_REPORT_ARCHIVE.find((r) => r.id === id);
  const template = templateId ? MOCK_REPORT_TEMPLATES.find((t) => t.id === templateId) : null;

  const [title, setTitle] = useState(report?.title || template?.title || 'Yeni Rapor');
  const [status, setStatus] = useState<'draft' | 'review' | 'published'>(
    (report?.status as any) || 'draft'
  );
  const [zenMode, setZenMode] = useState(false);
  const [warmth, setWarmth] = useState(0);
  const [showSidebar, setShowSidebar] = useState(true);
  const [content, setContent] = useState(() => {
    if (template && templateId) {
      return applyTemplate(templateId);
    }
    return report?.content || '';
  });
  const editorRef = useRef<any>(null);

  const statusCfg = STATUS_CONFIG[status];
  const StatusIcon = statusCfg.icon;

  const handleInsertFinding = (finding: Finding) => {
    if (editorRef.current) {
      const findingNode = {
        type: 'findingNode',
        attrs: {
          findingId: finding.id,
          title: finding.title,
          severity: finding.severity,
        },
      };
      editorRef.current.chain().focus().insertContent(findingNode).run();
    }
  };

  const handleInsertChart = () => {
    if (editorRef.current) {
      editorRef.current.chain().focus().insertContent('<chart-node></chart-node>').run();
    }
  };

  const handleSave = () => {
    console.log('Saving report...', { title, status, content });
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50">
      {/* Top Bar */}
      {!zenMode && (
        <div className="flex-shrink-0 bg-white border-b border-slate-200 px-6 py-4">
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
                onClick={() => setZenMode(true)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Glasses size={16} />
                Zen Modu
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
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
              >
                <Save size={16} />
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Editor Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Resources */}
        {showSidebar && !zenMode && (
          <div className="w-80 flex-shrink-0 overflow-hidden">
            <ResourceSidebar
              engagementId={report?.engagement_id}
              onInsertFinding={handleInsertFinding}
              onInsertChart={handleInsertChart}
            />
          </div>
        )}

        {/* Editor Canvas */}
        <div className="flex-1 overflow-y-auto py-12 px-6">
          <div className="max-w-4xl mx-auto">
            {/* Editable Title */}
            <div className="mb-8">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-4xl font-bold text-slate-900 border-none focus:outline-none focus:ring-0 placeholder-slate-300 bg-transparent mb-4"
                placeholder="Rapor Başlığı..."
              />
              <div className="flex items-center gap-4">
                <span className="text-sm text-slate-500">
                  {isNew ? 'Yeni Rapor' : `Oluşturulma: ${new Date(report?.created_at || '').toLocaleDateString('tr-TR')}`}
                </span>
                {report?.auditor_name && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span className="text-sm text-slate-500">{report.auditor_name}</span>
                  </>
                )}
              </div>
            </div>

            {/* Editor */}
            <EditorCanvas
              initialContent={content}
              onChange={setContent}
              warmth={warmth}
              zenMode={false}
              onInsertFinding={() => {}}
            />
          </div>
        </div>

        {/* Right Sidebar - Tools */}
        {!zenMode && (
          <div className="w-72 flex-shrink-0 bg-white border-l border-slate-200 p-4 space-y-4 overflow-y-auto">
            <WarmthSlider value={warmth} onChange={setWarmth} />

            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Kısayollar</h3>
              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Slash Menü</span>
                  <kbd className="px-2 py-1 bg-white rounded border border-slate-300">/</kbd>
                </div>
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

            {template && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-blue-900 mb-2">Aktif Şablon</h3>
                <p className="text-xs text-blue-700">{template.title}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Zen Mode Overlay */}
      {zenMode && (
        <div className="fixed inset-0 bg-slate-900 z-50 flex">
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
    </div>
  );
}
