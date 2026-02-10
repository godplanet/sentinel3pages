import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type BrainMode = 'GENERATIVE' | 'COMPUTATIONAL' | 'IDLE';
export type Environment = 'PROD' | 'UAT' | 'DEV';

interface UIState {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;

  sidebarColor: string;
  setSidebarColor: (color: string) => void;

  environment: Environment;
  setEnvironment: (env: Environment) => void;

  isVDI: boolean;
  toggleVDI: () => void;

  isCmdBarOpen: boolean;
  toggleCmdBar: () => void;
  setCmdBarOpen: (open: boolean) => void;

  aiMode: BrainMode;
  setAIMode: (mode: BrainMode) => void;
  aiQuery: string;
  setAIQuery: (query: string) => void;

  isAuditeeMode: boolean;
  setAuditeeMode: (mode: boolean) => void;
}

export { usePersonaStore, PERSONAS } from './persona-store';
export type { PersonaRole, PersonaConfig } from './persona-store';

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      isSidebarOpen: true,
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

      sidebarColor: '#0f172a', // Varsayılan: Obsidian (PROD rengi)
      setSidebarColor: (color) => set({ sidebarColor: color }),

      environment: 'PROD',
      setEnvironment: (env) => set({ environment: env }),

      isVDI: false,
      toggleVDI: () => set((state) => ({ isVDI: !state.isVDI })),

      isCmdBarOpen: false,
      toggleCmdBar: () => set((state) => ({ isCmdBarOpen: !state.isCmdBarOpen })),
      setCmdBarOpen: (open) => set({ isCmdBarOpen: open }),

      aiMode: 'IDLE',
      setAIMode: (mode) => set({ aiMode: mode }),
      aiQuery: '',
      setAIQuery: (query) => set({ aiQuery: query }),

      isAuditeeMode: false,
      setAuditeeMode: (mode) => set({ isAuditeeMode: mode }),
    }),
    {
      name: 'sentinel-ui-storage',
    }
  )
);