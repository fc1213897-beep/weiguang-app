import { NextRequest, NextResponse } from "next/server";
import { XIAOGUANG_SYSTEM_PROMPT } from "@/lib/xiaoguang-prompt";

export type ChatHistoryItem = {
  role: "user" | "assistant";
  content: string;
};

type ChatRequestBody = {
  message?: string;
  history?: ChatHistoryItem[];
};

/** 通义千问 OpenAI 兼容接口 */
const QWEN_API_URL =
  "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions";

const MAX_HISTORY = 12;

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.DASHSCOPE_API_KEY;
    console.log("[chat] DASHSCOPE_API_KEY loaded:", !!apiKey);

    if (!apiKey) {
      console.error("[chat] missing DASHSCOPE_API_KEY");
      return NextResponse.json(
        { error: "missing_api_key" },
        { status: 500 }
      );
    }

    const body = (await request.json()) as ChatRequestBody;
    const message = body.message?.trim();

    if (!message) {
      return NextResponse.json(
        { error: "empty_message" },
        { status: 400 }
      );
    }

    const history = (body.history ?? [])
      .filter(
        (item) =>
          (item.role === "user" || item.role === "assistant") &&
          typeof item.content === "string" &&
          item.content.trim()
      )
      .slice(-MAX_HISTORY)
      .map((item) => ({
        role: item.role,
        content: item.content.trim(),
      }));

    const qwenRes = await fetch(QWEN_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "qwen-plus",
        temperature: 0.8,
        max_tokens: 200,
        messages: [
          { role: "system", content: XIAOGUANG_SYSTEM_PROMPT },
          ...history,
          { role: "user", content: message },
        ],
      }),
    });

    console.log("[chat] Qwen API status:", qwenRes.status);

    if (!qwenRes.ok) {
      const errText = await qwenRes.text();
      console.error("[chat] Qwen API error:", errText);
      return NextResponse.json(
        { error: "qwen_request_failed" },
        { status: 502 }
      );
    }

    const data = (await qwenRes.json()) as {
      choices?: { message?: { content?: string } }[];
      error?: { message?: string; code?: string };
    };

    const reply = data.choices?.[0]?.message?.content?.trim();

    if (!reply) {
      console.error(
        "[chat] Qwen empty reply:",
        JSON.stringify(data)
      );
      return NextResponse.json(
        { error: "empty_reply" },
        { status: 502 }
      );
    }

    console.log("[chat] Qwen reply ok, length:", reply.length);
    return NextResponse.json({ reply });
  } catch (error) {
    console.error("[chat] internal error:", error);
    return NextResponse.json(
      { error: "internal_error" },
      { status: 500 }
    );
  }
}
