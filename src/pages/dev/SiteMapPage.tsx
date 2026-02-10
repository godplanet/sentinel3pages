/**
 * Site Map Audit Page - Developer Tool
 *
 * Compares all defined routes with navigation config
 * to detect orphaned pages (pages without menu links).
 */

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllNavigationPaths } from '@/shared/config/navigation';
import {
  Map,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Search,
  Filter,
  FileCode,
  Navigation,
  Package,
  Trash2,
  Eye,
} from 'lucide-react';
import clsx from 'clsx';

const ALL_ROUTES = [
  '/login',
  '/403',
  '/404',
  '/dashboard',
  '/dashboard/strategic',
  '/dashboard/ecosystem',
  '/strategy/objectives',
  '/strategy/universe',
  '/strategy/universe-module2',
  '/strategy/audit-universe',
  '/strategy/risk-assessment',
  '/strategy/annual-plan',
  '/strategy/risk-heatmap',
  '/strategy/risk-lab',
  '/strategy/quant',
  '/governance/board',
  '/governance/stakeholders',
  '/governance/voice',
  '/governance/policies',
  '/governance/vault',
  '/governance/charter',
  '/execution/my-engagements',
  '/execution/workpapers',
  '/execution/investigations',
  '/execution/findings',
  '/execution/finding-hub',
  '/execution/actions',
  '/execution/pbc',
  '/execution/start',
  '/execution/agile',
  '/execution/new-engagement',
  '/execution/create',
  '/execution/sprints',
  '/resources',
  '/resources/talent-os',
  '/monitoring/watchtower',
  '/monitoring/probes',
  '/monitoring/continuous',
  '/monitoring/ccm',
  '/monitoring/anomaly',
  '/monitoring/credit',
  '/monitoring/market',
  '/reporting/library',
  '/reporting/builder',
  '/reporting/executive',
  '/reporting/trends',
  '/reporting/entity-scorecard',
  '/qaip',
  '/qaip/internal',
  '/qaip/reviews',
  '/qaip/kpi',
  '/qaip/external',
  '/qaip/surveys',
  '/settings',
  '/settings/users',
  '/settings/appearance',
  '/settings/methodology',
  '/settings/cognitive-engine',
  '/settings/integrations',
  '/settings/custom-fields',
  '/settings/templates',
  '/settings/risk-constitution',
  '/compliance',
  '/compliance/regulations',
  '/compliance/gap-analysis',
  '/tprm',
  '/automation',
  '/sox',
  '/esg',
  '/oracle',
  '/ai-agents',
  '/chaos-lab',
  '/demo/constitution',
  '/secure-report',
  '/triage-cockpit',
  '/investigation',
  '/investigation/triage',
  '/investigation/cases',
  '/investigation/secure-report',
  '/auditee-portal',
  '/auditee',
  '/advisory',
  '/library/audit-programs',
  '/library/risk-library',
  '/library/procedures',
  '/vendor-portal',
  '/process-canvas',
  '/findings',
  '/talent',
  '/talent-os',
  '/pbc',
  '/risk-heatmap',
  '/risk-laboratory',
  '/audit-universe',
  '/planning/strategic',
  '/ccm',
  '/ccm/anomalies',
  '/probes',
  '/dev-map',
];

interface RouteAuditResult {
  path: string;
  status: 'linked' | 'orphan';
  category?: string;
}

interface OrphanModule {
  type: 'WIDGET' | 'FEATURE';
  name: string;
  path: string;
  status: string;
  reason?: string;
}

const ORPHANS: OrphanModule[] = [
  // WIDGETS (6 items - 8% of total)
  {
    type: 'WIDGET',
    name: 'AuditeePortalWidget',
    path: 'src/widgets/AuditeePortalWidget',
    status: 'DEPRECATED',
    reason: 'Superseded by auditee-portal feature'
  },
  {
    type: 'WIDGET',
    name: 'ExecutionGrid',
    path: 'src/widgets/ExecutionGrid',
    status: 'REPLACED',
    reason: 'Replaced by ExecutionConsolidatedPage'
  },
  {
    type: 'WIDGET',
    name: 'FindingHubWidget',
    path: 'src/widgets/FindingHubWidget',
    status: 'REPLACED',
    reason: 'Replaced by FindingCenterPage'
  },
  {
    type: 'WIDGET',
    name: 'MethodologySimulator',
    path: 'src/widgets/MethodologySimulator',
    status: 'ORPHAN',
    reason: 'Not imported in any page or widget'
  },
  {
    type: 'WIDGET',
    name: 'WorkpaperEditor',
    path: 'src/widgets/WorkpaperEditor',
    status: 'ORPHAN',
    reason: 'No longer used'
  },
  {
    type: 'WIDGET',
    name: 'risk-matrix-table',
    path: 'src/widgets/risk-matrix-table',
    status: 'SUPERSEDED',
    reason: 'Superseded by RKMLibrary widget'
  },

  // FEATURES (10 items - 16% of total)
  {
    type: 'FEATURE',
    name: 'ai-persona',
    path: 'src/features/ai-persona',
    status: 'POTENTIAL',
    reason: 'Not imported - may be planned future feature'
  },
  {
    type: 'FEATURE',
    name: 'evidence-manager',
    path: 'src/features/evidence-manager',
    status: 'POTENTIAL',
    reason: 'Not imported - may be planned future feature'
  },
  {
    type: 'FEATURE',
    name: 'finding-creation',
    path: 'src/features/finding-creation',
    status: 'MERGED',
    reason: 'Functionality merged into finding-hub'
  },
  {
    type: 'FEATURE',
    name: 'independence',
    path: 'src/features/independence',
    status: 'POTENTIAL',
    reason: 'Not imported - may be planned future feature'
  },
  {
    type: 'FEATURE',
    name: 'integrations',
    path: 'src/features/integrations',
    status: 'PLANNED',
    reason: 'Not imported - appears to be planned feature'
  },
  {
    type: 'FEATURE',
    name: 'rkm-library',
    path: 'src/features/rkm-library',
    status: 'MERGED',
    reason: 'Functionality merged into main RKM module'
  },
  {
    type: 'FEATURE',
    name: 'settings',
    path: 'src/features/settings',
    status: 'MERGED',
    reason: 'Merged into settings pages'
  },
  {
    type: 'FEATURE',
    name: 'workpaper-editor',
    path: 'src/features/workpaper-editor',
    status: 'MERGED',
    reason: 'Merged into workpaper-drawer'
  },
  {
    type: 'FEATURE',
    name: 'workpaper-list',
    path: 'src/features/workpaper-list',
    status: 'MERGED',
    reason: 'Merged into execution pages'
  },
  {
    type: 'FEATURE',
    name: 'workpaper-wizard',
    path: 'src/features/workpaper-wizard',
    status: 'POTENTIAL',
    reason: 'Not imported - may be planned future feature'
  },
];

type TabId = 'routes' | 'orphans';

export default function SiteMapPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>('routes');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'linked' | 'orphan'>('all');
  const [orphanFilter, setOrphanFilter] = useState<'all' | 'WIDGET' | 'FEATURE'>('all');

  const linkedPaths = getAllNavigationPaths();

  const auditResults = useMemo<RouteAuditResult[]>(() => {
    return ALL_ROUTES.map((path) => {
      const isLinked = linkedPaths.includes(path);
      const category = path.split('/')[1] || 'root';

      return {
        path,
        status: isLinked ? 'linked' : 'orphan',
        category,
      };
    }).sort((a, b) => {
      if (a.status !== b.status) {
        return a.status === 'orphan' ? -1 : 1;
      }
      return a.path.localeCompare(b.path);
    });
  }, [linkedPaths]);

  const filteredResults = useMemo(() => {
    return auditResults.filter((result) => {
      const matchesSearch = result.path.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter =
        filterStatus === 'all' || result.status === filterStatus;
      return matchesSearch && matchesFilter;
    });
  }, [auditResults, searchTerm, filterStatus]);

  const stats = useMemo(() => {
    const totalPages = auditResults.length;
    const linkedPages = auditResults.filter((r) => r.status === 'linked').length;
    const orphanPages = auditResults.filter((r) => r.status === 'orphan').length;
    const coveragePercent = ((linkedPages / totalPages) * 100).toFixed(1);

    return {
      totalPages,
      linkedPages,
      orphanPages,
      coveragePercent,
    };
  }, [auditResults]);

  const filteredOrphans = useMemo(() => {
    return ORPHANS.filter((orphan) => {
      const matchesSearch = orphan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           orphan.path.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = orphanFilter === 'all' || orphan.type === orphanFilter;
      return matchesSearch && matchesType;
    });
  }, [searchTerm, orphanFilter]);

  const orphanStats = useMemo(() => {
    const widgets = ORPHANS.filter(o => o.type === 'WIDGET').length;
    const features = ORPHANS.filter(o => o.type === 'FEATURE').length;
    return { total: ORPHANS.length, widgets, features };
  }, []);

  const handleVisitPage = (path: string) => {
    navigate(path);
  };

  const handleInspectModule = async (orphan: OrphanModule) => {
    try {
      await navigator.clipboard.writeText(orphan.path);
      alert(`✓ Dosya yolu kopyalandı:\n\n${orphan.path}\n\nBu dosyayı IDE'nizde açabilirsiniz.`);
    } catch (err) {
      alert(`Dosya yolu:\n\n${orphan.path}\n\nManuel olarak kopyalayın.`);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <Map className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Geliştirici Haritası</h1>
              <p className="text-sm text-slate-600 mt-1">
                Site Map Audit - Navigation Coverage Analysis
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="text-xs font-semibold text-slate-600 mb-1">Total Pages</div>
          <div className="text-3xl font-bold text-slate-900">{stats.totalPages}</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-xs font-semibold text-green-700 mb-1">Linked in Menu</div>
          <div className="text-3xl font-bold text-green-700">{stats.linkedPages}</div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-xs font-semibold text-red-700 mb-1">Orphans (Missing)</div>
          <div className="text-3xl font-bold text-red-700">{stats.orphanPages}</div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-xs font-semibold text-blue-700 mb-1">Coverage</div>
          <div className="text-3xl font-bold text-blue-700">{stats.coveragePercent}%</div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-purple-600 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-slate-900">Safety Net: Orphan Detection</h3>
            <p className="text-xs text-slate-700 mt-1">
              This page compares all routes defined in <code className="bg-white px-1 py-0.5 rounded text-[10px]">App.tsx</code> with the{' '}
              <code className="bg-white px-1 py-0.5 rounded text-[10px]">navigationConfig</code>. Red rows indicate
              pages that exist but are not linked in the sidebar menu.
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 bg-slate-100 rounded-lg p-1 w-fit">
        <button
          onClick={() => setActiveTab('routes')}
          className={clsx(
            'flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-md transition-all',
            activeTab === 'routes'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          )}
        >
          <Navigation size={16} />
          Sayfa Rotaları
        </button>
        <button
          onClick={() => setActiveTab('orphans')}
          className={clsx(
            'flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-md transition-all',
            activeTab === 'orphans'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          )}
        >
          <Package size={16} />
          Kayıp Parçalar
          <span className="ml-1 px-2 py-0.5 rounded-full bg-amber-500 text-white text-xs">
            {orphanStats.total}
          </span>
        </button>
      </div>

      {activeTab === 'routes' && (
        <div className="bg-white border border-slate-200 rounded-lg">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="font-bold text-slate-900">Route Audit Table</h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search routes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-2 border border-slate-200 rounded-lg p-1">
              <button
                onClick={() => setFilterStatus('all')}
                className={clsx(
                  'px-3 py-1 rounded text-xs font-medium transition-colors',
                  filterStatus === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                )}
              >
                All ({auditResults.length})
              </button>
              <button
                onClick={() => setFilterStatus('linked')}
                className={clsx(
                  'px-3 py-1 rounded text-xs font-medium transition-colors',
                  filterStatus === 'linked'
                    ? 'bg-green-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                )}
              >
                Linked ({stats.linkedPages})
              </button>
              <button
                onClick={() => setFilterStatus('orphan')}
                className={clsx(
                  'px-3 py-1 rounded text-xs font-medium transition-colors',
                  filterStatus === 'orphan'
                    ? 'bg-red-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                )}
              >
                Orphans ({stats.orphanPages})
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Status</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Page Path</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Category</th>
                <th className="px-4 py-3 text-center font-semibold text-slate-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredResults.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-slate-500">
                    No routes found matching criteria
                  </td>
                </tr>
              ) : (
                filteredResults.map((result) => (
                  <tr
                    key={result.path}
                    className={clsx(
                      'border-b border-slate-100',
                      result.status === 'orphan'
                        ? 'bg-red-50 hover:bg-red-100'
                        : 'hover:bg-slate-50'
                    )}
                  >
                    <td className="px-4 py-3">
                      {result.status === 'linked' ? (
                        <div className="flex items-center gap-2 text-green-700">
                          <CheckCircle2 className="w-4 h-4" />
                          <span className="font-medium text-xs">LINKED</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-red-700">
                          <AlertTriangle className="w-4 h-4" />
                          <span className="font-bold text-xs">ORPHAN</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <code className="font-mono text-xs text-slate-900 bg-slate-100 px-2 py-1 rounded">
                        {result.path}
                      </code>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                        {result.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleVisitPage(result.path)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                        GO
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between text-xs">
            <div className="text-slate-600">
              Showing {filteredResults.length} of {auditResults.length} routes
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-slate-500" />
                <span className="text-slate-600">Source: App.tsx routes + navigationConfig</span>
              </div>
            </div>
          </div>
        </div>
        </div>
      )}

      {activeTab === 'orphans' && (
        <>
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="text-xs font-semibold text-amber-700 mb-1">Toplam Kayıp</div>
              <div className="text-3xl font-bold text-amber-900">{orphanStats.total}</div>
              <div className="text-xs text-amber-600 mt-1">kullanılmayan modül</div>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="text-xs font-semibold text-orange-700 mb-1">Widgets</div>
              <div className="text-3xl font-bold text-orange-900">{orphanStats.widgets}</div>
              <div className="text-xs text-orange-600 mt-1">8% of total widgets</div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="text-xs font-semibold text-yellow-700 mb-1">Features</div>
              <div className="text-3xl font-bold text-yellow-900">{orphanStats.features}</div>
              <div className="text-xs text-yellow-600 mt-1">16% of total features</div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-xs font-semibold text-green-700 mb-1">Kod Sağlığı</div>
              <div className="text-3xl font-bold text-green-900">95%</div>
              <div className="text-xs text-green-600 mt-1">çok düşük atık oranı</div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center shrink-0">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-slate-900 mb-1">Kayıp Parçalar - Audit 2026-02-09</h3>
                <p className="text-xs text-slate-700 mb-2">
                  Bu sekme, codebase audit sonucunda tespit edilen <strong>kullanılmayan modülleri</strong> gösterir.
                  Bu modüller hiçbir sayfada import edilmiyor veya deprecated durumda.
                </p>
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    <span className="text-slate-600">DEPRECATED/REPLACED = Kesinlikle sil</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                    <span className="text-slate-600">POTENTIAL/PLANNED = İncelenecek</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    <span className="text-slate-600">MERGED = Arşivlenebilir</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="font-bold text-slate-900">Kayıp Modüller - Kullanılmayan Kod</h2>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div className="flex items-center gap-2 border border-slate-200 rounded-lg p-1">
                <button
                  onClick={() => setOrphanFilter('all')}
                  className={clsx(
                    'px-3 py-1 rounded text-xs font-medium transition-colors',
                    orphanFilter === 'all'
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  )}
                >
                  Tümü ({orphanStats.total})
                </button>
                <button
                  onClick={() => setOrphanFilter('WIDGET')}
                  className={clsx(
                    'px-3 py-1 rounded text-xs font-medium transition-colors',
                    orphanFilter === 'WIDGET'
                      ? 'bg-amber-600 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  )}
                >
                  Widgets ({orphanStats.widgets})
                </button>
                <button
                  onClick={() => setOrphanFilter('FEATURE')}
                  className={clsx(
                    'px-3 py-1 rounded text-xs font-medium transition-colors',
                    orphanFilter === 'FEATURE'
                      ? 'bg-orange-600 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  )}
                >
                  Features ({orphanStats.features})
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-amber-50 border-b border-amber-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Tür</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Modül Adı</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Dosya Yolu</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Durum</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Sebep</th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-700">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrphans.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                      Arama kriterlerine uygun modül bulunamadı
                    </td>
                  </tr>
                ) : (
                  filteredOrphans.map((orphan, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-slate-100 bg-amber-50/30 hover:bg-amber-50"
                    >
                      <td className="px-4 py-3">
                        <span
                          className={clsx(
                            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold',
                            orphan.type === 'WIDGET'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-orange-100 text-orange-800'
                          )}
                        >
                          <Package className="w-3 h-3" />
                          {orphan.type}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-mono text-xs font-semibold text-slate-900">
                          {orphan.name}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <code className="font-mono text-[11px] text-slate-600 bg-slate-100 px-2 py-1 rounded">
                          {orphan.path}
                        </code>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={clsx(
                            'px-2 py-1 text-xs font-medium rounded',
                            orphan.status === 'DEPRECATED' && 'bg-red-100 text-red-700',
                            orphan.status === 'REPLACED' && 'bg-blue-100 text-blue-700',
                            orphan.status === 'ORPHAN' && 'bg-gray-100 text-gray-700',
                            orphan.status === 'SUPERSEDED' && 'bg-purple-100 text-purple-700',
                            orphan.status === 'MERGED' && 'bg-green-100 text-green-700',
                            orphan.status === 'POTENTIAL' && 'bg-yellow-100 text-yellow-700',
                            orphan.status === 'PLANNED' && 'bg-cyan-100 text-cyan-700'
                          )}
                        >
                          {orphan.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs text-slate-600 max-w-md">
                          {orphan.reason}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleInspectModule(orphan)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-600 text-white text-xs font-medium rounded-lg hover:bg-slate-700 transition-colors"
                          title="Dosya yolunu kopyala"
                        >
                          <Eye className="w-3 h-3" />
                          İncele
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-slate-200 bg-amber-50">
            <div className="flex items-center justify-between text-xs">
              <div className="text-slate-600">
                Gösterilen: {filteredOrphans.length} / {orphanStats.total} kayıp modül
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span className="text-slate-600 font-medium">
                  Bu modüller hiçbir sayfada kullanılmıyor
                </span>
              </div>
            </div>
          </div>
        </div>
        </>
      )}

      {activeTab === 'routes' && stats.orphanPages > 0 && (
        <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-red-900 mb-2">
                Action Required: {stats.orphanPages} Orphaned Pages Detected
              </h3>
              <p className="text-sm text-red-800 mb-3">
                The following pages exist in the router but are not linked in the navigation menu.
                Users cannot access these pages without knowing the direct URL.
              </p>
              <div className="bg-white rounded-lg p-4 border border-red-200">
                <div className="font-bold text-xs text-red-900 mb-2">
                  Orphaned Routes:
                </div>
                <div className="flex flex-wrap gap-2">
                  {auditResults
                    .filter((r) => r.status === 'orphan')
                    .map((result) => (
                      <code
                        key={result.path}
                        className="px-2 py-1 bg-red-100 text-red-700 text-[10px] rounded font-mono"
                      >
                        {result.path}
                      </code>
                    ))}
                </div>
              </div>
              <div className="mt-3 text-xs text-red-800">
                <strong>Fix:</strong> Add missing routes to{' '}
                <code className="bg-white px-1 py-0.5 rounded font-mono">
                  src/shared/config/navigation.ts
                </code>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
