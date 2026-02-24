-- Migration 005: Allow attachments to be linked to assignment submissions

-- Add submission_id to attachments table
ALTER TABLE attachments
  ADD COLUMN IF NOT EXISTS submission_id UUID REFERENCES assignment_submissions(id) ON DELETE CASCADE;

-- Drop old constraint that only allows course_id or schedule_id
ALTER TABLE attachments
  DROP CONSTRAINT IF EXISTS attachment_has_parent;

-- New constraint: at least one parent must be set
ALTER TABLE attachments
  ADD CONSTRAINT attachment_has_parent CHECK (
    course_id IS NOT NULL OR schedule_id IS NOT NULL OR submission_id IS NOT NULL
  );

CREATE INDEX IF NOT EXISTS idx_attachments_submission ON attachments(submission_id);
