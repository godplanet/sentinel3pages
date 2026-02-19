/*
  # Enhance Playbook Entries for Talent OS

  ## Changes
  The `playbook_entries` table already exists with `author_id` as the user FK.
  This migration:
  - Adds `category`, `tags`, and `tenant_id` columns if missing
  - Adds a SELECT policy for authors to view their own entries
  - Adds an index for performance

  ## Notes
  - Preserves all existing data and policies
  - Uses IF NOT EXISTS / conditional logic throughout
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'playbook_entries' AND column_name = 'category'
  ) THEN
    ALTER TABLE playbook_entries ADD COLUMN category text NOT NULL DEFAULT 'LESSON_LEARNED'
      CHECK (category IN ('BEST_PRACTICE','LESSON_LEARNED','RISK_INSIGHT','METHODOLOGY','OBSERVATION'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'playbook_entries' AND column_name = 'tags'
  ) THEN
    ALTER TABLE playbook_entries ADD COLUMN tags text[] NOT NULL DEFAULT '{}';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'playbook_entries' AND column_name = 'tenant_id'
  ) THEN
    ALTER TABLE playbook_entries ADD COLUMN tenant_id text NOT NULL DEFAULT 'default';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'playbook_entries' AND policyname = 'Authors can read own entries'
  ) THEN
    CREATE POLICY "Authors can read own entries"
      ON playbook_entries FOR SELECT
      TO authenticated
      USING (auth.uid() = author_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_playbook_entries_author_id ON playbook_entries(author_id);
CREATE INDEX IF NOT EXISTS idx_playbook_entries_category ON playbook_entries(category);
