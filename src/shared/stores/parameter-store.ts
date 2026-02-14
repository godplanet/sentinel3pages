import { create } from 'zustand';

// TİP TANIMLARI
export interface ParameterOption {
  value: string;
  label: string;
  color?: string;
  description?: string;
}

export interface ParameterItem {
  id: string;
  label: string;
}

interface ParameterState {
  // Veri Listeleri
  severities: ParameterOption[];
  statuses: ParameterOption[];
  giasCategories: ParameterItem[];
  rcaCategories: ParameterItem[];
  riskTypes: ParameterItem[];

  // Fonksiyonlar
  getSeverityColor: (value: string | undefined) => string;
  getStatusColor: (value: string | undefined) => string;
  getStatusLabel: (value: string | undefined) => string;
  
  // State Güncelleyiciler
  addGiasCategory: (label: string) => void;
  removeGiasCategory: (id: string) => void;
}

export const useParameterStore = create<ParameterState>((set, get) => ({
  // --- RİSK SEVİYELERİ ---
  severities: [
    { value: 'CRITICAL', label: 'Kritik', color: 'bg-red-600 text-white border-red-700 shadow-sm' },
    { value: 'HIGH', label: 'Yüksek', color: 'bg-orange-500 text-white border-orange-600 shadow-sm' },
    { value: 'MEDIUM', label: 'Orta', color: 'bg-amber-500 text-white border-amber-600 shadow-sm' },
    { value: 'LOW', label: 'Düşük', color: 'bg-blue-500 text-white border-blue-600 shadow-sm' },
    { value: 'OBSERVATION', label: 'Gözlem', color: 'bg-slate-500 text-white border-slate-600 shadow-sm' }
  ],

  // --- DURUMLAR ---
  statuses: [
    { value: 'DRAFT', label: 'Taslak', color: 'bg-slate-100 text-slate-700' },
    { value: 'IN_REVIEW', label: 'İncelemede', color: 'bg-purple-100 text-purple-700' },
    { value: 'NEGOTIATION', label: 'Müzakere', color: 'bg-amber-100 text-amber-700' },
    { value: 'PENDING_APPROVAL', label: 'Onay Bekliyor', color: 'bg-orange-100 text-orange-700' },
    { value: 'PUBLISHED', label: 'Yayınlandı', color: 'bg-blue-100 text-blue-700' },
    { value: 'FINAL', label: 'Final', color: 'bg-emerald-100 text-emerald-700' },
    { value: 'CLOSED', label: 'Kapalı', color: 'bg-gray-800 text-gray-200' }
  ],

  // --- KATEGORİLER ---
  giasCategories: [
    { id: 'gias-1', label: 'Operasyonel Risk' },
    { id: 'gias-2', label: 'Uyum Riski' },
    { id: 'gias-3', label: 'Finansal Risk' },
    { id: 'gias-4', label: 'Teknolojik Risk' },
    { id: 'gias-5', label: 'İtibar Riski' }
  ],
  
  rcaCategories: [
    { id: 'rca-1', label: 'İnsan Hatası' },
    { id: 'rca-2', label: 'Süreç Eksikliği' },
    { id: 'rca-3', label: 'Sistem Hatası' },
    { id: 'rca-4', label: 'Dış Faktör' }
  ],

  riskTypes: [
    { id: 'operational', label: 'Operasyonel' },
    { id: 'credit', label: 'Kredi' },
    { id: 'market', label: 'Piyasa' }
  ],

  // --- YARDIMCI FONKSİYONLAR ---
  getSeverityColor: (value) => {
    if (!value) return 'bg-slate-100 text-slate-500';
    const item = get().severities.find(s => s.value === value);
    return item?.color || 'bg-slate-100 text-slate-500';
  },

  getStatusColor: (value) => {
    if (!value) return 'bg-slate-50 text-slate-400';
    const item = get().statuses.find(s => s.value === value);
    return item?.color || 'bg-slate-50 text-slate-400';
  },

  getStatusLabel: (value) => {
    if (!value) return '-';
    const item = get().statuses.find(s => s.value === value);
    return item?.label || value;
  },

  addGiasCategory: (label) => set((state) => ({ 
    giasCategories: [...state.giasCategories, { id: Math.random().toString(36).substr(2, 9), label }] 
  })),

  removeGiasCategory: (id) => set((state) => ({ 
    giasCategories: state.giasCategories.filter(i => i.id !== id) 
  }))
}));