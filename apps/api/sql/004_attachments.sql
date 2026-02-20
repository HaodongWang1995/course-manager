-- Migration 004: Attachments (course & schedule file uploads)
CREATE TABLE IF NOT EXISTS attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  schedule_id UUID REFERENCES course_schedules(id) ON DELETE CASCADE,
  uploader_id UUID NOT NULL REFERENCES users(id),
  filename VARCHAR(255) NOT NULL,
  file_key VARCHAR(500) NOT NULL UNIQUE,
  file_type VARCHAR(100),
  file_size BIGINT,
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT attachment_has_parent CHECK (course_id IS NOT NULL OR schedule_id IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_attachments_course ON attachments(course_id);
CREATE INDEX IF NOT EXISTS idx_attachments_schedule ON attachments(schedule_id);
