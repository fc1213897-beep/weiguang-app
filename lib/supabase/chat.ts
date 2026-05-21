import { getSupabaseClient } from "@/lib/supabase/client";
import type {
  ChatSessionRow,
  CrudResult,
  InsertMessageInput,
  MessageRow,
} from "@/types/database";

async function requireUserId(): Promise<CrudResult<string>> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) return { data: null, error: error.message };
  if (!data.user) {
    return { data: null, error: "未登录，无法操作云端聊天" };
  }
  return { data: data.user.id, error: null };
}

function mapSession(row: Record<string, unknown>): ChatSessionRow {
  return row as unknown as ChatSessionRow;
}

function mapMessage(row: Record<string, unknown>): MessageRow {
  return row as unknown as MessageRow;
}

/**
 * 获取或创建当前用户的默认会话（is_default = true）
 */
export async function getOrCreateDefaultSession(): Promise<
  CrudResult<ChatSessionRow>
> {
  const auth = await requireUserId();
  if (auth.error || !auth.data) return { data: null, error: auth.error };

  const supabase = getSupabaseClient();
  const { data: existing, error: selectError } = await supabase
    .from("chat_sessions")
    .select("*")
    .eq("user_id", auth.data)
    .eq("is_default", true)
    .maybeSingle();

  if (selectError) return { data: null, error: selectError.message };
  if (existing) {
    return { data: mapSession(existing as Record<string, unknown>), error: null };
  }

  const { data: created, error: insertError } = await supabase
    .from("chat_sessions")
    .insert({
      user_id: auth.data,
      is_default: true,
      title: "和小光的对话",
      reply_index: 0,
    })
    .select()
    .single();

  if (insertError) return { data: null, error: insertError.message };
  return {
    data: mapSession(created as Record<string, unknown>),
    error: null,
  };
}

/**
 * 拉取某会话下全部消息（按 client_seq / created_at 排序）
 */
export async function listSessionMessages(
  sessionId: string
): Promise<CrudResult<MessageRow[]>> {
  const auth = await requireUserId();
  if (auth.error || !auth.data) return { data: null, error: auth.error };

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("session_id", sessionId)
    .order("client_seq", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true });

  if (error) return { data: null, error: error.message };
  return {
    data: (data ?? []).map((row) =>
      mapMessage(row as Record<string, unknown>)
    ),
    error: null,
  };
}

/**
 * 插入一条消息
 */
export async function insertMessage(
  input: InsertMessageInput
): Promise<CrudResult<MessageRow>> {
  const auth = await requireUserId();
  if (auth.error || !auth.data) return { data: null, error: auth.error };

  const content = input.content.trim();
  if (!content) return { data: null, error: "消息内容不能为空" };

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("messages")
    .insert({
      session_id: input.session_id,
      user_id: auth.data,
      role: input.role,
      content,
      client_seq: input.client_seq,
    })
    .select()
    .single();

  if (error) return { data: null, error: error.message };

  const now = new Date().toISOString();
  await supabase
    .from("chat_sessions")
    .update({ last_message_at: now })
    .eq("id", input.session_id)
    .eq("user_id", auth.data);

  return {
    data: mapMessage(data as Record<string, unknown>),
    error: null,
  };
}

/**
 * 更新默认会话的 reply_index（兜底回复轮换）
 */
export async function updateSessionReplyIndex(
  sessionId: string,
  replyIndex: number
): Promise<CrudResult<null>> {
  const auth = await requireUserId();
  if (auth.error || !auth.data) return { data: null, error: auth.error };

  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from("chat_sessions")
    .update({ reply_index: replyIndex })
    .eq("id", sessionId)
    .eq("user_id", auth.data);

  if (error) return { data: null, error: error.message };
  return { data: null, error: null };
}
