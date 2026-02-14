-- SİSTEM STABİLİZASYONU İÇİN RLS BYPASS (Sadece Dev/Test Ortamı İçin)
-- Bu script, anonim kullanıcının (Seeder) trigger üzerinden tarihçe yazabilmesi için kalkanları indirir.

DROP POLICY IF EXISTS "Allow anon full access to risk_history" ON public.risk_history;
CREATE POLICY "Allow anon full access to risk_history" ON public.risk_history FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon full access to finding_history" ON public.finding_history;
CREATE POLICY "Allow anon full access to finding_history" ON public.finding_history FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon full access to action_logs" ON public.action_logs;
CREATE POLICY "Allow anon full access to action_logs" ON public.action_logs FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon full access to workpaper_activity_logs" ON public.workpaper_activity_logs;
CREATE POLICY "Allow anon full access to workpaper_activity_logs" ON public.workpaper_activity_logs FOR ALL TO anon USING (true) WITH CHECK (true);