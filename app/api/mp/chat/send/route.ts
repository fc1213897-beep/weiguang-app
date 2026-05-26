import { NextResponse } from "next/server";
import { fetchXiaoguangReply, type ChatHistoryItem } from "@/lib/chat-ai";
import { getGentleFallbackReply } from "@/lib/fallback-reply";
import { requireMpAuth } from "@/lib/mp-auth";
import {
  getOrCreateDefaultSessionForMp,
  insertChatMessageForMp,
  listChatMessagesForMp,
} from "@/lib/mp-chat-server";

/** POST /api/mp/chat/send — 发送消息并同步云端 */
export async function POST(request: Request) {
  const auth = await requireMpAuth(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = (await request.json()) as { message?: string };
    const message = body.message?.trim();

    if (!message) {
      return NextResponse.json({ error: "消息不能为空" }, { status: 400 });
    }

    const session = await getOrCreateDefaultSessionForMp(
      auth.supabase,
      auth.user.id
    );

    const existing = await listChatMessagesForMp(auth.supabase, session.id);
    const history: ChatHistoryItem[] = existing.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    const clientSeqBase = Date.now();
    const userRow = await insertChatMessageForMp(
      auth.supabase,
      auth.user.id,
      session.id,
      "user",
      message,
      clientSeqBase
    );

    let reply: string;
    try {
      reply = await fetchXiaoguangReply(message, history);
    } catch {
      reply = getGentleFallbackReply(message, session.reply_index ?? 0);
    }

    const assistantRow = await insertChatMessageForMp(
      auth.supabase,
      auth.user.id,
      session.id,
      "assistant",
      reply,
      clientSeqBase + 1
    );

    return NextResponse.json({
      reply,
      user_message: {
        id: userRow.id,
        role: userRow.role,
        content: userRow.content,
        created_at: userRow.created_at,
      },
      assistant_message: {
        id: assistantRow.id,
        role: assistantRow.role,
        content: assistantRow.content,
        created_at: assistantRow.created_at,
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "发送失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
