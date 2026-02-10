import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type GradingScaleType = '5-POINT' | '4-POINT' | 'PERCENTAGE';

interface MethodologyState {
  gradingScale: GradingScaleType;

  gradeThresholds: {
    A: number;
    B: number;
    C: number;
    D: number;
  };

  setGradingScale: (scale: GradingScaleType) => void;
  updateThreshold: (grade: 'A'|'B'|'C'|'D', value: number) => void;
}

export const useMethodologyStore = create<MethodologyState>()(
  persist(
    (set) => ({
      gradingScale: '4-POINT',
      gradeThresholds: {
        A: 3.5,
        B: 2.5,
        C: 1.5,
        D: 0,
      },
      setGradingScale: (scale) => set({ gradingScale: scale }),
      updateThreshold: (grade, value) =>
        set((state) => ({ gradeThresholds: { ...state.gradeThresholds, [grade]: value } })),
    }),
    { name: 'sentinel-methodology-config' }
  )
);
