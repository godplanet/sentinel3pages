import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase';
import { ACTIVE_TENANT_ID } from '@/shared/lib/constants';
import type { WelcomeSummary, AIBrief, MyTask, SystemActivity } from '@/entities/dashboard/model/types';

const TENANT = ACTIVE_TENANT_ID;

export function useDashboardLiveData() {
  return useQuery({
    queryKey: ['dashboard-live-data'],
    queryFn: async () => {
      const [userRes, findingsRes, actionsRes, engagementsRes] = await Promise.all([
        supabase
          .from('user_profiles')
          .select('full_name, role, title, email')
          .eq('tenant_id', TENANT)
          .eq('role', 'admin')
          .limit(1)
          .maybeSingle(),
        supabase
          .from('audit_findings')
          .select('id, title, severity, status, created_at')
          .order('created_at', { ascending: false })
          .limit(20),
        supabase
          .from('action_plans')
          .select('id, title, status, target_date, priority')
          .eq('tenant_id', TENANT)
          .in('status', ['PLANNED', 'IN_PROGRESS'])
          .order('target_date', { ascending: true })
          .limit(10),
        supabase
          .from('audit_engagements')
          .select('id, title, status, created_at')
          .eq('tenant_id', TENANT)
          .order('created_at', { ascending: false })
          .limit(5),
      ]);

      const user = userRes.data;
      const findings = findingsRes.data || [];
      const actions = actionsRes.data || [];
      const engagements = engagementsRes.data || [];

      const welcome: WelcomeSummary = {
        userName: user?.full_name || 'Kullanıcı',
        role: user?.title || user?.role || 'Denetçi',
        welcomeMessage: `Hoş geldiniz, ${user?.full_name?.split(' ')[0] || 'Kullanıcı'}.`,
        systemHealth: 98,
        lastLogin: 'Bugün, 09:15',
      };

      const criticalFindings = findings.filter(f => f.severity === 'CRITICAL' || f.severity === 'HIGH');
      const aiBrief: AIBrief = {
        headline: criticalFindings.length > 0
          ? `Son 24 saatte ${criticalFindings.length} adet yüksek önem seviyeli bulgu tespit edildi`
          : 'Sistem normal parametrelerde çalışıyor',
        summary: criticalFindings.length > 0
          ? `Toplam ${findings.length} bulgu izleniyor. ${criticalFindings.length} kritik/yüksek öncelikli bulgu hızlı aksiyon gerektiriyor.`
          : `Toplam ${findings.length} bulgu izleniyor. ${engagements.filter(e => e.status === 'FIELDWORK').length} aktif denetim saha çalışması devam ediyor.`,
        context: 'Sentinel Brain • Günlük Tarama',
        sentiment: criticalFindings.length >= 5 ? 'critical' : criticalFindings.length > 0 ? 'warning' : 'positive',
      };

      const tasks: MyTask[] = [
        ...actions.slice(0, 6).map((action) => ({
          id: `action-${action.id}`,
          title: action.title,
          deadline: formatDate(action.target_date),
          type: 'approval' as const,
          status: action.status === 'IN_PROGRESS' ? 'in-progress' as const : 'pending' as const,
          priority: (action.priority?.toLowerCase() || 'medium') as 'high' | 'medium' | 'low',
        })),
        ...findings.slice(0, 4).filter(f => f.status === 'ISSUED_FOR_RESPONSE').map(finding => ({
          id: `finding-${finding.id}`,
          title: finding.title,
          deadline: 'Belirlenmedi',
          type: 'review' as const,
          status: 'pending' as const,
          priority: finding.severity === 'CRITICAL' ? 'high' as const : 'medium' as const,
        })),
      ].slice(0, 6);

      const activities: SystemActivity[] = [
        ...findings.slice(0, 3).map(f => ({
          id: `finding-${f.id}`,
          userName: 'Denetçi',
          action: 'yeni bir bulgu ekledi',
          target: f.title,
          timestamp: formatTimestamp(f.created_at),
          type: 'finding' as const,
        })),
        ...engagements.slice(0, 3).map(e => ({
          id: `eng-${e.id}`,
          userName: 'Sistem',
          action: 'denetim planına ekledi',
          target: e.title,
          timestamp: formatTimestamp(e.created_at),
          type: 'plan' as const,
        })),
      ].slice(0, 6);

      return {
        welcome,
        aiBrief,
        tasks,
        activities,
      };
    },
    staleTime: 60_000,
  });
}

function formatDate(dateString: string | null): string {
  if (!dateString) return 'Belirlenmedi';

  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Bugün';
  if (diffDays === 1) return 'Yarın';
  if (diffDays === -1) return 'Dün';
  if (diffDays > 0 && diffDays <= 7) return `${diffDays} gün sonra`;

  return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });
}

function formatTimestamp(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Az önce';
  if (diffMins < 60) return `${diffMins} dk önce`;
  if (diffHours < 24) return `${diffHours} saat önce`;
  if (diffDays === 1) return 'Dün';
  if (diffDays < 7) return `${diffDays} gün önce`;

  return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });
}
