import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Plus,
  Clock,
  Eye,
  CheckCircle,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Sparkles,
} from 'lucide-react';
import clsx from 'clsx';
import { supabase } from '@/shared/api/supabase';
import { PageHeader } from '@/shared/ui/PageHeader';

interface ReportRow {
  id: string;
  title: string;
  status: string;
  created_at: string;
  updated_at: string;
  executive_summary: any;
  hash_seal: string | null;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  draft:      { label: 'Taslak',      color: 'bg-slate-100 text-slate-700',    icon: Clock },
  in_review:  { label: 'İncelemede',  color: 'bg-amber-100 text-amber-700',    icon: Eye },
  cae_review: { label: 'CAE Onayı',   color: 'bg-blue-100 text-blue-700',      icon: AlertCircle },
  published:  { label: 'Yayımlandı',  color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
  archived:   { label: 'Arşiv',       color: 'bg-slate-200 text-slate-500',     icon: FileText },
};

function gradeStyle(grade?: string): { bg: string; text: string } {
  if (!grade) return { bg: 'bg-slate-100', text: 'text-slate-500' };
  if (grade === 'A+' || grade === 'A')   return { bg: 'bg-emerald-500', text: 'text-white' };
  if (grade === 'B+' || grade === 'B')   return { bg: 'bg-amber-400',   text: 'text-white' };
  if (grade === 'C')                     return { bg: 'bg-red-500',     text: 'text-white' };
  if (grade === 'D')                     return { bg: 'bg-red-900',     text: 'text-white' };
  return { bg: 'bg-slate-200', text: 'text-slate-700' };
}

async function createDraftReport(): Promise<string | null> {
  const { data, error } = await supabase
    .from('m6_reports')
    .insert({
      title: 'Yeni Denetim Raporu',
      status: 'draft',
      theme_config: { paperStyle: 'zen_paper', typography: 'merriweather_inter' },
      executive_summary: {
        score: 0,
        grade: 'N/A',
        assuranceLevel: '',
        trend: 0,
        previousGrade: '',
        findingCounts: { critical: 0, high: 0, medium: 0, low: 0, observation: 0 },
        briefingNote: '',
        sections: { auditOpinion: '', criticalRisks: '', strategicRecommendations: '', managementAction: '' },
      },
      workflow: {},
    })
    .select('id')
    .maybeSingle();
  if (error) throw error;
  return data?.id ?? null;
}

export default function ReportLibraryPage() {
  const navigate = useNavigate();
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('m6_reports')
      .select('id, title, status, created_at, updated_at, executive_summary, hash_seal')
      .order('created_at', { ascending: false });
    if (err) {
      setError(err.message);
    } else {
      setReports(data ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleCreate = async () => {
    setCreating(true);
    try {
      const id = await createDraftReport();
      if (id) navigate(`/reporting/zen-editor/${id}`);
    } catch (err: any) {
      setError(err?.message ?? 'Rapor oluşturulamadı.');
    } finally {
      setCreating(false);
    }
  };

  const handleCardClick = (id: string) => {
    navigate(`/reporting/zen-editor/${id}`);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <PageHeader
        title="Rapor Kütüphanesi"
        description="Tüm denetim raporları, taslaklar ve yayımlanmış belgeler"
        icon={FileText}
        action={
          <button
            onClick={handleCreate}
            disabled={creating}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-700 transition-colors font-sans font-medium text-sm disabled:opacity-60"
          >
            {creating ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Plus size={16} />
            )}
            Yeni Rapor Oluştur
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto p-6">
        {error && (
          <div className="mb-6 flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            <AlertCircle size={16} className="flex-shrink-0" />
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-48 bg-white rounded-2xl border border-slate-200 animate-pulse"
              />
            ))}
          </div>
        ) : reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Sparkles size={48} className="text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 mb-2">Henüz rapor yok</h3>
            <p className="text-sm text-slate-500 mb-6">
              İlk raporunuzu oluşturmak için butona tıklayın
            </p>
            <button
              onClick={handleCreate}
              disabled={creating}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-700 transition-colors font-sans font-medium text-sm disabled:opacity-60"
            >
              {creating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              Yeni Rapor Oluştur
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map((report) => {
              const statusCfg = STATUS_CONFIG[report.status] ?? STATUS_CONFIG.draft;
              const StatusIcon = statusCfg.icon;
              const grade = report.executive_summary?.grade;
              const score = report.executive_summary?.score;
              const gs = gradeStyle(grade);
              const isPublished = report.status === 'published';

              return (
                <button
                  key={report.id}
                  onClick={() => handleCardClick(report.id)}
                  className="group text-left bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-slate-400 hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
                >
                  <div className="p-5 flex items-start justify-between gap-3 border-b border-slate-100">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-sans font-semibold text-slate-900 text-sm leading-snug line-clamp-2 group-hover:text-blue-700 transition-colors">
                        {report.title}
                      </h3>
                      <p className="text-xs font-sans text-slate-400 mt-1">
                        {new Date(report.created_at).toLocaleDateString('tr-TR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>

                    {grade && grade !== 'N/A' ? (
                      <div
                        className={clsx(
                          'flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center font-serif font-bold text-lg',
                          gs.bg,
                          gs.text,
                        )}
                      >
                        {grade}
                      </div>
                    ) : null}
                  </div>

                  <div className="px-5 py-3.5 flex items-center justify-between gap-3">
                    <span
                      className={clsx(
                        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-sans font-semibold',
                        statusCfg.color,
                      )}
                    >
                      <StatusIcon size={11} />
                      {statusCfg.label}
                    </span>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {score != null && typeof score === 'number' && grade !== 'N/A' && (
                        <span className="text-xs font-sans text-slate-400">
                          {score.toFixed(1)}<span className="text-slate-300">/100</span>
                        </span>
                      )}

                      {isPublished && report.hash_seal && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <ShieldCheck size={10} />
                          {report.hash_seal.slice(0, 8)}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
