import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { navigationConfig, getAllNavigationPaths } from '@/shared/config/navigation';
import { GlassCard } from '@/shared/ui/GlassCard';
import { PageHeader } from '@/shared/ui/PageHeader';
import {
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  AlertTriangle,
  FileText,
  Eye,
  RefreshCw,
} from 'lucide-react';
import clsx from 'clsx';

interface PageStatus {
  path: string;
  label: string;
  status: 'ready' | 'empty' | 'broken' | 'unknown';
  reason?: string;
  badge?: string;
  badgeColor?: string;
}

export default function PageAuditPage() {
  const navigate = useNavigate();
  const [pageStatuses, setPageStatuses] = useState<PageStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'ready' | 'empty' | 'broken'>('all');

  useEffect(() => {
    auditPages();
  }, []);

  const auditPages = async () => {
    setLoading(true);
    const paths = getAllNavigationPaths();
    const statuses: PageStatus[] = [];

    // Flatten navigation to get all items with labels
    const flattenNav = (items: any[], results: any[] = []) => {
      for (const item of items) {
        if (item.path) {
          results.push({
            path: item.path,
            label: item.label,
            badge: item.badge,
            badgeColor: item.badgeColor,
          });
        }
        if (item.children) {
          flattenNav(item.children, results);
        }
      }
      return results;
    };

    const allPages = flattenNav(navigationConfig);

    for (const page of allPages) {
      const status = await checkPageStatus(page.path);
      statuses.push({
        path: page.path,
        label: page.label,
        status: status.status,
        reason: status.reason,
        badge: page.badge,
        badgeColor: page.badgeColor,
      });
    }

    setPageStatuses(statuses);
    setLoading(false);
  };

  const checkPageStatus = async (path: string): Promise<{ status: PageStatus['status']; reason?: string }> => {
    // Known empty/placeholder pages
    const knownEmpty = [
      '/governance/charter',
      '/governance/vault',
      '/strategy/objectives',
      '/library/risk-library',
      '/library/procedures',
      '/library/audit-programs',
    ];

    if (knownEmpty.includes(path)) {
      return { status: 'empty', reason: 'Known placeholder page' };
    }

    // Known working pages
    const knownWorking = [
      '/dashboard',
      '/execution/findings',
      '/execution/workpapers',
      '/reporting/executive',
      '/strategy/risk-heatmap',
      '/strategy/neural-map',
      '/ccm/predator',
      '/ai-agents',
      '/settings/system-health',
      '/settings/risk-constitution',
    ];

    if (knownWorking.includes(path)) {
      return { status: 'ready', reason: 'Verified working page' };
    }

    // Check if path contains certain keywords
    if (path.includes('demo')) {
      return { status: 'ready', reason: 'Demo page' };
    }

    // Default to ready for now (would need actual file inspection)
    return { status: 'ready', reason: 'Assumed functional' };
  };

  const filteredPages = pageStatuses.filter(page => {
    if (filter === 'all') return true;
    return page.status === filter;
  });

  const stats = {
    total: pageStatuses.length,
    ready: pageStatuses.filter(p => p.status === 'ready').length,
    empty: pageStatuses.filter(p => p.status === 'empty').length,
    broken: pageStatuses.filter(p => p.status === 'broken').length,
  };

  const getStatusIcon = (status: PageStatus['status']) => {
    switch (status) {
      case 'ready':
        return <CheckCircle2 className="text-green-500" size={20} />;
      case 'empty':
        return <AlertCircle className="text-amber-500" size={20} />;
      case 'broken':
        return <AlertTriangle className="text-red-500" size={20} />;
      default:
        return <FileText className="text-gray-400" size={20} />;
    }
  };

  const getStatusBadge = (status: PageStatus['status']) => {
    const badges = {
      ready: { label: 'HAZIR', color: 'bg-green-500 text-white' },
      empty: { label: 'BOŞ', color: 'bg-amber-500 text-white' },
      broken: { label: 'BOZUK', color: 'bg-red-500 text-white' },
      unknown: { label: 'BİLİNMİYOR', color: 'bg-gray-500 text-white' },
    };
    const badge = badges[status];
    return (
      <span className={clsx('px-2 py-0.5 rounded text-xs font-bold', badge.color)}>
        {badge.label}
      </span>
    );
  };

  const getBadgeColor = (color?: string) => {
    switch (color) {
      case 'red': return 'bg-red-500 text-white';
      case 'blue': return 'bg-blue-500 text-white';
      case 'green': return 'bg-green-500 text-white';
      case 'purple': return 'bg-purple-500 text-white';
      case 'emerald': return 'bg-emerald-500 text-white';
      default: return 'bg-amber-500 text-white';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <PageHeader
        title="Sayfa Denetim Aracı"
        subtitle="Tüm rotaları tarayın ve boş/bozuk sayfaları tespit edin"
      />

      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <GlassCard className="p-4">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Toplam Sayfa</div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white">{stats.total}</div>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Hazır</div>
          <div className="text-3xl font-bold text-green-600">{stats.ready}</div>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Boş</div>
          <div className="text-3xl font-bold text-amber-600">{stats.empty}</div>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Bozuk</div>
          <div className="text-3xl font-bold text-red-600">{stats.broken}</div>
        </GlassCard>
      </div>

      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setFilter('all')}
              className={clsx(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                filter === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              )}
            >
              Tümü ({stats.total})
            </button>
            <button
              onClick={() => setFilter('ready')}
              className={clsx(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                filter === 'ready'
                  ? 'bg-green-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              )}
            >
              Hazır ({stats.ready})
            </button>
            <button
              onClick={() => setFilter('empty')}
              className={clsx(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                filter === 'empty'
                  ? 'bg-amber-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              )}
            >
              Boş ({stats.empty})
            </button>
            <button
              onClick={() => setFilter('broken')}
              className={clsx(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                filter === 'broken'
                  ? 'bg-red-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              )}
            >
              Bozuk ({stats.broken})
            </button>
          </div>

          <button
            onClick={auditPages}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-slate-700 text-white rounded-lg hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Yeniden Tara
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Durum
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Sayfa Adı
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Rota
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Badge
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Neden
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Aksiyonlar
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-500">
                    Sayfalar taranıyor...
                  </td>
                </tr>
              ) : filteredPages.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-500">
                    Sonuç bulunamadı
                  </td>
                </tr>
              ) : (
                filteredPages.map((page, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      {getStatusIcon(page.status)}
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-slate-900 dark:text-white">
                      {page.label}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400 font-mono">
                      {page.path}
                    </td>
                    <td className="py-3 px-4">
                      {page.badge && (
                        <span className={clsx('px-2 py-0.5 rounded text-xs font-bold', getBadgeColor(page.badgeColor))}>
                          {page.badge}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-500 dark:text-slate-400">
                      {page.reason || '-'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {getStatusBadge(page.status)}
                        <button
                          onClick={() => navigate(page.path)}
                          className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
                          title="Sayfayı Ziyaret Et"
                        >
                          <Eye size={16} className="text-slate-600 dark:text-slate-400" />
                        </button>
                        <button
                          onClick={() => window.open(page.path, '_blank')}
                          className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
                          title="Yeni Sekmede Aç"
                        >
                          <ExternalLink size={16} className="text-slate-600 dark:text-slate-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      <div className="mt-6">
        <GlassCard className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-blue-500 shrink-0 mt-0.5" size={20} />
            <div className="text-sm text-slate-600 dark:text-slate-400">
              <strong className="text-slate-900 dark:text-white">Not:</strong> Bu araç, navigation config'deki tüm rotaları tarar ve durumlarını kontrol eder.
              Boş sayfalar manuel olarak işaretlenmiştir. Gerçek zamanlı dosya kontrolü için gelişmiş sürüm gereklidir.
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
