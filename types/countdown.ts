import type { PlanDraft, TaskPriority } from "@/types/task";

/** 倒计时状态 */
export type CountdownStatus = "draft" | "active" | "paused" | "completed";

/** 子计划优先级（滞后压缩时 low 先减） */
export type PlanPriority = "high" | "medium" | "low";

/** 词频层级 */
export type ItemTier = "high" | "mid" | "low";

/** 挂载在倒计时下的单个子计划 */
export type PlanBlueprint = {
  id: string;
  label: string;
  strategyId: string;
  enabled: boolean;
  params: Record<string, unknown>;
  priority: PlanPriority;
};

/** 一个考试 / Deadline 倒计时 */
export type CountdownTarget = {
  id: string;
  title: string;
  targetDate: string;
  startDate: string;
  status: CountdownStatus;
  recipeId?: string;
  plans: PlanBlueprint[];
  lastGeneratedUntil?: string;
  /** 单次滚动生成未来天数，默认 14 */
  generateHorizonDays: number;
  createdAt: string;
  updatedAt: string;
};

export type CountdownSettings = {
  targets: CountdownTarget[];
};

/** Recipe 模板 */
export type CountdownRecipe = {
  id: string;
  label: string;
  description: string;
  icon?: string;
  defaultPlans: Omit<PlanBlueprint, "id">[];
  hidden?: boolean;
};

/** 带 rank/tier 的可分配条目 */
export type RankedItem = {
  id: string;
  rank: number;
  tier: ItemTier;
  label: string;
};

/** 策略配置表单字段 */
export type StrategyConfigField = {
  key: string;
  label: string;
  type: "number" | "text" | "select";
  defaultValue?: string | number;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
};

/** 策略生成上下文 */
export type PlanStrategyContext = {
  target: CountdownTarget;
  blueprint: PlanBlueprint;
  fromDate: string;
  toDate: string;
  daysLeft: number;
  items?: RankedItem[];
};

/** 单日生成结果 */
export type GeneratedPlanDay = {
  date: string;
  drafts: PlanDraft[];
  meta?: { round?: number; dayIndex?: number };
};

/** 策略插件接口 */
export type PlanStrategy = {
  id: string;
  label: string;
  description: string;
  configFields: StrategyConfigField[];
  validateParams?: (params: Record<string, unknown>) => string | null;
  resolveItems?: (
    params: Record<string, unknown>
  ) => Promise<RankedItem[] | null>;
  generate: (
    ctx: PlanStrategyContext
  ) => GeneratedPlanDay[] | Promise<GeneratedPlanDay[]>;
  preview: (
    ctx: Omit<PlanStrategyContext, "fromDate" | "toDate">
  ) => string[];
};

/** 校验结果 */
export type ValidationResult = {
  ok: boolean;
  errors: string[];
  warnings: string[];
};

/** 编排生成结果 */
export type GeneratePlansResult = {
  created: number;
  skipped: number;
  warnings: string[];
};

/** 子计划进度摘要 */
export type PlanProgressSummary = {
  planId: string;
  label: string;
  total: number;
  completed: number;
  summary: string;
};

export type TaskPriorityHint = TaskPriority;
