import { create } from "zustand";
import { getGentleFallbackReply } from "@/lib/fallback-reply";
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
  fadeInAssistantId: number | null;
  setInput: (v: string) => void;
  setStorageReady: (ready: boolean) => void;
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
): Promise<string> {
  const history = historyMessages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({ role: m.role, content: m.text }));

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userText, history }),
    });
    const data = (await res.json()) as { reply?: string; error?: string };
    if (!res.ok || !data.reply?.trim()) throw new Error("chat_failed");
    return data.reply.trim();
  } catch {
    return getGentleFallbackReply(userText, replyIndex);
  }
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: INITIAL_MESSAGES,
  replyIndex: 0,
  nextId: 1,
  input: "",
  isSending: false,
  storageReady: false,
  fadeInAssistantId: null,

  setInput: (v) => set({ input: v }),
  setStorageReady: (ready) => set({ storageReady: ready }),

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

    const assistantText = await fetchAIReply(
      value,
      historyBeforeSend,
      replyIndex
    );

    const assistantId = get().nextId;
    const assistantMsg: ChatMessage = {
      id: assistantId,
      role: "assistant",
      text: assistantText,
    };

    set((s) => ({
      messages: [...s.messages, assistantMsg],
      replyIndex: s.replyIndex + 1,
      nextId: assistantId + 1,
      isSending: false,
      fadeInAssistantId: assistantId,
    }));
  },
}));

export { INITIAL_MESSAGES, getNextIdFromMessages };
