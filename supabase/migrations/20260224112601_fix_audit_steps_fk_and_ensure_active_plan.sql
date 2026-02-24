/*
  # Fix Audit Steps FK + Ensure Active Plan

  ## Changes
  1. audit_steps tablosuna engagement_id FK constraint eklenir (veri zincirini kapatir)
  2. Demo tenant icin APPROVED durumunda aktif bir yillik plan yoksa olusturulur
     (StrategicPlanningPage'deki "Yeni Gorev" butonunun calismasi icin gerekli)

  ## Tables Modified
  - audit_steps: engagement_id -> audit_engagements FK eklendi
  - audit_plans: demo tenant icin APPROVED plan eklendi (yoksa)
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'audit_steps'
      AND constraint_name = 'audit_steps_engagement_id_fkey'
      AND constraint_type = 'FOREIGN KEY'
  ) THEN
    ALTER TABLE public.audit_steps
      ADD CONSTRAINT audit_steps_engagement_id_fkey
      FOREIGN KEY (engagement_id) REFERENCES public.audit_engagements(id) ON DELETE CASCADE;
  END IF;
END $$;

INSERT INTO public.audit_plans (
  id,
  tenant_id,
  title,
  period_start,
  period_end,
  status,
  version
)
SELECT
  gen_random_uuid(),
  '11111111-1111-1111-1111-111111111111'::uuid,
  '2026 Yillik Denetim Plani',
  '2026-01-01',
  '2026-12-31',
  'APPROVED',
  1
WHERE NOT EXISTS (
  SELECT 1 FROM public.audit_plans
  WHERE tenant_id = '11111111-1111-1111-1111-111111111111'::uuid
    AND status = 'APPROVED'
);
