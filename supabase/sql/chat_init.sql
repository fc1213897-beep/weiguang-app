-- 微光 · chat_sessions + messages 表初始化（第一阶段）
-- 在 Supabase Dashboard → SQL Editor 中整段执行

-- ========== 1. chat_sessions ==========
CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT '和小光的对话',
  is_default boolean NOT NULL DEFAULT false,
  reply_index integer NOT NULL DEFAULT 0,
  last_message_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.chat_sessions IS '小光聊天会话';
COMMENT ON COLUMN public.chat_sessions.is_default IS '每用户仅一条默认会话（MVP）';

CREATE UNIQUE INDEX IF NOT EXISTS chat_sessions_user_default_idx
  ON public.chat_sessions (user_id)
  WHERE is_default = true;

CREATE INDEX IF NOT EXISTS chat_sessions_user_id_idx ON public.chat_sessions (user_id);

-- ========== 2. messages ==========
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.chat_sessions (id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content text NOT NULL,
  client_seq bigint,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.messages IS '聊天消息';
COMMENT ON COLUMN public.messages.client_seq IS '对应本地 ChatMessage.id，用于排序与同步';

CREATE INDEX IF NOT EXISTS messages_session_created_idx
  ON public.messages (session_id, created_at);
CREATE INDEX IF NOT EXISTS messages_session_client_seq_idx
  ON public.messages (session_id, client_seq);
CREATE INDEX IF NOT EXISTS messages_user_created_idx
  ON public.messages (user_id, created_at DESC);

-- ========== 3. updated_at 触发器（sessions） ==========
CREATE OR REPLACE FUNCTION public.set_chat_sessions_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS chat_sessions_set_updated_at ON public.chat_sessions;
CREATE TRIGGER chat_sessions_set_updated_at
  BEFORE UPDATE ON public.chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.set_chat_sessions_updated_at();

-- ========== 4. RLS ==========
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS chat_sessions_own ON public.chat_sessions;
CREATE POLICY chat_sessions_own ON public.chat_sessions
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS messages_select_own ON public.messages;
CREATE POLICY messages_select_own ON public.messages
  FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS messages_insert_own ON public.messages;
CREATE POLICY messages_insert_own ON public.messages
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.chat_sessions s
      WHERE s.id = session_id AND s.user_id = auth.uid()
    )
  );
