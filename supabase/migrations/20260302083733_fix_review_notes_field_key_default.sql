/*
  # Fix review_notes field_key Default

  The review_notes table has a NOT NULL constraint on field_key but no default value.
  The application inserts review notes without supplying field_key (it's an internal
  field used by a legacy module). Adding a safe default resolves the constraint error.
*/
ALTER TABLE review_notes ALTER COLUMN field_key SET DEFAULT 'general';
