import { NextRequest, NextResponse } from "next/server";
import {
  fetchXiaoguangReply,
  type ChatHistoryItem,
} from "@/lib/chat-ai";
import {
  buildExpenseAiMessage,
  buildExpenseConfirmReply,
  getTodayDateString,
  mapExpenseRow,
  tryRecordExpenseFromChat,
} from "@/lib/chat-expense";
import { getGentleFallbackReply } from "@/lib/fallback-reply";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ExpenseRow } from "@/types/database";

export type { ChatHistoryItem };

type ChatRequestBody = {
  message?: string;
  history?: ChatHistoryItem[];
  /** 用于 fallback 轮换 */
  reply_index?: number;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ChatRequestBody;
    const message = body.message?.trim();

    if (!message) {
      return NextResponse.json(
        { error: "empty_message" },
        { status: 400 }
      );
    }

    let expenseRecorded: ExpenseRow | null = null;
    let user: { id: string } | null = null;

    try {
      const supabase = await createSupabaseServerClient();
      const authResult = await supabase.auth.getUser();
      user = authResult.data.user;

      if (user) {
        expenseRecorded = await tryRecordExpenseFromChat(message, async (input) => {
          const { data, error } = await supabase
            .from("expenses")
            .insert({
              user_id: user!.id,
              amount: input.amount,
              entry_type: input.entry_type ?? "expense",
              category: input.category ?? "other",
              note: (input.note ?? "").trim(),
              entry_date: input.entry_date ?? getTodayDateString(),
              source: "chat",
            })
            .select()
            .single();

          if (error) throw new Error(error.message);
          return mapExpenseRow(data as Record<string, unknown>);
        });
      }
    } catch (e) {
      console.error("[chat] expense record:", e);
      expenseRecorded = null;
    }

    const aiMessage = expenseRecorded
      ? buildExpenseAiMessage(message, expenseRecorded)
      : message;

    let reply: string;

    if (user) {
      try {
        reply = await fetchXiaoguangReply(aiMessage, body.history ?? []);
      } catch {
        if (expenseRecorded) {
          reply = buildExpenseConfirmReply(expenseRecorded);
        } else {
          reply = getGentleFallbackReply(message, body.reply_index ?? 0);
        }
      }
    } else {
      // 未登录仅返回本地 fallback，避免匿名滥用 AI 额度
      reply = expenseRecorded
        ? buildExpenseConfirmReply(expenseRecorded)
        : getGentleFallbackReply(message, body.reply_index ?? 0);
    }

    return NextResponse.json({
      reply,
      expense_recorded: expenseRecorded,
    });
  } catch (error) {
    console.error("[chat] internal error:", error);
    return NextResponse.json(
      { error: "internal_error" },
      { status: 500 }
    );
  }
}
