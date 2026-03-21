-- 课后学生个性化反馈表
-- 设计决策：仅存 schedule_id + student_id，course_id/teacher_id 通过 JOIN 推导
CREATE TABLE IF NOT EXISTS student_lesson_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID NOT NULL REFERENCES course_schedules(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES users(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  suggestion TEXT,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(schedule_id, student_id)
);

-- 检查约束：rating/comment/suggestion 至少有一个非空（幂等）
DO $$ BEGIN
  ALTER TABLE student_lesson_feedback ADD CONSTRAINT chk_feedback_content
    CHECK (rating IS NOT NULL OR comment IS NOT NULL OR suggestion IS NOT NULL);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 索引
CREATE INDEX IF NOT EXISTS idx_slf_student_status ON student_lesson_feedback(student_id, status);
CREATE INDEX IF NOT EXISTS idx_slf_schedule ON student_lesson_feedback(schedule_id);
