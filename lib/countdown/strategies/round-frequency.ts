import { buildCountdownNote } from "@/lib/countdown/note-utils";
import {
  buildRoundBoundaries,
  chunkItemsAcrossDays,
  computeDailyCapacity,
  enumerateDates,
  getDaysBetween,
  getRoundForDate,
  isDateInRange,
  pomodoroForItemCount,
} from "@/lib/countdown/schedule-utils";
import type { PlanDraft } from "@/types/task";
import type {
  GeneratedPlanDay,
  ItemTier,
  PlanStrategy,
  PlanStrategyContext,
  RankedItem,
  StrategyConfigField,
} from "@/types/countdown";

export type RoundFrequencyParams = {
  totalItems?: number;
  dataSourceId?: string;
  rounds?: number;
  roundRatios?: number[];
  dailyCapacity?: number;
  itemLabel?: string;
  taskPrefix?: string;
  tierWeights?: Partial<Record<ItemTier, number>>;
};

const DEFAULT_TIER_WEIGHTS: Record<ItemTier, number> = {
  high: 2,
  mid: 1,
  low: 0.5,
};

export const ROUND_FREQUENCY_CONFIG_FIELDS: StrategyConfigField[] = [
  {
    key: "dataSourceId",
    label: "数据源",
    type: "select",
    defaultValue: "kaoyan_top3000",
    options: [{ value: "kaoyan_top3000", label: "考研高频词汇" }],
  },
  {
    key: "rounds",
    label: "复习轮数",
    type: "number",
    defaultValue: 3,
    min: 1,
    max: 5,
  },
  {
    key: "dailyCapacity",
    label: "每日上限（可选）",
    type: "number",
    defaultValue: 0,
    min: 0,
    max: 150,
  },
  {
    key: "itemLabel",
    label: "条目单位",
    type: "text",
    defaultValue: "词",
  },
  {
    key: "taskPrefix",
    label: "任务前缀",
    type: "text",
    defaultValue: "背单词",
  },
];

export function parseRoundFrequencyParams(
  params: Record<string, unknown>
): RoundFrequencyParams {
  return {
    totalItems:
      typeof params.totalItems === "number" ? params.totalItems : undefined,
    dataSourceId:
      typeof params.dataSourceId === "string"
        ? params.dataSourceId
        : undefined,
    rounds: typeof params.rounds === "number" ? params.rounds : 3,
    roundRatios: Array.isArray(params.roundRatios)
      ? params.roundRatios.filter((r) => typeof r === "number")
      : undefined,
    dailyCapacity:
      typeof params.dailyCapacity === "number" && params.dailyCapacity > 0
        ? params.dailyCapacity
        : undefined,
    itemLabel:
      typeof params.itemLabel === "string" ? params.itemLabel : "词",
    taskPrefix:
      typeof params.taskPrefix === "string" ? params.taskPrefix : "背单词",
    tierWeights:
      params.tierWeights && typeof params.tierWeights === "object"
        ? (params.tierWeights as Partial<Record<ItemTier, number>>)
        : undefined,
  };
}

/** 最后一轮按 tier 加权展开条目 */
function expandWeightedItems(
  items: RankedItem[],
  weights: Record<ItemTier, number>
): RankedItem[] {
  const expanded: RankedItem[] = [];
  for (const item of items) {
    const w = weights[item.tier] ?? 1;
    const times = w >= 1 ? Math.round(w) : w > 0 ? 1 : 0;
    for (let i = 0; i < times; i++) {
      expanded.push(item);
    }
  }
  return expanded.sort((a, b) => a.rank - b.rank);
}

function buildDraft(
  ctx: PlanStrategyContext,
  strategyId: string,
  date: string,
  round: number,
  dayIndex: number,
  text: string,
  count: number
): PlanDraft {
  return {
    text,
    category: "study",
    priority: round >= 3 ? "high" : "medium",
    pomodoroMinutes: pomodoroForItemCount(count),
    date,
    note: buildCountdownNote(
      strategyId,
      ctx.target.id,
      ctx.blueprint.id,
      `r${round}-d${dayIndex}-${date}`
    ),
  };
}

/** 通用轮次 + 频率分配生成 */
export function generateRoundFrequencyPlans(
  ctx: PlanStrategyContext,
  strategyId: string,
  params: RoundFrequencyParams
): GeneratedPlanDay[] {
  const items = ctx.items ?? [];
  if (items.length === 0) return [];

  const rounds = params.rounds ?? 3;
  const itemLabel = params.itemLabel ?? "词";
  const taskPrefix = params.taskPrefix ?? "背单词";
  const tierWeights = {
    ...DEFAULT_TIER_WEIGHTS,
    ...params.tierWeights,
  };

  const planStart = ctx.target.startDate;
  const planEnd = ctx.target.targetDate;
  const totalDays = getDaysBetween(planStart, planEnd);
  const boundaries = buildRoundBoundaries(
    planStart,
    totalDays,
    rounds,
    params.roundRatios
  );

  const result: GeneratedPlanDay[] = [];
  const sorted = [...items].sort((a, b) => a.rank - b.rank);

  for (const boundary of boundaries) {
    const roundDates = enumerateDates(boundary.startDate, boundary.endDate);
    const daysInRound = roundDates.length;
    if (daysInRound <= 0) continue;

    const dailyCap = computeDailyCapacity(
      sorted.length,
      daysInRound,
      params.dailyCapacity
    );

    const roundItems =
      boundary.round === rounds
        ? expandWeightedItems(sorted, tierWeights)
        : sorted;

    const chunks = chunkItemsAcrossDays(roundItems, daysInRound, dailyCap);

    roundDates.forEach((date, idx) => {
      if (!isDateInRange(date, ctx.fromDate, ctx.toDate)) return;
      const chunk = chunks[idx] ?? [];
      if (chunk.length === 0) return;

      const startRank = chunk[0].rank;
      const endRank = chunk[chunk.length - 1].rank;
      const text = `${taskPrefix}·第${boundary.round}轮 Day${idx + 1}：第${startRank}–${endRank}号${itemLabel}（${chunk.length}个）`;

      result.push({
        date,
        meta: { round: boundary.round, dayIndex: idx + 1 },
        drafts: [
          buildDraft(
            ctx,
            strategyId,
            date,
            boundary.round,
            idx + 1,
            text,
            chunk.length
          ),
        ],
      });
    });
  }

  return result;
}

export function previewRoundFrequency(
  ctx: Omit<PlanStrategyContext, "fromDate" | "toDate">,
  params: RoundFrequencyParams
): string[] {
  const items = ctx.items ?? [];
  const rounds = params.rounds ?? 3;
  const totalDays = getDaysBetween(ctx.target.startDate, ctx.target.targetDate);
  const boundaries = buildRoundBoundaries(
    ctx.target.startDate,
    totalDays,
    rounds,
    params.roundRatios
  );
  const lines: string[] = [];
  lines.push(`共 ${items.length} 个条目，分 ${rounds} 轮复习`);
  for (const b of boundaries) {
    const cap = computeDailyCapacity(
      items.length,
      b.days,
      params.dailyCapacity
    );
    lines.push(
      `第 ${b.round} 轮：${b.startDate} ~ ${b.endDate}（${b.days} 天，约 ${cap} ${params.itemLabel ?? "词"}/天）`
    );
  }
  return lines;
}

export function getRoundSummaryForDate(
  targetStart: string,
  targetDate: string,
  date: string,
  rounds: number
): string {
  const totalDays = getDaysBetween(targetStart, targetDate);
  const boundaries = buildRoundBoundaries(targetStart, totalDays, rounds);
  const round = getRoundForDate(date, boundaries);
  return `第 ${round} 轮`;
}

export const roundFrequencyStrategy: PlanStrategy = {
  id: "round_frequency",
  label: "多轮复习（频率优化）",
  description: "适合词汇、知识点等需多轮覆盖的内容，最后一轮高频加权",
  configFields: ROUND_FREQUENCY_CONFIG_FIELDS,
  generate(ctx) {
    const params = parseRoundFrequencyParams(ctx.blueprint.params);
    return generateRoundFrequencyPlans(ctx, "round_frequency", params);
  },
  preview(ctx) {
    return previewRoundFrequency(ctx, parseRoundFrequencyParams(ctx.blueprint.params));
  },
};
