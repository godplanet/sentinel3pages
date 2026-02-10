import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase';
import type {
  RiskDefinition,
  RiskAssessment,
  AssessmentWithDetails,
  CreateAssessmentInput,
} from './heatmap-types';

const TENANT = '00000000-0000-0000-0000-000000000001';

const KEYS = {
  definitions: ['risk-definitions'] as const,
  assessments: ['risk-assessments'] as const,
  heatmap: ['risk-heatmap'] as const,
};

export function useRiskDefinitions() {
  return useQuery({
    queryKey: KEYS.definitions,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('risk_definitions')
        .select('*')
        .eq('tenant_id', TENANT)
        .eq('is_active', true)
        .order('category, title');
      if (error) throw error;
      return data as RiskDefinition[];
    },
  });
}

export function useCreateRiskDefinition() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Omit<RiskDefinition, 'id' | 'tenant_id' | 'created_at' | 'updated_at' | 'is_active'>) => {
      const { data, error } = await supabase
        .from('risk_definitions')
        .insert({ ...input, tenant_id: TENANT })
        .select()
        .single();
      if (error) throw error;
      return data as RiskDefinition;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.definitions }),
  });
}

export function useRiskAssessments() {
  return useQuery({
    queryKey: KEYS.assessments,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('risk_assessments')
        .select('*')
        .eq('tenant_id', TENANT)
        .order('assessed_at', { ascending: false });
      if (error) throw error;
      return data as RiskAssessment[];
    },
  });
}

export function useHeatmapData() {
  return useQuery({
    queryKey: KEYS.heatmap,
    queryFn: async () => {
      const { data: assessments, error: aErr } = await supabase
        .from('risk_assessments')
        .select('*')
        .eq('tenant_id', TENANT);
      if (aErr) throw aErr;

      const { data: risks, error: rErr } = await supabase
        .from('risk_definitions')
        .select('id, title, category')
        .eq('tenant_id', TENANT);
      if (rErr) throw rErr;

      const { data: entities, error: eErr } = await supabase
        .from('audit_entities')
        .select('id, name, type')
        .eq('tenant_id', TENANT);
      if (eErr) throw eErr;

      const riskMap = new Map(risks.map((r: { id: string; title: string; category: string }) => [r.id, r]));
      const entityMap = new Map(entities.map((e: { id: string; name: string; type: string }) => [e.id, e]));

      const enriched: AssessmentWithDetails[] = (assessments as RiskAssessment[]).map(a => {
        const risk = riskMap.get(a.risk_id);
        const entity = entityMap.get(a.entity_id);
        return {
          ...a,
          risk_title: risk?.title ?? 'Bilinmeyen Risk',
          risk_category: risk?.category ?? '',
          entity_name: entity?.name ?? 'Bilinmeyen Varlik',
          entity_type: entity?.type ?? '',
        };
      });

      return enriched;
    },
  });
}

export function useCreateAssessment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateAssessmentInput) => {
      const { data, error } = await supabase
        .from('risk_assessments')
        .insert({ ...input, tenant_id: TENANT })
        .select()
        .single();
      if (error) throw error;
      return data as RiskAssessment;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.assessments });
      qc.invalidateQueries({ queryKey: KEYS.heatmap });
    },
  });
}

export function useDeleteAssessment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('risk_assessments')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.assessments });
      qc.invalidateQueries({ queryKey: KEYS.heatmap });
    },
  });
}
