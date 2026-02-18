import { useEffect } from 'react';
import { useActiveReportStore } from '@/entities/report';
import { mockReport } from '@/entities/report/api/mock-data';
import { useFindingStore } from '@/entities/finding/model/store';
import type { ComprehensiveFinding } from '@/entities/finding/model/types';
import { LiquidGlassToolbar } from '@/features/report-editor/ui/LiquidGlassToolbar';
import { SectionNavigator } from '@/features/report-editor/ui/SectionNavigator';
import { ZenCanvas } from '@/features/report-editor/ui/ZenCanvas';
import { BlockPalette } from '@/features/report-editor/ui/BlockPalette';

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
      internal_notes:
        'Şube müdürü ile 12 Şubat tarihinde gizlice görüşüldü. Sorun sistematik ve kasıtlı görünüyor; ilgili personelin rotasyonu önerildi.',
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
      '<p>147 aktif müşteri dosyasında güncel kimlik ve gelir belgesi bulunmamaktadır. Süre geçim oranı %31 olarak tespit edilmiştir.</p>',
    impact_html:
      '<p>MASAK uyumsuzluk riski kritik seviyede. Mali Suçları Araştırma Kurulu incelemesi ve 5M TL\'ye varan para cezası potansiyeli mevcut.</p>',
    created_at: '2026-01-20T10:00:00Z',
    updated_at: '2026-02-10T09:00:00Z',
    secrets: {
      finding_id: 'find-002',
      internal_notes:
        'Uyum ekibi konu hakkında bilgilendirildi. Müşteri ilişkileri direktörü kısmen itiraz etti; müzakere süreci devam ediyor.',
    },
    action_plans: [],
    comments: [],
    history: [],
  },
];

export default function ReportEditorPage() {
  const { setActiveReport } = useActiveReportStore();
  const setFindings = useFindingStore((s) => s.setFindings);

  useEffect(() => {
    setActiveReport(mockReport);
    setFindings(MOCK_FINDINGS);
    return () => {
      setActiveReport(null);
    };
  }, [setActiveReport, setFindings]);

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-slate-50">
      <LiquidGlassToolbar />

      <div className="flex-1 flex overflow-hidden">
        <SectionNavigator />
        <ZenCanvas />
        <BlockPalette />
      </div>
    </div>
  );
}
