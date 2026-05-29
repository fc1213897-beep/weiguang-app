"use client";

import Link from "next/link";
import { formatAmount } from "@/lib/expense-plan";
import { openExpenseModal } from "@/lib/expense-events";
import type { ExpenseMonthMetrics } from "@/hooks/useExpenseStats";

type Props = {
  stats: Pick<
    ExpenseMonthMetrics,
    | "expenseTotal"
    | "incomeTotal"
    | "todayExpenseTotal"
    | "todayIncomeTotal"
    | "netBalance"
    | "count"
    | "loading"
  >;
  showActions?: boolean;
  onQuickAdd?: () => void;
};

export default function ExpenseSummaryHero({
  stats,
  showActions = true,
  onQuickAdd,
}: Props) {
  const balancePositive = stats.netBalance >= 0;

  return (
    <section className="relative overflow-hidden rounded-3xl border border-orange-200/50 bg-gradient-to-br from-rose-50/90 via-white to-emerald-50/80 p-5 shadow-[0_16px_48px_-24px_rgba(234,88,12,0.35)] sm:p-6">
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-rose-200/25 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-8 left-8 h-32 w-32 rounded-full bg-emerald-200/20 blur-3xl"
        aria-hidden
      />

      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium tracking-[0.16em] text-orange-600/90">
            记账概览
          </p>
          <h2 className="mt-1 text-lg font-bold text-stone-800 sm:text-xl">
            本月收支一览
          </h2>
          <p className="mt-1 text-xs text-stone-500">
            {stats.loading
              ? "同步中…"
              : `共 ${stats.count} 笔 · 与手机小程序实时同步`}
          </p>
        </div>
        {showActions && (
          <div className="flex flex-wrap gap-2">
            {onQuickAdd ? (
              <button
                type="button"
                onClick={onQuickAdd}
                className="rounded-full bg-orange-500 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-orange-600"
              >
                ＋ 记一笔
              </button>
            ) : (
              <button
                type="button"
                onClick={() => openExpenseModal()}
                className="rounded-full bg-orange-500 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-orange-600"
              >
                ＋ 记一笔
              </button>
            )}
            <Link
              href="/ledger"
              className="rounded-full border border-orange-200/80 bg-white/80 px-4 py-2 text-xs font-medium text-orange-700 transition hover:bg-orange-50"
            >
              记账本 →
            </Link>
          </div>
        )}
      </div>

      <div className="relative mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-rose-100/80 bg-white/85 p-4 backdrop-blur-sm">
          <p className="text-xs font-medium text-rose-500/90">本月支出</p>
          <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight text-rose-600 sm:text-4xl">
            {stats.loading ? "—" : `¥${formatAmount(stats.expenseTotal)}`}
          </p>
          <p className="mt-2 text-[11px] text-stone-400">
            今日 ¥{stats.loading ? "—" : formatAmount(stats.todayExpenseTotal)}
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-100/80 bg-white/85 p-4 backdrop-blur-sm">
          <p className="text-xs font-medium text-emerald-600/90">本月收入</p>
          <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight text-emerald-600 sm:text-4xl">
            {stats.loading ? "—" : `¥${formatAmount(stats.incomeTotal)}`}
          </p>
          <p className="mt-2 text-[11px] text-stone-400">
            今日 ¥{stats.loading ? "—" : formatAmount(stats.todayIncomeTotal)}
          </p>
        </div>

        <div className="rounded-2xl border border-amber-100/80 bg-white/85 p-4 backdrop-blur-sm">
          <p className="text-xs font-medium text-amber-700/90">本月结余</p>
          <p
            className={[
              "mt-2 text-3xl font-bold tabular-nums tracking-tight sm:text-4xl",
              balancePositive ? "text-emerald-700" : "text-rose-600",
            ].join(" ")}
          >
            {stats.loading
              ? "—"
              : `${stats.netBalance >= 0 ? "+" : ""}¥${formatAmount(Math.abs(stats.netBalance))}`}
          </p>
          <p className="mt-2 text-[11px] text-stone-400">
            {balancePositive ? "收入覆盖支出" : "支出高于收入"}
          </p>
        </div>
      </div>
    </section>
  );
}
