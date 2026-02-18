import { useEffect, useState } from 'react';
import { Lock, BookOpen, Layout, Monitor } from 'lucide-react';
import clsx from 'clsx';
import { useActiveReportStore } from '@/entities/report';
import { mockReport } from '@/entities/report/api/mock-data';
import { useFindingStore } from '@/entities/finding/model/store';
import type { ComprehensiveFinding } from '@/entities/finding/model/types';
import { LiquidGlassToolbar } from '@/features/report-editor/ui/LiquidGlassToolbar';
import { SectionNavigator } from '@/features/report-editor/ui/SectionNavigator';
import { ZenCanvas } from '@/features/report-editor/ui/ZenCanvas';
import { BlockPalette } from '@/features/report-editor/ui/BlockPalette';
import { ExecutiveSummaryStudio } from '@/features/report-editor/ui/ExecutiveSummaryStudio';
import { BoardBriefingCard } from '@/features/report-editor/ui/BoardBriefingCard';
import { WorkflowActionBar } from '@/features/report-editor/ui/WorkflowActionBar';

type TabId = 'executive' | 'canvas' | 'board';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'executive', label: 'Yönetici Özeti', icon: <BookOpen size={15} /> },
  { id: 'canvas', label: 'Detaylı Rapor', icon: <Layout size={15} /> },
  { id: 'board', label: 'YK Sunumu', icon: <Monitor size={15} /> },
];

const MOCK_FINDINGS: ComprehensiveFinding[] = [
  {
    id: 'find-001',
    tenant_id: 'mock-tenant',
    engagement_id: '10000000-0000-0000-0000-000000000003',
    code: 'F-2026-001',
    finding_code: 'F-2026-001',
    title: 'Kredi Limiti Onay Kontrolü Yetersizliği',
    severity: 'CRITICAL',
    state: 'PUBLISHED',
    impact_score: 87.5,
    detection_html:
      '<p>Kredi limitlerinin %23\'ü yetkisiz personel tarafından artırılmıştır. Toplam 147 işlem yetki matrisi dışında gerçekleştirilmiştir.</p>',
    impact_html:
      '<p>Potansiyel finansal kayıp: 12.4M TL. BDDK düzenleyici para cezası riski yüksek. İtibar hasarı ve müşteri güven kaybı muhtemel.</p>',
    created_at: '2026-01-15T10:00:00Z',
    updated_at: '2026-02-15T14:00:00Z',
    secrets: {
      finding_id: 'find-001',
      internal_notes: 'Şube müdürü ile 12 Şubat tarihinde gizlice görüşüldü.',
    },
    action_plans: [],
    comments: [],
    history: [],
  },
  {
    id: 'find-002',
    tenant_id: 'mock-tenant',
    engagement_id: '10000000-0000-0000-0000-000000000003',
    code: 'F-2026-002',
    finding_code: 'F-2026-002',
    title: 'KYC Dokümantasyon Eksiklikleri',
    severity: 'HIGH',
    state: 'NEGOTIATION',
    impact_score: 62.0,
    detection_html:
      '<p>147 aktif müşteri dosyasında güncel kimlik ve gelir belgesi bulunmamaktadır.</p>',
    impact_html:
      '<p>MASAK uyumsuzluk riski kritik seviyede. 5M TL\'ye varan para cezası potansiyeli mevcut.</p>',
    created_at: '2026-01-20T10:00:00Z',
    updated_at: '2026-02-10T09:00:00Z',
    secrets: {
      finding_id: 'find-002',
      internal_notes: 'Uyum ekibi bilgilendirildi.',
    },
    action_plans: [],
    comments: [],
    history: [],
  },
];

export default function ReportEditorPage() {
  const { activeReport, setActiveReport } = useActiveReportStore();
  const setFindings = useFindingStore((s) => s.setFindings);
  const [activeTab, setActiveTab] = useState<TabId>('executive');

  useEffect(() => {
    setActiveReport(mockReport);
    setFindings(MOCK_FINDINGS);
    return () => {
      setActiveReport(null);
    };
  }, [setActiveReport, setFindings]);

  const isLocked =
    activeReport?.status === 'published' || activeReport?.status === 'archived';
  const isEditable = !isLocked;

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-[#FDFBF7]">
      <LiquidGlassToolbar />

      {isLocked && (
        <div className="flex items-center justify-center gap-2 bg-amber-50 border-b border-amber-200 py-2 px-4">
          <Lock size={14} className="text-amber-600 flex-shrink-0" />
          <span className="text-xs font-sans font-semibold text-amber-700">
            Bu rapor kilitlenmiştir. Yayınlanmış raporlar düzenlenemez.
          </span>
        </div>
      )}

      <div className="bg-white border-b border-slate-200 px-6 flex-shrink-0">
        <div className="flex gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                'flex items-center gap-2 px-4 py-3 text-sm font-sans font-medium border-b-2 transition-colors',
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300',
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-20">
        {activeTab === 'executive' && (
          <ExecutiveSummaryStudio readOnly={!isEditable} />
        )}

        {activeTab === 'canvas' && (
          <div className="flex h-full overflow-hidden">
            <SectionNavigator />
            <div className="flex-1 overflow-y-auto">
              <ZenCanvas readOnly={!isEditable} />
            </div>
            {isEditable && <BlockPalette />}
          </div>
        )}

        {activeTab === 'board' && activeReport && (
          <BoardBriefingCard report={activeReport} />
        )}
      </div>

      <WorkflowActionBar />
    </div>
  );
}
