import { XIAOGUANG_SYSTEM_PROMPT } from "@/lib/xiaoguang-prompt";

export type ChatHistoryItem = {
  role: "user" | "assistant";
  content: string;
};

const QWEN_API_URL =
  "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions";

const MAX_HISTORY = 12;

/**
 * 调用通义千问获取小光回复
 */
export async function fetchXiaoguangReply(
  message: string,
  history: ChatHistoryItem[] = []
): Promise<string> {
  const apiKey = process.env.DASHSCOPE_API_KEY;
  if (!apiKey) {
    throw new Error("missing_api_key");
  }

  const trimmedHistory = history
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
        ...trimmedHistory,
        { role: "user", content: message },
      ],
    }),
  });

  if (!qwenRes.ok) {
    throw new Error("qwen_request_failed");
  }

  const data = (await qwenRes.json()) as {
    choices?: { message?: { content?: string } }[];
  };

  const reply = data.choices?.[0]?.message?.content?.trim();
  if (!reply) {
    throw new Error("empty_reply");
  }

  return reply;
}
