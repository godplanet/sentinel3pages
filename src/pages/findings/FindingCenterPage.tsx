import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/shared/ui';
import { comprehensiveFindingApi } from '@/entities/finding/api/module5-api';
import { NewFindingModal } from '@/features/finding-form';
import { createFinding } from '@/entities/finding/api/mutations';
import type { ComprehensiveFinding, FindingState, FindingSeverity } from '@/entities/finding/model/types';
import { FindingRightSidebar } from '@/widgets/FindingRightSidebar';
import {
  FileSearch,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Filter,
  Plus,
  Eye,
  MessageSquare,
  TrendingUp,
  Loader2,
  FileText,
  DollarSign,
  Send,
} from 'lucide-react';

const STATE_CONFIG: Record<FindingState, { label: string; color: string; bgColor: string; icon: any }> = {
  DRAFT: { label: 'Draft', color: 'text-slate-600', bgColor: 'bg-slate-100', icon: Clock },
  PUBLISHED: { label: 'Published', color: 'text-blue-600', bgColor: 'bg-blue-100', icon: Eye },
  NEGOTIATION: { label: 'In Negotiation', color: 'text-amber-600', bgColor: 'bg-amber-100', icon: MessageSquare },
  PENDING_APPROVAL: { label: 'Pending Approval', color: 'text-purple-600', bgColor: 'bg-purple-100', icon: Clock },
  FOLLOW_UP: { label: 'Follow-up', color: 'text-indigo-600', bgColor: 'bg-indigo-100', icon: TrendingUp },
  CLOSED: { label: 'Closed', color: 'text-emerald-600', bgColor: 'bg-emerald-100', icon: CheckCircle },
  FINAL: { label: 'Final', color: 'text-emerald-700', bgColor: 'bg-emerald-200', icon: CheckCircle },
  REMEDIATED: { label: 'Remediated', color: 'text-green-700', bgColor: 'bg-green-100', icon: CheckCircle },
  DISPUTED: { label: 'Disputed', color: 'text-red-600', bgColor: 'bg-red-100', icon: AlertTriangle },
  DISPUTING: { label: 'Disputing', color: 'text-red-500', bgColor: 'bg-red-50', icon: XCircle },
};

const SEVERITY_CONFIG: Record<string, { label: string; color: string; bgColor: string; borderColor: string }> = {
  CRITICAL: { label: 'Critical', color: 'text-red-700', bgColor: 'bg-red-100', borderColor: 'border-red-300' },
  HIGH: { label: 'High', color: 'text-orange-700', bgColor: 'bg-orange-100', borderColor: 'border-orange-300' },
  MEDIUM: { label: 'Medium', color: 'text-yellow-700', bgColor: 'bg-yellow-100', borderColor: 'border-yellow-300' },
  LOW: { label: 'Low', color: 'text-blue-700', bgColor: 'bg-blue-100', borderColor: 'border-blue-300' },
  OBSERVATION: { label: 'Observation', color: 'text-slate-600', bgColor: 'bg-slate-100', borderColor: 'border-slate-300' },
};

export default function FindingCenterPage() {
  const navigate = useNavigate();
  const [findings, setFindings] = useState<ComprehensiveFinding[]>([]);
  const [filteredFindings, setFilteredFindings] = useState<ComprehensiveFinding[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterState, setFilterState] = useState<FindingState | 'ALL'>('ALL');
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewFindingModal, setShowNewFindingModal] = useState(false);
  const [selectedFinding, setSelectedFinding] = useState<ComprehensiveFinding | null>(null);

  useEffect(() => {
    loadFindings();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [findings, filterState, filterSeverity, searchQuery]);

  const loadFindings = async () => {
    try {
      setLoading(true);
      const data = await comprehensiveFindingApi.getAll();
      setFindings(data);
    } catch (error) {
      console.error('Failed to load findings:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...findings];

    if (filterState !== 'ALL') {
      filtered = filtered.filter((f) => f.state === filterState);
    }

    if (filterSeverity !== 'ALL') {
      filtered = filtered.filter((f) => f.severity === filterSeverity);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (f) =>
          f.title?.toLowerCase().includes(query) ||
          f.code?.toLowerCase().includes(query) ||
          f.finding_code?.toLowerCase().includes(query)
      );
    }

    setFilteredFindings(filtered);
  };

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

  const stats = useMemo(() => {
    return {
      total: findings.length,
      critical: findings.filter((f) => f.severity === 'CRITICAL' || f.severity === 'HIGH').length,
      inNegotiation: findings.filter((f) => f.state === 'NEGOTIATION').length,
      closed: findings.filter((f) => f.state === 'CLOSED' || f.state === 'FINAL').length,
      financialImpact: findings.reduce((sum, f) => sum + (f.financial_impact || 0), 0),
    };
  }, [findings]);

  const stateCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    findings.forEach((f) => {
      counts[f.state] = (counts[f.state] || 0) + 1;
    });
    return counts;
  }, [findings]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <PageHeader
        title="Bulgu Merkezi"
        subtitle="Comprehensive finding management and tracking center"
        icon={FileSearch}
        actions={
          <button
            onClick={() => setShowNewFindingModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transition-all font-medium"
          >
            <Plus size={18} />
            <span>Yeni Bulgu Ekle</span>
          </button>
        }
      />

      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-5 gap-4">
          <div className="bg-white/80 backdrop-blur-xl rounded-lg border border-slate-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-bold text-slate-900">{stats.total}</div>
              <div className="text-sm text-slate-600 font-medium">Toplam Bulgu</div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-lg border border-red-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-bold text-red-900">{stats.critical}</div>
              <div className="text-sm text-red-700 font-medium">Kritik/Yüksek Risk</div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-lg border border-amber-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-amber-600" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-bold text-amber-900">{stats.inNegotiation}</div>
              <div className="text-sm text-amber-700 font-medium">Müzakarede</div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-lg border border-emerald-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-bold text-emerald-900">{stats.closed}</div>
              <div className="text-sm text-emerald-700 font-medium">Kapanmış</div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-lg border border-green-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-bold text-green-900">
                ₺{(stats.financialImpact / 1000000).toFixed(1)}M
              </div>
              <div className="text-sm text-green-700 font-medium">Mali Etki</div>
            </div>
          </div>
        </div>

        {/* Quick Filters by State */}
        <div className="grid grid-cols-5 gap-4">
          {Object.entries(STATE_CONFIG).slice(0, 5).map(([state, config]) => {
            const Icon = config.icon;
            const count = stateCounts[state] || 0;

            return (
              <button
                key={state}
                onClick={() => setFilterState(state as FindingState)}
                className={`
                  p-4 rounded-lg border-2 transition-all
                  ${filterState === state ? 'border-blue-500 shadow-md scale-105' : 'border-slate-200 hover:border-slate-300'}
                  bg-white backdrop-blur-sm
                `}
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon size={20} className={config.color} />
                  <span className="text-2xl font-bold text-slate-900">{count}</span>
                </div>
                <div className="text-sm font-medium text-slate-600">{config.label}</div>
              </button>
            );
          })}
        </div>

        {/* Advanced Filters */}
        <div className="bg-white/80 backdrop-blur-xl rounded-lg border border-slate-200 p-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-slate-700">
              <Filter size={18} />
              <span className="font-medium">Filtreler:</span>
            </div>

            <input
              type="text"
              placeholder="Search by title or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            />

            <select
              value={filterState}
              onChange={(e) => setFilterState(e.target.value as any)}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="ALL">All States</option>
              {Object.entries(STATE_CONFIG).map(([state, config]) => (
                <option key={state} value={state}>
                  {config.label}
                </option>
              ))}
            </select>

            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="ALL">All Severities</option>
              {Object.entries(SEVERITY_CONFIG).map(([severity, config]) => (
                <option key={severity} value={severity}>
                  {config.label}
                </option>
              ))}
            </select>

            {(filterState !== 'ALL' || filterSeverity !== 'ALL' || searchQuery) && (
              <button
                onClick={() => {
                  setFilterState('ALL');
                  setFilterSeverity('ALL');
                  setSearchQuery('');
                }}
                className="px-3 py-2 text-sm text-slate-600 hover:text-slate-900 font-medium"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Comprehensive Data Table */}
        <div className="bg-white/80 backdrop-blur-xl rounded-lg border border-slate-200 overflow-hidden shadow-lg">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="animate-spin text-blue-600" size={32} />
              <span className="ml-3 text-slate-600">Loading findings...</span>
            </div>
          ) : filteredFindings.length === 0 ? (
            <div className="text-center py-16">
              <FileSearch className="mx-auto mb-4 text-slate-400" size={48} />
              <p className="text-lg text-slate-600">No findings found</p>
              <p className="text-sm text-slate-500 mt-1">Try adjusting your filters or create a new finding</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Code</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Title</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Severity</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">State</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Auditee</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">Actions</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">Comments</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Created</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredFindings.map((finding) => {
                    const stateConfig = STATE_CONFIG[finding.state];
                    const severityConfig = SEVERITY_CONFIG[finding.severity];
                    const StateIcon = stateConfig?.icon || Clock;

                    return (
                      <tr
                        key={finding.id}
                        className="hover:bg-slate-50 transition-colors cursor-pointer"
                        onClick={() => setSelectedFinding(finding)}
                      >
                        <td className="px-4 py-3">
                          <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded">
                            {finding.finding_code || finding.code}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-900">{finding.title}</div>
                          {finding.gias_category && (
                            <div className="text-xs text-slate-500 mt-1">{finding.gias_category}</div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`
                              inline-flex items-center px-2 py-1 rounded text-xs font-semibold
                              ${severityConfig?.bgColor} ${severityConfig?.color}
                            `}
                          >
                            {severityConfig?.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`
                              inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium
                              ${stateConfig?.bgColor} ${stateConfig?.color}
                            `}
                          >
                            <StateIcon size={12} />
                            {stateConfig?.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {finding.assigned_auditee_id ? (
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-medium">
                                A
                              </div>
                              <span className="text-sm text-slate-600">Assigned</span>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400">Not assigned</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-sm font-semibold text-slate-900">
                            {finding.action_plans?.length || 0}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-sm font-semibold text-slate-900">
                            {finding.comments?.filter((c) => !c.is_deleted).length || 0}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {new Date(finding.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/execution/findings/${finding.id}`);
                              }}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="View Details"
                            >
                              <Eye size={16} />
                            </button>
                            {finding.state === 'DRAFT' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                }}
                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                                title="Publish"
                              >
                                <Send size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary Footer */}
        <div className="bg-white/80 backdrop-blur-xl rounded-lg border border-slate-200 p-4">
          <div className="flex items-center justify-between text-sm text-slate-600">
            <div>
              Showing <span className="font-semibold text-slate-900">{filteredFindings.length}</span> of{' '}
              <span className="font-semibold text-slate-900">{findings.length}</span> findings
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span>
                  {findings.filter((f) => f.severity === 'CRITICAL' || f.severity === 'HIGH').length} High Priority
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                <span>{findings.filter((f) => f.state === 'NEGOTIATION').length} In Negotiation</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <NewFindingModal
        isOpen={showNewFindingModal}
        onClose={() => setShowNewFindingModal(false)}
        onSave={handleSaveNewFinding}
      />

      <FindingRightSidebar
        finding={selectedFinding}
        onClose={() => setSelectedFinding(null)}
        onNavigateToDetail={(id) => navigate(`/execution/findings/${id}`)}
      />
    </div>
  );
}
