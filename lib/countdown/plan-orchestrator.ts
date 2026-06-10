import { isCountdownAutoTask, parseCountdownNote } from "@/lib/countdown/note-utils";
import { getDaysLeft } from "@/lib/countdown/schedule-utils";
import { getStrategy } from "@/lib/countdown/strategy-registry";
import { validateCountdownTarget, MAX_TASKS_PER_DAY } from "@/lib/countdown/validate-target";
import { addDaysToDateString, getTodayDateString } from "@/lib/task-utils";
import type { PlanDraft } from "@/types/task";
import type {
  CountdownTarget,
  GeneratePlansResult,
  GeneratedPlanDay,
} from "@/types/countdown";

export type GenerateOptions = {
  fromDate?: string;
  toDate?: string;
  existingNotes?: Set<string>;
};

/** 编排多子计划生成 */
export async function generatePlansForTarget(
  target: CountdownTarget,
  options: GenerateOptions = {}
): Promise<{
  drafts: PlanDraft[];
  result: GeneratePlansResult;
  lastGeneratedUntil: string;
}> {
  const today = getTodayDateString();
  const fromDate = options.fromDate ?? today;
  const horizon = target.generateHorizonDays ?? 14;
  const toDate =
    options.toDate ??
    (() => {
      const horizonEnd = addDaysToDateString(fromDate, horizon - 1);
      return horizonEnd < target.targetDate ? horizonEnd : target.targetDate;
    })();

  const validation = validateCountdownTarget(target, today);
  const warnings = [...validation.warnings];

  if (!validation.ok) {
    return {
      drafts: [],
      result: { created: 0, skipped: 0, warnings: validation.errors },
      lastGeneratedUntil: target.lastGeneratedUntil ?? fromDate,
    };
  }

  const daysLeft = getDaysLeft(target.startDate, target.targetDate, today);
  const allDays: GeneratedPlanDay[] = [];
  const existingNotes = options.existingNotes ?? new Set<string>();

  for (const blueprint of target.plans) {
    if (!blueprint.enabled) continue;
    const strategy = getStrategy(blueprint.strategyId);
    if (!strategy) continue;

    let items = undefined;
    if (strategy.resolveItems) {
      items = await strategy.resolveItems(blueprint.params);
    }

    const generated = await strategy.generate({
      target,
      blueprint,
      fromDate,
      toDate,
      daysLeft,
      items: items ?? undefined,
    });
    allDays.push(...generated);
  }

  // 按日期合并并检查每日任务数
  const byDate = new Map<string, PlanDraft[]>();
  for (const day of allDays) {
    const list = byDate.get(day.date) ?? [];
    list.push(...day.drafts);
    byDate.set(day.date, list);
  }

  for (const [date, drafts] of byDate) {
    if (drafts.length > MAX_TASKS_PER_DAY) {
      warnings.push(
        `${date} 将有 ${drafts.length} 条备考任务，建议适当减少子计划`
      );
    }
  }

  const output: PlanDraft[] = [];
  let created = 0;
  let skipped = 0;

  const sortedDates = [...byDate.keys()].sort();
  for (const date of sortedDates) {
    for (const draft of byDate.get(date) ?? []) {
      const note = draft.note ?? "";
      if (existingNotes.has(note)) {
        skipped++;
        continue;
      }
      output.push(draft);
      existingNotes.add(note);
      created++;
    }
  }

  const lastGeneratedUntil =
    sortedDates.length > 0
      ? sortedDates[sortedDates.length - 1]
      : target.lastGeneratedUntil ?? fromDate;

  return {
    drafts: output,
    result: { created, skipped, warnings },
    lastGeneratedUntil,
  };
}

/** 收集已有 countdown 任务的 note */
export function collectExistingCountdownNotes(
  tasks: { note?: string }[]
): Set<string> {
  const set = new Set<string>();
  for (const t of tasks) {
    if (t.note && isCountdownAutoTask(t.note)) {
      set.add(t.note);
    }
  }
  return set;
}

/** 预览未来若干天的任务摘要 */
export async function previewPlansForTarget(
  target: CountdownTarget,
  days = 7
): Promise<{ date: string; texts: string[] }[]> {
  const today = getTodayDateString();
  const toDate = addDaysToDateString(today, days - 1);
  const end = toDate < target.targetDate ? toDate : target.targetDate;

  const { drafts } = await generatePlansForTarget(target, {
    fromDate: today,
    toDate: end,
    existingNotes: new Set(),
  });

  const byDate = new Map<string, string[]>();
  for (const d of drafts) {
    const list = byDate.get(d.date) ?? [];
    list.push(d.text);
    byDate.set(d.date, list);
  }

  return [...byDate.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, texts]) => ({ date, texts }));
}

export { parseCountdownNote };
