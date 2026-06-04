"use client";

import ExpenseMonthlyTrend from "@/components/stats/ExpenseMonthlyTrend";
import ExpenseQuickAdd from "@/components/stats/ExpenseQuickAdd";
import ExpenseRecentList from "@/components/stats/ExpenseRecentList";
import ExpenseSummaryHero from "@/components/stats/ExpenseSummaryHero";
import { useAuth } from "@/hooks/useAuth";
import { useExpenseStats } from "@/hooks/useExpenseStats";
import { panelClass } from "@/lib/tokens";
import { useUIStore } from "@/store/uiStore";

/** 手机端：记账 Tab */
export default function MobileLedgerView() {
  const mobileTab = useUIStore((s) => s.mobileTab);
  const setAuthSheetOpen = useUIStore((s) => s.setAuthSheetOpen);
  const { isAuthenticated } = useAuth();
  const expenseStats = useExpenseStats();

  if (mobileTab !== "ledger") return null;

  if (!isAuthenticated) {
    return (
      <div className={[panelClass, "min-w-0 text-center"].join(" ")}>
        <header className="border-b border-orange-100/70 pb-3 text-left">
          <p className="text-xs font-medium text-rose-500">LEDGER</p>
          <h2 className="mt-1 text-lg font-bold text-stone-800">记账本</h2>
        </header>
        <div className="py-10">
          <p className="text-4xl" aria-hidden>
            💰
          </p>
          <p className="mt-3 text-sm text-stone-600">登录后可记账，并与小程序同步</p>
          <button
            type="button"
            onClick={() => setAuthSheetOpen(true)}
            className="mt-4 rounded-full bg-orange-500 px-5 py-2.5 text-sm font-medium text-white"
          >
            登录后开始记账
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={[panelClass, "min-w-0 space-y-4"].join(" ")}>
      <header className="border-b border-orange-100/70 pb-3">
        <p className="text-xs font-medium text-rose-500">LEDGER</p>
        <h2 className="mt-1 text-lg font-bold text-stone-800">记账本</h2>
        <p className="mt-0.5 text-xs text-stone-500">记一笔、看流水，与小程序同步</p>
      </header>

      <ExpenseSummaryHero stats={expenseStats} showActions={false} />
      <ExpenseQuickAdd onCreated={expenseStats.refetch} />
      <ExpenseMonthlyTrend
        points={expenseStats.trend}
        loading={expenseStats.loading}
      />
      <ExpenseRecentList
        expenses={expenseStats.recentExpenses}
        loading={expenseStats.loading}
        onChanged={expenseStats.refetch}
      />
    </div>
  );
}
