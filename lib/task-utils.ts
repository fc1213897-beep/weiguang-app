import type { TaskItem } from "@/types/task";

/** 格式化为 YYYY-MM-DD */
export function formatDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** 今日日期字符串 */
export function getTodayDateString(): string {
  return formatDateString(new Date());
}

/** 解析 YYYY-MM-DD，无效时返回 null */
export function parseDateString(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const date = new Date(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3])
  );
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

export function isValidDateString(value: string): boolean {
  return parseDateString(value) !== null;
}

/** 生成任务唯一 id */
export function generateTaskId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `task-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** 将 localStorage 中的旧/新数据统一为 TaskItem[] */
export function normalizeTaskItems(raw: unknown): TaskItem[] {
  if (!Array.isArray(raw)) return [];

  const today = getTodayDateString();
  const result: TaskItem[] = [];

  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const record = item as Record<string, unknown>;
    const text = typeof record.text === "string" ? record.text.trim() : "";
    if (!text) continue;

    const done = Boolean(record.done);
    const id =
      typeof record.id === "string" && record.id
        ? record.id
        : generateTaskId();
    const date =
      typeof record.date === "string" && isValidDateString(record.date)
        ? record.date
        : today;

    result.push({ id, text, done, date });
  }

  return result;
}

/** 按日期筛选任务 */
export function filterTasksByDate(
  tasks: TaskItem[],
  date: string
): TaskItem[] {
  return tasks.filter((item) => item.date === date);
}

/** 任务统计摘要 */
export type TaskStatsSummary = {
  total: number;
  completed: number;
  pending: number;
};

/** 根据任务列表计算统计（基于真实 tasks 数据） */
export function computeTaskStats(tasks: TaskItem[]): TaskStatsSummary {
  const total = tasks.length;
  const completed = tasks.filter((item) => item.done).length;
  const pending = total - completed;
  return { total, completed, pending };
}

/** 日期加减天数，返回 YYYY-MM-DD */
export function addDaysToDateString(dateStr: string, delta: number): string {
  const parsed = parseDateString(dateStr);
  if (!parsed) return dateStr;
  parsed.setDate(parsed.getDate() + delta);
  return formatDateString(parsed);
}

const WEEKDAY_NAMES = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

/** 选中日期展示文案，如「5月21日 周四」 */
export function formatSelectedDateDisplay(dateStr: string): string {
  const parsed = parseDateString(dateStr);
  if (!parsed) return dateStr;
  return `${parsed.getMonth() + 1}月${parsed.getDate()}日 ${WEEKDAY_NAMES[parsed.getDay()]}`;
}

/** 统计范围短标签，用于统计卡片标题 */
export function getStatsScopeLabel(date: string): string {
  const today = getTodayDateString();
  if (date === today) return "今日";

  const parsed = parseDateString(date);
  if (!parsed) return "当日";

  return `${parsed.getMonth() + 1}月${parsed.getDate()}日`;
}

/** 选中日期对应的标题文案 */
export function getPlanTitle(date: string): string {
  const today = getTodayDateString();
  if (date === today) return "今日学习计划";

  const parsed = parseDateString(date);
  if (!parsed) return "学习计划";

  return `${parsed.getMonth() + 1}月${parsed.getDate()}日 学习计划`;
}

/** 获取某月日历格子（含上月/下月补位，固定 6 行 × 7 列） */
export function getMonthCalendarDays(year: number, month: number): Date[] {
  const firstDay = new Date(year, month, 1);
  const startWeekday = firstDay.getDay();
  const gridStart = new Date(year, month, 1 - startWeekday);

  const days: Date[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    days.push(d);
  }
  return days;
}
