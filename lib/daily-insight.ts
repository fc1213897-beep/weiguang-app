import { fetchXiaoguangReply } from "@/lib/chat-ai";
import { formatAmount } from "@/lib/expense-plan";
import type { ExpenseRow, TaskRow } from "@/types/database";

export type InsightContext = {
  tasks: TaskRow[];
  expenses: ExpenseRow[];
  spendAvg7d: number;
  entry_date: string;
};

export type InsightResult = {
  insight: string;
  source: "rule" | "ai";
  doneRate: number;
  spendTotal: number;
  incomeTotal: number;
};

function calcDoneRate(tasks: TaskRow[]): number {
  if (tasks.length === 0) return 0;
  const done = tasks.filter((t) => t.completed).length;
  return Math.round((done / tasks.length) * 100);
}

function calcSpend(expenses: ExpenseRow[]) {
  let expenseTotal = 0;
  let incomeTotal = 0;
  for (const e of expenses) {
    if (e.entry_type === "income") incomeTotal += e.amount;
    else expenseTotal += e.amount;
  }
  return { expenseTotal, incomeTotal };
}

/** 判断是否需调 AI（复杂多因素场景） */
export function shouldUseAi(ctx: InsightContext): boolean {
  const { tasks, expenses, spendAvg7d } = ctx;
  const doneRate = calcDoneRate(tasks);
  const { expenseTotal, incomeTotal } = calcSpend(expenses);

  // 简单场景走规则
  if (tasks.length === 0 && expenses.length === 0) return false;
  if (tasks.length > 0 && expenses.length === 0) return false;
  if (tasks.length === 0 && expenses.length > 0) return false;
  if (doneRate === 100) return false;
  if (doneRate === 0 && expenseTotal === 0) return false;

  // 完成率中等 + 支出明显偏离均值
  if (doneRate >= 30 && doneRate <= 80 && spendAvg7d > 0) {
    if (expenseTotal > spendAvg7d * 1.3 || expenseTotal < spendAvg7d * 0.5) {
      return true;
    }
  }

  const pendingLife = tasks.filter(
    (t) => !t.completed && t.task_type === "life"
  );
  const foodSpend = expenses
    .filter((e) => e.entry_type === "expense" && e.category === "food")
    .reduce((s, e) => s + e.amount, 0);
  if (pendingLife.length > 0 && foodSpend > 80) return true;

  const studyTasks = tasks.filter((t) => t.task_type === "study");
  const studyDone =
    studyTasks.length > 0 && studyTasks.every((t) => t.completed);
  const studySpend = expenses
    .filter((e) => e.category === "study")
    .reduce((s, e) => s + e.amount, 0);
  if (studyDone && studySpend === 0 && expenseTotal > 0) return true;

  if (incomeTotal > 500 && expenseTotal > spendAvg7d * 1.5 && spendAvg7d > 0) {
    return true;
  }

  return false;
}

/** 规则引擎文案 */
export function getRuleInsight(ctx: InsightContext): string {
  const { tasks, expenses } = ctx;
  const doneRate = calcDoneRate(tasks);
  const { expenseTotal } = calcSpend(expenses);

  if (tasks.length === 0 && expenses.length === 0) {
    return "今天还是空白的一天，种一个小目标或记一笔都行。";
  }
  if (tasks.length > 0 && expenses.length === 0) {
    return "任务在路上啦，去记账页花 3 秒记一笔会更清晰。";
  }
  if (tasks.length === 0 && expenses.length > 0) {
    return "花销记好了，要不要种一个 15 分钟的小目标？";
  }
  if (doneRate === 100) {
    return "今天的待办都亮起来啦，辛苦啦。";
  }
  if (doneRate === 0 && expenseTotal === 0) {
    return "慢慢来，从一个最小目标开始就好。";
  }

  return `今天完成度 ${doneRate}%，支出 ${formatAmount(expenseTotal)} 元，一步一步来就好。`;
}

/** 日期加减（YYYY-MM-DD） */
export function addDaysStr(dateStr: string, delta: number): string {
  const parts = dateStr.split("-").map(Number);
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  d.setDate(d.getDate() + delta);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** 混合建议：规则优先，复杂场景调 AI */
export async function buildDailyInsight(
  ctx: InsightContext
): Promise<InsightResult> {
  const doneRate = calcDoneRate(ctx.tasks);
  const { expenseTotal, incomeTotal } = calcSpend(ctx.expenses);

  if (!shouldUseAi(ctx)) {
    return {
      insight: getRuleInsight(ctx),
      source: "rule",
      doneRate,
      spendTotal: expenseTotal,
      incomeTotal,
    };
  }

  try {
    const pendingLife = ctx.tasks.filter(
      (t) => !t.completed && t.task_type === "life"
    ).length;
    const topCategories = [
      ...new Set(
        ctx.expenses
          .filter((e) => e.entry_type === "expense")
          .map((e) => e.category)
      ),
    ]
      .slice(0, 3)
      .join("、");

    const prompt = `请根据以下今日数据，用温柔低压力的语气给一条建议（60字以内，不要批评消费、不说教）：
完成率 ${doneRate}%
今日支出 ${formatAmount(expenseTotal)} 元
近7日日均支出 ${formatAmount(ctx.spendAvg7d)} 元
未完成生活类待办 ${pendingLife} 个
主要消费分类 ${topCategories || "无"}
今日收入 ${formatAmount(incomeTotal)} 元`;

    const insight = await fetchXiaoguangReply(prompt, []);
    return {
      insight,
      source: "ai",
      doneRate,
      spendTotal: expenseTotal,
      incomeTotal,
    };
  } catch {
    return {
      insight: getRuleInsight(ctx),
      source: "rule",
      doneRate,
      spendTotal: expenseTotal,
      incomeTotal,
    };
  }
}
