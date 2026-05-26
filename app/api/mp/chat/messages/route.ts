import { NextResponse } from "next/server";
import { requireMpAuth } from "@/lib/mp-auth";
import {
  getOrCreateDefaultSessionForMp,
  listChatMessagesForMp,
} from "@/lib/mp-chat-server";

const GREETING = {
  id: "greeting",
  role: "assistant" as const,
  content: "嗨，我是小光。有什么想说的，都可以告诉我 ✨",
  created_at: null,
};

/** GET /api/mp/chat/messages — 默认会话聊天记录 */
export async function GET(request: Request) {
  const auth = await requireMpAuth(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const session = await getOrCreateDefaultSessionForMp(
      auth.supabase,
      auth.user.id
    );
    const rows = await listChatMessagesForMp(auth.supabase, session.id);

    const messages =
      rows.length > 0
        ? rows.map((m) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            created_at: m.created_at,
          }))
        : [GREETING];

    return NextResponse.json({
      session_id: session.id,
      messages,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "获取消息失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
