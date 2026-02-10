import { useState, useEffect } from 'react';
import { PageHeader } from '@/shared/ui';
import { SuperDrawer } from '@/widgets/SuperDrawer';
import { actionApi, agingApi, useActionAging, formatAgingMetric } from '@/entities/action';
import type { ActionWithDetails, ActionAging } from '@/entities/action';
import {
  ListTodo,
  Filter,
  Search,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Target,
  Loader2,
} from 'lucide-react';

type ViewMode = 'operational' | 'governance';

export default function ActionWorkbenchPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('operational');
  const [actions, setActions] = useState<ActionWithDetails[]>([]);
  const [agingData, setAgingData] = useState<ActionAging[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedActionId, setSelectedActionId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [actionsData, agingDataResult] = await Promise.all([
        actionApi.getAll(),
        agingApi.getAll(),
      ]);
      setActions(actionsData);
      setAgingData(agingDataResult);
    } catch (error) {
      console.error('Failed to load actions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredActions = actions.filter((action) => {
    if (filterStatus !== 'all' && action.status !== filterStatus) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        action.title.toLowerCase().includes(query) ||
        action.id.toLowerCase().includes(query) ||
        action.assignee_unit_name?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const stats = {
    total: actions.length,
    pending: actions.filter((a) => a.status === 'pending').length,
    inProgress: actions.filter((a) => a.status === 'in_progress').length,
    review: actions.filter((a) => a.status === 'evidence_uploaded' || a.status === 'auditor_review').length,
    closed: actions.filter((a) => a.status === 'closed').length,
    overdue: agingData.filter((a) => a.is_operationally_overdue).length,
    performanceDelayed: agingData.filter((a) => a.is_performance_delayed).length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <PageHeader
        title="Action Workbench"
        subtitle="Track remediation actions with dual aging metrics"
        icon={ListTodo}
      />

      <div className="space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-5 gap-4">
          <StatsCard
            title="Total Actions"
            value={stats.total}
            icon={ListTodo}
            color="blue"
          />
          <StatsCard
            title="In Progress"
            value={stats.inProgress}
            icon={Clock}
            color="yellow"
          />
          <StatsCard
            title="Awaiting Review"
            value={stats.review}
            icon={AlertTriangle}
            color="orange"
          />
          <StatsCard
            title="Operationally Overdue"
            value={stats.overdue}
            icon={AlertTriangle}
            color="red"
          />
          <StatsCard
            title="Closed"
            value={stats.closed}
            icon={CheckCircle}
            color="green"
          />
        </div>

        {/* Dual Tab Header */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
          <div className="flex items-center border-b border-slate-200">
            <button
              onClick={() => setViewMode('operational')}
              className={`
                flex items-center gap-2 px-6 py-4 border-b-2 font-semibold transition-colors
                ${viewMode === 'operational'
                  ? 'border-blue-600 text-blue-600 bg-blue-50'
                  : 'border-transparent text-slate-600 hover:text-slate-900'}
              `}
            >
              <Target size={20} />
              <span>Operational View</span>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                Current Tracking
              </span>
            </button>

            <button
              onClick={() => setViewMode('governance')}
              className={`
                flex items-center gap-2 px-6 py-4 border-b-2 font-semibold transition-colors
                ${viewMode === 'governance'
                  ? 'border-purple-600 text-purple-600 bg-purple-50'
                  : 'border-transparent text-slate-600 hover:text-slate-900'}
              `}
            >
              <TrendingUp size={20} />
              <span>Governance View</span>
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                Performance Tracking
              </span>
            </button>
          </div>

          {/* Description */}
          <div className="px-6 py-3 bg-slate-50 border-b border-slate-200">
            <p className="text-sm text-slate-600">
              {viewMode === 'operational' ? (
                <>
                  <span className="font-semibold">Operational View:</span> Shows actions based on current due dates
                  (including approved extensions). Use this for daily operational tracking.
                </>
              ) : (
                <>
                  <span className="font-semibold">Governance View:</span> Shows actions based on original due dates
                  (ignoring extensions). Reveals true performance delays that might be hidden by extensions.
                </>
              )}
            </p>
          </div>

          {/* Filters */}
          <div className="px-6 py-4 flex items-center gap-4">
            <div className="flex items-center gap-2 text-slate-700">
              <Filter size={18} />
              <span className="font-medium">Filters:</span>
            </div>

            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search by title, ID, or unit..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="evidence_uploaded">Evidence Uploaded</option>
              <option value="auditor_review">Under Review</option>
              <option value="closed">Closed</option>
            </select>

            {(filterStatus !== 'all' || searchQuery) && (
              <button
                onClick={() => {
                  setFilterStatus('all');
                  setSearchQuery('');
                }}
                className="px-3 py-2 text-sm text-slate-600 hover:text-slate-900 font-medium"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Actions Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="animate-spin text-blue-600" size={48} />
            <span className="ml-3 text-slate-600">Loading actions...</span>
          </div>
        ) : filteredActions.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg border border-slate-200">
            <ListTodo className="mx-auto mb-4 text-slate-400" size={48} />
            <p className="text-lg text-slate-600">No actions found</p>
            <p className="text-sm text-slate-500 mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredActions.map((action) => (
              <ActionCard
                key={action.id}
                action={action}
                viewMode={viewMode}
                onClick={() => setSelectedActionId(action.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Super Drawer */}
      <SuperDrawer
        actionId={selectedActionId}
        isOpen={!!selectedActionId}
        onClose={() => setSelectedActionId(null)}
        onUpdate={loadData}
      />
    </div>
  );
}

function StatsCard({ title, value, icon: Icon, color }: {
  title: string;
  value: number;
  icon: any;
  color: string;
}) {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-100',
    yellow: 'text-yellow-600 bg-yellow-100',
    orange: 'text-orange-600 bg-orange-100',
    red: 'text-red-600 bg-red-100',
    green: 'text-green-600 bg-green-100',
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <Icon size={20} className={colorClasses[color as keyof typeof colorClasses].split(' ')[0]} />
        <span className="text-3xl font-bold text-slate-900">{value}</span>
      </div>
      <div className="text-sm font-medium text-slate-600">{title}</div>
    </div>
  );
}

function ActionCard({ action, viewMode, onClick }: {
  action: ActionWithDetails;
  viewMode: ViewMode;
  onClick: () => void;
}) {
  const aging = useActionAging(action);

  const isOverdue = viewMode === 'operational'
    ? aging.isOperationallyOverdue
    : aging.isPerformanceDelayed;

  const delayDays = viewMode === 'operational'
    ? aging.operationalOverdue
    : aging.performanceDelay;

  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left p-5 bg-white/90 backdrop-blur-sm rounded-lg border-2 transition-all
        hover:shadow-lg hover:scale-[1.01]
        ${aging.glowClass || 'border-slate-200'}
      `}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div
              className={`
                w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
                ${aging.severity === 'critical' ? 'bg-red-100' :
                  aging.severity === 'warning' ? 'bg-orange-100' :
                  'bg-blue-100'}
              `}
            >
              <AlertTriangle
                size={20}
                className={aging.severity === 'critical' ? 'text-red-600' :
                  aging.severity === 'warning' ? 'text-orange-600' :
                  'text-blue-600'}
              />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-900 text-lg">{action.title}</h3>
              <p className="text-sm text-slate-600">
                {action.finding_snapshot.title} • {action.assignee_unit_name || 'Unassigned'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm mt-3">
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-slate-500" />
              <span className={isOverdue ? 'text-red-600 font-semibold' : 'text-slate-700'}>
                {viewMode === 'operational' ? 'Current Due' : 'Original Due'}:{' '}
                {new Date(viewMode === 'operational' ? action.current_due_date : action.original_due_date).toLocaleDateString()}
              </span>
              {isOverdue && (
                <span className="text-red-600 font-bold">
                  ({formatAgingMetric(delayDays)})
                </span>
              )}
            </div>

            {aging.extensionDays > 0 && viewMode === 'governance' && (
              <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-medium">
                <Clock size={12} />
                <span>Extended by {aging.extensionDays} days</span>
              </div>
            )}

            <div className="flex items-center gap-1.5">
              <span
                className={`
                  px-2 py-1 rounded text-xs font-semibold
                  ${action.status === 'closed' ? 'bg-green-100 text-green-700' :
                    action.status === 'evidence_uploaded' ? 'bg-blue-100 text-blue-700' :
                    action.status === 'auditor_review' ? 'bg-purple-100 text-purple-700' :
                    'bg-slate-100 text-slate-700'}
                `}
              >
                {action.status.replace(/_/g, ' ').toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs text-slate-500 mb-1">Age from Detection</div>
          <div className="text-2xl font-bold text-slate-900">{aging.ageFromDetection}</div>
          <div className="text-xs text-slate-600">days</div>

          {action.evidence && action.evidence.length > 0 && (
            <div className="mt-3 text-xs text-blue-600 font-medium">
              {action.evidence.length} evidence file{action.evidence.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
