import { useState } from 'react';
import { LayoutDashboard, Sparkles, PieChart, Radar } from 'lucide-react';
import { PageHeader } from '@/shared/ui/PageHeader';
import { MissionControlHero } from '@/widgets/dashboard/MissionControlHero';
import { KPITicker } from '@/widgets/dashboard/KPITicker';
import { TaskWorkbench } from '@/widgets/dashboard/TaskWorkbench';
import { LivePulse } from '@/widgets/dashboard/LivePulse';
import { SystemHealthWidget } from '@/widgets/SystemHealth';
import { StrategicAnalyticsView } from '@/widgets/dashboard/StrategicAnalyticsView';
import { EcosystemView } from '@/widgets/dashboard/EcosystemView';
import { RiskHeatMap } from '@/widgets/dashboard/RiskHeatMap';
import { PredictiveRadar } from '@/widgets/PredictiveRadar';
import { mockWelcome, mockAIBrief, mockTasks, mockActivities } from './mockData';
import { useDashboardStats, buildKPICards } from './useDashboardStats';
import clsx from 'clsx';

type TabKey = 'mission-control' | 'strategic-analysis' | 'ecosystem';

const TABS = [
  { key: 'mission-control' as TabKey, label: 'Genel Bakis', icon: LayoutDashboard },
  { key: 'strategic-analysis' as TabKey, label: 'Stratejik Analiz', icon: PieChart },
  { key: 'ecosystem' as TabKey, label: 'Ekosistem & Gozetim', icon: Radar },
];

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('mission-control');
  const { data: stats } = useDashboardStats();
  const kpiCards = buildKPICards(stats);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Yönetim Özeti"
        description="Sentinel GRC v3.0 - AI-Native Banking Audit Platform"
        icon={LayoutDashboard}
        action={
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 transition-all shadow-sm">
            <Sparkles size={16} />
            AI Asistani
          </button>
        }
      />

      <div className="border-b border-slate-200 bg-white rounded-xl shadow-sm">
        <div className="flex gap-1 px-6">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={clsx(
                'flex items-center gap-2 px-6 py-3 font-medium text-sm transition-all relative',
                activeTab === tab.key
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              )}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'mission-control' && (
        <div className="space-y-6">
          <MissionControlHero welcome={mockWelcome} aiBrief={mockAIBrief} />

          <KPITicker kpis={kpiCards} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <TaskWorkbench tasks={mockTasks} />
            </div>

            <div className="space-y-6">
              <SystemHealthWidget />
              <LivePulse activities={mockActivities} />
            </div>
          </div>

          <PredictiveRadar />

          <RiskHeatMap />
        </div>
      )}

      {activeTab === 'strategic-analysis' && <StrategicAnalyticsView />}

      {activeTab === 'ecosystem' && <EcosystemView />}
    </div>
  );
}
