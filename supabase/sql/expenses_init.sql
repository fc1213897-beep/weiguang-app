-- 微光 · expenses 表初始化（轻量记账）
-- 在 Supabase Dashboard → SQL Editor 中整段执行

-- ========== 1. 建表 ==========
CREATE TABLE IF NOT EXISTS public.expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  amount numeric(12, 2) NOT NULL CHECK (amount > 0),
  entry_type text NOT NULL DEFAULT 'expense'
    CHECK (entry_type IN ('expense', 'income')),
  category text NOT NULL DEFAULT 'other',
  note text NOT NULL DEFAULT '',
  entry_date date NOT NULL,
  source text NOT NULL DEFAULT 'manual'
    CHECK (source IN ('manual', 'chat')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.expenses IS '微光轻量记账（云端）';
COMMENT ON COLUMN public.expenses.user_id IS '所属用户，关联 auth.users.id';
COMMENT ON COLUMN public.expenses.entry_date IS '归属日期 YYYY-MM-DD，对齐 tasks.task_date';
COMMENT ON COLUMN public.expenses.source IS '来源：manual 手动 / chat 小光对话';

-- ========== 2. 索引 ==========
CREATE INDEX IF NOT EXISTS expenses_user_id_idx ON public.expenses (user_id);
CREATE INDEX IF NOT EXISTS expenses_user_entry_date_idx ON public.expenses (user_id, entry_date);
CREATE INDEX IF NOT EXISTS expenses_user_updated_at_idx ON public.expenses (user_id, updated_at DESC);

-- ========== 3. updated_at 触发器 ==========
CREATE OR REPLACE FUNCTION public.set_expenses_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS expenses_set_updated_at ON public.expenses;
CREATE TRIGGER expenses_set_updated_at
  BEFORE UPDATE ON public.expenses
  FOR EACH ROW
  EXECUTE FUNCTION public.set_expenses_updated_at();

-- ========== 4. RLS ==========
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS expenses_select_own ON public.expenses;
CREATE POLICY expenses_select_own ON public.expenses
  FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS expenses_insert_own ON public.expenses;
CREATE POLICY expenses_insert_own ON public.expenses
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS expenses_update_own ON public.expenses;
CREATE POLICY expenses_update_own ON public.expenses
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS expenses_delete_own ON public.expenses;
CREATE POLICY expenses_delete_own ON public.expenses
  FOR DELETE
  USING (user_id = auth.uid());
