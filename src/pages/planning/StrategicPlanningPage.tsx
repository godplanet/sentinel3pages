import { useState } from 'react';
import { PageHeader } from '@/shared/ui';
import { UniverseScoring } from '@/widgets/UniverseScoring';
import { PlanAdherence } from '@/widgets/PlanAdherence';
import { RollingPlanBoard } from '@/features/planning/ui/RollingPlanBoard';
import { fetchEngagementsList, fetchEntitiesSimple, fetchActivePlan } from '@/entities/planning/api/queries';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import NewEngagementModal from '@/features/planning/ui/NewEngagementModal';
import { usePlanningStore } from '@/entities/planning/model/store';
import toast from 'react-hot-toast';
import {
  LayoutGrid,
  Target,
  GitBranch,
  FileText,
  Plus,
  Eye,
  Edit2,
  Gauge,
  Lock,
  Loader2,
  ShieldAlert,
} from 'lucide-react';

type TabId = 'universe' | 'rolling' | 'list' | 'adherence';

interface AuditEngagement {
  id: string;
  title: string;
  audit_type: string;
  status: string;
  start_date: string;
  end_date: string;
  assigned_auditor_id?: string;
  entity_id?: string;
  estimated_hours?: number;
  risk_snapshot_score?: number;
}

export default function StrategicPlanningPage() {
  const [activeTab, setActiveTab] = useState<TabId>('rolling');
  const [showAddEngagementModal, setShowAddEngagementModal] = useState(false);
  const [closingId, setClosingId] = useState<string | null>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { closeAuditEngagement } = usePlanningStore();

  const handleCloseEngagement = async (engagementId: string, engagementTitle: string) => {
    setClosingId(engagementId);
    const toastId = toast.loading(`"${engagementTitle}" kapatılıyor — QAIP kontrolü...`);
    try {
      const result = await closeAuditEngagement(engagementId, null);
      toast.dismiss(toastId);

      if (!result.success) {
        toast.error(result.message, { duration: 6000, icon: '🚫' });
        return;
      }

      if (result.gateResult.status === 'WARN') {
        toast(result.message, { icon: '⚠️', duration: 5000 });
      } else {
        toast.success(result.message, { duration: 5000 });
      }

      queryClient.invalidateQueries({ queryKey: ['audit-engagements-list'] });
    } catch (err) {
      toast.dismiss(toastId);
      toast.error('Kapatma işlemi başarısız oldu. Lütfen tekrar deneyin.');
    } finally {
      setClosingId(null);
    }
  };

  const tabs = [
    { id: 'universe' as const, label: 'Risk Evreni & Puanlama', icon: Target, color: 'blue' },
    { id: 'rolling' as const, label: 'Bimodal Rolling Plan', icon: GitBranch, color: 'emerald' },
    { id: 'list' as const, label: 'Denetim Listesi', icon: FileText, color: 'teal' },
    { id: 'adherence' as const, label: 'Plan Uyumu', icon: Gauge, color: 'amber' },
  ];

  const { data: engagements = [], isLoading: loadingEngagements } = useQuery({
    queryKey: ['audit-engagements-list'],
    queryFn: () => fetchEngagementsList(),
    enabled: activeTab === 'list',
  });

  const { data: entities = [] } = useQuery({
    queryKey: ['audit-entities-simple'],
    queryFn: () => fetchEntitiesSimple(),
    enabled: activeTab === 'list' || showAddEngagementModal,
  });

  const { data: activePlan } = useQuery({
    queryKey: ['active-audit-plan'],
    queryFn: () => fetchActivePlan(),
    enabled: showAddEngagementModal,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <PageHeader
        title="Bimodal Stratejik Planlama"
        description="Risk evreninden Q-Sprint'e — dinamik 3+9 aylık denetim programı"
        icon={LayoutGrid}
      />

      <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="bg-white/80 backdrop-blur-xl rounded-lg border border-slate-200 p-2 flex gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-lg
                  font-semibold text-sm transition-all
                  ${
                    isActive
                      ? tab.color === 'blue'
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30'
                        : tab.color === 'emerald'
                          ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                          : tab.color === 'amber'
                            ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/30'
                            : 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-500/30'
                      : 'bg-transparent text-slate-600 hover:bg-slate-50'
                  }
                `}
              >
                <Icon size={20} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="bg-white/80 backdrop-blur-xl rounded-lg border border-slate-200 overflow-hidden shadow-lg">
          {activeTab === 'universe' && (
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Risk Evreni Skorlaması</h2>
                <p className="text-slate-600">
                  Score audit universe entities based on impact and likelihood to drive risk-based planning
                </p>
              </div>
              <UniverseScoring />
            </div>
          )}

          {activeTab === 'rolling' && (
            <div className="p-6">
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-1">Bimodal Rolling Plan</h2>
                  <p className="text-sm text-slate-500">
                    9 aylık dinamik havuzdan 3 aylık kilitli Q-Sprint'e görev çekin.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                  <GitBranch size={12} className="text-slate-400" />
                  3+9 Model
                </div>
              </div>
              <RollingPlanBoard />
            </div>
          )}

          {activeTab === 'adherence' && (
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Plan Uyumu Takibi</h2>
                <p className="text-slate-600">
                  Yıllık denetim planının gerçekleşme oranı, sapma analizi ve performans izleme
                </p>
              </div>
              <PlanAdherence />
            </div>
          )}

          {activeTab === 'list' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Denetim Görevleri Listesi</h2>
                  <p className="text-slate-600">
                    Comprehensive list view of all planned and active audit engagements
                  </p>
                </div>
                <button
                  onClick={() => setShowAddEngagementModal(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transition-all font-medium"
                >
                  <Plus size={18} />
                  <span>Yeni Denetim Planla</span>
                </button>
              </div>

              {loadingEngagements ? (
                <div className="flex items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
                  <span className="ml-3 text-slate-600">Loading engagements...</span>
                </div>
              ) : engagements.length === 0 ? (
                <div className="text-center py-16">
                  <Calendar className="mx-auto mb-4 text-slate-400" size={48} />
                  <p className="text-lg text-slate-600">No audit engagements planned yet</p>
                  <p className="text-sm text-slate-500 mt-1">Click "Yeni Denetim Planla" to add your first engagement</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b-2 border-slate-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                          Title
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                          Start Date
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                          End Date
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                          Est. Hours
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                          Risk Score
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {engagements.map((engagement) => {
                        const statusColor =
                          engagement.status === 'CLOSED'
                            ? 'bg-slate-200 text-slate-600'
                            : engagement.status === 'FINALIZED'
                              ? 'bg-teal-100 text-teal-700'
                              : engagement.status === 'COMPLETED'
                                ? 'bg-emerald-100 text-emerald-700'
                                : engagement.status === 'IN_PROGRESS'
                                  ? 'bg-blue-100 text-blue-700'
                                  : engagement.status === 'PLANNED'
                                    ? 'bg-slate-100 text-slate-700'
                                    : 'bg-amber-100 text-amber-700';
                        const isClosable = ['COMPLETED', 'FINALIZED', 'IN_PROGRESS'].includes(engagement.status);
                        const isBeingClosed = closingId === engagement.id;

                        return (
                          <tr
                            key={engagement.id}
                            className="hover:bg-slate-50 transition-colors cursor-pointer"
                            onClick={() => navigate(`/execution/my-engagements/${engagement.id}`)}
                          >
                            <td className="px-4 py-3">
                              <div className="font-medium text-slate-900">{engagement.title}</div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-sm text-slate-600">{engagement.audit_type}</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${statusColor}`}>
                                {engagement.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-600">
                              {engagement.start_date ? new Date(engagement.start_date).toLocaleDateString() : '-'}
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-600">
                              {engagement.end_date ? new Date(engagement.end_date).toLocaleDateString() : '-'}
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-600">
                              {engagement.estimated_hours || '-'}
                            </td>
                            <td className="px-4 py-3">
                              {engagement.risk_snapshot_score ? (
                                <div className="flex items-center gap-2">
                                  <div
                                    className={`w-16 h-2 rounded-full overflow-hidden bg-slate-200`}
                                  >
                                    <div
                                      className={`h-full ${
                                        engagement.risk_snapshot_score >= 70
                                          ? 'bg-red-500'
                                          : engagement.risk_snapshot_score >= 40
                                            ? 'bg-amber-500'
                                            : 'bg-emerald-500'
                                      }`}
                                      style={{ width: `${engagement.risk_snapshot_score}%` }}
                                    />
                                  </div>
                                  <span className="text-sm font-semibold text-slate-700">
                                    {engagement.risk_snapshot_score.toFixed(0)}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-sm text-slate-400">-</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/execution/my-engagements/${engagement.id}`);
                                  }}
                                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                  title="View Details"
                                >
                                  <Eye size={16} />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                  }}
                                  className="p-1.5 text-slate-600 hover:bg-slate-50 rounded transition-colors"
                                  title="Edit"
                                >
                                  <Edit2 size={16} />
                                </button>
                                {isClosable && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCloseEngagement(engagement.id, engagement.title);
                                    }}
                                    disabled={isBeingClosed}
                                    className="flex items-center gap-1 px-2 py-1 text-xs font-semibold bg-slate-800 text-white rounded hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    title="GIAS 8.3 — Denetimi Kapat (QAIP kontrolü çalıştır)"
                                  >
                                    {isBeingClosed
                                      ? <Loader2 size={12} className="animate-spin" />
                                      : <Lock size={12} />
                                    }
                                    {isBeingClosed ? '...' : 'Kapat'}
                                  </button>
                                )}
                                {engagement.status === 'CLOSED' && (
                                  <span className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-slate-400 border border-slate-200 rounded">
                                    <ShieldAlert size={11} />
                                    Kapalı
                                  </span>
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

              {engagements.length > 0 && (
                <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
                  <div>
                    Total: <span className="font-semibold text-slate-900">{engagements.length}</span> engagements
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <span>
                        {engagements.filter((e) => e.status === 'IN_PROGRESS').length} In Progress
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-slate-500"></div>
                      <span>
                        {engagements.filter((e) => e.status === 'PLANNED').length} Planned
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      <span>
                        {engagements.filter((e) => e.status === 'COMPLETED').length} Completed
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Engagement Modal */}
      {showAddEngagementModal && activePlan && (
        <NewEngagementModal
          isOpen={showAddEngagementModal}
          onClose={() => setShowAddEngagementModal(false)}
          planId={activePlan.id}
          entities={entities}
        />
      )}

      {showAddEngagementModal && !activePlan && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md">
            <h3 className="text-lg font-bold text-red-600 mb-2">Plan Bulunamadı</h3>
            <p className="text-slate-600">
              Denetim görevi oluşturmak için önce onaylanmış bir yıllık plan oluşturulmalıdır.
            </p>
            <button
              onClick={() => setShowAddEngagementModal(false)}
              className="mt-4 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors w-full"
            >
              Tamam
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
