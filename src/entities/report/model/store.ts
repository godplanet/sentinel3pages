import { create } from 'zustand';
import type { Report, ReportBlock, ReportTemplate, ReportComment, M6Report, M6ReportBlock, M6ReportStatus, ReportSection, ExecutiveSummary } from './types';
import { reportApi } from '../api';

interface ReportState {
  reports: Report[];
  currentReport: Report | null;
  blocks: ReportBlock[];
  templates: ReportTemplate[];
  comments: ReportComment[];
  loading: boolean;
  error: string | null;

  fetchReports: () => Promise<void>;
  fetchReport: (id: string) => Promise<void>;
  fetchBlocks: (reportId: string) => Promise<void>;
  fetchTemplates: () => Promise<void>;
  fetchComments: (reportId: string) => Promise<void>;
  addComment: (data: { report_id: string; text: string; type?: string }) => Promise<void>;
  resolveComment: (id: string) => Promise<void>;
  createReport: (data: any) => Promise<Report>;
  updateReport: (id: string, data: any) => Promise<void>;
  deleteReport: (id: string) => Promise<void>;
  addBlock: (data: any) => Promise<ReportBlock>;
  updateBlock: (id: string, data: any) => Promise<void>;
  deleteBlock: (id: string) => Promise<void>;
  reorderBlocks: (blockIds: string[]) => Promise<void>;
  publishReport: (id: string) => Promise<void>;
  reset: () => void;
}

export const useReportStore = create<ReportState>((set, get) => ({
  reports: [],
  currentReport: null,
  blocks: [],
  templates: [],
  comments: [],
  loading: false,
  error: null,

  fetchReports: async () => {
    set({ loading: true, error: null });
    try {
      const reports = await reportApi.getReports();
      set({ reports, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  fetchReport: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const report = await reportApi.getReport(id);
      set({ currentReport: report, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  fetchBlocks: async (reportId: string) => {
    set({ loading: true, error: null });
    try {
      const blocks = await reportApi.getBlocks(reportId);
      set({ blocks, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  fetchTemplates: async () => {
    try {
      const templates = await reportApi.getTemplates();
      set({ templates });
    } catch {
      set({ templates: [] });
    }
  },

  fetchComments: async (reportId: string) => {
    try {
      const comments = await reportApi.getComments(reportId);
      set({ comments });
    } catch {
      set({ comments: [] });
    }
  },

  addComment: async (data) => {
    try {
      const comment = await reportApi.addComment(data);
      set((state) => ({ comments: [...state.comments, comment] }));
    } catch {
      /* silent */
    }
  },

  resolveComment: async (id: string) => {
    try {
      await reportApi.resolveComment(id);
      set((state) => ({
        comments: state.comments.map((c) => (c.id === id ? { ...c, resolved: true } : c)),
      }));
    } catch {
      /* silent */
    }
  },

  createReport: async (data: any) => {
    set({ loading: true, error: null });
    try {
      const report = await reportApi.createReport(data);
      set((state) => ({ reports: [report, ...state.reports], loading: false }));
      return report;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateReport: async (id: string, data: any) => {
    set({ loading: true, error: null });
    try {
      const updated = await reportApi.updateReport(id, data);
      set((state) => ({
        reports: state.reports.map((r) => (r.id === id ? updated : r)),
        currentReport: state.currentReport?.id === id ? updated : state.currentReport,
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  deleteReport: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await reportApi.deleteReport(id);
      set((state) => ({
        reports: state.reports.filter((r) => r.id !== id),
        currentReport: state.currentReport?.id === id ? null : state.currentReport,
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  addBlock: async (data: any) => {
    set({ loading: true, error: null });
    try {
      const block = await reportApi.createBlock(data);
      set((state) => ({
        blocks: [...state.blocks, block].sort((a, b) => a.position_index - b.position_index),
        loading: false,
      }));
      return block;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateBlock: async (id: string, data: any) => {
    set({ loading: true, error: null });
    try {
      const updated = await reportApi.updateBlock(id, data);
      set((state) => ({
        blocks: state.blocks.map((b) => (b.id === id ? updated : b)),
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  deleteBlock: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await reportApi.deleteBlock(id);
      set((state) => ({
        blocks: state.blocks.filter((b) => b.id !== id),
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  reorderBlocks: async (blockIds: string[]) => {
    const { blocks, currentReport } = get();
    if (!currentReport) return;

    const optimisticBlocks = blockIds
      .map((id, index) => {
        const block = blocks.find((b) => b.id === id);
        return block ? { ...block, position_index: index } : null;
      })
      .filter(Boolean) as ReportBlock[];

    set({ blocks: optimisticBlocks });

    try {
      await reportApi.reorderBlocks(currentReport.id, blockIds);
    } catch (error: any) {
      set({ blocks, error: error.message });
    }
  },

  publishReport: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await reportApi.publishReport(id);
      const updated = await reportApi.getReport(id);
      set((state) => ({
        reports: state.reports.map((r) => (r.id === id && updated ? updated : r)),
        currentReport: state.currentReport?.id === id ? updated : state.currentReport,
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  reset: () => {
    set({
      reports: [],
      currentReport: null,
      blocks: [],
      templates: [],
      comments: [],
      loading: false,
      error: null,
    });
  },
}));

// ─── MODULE 6: Active Report Store (Polymorphic Block Architecture) ──────────

interface ActiveReportState {
  activeReport: M6Report | null;
  setActiveReport: (report: M6Report | null) => void;
  updateReportMeta: (data: Partial<M6Report>) => void;
  updateExecutiveSummary: (data: Partial<ExecutiveSummary>) => void;
  changeReportStatus: (status: M6ReportStatus) => void;
  addBlock: (sectionId: string, block: M6ReportBlock) => void;
  updateBlock: (sectionId: string, blockId: string, updates: Partial<M6ReportBlock>) => void;
  removeBlock: (sectionId: string, blockId: string) => void;
  reorderBlocks: (sectionId: string, startIndex: number, endIndex: number) => void;
  publishReport: () => void;
}

const reindexBlocks = (blocks: M6ReportBlock[]): M6ReportBlock[] =>
  blocks.map((b, i) => ({ ...b, orderIndex: i }));

const mapSection = (
  sections: ReportSection[],
  sectionId: string,
  fn: (blocks: M6ReportBlock[]) => M6ReportBlock[],
): ReportSection[] =>
  sections.map((s) => (s.id === sectionId ? { ...s, blocks: fn(s.blocks) } : s));

export const useActiveReportStore = create<ActiveReportState>((set) => ({
  activeReport: null,

  setActiveReport: (report) => set({ activeReport: report }),

  updateExecutiveSummary: (data) =>
    set((state) => {
      if (!state.activeReport) return state;
      return {
        activeReport: {
          ...state.activeReport,
          executiveSummary: { ...state.activeReport.executiveSummary, ...data },
          updatedAt: new Date().toISOString(),
        },
      };
    }),

  changeReportStatus: (status) =>
    set((state) => {
      if (!state.activeReport) return state;
      const now = new Date().toISOString();
      return {
        activeReport: {
          ...state.activeReport,
          status,
          updatedAt: now,
          publishedAt: status === 'published' ? now : state.activeReport.publishedAt,
        },
      };
    }),

  updateReportMeta: (data) =>
    set((state) => {
      if (!state.activeReport) return state;
      return {
        activeReport: {
          ...state.activeReport,
          ...data,
          updatedAt: new Date().toISOString(),
        },
      };
    }),

  addBlock: (sectionId, block) =>
    set((state) => {
      if (!state.activeReport) return state;
      return {
        activeReport: {
          ...state.activeReport,
          sections: mapSection(state.activeReport.sections, sectionId, (blocks) =>
            reindexBlocks([...blocks, block]),
          ),
        },
      };
    }),

  updateBlock: (sectionId, blockId, updates) =>
    set((state) => {
      if (!state.activeReport) return state;
      return {
        activeReport: {
          ...state.activeReport,
          sections: mapSection(state.activeReport.sections, sectionId, (blocks) =>
            blocks.map((b) =>
              b.id === blockId ? ({ ...b, ...updates } as M6ReportBlock) : b,
            ),
          ),
        },
      };
    }),

  removeBlock: (sectionId, blockId) =>
    set((state) => {
      if (!state.activeReport) return state;
      return {
        activeReport: {
          ...state.activeReport,
          sections: mapSection(state.activeReport.sections, sectionId, (blocks) =>
            reindexBlocks(blocks.filter((b) => b.id !== blockId)),
          ),
        },
      };
    }),

  reorderBlocks: (sectionId, startIndex, endIndex) =>
    set((state) => {
      if (!state.activeReport) return state;
      return {
        activeReport: {
          ...state.activeReport,
          sections: mapSection(state.activeReport.sections, sectionId, (blocks) => {
            const result = [...blocks];
            const [moved] = result.splice(startIndex, 1);
            result.splice(endIndex, 0, moved);
            return reindexBlocks(result);
          }),
        },
      };
    }),

  publishReport: () =>
    set((state) => {
      if (!state.activeReport) return state;
      return {
        activeReport: {
          ...state.activeReport,
          status: 'published',
          publishedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };
    }),
}));
