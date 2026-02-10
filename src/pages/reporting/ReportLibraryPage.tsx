import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/shared/ui';
import { TemplatePicker } from '@/features/report-editor/ui/TemplatePicker';
import { reportApi } from '@/entities/report/api';
import { useReportStore } from '@/entities/report/model/store';
import type { Report, ReportTemplate, TemplateBlock } from '@/entities/report/model/types';
import {
  Plus,
  FileText,
  Clock,
  Loader2,
  MoreVertical,
  Trash2,
  Building2,
  Search,
  Shield,
  Monitor,
} from 'lucide-react';
import clsx from 'clsx';

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-700',
  review: 'bg-amber-100 text-amber-700',
  published: 'bg-green-100 text-green-700',
  archived: 'bg-slate-100 text-slate-500',
};

const STATUS_LABELS: Record<string, string> = {
  draft: 'Taslak',
  review: 'Inceleme',
  published: 'Yayinlandi',
  archived: 'Arsiv',
};

const TYPE_ICONS: Record<string, React.ElementType> = {
  BRANCH: Building2,
  INVESTIGATION: Search,
  IT: Monitor,
  PROCESS: FileText,
  CUSTOM: Shield,
};

const TYPE_COLORS: Record<string, string> = {
  BRANCH: 'from-blue-500 to-blue-600',
  INVESTIGATION: 'from-red-500 to-red-600',
  IT: 'from-cyan-500 to-cyan-600',
  PROCESS: 'from-teal-500 to-teal-600',
  CUSTOM: 'from-slate-500 to-slate-600',
};

export default function ReportLibraryPage() {
  const navigate = useNavigate();
  const { templates, fetchTemplates, createReport, addBlock } = useReportStore();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  useEffect(() => {
    fetchTemplates();
    loadReports();
  }, [fetchTemplates]);

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await reportApi.getReports();
      setReports(data);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFromTemplate = async (template: ReportTemplate) => {
    setShowTemplatePicker(false);
    const report = await createReport({
      title: template.title.replace('(Standart)', '').trim(),
      template_id: template.id,
      description: template.description,
    });

    const templateBlocks = (template.structure_json || []) as TemplateBlock[];
    for (let i = 0; i < templateBlocks.length; i++) {
      const tb = templateBlocks[i];
      await addBlock({
        report_id: report.id,
        position_index: i,
        block_type: tb.block_type,
        content: tb.content,
      });
    }

    navigate(`/reporting/edit/${report.id}`);
  };

  const handleCreateBlank = async () => {
    setShowTemplatePicker(false);
    const report = await createReport({ title: 'Yeni Rapor' });
    navigate(`/reporting/edit/${report.id}`);
  };

  const handleDelete = async (id: string) => {
    setMenuOpen(null);
    await reportApi.deleteReport(id);
    setReports((prev) => prev.filter((r) => r.id !== id));
  };

  const templateMap = new Map(templates.map((t) => [t.id, t]));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sentinel Studio"
        description="Denetim raporlarini olusturun, duzenleyin ve yayinlayin"
      />

      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-500">
          {reports.length} rapor
        </div>
        <button
          onClick={() => setShowTemplatePicker(true)}
          className="px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-semibold text-sm flex items-center gap-2 shadow-sm hover:shadow-md"
        >
          <Plus size={16} />
          Yeni Rapor
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-blue-500" size={32} />
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm text-center py-20">
          <FileText className="mx-auto text-slate-300 mb-4" size={64} />
          <p className="text-slate-700 font-semibold text-lg mb-2">Henuz rapor olusturulmadi</p>
          <p className="text-slate-400 text-sm mb-6">Sablon secin ve ilk raporunuzu olusturun</p>
          <button
            onClick={() => setShowTemplatePicker(true)}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm inline-flex items-center gap-2 hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} />
            Yeni Rapor
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {reports.map((report) => {
            const tmpl = report.template_id ? templateMap.get(report.template_id) : null;
            const tmplType = tmpl?.type || 'CUSTOM';
            const Icon = TYPE_ICONS[tmplType] || FileText;

            return (
              <div
                key={report.id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all group cursor-pointer relative"
                onClick={() => navigate(`/reporting/edit/${report.id}`)}
              >
                <div className={clsx(
                  'h-2 rounded-t-xl bg-gradient-to-r',
                  TYPE_COLORS[tmplType] || TYPE_COLORS.CUSTOM
                )} />

                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className={clsx(
                      'w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-sm',
                      TYPE_COLORS[tmplType] || TYPE_COLORS.CUSTOM
                    )}>
                      <Icon size={18} className="text-white" />
                    </div>

                    <div className="relative">
                      <button
                        onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === report.id ? null : report.id); }}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreVertical size={14} />
                      </button>
                      {menuOpen === report.id && (
                        <div className="absolute right-0 top-8 bg-white border border-slate-200 rounded-lg shadow-xl z-10 py-1 w-36">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(report.id); }}
                            className="w-full px-3 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 text-left"
                          >
                            <Trash2 size={12} /> Sil
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 mb-1 line-clamp-2 leading-snug">
                    {report.title}
                  </h3>
                  {report.description && (
                    <p className="text-xs text-slate-400 line-clamp-1 mb-3">{report.description}</p>
                  )}

                  <div className="flex items-center justify-between mt-3">
                    <span className={clsx('px-2 py-0.5 rounded-md text-[10px] font-bold', STATUS_COLORS[report.status])}>
                      {STATUS_LABELS[report.status] || report.status}
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock size={10} />
                      {new Date(report.updated_at).toLocaleDateString('tr-TR')}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showTemplatePicker && (
        <TemplatePicker
          templates={templates}
          onSelect={handleCreateFromTemplate}
          onBlank={handleCreateBlank}
          onClose={() => setShowTemplatePicker(false)}
        />
      )}
    </div>
  );
}
