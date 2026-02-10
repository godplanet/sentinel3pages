/*
  # Review Notes & Workpaper Activity Logs

  1. New Tables
    - `review_notes` (Internal coaching/feedback loop)
      - `id` (uuid, primary key)
      - `workpaper_id` (uuid, FK to workpapers, cascade delete)
      - `note_text` (text, not null) - the review feedback content
      - `status` (varchar: Open, Resolved) - tracks resolution
      - `created_by` (uuid) - user who authored the note
      - `created_at` (timestamptz) - when the note was created
      - `resolved_at` (timestamptz) - when the note was resolved
      - `resolved_by` (uuid) - user who resolved the note

    - `workpaper_activity_logs` (Immutable audit trail / Black Box)
      - `id` (uuid, primary key)
      - `workpaper_id` (uuid, FK to workpapers, cascade delete)
      - `user_id` (uuid) - user who performed the action
      - `user_display_name` (text) - cached display name at log time
      - `action_type` (varchar) - category: STATUS_CHANGE, FILE_UPLOAD, SIGN_OFF, REVIEW_NOTE, FINDING_ADDED, etc.
      - `details` (text) - human-readable description of what happened
      - `created_at` (timestamptz) - timestamp of the event

  2. Security
    - RLS enabled on both tables
    - Authenticated users can read/write based on workpaper access
    - Dev-mode anon policies for testing

  3. Indexes
    - workpaper_id index on both tables for fast lookups
    - created_at index on activity_logs for timeline queries
*/

-- 1. Review Notes (Internal Feedback Loop)
CREATE TABLE IF NOT EXISTS review_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workpaper_id UUID NOT NULL REFERENCES workpapers(id) ON DELETE CASCADE,
  note_text TEXT NOT NULL,
  status VARCHAR(20) CHECK (status IN ('Open', 'Resolved')) DEFAULT 'Open',
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID
);

-- 2. Workpaper Activity Logs (The Black Box)
CREATE TABLE IF NOT EXISTS workpaper_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workpaper_id UUID NOT NULL REFERENCES workpapers(id) ON DELETE CASCADE,
  user_id UUID,
  user_display_name TEXT DEFAULT '',
  action_type VARCHAR(50) NOT NULL,
  details TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE review_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE workpaper_activity_logs ENABLE ROW LEVEL SECURITY;

-- RLS for review_notes (authenticated)
CREATE POLICY "Auth users can select review_notes"
  ON review_notes FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM workpapers w WHERE w.id = review_notes.workpaper_id));

CREATE POLICY "Auth users can insert review_notes"
  ON review_notes FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM workpapers w WHERE w.id = review_notes.workpaper_id));

CREATE POLICY "Auth users can update review_notes"
  ON review_notes FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM workpapers w WHERE w.id = review_notes.workpaper_id))
  WITH CHECK (EXISTS (SELECT 1 FROM workpapers w WHERE w.id = review_notes.workpaper_id));

CREATE POLICY "Auth users can delete review_notes"
  ON review_notes FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM workpapers w WHERE w.id = review_notes.workpaper_id));

-- RLS for workpaper_activity_logs (authenticated)
CREATE POLICY "Auth users can select activity_logs"
  ON workpaper_activity_logs FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM workpapers w WHERE w.id = workpaper_activity_logs.workpaper_id));

CREATE POLICY "Auth users can insert activity_logs"
  ON workpaper_activity_logs FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM workpapers w WHERE w.id = workpaper_activity_logs.workpaper_id));

-- Dev-mode anon policies for testing
CREATE POLICY "Dev anon select review_notes"
  ON review_notes FOR SELECT TO anon USING (true);

CREATE POLICY "Dev anon insert review_notes"
  ON review_notes FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Dev anon update review_notes"
  ON review_notes FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Dev anon delete review_notes"
  ON review_notes FOR DELETE TO anon USING (true);

CREATE POLICY "Dev anon select activity_logs"
  ON workpaper_activity_logs FOR SELECT TO anon USING (true);

CREATE POLICY "Dev anon insert activity_logs"
  ON workpaper_activity_logs FOR INSERT TO anon WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_review_notes_workpaper_id
  ON review_notes(workpaper_id);

CREATE INDEX IF NOT EXISTS idx_review_notes_status
  ON review_notes(status);

CREATE INDEX IF NOT EXISTS idx_activity_logs_workpaper_id
  ON workpaper_activity_logs(workpaper_id);

CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at
  ON workpaper_activity_logs(created_at);

CREATE INDEX IF NOT EXISTS idx_activity_logs_action_type
  ON workpaper_activity_logs(action_type);

-- Seed sample data
DO $$
DECLARE
  v_wp_id UUID;
BEGIN
  SELECT id INTO v_wp_id FROM workpapers LIMIT 1;

  IF v_wp_id IS NOT NULL THEN
    INSERT INTO review_notes (workpaper_id, note_text, status, created_at) VALUES
      (v_wp_id, 'Ornekleme buyuklugu yetersiz gorunuyor. Lutfen 25 yerine 40 dosya inceleyiniz.', 'Open', now() - interval '2 hours'),
      (v_wp_id, 'Test proseduru Step 3 icin kaynakca eksik. BDDK Yonetmeligi madde 12 referansini ekleyiniz.', 'Open', now() - interval '1 hour'),
      (v_wp_id, 'Dosya formatlamasi cok guzel, tebrikler. Sadece basliklari guncelleyin.', 'Resolved', now() - interval '3 hours');

    INSERT INTO workpaper_activity_logs (workpaper_id, user_display_name, action_type, details, created_at) VALUES
      (v_wp_id, 'Ahmet Yilmaz', 'STATUS_CHANGE', 'Durum degistirildi: Taslak -> Devam Ediyor', now() - interval '5 hours'),
      (v_wp_id, 'Ayse Demir', 'FILE_UPLOAD', 'Mizan_2026_Q1.pdf yuklendi', now() - interval '4 hours'),
      (v_wp_id, 'Mehmet Kaya', 'REVIEW_NOTE', 'Yeni inceleme notu eklendi', now() - interval '3 hours'),
      (v_wp_id, 'Ahmet Yilmaz', 'FINDING_ADDED', 'Yeni bulgu eklendi: Eksik Teminat Degerlemesi (Yuksek)', now() - interval '2 hours'),
      (v_wp_id, 'Ayse Demir', 'SIGN_OFF', 'Hazirlayan olarak imzaladi', now() - interval '1 hour'),
      (v_wp_id, 'Fatma Ozturk', 'STATUS_CHANGE', 'Risk seviyesi degistirildi: Orta -> Yuksek', now() - interval '30 minutes');
  END IF;
END $$;
