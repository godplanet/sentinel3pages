/*
  # Fix review_notes Status Constraint

  The existing check constraint on review_notes.status requires uppercase 'OPEN'/'RESOLVED'
  but the application code uses mixed-case 'Open'/'Resolved'. This migration drops the
  old constraint and replaces it with one matching the application's values.
*/
ALTER TABLE review_notes DROP CONSTRAINT IF EXISTS review_notes_status_check;

ALTER TABLE review_notes
  ADD CONSTRAINT review_notes_status_check
  CHECK (status IN ('Open', 'Resolved', 'OPEN', 'RESOLVED'));
