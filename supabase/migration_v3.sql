-- =========================================================
-- Migration v3: Methodologies (Web-Kvest, Flipped Classroom,
-- Project-Based Learning, Muammoli ta'lim)
-- Applied idempotently -- safe to run multiple times
-- =========================================================

-- 1. Add methodologies column to courses
ALTER TABLE courses ADD COLUMN IF NOT EXISTS methodologies text[] NOT NULL DEFAULT '{}';

-- 2. Add task_type + template_data to tasks
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS task_type text NOT NULL DEFAULT 'standard';
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'tasks_task_type_check') THEN
    ALTER TABLE tasks ADD CONSTRAINT tasks_task_type_check CHECK (
      task_type IN ('standard','web_kvest','flipped_homework','flipped_inclass','pbl_project','muammoli_problem')
    );
  END IF;
END $$;

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS template_data jsonb DEFAULT NULL;

-- 3. Realtime
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'courses') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE courses;
  END IF;
END $$;

-- 4. Index
CREATE INDEX IF NOT EXISTS idx_courses_methodologies ON courses USING GIN(methodologies);
CREATE INDEX IF NOT EXISTS idx_tasks_task_type ON tasks(task_type);
