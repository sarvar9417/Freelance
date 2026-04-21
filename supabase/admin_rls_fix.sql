-- ═══════════════════════════════════════════════════════════════════════════
-- ADMIN RLS POLITIKA TUZATISHI
-- Supabase Dashboard → SQL Editor da ishga tushiring
-- ═══════════════════════════════════════════════════════════════════════════

-- Yordamchi funksiya: joriy foydalanuvchi admin ekanligini tekshirish
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  )
$$;

-- ─── COURSES ─────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "courses_select_published" ON courses;
CREATE POLICY "courses_select_published" ON courses FOR SELECT USING (
  is_published = true
  OR teacher_id = auth.uid()
  OR is_admin()
);

DROP POLICY IF EXISTS "courses_update_teacher" ON courses;
CREATE POLICY "courses_update_teacher" ON courses FOR UPDATE USING (
  auth.uid() = teacher_id
  OR is_admin()
);

DROP POLICY IF EXISTS "courses_delete_teacher" ON courses;
CREATE POLICY "courses_delete_teacher" ON courses FOR DELETE USING (
  auth.uid() = teacher_id
  OR is_admin()
);

-- ─── USERS ───────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "users_update_own" ON users;
CREATE POLICY "users_update_own" ON users FOR UPDATE USING (
  auth.uid() = id
  OR is_admin()
);

DROP POLICY IF EXISTS "users_delete_admin" ON users;
CREATE POLICY "users_delete_admin" ON users FOR DELETE USING (
  is_admin()
);

-- ─── FORUM (admin moderatsiyasi uchun) ───────────────────────────────────────

DROP POLICY IF EXISTS "forum_posts_delete" ON forum_posts;
CREATE POLICY "forum_posts_delete" ON forum_posts FOR DELETE USING (
  auth.uid() = author_id
  OR is_admin()
);

DROP POLICY IF EXISTS "forum_posts_update" ON forum_posts;
CREATE POLICY "forum_posts_update" ON forum_posts FOR UPDATE USING (
  auth.uid() = author_id
  OR is_admin()
);

-- ─── MOTIVATSIYA JADVALLARI ───────────────────────────────────────────────────

ALTER TABLE daily_quotes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "daily_quotes_select" ON daily_quotes;
DROP POLICY IF EXISTS "daily_quotes_manage_admin" ON daily_quotes;
CREATE POLICY "daily_quotes_select"       ON daily_quotes FOR SELECT USING (true);
CREATE POLICY "daily_quotes_manage_admin" ON daily_quotes FOR ALL   USING (is_admin());

ALTER TABLE success_stories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "success_stories_select" ON success_stories;
DROP POLICY IF EXISTS "success_stories_insert" ON success_stories;
DROP POLICY IF EXISTS "success_stories_manage_admin" ON success_stories;
CREATE POLICY "success_stories_select"       ON success_stories FOR SELECT USING (approved = true OR is_admin());
CREATE POLICY "success_stories_insert"       ON success_stories FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "success_stories_manage_admin" ON success_stories FOR ALL   USING (is_admin());

-- ─── SITE SETTINGS ────────────────────────────────────────────────────────────

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "site_settings_select" ON site_settings;
DROP POLICY IF EXISTS "site_settings_manage_admin" ON site_settings;
CREATE POLICY "site_settings_select"       ON site_settings FOR SELECT USING (true);
CREATE POLICY "site_settings_manage_admin" ON site_settings FOR ALL   USING (is_admin());