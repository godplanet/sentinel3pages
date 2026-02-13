import { create } from 'zustand';

export interface ParameterItem {
  id: string;
  label: string;
}

interface ParameterState {
  giasCategories: ParameterItem[];
  rcaCategories: ParameterItem[];
  riskTypes: ParameterItem[];

  addGiasCategory: (label: string) => void;
  removeGiasCategory: (id: string) => void;

  addRcaCategory: (label: string) => void;
  removeRcaCategory: (id: string) => void;

  addRiskType: (label: string) => void;
  removeRiskType: (id: string) => void;
}

export const useParameterStore = create<ParameterState>((set) => ({
  giasCategories: [
    { id: 'gias-1', label: 'Operasyonel Risk' },
    { id: 'gias-2', label: 'Uyum Riski' },
    { id: 'gias-3', label: 'Finansal Risk' },
    { id: 'gias-4', label: 'Teknolojik Risk' },
  ],
  rcaCategories: [
    { id: 'rca-1', label: 'İnsan Hatası / Farkındalık Eksikliği' },
    { id: 'rca-2', label: 'Sistem / Altyapı / Yazılım Hatası' },
    { id: 'rca-3', label: 'Süreç Tasarımı / Prosedür Eksikliği' },
    { id: 'rca-4', label: 'Dış Etken / Üçüncü Taraf' },
  ],
  riskTypes: [
    { id: 'operational', label: 'Operasyonel Risk' },
    { id: 'legal', label: 'Yasal / Uyum Riski' },
    { id: 'reputation', label: 'İtibar Riski' },
    { id: 'credit', label: 'Kredi Riski' },
    { id: 'market', label: 'Piyasa Riski' },
    { id: 'cyber', label: 'Siber / Bilgi Güvenliği Riski' },
  ],

  addGiasCategory: (label) => set((state) => ({
    giasCategories: [...state.giasCategories, { id: Math.random().toString(36).substring(7), label }]
  })),
  removeGiasCategory: (id) => set((state) => ({
    giasCategories: state.giasCategories.filter(i => i.id !== id)
  })),

  addRcaCategory: (label) => set((state) => ({
    rcaCategories: [...state.rcaCategories, { id: Math.random().toString(36).substring(7), label }]
  })),
  removeRcaCategory: (id) => set((state) => ({
    rcaCategories: state.rcaCategories.filter(i => i.id !== id)
  })),

  addRiskType: (label) => set((state) => ({
    riskTypes: [...state.riskTypes, { id: Math.random().toString(36).substring(7), label }]
  })),
  removeRiskType: (id) => set((state) => ({
    riskTypes: state.riskTypes.filter(i => i.id !== id)
  })),
}));