import { dailyQuotaStrategy } from "@/lib/countdown/strategies/daily-quota";
import { evenChaptersStrategy } from "@/lib/countdown/strategies/even-chapters";
import { kaoyanVocabStrategy } from "@/lib/countdown/strategies/kaoyan-vocab";
import { roundFrequencyStrategy } from "@/lib/countdown/strategies/round-frequency";
import type { PlanStrategy } from "@/types/countdown";

const strategies = new Map<string, PlanStrategy>([
  [roundFrequencyStrategy.id, roundFrequencyStrategy],
  [kaoyanVocabStrategy.id, kaoyanVocabStrategy],
  [evenChaptersStrategy.id, evenChaptersStrategy],
  [dailyQuotaStrategy.id, dailyQuotaStrategy],
]);

export function getStrategy(id: string): PlanStrategy | undefined {
  return strategies.get(id);
}

export function listStrategies(): PlanStrategy[] {
  return Array.from(strategies.values());
}

export function registerStrategy(strategy: PlanStrategy): void {
  strategies.set(strategy.id, strategy);
}
