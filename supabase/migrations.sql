-- ═══════════════════════════════════════════════════════════════════════════
-- FREELANCER SCHOOL — MIGRATIONS (faqat yangi narsalar)
-- Agar jadvallar allaqachon mavjud bo'lsa, bu faylni ishlatish yetarli
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── 1. YANGI JADVALLAR ──────────────────────────────────────────────────

-- Dars progress jadvali (yangi)
CREATE TABLE IF NOT EXISTS lesson_progress (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id     uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  course_id     uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  completed_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE(student_id, lesson_id)
);

-- Bildirishnomalar jadvali (yangi)
CREATE TABLE IF NOT EXISTS notifications (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type        text NOT NULL,
  title       text NOT NULL,
  message     text NOT NULL,
  link        text,
  is_read     boolean NOT NULL DEFAULT false,
  data        jsonb,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Enrollments ga completed_at ustunini qo'shish
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS completed_at timestamptz;

-- ─── 2. RLS ──────────────────────────────────────────────────────────────

ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications   ENABLE ROW LEVEL SECURITY;

-- Lesson Progress policies
DROP POLICY IF EXISTS "lesson_progress_select_own" ON lesson_progress;
DROP POLICY IF EXISTS "lesson_progress_insert_own" ON lesson_progress;
CREATE POLICY "lesson_progress_select_own" ON lesson_progress FOR SELECT USING (
  student_id = auth.uid() OR
  EXISTS (SELECT 1 FROM courses WHERE id = lesson_progress.course_id AND teacher_id = auth.uid())
);
CREATE POLICY "lesson_progress_insert_own" ON lesson_progress FOR INSERT WITH CHECK (auth.uid() = student_id);

-- Notifications policies
DROP POLICY IF EXISTS "notifications_select_own" ON notifications;
DROP POLICY IF EXISTS "notifications_update_own" ON notifications;
DROP POLICY IF EXISTS "notifications_delete_own" ON notifications;
CREATE POLICY "notifications_select_own" ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "notifications_update_own" ON notifications FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "notifications_delete_own" ON notifications FOR DELETE USING (user_id = auth.uid());

-- Submissions update policy (o'qituvchi baho qo'ya olsin)
DROP POLICY IF EXISTS "submissions_update_teacher" ON submissions;
CREATE POLICY "submissions_update_teacher" ON submissions FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM tasks t
    JOIN courses c ON c.id = t.course_id
    WHERE t.id = submissions.task_id AND c.teacher_id = auth.uid()
  )
);

-- ─── 3. REALTIME ─────────────────────────────────────────────────────────

DO $$
DECLARE tbl text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY['notifications','submissions','enrollments','lesson_progress']
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND tablename = tbl
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE %I', tbl);
    END IF;
  END LOOP;
END $$;

-- ─── 4. INDEKSLAR ────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_notifications_user_id    ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read    ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_student  ON lesson_progress(student_id, course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student      ON enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course       ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_submissions_task         ON submissions(task_id);
CREATE INDEX IF NOT EXISTS idx_submissions_student      ON submissions(student_id);

-- ─── 5. TRIGGER FUNKSIYALAR ──────────────────────────────────────────────

-- Topshiriq baholanganda o'quvchiga bildirishnoma
CREATE OR REPLACE FUNCTION notify_submission_graded()
RETURNS trigger AS $$
DECLARE
  v_task_title  text;
  v_score_text  text;
BEGIN
  IF NEW.status IN ('graded', 'revision') AND OLD.status = 'pending' THEN
    SELECT t.title INTO v_task_title
    FROM tasks t WHERE t.id = NEW.task_id;

    IF NEW.status = 'graded' THEN
      v_score_text := COALESCE(' — ' || NEW.score || ' ball', '');
      INSERT INTO notifications (user_id, type, title, message, link, data)
      VALUES (
        NEW.student_id,
        'submission_graded',
        'Topshiriq baholandi! ✅',
        COALESCE(v_task_title, 'Topshiriq') || ' baholandi' || v_score_text,
        '/student/tasks',
        jsonb_build_object('task_id', NEW.task_id, 'submission_id', NEW.id, 'score', NEW.score)
      );
    ELSE
      INSERT INTO notifications (user_id, type, title, message, link, data)
      VALUES (
        NEW.student_id,
        'submission_revision',
        'Qayta topshirish talab qilinadi 🔄',
        COALESCE(v_task_title, 'Topshiriq') || '''ni qayta ko''rib chiqing',
        '/student/tasks',
        jsonb_build_object('task_id', NEW.task_id, 'submission_id', NEW.id)
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_submission_graded ON submissions;
CREATE TRIGGER on_submission_graded
  AFTER UPDATE ON submissions
  FOR EACH ROW EXECUTE FUNCTION notify_submission_graded();


-- Yangi topshiriq kelganda o'qituvchiga bildirishnoma
CREATE OR REPLACE FUNCTION notify_new_submission()
RETURNS trigger AS $$
DECLARE
  v_teacher_id    uuid;
  v_student_name  text;
  v_task_title    text;
  v_course_id     uuid;
BEGIN
  SELECT t.title, t.course_id, c.teacher_id
    INTO v_task_title, v_course_id, v_teacher_id
  FROM tasks t JOIN courses c ON c.id = t.course_id
  WHERE t.id = NEW.task_id;

  SELECT full_name INTO v_student_name FROM users WHERE id = NEW.student_id;

  IF v_teacher_id IS NOT NULL THEN
    INSERT INTO notifications (user_id, type, title, message, link, data)
    VALUES (
      v_teacher_id,
      'new_submission',
      'Yangi topshiriq keldi 📥',
      COALESCE(v_student_name, 'O''quvchi') || ' "' || COALESCE(v_task_title, 'topshiriq') || '" ni topshirdi',
      '/teacher/tasks/review',
      jsonb_build_object('submission_id', NEW.id, 'task_id', NEW.task_id, 'student_id', NEW.student_id, 'course_id', v_course_id)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_new_submission ON submissions;
CREATE TRIGGER on_new_submission
  AFTER INSERT ON submissions
  FOR EACH ROW EXECUTE FUNCTION notify_new_submission();


-- Yangi yozilishda o'qituvchiga bildirishnoma
CREATE OR REPLACE FUNCTION notify_new_enrollment()
RETURNS trigger AS $$
DECLARE
  v_teacher_id    uuid;
  v_student_name  text;
  v_course_title  text;
BEGIN
  SELECT c.teacher_id, c.title INTO v_teacher_id, v_course_title
  FROM courses c WHERE c.id = NEW.course_id;

  SELECT full_name INTO v_student_name FROM users WHERE id = NEW.student_id;

  IF v_teacher_id IS NOT NULL THEN
    INSERT INTO notifications (user_id, type, title, message, link, data)
    VALUES (
      v_teacher_id,
      'new_enrollment',
      'Yangi o''quvchi yozildi 🎓',
      COALESCE(v_student_name, 'O''quvchi') || ' "' || COALESCE(v_course_title, 'kurs') || '" ga yozildi',
      '/teacher/students',
      jsonb_build_object('student_id', NEW.student_id, 'course_id', NEW.course_id)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_new_enrollment ON enrollments;
CREATE TRIGGER on_new_enrollment
  AFTER INSERT ON enrollments
  FOR EACH ROW EXECUTE FUNCTION notify_new_enrollment();


-- Kurs 100% tugatilganda ikkala tomonga bildirishnoma
CREATE OR REPLACE FUNCTION notify_course_completed()
RETURNS trigger AS $$
DECLARE
  v_teacher_id    uuid;
  v_student_name  text;
  v_course_title  text;
BEGIN
  IF NEW.progress >= 100 AND OLD.progress < 100 THEN
    SELECT c.teacher_id, c.title INTO v_teacher_id, v_course_title
    FROM courses c WHERE c.id = NEW.course_id;

    SELECT full_name INTO v_student_name FROM users WHERE id = NEW.student_id;

    IF v_teacher_id IS NOT NULL THEN
      INSERT INTO notifications (user_id, type, title, message, link, data)
      VALUES (
        v_teacher_id,
        'course_completed',
        'O''quvchi kursni tugatdi! 🏆',
        COALESCE(v_student_name, 'O''quvchi') || ' "' || COALESCE(v_course_title, 'kurs') || '" ni 100% tugatdi!',
        '/teacher/students',
        jsonb_build_object('student_id', NEW.student_id, 'course_id', NEW.course_id)
      );
    END IF;

    INSERT INTO notifications (user_id, type, title, message, link, data)
    VALUES (
      NEW.student_id,
      'course_completed',
      'Tabriklaymiz! Kurs tugatildi 🎉',
      '"' || COALESCE(v_course_title, 'Kurs') || '" muvaffaqiyatli tugatildi! +500 XP',
      '/student/my-courses',
      jsonb_build_object('course_id', NEW.course_id, 'xp_gained', 500)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_course_completed ON enrollments;
CREATE TRIGGER on_course_completed
  AFTER UPDATE OF progress ON enrollments
  FOR EACH ROW EXECUTE FUNCTION notify_course_completed();


-- Yangi kurs nashr etilganda barcha o'quvchilarga bildirishnoma
CREATE OR REPLACE FUNCTION notify_new_course_published()
RETURNS trigger AS $$
DECLARE
  v_student       record;
  v_teacher_name  text;
BEGIN
  IF NEW.is_published = true AND (OLD.is_published IS DISTINCT FROM true) THEN
    SELECT full_name INTO v_teacher_name FROM users WHERE id = NEW.teacher_id;

    FOR v_student IN SELECT id FROM users WHERE role = 'student'
    LOOP
      INSERT INTO notifications (user_id, type, title, message, link, data)
      VALUES (
        v_student.id,
        'new_course',
        'Yangi kurs qo''shildi! 📚',
        '"' || NEW.title || '" — ' || COALESCE(v_teacher_name, 'O''qituvchi'),
        '/student/courses/' || NEW.id::text,
        jsonb_build_object('course_id', NEW.id, 'teacher_id', NEW.teacher_id)
      );
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_new_course ON courses;
CREATE TRIGGER on_new_course
  AFTER INSERT OR UPDATE OF is_published ON courses
  FOR EACH ROW EXECUTE FUNCTION notify_new_course_published();


-- Dars tugatilganda kurs progressini avtomatik hisoblash
CREATE OR REPLACE FUNCTION update_course_progress_on_lesson()
RETURNS trigger AS $$
DECLARE
  v_total   int;
  v_done    int;
  v_pct     int;
BEGIN
  SELECT COUNT(*) INTO v_total FROM lessons WHERE course_id = NEW.course_id;
  SELECT COUNT(*) INTO v_done  FROM lesson_progress
    WHERE student_id = NEW.student_id AND course_id = NEW.course_id;

  v_pct := CASE WHEN v_total > 0 THEN LEAST(100, ROUND((v_done::numeric / v_total) * 100)) ELSE 0 END;

  UPDATE enrollments
  SET progress = v_pct, last_accessed = now()
  WHERE student_id = NEW.student_id AND course_id = NEW.course_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS update_course_progress ON lesson_progress;
CREATE TRIGGER update_course_progress
  AFTER INSERT ON lesson_progress
  FOR EACH ROW EXECUTE FUNCTION update_course_progress_on_lesson();


-- Forum comment count helper
CREATE OR REPLACE FUNCTION increment_comment_count(post_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE forum_posts SET comment_count = comment_count + 1 WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════════════════════════════════════
-- STORAGE BUCKET (qo'lda yaratish kerak)
-- Dashboard → Storage → New Bucket → Name: task-files → Public: true
-- ═══════════════════════════════════════════════════════════════════════════
