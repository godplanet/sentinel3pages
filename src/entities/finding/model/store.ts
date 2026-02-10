import { create } from 'zustand';
import type {
  Finding,
  ComprehensiveFinding,
  ActionPlan,
  FindingComment,
  FindingHistory,
  FindingSecret,
  Assignment,
  ActionStep,
  FindingWithAssignment,
} from './types';

interface FindingStore {
  findings: ComprehensiveFinding[];
  selectedFinding: ComprehensiveFinding | null;
  isLoading: boolean;

  // CRUD Operations
  setFindings: (findings: ComprehensiveFinding[]) => void;
  addFinding: (finding: Finding) => void;
  updateFinding: (id: string, updates: Partial<Finding>) => void;
  deleteFinding: (id: string) => void;
  selectFinding: (id: string | null) => void;
  setLoading: (loading: boolean) => void;

  // State Machine
  changeState: (id: string, newState: string) => void;

  // Action Plans
  addActionPlan: (findingId: string, actionPlan: ActionPlan) => void;
  updateActionPlan: (findingId: string, actionPlanId: string, updates: Partial<ActionPlan>) => void;
  deleteActionPlan: (findingId: string, actionPlanId: string) => void;

  // Comments
  addComment: (findingId: string, comment: FindingComment) => void;
  updateComment: (findingId: string, commentId: string, updates: Partial<FindingComment>) => void;
  deleteComment: (findingId: string, commentId: string) => void;

  // Secrets (RCA)
  updateSecrets: (findingId: string, secrets: Partial<FindingSecret>) => void;

  // History
  addHistory: (findingId: string, history: FindingHistory) => void;

  // Legacy support
  legacyFindings: FindingWithAssignment[];
  setLegacyFindings: (findings: FindingWithAssignment[]) => void;
}

export const useFindingStore = create<FindingStore>((set) => ({
  findings: [],
  selectedFinding: null,
  isLoading: false,
  legacyFindings: [],

  setFindings: (findings) => set({ findings }),

  addFinding: (finding) =>
    set((state) => ({
      findings: [
        ...state.findings,
        {
          ...finding,
          action_plans: [],
          comments: [],
          history: [],
        },
      ],
    })),

  updateFinding: (id, updates) =>
    set((state) => ({
      findings: state.findings.map((f) =>
        f.id === id ? { ...f, ...updates } : f
      ),
      selectedFinding:
        state.selectedFinding?.id === id
          ? { ...state.selectedFinding, ...updates }
          : state.selectedFinding,
    })),

  deleteFinding: (id) =>
    set((state) => ({
      findings: state.findings.filter((f) => f.id !== id),
      selectedFinding:
        state.selectedFinding?.id === id ? null : state.selectedFinding,
    })),

  selectFinding: (id) =>
    set((state) => ({
      selectedFinding: id
        ? state.findings.find((f) => f.id === id) || null
        : null,
    })),

  setLoading: (loading) => set({ isLoading: loading }),

  changeState: (id, newState) =>
    set((state) => ({
      findings: state.findings.map((f) =>
        f.id === id ? { ...f, state: newState as any } : f
      ),
    })),

  addActionPlan: (findingId, actionPlan) =>
    set((state) => ({
      findings: state.findings.map((f) =>
        f.id === findingId
          ? { ...f, action_plans: [...(f.action_plans || []), actionPlan] }
          : f
      ),
    })),

  updateActionPlan: (findingId, actionPlanId, updates) =>
    set((state) => ({
      findings: state.findings.map((f) =>
        f.id === findingId
          ? {
              ...f,
              action_plans: (f.action_plans || []).map((ap) =>
                ap.id === actionPlanId ? { ...ap, ...updates } : ap
              ),
            }
          : f
      ),
    })),

  deleteActionPlan: (findingId, actionPlanId) =>
    set((state) => ({
      findings: state.findings.map((f) =>
        f.id === findingId
          ? {
              ...f,
              action_plans: (f.action_plans || []).filter((ap) => ap.id !== actionPlanId),
            }
          : f
      ),
    })),

  addComment: (findingId, comment) =>
    set((state) => ({
      findings: state.findings.map((f) =>
        f.id === findingId
          ? { ...f, comments: [...(f.comments || []), comment] }
          : f
      ),
    })),

  updateComment: (findingId, commentId, updates) =>
    set((state) => ({
      findings: state.findings.map((f) =>
        f.id === findingId
          ? {
              ...f,
              comments: (f.comments || []).map((c) =>
                c.id === commentId ? { ...c, ...updates } : c
              ),
            }
          : f
      ),
    })),

  deleteComment: (findingId, commentId) =>
    set((state) => ({
      findings: state.findings.map((f) =>
        f.id === findingId
          ? {
              ...f,
              comments: (f.comments || []).map((c) =>
                c.id === commentId ? { ...c, is_deleted: true } : c
              ),
            }
          : f
      ),
    })),

  updateSecrets: (findingId, secrets) =>
    set((state) => ({
      findings: state.findings.map((f) =>
        f.id === findingId
          ? { ...f, secrets: { ...f.secrets, ...secrets } as FindingSecret }
          : f
      ),
    })),

  addHistory: (findingId, history) =>
    set((state) => ({
      findings: state.findings.map((f) =>
        f.id === findingId
          ? { ...f, history: [...(f.history || []), history] }
          : f
      ),
    })),

  // Legacy support
  setLegacyFindings: (findings) => set({ legacyFindings: findings }),
}));
