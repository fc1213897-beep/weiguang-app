import type { PlanDraft, TaskCategory, TaskPriority } from "@/types/task";

export const TASK_CATEGORIES: {
  id: TaskCategory;
  label: string;
  icon: string;
}[] = [
  { id: "study", label: "学习", icon: "📚" },
  { id: "coding", label: "编程", icon: "💻" },
  { id: "sport", label: "运动", icon: "🏃" },
  { id: "life", label: "生活", icon: "🌿" },
  { id: "other", label: "其他", icon: "✨" },
];

export const TASK_PRIORITIES: {
  id: TaskPriority;
  label: string;
}[] = [
  { id: "low", label: "轻柔" },
  { id: "medium", label: "刚好" },
  { id: "high", label: "重要" },
];

export const POMODORO_OPTIONS = [
  { minutes: 0, label: "不设" },
  { minutes: 15, label: "15 分" },
  { minutes: 25, label: "25 分" },
  { minutes: 45, label: "45 分" },
] as const;

/** 首页一键快速添加（日期由 store 填入 selectedDate） */
export const QUICK_PLAN_PRESETS: Omit<PlanDraft, "date" | "note">[] = [
  {
    text: "背 10 个单词",
    category: "study",
    priority: "low",
    pomodoroMinutes: 15,
  },
  {
    text: "看 1 节视频课",
    category: "study",
    priority: "medium",
    pomodoroMinutes: 25,
  },
  {
    text: "写 3 道题",
    category: "study",
    priority: "medium",
    pomodoroMinutes: 25,
  },
];

export function createDefaultPlanDraft(date: string): PlanDraft {
  return {
    text: "",
    category: "study",
    priority: "medium",
    pomodoroMinutes: 25,
    date,
    note: "",
  };
}

/** 静态默认（仅类型占位，实际请用 createDefaultPlanDraft） */
export const DEFAULT_PLAN_DRAFT: PlanDraft = {
  text: "",
  category: "study",
  priority: "medium",
  pomodoroMinutes: 25,
  date: "",
  note: "",
};

/** 小光推荐的最小目标库（本地随机，非 API） */
const XIAOGUANG_SUGGESTIONS: Omit<PlanDraft, "date" | "note">[] = [
  {
    text: "背 10 个单词",
    category: "study",
    priority: "low",
    pomodoroMinutes: 15,
  },
  {
    text: "复习一章笔记",
    category: "study",
    priority: "medium",
    pomodoroMinutes: 25,
  },
  {
    text: "写 20 分钟代码",
    category: "coding",
    priority: "medium",
    pomodoroMinutes: 25,
  },
  {
    text: "整理 3 个 bug",
    category: "coding",
    priority: "low",
    pomodoroMinutes: 15,
  },
  {
    text: "散步 15 分钟",
    category: "sport",
    priority: "low",
    pomodoroMinutes: 15,
  },
  {
    text: "拉伸 + 喝水",
    category: "sport",
    priority: "low",
    pomodoroMinutes: 0,
  },
  {
    text: "收拾书桌 10 分钟",
    category: "life",
    priority: "low",
    pomodoroMinutes: 15,
  },
  {
    text: "早睡准备：放下手机",
    category: "life",
    priority: "medium",
    pomodoroMinutes: 0,
  },
  {
    text: "做一道错题复盘",
    category: "study",
    priority: "medium",
    pomodoroMinutes: 25,
  },
  {
    text: "给小光说说今天的心情",
    category: "other",
    priority: "low",
    pomodoroMinutes: 0,
  },
];

export function getRandomXiaoguangSuggestion(): PlanDraft {
  const pick =
    XIAOGUANG_SUGGESTIONS[
      Math.floor(Math.random() * XIAOGUANG_SUGGESTIONS.length)
    ];
  return { ...pick, date: "", note: "" };
}

export function getCategoryMeta(category: TaskCategory) {
  return TASK_CATEGORIES.find((c) => c.id === category) ?? TASK_CATEGORIES[4];
}

export function getPriorityLabel(priority: TaskPriority) {
  return TASK_PRIORITIES.find((p) => p.id === priority)?.label ?? "刚好";
}

export function normalizeCategory(value: unknown): TaskCategory {
  if (
    value === "study" ||
    value === "coding" ||
    value === "sport" ||
    value === "life" ||
    value === "other"
  ) {
    return value;
  }
  return "study";
}

export function normalizePriority(value: unknown): TaskPriority {
  if (value === "low" || value === "medium" || value === "high") return value;
  return "medium";
}

export function normalizePomodoro(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  if ([0, 15, 25, 45].includes(n)) return n;
  return 0;
}
