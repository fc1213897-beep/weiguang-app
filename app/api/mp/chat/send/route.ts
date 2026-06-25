import { NextResponse } from "next/server";
import { fetchXiaoguangReply, type ChatHistoryItem } from "@/lib/chat-ai";
import {
  buildExpenseAiMessage,
  buildExpenseConfirmReply,
  tryRecordExpenseFromChat,
} from "@/lib/chat-expense";
import { getGentleFallbackReply } from "@/lib/fallback-reply";
import { requireMpAuth } from "@/lib/mp-auth";
import { createExpenseForMp } from "@/lib/mp-expenses-server";
import {
  getOrCreateDefaultSessionForMp,
  insertChatMessageForMp,
  listChatMessagesForMp,
} from "@/lib/mp-chat-server";
import { detectSplitIntent, extractSplitGoal } from "@/lib/task-split";
import { splitGoalWithAi } from "@/lib/task-split-ai";
import { getTodayDateString } from "@/lib/task-utils";
import type { ExpenseRow } from "@/types/database";
import type { PlanDraft } from "@/types/task";

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

    let expenseRecorded: ExpenseRow | null = null;
    expenseRecorded = await tryRecordExpenseFromChat(message, (input) =>
      createExpenseForMp(auth.user.id, input)
    );

    const aiMessage = expenseRecorded
      ? buildExpenseAiMessage(message, expenseRecorded)
      : message;

    let reply: string;
    let tasksSuggested: PlanDraft[] | undefined;

    if (!expenseRecorded && detectSplitIntent(message)) {
      try {
        const goal = extractSplitGoal(message);
        const split = await splitGoalWithAi(goal, getTodayDateString());
        if (split.drafts.length > 0) {
          tasksSuggested = split.drafts;
          reply = `${split.summary}\n\n我帮你拆成了 ${split.drafts.length} 个小步骤，可以一键加入今日计划～`;
        } else {
          reply = split.summary;
        }
      } catch {
        reply = getGentleFallbackReply(message, session.reply_index ?? 0);
      }
    } else {
      try {
        reply = await fetchXiaoguangReply(aiMessage, history);
      } catch {
        if (expenseRecorded) {
          reply = buildExpenseConfirmReply(expenseRecorded);
        } else {
          reply = getGentleFallbackReply(message, session.reply_index ?? 0);
        }
      }
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
      expense_recorded: expenseRecorded,
      tasks_suggested: tasksSuggested,
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
        expense_recorded: !!expenseRecorded,
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "发送失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
