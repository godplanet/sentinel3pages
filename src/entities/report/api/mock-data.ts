import type { Report, ReportBlock, M6Report } from '../model/types';

const TENANT_ID = '11111111-1111-1111-1111-111111111111';

export const mockReports: Report[] = [
  {
    id: 'report-001',
    tenant_id: TENANT_ID,
    engagement_id: '10000000-0000-0000-0000-000000000003',
    title: '2026 Q1 Yönetim Kurulu Raporu',
    description: 'Birinci çeyrek denetim faaliyetlerinin özeti ve kritik bulgular',
    status: 'published',
    theme_config: {
      mode: 'neon',
      accent: 'blue',
      layout: 'standard',
    },
    layout_type: 'executive',
    created_at: '2026-01-15T10:00:00Z',
    updated_at: '2026-01-20T14:30:00Z',
    published_at: '2026-01-21T09:00:00Z',
  },
  {
    id: 'report-002',
    tenant_id: TENANT_ID,
    title: 'Operasyonel Risk Değerlendirme Raporu',
    description: 'Şube operasyonları risk analizi ve kontrol etkinliği değerlendirmesi',
    status: 'review',
    theme_config: {
      mode: 'neon',
      accent: 'orange',
      layout: 'standard',
    },
    layout_type: 'standard',
    created_at: '2026-01-25T11:00:00Z',
    updated_at: '2026-02-01T16:45:00Z',
  },
  {
    id: 'report-003',
    tenant_id: TENANT_ID,
    title: 'BT Güvenlik Denetimi - Taslak',
    description: 'Bilgi teknolojileri altyapısı ve siber güvenlik kontrollerinin denetimi',
    status: 'draft',
    theme_config: {
      mode: 'neon',
      accent: 'purple',
      layout: 'standard',
    },
    layout_type: 'dashboard',
    created_at: '2026-02-01T09:00:00Z',
    updated_at: '2026-02-02T11:20:00Z',
  },
];

export const mockReportBlocks: Record<string, ReportBlock[]> = {
  'report-001': [
    {
      id: 'block-001-01',
      tenant_id: TENANT_ID,
      report_id: 'report-001',
      position_index: 0,
      depth_level: 0,
      block_type: 'heading',
      content: {
        text: 'Yönetici Özeti',
        level: 1,
      },
      created_at: '2026-01-15T10:05:00Z',
      updated_at: '2026-01-15T10:05:00Z',
    },
    {
      id: 'block-001-02',
      tenant_id: TENANT_ID,
      report_id: 'report-001',
      position_index: 1,
      depth_level: 0,
      block_type: 'paragraph',
      content: {
        text: '2026 yılının ilk çeyreğinde gerçekleştirilen denetim faaliyetleri kapsamında, toplam 12 denetim görevi tamamlanmış ve 23 bulgu tespit edilmiştir. Bulguların %35\'i yüksek ve kritik seviyede olup, acil aksiyona ihtiyaç duymaktadır.',
      },
      created_at: '2026-01-15T10:06:00Z',
      updated_at: '2026-01-15T10:06:00Z',
    },
    {
      id: 'block-001-03',
      tenant_id: TENANT_ID,
      report_id: 'report-001',
      position_index: 2,
      depth_level: 0,
      block_type: 'dynamic_metric',
      content: {
        metric_key: 'total_risk_score',
        label: 'Toplam Risk Skoru',
        format: 'score',
        data_source: 'computed',
        fallback: 78.5,
      },
      created_at: '2026-01-15T10:10:00Z',
      updated_at: '2026-01-15T10:10:00Z',
    },
    {
      id: 'block-001-04',
      tenant_id: TENANT_ID,
      report_id: 'report-001',
      position_index: 3,
      depth_level: 0,
      block_type: 'heading',
      content: {
        text: 'Kritik Bulgular',
        level: 2,
      },
      created_at: '2026-01-15T10:15:00Z',
      updated_at: '2026-01-15T10:15:00Z',
    },
    {
      id: 'block-001-05',
      tenant_id: TENANT_ID,
      report_id: 'report-001',
      position_index: 4,
      depth_level: 0,
      block_type: 'finding_ref',
      content: {
        finding_id: '22222222-2222-2222-2222-222222222221',
        display_mode: 'card',
        show_details: true,
      },
      created_at: '2026-01-15T10:20:00Z',
      updated_at: '2026-01-15T10:20:00Z',
    },
    {
      id: 'block-001-06',
      tenant_id: TENANT_ID,
      report_id: 'report-001',
      position_index: 5,
      depth_level: 0,
      block_type: 'live_chart',
      content: {
        chart_type: 'severity_breakdown',
        data_source: 'findings',
        filter: { quarter: 'Q1', year: 2026 },
        config: {
          height: 300,
          colors: ['#ef4444', '#f97316', '#eab308', '#3b82f6'],
        },
      },
      created_at: '2026-01-15T10:25:00Z',
      updated_at: '2026-01-15T10:25:00Z',
    },
    {
      id: 'block-001-07',
      tenant_id: TENANT_ID,
      report_id: 'report-001',
      position_index: 6,
      depth_level: 0,
      block_type: 'divider',
      content: {},
      created_at: '2026-01-15T10:30:00Z',
      updated_at: '2026-01-15T10:30:00Z',
    },
    {
      id: 'block-001-08',
      tenant_id: TENANT_ID,
      report_id: 'report-001',
      position_index: 7,
      depth_level: 0,
      block_type: 'signature',
      content: {
        signer_name: 'Ahmet Yılmaz',
        signer_title: 'Baş Denetçi',
        signed_at: '2026-01-21T09:00:00Z',
      },
      created_at: '2026-01-15T10:35:00Z',
      updated_at: '2026-01-15T10:35:00Z',
    },
  ],
  'report-002': [
    {
      id: 'block-002-01',
      tenant_id: TENANT_ID,
      report_id: 'report-002',
      position_index: 0,
      depth_level: 0,
      block_type: 'heading',
      content: {
        text: 'Operasyonel Risk Değerlendirmesi',
        level: 1,
      },
      created_at: '2026-01-25T11:05:00Z',
      updated_at: '2026-01-25T11:05:00Z',
    },
    {
      id: 'block-002-02',
      tenant_id: TENANT_ID,
      report_id: 'report-002',
      position_index: 1,
      depth_level: 0,
      block_type: 'paragraph',
      content: {
        text: 'Şube operasyonlarında tespit edilen risk alanları ve kontrol boşluklarının detaylı analizi.',
      },
      created_at: '2026-01-25T11:06:00Z',
      updated_at: '2026-01-25T11:06:00Z',
    },
  ],
  'report-003': [
    {
      id: 'block-003-01',
      tenant_id: TENANT_ID,
      report_id: 'report-003',
      position_index: 0,
      depth_level: 0,
      block_type: 'heading',
      content: {
        text: 'BT Güvenlik Denetimi - Ön Bulgular',
        level: 1,
      },
      created_at: '2026-02-01T09:05:00Z',
      updated_at: '2026-02-01T09:05:00Z',
    },
  ],
};

// ─── MODULE 6: Polymorphic Block Architecture Mock Data ──────────────────────

export const mockReport: M6Report = {
  id: 'report-m6-001',
  engagementId: '10000000-0000-0000-0000-000000000003',
  title: 'İstanbul Merkez Şube — 2026 Q1 Denetim Raporu',
  status: 'draft',
  themeConfig: { paperStyle: 'zen_paper', typography: 'merriweather_inter' },
  createdAt: '2026-02-10T09:00:00Z',
  updatedAt: '2026-02-15T14:30:00Z',
  sections: [
    {
      id: 'sec-yonetici-ozeti',
      title: 'Yönetici Özeti',
      orderIndex: 0,
      blocks: [
        {
          id: 'blk-yo-h1',
          type: 'heading',
          orderIndex: 0,
          content: { html: '<h1>Yönetici Özeti</h1>', level: 1 },
        },
        {
          id: 'blk-yo-p1',
          type: 'paragraph',
          orderIndex: 1,
          content: {
            html: '<p>2026 yılının ilk çeyreğinde gerçekleştirilen denetim faaliyetleri kapsamında toplam 12 denetim görevi tamamlanmış ve 23 bulgu tespit edilmiştir. Bulguların %35\'i yüksek ve kritik seviyede olup acil aksiyona ihtiyaç duymaktadır.</p>',
          },
        },
        {
          id: 'blk-yo-ai1',
          type: 'ai_summary',
          orderIndex: 2,
          content: {
            html: '<p>Sentinel Prime Analizi: Denetlenen dönemde operasyonel risk alanında yoğunlaşma gözlemlenmiş; kontrol etkinliği %62 olarak hesaplanmıştır. Kritik bulgu sayısı bir önceki çeyreğe kıyasla %40 artmıştır.</p>',
          },
        },
        {
          id: 'blk-yo-chart1',
          type: 'live_chart',
          orderIndex: 3,
          content: {
            chartType: 'severity_distribution',
            dataSourceFilter: { quarter: 'Q1', year: 2026 },
          },
        },
      ],
    },
    {
      id: 'sec-detayli-bulgular',
      title: 'Detaylı Bulgular',
      orderIndex: 1,
      blocks: [
        {
          id: 'blk-db-h1',
          type: 'heading',
          orderIndex: 0,
          content: { html: '<h2>Detaylı Bulgular</h2>', level: 2 },
        },
        {
          id: 'blk-db-p1',
          type: 'paragraph',
          orderIndex: 1,
          content: {
            html: '<p>Aşağıdaki bulgular, Modül 5 Bulgu Stüdyosu\'ndaki canlı kayıtlara bağlıdır. Rapor yayınlandığında veriler anlık olarak dondurulur (The Freezer mekanizması).</p>',
          },
        },
        {
          id: 'blk-db-fref1',
          type: 'finding_ref',
          orderIndex: 2,
          content: {
            findingId: 'find-001',
            displayStyle: 'full_5c',
            blindMode: false,
          },
        },
        {
          id: 'blk-db-fref2',
          type: 'finding_ref',
          orderIndex: 3,
          content: {
            findingId: 'find-002',
            displayStyle: 'summary_card',
            blindMode: false,
          },
        },
        {
          id: 'blk-db-chart1',
          type: 'live_chart',
          orderIndex: 4,
          content: {
            chartType: 'risk_heatmap',
            dataSourceFilter: { engagementId: '10000000-0000-0000-0000-000000000003' },
          },
        },
      ],
    },
  ],
};
