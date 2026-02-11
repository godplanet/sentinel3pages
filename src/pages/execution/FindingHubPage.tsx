import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileSearch, Plus, Filter, Shield, AlertTriangle, Eye, TrendingUp, LayoutGrid, List, Sparkles } from 'lucide-react';
import clsx from 'clsx';
import { PageHeader } from '@/shared/ui/PageHeader';
import { FindingDataGrid } from '@/widgets/tables/FindingDataGrid';
import { FindingKanbanBoard } from '@/features/finding-hub';
import { NewFindingModal } from '@/features/finding-form';
import { createFinding } from '@/entities/finding/api/mutations';
import type { ComprehensiveFinding, FindingState, FindingSeverity } from '@/entities/finding/model/types';
import { comprehensiveFindingApi } from '@/entities/finding/api/module5-api';

type RiskLevel = 'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
type StatusFilter = 'ALL' | FindingState;

const RISK_LEVEL_CONFIG: Record<Exclude<RiskLevel, 'ALL'>, { label: string; color: string; bgColor: string }> = {
  CRITICAL: { label: 'Kritik', color: 'text-red-700', bgColor: 'bg-red-100' },
  HIGH: { label: 'Yuksek', color: 'text-orange-700', bgColor: 'bg-orange-100' },
  MEDIUM: { label: 'Orta', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
  LOW: { label: 'Dusuk', color: 'text-blue-700', bgColor: 'bg-blue-100' },
};

const STATUS_OPTIONS: Array<{ value: StatusFilter; label: string }> = [
  { value: 'ALL', label: 'Tum Durumlar' },
  { value: 'DRAFT', label: 'Taslak' },
  { value: 'NEGOTIATION', label: 'Muzakere' },
  { value: 'PENDING_APPROVAL', label: 'Onay Bekliyor' },
  { value: 'CLOSED', label: 'Kapandi' },
  { value: 'FINAL', label: 'Sonuclandi' },
];


type ViewMode = 'list' | 'kanban';

export default function FindingHubPage() {
  const navigate = useNavigate();
  const [findings, setFindings] = useState<ComprehensiveFinding[]>([]);
  const [loading, setLoading] = useState(true);

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [filterRisk, setFilterRisk] = useState<RiskLevel>('ALL');
  const [filterStatus, setFilterStatus] = useState<StatusFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewFindingModal, setShowNewFindingModal] = useState(false);

  useEffect(() => {
    loadFindings();
  }, []);

  const loadFindings = async () => {
    try {
      setLoading(true);
      const data = await comprehensiveFindingApi.getAll();
      setFindings(data || []);
    } catch (error) {
      console.error('Failed to load findings:', error);
      setFindings([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredFindings = useMemo(() => {
    let filtered = [...findings];

    if (filterRisk !== 'ALL') {
      filtered = filtered.filter(f => f.severity === filterRisk);
    }

    if (filterStatus !== 'ALL') {
      filtered = filtered.filter(f => f.state === filterStatus);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        f =>
          f.title?.toLowerCase().includes(query) ||
          (f.details as any)?.code?.toLowerCase().includes(query) ||
          f.auditee_department?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [findings, filterRisk, filterStatus, searchQuery]);

  const stats = useMemo(() => {
    return {
      total: findings.length,
      critical: findings.filter(f => f.severity === 'CRITICAL').length,
      inNegotiation: findings.filter(f => f.state === 'NEGOTIATION').length,
      closed: findings.filter(f => f.state === 'CLOSED' || f.state === 'FINAL').length,
      avgRiskScore: findings.length > 0
        ? Math.round(findings.reduce((sum, f) => sum + (f.impact_score || 0), 0) / findings.length)
        : 0,
    };
  }, [findings]);

  const handleSaveNewFinding = async (findingData: any) => {
    try {
      await createFinding({
        title: findingData.title,
        severity: findingData.severity,
        code: findingData.code,
        gias_category: findingData.gias_category,
        auditee_department: findingData.auditee_department,
        impact_score: findingData.impact_score,
        likelihood_score: findingData.likelihood_score,
        financial_impact: findingData.financial_impact,
        detection: findingData.detection,
        impact: findingData.impact,
        root_cause: findingData.root_cause,
        recommendation: findingData.recommendation,
        why_1: findingData.why_1,
        why_2: findingData.why_2,
        why_3: findingData.why_3,
        why_4: findingData.why_4,
        why_5: findingData.why_5,
      });

      await loadFindings();
      setShowNewFindingModal(false);
    } catch (error) {
      console.error('Failed to create finding:', error);
    }
  };

  const handleRowClick = (finding: ComprehensiveFinding) => {
    navigate(`/execution/findings/${finding.id}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bulgu Merkezi & Muzakere"
        description="Dinamik risk boyutlari ile bulgu yonetimi - Anayasa tabanli"
        icon={FileSearch}
        action={
          <div className="flex items-center gap-3">
            <div className="flex bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
              <button
                onClick={() => setViewMode('list')}
                className={clsx(
                  'flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all',
                  viewMode === 'list'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                )}
              >
                <List size={16} />
                Liste
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={clsx(
                  'flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all',
                  viewMode === 'kanban'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                )}
              >
                <LayoutGrid size={16} />
                Kanban
              </button>
            </div>
            <button
              onClick={() => navigate('/execution/findings/zen/new')}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold text-sm"
            >
              <Sparkles size={16} />
              ZenEditor
            </button>
            <button
              onClick={() => setShowNewFindingModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-700 text-white rounded-lg hover:bg-slate-800 shadow-sm transition-all font-medium text-sm"
            >
              <Plus size={16} />
              Hızlı Ekle
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-5 gap-4">
        <StatCard
          label="Toplam Bulgu"
          value={stats.total}
          icon={FileSearch}
          color="blue"
        />
        <StatCard
          label="Kritik Risk"
          value={stats.critical}
          icon={AlertTriangle}
          color="red"
        />
        <StatCard
          label="Muzakerede"
          value={stats.inNegotiation}
          icon={Eye}
          color="amber"
        />
        <StatCard
          label="Kapatildi"
          value={stats.closed}
          icon={Shield}
          color="emerald"
        />
        <StatCard
          label="Ort. Risk Skoru"
          value={stats.avgRiskScore}
          icon={TrendingUp}
          color="slate"
        />
      </div>

      <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-slate-200 p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 text-slate-700">
            <Filter size={16} />
            <span className="text-sm font-medium">Filtreler:</span>
          </div>

          <input
            type="text"
            placeholder="Baslik, kod veya departman ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 min-w-[250px] px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          />

          <select
            value={filterRisk}
            onChange={(e) => setFilterRisk(e.target.value as RiskLevel)}
            className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          >
            <option value="ALL">Tum Risk Seviyeleri</option>
            {Object.entries(RISK_LEVEL_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>
                {config.label}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as StatusFilter)}
            className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          >
            {STATUS_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {(filterRisk !== 'ALL' || filterStatus !== 'ALL' || searchQuery) && (
            <button
              onClick={() => {
                setFilterRisk('ALL');
                setFilterStatus('ALL');
                setSearchQuery('');
              }}
              className="px-3 py-2 text-xs text-slate-600 hover:text-slate-900 font-medium bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Temizle
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-slate-200 p-12 text-center">
          <div className="animate-spin w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full mx-auto mb-3" />
          <span className="text-sm text-slate-600">Bulgular yukleniyor...</span>
        </div>
      ) : filteredFindings.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-slate-200 p-12 text-center">
          <FileSearch size={48} className="mx-auto mb-4 text-slate-300" />
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Henüz bulgu yok</h3>
          <p className="text-sm text-slate-600 mb-4">Yeni bulgu ekleyerek başlayın.</p>
          <button
            onClick={() => setShowNewFindingModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Yeni Bulgu Ekle
          </button>
        </div>
      ) : viewMode === 'list' ? (
        <FindingDataGrid findings={filteredFindings} onRowClick={handleRowClick} />
      ) : (
        <FindingKanbanBoard
          findings={filteredFindings}
          onFindingUpdate={(findingId, newState) => {
            console.log(`Finding ${findingId} moved to ${newState}`);
          }}
        />
      )}

      <NewFindingModal
        isOpen={showNewFindingModal}
        onClose={() => setShowNewFindingModal(false)}
        onSave={handleSaveNewFinding}
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: typeof Shield;
  color: 'blue' | 'red' | 'amber' | 'emerald' | 'slate';
}) {
  const colorMap = {
    blue: 'bg-blue-100 text-blue-700 border-blue-200',
    red: 'bg-red-100 text-red-700 border-red-200',
    amber: 'bg-amber-100 text-amber-700 border-amber-200',
    emerald: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  return (
    <div className={clsx('bg-white/80 backdrop-blur-xl rounded-xl border p-4', colorMap[color])}>
      <div className="flex items-center gap-3">
        <div className={clsx('w-10 h-10 rounded-lg flex items-center justify-center', colorMap[color])}>
          <Icon size={20} />
        </div>
        <div>
          <div className="text-2xl font-black">{value}</div>
          <div className="text-[10px] font-medium opacity-80">{label}</div>
        </div>
      </div>
    </div>
  );
}
