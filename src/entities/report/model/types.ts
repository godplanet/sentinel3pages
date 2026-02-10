export type ReportStatus = 'draft' | 'review' | 'published' | 'archived';

export type ReportLayoutType = 'standard' | 'dashboard' | 'executive';

export type BlockType =
  | 'heading'
  | 'paragraph'
  | 'finding_ref'
  | 'live_chart'
  | 'dynamic_metric'
  | 'signature'
  | 'table'
  | 'image'
  | 'divider';

export interface ThemeConfig {
  mode: 'neon' | 'glass' | 'minimal';
  accent: 'blue' | 'purple' | 'green' | 'orange';
  layout: 'standard' | 'compact' | 'spacious';
}

export interface Report {
  id: string;
  tenant_id: string;
  engagement_id?: string;
  template_id?: string;
  title: string;
  description: string;
  status: ReportStatus;
  theme_config: ThemeConfig;
  layout_type: ReportLayoutType;
  tiptap_content?: any;
  created_by?: string;
  created_at: string;
  updated_at: string;
  published_at?: string;
  published_by?: string;
  locked_by?: string;
  locked_at?: string;
}

export interface HeadingContent {
  text: string;
  level: 1 | 2 | 3 | 4 | 5 | 6;
}

export interface ParagraphContent {
  text: string;
  format?: {
    bold?: boolean;
    italic?: boolean;
    align?: 'left' | 'center' | 'right' | 'justify';
  };
}

export interface FindingRefContent {
  finding_id: string;
  display_mode: 'card' | 'inline' | 'summary';
  show_details?: boolean;
}

export interface LiveChartContent {
  chart_type: 'risk_distribution' | 'finding_trends' | 'severity_breakdown' | 'timeline';
  data_source: 'findings' | 'risks' | 'engagements';
  filter?: Record<string, any>;
  config?: {
    width?: number;
    height?: number;
    colors?: string[];
  };
}

export interface DynamicMetricContent {
  metric_key: string;
  label: string;
  format: 'number' | 'percentage' | 'currency' | 'score';
  data_source: 'findings' | 'risks' | 'computed';
  fallback?: number;
}

export interface SignatureContent {
  signer_name: string;
  signer_title: string;
  signed_at?: string;
  signature_data?: string;
}

export type BlockContent =
  | HeadingContent
  | ParagraphContent
  | FindingRefContent
  | LiveChartContent
  | DynamicMetricContent
  | SignatureContent
  | Record<string, any>;

export interface ReportBlock {
  id: string;
  tenant_id: string;
  report_id: string;
  position_index: number;
  parent_block_id?: string;
  depth_level: number;
  block_type: BlockType;
  content: BlockContent;
  snapshot_data?: BlockContent;
  snapshot_at?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  locked_by?: string;
  locked_at?: string;
}

export interface ReportVersion {
  id: string;
  tenant_id: string;
  report_id: string;
  version_number: number;
  version_label?: string;
  full_snapshot_json: {
    report: Report;
    blocks: ReportBlock[];
  };
  created_by?: string;
  created_at: string;
  change_summary?: string;
  trigger_event?: 'manual' | 'auto_save' | 'publish' | 'review_submit';
}

export interface ReportTemplate {
  id: string;
  tenant_id: string;
  title: string;
  description: string;
  type: string;
  structure_json: TemplateBlock[];
  is_active: boolean;
  created_at: string;
}

export interface TemplateBlock {
  block_type: BlockType;
  content: Record<string, any>;
}

export interface ReportComment {
  id: string;
  report_id: string;
  block_id?: string;
  text: string;
  type: string;
  resolved: boolean;
  created_by?: string;
  created_at: string;
}

export interface FindingPoolItem {
  id: string;
  finding_ref: string;
  title: string;
  severity: string;
  status: string;
  impact_description: string;
}

export interface CreateReportData {
  engagement_id?: string;
  template_id?: string;
  title: string;
  description?: string;
  layout_type?: ReportLayoutType;
  theme_config?: Partial<ThemeConfig>;
}

export interface UpdateReportData {
  title?: string;
  description?: string;
  status?: ReportStatus;
  theme_config?: Partial<ThemeConfig>;
  layout_type?: ReportLayoutType;
}

export interface CreateBlockData {
  report_id: string;
  position_index: number;
  parent_block_id?: string;
  block_type: BlockType;
  content: BlockContent;
}

export interface UpdateBlockData {
  position_index?: number;
  content?: Partial<BlockContent>;
}
