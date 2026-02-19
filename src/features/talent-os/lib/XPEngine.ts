import { supabase } from '@/shared/api/supabase';

// ============================================================
// Types
// ============================================================

export type XPSourceType =
  | 'FINDING'
  | 'WORKPAPER'
  | 'CERTIFICATE'
  | 'EXAM'
  | 'KUDOS'
  | 'OBSERVATION'
  | 'MENTORSHIP'
  | 'TRAINING_GIVEN';

export type FindingRiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type ObservationImpactLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface XPAwardResult {
  awarded:       boolean;
  amount:        number;
  reason:        string;
  levelUp:       boolean;
  newLevel:      number;
  totalXp:       number;
}

export interface LedgerEntry {
  id:               string;
  user_id:          string;
  amount:           number;
  skill_id:         string | null;
  source_type:      XPSourceType;
  source_entity_id: string | null;
  description:      string;
  created_at:       string;
}

// ============================================================
// Rulebook constants
// ============================================================

const BASE_FINDING_XP      = 50;
const BASE_WORKPAPER_XP    = 100;
const CERTIFICATE_XP       = 1000;
const BASE_OBSERVATION_XP  = 100;
const BASE_MENTORSHIP_XP   = 250;
const MENTEE_LEVELUP_XP    = 500;
const BASE_TRAINING_XP     = 150;

const FINDING_MULTIPLIERS: Record<FindingRiskLevel, number> = {
  CRITICAL: 3,
  HIGH:     2,
  MEDIUM:   1,
  LOW:      0.5,
};

const OBSERVATION_MULTIPLIERS: Record<ObservationImpactLevel, number> = {
  LOW:    1,
  MEDIUM: 2,
  HIGH:   5,
};

const XP_PER_LEVEL = 1000;

// ============================================================
// XPEngine
// ============================================================

export class XPEngine {
  // ----------------------------------------------------------
  // Public award methods
  // ----------------------------------------------------------

  static async awardFindingXP(
    userId:    string,
    riskLevel: FindingRiskLevel,
    skillId?:  string,
    entityId?: string,
  ): Promise<XPAwardResult> {
    const multiplier = FINDING_MULTIPLIERS[riskLevel] ?? 1;
    const amount     = Math.round(BASE_FINDING_XP * multiplier);
    const description = `${riskLevel.charAt(0) + riskLevel.slice(1).toLowerCase()} risk finding logged`;

    return XPEngine._award(userId, amount, 'FINDING', description, skillId, entityId);
  }

  static async awardWorkpaperXP(
    userId:    string,
    qaipScore: number,
    skillId?:  string,
    entityId?: string,
  ): Promise<XPAwardResult> {
    if (qaipScore < 70) {
      return {
        awarded: false, amount: 0,
        reason: `QAIP score ${qaipScore} is below minimum threshold (70).`,
        levelUp: false, newLevel: 0, totalXp: 0,
      };
    }

    const multiplier  = qaipScore > 90 ? 1.5 : 1.0;
    const amount      = Math.round(BASE_WORKPAPER_XP * multiplier);
    const description = `Workpaper sign-off completed — QAIP Score: ${qaipScore}%`;

    return XPEngine._award(userId, amount, 'WORKPAPER', description, skillId, entityId);
  }

  static async awardCertificateXP(
    userId:   string,
    certName: string,
    skillId?: string,
    entityId?: string,
  ): Promise<XPAwardResult> {
    const description = `Sertifika tamamlandı: ${certName}`;
    return XPEngine._award(userId, CERTIFICATE_XP, 'CERTIFICATE', description, skillId, entityId);
  }

  static async awardExamXP(
    userId:      string,
    examTitle:   string,
    score:       number,
    xpAmount:    number,
    skillId?:    string,
    entityId?:   string,
  ): Promise<XPAwardResult> {
    const description = `Sınav geçildi — ${examTitle} (%${Math.round(score)})`;
    return XPEngine._award(userId, xpAmount, 'EXAM', description, skillId, entityId);
  }

  static async awardKudosXP(
    userId:      string,
    fromName:    string,
    reason:      string,
    amount:      number,
    skillId?:    string,
  ): Promise<XPAwardResult> {
    const description = `Kudos alındı (${fromName}): ${reason}`;
    return XPEngine._award(userId, amount, 'KUDOS', description, skillId);
  }

  static async awardObservationXP(
    userId:       string,
    impactLevel:  ObservationImpactLevel,
    skillId?:     string,
    entityId?:    string,
  ): Promise<XPAwardResult> {
    const multiplier  = OBSERVATION_MULTIPLIERS[impactLevel] ?? 1;
    const amount      = Math.round(BASE_OBSERVATION_XP * multiplier);
    const description = `Value Added: ${impactLevel} Impact Observation`;
    return XPEngine._award(userId, amount, 'OBSERVATION', description, skillId, entityId);
  }

  static async awardMentorshipXP(
    mentorUserId:  string,
    menteeUserId:  string,
    engagementId:  string,
    skillId?:      string,
  ): Promise<XPAwardResult> {
    const description = `Mentorship Bonus for Engagement ${engagementId}`;
    const result = await XPEngine._award(
      mentorUserId, BASE_MENTORSHIP_XP, 'MENTORSHIP', description, skillId, engagementId,
    );
    await XPEngine._recordMenteeLink(mentorUserId, menteeUserId);
    return result;
  }

  static async awardMenteeLevelUpBonus(
    mentorUserId:  string,
    menteeUserId:  string,
    skillId?:      string,
  ): Promise<XPAwardResult> {
    const description = `Leadership Bonus: Your mentee leveled up!`;
    const result = await XPEngine._award(
      mentorUserId, MENTEE_LEVELUP_XP, 'MENTORSHIP', description, skillId, menteeUserId,
    );
    await XPEngine._recordMenteeLink(mentorUserId, menteeUserId);
    return result;
  }

  static async awardTrainingGivenXP(
    userId:        string,
    trainingTitle: string,
    skillId?:      string,
    entityId?:     string,
  ): Promise<XPAwardResult> {
    const description = `Training Delivered: ${trainingTitle}`;
    return XPEngine._award(
      userId, BASE_TRAINING_XP, 'TRAINING_GIVEN', description, skillId, entityId,
    );
  }

  // ----------------------------------------------------------
  // Level-up processor
  // ----------------------------------------------------------

  static processLevelUp(currentXp: number, currentLevel: number): {
    newLevel: number;
    leveledUp: boolean;
    levelsGained: number;
  } {
    let newLevel = currentLevel;

    while (currentXp >= newLevel * XP_PER_LEVEL) {
      newLevel++;
    }

    return {
      newLevel,
      leveledUp:    newLevel > currentLevel,
      levelsGained: newLevel - currentLevel,
    };
  }

  static xpForNextLevel(currentLevel: number): number {
    return currentLevel * XP_PER_LEVEL;
  }

  static progressToNextLevel(currentXp: number, currentLevel: number): number {
    const floorXp   = (currentLevel - 1) * XP_PER_LEVEL;
    const ceilXp    = currentLevel * XP_PER_LEVEL;
    const range     = ceilXp - floorXp;
    const progress  = currentXp - floorXp;
    return Math.min(100, Math.max(0, Math.round((progress / range) * 100)));
  }

  // ----------------------------------------------------------
  // Fetch ledger (for feed UI)
  // ----------------------------------------------------------

  static async fetchLedger(
    userId: string,
    limit = 20,
  ): Promise<LedgerEntry[]> {
    const { data, error } = await supabase
      .from('xp_ledger')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data ?? []) as LedgerEntry[];
  }

  // ----------------------------------------------------------
  // Private helpers
  // ----------------------------------------------------------

  private static async _award(
    userId:      string,
    amount:      number,
    sourceType:  XPSourceType,
    description: string,
    skillId?:    string,
    entityId?:   string,
  ): Promise<XPAwardResult> {
    const entry: Record<string, unknown> = {
      user_id:     userId,
      amount,
      source_type: sourceType,
      description,
      skill_id:         skillId  ?? null,
      source_entity_id: entityId ?? null,
    };

    const { error: ledgerError } = await supabase
      .from('xp_ledger')
      .insert(entry);

    if (ledgerError) throw ledgerError;

    const { data: profile, error: fetchError } = await supabase
      .from('auditor_profiles')
      .select('current_xp, current_level')
      .eq('user_id', userId)
      .maybeSingle();

    if (fetchError) throw fetchError;

    const prevXp    = (profile?.current_xp    as number) ?? 0;
    const prevLevel = (profile?.current_level as number) ?? 1;
    const newXp     = prevXp + amount;

    const { newLevel, leveledUp } = XPEngine.processLevelUp(newXp, prevLevel);

    const updatePayload: Record<string, number> = { current_xp: newXp };
    if (leveledUp) updatePayload.current_level = newLevel;

    if (profile) {
      const { error: updateError } = await supabase
        .from('auditor_profiles')
        .update(updatePayload)
        .eq('user_id', userId);

      if (updateError) throw updateError;
    }

    return {
      awarded:  true,
      amount,
      reason:   description,
      levelUp:  leveledUp,
      newLevel: leveledUp ? newLevel : prevLevel,
      totalXp:  newXp,
    };
  }

  private static async _recordMenteeLink(
    mentorUserId: string,
    menteeUserId: string,
  ): Promise<void> {
    const { data: mentor } = await supabase
      .from('auditor_profiles')
      .select('mentees')
      .eq('user_id', mentorUserId)
      .maybeSingle();

    if (!mentor) return;

    const existing: string[] = (mentor.mentees as string[]) ?? [];
    if (existing.includes(menteeUserId)) return;

    await supabase
      .from('auditor_profiles')
      .update({ mentees: [...existing, menteeUserId] })
      .eq('user_id', mentorUserId);

    await supabase
      .from('auditor_profiles')
      .update({ mentor_id: mentorUserId })
      .eq('user_id', menteeUserId);
  }
}

// ============================================================
// Convenience helpers for toast messages
// ============================================================

export function formatXPToast(result: XPAwardResult): string {
  if (!result.awarded) return '';
  let msg = `+${result.amount} XP`;
  if (result.levelUp) msg += ` · Level Up! → Lv.${result.newLevel}`;
  return msg;
}

export function getRiskLevelFromSeverity(severity: string): FindingRiskLevel {
  const map: Record<string, FindingRiskLevel> = {
    CRITICAL:    'CRITICAL',
    HIGH:        'HIGH',
    MEDIUM:      'MEDIUM',
    LOW:         'LOW',
    OBSERVATION: 'LOW',
  };
  return map[severity?.toUpperCase()] ?? 'MEDIUM';
}
