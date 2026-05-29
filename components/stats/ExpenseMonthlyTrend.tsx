"use client";

import type { ExpenseDayPoint } from "@/hooks/useExpenseStats";

export default function ExpenseMonthlyTrend({
  points,
  loading,
}: {
  points: ExpenseDayPoint[];
  loading?: boolean;
}) {
  const visible = points.filter((p) => p.expense > 0);
  const display = visible.length > 0 ? visible : points.slice(-7);
  const max = Math.max(1, ...display.map((p) => p.expense));

  return (
    <div className="rounded-3xl bg-white/80 p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-stone-800">本月支出趋势</h3>
        {!loading && points.some((p) => p.expense > 0) && (
          <span className="text-xs font-medium text-rose-600">
            合计 ¥
            {points
              .reduce((s, p) => s + p.expense, 0)
              .toFixed(2)}
          </span>
        )}
      </div>
      {loading ? (
        <p className="mt-4 text-xs text-stone-400">加载记账数据…</p>
      ) : display.length === 0 ? (
        <p className="mt-4 text-xs text-stone-400">
          暂无支出记录，可在手机小程序「记账」Tab 或跟小光说「午饭 35」
        </p>
      ) : (
        <div className="mt-4 flex items-end gap-1 overflow-x-auto pb-1">
          {display.map((p) => (
            <div
              key={p.day}
              className="flex min-w-[28px] flex-1 flex-col items-center gap-1"
            >
              <div className="flex h-28 w-full flex-col justify-end rounded-xl bg-stone-50 p-1">
                <div
                  className="w-full rounded-lg bg-rose-300"
                  style={{
                    height: `${Math.max(8, (p.expense / max) * 100)}%`,
                  }}
                  title={`¥${p.expense.toFixed(2)}`}
                />
              </div>
              <p className="text-[10px] text-stone-500">{p.day}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
