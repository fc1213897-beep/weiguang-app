import { buildCountdownNote } from "@/lib/countdown/note-utils";
import {
  enumerateDates,
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

export type DailyQuotaParams = {
  dailyCount: number;
  unit: string;
  prefix: string;
};

const CONFIG_FIELDS: StrategyConfigField[] = [
  {
    key: "dailyCount",
    label: "每日数量",
    type: "number",
    defaultValue: 3,
    min: 1,
    max: 50,
  },
  {
    key: "unit",
    label: "单位",
    type: "text",
    defaultValue: "道",
  },
  {
    key: "prefix",
    label: "任务前缀",
    type: "text",
    defaultValue: "刷数学真题",
  },
];

function parseParams(params: Record<string, unknown>): DailyQuotaParams {
  return {
    dailyCount:
      typeof params.dailyCount === "number" ? params.dailyCount : 3,
    unit: typeof params.unit === "string" ? params.unit : "道",
    prefix: typeof params.prefix === "string" ? params.prefix : "刷数学真题",
  };
}

function generatePlans(
  ctx: PlanStrategyContext,
  p: DailyQuotaParams
): GeneratedPlanDay[] {
  const dates = enumerateDates(ctx.fromDate, ctx.toDate);
  const result: GeneratedPlanDay[] = [];

  for (const date of dates) {
    if (!isDateInRange(date, ctx.fromDate, ctx.toDate)) continue;

    const text = `${p.prefix}·${p.dailyCount} ${p.unit}`;
    const draft: PlanDraft = {
      text,
      category: "study",
      priority: "medium",
      pomodoroMinutes: pomodoroForItemCount(p.dailyCount * 5),
      date,
      note: buildCountdownNote(
        "daily_quota",
        ctx.target.id,
        ctx.blueprint.id,
        date
      ),
    };
    result.push({ date, drafts: [draft] });
  }

  return result;
}

export const dailyQuotaStrategy: PlanStrategy = {
  id: "daily_quota",
  label: "每日定量",
  description: "每天在固定日期生成相同数量的练习任务",
  configFields: CONFIG_FIELDS,
  validateParams(params) {
    const p = parseParams(params);
    if (p.dailyCount < 1) return "每日数量至少为 1";
    return null;
  },
  generate(ctx) {
    return generatePlans(ctx, parseParams(ctx.blueprint.params));
  },
  preview(ctx) {
    const p = parseParams(ctx.blueprint.params);
    return [`每天 ${p.dailyCount} ${p.unit}：${p.prefix}`];
  },
};
