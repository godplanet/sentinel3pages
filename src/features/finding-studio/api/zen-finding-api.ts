import { supabase } from '@/shared/api/supabase';
import type { FindingEditorData } from '../components/ZenEditor';

const TENANT_ID = '11111111-1111-1111-1111-111111111111';

export interface ZenFindingData {
  id?: string;
  title: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'OBSERVATION';
  engagement_id?: string;
  editor_data: FindingEditorData;
}

export const zenFindingApi = {
  async saveFinding(data: ZenFindingData): Promise<{ id: string; success: boolean }> {
    const payload = {
      tenant_id: TENANT_ID,
      engagement_id: data.engagement_id,
      title: data.title,
      severity: data.severity,
      description: data.editor_data.condition.replace(/<[^>]*>/g, '').substring(0, 500),
      state: 'DRAFT',
      status: 'DRAFT',
      finding_year: new Date().getFullYear(),
      details: {
        criteria: data.editor_data.criteria,
        condition: data.editor_data.condition,
        root_cause_analysis: data.editor_data.root_cause_analysis,
        effect: data.editor_data.effect,
        recommendation: data.editor_data.recommendation,
      },
    };

    if (data.id) {
      const { data: updated, error } = await supabase
        .from('audit_findings')
        .update(payload)
        .eq('id', data.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating finding:', error);
        return { id: data.id, success: false };
      }

      return { id: data.id, success: true };
    } else {
      const { data: created, error } = await supabase
        .from('audit_findings')
        .insert(payload)
        .select()
        .single();

      if (error) {
        console.error('Error creating finding:', error);
        return { id: '', success: false };
      }

      return { id: created.id, success: true };
    }
  },

  async loadFinding(id: string): Promise<FindingEditorData | null> {
    const { data, error } = await supabase
      .from('audit_findings')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) {
      console.error('Error loading finding:', error);
      return null;
    }

    const details = data.details || {};

    return {
      criteria: details.criteria || '',
      condition: details.condition || '',
      root_cause_analysis: details.root_cause_analysis || {
        method: 'five_whys',
        five_whys: ['', '', '', '', ''],
      },
      effect: details.effect || '',
      recommendation: details.recommendation || '',
    };
  },

  async getFindingMetadata(id: string): Promise<{
    id: string;
    title: string;
    severity: string;
    engagement_id?: string;
  } | null> {
    const { data, error } = await supabase
      .from('audit_findings')
      .select('id, title, severity, engagement_id')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) {
      console.error('Error loading finding metadata:', error);
      return null;
    }

    return data;
  },

  async createQuickFinding(title: string, severity: string): Promise<string | null> {
    const { data, error } = await supabase
      .from('audit_findings')
      .insert({
        tenant_id: TENANT_ID,
        title,
        severity,
        description: '',
        state: 'DRAFT',
        status: 'DRAFT',
        finding_year: new Date().getFullYear(),
        details: {
          criteria: '',
          condition: '',
          root_cause_analysis: {
            method: 'five_whys',
            five_whys: ['', '', '', '', ''],
          },
          effect: '',
          recommendation: '',
        },
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating quick finding:', error);
      return null;
    }

    return data.id;
  },
};
