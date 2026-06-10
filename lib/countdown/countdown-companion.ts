import { formatDaysLeft, getTodayCountdownTasks, getCountdownIdleDays } from "@/lib/countdown/progress-utils";
import type { CountdownSettings } from "@/types/countdown";
import type { TaskItem } from "@/types/task";

export type CountdownCompanionContext = {
  daysLeft: number | null;
  title: string | null;
  todayCountdownTotal: number;
  todayCountdownDone: number;
  idleDays: number;
};

/** 从设置与任务中提取小光备考语境 */
export function getCountdownCompanionContext(
  tasks: TaskItem[],
  settings: CountdownSettings | null | undefined
): CountdownCompanionContext {
  const empty: CountdownCompanionContext = {
    daysLeft: null,
    title: null,
    todayCountdownTotal: 0,
    todayCountdownDone: 0,
    idleDays: 0,
  };
  if (!settings?.targets?.length) return empty;

  const target =
    settings.targets.find((t) => t.status === "active") ??
    settings.targets.find((t) => t.status === "draft");
  if (!target) return empty;

  const todayTasks = getTodayCountdownTasks(tasks);
  return {
    daysLeft: formatDaysLeft(target),
    title: target.title,
    todayCountdownTotal: todayTasks.length,
    todayCountdownDone: todayTasks.filter((t) => t.done).length,
    idleDays: getCountdownIdleDays(tasks, target.id),
  };
}

/** 备考语境下的小光补充语 */
export function getCountdownCompanionLine(
  ctx: CountdownCompanionContext
): string | null {
  if (ctx.daysLeft == null || !ctx.title) return null;

  if (ctx.daysLeft <= 0) {
    return `${ctx.title} 的日子到了，无论结果如何，你已经走了很长一段路。`;
  }
  if (ctx.daysLeft <= 30) {
    return `距 ${ctx.title} 还有 ${ctx.daysLeft} 天，最后一段路按自己的节奏就好。`;
  }
  if (
    ctx.todayCountdownTotal > 0 &&
    ctx.todayCountdownDone === ctx.todayCountdownTotal
  ) {
    return "今天的备考小任务都完成了，可以轻轻收工休息一下。";
  }
  if (ctx.idleDays >= 3) {
    return "备考计划还在等你，今天做一小步也算向前。";
  }
  if (ctx.todayCountdownTotal > 0 && ctx.todayCountdownDone === 0) {
    return "今天还有备考安排，挑一件最小的开始就好。";
  }
  return null;
}
