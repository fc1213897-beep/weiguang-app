/** 生成倒计时相关 id */
export function generateCountdownId(prefix = "cd"): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function generatePlanId(): string {
  return generateCountdownId("plan");
}
