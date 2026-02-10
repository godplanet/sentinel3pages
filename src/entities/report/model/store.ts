import { create } from 'zustand';
import type { Report, ReportBlock, ReportTemplate, ReportComment } from './types';
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
