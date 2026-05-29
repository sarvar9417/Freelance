-- ═══════════════════════════════════════════════════════════════════════════
-- FREELANCER SCHOOL — SEED DATA
-- ═══════════════════════════════════════════════════════════════════════════
-- Supabase Dashboard → SQL Editor da ishga tushiring
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. MAVJUD AUTH USER LAR NI public.users GA QO'SHISH
-- (auth.users da user bor bo'lsa, public.users ga ham qo'shiladi)
INSERT INTO users (id, email, full_name, role)
SELECT id, email, COALESCE(raw_user_meta_data->>'full_name', email), 'student'
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.users)
ON CONFLICT (id) DO NOTHING;

-- 2. ADMIN BELGILASH (birinchi userni admin qilish)
UPDATE users SET role = 'admin'
WHERE id = (SELECT id FROM users ORDER BY created_at ASC LIMIT 1);

-- 3. SETTINGS
INSERT INTO site_settings (key, value)
VALUES
  ('site_name', 'Freelancer School'),
  ('site_description', 'Mustaqil ishlash va freelancing ko''nikmalarini o''rganish platformasi'),
  ('allow_registration', 'true'),
  ('default_role', 'student')
ON CONFLICT (key) DO NOTHING;

-- 4. QUOTES
INSERT INTO daily_quotes (text, author)
VALUES
  ('Muvaffaqiyatga erishishning yagona yo''li – bu harakat qilishda davom etishdir.', 'Sarvar Muzaffarov'),
  ('Har bir katta yo''l birinchi qadamdan boshlanadi.', 'Xalq maqoli'),
  ('O''rganish – bu eng katta boylikdir.', 'Donishmand so''zi'),
  ('Kuch – bilimda, bilim – kitobda.', 'O''zbek maqoli')
ON CONFLICT DO NOTHING;

-- 5. SUCCESS STORIES
INSERT INTO success_stories (title, content, author_name, approved)
VALUES
  ('Freelance yo''lim', 'Platforma orqali oʻqib, bir oyda $1000 ishlab topdim!', 'Jamshid A.', true),
  ('Birinchi buyurtmam', 'Grafik dizayn kursini tamomlab, ilk mijozimni topdim.', 'Madina R.', true),
  ('Mustaqil hayot', 'Copywriting bilan o''z biznesimni boshladim.', 'Bobur K.', true)
ON CONFLICT DO NOTHING;

-- 6. SEED COURSES (agar kurs bo'lmasa)
WITH teacher AS (
  SELECT id FROM users WHERE role IN ('teacher', 'admin') LIMIT 1
)
INSERT INTO courses (teacher_id, title, description, full_description, category, level, emoji, is_published, status, methodologies)
SELECT
  (SELECT id FROM teacher),
  'Freelancing asoslari',
  'Freelance dunyosiga ilk qadam. Platformalar, portfolio va mijozlar bilan ishlash.',
  'To''liq kurs: freelancing platformalarida ro''yxatdan o''tishdan tortib, birinchi buyurtmani olishgacha.',
  'Freelancing',
  'Boshlang''ich',
  '🚀',
  true,
  'approved',
  ARRAY['web_kvest', 'flipped']
WHERE EXISTS (SELECT 1 FROM teacher)
  AND NOT EXISTS (SELECT 1 FROM courses);

INSERT INTO courses (teacher_id, title, description, full_description, category, level, emoji, is_published, status, methodologies)
SELECT
  (SELECT id FROM users WHERE role IN ('teacher', 'admin') LIMIT 1),
  'Grafik Dizayn (Figma)',
  'Figma da logotip, banner va UI dizayn yaratishni o''rganing.',
  'Professional darajadagi grafik dizayn kursi. Figma vositalari, rang nazariyasi, tipografiya.',
  'Dizayn',
  'O''rta',
  '🎨',
  true,
  'approved',
  ARRAY['pbl']
WHERE EXISTS (SELECT 1 FROM users WHERE role IN ('teacher', 'admin') LIMIT 1)
  AND (SELECT COUNT(*) FROM courses) = 1;

INSERT INTO courses (teacher_id, title, description, full_description, category, level, emoji, is_published, status, methodologies)
SELECT
  (SELECT id FROM users WHERE role IN ('teacher', 'admin') LIMIT 1),
  'Copywriting Pro',
  'Sotuvchi matnlar yozish, brend tonusi va kontent strategiya.',
  'Copywritingning barcha sirlari: sarlavhalar, CTA, brend ovoz, hikoya qilish san''ati.',
  'Marketing',
  'Yuqori',
  '✍️',
  true,
  'approved',
  ARRAY['muammoli', 'web_kvest']
WHERE EXISTS (SELECT 1 FROM users WHERE role IN ('teacher', 'admin') LIMIT 1)
  AND (SELECT COUNT(*) FROM courses) = 2;

-- 7. SEED LESSONS (1-kursga)
DO $$
DECLARE
  v_course_id uuid;
BEGIN
  SELECT id INTO v_course_id FROM courses ORDER BY created_at ASC LIMIT 1;
  IF v_course_id IS NOT NULL AND (SELECT COUNT(*) FROM lessons WHERE course_id = v_course_id) = 0 THEN
    INSERT INTO lessons (course_id, title, content, order_num)
    VALUES
      (v_course_id, 'Freelancing nima?', 'Freelancing – bu mustaqil ishlash usuli. Siz o''z vaqtingizni boshqarasiz va o''z mijozlaringiz bilan ishlaysiz.', 1),
      (v_course_id, 'Platformalar bilan tanishish', 'Upwork, Fiverr, TopTal, va boshqa platformalarda profil yaratish.', 2),
      (v_course_id, 'Portfolio yaratish', 'Portfolio – sizning yuzingiz. Eng yaxshi ishlaringizni ko''rsating.', 3),
      (v_course_id, 'Mijozlar bilan muloqot', 'Professional muloqot, tender yutish va narx kelishish sirlari.', 4);
  END IF;
END $$;

-- 8. SEED TASKS (1-kursga, 1-darsga)
DO $$
DECLARE
  v_course_id uuid;
  v_lesson_id uuid;
BEGIN
  SELECT id INTO v_course_id FROM courses ORDER BY created_at ASC LIMIT 1;
  SELECT id INTO v_lesson_id FROM lessons ORDER BY created_at ASC LIMIT 1;
  IF v_course_id IS NOT NULL AND v_lesson_id IS NOT NULL AND (SELECT COUNT(*) FROM tasks WHERE course_id = v_course_id) = 0 THEN
    INSERT INTO tasks (course_id, lesson_id, title, description, max_score, difficulty_level, order_index, task_type)
    VALUES
      (v_course_id, v_lesson_id, 'Freelancing tushunchasi', 'Freelancing nima ekanligini o''z so''zlaringiz bilan tushuntiring.', 100, 1, 1, 'standard'),
      (v_course_id, v_lesson_id, 'Platforma profili', 'Upwork yoki Fiverr da profil yarating va skrinshot yuboring.', 100, 1, 2, 'web_kvest'),
      (v_course_id, NULL, 'O''z portfolioingizni rejalashtirish', 'Kelajakdagi portfolioingiz uchun kontent reja tuzing.', 50, 2, 3, 'standard');
  END IF;
END $$;

-- 9. MASTER CLASSES (namuna)
INSERT INTO master_classes (title, description, speaker_name, speaker_bio, datetime, link, max_participants, is_online, created_by)
SELECT
  'Freelance bozori 2026: Trendlar va imkoniyatlar',
  '2026 yilda eng ko''p talab qilinadigan freelancing yo''nalishlari haqida master-klass.',
  'Sarvar Muzaffarov',
  'Freelance School asoschisi, 5 yillik freelance tajribasi',
  now() + interval '7 days',
  'https://meet.google.com/abc-defg-hij',
  50,
  true,
  id
FROM users WHERE role = 'admin' LIMIT 1;
