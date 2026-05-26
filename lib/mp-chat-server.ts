import type { SupabaseClient } from "@supabase/supabase-js";
import type { ChatSessionRow, MessageRow } from "@/types/database";

function mapSession(row: Record<string, unknown>): ChatSessionRow {
  return row as unknown as ChatSessionRow;
}

function mapMessage(row: Record<string, unknown>): MessageRow {
  return row as unknown as MessageRow;
}

/** 获取或创建默认聊天会话 */
export async function getOrCreateDefaultSessionForMp(
  supabase: SupabaseClient,
  userId: string
): Promise<ChatSessionRow> {
  const { data: existing, error: selectError } = await supabase
    .from("chat_sessions")
    .select("*")
    .eq("user_id", userId)
    .eq("is_default", true)
    .maybeSingle();

  if (selectError) {
    throw new Error(selectError.message);
  }
  if (existing) {
    return mapSession(existing as Record<string, unknown>);
  }

  const { data: created, error: insertError } = await supabase
    .from("chat_sessions")
    .insert({
      user_id: userId,
      is_default: true,
      title: "和小光的对话",
      reply_index: 0,
    })
    .select()
    .single();

  if (insertError) {
    throw new Error(insertError.message);
  }

  return mapSession(created as Record<string, unknown>);
}

/** 拉取会话消息（仅 user / assistant） */
export async function listChatMessagesForMp(
  supabase: SupabaseClient,
  sessionId: string
): Promise<MessageRow[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("session_id", sessionId)
    .in("role", ["user", "assistant"])
    .order("client_seq", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => mapMessage(row as Record<string, unknown>));
}

/** 写入一条消息并更新会话时间 */
export async function insertChatMessageForMp(
  supabase: SupabaseClient,
  userId: string,
  sessionId: string,
  role: "user" | "assistant",
  content: string,
  clientSeq: number
): Promise<MessageRow> {
  const text = content.trim();
  if (!text) {
    throw new Error("消息内容不能为空");
  }

  const { data, error } = await supabase
    .from("messages")
    .insert({
      session_id: sessionId,
      user_id: userId,
      role,
      content: text,
      client_seq: clientSeq,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const now = new Date().toISOString();
  await supabase
    .from("chat_sessions")
    .update({ last_message_at: now })
    .eq("id", sessionId)
    .eq("user_id", userId);

  return mapMessage(data as Record<string, unknown>);
}
