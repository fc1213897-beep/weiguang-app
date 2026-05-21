-- 微光 · tasks 表初始化（第一阶段）
-- 在 Supabase Dashboard → SQL Editor 中整段执行

-- ========== 1. 建表 ==========
CREATE TABLE IF NOT EXISTS public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  title text NOT NULL,
  completed boolean NOT NULL DEFAULT false,
  task_type text NOT NULL DEFAULT 'other'
    CHECK (task_type IN ('study', 'coding', 'sport', 'life', 'other')),
  priority text NOT NULL DEFAULT 'medium'
    CHECK (priority IN ('low', 'medium', 'high')),
  pomodoro_minutes smallint NOT NULL DEFAULT 0
    CHECK (pomodoro_minutes >= 0),
  task_date date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.tasks IS '微光学习计划任务（云端）';
COMMENT ON COLUMN public.tasks.user_id IS '所属用户，关联 auth.users.id';
COMMENT ON COLUMN public.tasks.task_date IS '任务归属日期 YYYY-MM-DD';

-- ========== 2. 索引 ==========
CREATE INDEX IF NOT EXISTS tasks_user_id_idx ON public.tasks (user_id);
CREATE INDEX IF NOT EXISTS tasks_user_task_date_idx ON public.tasks (user_id, task_date);
CREATE INDEX IF NOT EXISTS tasks_user_updated_at_idx ON public.tasks (user_id, updated_at DESC);

-- ========== 3. updated_at 触发器 ==========
CREATE OR REPLACE FUNCTION public.set_tasks_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tasks_set_updated_at ON public.tasks;
CREATE TRIGGER tasks_set_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.set_tasks_updated_at();

-- ========== 4. RLS ==========
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tasks_select_own ON public.tasks;
CREATE POLICY tasks_select_own ON public.tasks
  FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS tasks_insert_own ON public.tasks;
CREATE POLICY tasks_insert_own ON public.tasks
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS tasks_update_own ON public.tasks;
CREATE POLICY tasks_update_own ON public.tasks
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS tasks_delete_own ON public.tasks;
CREATE POLICY tasks_delete_own ON public.tasks
  FOR DELETE
  USING (user_id = auth.uid());
