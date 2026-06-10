import {
  getCountdownCompanionLine,
  type CountdownCompanionContext,
} from "@/lib/countdown/countdown-companion";
import { getTimePeriod } from "@/lib/time-greeting";
import {
  addDaysToDateString,
  computeTaskStats,
  getTodayDateString,
  parseDateString,
} from "@/lib/task-utils";
import type { TaskItem } from "@/types/task";

/** 旅程阶段（人生地图） */
export type JourneyStageId =
  | "forest"
  | "town"
  | "lake"
  | "valley"
  | "stars"
  | "seaside";

export const JOURNEY_STAGES: {
  id: JourneyStageId;
  label: string;
  emoji: string;
}[] = [
  { id: "forest", label: "森林", emoji: "🌲" },
  { id: "town", label: "小镇", emoji: "🏡" },
  { id: "lake", label: "湖泊", emoji: "🌊" },
  { id: "valley", label: "山谷", emoji: "⛰️" },
  { id: "stars", label: "星空", emoji: "✨" },
  { id: "seaside", label: "海边", emoji: "🌅" },
];

/** 根据累计完成任务数判定当前旅程阶段 */
export function getJourneyStage(totalCompleted: number): (typeof JOURNEY_STAGES)[number] {
  if (totalCompleted >= 35) return JOURNEY_STAGES[5];
  if (totalCompleted >= 20) return JOURNEY_STAGES[4];
  if (totalCompleted >= 12) return JOURNEY_STAGES[3];
  if (totalCompleted >= 7) return JOURNEY_STAGES[2];
  if (totalCompleted >= 3) return JOURNEY_STAGES[1];
  return JOURNEY_STAGES[0];
}

/** 连续有完成任务的天数（从今天往前数） */
export function computeStreakDays(tasks: TaskItem[]): number {
  const today = getTodayDateString();
  let streak = 0;
  let cursor = today;

  for (let i = 0; i < 365; i++) {
    const dayTasks = tasks.filter((t) => t.date === cursor);
    const hasDone = dayTasks.some((t) => t.done);
    if (!hasDone) break;
    streak++;
    cursor = addDaysToDateString(cursor, -1);
  }

  return streak;
}

/** 距离上次完成任务的天数；从未完成则返回较大值 */
export function daysSinceLastCompletion(tasks: TaskItem[]): number {
  const doneDates = tasks
    .filter((t) => t.done)
    .map((t) => t.date)
    .sort()
    .reverse();

  if (doneDates.length === 0) return 999;

  const last = parseDateString(doneDates[0]);
  if (!last) return 999;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  last.setHours(0, 0, 0, 0);
  return Math.floor((today.getTime() - last.getTime()) / 86400000);
}

/** 本周一 00:00 */
function startOfWeek(date: Date = new Date()): Date {
  const c = new Date(date);
  const day = c.getDay() || 7;
  c.setDate(c.getDate() - day + 1);
  c.setHours(0, 0, 0, 0);
  return c;
}

/** 本周学习指标 */
export function getWeekMetrics(tasks: TaskItem[]) {
  const now = new Date();
  const weekStart = startOfWeek(now);
  const today = getTodayDateString();

  const weekTasks = tasks.filter((t) => {
    const d = parseDateString(t.date);
    return d ? d >= weekStart && d <= now : false;
  });

  const todayTasks = tasks.filter((t) => t.date === today);
  const weekDone = weekTasks.filter((t) => t.done).length;
  const weekTotal = weekTasks.length;
  const weekFocus = weekTasks.reduce((s, t) => s + (t.pomodoroMinutes || 0), 0);
  const weekRate = weekTotal ? Math.round((weekDone / weekTotal) * 100) : 0;

  return {
    weekDone,
    weekTotal,
    weekFocus,
    weekRate,
    todayStats: computeTaskStats(todayTasks),
    streak: computeStreakDays(tasks),
    totalCompleted: tasks.filter((t) => t.done).length,
  };
}

const PRIORITY_WEIGHT: Record<TaskItem["priority"], number> = {
  high: 3,
  medium: 2,
  low: 1,
};

/** 今日重点任务：优先未完成的高优先级，最多 5 条 */
export function getTopPriorityTasks(tasks: TaskItem[], limit = 5): TaskItem[] {
  const today = getTodayDateString();
  return tasks
    .filter((t) => t.date === today)
    .sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1;
      return PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority];
    })
    .slice(0, limit);
}

/** 今日学习轨迹（根据完成顺序生成展示时间） */
export function buildActivityTimeline(tasks: TaskItem[]): {
  time: string;
  label: string;
  detail: string;
}[] {
  const today = getTodayDateString();
  const done = tasks.filter((t) => t.date === today && t.done);
  const slots = ["09:30", "11:15", "14:20", "17:40", "20:15", "22:00"];

  return done.map((t, i) => {
    const mins = t.pomodoroMinutes > 0 ? `${t.pomodoroMinutes} 分钟` : "一小步";
    return {
      time: slots[i % slots.length],
      label: t.text,
      detail: mins,
    };
  });
}

/** 小光陪伴语（完成任务 / 连续成长 / 低落 / 备考语境） */
export function getXiaoguangLine(
  tasks: TaskItem[],
  lastAssistant?: string,
  countdown?: CountdownCompanionContext | null
): string {
  const cdLine = countdown ? getCountdownCompanionLine(countdown) : null;
  const { streak, todayStats } = getWeekMetrics(tasks);
  const idle = daysSinceLastCompletion(tasks);

  if (idle >= 7) {
    return "今天的小路还暗着也没关系。等你慢慢回来，小光还会在这里 ✨";
  }

  if (cdLine) {
    const allCountdownDone =
      (countdown?.todayCountdownTotal ?? 0) > 0 &&
      countdown?.todayCountdownDone === countdown?.todayCountdownTotal;
    const nearExam =
      countdown?.daysLeft != null && countdown.daysLeft <= 30;
    const countdownIdle = (countdown?.idleDays ?? 0) >= 3;
    if (allCountdownDone || nearExam || countdownIdle || todayStats.completed === 0) {
      return cdLine;
    }
  }

  if (todayStats.completed > 0) {
    const lines = [
      "嘿，今天的小路亮起来了一点 ✨",
      "你刚刚又往前走了一小步呀。",
      "今晚的风好像都轻了一些。",
    ];
    return lines[todayStats.completed % lines.length];
  }
  if (streak >= 7) {
    return `已经连续前进 ${streak} 天啦 🌙 森林里的灯开始慢慢亮起来了。`;
  }
  if (streak >= 3) {
    return "路一直都在，我们按自己的节奏慢慢走。";
  }
  if (cdLine) return cdLine;
  return lastAssistant ?? "今天先完成一个最小任务就很好。";
}

/** AI 今日建议（本地生成，不调用 API） */
export function getAiDailySuggestions(
  tasks: TaskItem[],
  countdown?: CountdownCompanionContext | null
): string[] {
  const { todayStats, streak, weekRate } = getWeekMetrics(tasks);
  const period = getTimePeriod();
  const suggestions: string[] = [];

  if (
    countdown &&
    countdown.todayCountdownTotal > 0 &&
    countdown.todayCountdownDone === 0
  ) {
    suggestions.push("今天还有备考安排，挑一件最小的开始就好。");
  }

  if (todayStats.pending > 3) {
    suggestions.push("今天任务有点多，先挑一件最重要的小事先做就好。");
  } else if (todayStats.pending === 0 && todayStats.total > 0) {
    suggestions.push("今天的路已经亮了不少，剩下的时间可以好好休息。");
  } else {
    suggestions.push("给自己定一个小目标，做完一件就很值得开心。");
  }

  if (period === "lateNight") {
    suggestions.push("夜深了，轻一点、慢一点，身体要紧。");
  } else if (period === "morning") {
    suggestions.push("早晨适合从最短的任务开始，唤醒节奏。");
  } else {
    suggestions.push("学累了就歇一会儿，回来我们再继续。");
  }

  if (streak >= 5) {
    suggestions.push(`你已经连续前进了 ${streak} 天，温柔坚持比冲刺更重要。`);
  } else if (weekRate < 40 && weekRate > 0) {
    suggestions.push("本周不必追满分，完成一件算一件，路不会消失。");
  } else {
    suggestions.push("人生不是冲刺，而是慢慢亮起来的路。");
  }

  return suggestions.slice(0, 3);
}

/** 地图点亮进度 0–1 */
export function getMapLightProgress(tasks: TaskItem[]): number {
  const total = tasks.filter((t) => t.done).length;
  return Math.min(1, total / 40);
}

/** 是否应在地图边缘显示老旅人（一周以上未完成任务） */
export function shouldShowOldTraveler(tasks: TaskItem[]): boolean {
  return daysSinceLastCompletion(tasks) >= 7;
}

/** 老旅人对话文案 */
export const OLD_TRAVELER_LINES = [
  "年轻人，最近的风是不是有点冷了。",
  "路暂停了一会儿，也没关系。",
  "有时候，停下来看看月亮，也算是在前进。",
  "路不会因为你慢一点，就消失的。",
] as const;

/** 今日状态文案（避免 KPI / 失败感） */
export function getTodayMoodLabel(tasks: TaskItem[]): string {
  const { todayStats } = getWeekMetrics(tasks);
  if (todayStats.completed === 0) return "慢慢启程";
  if (todayStats.completed < todayStats.total) return "温柔前进中";
  return "今日小路已点亮";
}
