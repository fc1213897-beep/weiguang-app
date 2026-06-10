import { addDaysToDateString, parseDateString } from "@/lib/task-utils";

/** 默认三轮天数占比 */
export const DEFAULT_ROUND_RATIOS = [0.45, 0.35, 0.2] as const;

/** 计算两日期间相差天数 */
export function getDaysBetween(startDate: string, endDate: string): number {
  const start = parseDateString(startDate);
  const end = parseDateString(endDate);
  if (!start || !end) return 0;
  const ms = end.getTime() - start.getTime();
  return Math.max(0, Math.round(ms / (24 * 60 * 60 * 1000)));
}

/** 从今天（或 startDate）到目标日的剩余天数 */
export function getDaysLeft(
  startDate: string,
  targetDate: string,
  today?: string
): number {
  const from = today && today > startDate ? today : startDate;
  return getDaysBetween(from, targetDate);
}

/** 按占比切分轮次天数，至少每轮 1 天（若总天数足够） */
export function splitDaysIntoRounds(
  totalDays: number,
  roundCount: number,
  ratios: number[] = [...DEFAULT_ROUND_RATIOS]
): number[] {
  if (totalDays <= 0 || roundCount <= 0) {
    return Array(roundCount).fill(0) as number[];
  }

  const normalized =
    ratios.length === roundCount
      ? ratios
      : Array(roundCount).fill(1 / roundCount);

  const sum = normalized.reduce((a, b) => a + b, 0);
  const weights = normalized.map((r) => r / sum);

  const raw = weights.map((w) => Math.floor(totalDays * w));
  let assigned = raw.reduce((a, b) => a + b, 0);
  let i = 0;
  while (assigned < totalDays) {
    raw[i % roundCount]++;
    assigned++;
    i++;
  }

  if (totalDays >= roundCount) {
    for (let r = 0; r < roundCount; r++) {
      if (raw[r] === 0) {
        const donor = raw.findIndex((d) => d > 1);
        if (donor >= 0) {
          raw[donor]--;
          raw[r] = 1;
        }
      }
    }
  }

  return raw;
}

/** 轮次边界 */
export type RoundBoundary = {
  round: number;
  startDate: string;
  endDate: string;
  days: number;
};

export function buildRoundBoundaries(
  startDate: string,
  totalDays: number,
  roundCount: number,
  ratios?: number[]
): RoundBoundary[] {
  const daysPerRound = splitDaysIntoRounds(totalDays, roundCount, ratios);
  const result: RoundBoundary[] = [];
  let cursor = startDate;

  for (let i = 0; i < roundCount; i++) {
    const days = daysPerRound[i] ?? 0;
    if (days <= 0) continue;
    const endDate = addDaysToDateString(cursor, days - 1);
    result.push({
      round: i + 1,
      startDate: cursor,
      endDate,
      days,
    });
    cursor = addDaysToDateString(endDate, 1);
  }

  return result;
}

/** 判断日期落在第几轮 */
export function getRoundForDate(
  date: string,
  boundaries: RoundBoundary[]
): number {
  for (const b of boundaries) {
    if (date >= b.startDate && date <= b.endDate) return b.round;
  }
  if (boundaries.length === 0) return 1;
  if (date < boundaries[0].startDate) return 1;
  return boundaries[boundaries.length - 1].round;
}

/** 日期是否在范围内（含首尾） */
export function isDateInRange(
  date: string,
  from: string,
  to: string
): boolean {
  return date >= from && date <= to;
}

/** 枚举日期范围 */
export function enumerateDates(from: string, to: string): string[] {
  if (from > to) return [];
  const dates: string[] = [];
  let cursor = from;
  while (cursor <= to) {
    dates.push(cursor);
    cursor = addDaysToDateString(cursor, 1);
  }
  return dates;
}

/** 根据条目数与天数反算每日容量 */
export function computeDailyCapacity(
  totalItems: number,
  days: number,
  userCap?: number
): number {
  if (days <= 0 || totalItems <= 0) return userCap ?? 30;
  const auto = Math.ceil(totalItems / days);
  const cap = userCap ?? auto;
  return Math.min(Math.max(auto, 1), Math.min(cap, 150));
}

/** 条目量映射番茄钟分钟 */
export function pomodoroForItemCount(count: number): number {
  if (count <= 0) return 0;
  if (count <= 40) return 15;
  if (count <= 80) return 25;
  return 45;
}

/** 将条目列表按天切分 */
export function chunkItemsAcrossDays<T>(
  items: T[],
  days: number,
  dailyCap: number
): T[][] {
  if (days <= 0) return [];
  const chunks: T[][] = Array.from({ length: days }, () => []);
  if (items.length === 0) return chunks;

  let dayIndex = 0;
  for (const item of items) {
    chunks[dayIndex].push(item);
    if (chunks[dayIndex].length >= dailyCap && dayIndex < days - 1) {
      dayIndex++;
    }
  }
  return chunks;
}
