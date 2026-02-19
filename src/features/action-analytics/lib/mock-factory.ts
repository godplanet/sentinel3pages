import type {
  ActionAgingMetrics,
  AgingTier,
  ActionStatus,
} from '@/entities/action/model/types';

export const DEPARTMENTS = [
  { id: 'dept-kredi',   name: 'Kurumsal Kredi'      },
  { id: 'dept-uyum',    name: 'Uyum & Regülasyon'   },
  { id: 'dept-it',      name: 'IT Risk & Güvenlik'   },
  { id: 'dept-ops',     name: 'Operasyon Yönetimi'   },
  { id: 'dept-hazine',  name: 'Hazine'               },
  { id: 'dept-retail',  name: 'Bireysel Bankacılık'  },
  { id: 'dept-cibs',    name: 'CIB & Kurumsal'       },
  { id: 'dept-kobi',    name: 'KOBİ Bankacılığı'     },
];

export const DEPT_ID_TO_NAME: Record<string, string> = Object.fromEntries(
  DEPARTMENTS.map((d) => [d.id, d.name]),
);

const SEVERITIES   = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
const STATUSES: ActionStatus[] = ['pending', 'evidence_submitted', 'review_rejected', 'risk_accepted', 'closed'];
const CATEGORIES   = ['Risk Yönetimi', 'Operasyonel', 'Uyum', 'IT Kontrolleri', 'Finansal Raporlama', 'Hazine'];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function addDays(date: Date, days: number): string {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function deriveAgingTier(perfDelay: number): AgingTier {
  if (perfDelay > 364) return 'TIER_4_BDDK_RED_ZONE';
  if (perfDelay > 90)  return 'TIER_3_CRITICAL';
  if (perfDelay > 30)  return 'TIER_2_HIGH';
  return 'TIER_1_NORMAL';
}

export function generateMockActions(count: number): ActionAgingMetrics[] {
  const now  = new Date();
  const rows: ActionAgingMetrics[] = [];

  for (let i = 0; i < count; i++) {
    const dept       = pick(DEPARTMENTS);
    const severity   = pick(SEVERITIES);
    const category   = pick(CATEGORIES);
    const status     = pick(STATUSES);

    const createdDaysAgo      = rand(30, 900);
    const createdAt           = new Date(now);
    createdAt.setDate(createdAt.getDate() - createdDaysAgo);

    const originalOffset      = rand(30, 180);
    const originalDueDate     = addDays(createdAt, originalOffset);

    const extensionDays       = Math.random() < 0.4 ? rand(30, 120) : 0;
    const currentDueDate      = addDays(new Date(originalDueDate), extensionDays);

    const perfDelay           = Math.max(0, Math.floor(
      (now.getTime() - new Date(originalDueDate).getTime()) / 86_400_000,
    ));
    const opDelay             = Math.max(0, Math.floor(
      (now.getTime() - new Date(currentDueDate).getTime())  / 86_400_000,
    ));

    const tier                = deriveAgingTier(perfDelay);
    const isBddkCandidate     = tier === 'TIER_4_BDDK_RED_ZONE' && Math.random() < 0.65;
    const regulatoryTags      = isBddkCandidate
      ? ['BDDK', 'BRSA']
      : Math.random() < 0.3 ? ['BRSA'] : [];

    rows.push({
      id:                       `mock-${String(i).padStart(6, '0')}`,
      finding_id:               `find-${String(i).padStart(6, '0')}`,
      original_due_date:        originalDueDate,
      current_due_date:         currentDueDate,
      closed_at:                status === 'closed' ? addDays(now, -rand(1, 30)) : undefined,
      status,
      finding_snapshot: {
        finding_id:  `find-${String(i).padStart(6, '0')}`,
        title:       `${category} — ${dept.name} Kontrol Bulgusu #${i}`,
        severity,
        risk_rating: severity === 'CRITICAL' ? 'Yüksek' : 'Orta',
        gias_category: category,
        created_at:  createdAt.toISOString(),
      },
      assignee_unit_id:         dept.id,
      regulatory_tags:          regulatoryTags,
      escalation_level:         tier === 'TIER_4_BDDK_RED_ZONE' ? pick([1, 2, 3]) : 0,
      created_at:               createdAt.toISOString(),
      updated_at:               new Date(now.getTime() - rand(0, 5) * 86_400_000).toISOString(),
      performance_delay_days:   perfDelay,
      operational_delay_days:   opDelay,
      aging_tier:               tier,
      is_bddk_breach:           isBddkCandidate,
      evidence_count:           rand(0, 5),
      pending_requests:         rand(0, 3),
    });
  }

  return rows;
}
