import type { TalentProfileWithSkills } from '@/features/talent-os/types';

export interface AllocationResult {
  auditor: TalentProfileWithSkills;
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  blocked: boolean;
  blockReason?: string;
}

export interface AllocatorOptions {
  maxFatigueScore?: number;
  topN?: number;
}

export interface TeamFatigueStats {
  average: number;
  critical: number;
  inGreenZone: number;
}

export interface SkillGap {
  skill: string;
  coveredBy: number;
  totalAuditors: number;
}

function scoreAuditor(
  auditor: TalentProfileWithSkills,
  requiredSkills: string[],
  maxFatigueScore: number,
): AllocationResult {
  const auditorSkillNames = auditor.skills.map((s) => s.skill_name.toLowerCase());

  const matched = requiredSkills.filter((req) =>
    auditorSkillNames.some((s) => s.includes(req.toLowerCase()) || req.toLowerCase().includes(s)),
  );
  const missing = requiredSkills.filter((req) =>
    !auditorSkillNames.some((s) => s.includes(req.toLowerCase()) || req.toLowerCase().includes(s)),
  );

  const blocked = auditor.fatigue_score > maxFatigueScore || !auditor.is_available;
  const blockReason = auditor.fatigue_score > maxFatigueScore
    ? `Yorgunluk skoru çok yüksek (${auditor.fatigue_score}/100)`
    : !auditor.is_available
      ? 'Müsait değil'
      : undefined;

  const skillRatio = requiredSkills.length > 0 ? matched.length / requiredSkills.length : 1;
  const skillScore = skillRatio * 70;

  const fatigueHeadroom = Math.max(0, maxFatigueScore - auditor.fatigue_score);
  const fatigueScore = Math.min(20, (fatigueHeadroom / maxFatigueScore) * 20);

  const availabilityScore = auditor.is_available ? 10 : 0;

  const matchScore = Math.round(skillScore + fatigueScore + availabilityScore);

  return {
    auditor,
    matchScore: blocked ? matchScore * 0.4 : matchScore,
    matchedSkills: matched,
    missingSkills: missing,
    blocked,
    blockReason,
  };
}

export function suggestAuditors(
  requiredSkills: string[],
  allAuditors: TalentProfileWithSkills[],
  options: AllocatorOptions = {},
): AllocationResult[] {
  const { maxFatigueScore = 80, topN } = options;

  const results = allAuditors.map((a) => scoreAuditor(a, requiredSkills, maxFatigueScore));

  results.sort((a, b) => {
    if (a.blocked !== b.blocked) return a.blocked ? 1 : -1;
    return b.matchScore - a.matchScore;
  });

  return topN ? results.slice(0, topN) : results;
}

export function getTeamFatigueStats(auditors: TalentProfileWithSkills[]): TeamFatigueStats {
  if (auditors.length === 0) return { average: 0, critical: 0, inGreenZone: 0 };

  const total = auditors.reduce((sum, a) => sum + a.fatigue_score, 0);
  const average = Math.round(total / auditors.length);
  const critical = auditors.filter((a) => a.fatigue_score > 80).length;
  const inGreenZone = auditors.filter((a) => a.burnout_zone === 'GREEN').length;

  return { average, critical, inGreenZone };
}

export function getSkillGaps(
  auditors: TalentProfileWithSkills[],
  topN = 5,
): SkillGap[] {
  const allSkills = new Set(auditors.flatMap((a) => a.skills.map((s) => s.skill_name)));
  const gaps: SkillGap[] = [];

  allSkills.forEach((skill) => {
    const covered = auditors.filter((a) =>
      a.skills.some((s) => s.skill_name === skill && s.proficiency_level >= 3),
    ).length;
    gaps.push({ skill, coveredBy: covered, totalAuditors: auditors.length });
  });

  gaps.sort((a, b) => a.coveredBy - b.coveredBy);
  return gaps.slice(0, topN);
}
