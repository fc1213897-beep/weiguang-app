import type { MessageRow } from "@/types/database";
import type { ChatMessage } from "@/types/chat";

/** 云端消息列表 → 本地 ChatMessage[]（按 client_seq 排序） */
export function messageRowsToChatMessages(rows: MessageRow[]): ChatMessage[] {
  const sorted = [...rows].sort((a, b) => {
    const sa = a.client_seq ?? 0;
    const sb = b.client_seq ?? 0;
    if (sa !== sb) return sa - sb;
    return a.created_at.localeCompare(b.created_at);
  });

  return sorted
    .filter((r) => r.role === "user" || r.role === "assistant")
    .map((r) => ({
      id: Number(r.client_seq ?? 0),
      role: r.role as "user" | "assistant",
      text: r.content,
    }));
}

/** 从消息列表计算 nextId */
export function computeNextIdFromMessages(messages: ChatMessage[]): number {
  if (messages.length === 0) return 1;
  return Math.max(...messages.map((m) => m.id)) + 1;
}
