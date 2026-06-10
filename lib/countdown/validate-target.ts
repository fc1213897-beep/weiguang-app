import { getStrategy } from "@/lib/countdown/strategy-registry";
import { getDaysLeft } from "@/lib/countdown/schedule-utils";
import { getTodayDateString } from "@/lib/task-utils";
import type { CountdownTarget, ValidationResult } from "@/types/countdown";

const MAX_TASKS_PER_DAY = 6;

/** 校验倒计时目标与子计划配置 */
export function validateCountdownTarget(
  target: CountdownTarget,
  today = getTodayDateString()
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!target.title.trim()) {
    errors.push("请填写倒计时标题");
  }
  if (target.targetDate <= target.startDate) {
    errors.push("考试日期必须晚于计划起始日");
  }
  if (target.targetDate < today && target.status === "active") {
    warnings.push("考试日期已过，建议标记为已完成");
  }

  const enabledPlans = target.plans.filter((p) => p.enabled);
  if (enabledPlans.length === 0) {
    errors.push("请至少启用一个子计划");
  }

  const daysLeft = getDaysLeft(target.startDate, target.targetDate, today);
  if (daysLeft < 7) {
    warnings.push("剩余备考时间较紧，建议减少子计划或提高每日学习量");
  }
  if (daysLeft < enabledPlans.length) {
    warnings.push("剩余天数少于子计划数，部分计划可能无法充分展开");
  }

  if (enabledPlans.length > MAX_TASKS_PER_DAY) {
    warnings.push(
      `启用了 ${enabledPlans.length} 个子计划，每天可能产生较多任务，注意节奏`
    );
  }

  for (const plan of enabledPlans) {
    const strategy = getStrategy(plan.strategyId);
    if (!strategy) {
      errors.push(`未知策略：${plan.strategyId}（${plan.label}）`);
      continue;
    }
    const paramError = strategy.validateParams?.(plan.params);
    if (paramError) {
      errors.push(`${plan.label}：${paramError}`);
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
  };
}

export { MAX_TASKS_PER_DAY };
