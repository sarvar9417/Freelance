-- ═══════════════════════════════════════════════════════════════════════════
-- FREELANCER SCHOOL — TO'LIQ SUPABASE SXEMA
-- Supabase SQL Editor da ishlatish uchun
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── 1. ASOSIY JADVALLAR ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
  id            uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         text NOT NULL,
  full_name     text NOT NULL DEFAULT '',
  age           int,
  role          text NOT NULL DEFAULT 'student' CHECK (role IN ('student','teacher','admin')),
  avatar_url    text,
  bio           text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS courses (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id          uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title               text NOT NULL,
  description         text,
  full_description    text,
  category            text,
  level               text DEFAULT 'Boshlang''ich',
  emoji               text DEFAULT '📚',
  image_url           text,
  preview_video_url   text,
  is_published        boolean NOT NULL DEFAULT false,
  status              text NOT NULL DEFAULT 'pending',
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lessons (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id   uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title       text NOT NULL,
  order_num   int NOT NULL DEFAULT 1,
  video_url   text,
  content     text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tasks (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id        uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  lesson_id        uuid REFERENCES lessons(id) ON DELETE SET NULL,
  title            text NOT NULL,
  description      text,
  deadline         timestamptz,
  max_score        int NOT NULL DEFAULT 100,
  allowed_formats  text[] DEFAULT ARRAY['pdf','doc','docx','zip'],
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS enrollments (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id     uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  progress      int NOT NULL DEFAULT 0,
  enrolled_at   timestamptz NOT NULL DEFAULT now(),
  last_accessed timestamptz,
  completed_at  timestamptz,
  UNIQUE(student_id, course_id)
);

CREATE TABLE IF NOT EXISTS lesson_progress (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id     uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  course_id     uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  completed_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE(student_id, lesson_id)
);

CREATE TABLE IF NOT EXISTS submissions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id       uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  student_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status        text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','graded','revision')),
  score         int,
  feedback      text,
  file_urls     text[],
  submitted_at  timestamptz NOT NULL DEFAULT now(),
  reviewed_at   timestamptz
);

CREATE TABLE IF NOT EXISTS user_xp (
  user_id        uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_xp       int NOT NULL DEFAULT 0,
  current_level  int NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS user_streaks (
  user_id             uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak      int NOT NULL DEFAULT 0,
  longest_streak      int NOT NULL DEFAULT 0,
  last_activity_date  date
);

CREATE TABLE IF NOT EXISTS course_reviews (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id   uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating      int NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE(course_id, user_id)
);

-- ─── 2. BILDIRISHNOMALAR JADVALI ─────────────────────────────────────────

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

-- ─── 3. FORUM JADVALLARI ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS forum_posts (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title         text NOT NULL,
  content       text NOT NULL,
  category      text NOT NULL DEFAULT 'Savol',
  author_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name   text NOT NULL,
  author_avatar text NOT NULL DEFAULT '',
  likes         int NOT NULL DEFAULT 0,
  dislikes      int NOT NULL DEFAULT 0,
  comment_count int NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS forum_comments (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id       uuid NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  author_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name   text NOT NULL,
  author_avatar text NOT NULL DEFAULT '',
  content       text NOT NULL,
  likes         int NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS forum_likes (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    uuid REFERENCES forum_posts(id) ON DELETE CASCADE,
  comment_id uuid REFERENCES forum_comments(id) ON DELETE CASCADE,
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type       text NOT NULL CHECK (type IN ('like','dislike')),
  UNIQUE(post_id, user_id),
  UNIQUE(comment_id, user_id)
);

-- ─── 4. REALTIME YOQISH ──────────────────────────────────────────────────
-- Jadval allaqachon qo'shilgan bo'lsa xato chiqmasin uchun DO blok ishlatiladi

DO $$
DECLARE
  tbl text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY['notifications','submissions','enrollments','forum_posts','forum_comments','lesson_progress']
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND tablename = tbl
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE %I', tbl);
    END IF;
  END LOOP;
END;
$$;

-- ─── 5. RLS (ROW LEVEL SECURITY) ─────────────────────────────────────────

ALTER TABLE users           ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses         ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons         ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks           ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments     ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_xp         ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_streaks    ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_reviews  ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications   ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts     ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_comments  ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_likes     ENABLE ROW LEVEL SECURITY;

-- Mavjud policylarni o'chirib qayta yaratish (idempotent)
DO $$ DECLARE r record; BEGIN
  FOR r IN SELECT policyname, tablename FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename IN ('users','courses','lessons','tasks','enrollments','lesson_progress',
                      'submissions','user_xp','user_streaks','course_reviews','notifications',
                      'forum_posts','forum_comments','forum_likes')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', r.policyname, r.tablename);
  END LOOP;
END $$;

-- Yordamchi funksiya: admin tekshiruvi (RLS ichida samarali)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
$$;

-- Users
CREATE POLICY "users_select"     ON users FOR SELECT USING (true);
CREATE POLICY "users_insert_own" ON users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "users_update_own" ON users FOR UPDATE USING (auth.uid() = id OR is_admin());
CREATE POLICY "users_delete_admin" ON users FOR DELETE USING (is_admin());

-- Courses
CREATE POLICY "courses_select_published" ON courses FOR SELECT USING (is_published = true OR teacher_id = auth.uid() OR is_admin());
CREATE POLICY "courses_insert_teacher"   ON courses FOR INSERT WITH CHECK (auth.uid() = teacher_id);
CREATE POLICY "courses_update_teacher"   ON courses FOR UPDATE USING (auth.uid() = teacher_id OR is_admin());
CREATE POLICY "courses_delete_teacher"   ON courses FOR DELETE USING (auth.uid() = teacher_id OR is_admin());

-- Lessons
CREATE POLICY "lessons_select" ON lessons FOR SELECT USING (
  EXISTS (SELECT 1 FROM courses WHERE id = lessons.course_id AND (is_published = true OR teacher_id = auth.uid()))
);
CREATE POLICY "lessons_manage_teacher" ON lessons FOR ALL USING (
  EXISTS (SELECT 1 FROM courses WHERE id = lessons.course_id AND teacher_id = auth.uid())
);

-- Tasks
CREATE POLICY "tasks_select" ON tasks FOR SELECT USING (
  EXISTS (SELECT 1 FROM courses WHERE id = tasks.course_id AND (is_published = true OR teacher_id = auth.uid()))
);
CREATE POLICY "tasks_manage_teacher" ON tasks FOR ALL USING (
  EXISTS (SELECT 1 FROM courses WHERE id = tasks.course_id AND teacher_id = auth.uid())
);

-- Enrollments
CREATE POLICY "enrollments_select_own" ON enrollments FOR SELECT USING (
  student_id = auth.uid() OR
  EXISTS (SELECT 1 FROM courses WHERE id = enrollments.course_id AND teacher_id = auth.uid())
);
CREATE POLICY "enrollments_insert_own" ON enrollments FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "enrollments_update_own" ON enrollments FOR UPDATE USING (auth.uid() = student_id);

-- Lesson Progress
CREATE POLICY "lesson_progress_select_own" ON lesson_progress FOR SELECT USING (
  student_id = auth.uid() OR
  EXISTS (SELECT 1 FROM courses WHERE id = lesson_progress.course_id AND teacher_id = auth.uid())
);
CREATE POLICY "lesson_progress_insert_own" ON lesson_progress FOR INSERT WITH CHECK (auth.uid() = student_id);

-- Submissions
CREATE POLICY "submissions_select" ON submissions FOR SELECT USING (
  student_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM tasks t
    JOIN courses c ON c.id = t.course_id
    WHERE t.id = submissions.task_id AND c.teacher_id = auth.uid()
  )
);
CREATE POLICY "submissions_insert_own" ON submissions FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "submissions_update_teacher" ON submissions FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM tasks t
    JOIN courses c ON c.id = t.course_id
    WHERE t.id = submissions.task_id AND c.teacher_id = auth.uid()
  )
);

-- User XP
CREATE POLICY "user_xp_select"     ON user_xp FOR SELECT USING (true);
CREATE POLICY "user_xp_insert_own" ON user_xp FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_xp_update_own" ON user_xp FOR UPDATE USING (auth.uid() = user_id);

-- User Streaks
CREATE POLICY "user_streaks_select"     ON user_streaks FOR SELECT USING (true);
CREATE POLICY "user_streaks_insert_own" ON user_streaks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_streaks_update_own" ON user_streaks FOR UPDATE USING (auth.uid() = user_id);

-- Course Reviews
CREATE POLICY "reviews_select"     ON course_reviews FOR SELECT USING (true);
CREATE POLICY "reviews_insert_own" ON course_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Notifications
CREATE POLICY "notifications_select_own" ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "notifications_update_own" ON notifications FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "notifications_delete_own" ON notifications FOR DELETE USING (user_id = auth.uid());

-- Forum
CREATE POLICY "forum_posts_select"    ON forum_posts    FOR SELECT USING (true);
CREATE POLICY "forum_comments_select" ON forum_comments FOR SELECT USING (true);
CREATE POLICY "forum_likes_select"    ON forum_likes    FOR SELECT USING (true);
CREATE POLICY "forum_posts_insert"    ON forum_posts    FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "forum_comments_insert" ON forum_comments FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "forum_likes_insert"    ON forum_likes    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "forum_likes_delete"    ON forum_likes    FOR DELETE USING (auth.uid() = user_id);

-- ─── 6. TRIGGER FUNKSIYALAR ──────────────────────────────────────────────

-- Topshiriq baholanganda o'quvchiga bildirishnoma
CREATE OR REPLACE FUNCTION notify_submission_graded()
RETURNS trigger AS $$
DECLARE
  v_task_title  text;
  v_course_id   uuid;
  v_score_text  text;
BEGIN
  IF NEW.status IN ('graded', 'revision') AND OLD.status = 'pending' THEN
    SELECT t.title, t.course_id INTO v_task_title, v_course_id
    FROM tasks t WHERE t.id = NEW.task_id;

    IF NEW.status = 'graded' THEN
      v_score_text := COALESCE(' — ' || NEW.score || ' ball', '');
      INSERT INTO notifications (user_id, type, title, message, link, data)
      VALUES (
        NEW.student_id,
        'submission_graded',
        'Topshiriq baholandi! ✅',
        v_task_title || ' topshirig''i baholandi' || v_score_text,
        '/student/tasks',
        jsonb_build_object('task_id', NEW.task_id, 'submission_id', NEW.id, 'score', NEW.score)
      );
    ELSIF NEW.status = 'revision' THEN
      INSERT INTO notifications (user_id, type, title, message, link, data)
      VALUES (
        NEW.student_id,
        'submission_revision',
        'Qayta topshirish talab qilinadi 🔄',
        v_task_title || ' topshirig''ini qayta ko''rib chiqing',
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


-- Yangi topshiriq topshirilganda o'qituvchiga bildirishnoma
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
  FROM tasks t
  JOIN courses c ON c.id = t.course_id
  WHERE t.id = NEW.task_id;

  SELECT full_name INTO v_student_name
  FROM users WHERE id = NEW.student_id;

  INSERT INTO notifications (user_id, type, title, message, link, data)
  VALUES (
    v_teacher_id,
    'new_submission',
    'Yangi topshiriq keldi 📥',
    COALESCE(v_student_name, 'O''quvchi') || ' "' || COALESCE(v_task_title, 'topshiriq') || '" ni topshirdi',
    '/teacher/tasks/review',
    jsonb_build_object(
      'submission_id', NEW.id,
      'task_id', NEW.task_id,
      'student_id', NEW.student_id,
      'course_id', v_course_id
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_new_submission ON submissions;
CREATE TRIGGER on_new_submission
  AFTER INSERT ON submissions
  FOR EACH ROW EXECUTE FUNCTION notify_new_submission();


-- Yangi yozilganda o'qituvchiga bildirishnoma
CREATE OR REPLACE FUNCTION notify_new_enrollment()
RETURNS trigger AS $$
DECLARE
  v_teacher_id    uuid;
  v_student_name  text;
  v_course_title  text;
BEGIN
  SELECT c.teacher_id, c.title INTO v_teacher_id, v_course_title
  FROM courses c WHERE c.id = NEW.course_id;

  SELECT full_name INTO v_student_name
  FROM users WHERE id = NEW.student_id;

  INSERT INTO notifications (user_id, type, title, message, link, data)
  VALUES (
    v_teacher_id,
    'new_enrollment',
    'Yangi o''quvchi yozildi 🎓',
    COALESCE(v_student_name, 'O''quvchi') || ' "' || COALESCE(v_course_title, 'kurs') || '" ga yozildi',
    '/teacher/students',
    jsonb_build_object(
      'student_id', NEW.student_id,
      'course_id', NEW.course_id
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_new_enrollment ON enrollments;
CREATE TRIGGER on_new_enrollment
  AFTER INSERT ON enrollments
  FOR EACH ROW EXECUTE FUNCTION notify_new_enrollment();


-- Kurs 100% tugatilganda o'qituvchiga bildirishnoma
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

    SELECT full_name INTO v_student_name
    FROM users WHERE id = NEW.student_id;

    -- O'qituvchiga bildirishnoma
    INSERT INTO notifications (user_id, type, title, message, link, data)
    VALUES (
      v_teacher_id,
      'course_completed',
      'O''quvchi kursni tugatdi! 🏆',
      COALESCE(v_student_name, 'O''quvchi') || ' "' || COALESCE(v_course_title, 'kurs') || '" ni 100% tugatdi!',
      '/teacher/students',
      jsonb_build_object('student_id', NEW.student_id, 'course_id', NEW.course_id)
    );

    -- O'quvchiga bildirishnoma
    INSERT INTO notifications (user_id, type, title, message, link, data)
    VALUES (
      NEW.student_id,
      'course_completed',
      'Tabriklaymiz! Kurs tugatildi 🎉',
      '"' || COALESCE(v_course_title, 'Kurs') || '" muvaffaqiyatli tugatildi! +500 XP',
      '/student/my-courses',
      jsonb_build_object('course_id', NEW.course_id, 'xp_gained', 500)
    );

    -- completed_at ni yangilash
    UPDATE enrollments SET completed_at = now()
    WHERE student_id = NEW.student_id AND course_id = NEW.course_id AND completed_at IS NULL;
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
  v_student record;
  v_teacher_name text;
BEGIN
  IF NEW.is_published = true AND (OLD.is_published = false OR OLD.is_published IS NULL) THEN
    SELECT full_name INTO v_teacher_name
    FROM users WHERE id = NEW.teacher_id;

    FOR v_student IN SELECT id FROM users WHERE role = 'student'
    LOOP
      INSERT INTO notifications (user_id, type, title, message, link, data)
      VALUES (
        v_student.id,
        'new_course',
        'Yangi kurs qo''shildi! 📚',
        '"' || NEW.title || '" kursi ' || COALESCE(v_teacher_name, 'O''qituvchi') || ' tomonidan nashr etildi',
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


-- Kurs progressini dars tugatilganda hisoblash
CREATE OR REPLACE FUNCTION update_course_progress_on_lesson()
RETURNS trigger AS $$
DECLARE
  v_total_lessons   int;
  v_done_lessons    int;
  v_new_progress    int;
BEGIN
  -- Kursda jami darslar soni
  SELECT COUNT(*) INTO v_total_lessons
  FROM lessons WHERE course_id = NEW.course_id;

  -- Student tugatgan darslar soni
  SELECT COUNT(*) INTO v_done_lessons
  FROM lesson_progress
  WHERE student_id = NEW.student_id AND course_id = NEW.course_id;

  IF v_total_lessons > 0 THEN
    v_new_progress := LEAST(100, ROUND((v_done_lessons::numeric / v_total_lessons) * 100));
  ELSE
    v_new_progress := 0;
  END IF;

  UPDATE enrollments
  SET progress = v_new_progress, last_accessed = now()
  WHERE student_id = NEW.student_id AND course_id = NEW.course_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS update_course_progress ON lesson_progress;
CREATE TRIGGER update_course_progress
  AFTER INSERT ON lesson_progress
  FOR EACH ROW EXECUTE FUNCTION update_course_progress_on_lesson();


-- Forum comment_count yangilash
CREATE OR REPLACE FUNCTION increment_comment_count(post_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE forum_posts SET comment_count = comment_count + 1 WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ─── 7. INDEKSLAR ────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_student ON lesson_progress(student_id, course_id);
CREATE INDEX IF NOT EXISTS idx_submissions_task ON submissions(task_id);
CREATE INDEX IF NOT EXISTS idx_submissions_student ON submissions(student_id);


-- ═══════════════════════════════════════════════════════════════════════════
-- MOCK MA'LUMOTLAR
-- Test uchun qo'lda auth.users da yaratilgan userlar kerak
-- Quyidagi SQL-ni faqat auth.users da haqiqiy users mavjud bo'lganda ishlating
-- ═══════════════════════════════════════════════════════════════════════════

-- Mock data kiritish uchun avval auth.users ga qo'shib, ularning UUID larini olishingiz kerak.
-- Quyidagi bloq template sifatida berilgan:

/*
-- Kurslar (teacher_id = haqiqiy o'qituvchi UUID bilan almashtiring)
INSERT INTO courses (id, teacher_id, title, description, full_description, category, level, emoji, is_published, status) VALUES
  ('11111111-0001-0000-0000-000000000001', '<TEACHER_1_UUID>', 'Web Development Asoslari', 'HTML, CSS va JavaScript bilan professional saytlar yarating', 'Bu kursda siz zamonaviy web texnologiyalarni o''rganasiz. HTML5 semantik teglaridan JavaScript ES6+ gacha hamma narsa qamrab olingan.', 'Web Development', 'Boshlang''ich', '💻', true, 'active'),
  ('11111111-0001-0000-0000-000000000002', '<TEACHER_1_UUID>', 'React.js Amaliyoti', 'React komponenetlari, hooks va state managementni o''rganing', 'React.js-ning eng muhim konseptsiyalari: komponentlar, props, state, hooks, context API va React Router.', 'Web Development', 'O''rta', '⚛️', true, 'active'),
  ('11111111-0001-0000-0000-000000000003', '<TEACHER_2_UUID>', 'Graphic Design Kirish', 'Figma va Adobe Illustrator bilan professional dizayn yarating', 'Dizayn asoslari: rang nazariyasi, tipografiya, kompozitsiya va UI/UX prinsiplari.', 'Graphic Design', 'Boshlang''ich', '🎨', true, 'active'),
  ('11111111-0001-0000-0000-000000000004', '<TEACHER_2_UUID>', 'SMM Strategiyasi', 'Ijtimoiy tarmoqlarda biznesni rivojlantirish usullari', 'Instagram, Telegram va Facebook orqali brendni kuchaytirish, kontent yaratish va auditoriya jalb qilish.', 'SMM', 'O''rta', '📱', true, 'active'),
  ('11111111-0001-0000-0000-000000000005', '<TEACHER_3_UUID>', 'Copywriting Pro', 'Sotuvchi matnlar yozish va content marketing', 'Persuasive writing, SEO copywriting, email marketing va reklama matnlari yaratish.', 'Content Writing', 'Boshlang''ich', '✍️', true, 'active');

-- Darslar (course 1 uchun)
INSERT INTO lessons (course_id, title, order_num, video_url, content) VALUES
  ('11111111-0001-0000-0000-000000000001', 'HTML Kirish va Asosiy Teglar', 1, 'https://www.youtube.com/watch?v=qz0aGYrrlhU', 'HTML (HyperText Markup Language) web sahifalarning asosini tashkil etadi. Ushbu darsda biz asosiy HTML teglarini o''rganamiz.'),
  ('11111111-0001-0000-0000-000000000001', 'CSS Stillash Asoslari', 2, 'https://www.youtube.com/watch?v=1PnVor36_40', 'CSS yordamida HTML elementlarini stillash, ranglar, shriftlar va joylashtirish.'),
  ('11111111-0001-0000-0000-000000000001', 'JavaScript Kirish', 3, 'https://www.youtube.com/watch?v=W6NZfCO5SIk', 'JavaScript web sahifalarni interaktiv qilish uchun ishlatiladi.'),
  ('11111111-0001-0000-0000-000000000001', 'Responsive Design', 4, NULL, 'Media queries va Flexbox yordamida moslashuvchan dizayn yaratish.'),
  ('11111111-0001-0000-0000-000000000001', 'Portfolio Loyiha', 5, NULL, 'O''rganilgan bilimlar asosida shaxsiy portfolio sayt yaratish.');

-- Va boshqa kurslar uchun ham shunga o''xshash darslar...

-- Topshiriqlar
INSERT INTO tasks (course_id, title, description, deadline, max_score) VALUES
  ('11111111-0001-0000-0000-000000000001', 'HTML Sahifa Yaratish', 'Bio-sahifa yoki oddiy landing page HTML da yarating', NOW() + INTERVAL '7 days', 100),
  ('11111111-0001-0000-0000-000000000001', 'CSS Stillash Loyihasi', 'Berilgan dizayn eskiziga ko''ra CSS yozing', NOW() + INTERVAL '14 days', 100),
  ('11111111-0001-0000-0000-000000000001', 'JavaScript Mini-App', 'Calculator yoki To-Do list ilovasi yarating', NOW() + INTERVAL '21 days', 100);
*/

-- ═══════════════════════════════════════════════════════════════════════════
-- STORAGE BUCKET
-- Supabase Storage da "task-files" bucket yarating:
-- Dashboard → Storage → New Bucket → Name: task-files → Public: true
-- ═══════════════════════════════════════════════════════════════════════════
