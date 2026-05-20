-- =========================================================
-- Migration v2: Additional schema, RLS, and indexes
-- Applied idempotently – safe to run multiple times
-- =========================================================

-- 1. Add columns to tasks
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS difficulty_level int NOT NULL DEFAULT 1;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'tasks_difficulty_check') THEN
    ALTER TABLE tasks ADD CONSTRAINT tasks_difficulty_check CHECK (difficulty_level BETWEEN 1 AND 4);
  END IF;
END $$;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS order_index int NOT NULL DEFAULT 0;

-- 2. [removed] task_dependencies table — sequential unlock is client-side via difficulty_level

-- 3. Add columns to submissions
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS grade text;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'submissions_grade_check') THEN
    ALTER TABLE submissions ADD CONSTRAINT submissions_grade_check CHECK (grade IN ('5','4','3'));
  END IF;
END $$;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS assessment_criteria jsonb DEFAULT '{}'::jsonb;

-- 4. Create master_classes table
CREATE TABLE IF NOT EXISTS master_classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  speaker_name text NOT NULL,
  speaker_bio text,
  datetime timestamptz NOT NULL,
  link text,
  max_participants int,
  is_online boolean DEFAULT true,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE master_classes ENABLE ROW LEVEL SECURITY;

-- 5. Create team_findings table
CREATE TABLE IF NOT EXISTS team_findings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  skills_needed text[] DEFAULT '{}',
  project_type text,
  contact_info text,
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE team_findings ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for new tables (idempotent via DO blocks)
DO $$ BEGIN
  -- task_dependencies policies removed (table not used)
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'master_classes_select' AND tablename = 'master_classes') THEN
    CREATE POLICY "master_classes_select" ON master_classes FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'master_classes_insert' AND tablename = 'master_classes') THEN
    CREATE POLICY "master_classes_insert" ON master_classes FOR INSERT WITH CHECK (auth.uid() = created_by);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'master_classes_update' AND tablename = 'master_classes') THEN
    CREATE POLICY "master_classes_update" ON master_classes FOR UPDATE USING (auth.uid() = created_by OR is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'master_classes_delete' AND tablename = 'master_classes') THEN
    CREATE POLICY "master_classes_delete" ON master_classes FOR DELETE USING (auth.uid() = created_by OR is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'team_findings_select' AND tablename = 'team_findings') THEN
    CREATE POLICY "team_findings_select" ON team_findings FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'team_findings_insert' AND tablename = 'team_findings') THEN
    CREATE POLICY "team_findings_insert" ON team_findings FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'team_findings_update' AND tablename = 'team_findings') THEN
    CREATE POLICY "team_findings_update" ON team_findings FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'team_findings_delete' AND tablename = 'team_findings') THEN
    CREATE POLICY "team_findings_delete" ON team_findings FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- 7. Add realtime for new tables
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'master_classes') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE master_classes;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'team_findings') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE team_findings;
  END IF;
END $$;

-- 8. Indexes
CREATE INDEX IF NOT EXISTS idx_tasks_difficulty ON tasks(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_tasks_order ON tasks(course_id, order_index);
CREATE INDEX IF NOT EXISTS idx_master_classes_datetime ON master_classes(datetime);
CREATE INDEX IF NOT EXISTS idx_team_findings_skills ON team_findings USING GIN(skills_needed);
