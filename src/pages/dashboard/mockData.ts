import type { WelcomeSummary, AIBrief, DashboardKPI, KPICard, MyTask, SystemActivity } from '@/entities/dashboard/model/types';

export const mockWelcome: WelcomeSummary = {
  userName: 'Hakan Yılmaz',
  role: 'İç Denetim Başkanı',
  welcomeMessage: 'Hoş geldiniz, Sayın Başkan.',
  systemHealth: 98,
  lastLogin: 'Bugün, 09:15',
};

export const mockAIBrief: AIBrief = {
  headline: 'Kredi tahsis sürecinde son 24 saatte 3 adet limit aşımı tespit edildi',
  summary:
    'Operasyonel risk skoru %1.2 arttı. Özellikle Hazine operasyonlarında limit aşımları ve manuel müdahale oranlarında belirgin artış gözlemlendi. Kredi onay süreçlerinde gecikme riski yükselişte.',
  context: 'Sentinel Brain • Günlük Tarama',
  sentiment: 'critical',
};

export const mockKPIs: DashboardKPI[] = [
  {
    id: 'risk-score',
    label: 'Kurumsal Risk Skoru',
    value: '8.4',
    trendDirection: 'down',
    trendColor: 'red',
  },
  {
    id: 'plan-progress',
    label: 'Yıllık Plan İlerleme',
    value: '%68',
    trendDirection: 'up',
    trendColor: 'green',
  },
  {
    id: 'open-findings',
    label: 'Açık Kritik Bulgu',
    value: '12',
    trendDirection: 'flat',
    trendColor: 'gray',
  },
  {
    id: 'talent-score',
    label: 'Ekip Yetkinlik Skoru',
    value: '92',
    trendDirection: 'up',
    trendColor: 'green',
  },
];

export const mockKPICards: KPICard[] = [
  {
    id: 'risk-score',
    label: 'Kurumsal Risk Skoru',
    value: '8.4',
    trend: 'up',
    status: 'danger',
  },
  {
    id: 'plan-progress',
    label: 'Yıllık Plan İlerleme',
    value: '42%',
    trend: 'up',
    status: 'warning',
  },
  {
    id: 'open-findings',
    label: 'Açık Kritik Bulgular',
    value: '142',
    trend: 'down',
    status: 'warning',
  },
  {
    id: 'talent-score',
    label: 'Yetenek Skoru',
    value: '85%',
    trend: 'up',
    status: 'success',
  },
];

export const mockTasks: MyTask[] = [
  {
    id: 'task-1',
    title: '2026 Yılı Denetim Planı Onayı',
    deadline: 'Bugün, 17:00',
    type: 'approval',
    status: 'pending',
    priority: 'high',
  },
  {
    id: 'task-2',
    title: 'Kredi Portföy Denetimi - Nihai Rapor İncelemesi',
    deadline: 'Yarın, 14:00',
    type: 'review',
    status: 'pending',
    priority: 'high',
  },
  {
    id: 'task-3',
    title: 'Hazine Denetimi Kapanış Toplantısı',
    deadline: 'Bugün, 15:30',
    type: 'meeting',
    status: 'in-progress',
    priority: 'high',
  },
  {
    id: 'task-4',
    title: 'BDDK Rapor Taslağı İncelemesi',
    deadline: '3 Şubat',
    type: 'review',
    status: 'pending',
    priority: 'medium',
  },
  {
    id: 'task-5',
    title: 'Q4 Bulgu Kapatma Onayları',
    deadline: '5 Şubat',
    type: 'approval',
    status: 'pending',
    priority: 'medium',
  },
  {
    id: 'task-6',
    title: 'Yetenek Matrisi İnceleme Toplantısı',
    deadline: 'Gelecek Hafta',
    type: 'meeting',
    status: 'pending',
    priority: 'low',
  },
];

export const mockActivities: SystemActivity[] = [
  {
    id: 'act-1',
    userName: 'Ahmet Yılmaz',
    action: 'yeni bir bulgu ekledi',
    target: 'Kredi Dosyası Eksikliği',
    timestamp: '2 dk önce',
    type: 'finding',
  },
  {
    id: 'act-2',
    userName: 'Zeynep Kaya',
    action: 'rapor tamamladı',
    target: 'Operasyonel Risk Denetimi - Q1 2026',
    timestamp: '15 dk önce',
    type: 'report',
  },
  {
    id: 'act-3',
    userName: 'Mehmet Demir',
    action: 'denetim planına ekledi',
    target: 'Şube Nakit Yönetimi İncelemesi',
    timestamp: '1 saat önce',
    type: 'plan',
  },
  {
    id: 'act-4',
    userName: 'Ayşe Şahin',
    action: 'yeni bir bulgu ekledi',
    target: 'Limit Aşımı - Kurumsal Müşteri',
    timestamp: '2 saat önce',
    type: 'finding',
  },
  {
    id: 'act-5',
    userName: 'Can Öztürk',
    action: 'rapor tamamladı',
    target: 'BT Altyapı Güvenlik Denetimi',
    timestamp: '3 saat önce',
    type: 'report',
  },
  {
    id: 'act-6',
    userName: 'Elif Arslan',
    action: 'denetim planına ekledi',
    target: 'Uyumluluk Testleri - BDDK',
    timestamp: '4 saat önce',
    type: 'plan',
  },
];
