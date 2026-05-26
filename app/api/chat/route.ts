import { NextRequest, NextResponse } from "next/server";
import {
  fetchXiaoguangReply,
  type ChatHistoryItem,
} from "@/lib/chat-ai";

export type { ChatHistoryItem };

type ChatRequestBody = {
  message?: string;
  history?: ChatHistoryItem[];
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

    const reply = await fetchXiaoguangReply(message, body.history ?? []);
    return NextResponse.json({ reply });
  } catch (error) {
    console.error("[chat] internal error:", error);
    return NextResponse.json(
      { error: "internal_error" },
      { status: 500 }
    );
  }
}
