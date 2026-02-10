import { supabase } from '@/shared/api/supabase';
import type {
  AuditorProfile,
  TrainingRecord,
  CreateAuditorProfileInput,
  CreateTrainingRecordInput,
  AuditorSkill,
  CreateAuditorSkillInput,
} from './profile-types';

export async function fetchAuditorProfiles(): Promise<AuditorProfile[]> {
  const { data, error } = await supabase
    .from('auditor_profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function fetchAuditorProfile(userId: string): Promise<AuditorProfile | null> {
  const { data, error } = await supabase
    .from('auditor_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function createAuditorProfile(input: CreateAuditorProfileInput): Promise<AuditorProfile> {
  const { data, error } = await supabase
    .from('auditor_profiles')
    .insert([{
      user_id: input.user_id,
      title: input.title || null,
      department: input.department || null,
      certifications: input.certifications || [],
      skills_matrix: input.skills_matrix || {},
      hire_date: input.hire_date || null,
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateAuditorProfile(userId: string, updates: Partial<AuditorProfile>): Promise<AuditorProfile> {
  const { data, error } = await supabase
    .from('auditor_profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteAuditorProfile(userId: string): Promise<void> {
  const { error } = await supabase
    .from('auditor_profiles')
    .delete()
    .eq('user_id', userId);

  if (error) throw error;
}

export async function fetchTrainingRecords(userId?: string): Promise<TrainingRecord[]> {
  let query = supabase
    .from('training_records')
    .select('*');

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query.order('completed_date', { ascending: false, nullsFirst: false });

  if (error) throw error;
  return data || [];
}

export async function createTrainingRecord(input: CreateTrainingRecordInput): Promise<TrainingRecord> {
  const { data, error } = await supabase
    .from('training_records')
    .insert([{
      user_id: input.user_id,
      training_title: input.training_title,
      training_type: input.training_type,
      hours: input.hours,
      cpe_credits: input.cpe_credits,
      completed_date: input.completed_date || null,
      certificate_url: input.certificate_url || null,
    }])
    .select()
    .single();

  if (error) throw error;

  const profile = await fetchAuditorProfile(input.user_id);
  if (profile) {
    await updateAuditorProfile(input.user_id, {
      cpe_credits: profile.cpe_credits + input.cpe_credits,
    });
  }

  return data;
}

export async function updateTrainingRecord(id: string, updates: Partial<TrainingRecord>): Promise<TrainingRecord> {
  const { data, error } = await supabase
    .from('training_records')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteTrainingRecord(id: string): Promise<void> {
  const { error } = await supabase
    .from('training_records')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function getTeamStats() {
  const { data: profiles } = await supabase
    .from('auditor_profiles')
    .select('cpe_credits, certifications');

  const { data: training } = await supabase
    .from('training_records')
    .select('hours, cpe_credits');

  if (!profiles) return { totalAuditors: 0, totalCPE: 0, totalTrainingHours: 0, avgCertifications: 0 };

  const totalAuditors = profiles.length;
  const totalCPE = profiles.reduce((sum, p) => sum + p.cpe_credits, 0);
  const totalCertifications = profiles.reduce((sum, p) => sum + (p.certifications?.length || 0), 0);
  const totalTrainingHours = training?.reduce((sum, t) => sum + t.hours, 0) || 0;

  return {
    totalAuditors,
    totalCPE,
    totalTrainingHours,
    avgCertifications: totalAuditors > 0 ? totalCertifications / totalAuditors : 0,
  };
}

export async function fetchAuditorSkills(userId?: string): Promise<AuditorSkill[]> {
  let query = supabase
    .from('auditor_skills')
    .select('*');

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query.order('last_updated_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createAuditorSkill(input: CreateAuditorSkillInput): Promise<AuditorSkill> {
  const { data, error } = await supabase
    .from('auditor_skills')
    .insert([{
      user_id: input.user_id,
      skill_category: input.skill_category,
      proficiency_score: input.proficiency_score,
      notes: input.notes || null,
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateAuditorSkill(skillId: number, updates: Partial<AuditorSkill>): Promise<AuditorSkill> {
  const { data, error } = await supabase
    .from('auditor_skills')
    .update({ ...updates, last_updated_at: new Date().toISOString() })
    .eq('id', skillId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteAuditorSkill(skillId: number): Promise<void> {
  const { error } = await supabase
    .from('auditor_skills')
    .delete()
    .eq('id', skillId);

  if (error) throw error;
}
