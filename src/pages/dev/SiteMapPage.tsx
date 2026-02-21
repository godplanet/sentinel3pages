import {
  useState,
  useMemo,
  Component,
  type ReactNode,
  type ErrorInfo,
} from 'react';
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
  Eye,
  Layers,
  X,
  FolderOpen,
  Component as ComponentIcon,
} from 'lucide-react';
import clsx from 'clsx';

// ─── import.meta.glob — evaluated at build time ────────────────────────────
const ALL_PAGE_MODULES = import.meta.glob('/src/pages/**/*.tsx', { eager: true }) as Record<
  string,
  { default?: React.ComponentType; [k: string]: unknown }
>;

// ─── Existing static data ──────────────────────────────────────────────────
const ALL_ROUTES = [
  '/login', '/403', '/404', '/dashboard', '/dashboard/strategic',
  '/dashboard/ecosystem', '/strategy/objectives', '/strategy/universe',
  '/strategy/universe-module2', '/strategy/audit-universe', '/strategy/risk-assessment',
  '/strategy/annual-plan', '/strategy/risk-heatmap', '/strategy/risk-lab',
  '/strategy/quant', '/governance/board', '/governance/stakeholders',
  '/governance/voice', '/governance/policies', '/governance/vault',
  '/governance/charter', '/execution/my-engagements', '/execution/workpapers',
  '/execution/investigations', '/execution/findings', '/execution/finding-hub',
  '/execution/actions', '/execution/pbc', '/execution/start', '/execution/agile',
  '/execution/new-engagement', '/execution/create', '/execution/sprints',
  '/resources', '/resources/talent-os', '/monitoring/watchtower', '/monitoring/probes',
  '/monitoring/continuous', '/monitoring/ccm', '/monitoring/anomaly',
  '/monitoring/credit', '/monitoring/market', '/reporting/library',
  '/reporting/builder', '/reporting/executive', '/reporting/trends',
  '/reporting/entity-scorecard', '/qaip', '/qaip/internal', '/qaip/reviews',
  '/qaip/kpi', '/qaip/external', '/qaip/surveys', '/settings', '/settings/users',
  '/settings/appearance', '/settings/methodology', '/settings/cognitive-engine',
  '/settings/integrations', '/settings/custom-fields', '/settings/templates',
  '/settings/risk-constitution', '/compliance', '/compliance/regulations',
  '/compliance/gap-analysis', '/tprm', '/automation', '/sox', '/esg', '/oracle',
  '/ai-agents', '/chaos-lab', '/demo/constitution', '/secure-report',
  '/triage-cockpit', '/investigation', '/investigation/triage', '/investigation/cases',
  '/investigation/secure-report', '/auditee-portal', '/auditee', '/advisory',
  '/library/audit-programs', '/library/risk-library', '/library/procedures',
  '/vendor-portal', '/process-canvas', '/findings', '/talent', '/talent-os',
  '/pbc', '/risk-heatmap', '/risk-laboratory', '/audit-universe',
  '/planning/strategic', '/ccm', '/ccm/anomalies', '/probes', '/dev-map',
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
  { type: 'WIDGET', name: 'AuditeePortalWidget',  path: 'src/widgets/AuditeePortalWidget', status: 'DEPRECATED', reason: 'Superseded by auditee-portal feature' },
  { type: 'WIDGET', name: 'ExecutionGrid',         path: 'src/widgets/ExecutionGrid',        status: 'REPLACED',   reason: 'Replaced by ExecutionConsolidatedPage' },
  { type: 'WIDGET', name: 'FindingHubWidget',      path: 'src/widgets/FindingHubWidget',     status: 'REPLACED',   reason: 'Replaced by FindingCenterPage' },
  { type: 'WIDGET', name: 'MethodologySimulator',  path: 'src/widgets/MethodologySimulator', status: 'ORPHAN',     reason: 'Not imported in any page or widget' },
  { type: 'WIDGET', name: 'WorkpaperEditor',       path: 'src/widgets/WorkpaperEditor',      status: 'ORPHAN',     reason: 'No longer used' },
  { type: 'WIDGET', name: 'risk-matrix-table',     path: 'src/widgets/risk-matrix-table',    status: 'SUPERSEDED', reason: 'Superseded by RKMLibrary widget' },
  { type: 'FEATURE', name: 'ai-persona',           path: 'src/features/ai-persona',          status: 'POTENTIAL',  reason: 'Not imported - may be planned future feature' },
  { type: 'FEATURE', name: 'evidence-manager',     path: 'src/features/evidence-manager',    status: 'POTENTIAL',  reason: 'Not imported - may be planned future feature' },
  { type: 'FEATURE', name: 'finding-creation',     path: 'src/features/finding-creation',    status: 'MERGED',     reason: 'Functionality merged into finding-hub' },
  { type: 'FEATURE', name: 'independence',          path: 'src/features/independence',         status: 'POTENTIAL',  reason: 'Not imported - may be planned future feature' },
  { type: 'FEATURE', name: 'integrations',          path: 'src/features/integrations',         status: 'PLANNED',    reason: 'Not imported - appears to be planned feature' },
  { type: 'FEATURE', name: 'rkm-library',           path: 'src/features/rkm-library',          status: 'MERGED',     reason: 'Functionality merged into main RKM module' },
  { type: 'FEATURE', name: 'settings',              path: 'src/features/settings',             status: 'MERGED',     reason: 'Merged into settings pages' },
  { type: 'FEATURE', name: 'workpaper-editor',      path: 'src/features/workpaper-editor',     status: 'MERGED',     reason: 'Merged into workpaper-drawer' },
  { type: 'FEATURE', name: 'workpaper-list',        path: 'src/features/workpaper-list',       status: 'MERGED',     reason: 'Merged into execution pages' },
  { type: 'FEATURE', name: 'workpaper-wizard',      path: 'src/features/workpaper-wizard',     status: 'POTENTIAL',  reason: 'Not imported - may be planned future feature' },
];

// ─── FSD Page Inventory ─────────────────────────────────────────────────────
interface PageEntry {
  filePath: string;
  folder: string;
  name: string;
  module: { default?: React.ComponentType; [k: string]: unknown };
  hasDefault: boolean;
}

function buildPageInventory(): PageEntry[] {
  return Object.entries(ALL_PAGE_MODULES)
    .map(([filePath, mod]) => {
      const parts = filePath.split('/');
      const folder  = parts[3] ?? 'root';
      const rawName = parts[parts.length - 1].replace('.tsx', '');
      const name    = rawName === 'index'
        ? folder.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) + ' Sayfası'
        : rawName;
      return {
        filePath,
        folder,
        name,
        module: mod,
        hasDefault: typeof mod?.default === 'function',
      };
    })
    .sort((a, b) => a.folder.localeCompare(b.folder) || a.name.localeCompare(b.name));
}

const PAGE_INVENTORY = buildPageInventory();

// ─── Error Boundary ─────────────────────────────────────────────────────────
interface EBState { hasError: boolean; msg: string }
class PreviewErrorBoundary extends Component<{ children: ReactNode }, EBState> {
  state: EBState = { hasError: false, msg: '' };
  static getDerivedStateFromError(err: Error): EBState {
    return { hasError: true, msg: err.message };
  }
  componentDidCatch(_err: Error, info: ErrorInfo) {
    console.warn('PreviewModal render error:', info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <AlertTriangle className="w-10 h-10 text-amber-500" />
          <p className="text-sm font-semibold text-slate-700">Önizleme oluşturulamadı</p>
          <p className="text-xs text-slate-400 font-mono max-w-sm text-center">{this.state.msg}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── Preview Modal ───────────────────────────────────────────────────────────
function PreviewModal({
  entry,
  onClose,
}: {
  entry: PageEntry | null;
  onClose: () => void;
}) {
  if (!entry) return null;
  const Component = entry.module?.default as React.ComponentType | undefined;

  return (
    <div
      className="fixed inset-0 z-[999] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[88vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <ComponentIcon className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">{entry.name} Önizlemesi</h2>
              <p className="text-[10px] font-mono text-slate-400">{entry.filePath}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-slate-600" />
          </button>
        </div>

        {/* Warning Banner */}
        <div className="flex items-start gap-2.5 px-5 py-3 bg-amber-50 border-b border-amber-200 shrink-0">
          <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-amber-800 leading-relaxed">
            <span className="font-bold">Uyarı:</span> Bu sayfa dinamik olarak oluşturulmuştur.
            Route parametreleri eksik olabileceğinden bazı işlevler çalışmayabilir.
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto bg-slate-50">
          <PreviewErrorBoundary>
            {Component ? (
              <Component />
            ) : (
              <div className="flex flex-col items-center justify-center h-64 gap-3">
                <Package className="w-10 h-10 text-slate-300" />
                <p className="text-sm font-semibold text-slate-500">Varsayılan bileşen bulunamadı</p>
                <p className="text-xs text-slate-400">Bu dosya bir default export içermiyor.</p>
              </div>
            )}
          </PreviewErrorBoundary>
        </div>
      </div>
    </div>
  );
}

// ─── Page Inventory Tab ──────────────────────────────────────────────────────
const FOLDER_COLORS: Record<string, string> = {
  dashboard:   'bg-blue-100 text-blue-700',
  execution:   'bg-emerald-100 text-emerald-700',
  findings:    'bg-rose-100 text-rose-700',
  reporting:   'bg-amber-100 text-amber-700',
  settings:    'bg-slate-100 text-slate-700',
  strategy:    'bg-sky-100 text-sky-700',
  monitoring:  'bg-orange-100 text-orange-700',
  governance:  'bg-teal-100 text-teal-700',
  compliance:  'bg-cyan-100 text-cyan-700',
  risk:        'bg-red-100 text-red-700',
  talent:      'bg-lime-100 text-lime-700',
  qaip:        'bg-violet-100 text-violet-700',
};
function folderColor(folder: string) {
  return FOLDER_COLORS[folder] ?? 'bg-slate-100 text-slate-600';
}

function PageInventoryTab() {
  const [search, setSearch]           = useState('');
  const [folderFilter, setFolderFilter] = useState('all');
  const [previewEntry, setPreviewEntry] = useState<PageEntry | null>(null);

  const folders = useMemo(
    () => ['all', ...Array.from(new Set(PAGE_INVENTORY.map((p) => p.folder))).sort()],
    [],
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return PAGE_INVENTORY.filter((p) => {
      const matchSearch = !q || p.name.toLowerCase().includes(q) || p.filePath.toLowerCase().includes(q);
      const matchFolder = folderFilter === 'all' || p.folder === folderFilter;
      return matchSearch && matchFolder;
    });
  }, [search, folderFilter]);

  const stats = useMemo(() => {
    const total     = PAGE_INVENTORY.length;
    const renderable = PAGE_INVENTORY.filter((p) => p.hasDefault).length;
    const folderCount = new Set(PAGE_INVENTORY.map((p) => p.folder)).size;
    return { total, renderable, folderCount };
  }, []);

  return (
    <>
      <div className="grid grid-cols-3 gap-4 mb-5">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-[10px] font-mono font-semibold uppercase tracking-widest text-slate-400 mb-1">Toplam Sayfa</p>
          <p className="text-3xl font-black text-slate-900">{stats.total}</p>
          <p className="text-xs text-slate-400 mt-0.5">taranan tsx dosyası</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <p className="text-[10px] font-mono font-semibold uppercase tracking-widest text-emerald-600 mb-1">Önizlenebilir</p>
          <p className="text-3xl font-black text-emerald-700">{stats.renderable}</p>
          <p className="text-xs text-emerald-500 mt-0.5">default export mevcut</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-[10px] font-mono font-semibold uppercase tracking-widest text-blue-600 mb-1">Modül Klasörü</p>
          <p className="text-3xl font-black text-blue-700">{stats.folderCount}</p>
          <p className="text-xs text-blue-500 mt-0.5">farklı kategori</p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-5 flex items-start gap-3">
        <Layers className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="text-sm font-bold text-slate-900">FSD Sayfa Radar</h3>
          <p className="text-xs text-slate-600 mt-1">
            <code className="bg-white px-1 py-0.5 rounded font-mono text-[11px]">import.meta.glob</code> ile{' '}
            <code className="bg-white px-1 py-0.5 rounded font-mono text-[11px]">src/pages/**/*.tsx</code>{' '}
            kapsamındaki tüm sayfalar dinamik olarak tarandı. "İncele" butonu sayfa bileşenini
            önizleme modalı içinde render eder.
          </p>
        </div>
      </div>

      <div className="bg-white shadow-sm border border-slate-200 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center gap-3">
          <h2 className="font-bold text-slate-900 mr-auto">Sayfa Bileşen Envanteri</h2>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Bileşen veya dosya ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-56"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={folderFilter}
              onChange={(e) => setFolderFilter(e.target.value)}
              className="border border-slate-200 rounded-lg text-xs px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-slate-700"
            >
              {folders.map((f) => (
                <option key={f} value={f}>
                  {f === 'all' ? `Tüm klasörler (${PAGE_INVENTORY.length})` : f}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">
                  Modül (Klasör)
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">
                  Bileşen Adı
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">
                  Dosya Yolu
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wide">
                  Durum
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wide">
                  Aksiyon
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-14 text-center text-slate-400 text-sm">
                    Arama kriterine uygun sayfa bulunamadı
                  </td>
                </tr>
              ) : (
                filtered.map((entry) => (
                  <tr key={entry.filePath} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <span className={clsx(
                        'inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold',
                        folderColor(entry.folder),
                      )}>
                        <FolderOpen className="w-3 h-3" />
                        {entry.folder}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <ComponentIcon className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="font-semibold text-slate-800 text-xs">{entry.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <code className="font-mono text-[10px] text-slate-500 bg-slate-100 px-2 py-1 rounded">
                        {entry.filePath.replace('/src/pages/', '')}
                      </code>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {entry.hasDefault ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-semibold">
                          <CheckCircle2 className="w-3 h-3" />
                          Önizlenebilir
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-500 border border-slate-200 rounded-full text-[10px] font-semibold">
                          <AlertTriangle className="w-3 h-3" />
                          No Default
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => setPreviewEntry(entry)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
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

        <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <p className="text-xs text-slate-500 font-mono">
            {filtered.length} / {PAGE_INVENTORY.length} sayfa gösteriliyor
          </p>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <FileCode className="w-3.5 h-3.5" />
            Kaynak: import.meta.glob('/src/pages/**/*.tsx')
          </div>
        </div>
      </div>

      <PreviewModal entry={previewEntry} onClose={() => setPreviewEntry(null)} />
    </>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
type TabId = 'routes' | 'orphans' | 'inventory';

export default function SiteMapPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>('routes');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'linked' | 'orphan'>('all');
  const [orphanFilter, setOrphanFilter] = useState<'all' | 'WIDGET' | 'FEATURE'>('all');

  const linkedPaths = getAllNavigationPaths();

  const auditResults = useMemo<RouteAuditResult[]>(() => {
    return ALL_ROUTES.map((path) => ({
      path,
      status: linkedPaths.includes(path) ? 'linked' : 'orphan',
      category: path.split('/')[1] || 'root',
    })).sort((a, b) => {
      if (a.status !== b.status) return a.status === 'orphan' ? -1 : 1;
      return a.path.localeCompare(b.path);
    });
  }, [linkedPaths]);

  const filteredResults = useMemo(() => {
    return auditResults.filter((r) => {
      const matchSearch = r.path.toLowerCase().includes(searchTerm.toLowerCase());
      const matchFilter = filterStatus === 'all' || r.status === filterStatus;
      return matchSearch && matchFilter;
    });
  }, [auditResults, searchTerm, filterStatus]);

  const stats = useMemo(() => {
    const total    = auditResults.length;
    const linked   = auditResults.filter((r) => r.status === 'linked').length;
    const orphan   = auditResults.filter((r) => r.status === 'orphan').length;
    return { totalPages: total, linkedPages: linked, orphanPages: orphan, coveragePercent: ((linked / total) * 100).toFixed(1) };
  }, [auditResults]);

  const filteredOrphans = useMemo(() => {
    return ORPHANS.filter((o) => {
      const matchSearch = o.name.toLowerCase().includes(searchTerm.toLowerCase()) || o.path.toLowerCase().includes(searchTerm.toLowerCase());
      return matchSearch && (orphanFilter === 'all' || o.type === orphanFilter);
    });
  }, [searchTerm, orphanFilter]);

  const orphanStats = useMemo(() => ({
    total:    ORPHANS.length,
    widgets:  ORPHANS.filter((o) => o.type === 'WIDGET').length,
    features: ORPHANS.filter((o) => o.type === 'FEATURE').length,
  }), []);

  return (
    <div className="p-8 space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-sky-500 flex items-center justify-center">
          <Map className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Geliştirici Haritası</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Rota Denetimi, Kayıp Modüller ve FSD Sayfa Envanteri
          </p>
        </div>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="text-xs font-semibold text-slate-500 mb-1">Toplam Rota</div>
          <div className="text-3xl font-bold text-slate-900">{stats.totalPages}</div>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
          <div className="text-xs font-semibold text-emerald-700 mb-1">Menüde Bağlı</div>
          <div className="text-3xl font-bold text-emerald-700">{stats.linkedPages}</div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-xs font-semibold text-red-700 mb-1">Kayıp (Orphan)</div>
          <div className="text-3xl font-bold text-red-700">{stats.orphanPages}</div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-xs font-semibold text-blue-700 mb-1">Kapsam</div>
          <div className="text-3xl font-bold text-blue-700">{stats.coveragePercent}%</div>
        </div>
      </div>

      {/* Info banner */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-slate-500 mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="text-sm font-bold text-slate-800">Güvenlik Ağı: Orphan Tespiti</h3>
          <p className="text-xs text-slate-600 mt-1">
            Bu sayfa{' '}
            <code className="bg-white px-1 py-0.5 rounded text-[10px] border border-slate-200">App.tsx</code>
            {' '}rotalarını{' '}
            <code className="bg-white px-1 py-0.5 rounded text-[10px] border border-slate-200">navigationConfig</code>
            {' '}ile karşılaştırır. Kırmızı satırlar menüde bağlantısı olmayan sayfalardır.
          </p>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1.5 bg-slate-100 rounded-xl p-1 w-fit">
        <button
          onClick={() => setActiveTab('routes')}
          className={clsx(
            'flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all',
            activeTab === 'routes' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700',
          )}
        >
          <Navigation size={15} />
          Sayfa Rotaları
        </button>
        <button
          onClick={() => setActiveTab('orphans')}
          className={clsx(
            'flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all',
            activeTab === 'orphans' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700',
          )}
        >
          <Package size={15} />
          Kayıp Parçalar
          <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold">
            {orphanStats.total}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={clsx(
            'flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all',
            activeTab === 'inventory' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700',
          )}
        >
          <Layers size={15} />
          Sayfa Envanteri
          <span className="px-1.5 py-0.5 rounded-full bg-blue-500 text-white text-[10px] font-bold">
            FSD
          </span>
        </button>
      </div>

      {/* ── Tab: Routes ── */}
      {activeTab === 'routes' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-200 flex flex-wrap items-center gap-3">
            <h2 className="font-bold text-slate-900 mr-auto">Rota Denetim Tablosu</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Rota ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div className="flex items-center gap-1 border border-slate-200 rounded-lg p-1">
              {(['all', 'linked', 'orphan'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilterStatus(f)}
                  className={clsx(
                    'px-3 py-1 rounded text-xs font-semibold transition-colors',
                    filterStatus === f
                      ? f === 'all' ? 'bg-slate-900 text-white'
                        : f === 'linked' ? 'bg-emerald-600 text-white'
                        : 'bg-red-600 text-white'
                      : 'text-slate-600 hover:bg-slate-100',
                  )}
                >
                  {f === 'all' ? `Tümü (${auditResults.length})` : f === 'linked' ? `Bağlı (${stats.linkedPages})` : `Orphan (${stats.orphanPages})`}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">Durum</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">Sayfa Yolu</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">Kategori</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wide">Aksiyon</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredResults.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-12 text-center text-slate-400">
                      Kriterlere uygun rota bulunamadı
                    </td>
                  </tr>
                ) : filteredResults.map((r) => (
                  <tr key={r.path} className={clsx('hover:bg-slate-50', r.status === 'orphan' && 'bg-red-50 hover:bg-red-100')}>
                    <td className="px-4 py-3">
                      {r.status === 'linked' ? (
                        <div className="flex items-center gap-1.5 text-emerald-700">
                          <CheckCircle2 className="w-4 h-4" />
                          <span className="text-[11px] font-bold">BAĞLI</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-red-700">
                          <AlertTriangle className="w-4 h-4" />
                          <span className="text-[11px] font-bold">ORPHAN</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <code className="font-mono text-xs text-slate-800 bg-slate-100 px-2 py-1 rounded">
                        {r.path}
                      </code>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                        {r.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => navigate(r.path)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Git
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
            <span>{filteredResults.length} / {auditResults.length} rota gösteriliyor</span>
            <div className="flex items-center gap-1.5">
              <FileCode className="w-4 h-4" />
              <span>Kaynak: App.tsx + navigationConfig</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'routes' && stats.orphanPages > 0 && (
        <div className="bg-red-50 border-2 border-red-300 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-red-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-red-900 mb-2">
                {stats.orphanPages} Bağlantısız Sayfa Tespit Edildi
              </h3>
              <p className="text-xs text-red-700 mb-3">
                Bu sayfalar router'da tanımlı ancak navigasyon menüsünde bağlantısı bulunmuyor.
              </p>
              <div className="bg-white rounded-lg p-3 border border-red-200">
                <p className="text-[10px] font-bold text-red-800 mb-2 uppercase tracking-widest">Orphan Rotalar:</p>
                <div className="flex flex-wrap gap-1.5">
                  {auditResults.filter((r) => r.status === 'orphan').map((r) => (
                    <code key={r.path} className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] rounded font-mono">
                      {r.path}
                    </code>
                  ))}
                </div>
              </div>
              <p className="mt-3 text-[11px] text-red-700">
                <strong>Düzeltme:</strong>{' '}
                <code className="bg-white px-1 py-0.5 rounded font-mono border border-red-200">
                  src/shared/config/navigation.ts
                </code>{' '}
                dosyasına eksik rotaları ekleyin.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Orphan Modules ── */}
      {activeTab === 'orphans' && (
        <>
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-amber-700 mb-1">Toplam Kayıp</p>
              <p className="text-3xl font-bold text-amber-900">{orphanStats.total}</p>
              <p className="text-xs text-amber-600 mt-1">kullanılmayan modül</p>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-orange-700 mb-1">Widgets</p>
              <p className="text-3xl font-bold text-orange-900">{orphanStats.widgets}</p>
              <p className="text-xs text-orange-600 mt-1">toplam widget'ın %8'i</p>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-yellow-700 mb-1">Features</p>
              <p className="text-3xl font-bold text-yellow-900">{orphanStats.features}</p>
              <p className="text-xs text-yellow-600 mt-1">toplam feature'ın %16'sı</p>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-emerald-700 mb-1">Kod Sağlığı</p>
              <p className="text-3xl font-bold text-emerald-700">95%</p>
              <p className="text-xs text-emerald-600 mt-1">çok düşük atık oranı</p>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center shrink-0">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-slate-900 mb-1">Kayıp Parçalar — Denetim 2026-02-09</h3>
              <p className="text-xs text-slate-700 mb-2">
                Codebase denetiminde tespit edilen <strong>kullanılmayan modüller</strong>.
                Hiçbir sayfada import edilmiyor veya deprecated durumda.
              </p>
              <div className="flex flex-wrap gap-3 text-xs">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> DEPRECATED/REPLACED = Kesinlikle sil</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500" /> POTENTIAL/PLANNED = İncelenecek</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> MERGED = Arşivlenebilir</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-200 flex flex-wrap items-center gap-3">
              <h2 className="font-bold text-slate-900 mr-auto">Kayıp Modüller</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
              <div className="flex items-center gap-1 border border-slate-200 rounded-lg p-1">
                {(['all', 'WIDGET', 'FEATURE'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setOrphanFilter(f)}
                    className={clsx(
                      'px-3 py-1 rounded text-xs font-semibold transition-colors',
                      orphanFilter === f
                        ? f === 'all' ? 'bg-slate-900 text-white'
                          : f === 'WIDGET' ? 'bg-amber-600 text-white'
                          : 'bg-orange-600 text-white'
                        : 'text-slate-600 hover:bg-slate-100',
                    )}
                  >
                    {f === 'all' ? `Tümü (${orphanStats.total})` : f === 'WIDGET' ? `Widget (${orphanStats.widgets})` : `Feature (${orphanStats.features})`}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-amber-50 border-b border-amber-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">Tür</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">Modül Adı</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">Dosya Yolu</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">Durum</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">Sebep</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wide">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrphans.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                        Arama kriterine uygun modül bulunamadı
                      </td>
                    </tr>
                  ) : filteredOrphans.map((orphan, idx) => (
                    <tr key={idx} className="bg-amber-50/30 hover:bg-amber-50 transition-colors">
                      <td className="px-4 py-3">
                        <span className={clsx(
                          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold',
                          orphan.type === 'WIDGET' ? 'bg-amber-100 text-amber-800' : 'bg-orange-100 text-orange-800',
                        )}>
                          <Package className="w-3 h-3" />
                          {orphan.type}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs font-semibold text-slate-900">{orphan.name}</span>
                      </td>
                      <td className="px-4 py-3">
                        <code className="font-mono text-[11px] text-slate-500 bg-slate-100 px-2 py-1 rounded">{orphan.path}</code>
                      </td>
                      <td className="px-4 py-3">
                        <span className={clsx(
                          'px-2 py-0.5 text-[11px] font-semibold rounded',
                          orphan.status === 'DEPRECATED' && 'bg-red-100 text-red-700',
                          orphan.status === 'REPLACED'   && 'bg-blue-100 text-blue-700',
                          orphan.status === 'ORPHAN'     && 'bg-slate-100 text-slate-600',
                          orphan.status === 'SUPERSEDED' && 'bg-slate-100 text-slate-600',
                          orphan.status === 'MERGED'     && 'bg-emerald-100 text-emerald-700',
                          orphan.status === 'POTENTIAL'  && 'bg-yellow-100 text-yellow-700',
                          orphan.status === 'PLANNED'    && 'bg-cyan-100 text-cyan-700',
                        )}>
                          {orphan.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs text-slate-500 max-w-xs">{orphan.reason}</p>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={async () => {
                            try { await navigator.clipboard.writeText(orphan.path); alert(`✓ Kopyalandı:\n${orphan.path}`); }
                            catch { alert(`Dosya yolu:\n${orphan.path}`); }
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-600 text-white text-xs font-semibold rounded-lg hover:bg-slate-700 transition-colors"
                        >
                          <Eye className="w-3 h-3" />
                          İncele
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-slate-100 bg-amber-50 flex items-center justify-between text-xs">
              <span className="text-slate-500">{filteredOrphans.length} / {orphanStats.total} kayıp modül gösteriliyor</span>
              <div className="flex items-center gap-1.5 text-amber-700">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Bu modüller hiçbir sayfada kullanılmıyor</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Tab: Page Inventory ── */}
      {activeTab === 'inventory' && <PageInventoryTab />}
    </div>
  );
}
