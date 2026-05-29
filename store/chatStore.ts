import { create } from "zustand";
import { getGentleFallbackReply } from "@/lib/fallback-reply";
import { notifyExpenseChanged } from "@/lib/expense-events";
import {
  insertMessage as insertCloudMessage,
  updateSessionReplyIndex,
} from "@/lib/supabase/chat";
import type { ChatMessage } from "@/types/chat";

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 0,
    role: "assistant",
    text: "嗨，我是小光。有什么想说的，都可以告诉我 ✨",
  },
];

function getNextIdFromMessages(messages: ChatMessage[]): number {
  if (messages.length === 0) return 1;
  return Math.max(...messages.map((m) => m.id)) + 1;
}

type ChatState = {
  messages: ChatMessage[];
  replyIndex: number;
  nextId: number;
  input: string;
  isSending: boolean;
  storageReady: boolean;
  /** 已登录时写入 Supabase，不存 localStorage */
  syncEnabled: boolean;
  cloudSessionId: string | null;
  fadeInAssistantId: number | null;
  setInput: (v: string) => void;
  setStorageReady: (ready: boolean) => void;
  setSyncEnabled: (enabled: boolean) => void;
  setCloudSessionId: (id: string | null) => void;
  hydrate: (data: {
    messages: ChatMessage[];
    replyIndex: number;
    nextId: number;
  }) => void;
  sendMessage: () => Promise<void>;
};

async function fetchAIReply(
  userText: string,
  historyMessages: ChatMessage[],
  replyIndex: number
): Promise<{ reply: string; expenseRecorded: boolean }> {
  const history = historyMessages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({ role: m.role, content: m.text }));

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: userText,
        history,
        reply_index: replyIndex,
      }),
    });
    const data = (await res.json()) as {
      reply?: string;
      error?: string;
      expense_recorded?: { amount?: number } | null;
    };
    if (!res.ok || !data.reply?.trim()) throw new Error("chat_failed");
    return {
      reply: data.reply.trim(),
      expenseRecorded: !!data.expense_recorded,
    };
  } catch {
    return {
      reply: getGentleFallbackReply(userText, replyIndex),
      expenseRecorded: false,
    };
  }
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: INITIAL_MESSAGES,
  replyIndex: 0,
  nextId: 1,
  input: "",
  isSending: false,
  storageReady: false,
  syncEnabled: false,
  cloudSessionId: null,
  fadeInAssistantId: null,

  setInput: (v) => set({ input: v }),
  setStorageReady: (ready) => set({ storageReady: ready }),
  setSyncEnabled: (enabled) => set({ syncEnabled: enabled }),
  setCloudSessionId: (id) => set({ cloudSessionId: id }),

  hydrate: ({ messages, replyIndex, nextId }) =>
    set({ messages, replyIndex, nextId }),

  sendMessage: async () => {
    const { input, isSending, messages, replyIndex, nextId } = get();
    const value = input.trim();
    if (!value || isSending) return;

    const userMsg: ChatMessage = {
      id: nextId,
      role: "user",
      text: value,
    };
    const historyBeforeSend = messages;

    set({
      messages: [...messages, userMsg],
      input: "",
      isSending: true,
      nextId: nextId + 1,
    });

    const { syncEnabled, cloudSessionId } = get();
    if (syncEnabled && cloudSessionId) {
      void insertCloudMessage({
        session_id: cloudSessionId,
        role: "user",
        content: value,
        client_seq: userMsg.id,
      }).then((res) => {
        if (res.error) console.error("[chat sync] insert user", res.error);
      });
    }

    const { reply: assistantText, expenseRecorded } = await fetchAIReply(
      value,
      historyBeforeSend,
      replyIndex
    );

    const assistantId = get().nextId;
    const assistantMsg: ChatMessage = {
      id: assistantId,
      role: "assistant",
      text: assistantText,
      expenseRecorded,
    };

    const newReplyIndex = get().replyIndex + 1;

    set((s) => ({
      messages: [...s.messages, assistantMsg],
      replyIndex: newReplyIndex,
      nextId: assistantId + 1,
      isSending: false,
      fadeInAssistantId: assistantId,
    }));

    if (expenseRecorded) {
      notifyExpenseChanged();
    }

    const after = get();
    if (after.syncEnabled && after.cloudSessionId) {
      void insertCloudMessage({
        session_id: after.cloudSessionId,
        role: "assistant",
        content: assistantText,
        client_seq: assistantId,
      }).then((res) => {
        if (res.error) console.error("[chat sync] insert assistant", res.error);
      });
      void updateSessionReplyIndex(
        after.cloudSessionId,
        newReplyIndex
      ).then((res) => {
        if (res.error) console.error("[chat sync] reply_index", res.error);
      });
    }
  },
}));

export { INITIAL_MESSAGES, getNextIdFromMessages };
