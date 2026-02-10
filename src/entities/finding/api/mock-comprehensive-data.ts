import type {
  ComprehensiveFinding,
  FindingSecret,
  ActionPlan,
  FindingComment,
  FindingHistory,
} from '../model/types';

// Mock Comprehensive Findings (Module 5 format)
export const mockComprehensiveFindings: ComprehensiveFinding[] = [
  {
    id: 'find-001',
    tenant_id: 'tenant-001',
    engagement_id: 'eng-001',
    code: 'AUD-2025-SR-04',
    title: 'Kasa İşlemlerinde Çift Anahtar Kuralı İhlali',
    severity: 'CRITICAL',
    state: 'IN_NEGOTIATION',
    status: 'OPEN',

    impact_score: 5,
    likelihood_score: 4,
    gias_category: 'Operasyonel Risk',
    financial_impact: 69200000,

    description: 'Yapılan incelemede, 12.01.2025 tarihli kasa açış işleminde tek personelin yetkilisi olmadan kasaya erişim sağladığı tespit edilmiştir.',

    auditee_id: 'auditee-001',
    auditee_department: 'Şube Müdürlüğü',

    negotiation_started_at: '2025-12-15T09:00:00Z',
    created_at: '2025-12-10T14:30:00Z',
    updated_at: '2025-12-15T14:45:00Z',

    // Secrets (5-Whys RCA)
    secrets: {
      id: 'secret-001',
      tenant_id: 'tenant-001',
      finding_id: 'find-001',
      why_1: 'Kasa güvenlik zafiyeti gözlemlendi',
      why_2: 'Personel çift anahtar prosedürünü atladı',
      why_3: 'Yöneticinin tatil olması sebebiyle yedek prosedür işletilemedi',
      why_4: 'Yetkisiz erişim alarmı çalışmadı',
      why_5: 'Güvenlik sistemleri yetersiz bakım görüyor',
      root_cause_summary: 'Kasa güvenlik altyapısının eksik bakımı ve vekalet süreçlerinde prosedür boşluğu',
      internal_notes: 'CCTV kayıtlarında personel tek başına kasaya erişim sağlamıştır. İşlem personeli Ahmet Yılmaz.',
      auditor_only_comments: 'Benzer durum geçmiş yıl denetiminde de gözlenmişti fakat iyileştirme yapılmamış.',
      technical_details: {
        risk_tier: 'Tier 1',
        control_id: 'CTRL-CS-09',
      },
      created_at: '2025-12-10T14:30:00Z',
      updated_at: '2025-12-15T10:00:00Z',
    } as FindingSecret,

    // Action Plans
    action_plans: [
      {
        id: 'action-001',
        tenant_id: 'tenant-001',
        finding_id: 'find-001',
        title: 'Personele ek eğitim verilmesi',
        description: 'Tüm şube personeline çift anahtar kuralı ve yetkisiz erişim ile ilgili ek eğitim düzenlenecek.',
        responsible_person: 'Mehmet Yılmaz',
        responsible_person_title: 'Şube Müdürü',
        responsible_department: 'Merkez Şube',
        target_date: '2026-02-15',
        status: 'IN_REVIEW',
        priority: 'HIGH',
        progress_percentage: 30,
        auditee_response: 'Eğitim takvimi hazırlanmış olup 28 Şubat tarihine kadar tamamlanacaktır.',
        auditee_agreed: true,
        auditee_agreed_at: '2025-12-15T11:00:00Z',
        created_at: '2025-12-15T10:30:00Z',
        updated_at: '2025-12-16T09:15:00Z',
      } as ActionPlan,
      {
        id: 'action-002',
        tenant_id: 'tenant-001',
        finding_id: 'find-001',
        title: 'Güvenlik alarm sistemleri bakımı',
        description: 'Yetkisiz erişim alarmlarının arızası giderilecek ve periyodik bakım takvimine eklenecek.',
        responsible_person: 'Ayşe Demir',
        responsible_person_title: 'IT Güvenlik Sorumlusu',
        responsible_department: 'Bilgi Teknolojileri',
        target_date: '2026-01-31',
        status: 'APPROVED',
        priority: 'CRITICAL',
        progress_percentage: 65,
        milestones: [
          { id: 1, title: 'Arıza tespiti', completed: true, date: '2025-12-18' },
          { id: 2, title: 'Yedek parça temini', completed: true, date: '2025-12-22' },
          { id: 3, title: 'Kurulum ve test', completed: false, date: '2026-01-15' },
        ],
        auditee_response: 'Alarm sistemi arızası tespit edildi. Yedek parça temin edilmiş olup kurulum aşamasında.',
        auditee_agreed: true,
        created_at: '2025-12-15T11:00:00Z',
        updated_at: '2025-12-20T16:30:00Z',
      } as ActionPlan,
    ],

    // Comments
    comments: [
      {
        id: 'comment-001',
        tenant_id: 'tenant-001',
        finding_id: 'find-001',
        comment_text: 'Bulguda belirtilen 12.01.2025 tarihli olay incelenmiştir. Personel gerçekten yetkilisi tatilde olması sebebiyle tek başına kasaya erişmiş.',
        comment_type: 'DISCUSSION',
        author_id: 'auditor-001',
        author_role: 'AUDITOR',
        author_name: 'Ahmet Aslan',
        created_at: '2025-12-15T09:30:00Z',
        updated_at: '2025-12-15T09:30:00Z',
        is_deleted: false,
      } as FindingComment,
      {
        id: 'comment-002',
        tenant_id: 'tenant-001',
        finding_id: 'find-001',
        comment_text: 'Durum ile ilgili açıklama: Personel yönetici (Mehmet Yılmaz) üç günlük izinde iken acil nakit ihtiyacı nedeniyle kasaya tek başına erişmek zorunda kalmıştır. Bu durumun bir daha yaşanmaması için vekalet prosedürleri gözden geçirilmektedir.',
        comment_type: 'CLARIFICATION',
        author_id: 'auditee-001',
        author_role: 'AUDITEE',
        author_name: 'Fatma Kaya',
        created_at: '2025-12-15T10:15:00Z',
        updated_at: '2025-12-15T10:15:00Z',
        is_deleted: false,
      } as FindingComment,
      {
        id: 'comment-003',
        tenant_id: 'tenant-001',
        finding_id: 'find-001',
        comment_text: 'Aksiyon planları yeterli. Ancak alarm sistemi bakımının 31 Ocak\'a kadar tamamlanması kritik önemde.',
        comment_type: 'AGREEMENT',
        author_id: 'auditor-002',
        author_role: 'AUDIT_MANAGER',
        author_name: 'Zeynep Şahin',
        created_at: '2025-12-16T08:00:00Z',
        updated_at: '2025-12-16T08:00:00Z',
        is_deleted: false,
      } as FindingComment,
    ],

    // History
    history: [
      {
        id: 'hist-001',
        tenant_id: 'tenant-001',
        finding_id: 'find-001',
        previous_state: 'DRAFT',
        new_state: 'IN_NEGOTIATION',
        change_type: 'STATE_CHANGE',
        change_description: 'Bulgu müzakereye açıldı',
        changed_by: 'auditor-001',
        changed_by_role: 'AUDITOR',
        changed_at: '2025-12-15T09:00:00Z',
      } as FindingHistory,
      {
        id: 'hist-002',
        tenant_id: 'tenant-001',
        finding_id: 'find-001',
        new_state: 'IN_NEGOTIATION',
        change_type: 'ACTION_PLAN_ADDED',
        change_description: 'İlk aksiyon planı eklendi: Personele ek eğitim',
        changed_by: 'auditee-001',
        changed_by_role: 'AUDITEE',
        changed_at: '2025-12-15T10:30:00Z',
      } as FindingHistory,
      {
        id: 'hist-003',
        tenant_id: 'tenant-001',
        finding_id: 'find-001',
        new_state: 'IN_NEGOTIATION',
        change_type: 'COMMENT_ADDED',
        change_description: 'Denetlenen açıklama ekledi',
        changed_by: 'auditee-001',
        changed_by_role: 'AUDITEE',
        changed_at: '2025-12-15T10:15:00Z',
      } as FindingHistory,
    ],
  },
  {
    id: 'find-002',
    tenant_id: 'tenant-001',
    engagement_id: 'eng-001',
    code: 'AUD-2025-SR-05',
    title: 'Şifrelenm Gösterge Tamiri',
    severity: 'HIGH',
    state: 'AGREED',
    status: 'OPEN',

    impact_score: 4,
    likelihood_score: 3,
    gias_category: 'BT Güvenliği',

    description: 'Personel iş istasyonu yedeklerinde müşteri verilerinin şifrelenmeden saklandığı tespit edilmiştir.',

    auditee_id: 'auditee-002',
    auditee_department: 'IT Departmanı',

    negotiation_started_at: '2025-12-14T10:00:00Z',
    agreed_at: '2025-12-16T15:00:00Z',
    created_at: '2025-12-09T11:00:00Z',
    updated_at: '2025-12-16T15:00:00Z',

    action_plans: [
      {
        id: 'action-003',
        tenant_id: 'tenant-001',
        finding_id: 'find-002',
        title: 'Veri şifreleme politikası uygulanması',
        description: 'Tüm yedekleme sistemlerine AES-256 şifreleme standardı uygulanacak.',
        responsible_person: 'Can Öztürk',
        responsible_person_title: 'IT Güvenlik Müdürü',
        responsible_department: 'Bilgi Teknolojileri',
        target_date: '2026-02-28',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        progress_percentage: 45,
        auditee_agreed: true,
        created_at: '2025-12-14T12:00:00Z',
        updated_at: '2025-12-18T10:00:00Z',
      } as ActionPlan,
    ],

    comments: [],
    history: [],
  },
  {
    id: 'find-003',
    tenant_id: 'tenant-001',
    engagement_id: 'eng-001',
    code: 'AUD-2025-SR-06',
    title: 'Safe Combination Record Keeping',
    severity: 'MEDIUM',
    state: 'DRAFT',
    status: 'DRAFT',

    impact_score: 3,
    likelihood_score: 2,
    gias_category: 'İç Kontrol',

    description: 'Şube defterinde kayıt altına alınmayan işlemler tespit edilmiştir.',

    created_at: '2025-12-20T09:00:00Z',
    updated_at: '2025-12-20T09:00:00Z',

    action_plans: [],
    comments: [],
    history: [],
  },
];

export const mockActionPlans: ActionPlan[] = mockComprehensiveFindings.flatMap(
  (f) => f.action_plans || []
);

export const mockFindingComments: FindingComment[] = mockComprehensiveFindings.flatMap(
  (f) => f.comments || []
);
