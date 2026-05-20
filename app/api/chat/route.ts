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

const MAX_HISTORY = 12;

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
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

    const openaiRes = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          temperature: 0.8,
          max_tokens: 200,
          messages: [
            { role: "system", content: XIAOGUANG_SYSTEM_PROMPT },
            ...history,
            { role: "user", content: message },
          ],
        }),
      }
    );

    if (!openaiRes.ok) {
      const errText = await openaiRes.text();
      console.error("OpenAI API error:", openaiRes.status, errText);
      return NextResponse.json(
        { error: "openai_request_failed" },
        { status: 502 }
      );
    }

    const data = (await openaiRes.json()) as {
      choices?: { message?: { content?: string } }[];
    };

    const reply = data.choices?.[0]?.message?.content?.trim();

    if (!reply) {
      return NextResponse.json(
        { error: "empty_reply" },
        { status: 502 }
      );
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "internal_error" },
      { status: 500 }
    );
  }
}
