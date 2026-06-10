import {
  getCountdownCompanionContext,
  getCountdownCompanionLine,
} from "@/lib/countdown/countdown-companion";
import { isCountdownAutoTask } from "@/lib/countdown/note-utils";
import type { CountdownSettings } from "@/types/countdown";
import type { TaskItem } from "@/types/task";

const GENERIC_COMPLETE_LINES = [
  "嘿，今天的小路又亮起来了一点 ✨",
  "你刚刚又往前走了一小步呀。",
  "做完一件就很值得开心。",
  "今晚的风好像都轻了一些。",
];

/** 完成任务时的小光轻提示（温柔、非 KPI） */
export function getTaskCompleteLine(
  task: TaskItem,
  allTasks: TaskItem[],
  countdownSettings?: CountdownSettings | null
): string {
  if (isCountdownAutoTask(task.note)) {
    const ctx = getCountdownCompanionContext(allTasks, countdownSettings ?? null);
    const examLine = getCountdownCompanionLine({
      ...ctx,
      todayCountdownDone: ctx.todayCountdownDone + 1,
    });
    if (examLine) return examLine;
    return "备考计划又前进了一小步，按自己的节奏就好。";
  }

  const idx = allTasks.filter((t) => t.done).length;
  return GENERIC_COMPLETE_LINES[idx % GENERIC_COMPLETE_LINES.length];
}
