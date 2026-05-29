"use client";

import ExpenseMonthlyTrend from "@/components/stats/ExpenseMonthlyTrend";
import ExpenseQuickAdd from "@/components/stats/ExpenseQuickAdd";
import ExpenseRecentList from "@/components/stats/ExpenseRecentList";
import ExpenseSummaryHero from "@/components/stats/ExpenseSummaryHero";
import { useAuth } from "@/hooks/useAuth";
import { useExpenseStats } from "@/hooks/useExpenseStats";
import Link from "next/link";

/** 桌面端：记账本 */
export default function DesktopLedgerView() {
  const { isAuthenticated } = useAuth();
  const expenseStats = useExpenseStats();

  if (!isAuthenticated) {
    return (
      <div className="min-w-0">
        <header className="border-b border-orange-50 pb-4">
          <h2 className="text-xl font-bold text-stone-800 lg:text-2xl">记账本</h2>
          <p className="mt-1 text-sm text-stone-500">登录后可记录并与手机同步</p>
        </header>
        <div className="mt-8 rounded-3xl border border-dashed border-orange-200 bg-orange-50/40 p-8 text-center">
          <p className="text-4xl" aria-hidden>
            💰
          </p>
          <p className="mt-3 text-sm text-stone-600">
            请先登录，即可在电脑上记一笔，并与小程序账本同步。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-5">
      <header className="border-b border-orange-50 pb-4">
        <h2 className="text-xl font-bold text-stone-800 lg:text-2xl">记账本</h2>
        <p className="mt-1 text-sm text-stone-500">
          记一笔、看流水，与手机小程序实时同步
        </p>
      </header>

      <ExpenseSummaryHero stats={expenseStats} showActions={false} />

      <div className="grid gap-5 xl:grid-cols-2">
        <ExpenseQuickAdd onCreated={expenseStats.refetch} />
        <ExpenseMonthlyTrend
          points={expenseStats.trend}
          loading={expenseStats.loading}
        />
      </div>

      <ExpenseRecentList
        expenses={expenseStats.recentExpenses}
        loading={expenseStats.loading}
        onChanged={expenseStats.refetch}
      />

      <p className="text-center text-xs text-stone-400">
        也可在
        <Link href="/chat" className="mx-1 text-orange-600 hover:underline">
          小光聊天
        </Link>
        里说「午饭 35」自动记账
      </p>
    </div>
  );
}
