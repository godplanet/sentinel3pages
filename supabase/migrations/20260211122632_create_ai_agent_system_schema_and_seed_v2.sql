/*
  # Create AI Agent System Schema + Seed Data

  1. New Tables
    - `ai_agents` - Registry of AI agent personas
      - `id` (uuid, PK), `name`, `codename`, `role`, `status`, `capabilities`, `avatar_color`, `created_at`
    - `agent_runs` - Execution history for agent missions
      - `id` (uuid, PK), `agent_id` (FK), `target_entity`, `status`, `start_time`, `end_time`, `outcome`, `created_at`
    - `agent_thoughts` - Step-by-step reasoning chain of agent execution
      - `id` (uuid, PK), `run_id` (FK), `step_number`, `thought_type`, `thought_process`, `action_taken`, `tool_output`, `created_at`

  2. Security
    - RLS enabled on all tables
    - Permissive anon policies for demo environment

  3. Seed Data
    - 3 agents: Sentinel Prime, Investigator, Chaos Monkey
    - 3 completed runs with thought chains (12 thoughts total)
*/

CREATE TABLE IF NOT EXISTS ai_agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  codename text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'INVESTIGATOR' CHECK (role IN ('INVESTIGATOR', 'NEGOTIATOR', 'CHAOS_MONKEY')),
  status text NOT NULL DEFAULT 'IDLE' CHECK (status IN ('IDLE', 'BUSY', 'ERROR')),
  capabilities text[] NOT NULL DEFAULT '{}',
  avatar_color text NOT NULL DEFAULT '#3B82F6',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE ai_agents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_ai_agents_select" ON ai_agents FOR SELECT TO anon USING (true);
CREATE POLICY "anon_ai_agents_insert" ON ai_agents FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_ai_agents_update" ON ai_agents FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS agent_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES ai_agents(id) ON DELETE CASCADE,
  target_entity text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'RUNNING' CHECK (status IN ('RUNNING', 'SUCCESS', 'FLAGGED', 'ERROR')),
  start_time timestamptz NOT NULL DEFAULT now(),
  end_time timestamptz,
  outcome text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE agent_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_agent_runs_select" ON agent_runs FOR SELECT TO anon USING (true);
CREATE POLICY "anon_agent_runs_insert" ON agent_runs FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_agent_runs_update" ON agent_runs FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS agent_thoughts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id uuid NOT NULL REFERENCES agent_runs(id) ON DELETE CASCADE,
  step_number integer NOT NULL DEFAULT 1,
  thought_type text NOT NULL DEFAULT 'THINKING' CHECK (thought_type IN ('THINKING', 'ACTION', 'OBSERVATION', 'CONCLUSION')),
  thought_process text NOT NULL DEFAULT '',
  action_taken text NOT NULL DEFAULT '',
  tool_output jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE agent_thoughts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_agent_thoughts_select" ON agent_thoughts FOR SELECT TO anon USING (true);
CREATE POLICY "anon_agent_thoughts_insert" ON agent_thoughts FOR INSERT TO anon WITH CHECK (true);

-- ===== SEED DATA =====

INSERT INTO ai_agents (id, name, codename, role, status, capabilities, avatar_color) VALUES
  ('aa100000-0000-0000-0000-000000000001', 'Sentinel Prime', 'PRIME',
   'INVESTIGATOR', 'IDLE',
   ARRAY['risk_analysis', 'finding_generation', 'report_writing', 'anomaly_detection', 'regulation_lookup', 'grading_calculation'],
   '#3B82F6'),
  ('aa100000-0000-0000-0000-000000000002', 'The Investigator', 'SHERLOCK',
   'INVESTIGATOR', 'IDLE',
   ARRAY['evidence_analysis', 'contradiction_detection', 'link_analysis', 'timeline_reconstruction', 'entity_extraction'],
   '#EF4444'),
  ('aa100000-0000-0000-0000-000000000003', 'Chaos Monkey', 'HAVOC',
   'CHAOS_MONKEY', 'IDLE',
   ARRAY['shadow_injection', 'benford_test', 'structuring_test', 'ghost_payroll_test', 'stress_testing'],
   '#F59E0B');

INSERT INTO agent_runs (id, agent_id, target_entity, status, start_time, end_time, outcome) VALUES
  ('aa200000-0000-0000-0000-000000000001', 'aa100000-0000-0000-0000-000000000001',
   'Kadikoy Sube Denetimi (e0000000-0000-0000-0000-000000000001)', 'SUCCESS',
   now() - interval '4 hours', now() - interval '3 hours 45 minutes',
   'Risk analizi tamamlandi. 3 yuksek riskli alan tespit edildi: Kasa yonetimi, yetki limitleri, KYC uyumu.'),
  ('aa200000-0000-0000-0000-000000000002', 'aa100000-0000-0000-0000-000000000002',
   'Sube Zimmet Vakasi (f2000000-0000-0000-0000-000000000001)', 'FLAGGED',
   now() - interval '2 hours', now() - interval '1 hour 30 minutes',
   'Sorusturma analizi: Veznedar ifadesinde 2 celiski tespit edildi. Kasa hareketleri ile duzeltme fisleri arasinda tutarsizlik mevcut.'),
  ('aa200000-0000-0000-0000-000000000003', 'aa100000-0000-0000-0000-000000000003',
   'Benford Test - CCM Transactions', 'SUCCESS',
   now() - interval '1 hour', now() - interval '50 minutes',
   'Chaos test tamamlandi. 10 shadow transaction enjekte edildi. CCM sistemi 8 tanesini yakaladi (Detection Rate: 80%).');

INSERT INTO agent_thoughts (id, run_id, step_number, thought_type, thought_process, action_taken, tool_output) VALUES
  ('aa300000-0000-0000-0000-000000000001', 'aa200000-0000-0000-0000-000000000001', 1,
   'THINKING', 'Kadikoy sube denetimi icin risk profilini degerlendirmem gerekiyor. Once mevcut RKM verilerini cekeyim.',
   'fetch_rkm_risks(engagement_id)', '{"risks_found": 4, "high_risk_count": 2}'::jsonb),
  ('aa300000-0000-0000-0000-000000000002', 'aa200000-0000-0000-0000-000000000001', 2,
   'ACTION', 'RKM verileri alindi. Simdi son 12 ayin CCM alert verilerini analiz edeyim.',
   'query_ccm_alerts(entity_id)', '{"alerts": 5, "critical": 1, "high": 2}'::jsonb),
  ('aa300000-0000-0000-0000-000000000003', 'aa200000-0000-0000-0000-000000000001', 3,
   'OBSERVATION', 'Kasa yonetiminde tekrarlayan anomaliler var. Benford testi de basarisiz olmus. Bu alan oncelikli denetim gerektiriyor.',
   'calculate_risk_score(impact=4, likelihood=4)', '{"risk_score": 85.2, "category": "CRITICAL"}'::jsonb),
  ('aa300000-0000-0000-0000-000000000004', 'aa200000-0000-0000-0000-000000000001', 4,
   'CONCLUSION', 'Analiz tamamlandi. 3 yuksek riskli alan belirlendi: (1) Kasa Yonetimi - Kritik, (2) Yetki Limitleri - Yuksek, (3) KYC Uyumu - Yuksek.',
   'generate_report_section()', '{"findings_suggested": 3, "report_generated": true}'::jsonb),
  ('aa300000-0000-0000-0000-000000000005', 'aa200000-0000-0000-0000-000000000002', 1,
   'THINKING', 'Zimmet vakasi dosyasini inceleyecegim. Once dijital delilleri ve ifade tutanaklarini cekeyim.',
   'fetch_case_evidence(case_id)', '{"evidence_count": 3, "types": ["LOG", "EMAIL", "INVOICE"]}'::jsonb),
  ('aa300000-0000-0000-0000-000000000006', 'aa200000-0000-0000-0000-000000000002', 2,
   'ACTION', 'Deliller alindi. Ifade tutanagini celiski analizi icin NLP motoruna gonderiyorum.',
   'analyze_contradictions(transcript)', '{"contradictions_found": 2, "severity": "HIGH"}'::jsonb),
  ('aa300000-0000-0000-0000-000000000007', 'aa200000-0000-0000-0000-000000000002', 3,
   'OBSERVATION', 'TUTAR CELISKISI: Supheli 6.500 TL diyor ama duzeltme fisi 7.200 TL. 700 TL fark aciklanamamis.',
   'flag_contradictions()', '{"flags": ["AMOUNT_MISMATCH", "VAGUE_RESPONSE"]}'::jsonb),
  ('aa300000-0000-0000-0000-000000000008', 'aa200000-0000-0000-0000-000000000002', 4,
   'CONCLUSION', 'Sorusturma analizi: 2 onemli celiski tespit edildi. Kisisel banka hesap hareketlerinin incelenmesi onerilir.',
   'update_case_status()', '{"status": "FLAGGED", "recommendations": 3}'::jsonb),
  ('aa300000-0000-0000-0000-000000000009', 'aa200000-0000-0000-0000-000000000003', 1,
   'THINKING', 'Benford anomali testi yapacagim. 10 adet shadow transaction olusturup CCM sisteminin yakalama oranini test edecegim.',
   'generate_shadow_transactions(10)', '{"generated": 10, "scenario": "BENFORD_MANIPULATION"}'::jsonb),
  ('aa300000-0000-0000-0000-000000000010', 'aa200000-0000-0000-0000-000000000003', 2,
   'ACTION', 'Shadow islemler enjekte edildi. 30 saniye bekliyorum, sonra CCM alert sayisini kontrol edecegim.',
   'inject_and_wait(30s)', '{"injected": 10, "wait_seconds": 30}'::jsonb),
  ('aa300000-0000-0000-0000-000000000011', 'aa200000-0000-0000-0000-000000000003', 3,
   'OBSERVATION', 'CCM sistemi 10 shadow islemden 8 tanesini yakaladi. Kacan 2 islem dusuk tutarli (< 5.000 TL) olanlar.',
   'check_detection_rate()', '{"detected": 8, "missed": 2, "rate": 0.80}'::jsonb),
  ('aa300000-0000-0000-0000-000000000012', 'aa200000-0000-0000-0000-000000000003', 4,
   'CONCLUSION', 'Chaos test sonucu: Detection Rate %80. Dusuk tutarli anomaliler icin esik degeri dusurulmesi onerilir.',
   'generate_test_report()', '{"overall_score": "B+", "recommendation": "Lower threshold for amounts < 5000 TRY"}'::jsonb);
