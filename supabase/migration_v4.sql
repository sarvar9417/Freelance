-- ═══════════════════════════════════════════════════════════════════════════
-- FREELANCER SCHOOL — MIGRATION v4
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. Enrollments ga completed_at ustunini qo'shish (agar mavjud bo'lmasa)
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS completed_at timestamptz;

-- 2. Triggerni yangilash (agar completed_at yangilanishi kerak bo'lsa)
CREATE OR REPLACE FUNCTION update_course_progress_on_lesson()
RETURNS trigger AS $$
DECLARE
  v_total_lessons int;
  v_completed_lessons int;
  v_new_progress int;
BEGIN
  SELECT COUNT(*) INTO v_total_lessons
  FROM lessons WHERE course_id = NEW.course_id;

  SELECT COUNT(*) INTO v_completed_lessons
  FROM lesson_progress
  WHERE student_id = NEW.student_id AND course_id = NEW.course_id;

  v_new_progress := CASE
    WHEN v_total_lessons = 0 THEN 0
    ELSE (v_completed_lessons * 100 / v_total_lessons)
  END;

  UPDATE enrollments
  SET
    progress = v_new_progress,
    last_accessed = now(),
    completed_at = CASE
      WHEN v_new_progress >= 100 AND completed_at IS NULL THEN now()
      ELSE completed_at
    END
  WHERE student_id = NEW.student_id AND course_id = NEW.course_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
