const NOTE_PREFIX = "countdown:v1:";

/** 构建自动生成任务的 note 幂等键 */
export function buildCountdownNote(
  strategyId: string,
  targetId: string,
  planId: string,
  slotKey: string
): string {
  return `${NOTE_PREFIX}${strategyId}:${targetId}:${planId}:${slotKey}`;
}

/** 是否为倒计时自动生成的任务 */
export function isCountdownAutoTask(note: string): boolean {
  return note.startsWith(NOTE_PREFIX);
}

/** 解析 note 中的 targetId / planId */
export function parseCountdownNote(note: string): {
  strategyId: string;
  targetId: string;
  planId: string;
  slotKey: string;
} | null {
  if (!note.startsWith(NOTE_PREFIX)) return null;
  const rest = note.slice(NOTE_PREFIX.length);
  const parts = rest.split(":");
  if (parts.length < 4) return null;
  const [strategyId, targetId, planId, ...slotParts] = parts;
  return {
    strategyId,
    targetId,
    planId,
    slotKey: slotParts.join(":"),
  };
}

export function noteBelongsToTarget(note: string, targetId: string): boolean {
  const parsed = parseCountdownNote(note);
  return parsed?.targetId === targetId;
}

export function noteBelongsToPlan(
  note: string,
  targetId: string,
  planId: string
): boolean {
  const parsed = parseCountdownNote(note);
  return parsed?.targetId === targetId && parsed?.planId === planId;
}
