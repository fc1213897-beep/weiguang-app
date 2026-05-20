/** 微光 localStorage 键名 */
export const STORAGE_KEYS = {
  tasks: "weiguang-tasks",
  aiChat: "weiguang-ai-chat",
} as const;

export type TaskItem = {
  text: string;
  done: boolean;
};

export type ChatMessage = {
  id: number;
  role: "user" | "assistant";
  text: string;
};

export type AIChatStorage = {
  messages: ChatMessage[];
  replyIndex: number;
  nextId: number;
};

/** 从 localStorage 读取，失败或不存在时返回 fallback */
export function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/** 写入 localStorage */
export function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // 存储已满等情况下静默失败，不影响使用
  }
}
