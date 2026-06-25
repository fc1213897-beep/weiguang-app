import { createDefaultPlanDraft } from "@/lib/task-plan";
import type { PlanDraft, TaskCategory, TaskPriority } from "@/types/task";

export type TaskSplitMode = "ai" | "import";

export type TaskSplitRequest = {
  goal?: string;
  task_date: string;
  mode: TaskSplitMode;
  lines?: string[];
  /** import 模式下是否用 AI 轻量润色标题 */
  polish?: boolean;
};

export type TaskSplitResult = {
  drafts: PlanDraft[];
  summary: string;
  mode: TaskSplitMode;
};

const SPLIT_INTENT_RE =
  /帮我拆|拆分|分成|子任务|拆成|分解|列个计划|任务列表|规划一下/i;

const VALID_CATEGORIES = new Set<TaskCategory>([
  "study",
  "coding",
  "sport",
  "life",
  "other",
]);

const VALID_PRIORITIES = new Set<TaskPriority>(["low", "medium", "high"]);

/** 聊天消息是否像「请求拆分任务」 */
export function detectSplitIntent(message: string): boolean {
  const text = message.trim();
  if (!text) return false;
  if (SPLIT_INTENT_RE.test(text)) return true;
  if (text.length >= 8 && /计划|复习|备考|学习/.test(text) && /怎么|如何|安排/.test(text)) {
    return true;
  }
  return false;
}

/** 从拆分意图消息中提取目标描述 */
export function extractSplitGoal(message: string): string {
  return message
    .trim()
    .replace(/^小光[，,]?\s*/i, "")
    .replace(/^[请帮]?我/, "")
    .trim();
}

/** 多行文本 → PlanDraft 列表（不调用 AI） */
export function importLinesToDrafts(
  lines: string[],
  taskDate: string,
  note = "source:import"
): PlanDraft[] {
  const base = createDefaultPlanDraft(taskDate);
  return lines
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((text) => ({
      ...base,
      text,
      note,
    }));
}

export function normalizeAiDraft(
  raw: Record<string, unknown>,
  taskDate: string,
  index: number
): PlanDraft | null {
  const text = String(raw.text ?? raw.title ?? "").trim();
  if (!text) return null;

  const category = VALID_CATEGORIES.has(raw.category as TaskCategory)
    ? (raw.category as TaskCategory)
    : "study";
  const priority = VALID_PRIORITIES.has(raw.priority as TaskPriority)
    ? (raw.priority as TaskPriority)
    : "medium";
  const pomodoro = Number(raw.pomodoroMinutes ?? raw.pomodoro_minutes ?? 25);
  const pomodoroMinutes = Number.isFinite(pomodoro) && pomodoro >= 0 ? pomodoro : 25;

  return {
    text: text.slice(0, 120),
    category,
    priority,
    pomodoroMinutes,
    date: taskDate,
    note: `source:ai_split#${index + 1}`,
  };
}

export function fallbackSingleDraft(goal: string, taskDate: string): PlanDraft[] {
  const base = createDefaultPlanDraft(taskDate);
  return [
    {
      ...base,
      text: goal.trim().slice(0, 120) || "今日小目标",
      note: "source:ai_split_fallback",
    },
  ];
}
