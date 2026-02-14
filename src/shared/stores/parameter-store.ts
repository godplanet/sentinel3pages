import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface RiskParameter {
  id: string;
  name: string;
  value: number;
  description?: string;
}

export interface SystemParameter {
  id: string;
  key: string;
  value: string | number | boolean;
  category: string;
}

interface ParameterState {
  riskParameters: RiskParameter[];
  systemParameters: SystemParameter[];

  setRiskParameter: (id: string, value: number) => void;
  setSystemParameter: (key: string, value: string | number | boolean) => void;

  getRiskParameter: (id: string) => RiskParameter | undefined;
  getSystemParameter: (key: string) => SystemParameter | undefined;
}

export const useParameterStore = create<ParameterState>()(
  persist(
    (set, get) => ({
      riskParameters: [],
      systemParameters: [],

      setRiskParameter: (id: string, value: number) => {
        set((state) => ({
          riskParameters: state.riskParameters.map((param) =>
            param.id === id ? { ...param, value } : param
          ),
        }));
      },

      setSystemParameter: (key: string, value: string | number | boolean) => {
        set((state) => ({
          systemParameters: state.systemParameters.map((param) =>
            param.key === key ? { ...param, value } : param
          ),
        }));
      },

      getRiskParameter: (id: string) => {
        return get().riskParameters.find((param) => param.id === id);
      },

      getSystemParameter: (key: string) => {
        return get().systemParameters.find((param) => param.key === key);
      },
    }),
    {
      name: 'sentinel-parameter-storage',
    }
  )
);
