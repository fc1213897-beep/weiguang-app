import { NextResponse } from "next/server";
import { addDaysStr, buildDailyInsight } from "@/lib/daily-insight";
import { listExpensesForMp } from "@/lib/mp-expenses-server";
import { listTasksForMp } from "@/lib/mp-tasks-server";
import { requireMpAuth } from "@/lib/mp-auth";

/** POST /api/mp/daily-insight — 混合建议（规则 + AI） */
export async function POST(request: Request) {
  const auth = await requireMpAuth(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = (await request.json()) as { entry_date?: string };
    const entry_date = body.entry_date?.trim();
    if (!entry_date) {
      return NextResponse.json({ error: "缺少 entry_date" }, { status: 400 });
    }

    const from7 = addDaysStr(entry_date, -6);
    const [tasks, expenses, last7Expenses] = await Promise.all([
      listTasksForMp(auth.user.id, entry_date),
      listExpensesForMp(auth.user.id, { entry_date }),
      listExpensesForMp(auth.user.id, { from: from7, to: entry_date }),
    ]);

    const expenseOnly = last7Expenses.filter((e) => e.entry_type === "expense");
    const spendSum = expenseOnly.reduce((s, e) => s + e.amount, 0);
    const dayCount = new Set(expenseOnly.map((e) => e.entry_date)).size || 1;
    const spendAvg7d = spendSum / dayCount;

    const result = await buildDailyInsight({
      tasks,
      expenses,
      spendAvg7d,
      entry_date,
    });

    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "获取建议失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
