import { buildCountdownNote } from "@/lib/countdown/note-utils";
import {
  enumerateDates,
  getDaysBetween,
  isDateInRange,
  pomodoroForItemCount,
} from "@/lib/countdown/schedule-utils";
import type { PlanDraft } from "@/types/task";
import type {
  GeneratedPlanDay,
  PlanStrategy,
  PlanStrategyContext,
  StrategyConfigField,
} from "@/types/countdown";

export type EvenChaptersParams = {
  chapterCount: number;
  chapterLabel: string;
  prefix: string;
};

const CONFIG_FIELDS: StrategyConfigField[] = [
  {
    key: "chapterCount",
    label: "章节总数",
    type: "number",
    defaultValue: 14,
    min: 1,
    max: 100,
  },
  {
    key: "chapterLabel",
    label: "章节单位",
    type: "text",
    defaultValue: "章",
  },
  {
    key: "prefix",
    label: "任务前缀",
    type: "text",
    defaultValue: "复习政治",
  },
];

function parseParams(params: Record<string, unknown>): EvenChaptersParams {
  return {
    chapterCount:
      typeof params.chapterCount === "number" ? params.chapterCount : 14,
    chapterLabel:
      typeof params.chapterLabel === "string" ? params.chapterLabel : "章",
    prefix: typeof params.prefix === "string" ? params.prefix : "复习政治",
  };
}

function generatePlans(
  ctx: PlanStrategyContext,
  p: EvenChaptersParams
): GeneratedPlanDay[] {
  const totalDays = getDaysBetween(ctx.target.startDate, ctx.target.targetDate);
  const allDates = enumerateDates(ctx.target.startDate, ctx.target.targetDate);
  if (allDates.length === 0 || p.chapterCount <= 0) return [];

  const chaptersPerDay = Math.max(1, Math.ceil(p.chapterCount / totalDays));
  let chapter = 1;
  const result: GeneratedPlanDay[] = [];

  for (let dayIdx = 0; dayIdx < allDates.length && chapter <= p.chapterCount; dayIdx++) {
    const date = allDates[dayIdx];
    const endChapter = Math.min(chapter + chaptersPerDay - 1, p.chapterCount);
    const count = endChapter - chapter + 1;
    if (isDateInRange(date, ctx.fromDate, ctx.toDate)) {
      const text =
        count === 1
          ? `${p.prefix}·第 ${chapter} ${p.chapterLabel}`
          : `${p.prefix}·第 ${chapter}–${endChapter} ${p.chapterLabel}`;

      const draft: PlanDraft = {
        text,
        category: "study",
        priority: "medium",
        pomodoroMinutes: pomodoroForItemCount(count * 10),
        date,
        note: buildCountdownNote(
          "even_chapters",
          ctx.target.id,
          ctx.blueprint.id,
          `ch${chapter}-${date}`
        ),
      };

      result.push({ date, drafts: [draft], meta: { dayIndex: dayIdx + 1 } });
    }
    chapter = endChapter + 1;
  }

  return result;
}

export const evenChaptersStrategy: PlanStrategy = {
  id: "even_chapters",
  label: "章节均分",
  description: "将章节/模块均匀分配到剩余备考天数",
  configFields: CONFIG_FIELDS,
  validateParams(params) {
    const p = parseParams(params);
    if (p.chapterCount < 1) return "章节数至少为 1";
    return null;
  },
  generate(ctx) {
    return generatePlans(ctx, parseParams(ctx.blueprint.params));
  },
  preview(ctx) {
    const p = parseParams(ctx.blueprint.params);
    const days = getDaysBetween(ctx.target.startDate, ctx.target.targetDate);
    return [
      `共 ${p.chapterCount} ${p.chapterLabel}，${days} 天内均匀分配`,
      `约每 ${Math.max(1, Math.ceil(days / p.chapterCount))} 天复习 1 ${p.chapterLabel}`,
    ];
  },
};
