import { noteBelongsToPlan, noteBelongsToTarget } from "@/lib/countdown/note-utils";
import {
  buildRoundBoundaries,
  getDaysBetween,
  getDaysLeft,
  getRoundForDate,
} from "@/lib/countdown/schedule-utils";
import { addDaysToDateString, getTodayDateString } from "@/lib/task-utils";
import type { TaskItem } from "@/types/task";
import type {
  CountdownSettings,
  CountdownTarget,
  PlanProgressSummary,
} from "@/types/countdown";

/** 子计划进度统计 */
export function getPlanProgress(
  tasks: TaskItem[],
  target: CountdownTarget,
  planId: string,
  planLabel: string
): PlanProgressSummary {
  const related = tasks.filter(
    (t) => noteBelongsToPlan(t.note, target.id, planId)
  );
  const total = related.length;
  const completed = related.filter((t) => t.done).length;
  const summary =
    total === 0
      ? "尚未生成任务"
      : `已完成 ${completed}/${total}`;
  return { planId, label: planLabel, total, completed, summary };
}

/** 倒计时下所有子计划进度 */
export function getTargetProgress(
  tasks: TaskItem[],
  target: CountdownTarget
): PlanProgressSummary[] {
  return target.plans
    .filter((p) => p.enabled)
    .map((p) => getPlanProgress(tasks, target, p.id, p.label));
}

/** 获取当前 active 倒计时（优先 active 状态） */
export function getActiveCountdown(
  settings: CountdownSettings
): CountdownTarget | null {
  const active = settings.targets.find((t) => t.status === "active");
  if (active) return active;
  return settings.targets.find((t) => t.status === "draft") ?? null;
}

/** 倒计时剩余天数文案 */
export function formatDaysLeft(target: CountdownTarget, today?: string): number {
  return getDaysLeft(target.startDate, target.targetDate, today ?? getTodayDateString());
}

/** 子计划一行摘要（Hero 用） */
export function buildPlanSummaryLine(
  target: CountdownTarget,
  tasks: TaskItem[],
  today = getTodayDateString()
): string {
  const parts = target.plans
    .filter((p) => p.enabled)
    .map((p) => {
      const progress = getPlanProgress(tasks, target, p.id, p.label);
      if (p.strategyId === "kaoyan_vocab" || p.strategyId === "round_frequency") {
        const rounds =
          typeof p.params.rounds === "number" ? p.params.rounds : 3;
        const totalDays = getDaysBetween(target.startDate, target.targetDate);
        const boundaries = buildRoundBoundaries(
          target.startDate,
          totalDays,
          rounds
        );
        const round = getRoundForDate(today, boundaries);
        return `${p.label} 第${round}轮`;
      }
      if (p.strategyId === "even_chapters") {
        const done = progress.completed;
        const total =
          typeof p.params.chapterCount === "number"
            ? p.params.chapterCount
            : "?";
        return `${p.label} ${done}/${total}章`;
      }
      if (p.strategyId === "daily_quota") {
        const count =
          typeof p.params.dailyCount === "number"
            ? p.params.dailyCount
            : 0;
        const unit =
          typeof p.params.unit === "string" ? p.params.unit : "";
        return `${p.label} 每日${count}${unit}`;
      }
      return p.label;
    });
  return parts.join(" · ");
}

/** 今日备考任务 */
export function getTodayCountdownTasks(
  tasks: TaskItem[],
  today = getTodayDateString()
): TaskItem[] {
  return tasks.filter(
    (t) => t.date === today && t.note.startsWith("countdown:v1:")
  );
}

/** 连续未完成备考任务天数 */
export function getCountdownIdleDays(
  tasks: TaskItem[],
  targetId: string,
  today = getTodayDateString()
): number {
  let idle = 0;
  let cursor = today;
  for (let i = 0; i < 30; i++) {
    const dayTasks = tasks.filter(
      (t) =>
        t.date === cursor &&
        noteBelongsToTarget(t.note, targetId)
    );
    if (dayTasks.length === 0) break;
    const hasDone = dayTasks.some((t) => t.done);
    if (hasDone) break;
    idle++;
    cursor = addDaysToDateString(cursor, -1);
  }
  return idle;
}
