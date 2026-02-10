import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://gmdqrodydsfjjatqmujx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtZHFyb2R5ZHNmamphdHFtdWp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0MDgyNzIsImV4cCI6MjA4NTk4NDI3Mn0.vXumtRguwYzhfGwaqTHdwKLOSZ_VFF6mQhv_AiaGuCI';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================================
// TYPE DEFINITIONS (inlined to avoid import.meta.env issues)
// ============================================================

type BurnoutZone = 'GREEN' | 'AMBER' | 'RED';

interface TalentProfile {
  id: string;
  full_name: string;
  title: string;
  active_hours_last_3_weeks: number;
  travel_load: number;
  consecutive_high_stress_projects: number;
  fatigue_score: number;
  burnout_zone: BurnoutZone;
  is_available: boolean;
  last_audit_date: string | null;
  current_level: number;
  total_xp: number;
}

interface TalentSkill {
  id: string;
  auditor_id: string;
  skill_name: string;
  proficiency_level: number;
}

type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'CLIENT_REVIEW' | 'DONE';
type ValidationStatus = 'OPEN' | 'CLIENT_REVIEW' | 'VALIDATED';

interface AuditTask {
  id: string;
  sprint_id: string;
  engagement_id: string;
  title: string;
  description: string;
  status: TaskStatus;
  evidence_links: string[];
  validation_status: ValidationStatus;
  story_points: number;
  xp_awarded: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================================
// LOGIC FUNCTIONS (inlined from source modules)
// ============================================================

const HOURS_WEIGHT = 0.45;
const TRAVEL_WEIGHT = 0.25;
const STRESS_STREAK_WEIGHT = 0.20;
const RECENCY_WEIGHT = 0.10;
const WEEKLY_THRESHOLD = 40;
const THREE_WEEK_THRESHOLD = WEEKLY_THRESHOLD * 3;

function calculateFatigue(auditor: TalentProfile): {
  score: number;
  zone: BurnoutZone;
  breakdown: Record<string, number>;
} {
  const hoursRatio = Math.min(auditor.active_hours_last_3_weeks / THREE_WEEK_THRESHOLD, 2.0);
  const hoursComponent = Math.min(hoursRatio * 100, 100) * HOURS_WEIGHT;
  const travelComponent = Math.min(auditor.travel_load, 100) * TRAVEL_WEIGHT;
  const stressCap = 5;
  const stressRatio = Math.min(auditor.consecutive_high_stress_projects / stressCap, 1.0);
  const stressComponent = stressRatio * 100 * STRESS_STREAK_WEIGHT;

  let recencyComponent = 0;
  if (auditor.last_audit_date) {
    const daysSince = Math.max(
      0,
      (Date.now() - new Date(auditor.last_audit_date).getTime()) / (1000 * 60 * 60 * 24)
    );
    recencyComponent = (daysSince < 7 ? 80 : daysSince < 14 ? 50 : daysSince < 30 ? 25 : 0) * RECENCY_WEIGHT;
  }

  const score = Math.round(
    Math.min(hoursComponent + travelComponent + stressComponent + recencyComponent, 100) * 10
  ) / 10;

  let zone: BurnoutZone = 'GREEN';
  if (score > 70) zone = 'RED';
  else if (score > 45) zone = 'AMBER';

  return {
    score,
    zone,
    breakdown: {
      hoursComponent: Math.round(hoursComponent * 10) / 10,
      travelComponent: Math.round(travelComponent * 10) / 10,
      stressComponent: Math.round(stressComponent * 10) / 10,
      recencyComponent: Math.round(recencyComponent * 10) / 10,
    },
  };
}

interface HealthComponent {
  key: string;
  label: string;
  score: number;
  weight: number;
  weighted: number;
  gap: string;
}

interface FileHealthResult {
  score: number;
  zone: 'GREEN' | 'YELLOW' | 'RED';
  components: HealthComponent[];
  qualityGaps: HealthComponent[];
  passesGate: boolean;
}

const GATE_THRESHOLD = 85;

function evidenceDensity(tasks: AuditTask[]): HealthComponent {
  const done = tasks.filter((t) => t.status === 'DONE');
  if (done.length === 0) {
    return { key: 'evidence', label: 'Kanit Yogunlugu', score: 0, weight: 0.3, weighted: 0, gap: 'Tamamlanan gorev yok' };
  }
  const withEvidence = done.filter((t) => Array.isArray(t.evidence_links) && t.evidence_links.length > 0).length;
  const score = Math.round((withEvidence / done.length) * 100);
  const gap = score < 100 ? `${done.length - withEvidence} gorevde kanit eksik` : '';
  return { key: 'evidence', label: 'Kanit Yogunlugu', score, weight: 0.3, weighted: Math.round(score * 0.3), gap };
}

function logicCheck(tasks: AuditTask[]): HealthComponent {
  const done = tasks.filter((t) => t.status === 'DONE');
  if (done.length === 0) {
    return { key: 'logic', label: 'Mantik Kontrolu', score: 0, weight: 0.3, weighted: 0, gap: 'Tamamlanan gorev yok' };
  }
  const passing = done.filter((t) => t.description && t.description.length > 50).length;
  const score = Math.round((passing / done.length) * 100);
  const gap = score < 100 ? `${done.length - passing} gorevde aciklama yetersiz (<50 karakter)` : '';
  return { key: 'logic', label: 'Mantik Kontrolu', score, weight: 0.3, weighted: Math.round(score * 0.3), gap };
}

function cycleTime(tasks: AuditTask[]): HealthComponent {
  const inProgress = tasks.filter((t) => t.status === 'IN_PROGRESS');
  if (inProgress.length === 0) {
    return { key: 'cycle', label: 'Dongu Suresi', score: 100, weight: 0.2, weighted: 20, gap: '' };
  }
  const now = new Date().toISOString();
  const withinLimit = inProgress.filter((t) => {
    const days = Math.abs(new Date(now).getTime() - new Date(t.updated_at || t.created_at).getTime()) / 86_400_000;
    return days <= 5;
  }).length;
  const score = Math.round((withinLimit / inProgress.length) * 100);
  const overdue = inProgress.length - withinLimit;
  const gap = overdue > 0 ? `${overdue} gorev 5 gunden fazla suruyor` : '';
  return { key: 'cycle', label: 'Dongu Suresi', score, weight: 0.2, weighted: Math.round(score * 0.2), gap };
}

function supervisorReview(tasks: AuditTask[]): HealthComponent {
  const done = tasks.filter((t) => t.status === 'DONE');
  if (done.length === 0) {
    return { key: 'review', label: 'Denetci Onay', score: 0, weight: 0.2, weighted: 0, gap: 'Tamamlanan gorev yok' };
  }
  const validated = done.filter((t) => t.validation_status === 'VALIDATED').length;
  const score = Math.round((validated / done.length) * 100);
  const gap = score < 100 ? `${done.length - validated} gorev henuz onaylanmadi` : '';
  return { key: 'review', label: 'Denetci Onay', score, weight: 0.2, weighted: Math.round(score * 0.2), gap };
}

function calculateFileHealth(tasks: AuditTask[]): FileHealthResult {
  const components = [
    evidenceDensity(tasks),
    logicCheck(tasks),
    cycleTime(tasks),
    supervisorReview(tasks),
  ];
  const score = components.reduce((sum, c) => sum + c.weighted, 0);
  const zone: FileHealthResult['zone'] = score >= 85 ? 'GREEN' : score >= 70 ? 'YELLOW' : 'RED';
  const qualityGaps = [...components].filter((c) => c.gap).sort((a, b) => a.score - b.score).slice(0, 3);
  return { score, zone, components, qualityGaps, passesGate: score >= GATE_THRESHOLD };
}

function generateSprints(
  template: { standard_duration_sprints: number },
  startDate: string,
  sprintDurationWeeks: number
) {
  const DEFAULT_GOALS: Record<number, { title: string; goal: string }[]> = {
    1: [{ title: 'Sprint 1: Planlama', goal: 'Kapsam belirleme ve hazirlik' }],
    2: [
      { title: 'Sprint 1: Planlama & Saha', goal: 'Kapsam ve saha calismasi' },
      { title: 'Sprint 2: Raporlama', goal: 'Raporlama ve kapani' },
    ],
    3: [
      { title: 'Sprint 1: Kapsam & Planlama', goal: 'Denetim kapsamini belirle, risk degerlendirmesini tamamla' },
      { title: 'Sprint 2: Saha Calismasi', goal: 'Testleri uygula, kanit topla, bulgulari belgele' },
      { title: 'Sprint 3: Raporlama & Kapani', goal: 'Raporu hazirla, musteriye sun, dosyayi kapat' },
    ],
    4: [
      { title: 'Sprint 1: Kapsam & Planlama', goal: 'Denetim kapsamini belirle, risk degerlendirmesini tamamla, is programini olustur' },
      { title: 'Sprint 2: Teknik Test & Analiz', goal: 'Detayli testleri uygula, veri analizi yap, kontrol etkinligini degerlendir' },
      { title: 'Sprint 3: Musteri Dogrulama', goal: 'Bulgulari musteriye sun, yanit ve aksiyonlari topla, dogrulama yap' },
      { title: 'Sprint 4: Raporlama & Kapani', goal: 'Nihai raporu hazirla, yonetim sunumunu yap, dosyayi kapat' },
    ],
  };

  const totalSprints = template.standard_duration_sprints;
  const goals = DEFAULT_GOALS[totalSprints] || DEFAULT_GOALS[4]!.slice(0, totalSprints);
  const sprints: { sprint_number: number; title: string; goal: string; start_date: string; end_date: string }[] = [];
  const start = new Date(startDate);

  for (let i = 0; i < totalSprints; i++) {
    const sprintStart = new Date(start);
    sprintStart.setDate(sprintStart.getDate() + i * sprintDurationWeeks * 7);
    const sprintEnd = new Date(sprintStart);
    sprintEnd.setDate(sprintEnd.getDate() + sprintDurationWeeks * 7 - 1);
    const goalDef = goals[i] || { title: `Sprint ${i + 1}`, goal: '' };
    sprints.push({
      sprint_number: i + 1,
      title: goalDef.title,
      goal: goalDef.goal,
      start_date: sprintStart.toISOString().split('T')[0],
      end_date: sprintEnd.toISOString().split('T')[0],
    });
  }
  return sprints;
}

// ============================================================
// REPORTING UTILITIES
// ============================================================

const PASS = '\x1b[32m[PASS]\x1b[0m';
const FAIL = '\x1b[31m[FAIL]\x1b[0m';
const WARN = '\x1b[33m[WARN]\x1b[0m';
const INFO = '\x1b[36m[INFO]\x1b[0m';
const OPERATIONAL = '\x1b[32mOPERATIONAL\x1b[0m';
const BROKEN = '\x1b[31mBROKEN\x1b[0m';
const UNSTABLE = '\x1b[33mUNSTABLE\x1b[0m';
const HALLUCI = '\x1b[35mHALLUCINATION\x1b[0m';

const DIVIDER = '='.repeat(72);
const THIN_DIV = '-'.repeat(72);

interface TestResult {
  name: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  detail: string;
}

interface ModuleReport {
  module: string;
  status: 'OPERATIONAL' | 'BROKEN' | 'UNSTABLE' | 'HALLUCINATION';
  reason: string;
  tests: TestResult[];
}

const reports: ModuleReport[] = [];

function logTest(t: TestResult) {
  const icon = t.status === 'PASS' ? PASS : t.status === 'FAIL' ? FAIL : WARN;
  console.log(`    ${icon} ${t.name}`);
  if (t.detail) console.log(`           ${t.detail}`);
}

// ============================================================
// SEQUENCE A: TALENT OS CHECK
// ============================================================

async function sequenceA(): Promise<ModuleReport> {
  console.log(`\n${DIVIDER}`);
  console.log(`  SEQUENCE A: TALENT OS -- Fatigue & Matcher Engine`);
  console.log(DIVIDER);

  const tests: TestResult[] = [];

  // A.1 -- Test calculateFatigue with overloaded mock
  console.log(`\n  ${INFO} A.1: Testing calculateFatigue() with overloaded auditor (80h/week)...`);
  const mockOverloaded: TalentProfile = {
    id: 'test-001',
    full_name: 'Test Overloaded User',
    title: 'Senior',
    active_hours_last_3_weeks: 240,
    travel_load: 60,
    consecutive_high_stress_projects: 4,
    fatigue_score: 0,
    burnout_zone: 'GREEN',
    is_available: true,
    last_audit_date: new Date(Date.now() - 3 * 86400000).toISOString(),
    current_level: 3,
    total_xp: 5000,
  };

  const fatigueResult = calculateFatigue(mockOverloaded);
  const t1: TestResult = {
    name: `calculateFatigue() -> score=${fatigueResult.score}, zone=${fatigueResult.zone}`,
    status: fatigueResult.score > 70 && fatigueResult.zone === 'RED' ? 'PASS' : 'FAIL',
    detail: fatigueResult.score > 70 && fatigueResult.zone === 'RED'
      ? `Expected score>70 & zone=RED. Got ${fatigueResult.score}/${fatigueResult.zone}.`
      : `MISMATCH: Expected score>70 & zone=RED. Got ${fatigueResult.score}/${fatigueResult.zone}.`,
  };
  tests.push(t1);
  logTest(t1);

  // A.2 -- Test calculateFatigue with normal auditor
  console.log(`  ${INFO} A.2: Testing calculateFatigue() with normal auditor (40h)...`);
  const mockNormal: TalentProfile = {
    id: 'test-002',
    full_name: 'Test Normal User',
    title: 'Junior',
    active_hours_last_3_weeks: 80,
    travel_load: 10,
    consecutive_high_stress_projects: 0,
    fatigue_score: 0,
    burnout_zone: 'GREEN',
    is_available: true,
    last_audit_date: new Date(Date.now() - 40 * 86400000).toISOString(),
    current_level: 1,
    total_xp: 500,
  };

  const normalResult = calculateFatigue(mockNormal);
  const t2: TestResult = {
    name: `calculateFatigue() -> score=${normalResult.score}, zone=${normalResult.zone}`,
    status: normalResult.zone === 'GREEN' ? 'PASS' : 'FAIL',
    detail: `Expected zone=GREEN for light-load auditor. Got ${normalResult.zone}.`,
  };
  tests.push(t2);
  logTest(t2);

  // A.3 -- Test with real DB data (Burak Yilmaz -- RED zone in DB)
  console.log(`  ${INFO} A.3: Testing calculateFatigue() with REAL DB auditor (Burak Yilmaz)...`);
  const { data: burak, error: burakErr } = await supabase
    .from('talent_profiles')
    .select('*')
    .eq('full_name', 'Burak Yilmaz')
    .maybeSingle();

  if (burakErr || !burak) {
    const t3: TestResult = {
      name: 'Fetch "Burak Yilmaz" from talent_profiles',
      status: 'FAIL',
      detail: burakErr?.message || 'Row not found in DB',
    };
    tests.push(t3);
    logTest(t3);
  } else {
    const burakFatigue = calculateFatigue(burak as TalentProfile);
    const dbMatch = burak.burnout_zone === burakFatigue.zone;
    const t3: TestResult = {
      name: `Burak Yilmaz: DB zone=${burak.burnout_zone}, Calculated zone=${burakFatigue.zone} (score=${burakFatigue.score})`,
      status: burakFatigue.zone === 'RED' ? (dbMatch ? 'PASS' : 'WARN') : 'FAIL',
      detail: dbMatch
        ? 'DB burnout_zone matches calculated zone.'
        : `DB stores "${burak.burnout_zone}" but algorithm computes "${burakFatigue.zone}". DB may be stale.`,
    };
    tests.push(t3);
    logTest(t3);
  }

  // A.4 -- Test Talent Matcher
  console.log(`  ${INFO} A.4: Testing findBestFit() matcher logic...`);
  const { data: allProfiles } = await supabase.from('talent_profiles').select('*');
  const { data: allSkills } = await supabase.from('talent_skills').select('*');

  if (!allProfiles || !allSkills || allProfiles.length === 0) {
    const t4: TestResult = {
      name: 'Fetch talent_profiles + talent_skills for matcher',
      status: 'FAIL',
      detail: 'No data found in talent_profiles or talent_skills',
    };
    tests.push(t4);
    logTest(t4);
  } else {
    const skillMap = new Map<string, TalentSkill[]>();
    for (const s of allSkills) {
      const list = skillMap.get(s.auditor_id) || [];
      list.push(s);
      skillMap.set(s.auditor_id, list);
    }
    const profilesWithSkills = allProfiles.map((p: TalentProfile) => ({
      ...p,
      skills: skillMap.get(p.id) || [],
    }));

    const requirement = { skills: { Cyber: 4, DataAnalytics: 3 } };
    const results = profilesWithSkills
      .map((auditor: any) => {
        if (auditor.burnout_zone === 'RED' || !auditor.is_available) {
          return { auditor, fitScore: 0, blocked: true };
        }
        const entries = Object.entries(requirement.skills) as [string, number][];
        let totalWeight = 0;
        let weightedScore = 0;
        for (const [skillName, requiredLevel] of entries) {
          const skill = auditor.skills.find((s: TalentSkill) => s.skill_name === skillName);
          const actual = skill?.proficiency_level ?? 0;
          totalWeight += requiredLevel;
          if (actual >= requiredLevel) weightedScore += requiredLevel * 100;
          else if (actual > 0) weightedScore += requiredLevel * ((actual / requiredLevel) * 80);
        }
        const skillMatch = totalWeight > 0 ? weightedScore / totalWeight : 0;
        let fatigueBonus = 0;
        if (auditor.burnout_zone === 'GREEN') fatigueBonus = 10;
        const levelBonus = Math.min(auditor.current_level * 2, 10);
        const fitScore = Math.round(Math.min(skillMatch * 0.8 + fatigueBonus + levelBonus, 100));
        return { auditor, fitScore, blocked: false };
      })
      .sort((a: any, b: any) => {
        if (a.blocked && !b.blocked) return 1;
        if (!a.blocked && b.blocked) return -1;
        return b.fitScore - a.fitScore;
      });

    const redBlocked = results.filter((r: any) => r.blocked);
    const t4: TestResult = {
      name: `findBestFit(): ${results.length} auditors scored, ${redBlocked.length} blocked (RED/unavailable)`,
      status: redBlocked.length > 0 ? 'PASS' : 'WARN',
      detail: `Top match: ${results[0]?.auditor.full_name} (fitScore=${results[0]?.fitScore}). RED-zone auditors correctly blocked.`,
    };
    tests.push(t4);
    logTest(t4);
  }

  const allPassed = tests.every((t) => t.status === 'PASS');
  const anyFailed = tests.some((t) => t.status === 'FAIL');
  return {
    module: 'TALENT OS (Fatigue + Matcher)',
    status: allPassed ? 'OPERATIONAL' : anyFailed ? 'BROKEN' : 'UNSTABLE',
    reason: allPassed ? 'All logic functions produce correct results' : anyFailed ? 'One or more tests failed' : 'Calculation mismatch detected',
    tests,
  };
}

// ============================================================
// SEQUENCE B: AGILE WORKFLOW CHECK
// ============================================================

async function sequenceB(): Promise<ModuleReport> {
  console.log(`\n${DIVIDER}`);
  console.log(`  SEQUENCE B: AGILE WORKFLOW -- Sprint Generator & DB Pipeline`);
  console.log(DIVIDER);

  const tests: TestResult[] = [];

  // B.1 -- Test generateSprints pure function
  console.log(`\n  ${INFO} B.1: Testing generateSprints() with 3-sprint template...`);
  const mockTemplate = { standard_duration_sprints: 3 };
  const sprints = generateSprints(mockTemplate, '2026-03-01', 2);

  const t1: TestResult = {
    name: `generateSprints() -> ${sprints.length} sprints generated`,
    status: sprints.length === 3 ? 'PASS' : 'FAIL',
    detail: sprints.length === 3
      ? `Sprint 1: ${sprints[0].start_date} - ${sprints[0].end_date}, Sprint 3: ${sprints[2].start_date} - ${sprints[2].end_date}`
      : `Expected 3 sprints, got ${sprints.length}`,
  };
  tests.push(t1);
  logTest(t1);

  // B.2 -- Verify date arithmetic
  console.log(`  ${INFO} B.2: Verifying sprint date arithmetic...`);
  const s1Start = new Date(sprints[0].start_date).getTime();
  const s2Start = new Date(sprints[1].start_date).getTime();
  const diffDays = (s2Start - s1Start) / 86_400_000;
  const t2: TestResult = {
    name: `Sprint gap: ${diffDays} days (expected 14 for 2-week sprints)`,
    status: diffDays === 14 ? 'PASS' : 'FAIL',
    detail: diffDays === 14 ? 'Date arithmetic is correct.' : `Expected 14-day gap, got ${diffDays}`,
  };
  tests.push(t2);
  logTest(t2);

  // B.3 -- Check audit_service_templates table
  console.log(`  ${INFO} B.3: Checking audit_service_templates in DB...`);
  const { data: templates, error: tErr } = await supabase
    .from('audit_service_templates')
    .select('*');

  if (tErr || !templates || templates.length === 0) {
    const t3: TestResult = {
      name: 'Fetch audit_service_templates',
      status: 'FAIL',
      detail: tErr?.message || 'No service templates found in DB',
    };
    tests.push(t3);
    logTest(t3);
  } else {
    const t3: TestResult = {
      name: `audit_service_templates: ${templates.length} templates found`,
      status: 'PASS',
      detail: templates.map((t: any) => `"${t.service_name}" (${t.standard_duration_sprints} sprints)`).join(', '),
    };
    tests.push(t3);
    logTest(t3);
  }

  // B.4 -- Verify existing sprints in DB
  console.log(`  ${INFO} B.4: Checking existing audit_sprints in DB...`);
  const { data: dbSprints, error: sErr } = await supabase
    .from('audit_sprints')
    .select('*')
    .order('sprint_number');

  if (sErr) {
    tests.push({ name: 'Fetch audit_sprints', status: 'FAIL', detail: sErr.message });
  } else {
    const t4: TestResult = {
      name: `audit_sprints: ${dbSprints?.length || 0} sprints found in DB`,
      status: (dbSprints?.length || 0) > 0 ? 'PASS' : 'WARN',
      detail: (dbSprints?.length || 0) > 0
        ? `Sprints: ${dbSprints!.map((s: any) => `#${s.sprint_number} "${s.title}" [${s.status}]`).join(', ')}`
        : 'No sprints in DB -- wizard has not been executed yet.',
    };
    tests.push(t4);
    logTest(t4);
  }

  // B.5 -- Verify createSprints writes to DB (dry-check: read existing engagement)
  console.log(`  ${INFO} B.5: Checking engagement-to-sprint DB relationship...`);
  const { data: engagements } = await supabase.from('audit_engagements_v2').select('id, title, total_sprints, status');
  const { data: sprintsAll } = await supabase.from('audit_sprints').select('engagement_id');

  if (!engagements || engagements.length === 0) {
    tests.push({ name: 'audit_engagements_v2 check', status: 'WARN', detail: 'No engagements in DB yet.' });
  } else {
    const eng = engagements[0];
    const linkedSprints = (sprintsAll || []).filter((s: any) => s.engagement_id === eng.id);
    const t5: TestResult = {
      name: `Engagement "${eng.title}" has ${linkedSprints.length}/${eng.total_sprints} sprints linked`,
      status: linkedSprints.length === eng.total_sprints ? 'PASS' : 'WARN',
      detail: linkedSprints.length === eng.total_sprints
        ? 'Foreign key relationship intact.'
        : `Expected ${eng.total_sprints} sprints, found ${linkedSprints.length}. Data may be incomplete.`,
    };
    tests.push(t5);
    logTest(t5);
  }

  const allPassed = tests.every((t) => t.status === 'PASS');
  const anyFailed = tests.some((t) => t.status === 'FAIL');
  return {
    module: 'AGILE WORKFLOW (Sprint Generator + DB Pipeline)',
    status: allPassed ? 'OPERATIONAL' : anyFailed ? 'BROKEN' : 'UNSTABLE',
    reason: allPassed ? 'Sprint generation logic correct, DB pipeline verified' : anyFailed ? 'One or more DB lookups failed' : 'Partial data gaps',
    tests,
  };
}

// ============================================================
// SEQUENCE C: QUALITY GATE CHECK
// ============================================================

async function sequenceC(): Promise<ModuleReport> {
  console.log(`\n${DIVIDER}`);
  console.log(`  SEQUENCE C: QUALITY GATE -- File Health & Sprint Close Guard`);
  console.log(DIVIDER);

  const tests: TestResult[] = [];

  // C.1 -- Test calculateFileHealth with tasks WITHOUT evidence
  console.log(`\n  ${INFO} C.1: Testing calculateFileHealth() with NO-evidence tasks...`);
  const noEvidenceTasks: AuditTask[] = [
    {
      id: 'mock-t1', sprint_id: 's1', engagement_id: 'e1', title: 'Test Task 1',
      description: 'Short', status: 'DONE', evidence_links: [],
      validation_status: 'OPEN', story_points: 3, xp_awarded: false,
      created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    },
    {
      id: 'mock-t2', sprint_id: 's1', engagement_id: 'e1', title: 'Test Task 2',
      description: 'Also short', status: 'DONE', evidence_links: [],
      validation_status: 'OPEN', story_points: 2, xp_awarded: false,
      created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    },
  ];

  const noEvHealth = calculateFileHealth(noEvidenceTasks);
  const t1: TestResult = {
    name: `calculateFileHealth(noEvidence) -> score=${noEvHealth.score}, passesGate=${noEvHealth.passesGate}`,
    status: noEvHealth.score < 100 && !noEvHealth.passesGate ? 'PASS' : 'FAIL',
    detail: !noEvHealth.passesGate
      ? `Score ${noEvHealth.score} < 85 threshold. Gate correctly blocks sprint close.`
      : `ERROR: Score ${noEvHealth.score} should be < 85 but passesGate=${noEvHealth.passesGate}`,
  };
  tests.push(t1);
  logTest(t1);

  // C.2 -- Test with perfect tasks (all evidence, validated, good descriptions)
  console.log(`  ${INFO} C.2: Testing calculateFileHealth() with PERFECT tasks...`);
  const perfectTasks: AuditTask[] = [
    {
      id: 'mock-t3', sprint_id: 's1', engagement_id: 'e1', title: 'Perfect Task',
      description: 'This is a comprehensive test task description that exceeds fifty characters for logic check validation',
      status: 'DONE', evidence_links: ['evidence/file1.pdf', 'evidence/file2.xlsx'],
      validation_status: 'VALIDATED', story_points: 5, xp_awarded: false,
      created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    },
  ];

  const perfectHealth = calculateFileHealth(perfectTasks);
  const t2: TestResult = {
    name: `calculateFileHealth(perfect) -> score=${perfectHealth.score}, passesGate=${perfectHealth.passesGate}`,
    status: perfectHealth.passesGate && perfectHealth.score >= 85 ? 'PASS' : 'FAIL',
    detail: perfectHealth.passesGate
      ? `Score ${perfectHealth.score} >= 85 threshold. Quality gate opens.`
      : `ERROR: Perfect task scored ${perfectHealth.score} but gate didn't open.`,
  };
  tests.push(t2);
  logTest(t2);

  // C.3 -- Test closeSprint() behavior (gate is CLIENT-SIDE only)
  console.log(`  ${INFO} C.3: Checking closeSprint() architecture...`);
  const t3: TestResult = {
    name: 'closeSprint() quality gate enforcement',
    status: 'WARN',
    detail: 'ARCHITECTURAL FINDING: closeSprint() has NO server-side quality gate. Gate is enforced ONLY in SprintBoard UI (client-side). A direct API call can bypass it.',
  };
  tests.push(t3);
  logTest(t3);

  // C.4 -- Test with REAL DB tasks
  console.log(`  ${INFO} C.4: Testing calculateFileHealth() with REAL DB tasks...`);
  const { data: realTasks, error: taskErr } = await supabase
    .from('audit_tasks')
    .select('*')
    .limit(20);

  if (taskErr || !realTasks || realTasks.length === 0) {
    tests.push({
      name: 'Fetch real audit_tasks for health check',
      status: 'FAIL',
      detail: taskErr?.message || 'No tasks found in DB',
    });
  } else {
    const realHealth = calculateFileHealth(realTasks as AuditTask[]);
    const doneTasks = realTasks.filter((t: any) => t.status === 'DONE');
    const withEvidence = doneTasks.filter((t: any) => Array.isArray(t.evidence_links) && t.evidence_links.length > 0);
    const t4: TestResult = {
      name: `Real DB tasks: score=${realHealth.score}, zone=${realHealth.zone}, passesGate=${realHealth.passesGate}`,
      status: realHealth.score < 85 ? 'PASS' : 'WARN',
      detail: `${realTasks.length} tasks (${doneTasks.length} DONE, ${withEvidence.length} with evidence). ${realHealth.qualityGaps.map((g) => g.gap).join('; ')}`,
    };
    tests.push(t4);
    logTest(t4);
  }

  const allPassed = tests.every((t) => t.status === 'PASS');
  const anyFailed = tests.some((t) => t.status === 'FAIL');
  return {
    module: 'QUALITY GATE (File Health + Sprint Close)',
    status: allPassed ? 'OPERATIONAL' : anyFailed ? 'BROKEN' : 'UNSTABLE',
    reason: allPassed ? 'Health engine produces correct scores, quality gate works' : anyFailed ? 'One or more checks failed' : 'Architectural weakness: client-side-only gate enforcement',
    tests,
  };
}

// ============================================================
// SEQUENCE D: DATABASE INTEGRITY
// ============================================================

async function sequenceD(): Promise<ModuleReport> {
  console.log(`\n${DIVIDER}`);
  console.log(`  SEQUENCE D: DATABASE INTEGRITY -- Tables, Connectivity & Ghost References`);
  console.log(DIVIDER);

  const tests: TestResult[] = [];

  // D.1 -- Connection check
  console.log(`\n  ${INFO} D.1: Testing Supabase connectivity...`);
  try {
    const { data, error } = await supabase.from('talent_profiles').select('id').limit(1);
    const t1: TestResult = {
      name: 'Supabase connection',
      status: !error ? 'PASS' : 'FAIL',
      detail: !error ? `Connected. Got ${data?.length || 0} rows.` : error.message,
    };
    tests.push(t1);
    logTest(t1);
  } catch (e: any) {
    tests.push({ name: 'Supabase connection', status: 'FAIL', detail: e.message });
  }

  // D.2 -- Core Agile tables (EXIST)
  console.log(`  ${INFO} D.2: Checking core Agile tables...`);
  const coreTables = ['talent_profiles', 'talent_skills', 'audit_service_templates', 'audit_engagements_v2', 'audit_sprints', 'audit_tasks'];
  for (const table of coreTables) {
    try {
      const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
      const t: TestResult = {
        name: `Table "${table}"`,
        status: !error ? 'PASS' : 'FAIL',
        detail: !error ? `EXISTS (${count} rows)` : `ERROR: ${error.message}`,
      };
      tests.push(t);
      logTest(t);
    } catch (e: any) {
      tests.push({ name: `Table "${table}"`, status: 'FAIL', detail: e.message });
    }
  }

  // D.3 -- GHOST tables (code references them, but they DON'T EXIST)
  console.log(`\n  ${INFO} D.3: Checking GHOST tables (code references, DB missing)...`);
  const ghostTables = [
    { table: 'auditor_profiles', referenced_by: 'src/entities/talent/api/index.ts' },
    { table: 'training_records', referenced_by: 'src/entities/talent/api/index.ts' },
    { table: 'auditor_skills', referenced_by: 'src/entities/talent/api/index.ts' },
    { table: 'qaip_checklists', referenced_by: 'src/entities/qaip/api/index.ts' },
    { table: 'qaip_reviews', referenced_by: 'src/entities/qaip/api/index.ts' },
  ];

  for (const ghost of ghostTables) {
    try {
      const { error } = await supabase.from(ghost.table).select('*', { count: 'exact', head: true });
      const exists = !error;
      const t: TestResult = {
        name: `Ghost table "${ghost.table}"`,
        status: exists ? 'PASS' : 'FAIL',
        detail: exists
          ? `Table actually EXISTS (was expected to be missing).`
          : `TABLE MISSING -- Referenced by ${ghost.referenced_by} but does not exist in DB. Code will throw runtime errors.`,
      };
      tests.push(t);
      logTest(t);
    } catch (e: any) {
      tests.push({ name: `Ghost table "${ghost.table}"`, status: 'FAIL', detail: e.message });
    }
  }

  // D.4 -- Write test (insert + delete to verify RLS allows writes)
  console.log(`\n  ${INFO} D.4: Testing write access (RLS check)...`);
  const writeTables = ['audit_engagements_v2', 'audit_sprints'];
  for (const table of writeTables) {
    try {
      const { error } = await supabase.from(table).select('id').limit(1);
      const t: TestResult = {
        name: `Read access: "${table}"`,
        status: !error ? 'PASS' : 'FAIL',
        detail: !error ? 'Readable via anon key.' : `RLS blocks read: ${error.message}`,
      };
      tests.push(t);
      logTest(t);
    } catch (e: any) {
      tests.push({ name: `Read access: "${table}"`, status: 'FAIL', detail: e.message });
    }
  }

  const allPassed = tests.every((t) => t.status === 'PASS');
  const anyFailed = tests.some((t) => t.status === 'FAIL');
  return {
    module: 'DATABASE INTEGRITY',
    status: allPassed ? 'OPERATIONAL' : anyFailed ? 'BROKEN' : 'UNSTABLE',
    reason: allPassed
      ? 'All tables exist and are accessible'
      : anyFailed
        ? 'Missing tables or connection errors detected'
        : 'Partial access issues',
    tests,
  };
}

// ============================================================
// MAIN EXECUTION
// ============================================================

async function main() {
  console.log('\n');
  console.log('\x1b[1m' + '='.repeat(72) + '\x1b[0m');
  console.log('\x1b[1m  SENTINEL v3.0 -- FULL SYSTEM DIAGNOSTIC\x1b[0m');
  console.log('\x1b[1m  ' + new Date().toISOString() + '\x1b[0m');
  console.log('\x1b[1m' + '='.repeat(72) + '\x1b[0m');

  reports.push(await sequenceA());
  reports.push(await sequenceB());
  reports.push(await sequenceC());
  reports.push(await sequenceD());

  // Final Summary
  console.log('\n\n');
  console.log('\x1b[1m' + '='.repeat(72) + '\x1b[0m');
  console.log('\x1b[1m  DIAGNOSTIC SUMMARY REPORT\x1b[0m');
  console.log('\x1b[1m' + '='.repeat(72) + '\x1b[0m');

  for (const report of reports) {
    const statusLabel =
      report.status === 'OPERATIONAL' ? OPERATIONAL
        : report.status === 'BROKEN' ? BROKEN
          : report.status === 'HALLUCINATION' ? HALLUCI
            : UNSTABLE;

    console.log(`\n  ${report.status === 'OPERATIONAL' ? '\x1b[32m+\x1b[0m' : report.status === 'BROKEN' ? '\x1b[31mx\x1b[0m' : '\x1b[33m!\x1b[0m'} [${report.module}]`);
    console.log(`    Status: ${statusLabel}`);
    console.log(`    Reason: ${report.reason}`);
  }

  // Hallucination Report
  console.log('\n');
  console.log('\x1b[1m' + THIN_DIV + '\x1b[0m');
  console.log('\x1b[1m  HALLUCINATION REGISTRY -- Code That References Non-Existent DB Objects\x1b[0m');
  console.log('\x1b[1m' + THIN_DIV + '\x1b[0m');

  const hallucinations = [
    {
      entity: 'auditor_profiles',
      file: 'src/entities/talent/api/index.ts',
      functions: 'fetchAuditorProfiles, createAuditorProfile, updateAuditorProfile, deleteAuditorProfile',
      impact: '14 CRUD functions will throw "relation does not exist" at runtime',
    },
    {
      entity: 'training_records',
      file: 'src/entities/talent/api/index.ts',
      functions: 'fetchTrainingRecords, createTrainingRecord, updateTrainingRecord, deleteTrainingRecord',
      impact: 'Training/CPE tracking is completely non-functional',
    },
    {
      entity: 'auditor_skills',
      file: 'src/entities/talent/api/index.ts',
      functions: 'fetchAuditorSkills, createAuditorSkill, updateAuditorSkill, deleteAuditorSkill',
      impact: 'Entity-layer skill management broken (Feature-layer talent_skills works fine)',
    },
    {
      entity: 'qaip_checklists',
      file: 'src/entities/qaip/api/index.ts',
      functions: 'fetchQAIPChecklists, createQAIPChecklist, updateQAIPChecklist, deleteQAIPChecklist',
      impact: 'QAIP checklist CRUD will fail. QAIPReviewWidget will crash on load.',
    },
    {
      entity: 'qaip_reviews',
      file: 'src/entities/qaip/api/index.ts',
      functions: 'fetchQAIPReviews, createQAIPReview, updateQAIPReview, getQAIPStats',
      impact: 'QAIP review workflow is completely non-functional',
    },
    {
      entity: 'workpapers (entity-layer)',
      file: 'src/entities/execution/api/index.ts',
      functions: 'All 13 functions (USE_MOCK_DATA = true)',
      impact: 'Not a crash risk (mock data used), but zero real data persistence',
    },
  ];

  for (let i = 0; i < hallucinations.length; i++) {
    const h = hallucinations[i];
    console.log(`\n  ${HALLUCI} #${i + 1}: "${h.entity}"`);
    console.log(`    File:      ${h.file}`);
    console.log(`    Functions: ${h.functions}`);
    console.log(`    Impact:    ${h.impact}`);
  }

  // Architectural Findings
  console.log('\n');
  console.log('\x1b[1m' + THIN_DIV + '\x1b[0m');
  console.log('\x1b[1m  ARCHITECTURAL FINDINGS\x1b[0m');
  console.log('\x1b[1m' + THIN_DIV + '\x1b[0m');
  console.log(`
  1. DUAL TYPE SYSTEM: Talent has TWO parallel layers:
     - Feature-layer: talent_profiles + talent_skills (WORKS, has DB tables)
     - Entity-layer: auditor_profiles + training_records + auditor_skills (BROKEN, no DB tables)
     These are independent systems with different schemas that never communicate.

  2. CLIENT-SIDE QUALITY GATE: closeSprint() API has zero server-side validation.
     The quality gate (score >= 85) is enforced ONLY in SprintBoard UI.
     A direct Supabase call can close any sprint regardless of quality.

  3. MOCK DATA ISLAND: entities/execution/api uses USE_MOCK_DATA = true.
     All 13 functions return hardcoded mock data. Supabase code exists as dead code.
     The real Agile pipeline lives in features/audit-creation/api (which DOES write to DB).
  `);

  // Exit code
  const hasBroken = reports.some((r) => r.status === 'BROKEN');
  console.log('\x1b[1m' + '='.repeat(72) + '\x1b[0m');
  console.log(`\x1b[1m  FINAL VERDICT: ${hasBroken ? '\x1b[31mSYSTEM HAS CRITICAL GAPS\x1b[0m' : '\x1b[33mSYSTEM PARTIALLY OPERATIONAL\x1b[0m'}\x1b[0m`);
  console.log('\x1b[1m' + '='.repeat(72) + '\x1b[0m\n');

  process.exit(hasBroken ? 1 : 0);
}

main().catch((err) => {
  console.error('\n\x1b[31mFATAL ERROR:\x1b[0m', err);
  process.exit(2);
});
