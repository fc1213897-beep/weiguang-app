"use client";

import { getCategoryMeta } from "@/lib/expense-plan";
import { deleteExpense } from "@/lib/supabase/expenses";
import { notifyExpenseChanged } from "@/lib/expense-events";
import type { ExpenseRow } from "@/types/database";

type Props = {
  expenses: ExpenseRow[];
  loading?: boolean;
  onChanged?: () => void;
};

export default function ExpenseRecentList({
  expenses,
  loading,
  onChanged,
}: Props) {
  async function handleDelete(id: string, label: string) {
    if (!window.confirm(`确定删除「${label}」吗？`)) return;

    const { error } = await deleteExpense(id);
    if (error) {
      window.alert(error);
      return;
    }
    onChanged?.();
    notifyExpenseChanged();
  }

  return (
    <div className="rounded-3xl bg-white/80 p-4">
      <h3 className="text-sm font-semibold text-stone-800">本月流水</h3>

      {loading ? (
        <p className="mt-4 text-xs text-stone-400">加载中…</p>
      ) : expenses.length === 0 ? (
        <p className="mt-4 text-xs text-stone-400">本月还没有记账记录</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {expenses.map((item) => {
            const meta = getCategoryMeta(item.category, item.entry_type);
            const sign = item.entry_type === "income" ? "+" : "-";
            const label = item.note?.trim() || meta.label;
            return (
              <li
                key={item.id}
                className="flex items-center justify-between gap-3 rounded-2xl bg-stone-50/80 px-3 py-2.5"
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="text-lg">{meta.icon}</span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-stone-800">
                      {label}
                    </p>
                    <p className="text-[11px] text-stone-400">
                      {item.entry_date} · {meta.label}
                      {item.source === "chat" ? " · 小光记入" : ""}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span
                    className={[
                      "text-sm font-semibold tabular-nums",
                      item.entry_type === "income"
                        ? "text-emerald-600"
                        : "text-rose-600",
                    ].join(" ")}
                  >
                    {sign}¥{item.amount.toFixed(2)}
                  </span>
                  <button
                    type="button"
                    onClick={() => void handleDelete(item.id, label)}
                    className="text-[11px] text-stone-400 hover:text-rose-500"
                  >
                    删除
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
