import { create } from 'zustand';
import type {
  AuditPlan,
  AuditEngagement,
  CreatePlanInput,
  CreateEngagementInput,
  UpdateEngagementDatesInput,
} from './types';
import { markSkillsUsedForEngagement } from '@/features/talent-os/lib/EntropyEngine';

interface PlanningStore {
  plans: AuditPlan[];
  engagements: AuditEngagement[];
  loading: boolean;
  error: string | null;

  setPlans: (plans: AuditPlan[]) => void;
  setEngagements: (engagements: AuditEngagement[]) => void;

  createPlan: (input: CreatePlanInput) => AuditPlan;
  addEngagement: (input: CreateEngagementInput) => AuditEngagement;
  updateDates: (input: UpdateEngagementDatesInput) => void;
  updateEngagementStatus: (engagementId: string, status: AuditEngagement['status']) => void;
  updateActualHours: (engagementId: string, actualHours: number) => void;
  updateProgress: (engagementId: string, progress: number) => void;
  assignAuditor: (engagementId: string, auditorId: string | null) => void;
  linkStrategicObjective: (engagementId: string, objectiveId: string) => void;
  unlinkStrategicObjective: (engagementId: string, objectiveId: string) => void;

  getEngagementsByPlan: (planId: string) => AuditEngagement[];
  getPlanById: (planId: string) => AuditPlan | undefined;
  getEngagementById: (engagementId: string) => AuditEngagement | undefined;
}

export const usePlanningStore = create<PlanningStore>((set, get) => ({
  plans: [],
  engagements: [],
  loading: false,
  error: null,

  setPlans: (plans) => set({ plans }),

  setEngagements: (engagements) => set({ engagements }),

  createPlan: (input) => {
    const newPlan: AuditPlan = {
      id: crypto.randomUUID(),
      tenant_id: input.tenant_id,
      title: input.title,
      period_start: input.period_start,
      period_end: input.period_end,
      status: 'DRAFT',
      version: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    set((state) => ({
      plans: [...state.plans, newPlan],
    }));

    return newPlan;
  },

  addEngagement: (input) => {
    const newEngagement: AuditEngagement = {
      id: crypto.randomUUID(),
      tenant_id: input.tenant_id,
      plan_id: input.plan_id,
      entity_id: input.entity_id,
      title: input.title,
      status: 'PLANNED',
      audit_type: input.audit_type,
      start_date: input.start_date,
      end_date: input.end_date,
      risk_snapshot_score: input.risk_snapshot_score,
      estimated_hours: input.estimated_hours || 0,
      actual_hours: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    set((state) => ({
      engagements: [...state.engagements, newEngagement],
    }));

    return newEngagement;
  },

  updateDates: (input) => {
    set((state) => ({
      engagements: state.engagements.map((eng) =>
        eng.id === input.engagement_id
          ? {
              ...eng,
              start_date: input.start_date,
              end_date: input.end_date,
              updated_at: new Date().toISOString(),
            }
          : eng
      ),
    }));
  },

  updateEngagementStatus: (engagementId, status) => {
    const engagement = get().engagements.find((e) => e.id === engagementId);

    set((state) => ({
      engagements: state.engagements.map((eng) =>
        eng.id === engagementId
          ? {
              ...eng,
              status,
              actual_start_date: status === 'IN_PROGRESS' && !eng.actual_start_date
                ? new Date().toISOString()
                : eng.actual_start_date,
              actual_end_date: status === 'COMPLETED'
                ? new Date().toISOString()
                : eng.actual_end_date,
              progress_percentage: status === 'COMPLETED' ? 100 : eng.progress_percentage,
              updated_at: new Date().toISOString(),
            }
          : eng
      ),
    }));

    if (status === 'COMPLETED' && engagement?.assigned_auditor_id) {
      markSkillsUsedForEngagement(
        engagement.assigned_auditor_id,
        engagement.audit_type,
      ).catch(() => undefined);
    }
  },

  updateActualHours: (engagementId, actualHours) => {
    set((state) => ({
      engagements: state.engagements.map((eng) =>
        eng.id === engagementId
          ? {
              ...eng,
              actual_hours: actualHours,
              updated_at: new Date().toISOString(),
            }
          : eng
      ),
    }));
  },

  updateProgress: (engagementId, progress) => {
    set((state) => ({
      engagements: state.engagements.map((eng) =>
        eng.id === engagementId
          ? {
              ...eng,
              progress_percentage: Math.min(100, Math.max(0, progress)),
              updated_at: new Date().toISOString(),
            }
          : eng
      ),
    }));
  },

  assignAuditor: (engagementId, auditorId) => {
    set((state) => ({
      engagements: state.engagements.map((eng) =>
        eng.id === engagementId
          ? {
              ...eng,
              assigned_auditor_id: auditorId || undefined,
              updated_at: new Date().toISOString(),
            }
          : eng
      ),
    }));
  },

  linkStrategicObjective: (engagementId, objectiveId) => {
    set((state) => ({
      engagements: state.engagements.map((eng) =>
        eng.id === engagementId
          ? {
              ...eng,
              strategic_objective_ids: [
                ...(eng.strategic_objective_ids || []),
                objectiveId,
              ],
              updated_at: new Date().toISOString(),
            }
          : eng
      ),
    }));
  },

  unlinkStrategicObjective: (engagementId, objectiveId) => {
    set((state) => ({
      engagements: state.engagements.map((eng) =>
        eng.id === engagementId
          ? {
              ...eng,
              strategic_objective_ids: (eng.strategic_objective_ids || []).filter(
                (id) => id !== objectiveId
              ),
              updated_at: new Date().toISOString(),
            }
          : eng
      ),
    }));
  },

  getEngagementsByPlan: (planId) => {
    return get().engagements.filter((eng) => eng.plan_id === planId);
  },

  getPlanById: (planId) => {
    return get().plans.find((plan) => plan.id === planId);
  },

  getEngagementById: (engagementId) => {
    return get().engagements.find((eng) => eng.id === engagementId);
  },
}));
