export interface AuditorProfile {
  id: string;
  name: string;
  role: 'Chief Audit Executive' | 'Audit Manager' | 'Senior Auditor' | 'Auditor' | 'Specialist';
  skills: string[]; // CISA, CIA, SQL, Python, Fraud Investigation vb.
  utilizationRate: number; // Doluluk oranı % (TalentOS için kritik)
  avatarUrl?: string;
  location: string;
  email?: string;
}

export const MOCK_AUDITORS: AuditorProfile[] = [
  {
    id: 'u1',
    name: 'Ahmet Yılmaz',
    role: 'Audit Manager',
    skills: ['CISA', 'CRISC', 'Strategic Planning', 'Risk Management'],
    utilizationRate: 85,
    location: 'İstanbul - GM',
    avatarUrl: 'https://i.pravatar.cc/150?img=12'
  },
  {
    id: 'u2',
    name: 'Ayşe Demir',
    role: 'Senior Auditor',
    skills: ['CIA', 'Accounting', 'Fraud Investigation', 'IFRS'],
    utilizationRate: 92, // Yüksek yük!
    location: 'İstanbul - GM',
    avatarUrl: 'https://i.pravatar.cc/150?img=45'
  },
  {
    id: 'u3',
    name: 'Mehmet Öz',
    role: 'Specialist',
    skills: ['Python', 'SQL', 'Data Analytics', 'Cybersecurity', 'Penetration Testing'],
    utilizationRate: 60,
    location: 'Ankara - Bölge',
    avatarUrl: 'https://i.pravatar.cc/150?img=33'
  },
  {
    id: 'u4',
    name: 'Zeynep Kaya',
    role: 'Auditor',
    skills: ['Branch Ops', 'Credit Risk', 'Internal Controls'],
    utilizationRate: 40, // Müsait
    location: 'İzmir - Bölge',
    avatarUrl: 'https://i.pravatar.cc/150?img=47'
  },
  {
    id: 'u5',
    name: 'Can Öztürk',
    role: 'Compliance Auditor',
    skills: ['MASAK', 'AML', 'Regulatory Compliance', 'Legal'],
    utilizationRate: 75,
    location: 'İstanbul - GM',
    avatarUrl: 'https://i.pravatar.cc/150?img=68'
  },
  {
    id: 'u6',
    name: 'Elif Yıldız',
    role: 'Auditor',
    skills: ['Retail Banking', 'Operational Risk'],
    utilizationRate: 55,
    location: 'Bursa - Bölge',
    avatarUrl: 'https://i.pravatar.cc/150?img=5'
  },
  {
    id: 'u7',
    name: 'Murat Şen',
    role: 'Senior Auditor',
    skills: ['IT Audit', 'COBIT', 'Cloud Security'],
    utilizationRate: 20, // Çok müsait
    location: 'İstanbul - GM',
    avatarUrl: 'https://i.pravatar.cc/150?img=11'
  }
];