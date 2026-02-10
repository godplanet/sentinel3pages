import { supabase } from '@/shared/api/supabase';
import { AuditEngagement, CreateEngagementInput } from '../model/types';

export async function createEngagement(input: CreateEngagementInput): Promise<AuditEngagement | null> {
  const { data, error } = await supabase
    .from('audit_engagements')
    .insert({
      tenant_id: input.tenant_id,
      plan_id: input.plan_id,
      entity_id: input.entity_id,
      title: input.title,
      audit_type: input.audit_type,
      start_date: input.start_date,
      end_date: input.end_date,
      risk_snapshot_score: input.risk_snapshot_score,
      estimated_hours: input.estimated_hours || 40,
      actual_hours: 0,
      status: 'PLANNED',
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating engagement:', error);
    return null;
  }

  return data;
}

export async function updateEngagement(
  id: string,
  updates: Partial<AuditEngagement>
): Promise<AuditEngagement | null> {
  const { data, error } = await supabase
    .from('audit_engagements')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating engagement:', error);
    return null;
  }

  return data;
}

export async function deleteEngagement(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('audit_engagements')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting engagement:', error);
    return false;
  }

  return true;
}

export async function getEngagementById(id: string): Promise<AuditEngagement | null> {
  const { data, error } = await supabase
    .from('audit_engagements')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching engagement:', error);
    return null;
  }

  return data;
}

export async function getAllEngagements(planId?: string): Promise<AuditEngagement[]> {
  let query = supabase.from('audit_engagements').select('*');

  if (planId) {
    query = query.eq('plan_id', planId);
  }

  const { data, error } = await query.order('start_date', { ascending: false });

  if (error) {
    console.error('Error fetching engagements:', error);
    return [];
  }

  return data || [];
}
