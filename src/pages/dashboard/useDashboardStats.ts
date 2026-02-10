import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase';
import type { KPICard } from '@/entities/dashboard/model/types';

const TENANT = '00000000-0000-0000-0000-000000000001';

interface DashboardStats {
  entityCount: number;
  assessmentCount: number;
  criticalCount: number;
  highCount: number;
  avgRiskScore: number;
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async (): Promise<DashboardStats> => {
      const [entitiesRes, assessmentsRes] = await Promise.all([
        supabase
          .from('audit_entities')
          .select('id', { count: 'exact', head: true })
          .eq('tenant_id', TENANT),
        supabase
          .from('risk_assessments')
          .select('inherent_risk_score, residual_score')
          .eq('tenant_id', TENANT),
      ]);

      const entityCount = entitiesRes.count ?? 0;
      const assessments = assessmentsRes.data ?? [];
      const assessmentCount = assessments.length;

      let criticalCount = 0;
      let highCount = 0;
      let totalScore = 0;

      for (const a of assessments) {
        const score = a.inherent_risk_score ?? 0;
        totalScore += score;
        if (score >= 15) criticalCount++;
        else if (score >= 10) highCount++;
      }

      const avgRiskScore = assessmentCount > 0
        ? Math.round((totalScore / assessmentCount) * 10) / 10
        : 0;

      return {
        entityCount,
        assessmentCount,
        criticalCount,
        highCount,
        avgRiskScore,
      };
    },
    staleTime: 30_000,
  });
}

export function buildKPICards(stats: DashboardStats | undefined): KPICard[] {
  if (!stats) {
    return [
      { id: 'risk-score', label: 'Kurumsal Risk Skoru', value: '-', trend: 'flat', status: 'warning' },
      { id: 'entity-count', label: 'Denetim Evreni', value: '-', trend: 'flat', status: 'success' },
      { id: 'critical-risks', label: 'Kritik Risk Sayisi', value: '-', trend: 'flat', status: 'danger' },
      { id: 'high-risks', label: 'Yuksek Risk Sayisi', value: '-', trend: 'flat', status: 'warning' },
    ];
  }

  const riskStatus: KPICard['status'] =
    stats.avgRiskScore >= 12 ? 'danger' : stats.avgRiskScore >= 8 ? 'warning' : 'success';

  return [
    {
      id: 'risk-score',
      label: 'Ort. Risk Skoru',
      value: String(stats.avgRiskScore),
      trend: stats.avgRiskScore >= 10 ? 'up' : 'down',
      status: riskStatus,
    },
    {
      id: 'entity-count',
      label: 'Denetim Evreni',
      value: `${stats.entityCount} varlik`,
      trend: 'up',
      status: 'success',
    },
    {
      id: 'critical-risks',
      label: 'Kritik Risk',
      value: String(stats.criticalCount),
      trend: stats.criticalCount > 3 ? 'up' : 'down',
      status: stats.criticalCount > 0 ? 'danger' : 'success',
    },
    {
      id: 'assessment-count',
      label: 'Canli Degerlendirme',
      value: String(stats.assessmentCount),
      trend: 'up',
      status: stats.assessmentCount > 0 ? 'success' : 'warning',
    },
  ];
}
