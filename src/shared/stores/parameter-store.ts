import { create } from 'zustand';

// --- TİP TANIMLARI ---
export interface ParameterOption {
  value: string;
  label: string;
  color?: string; // UI'da (Badge, Border) kullanılacak renk sınıfı
  description?: string; // Tooltip veya yardım metni için
  icon?: string; // İkon adı (Lucide)
}

interface ParameterState {
  // Veri Setleri
  severities: ParameterOption[];
  statuses: ParameterOption[];
  giasCategories: ParameterOption[];
  auditTypes: ParameterOption[];
  rootCauseCategories: ParameterOption[];
  
  // Aksiyonlar
  getSeverityColor: (value: string) => string;
  getStatusLabel: (value: string) => string;
  initParameters: () => void; // Veritabanından çekme simülasyonu
}

// --- SABİT VERİLER (VERİTABANI SİMÜLASYONU) ---
// Yarın burası Supabase'den 'system_definitions' tablosundan gelecek.

const INITIAL_SEVERITIES: ParameterOption[] = [
  { value: 'CRITICAL', label: 'Kritik', color: 'bg-red-600 text-white', description: 'Kurumun sürekliliğini tehdit eden, acil müdahale gerektiren risk.' },
  { value: 'HIGH', label: 'Yüksek', color: 'bg-orange-500 text-white', description: 'Önemli finansal veya itibar kaybına yol açabilecek risk.' },
  { value: 'MEDIUM', label: 'Orta', color: 'bg-amber-500 text-white', description: 'Süreç aksamalarına neden olabilecek, yönetilebilir risk.' },
  { value: 'LOW', label: 'Düşük', color: 'bg-blue-500 text-white', description: 'İzlenmesi gereken, düşük etkili bulgu.' },
  { value: 'OBSERVATION', label: 'Gözlem', color: 'bg-slate-500 text-white', description: 'Risk teşkil etmeyen, süreç iyileştirme önerisi.' }
];

const INITIAL_STATUSES: ParameterOption[] = [
  { value: 'DRAFT', label: 'Taslak', color: 'bg-slate-100 text-slate-600' },
  { value: 'NEGOTIATION', label: 'Müzakere (Denetlenen)', color: 'bg-purple-100 text-purple-700' },
  { value: 'PENDING_APPROVAL', label: 'Yönetici Onayı', color: 'bg-amber-100 text-amber-700' },
  { value: 'PUBLISHED', label: 'Yayınlandı (Mutabık)', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'DISPUTED', label: 'Uyuşmazlık', color: 'bg-red-100 text-red-700' },
  { value: 'CLOSED', label: 'Kapatıldı', color: 'bg-gray-800 text-white' }
];

const INITIAL_GIAS_CATEGORIES: ParameterOption[] = [
  { value: 'OPERATIONAL', label: 'Operasyonel Risk', color: 'text-blue-700' },
  { value: 'COMPLIANCE', label: 'Uyum Riski', color: 'text-red-700' },
  { value: 'FINANCIAL', label: 'Finansal Risk', color: 'text-emerald-700' },
  { value: 'TECHNOLOGY', label: 'Teknolojik Risk', color: 'text-indigo-700' },
  { value: 'GOVERNANCE', label: 'Yönetişim', color: 'text-slate-700' },
  { value: 'CYBERSECURITY', label: 'BT Güvenliği', color: 'text-fuchsia-700' }
];

const INITIAL_ROOT_CAUSES: ParameterOption[] = [
  { value: 'PEOPLE', label: 'İnsan Hatası / Bilgi Eksikliği', description: 'Eğitim eksikliği, dikkatsizlik veya ihmal.' },
  { value: 'PROCESS', label: 'Süreç Tasarım Hatası', description: 'Prosedür eksikliği, hatalı iş akışı veya kontrol yetersizliği.' },
  { value: 'SYSTEM', label: 'Sistem / Altyapı Sorunu', description: 'Yazılım hatası, entegrasyon sorunu veya donanım arızası.' },
  { value: 'EXTERNAL', label: 'Dış Faktörler', description: 'Mevzuat değişikliği, piyasa koşulları veya tedarikçi kaynaklı.' }
];

// --- STORE OLUŞTURMA ---
export const useParameterStore = create<ParameterState>((set, get) => ({
  severities: INITIAL_SEVERITIES,
  statuses: INITIAL_STATUSES,
  giasCategories: INITIAL_GIAS_CATEGORIES,
  auditTypes: [], // İhtiyaca göre doldurulabilir
  rootCauseCategories: INITIAL_ROOT_CAUSES,

  // Helper Fonksiyonlar (UI içinde logic kurmamak için)
  getSeverityColor: (value) => {
    const item = get().severities.find(s => s.value === value);
    return item?.color || 'bg-gray-400';
  },

  getStatusLabel: (value) => {
    const item = get().statuses.find(s => s.value === value);
    return item?.label || value;
  },

  // İleride buraya "fetchFromSupabase" eklenecek
  initParameters: () => {
    // API Call simülasyonu
    console.log('Parametreler sistemden yüklendi.'); 
  }
}));