"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  createDefaultExpenseDraft,
  EXPENSE_CATEGORIES,
  getCategoriesForType,
  INCOME_CATEGORIES,
} from "@/lib/expense-plan";
import { createExpense } from "@/lib/supabase/expenses";
import type { DbEntryType } from "@/types/database";
import { getTodayDateString } from "@/lib/task-utils";
import { notifyExpenseChanged } from "@/lib/expense-events";

type Props = {
  onCreated?: () => void;
  /** embedded：用于浮动弹层，去掉外层卡片装饰 */
  variant?: "card" | "embedded";
};

export default function ExpenseQuickAdd({
  onCreated,
  variant = "card",
}: Props) {
  const [draft, setDraft] = useState(() =>
    createDefaultExpenseDraft(getTodayDateString())
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories =
    draft.entry_type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  function pickEntryType(entryType: DbEntryType) {
    const list = getCategoriesForType(entryType);
    setDraft((d) => ({
      ...d,
      entry_type: entryType,
      category: list[0].id as string,
    }));
  }

  async function handleSubmit() {
    const amount = parseFloat(String(draft.amount).trim());
    if (!Number.isFinite(amount) || amount <= 0) {
      setError("请输入有效金额");
      return;
    }

    setSubmitting(true);
    setError(null);

    const { error: err } = await createExpense({
      amount,
      entry_type: draft.entry_type,
      category: draft.category,
      note: draft.note,
      entry_date: draft.entry_date,
      source: "manual",
    });

    setSubmitting(false);

    if (err) {
      setError(err);
      return;
    }

    setDraft(createDefaultExpenseDraft(getTodayDateString()));
    notifyExpenseChanged();
    onCreated?.();
  }

  const inner = (
    <>
      {variant === "card" && (
        <>
          <h3 className="text-sm font-semibold text-stone-800">记一笔</h3>
          <p className="mt-1 text-xs text-stone-500">与手机小程序数据同步</p>
        </>
      )}

      <div className={variant === "card" ? "mt-4 grid gap-4 sm:grid-cols-2" : "grid gap-4 sm:grid-cols-2"}>
        <div className="sm:col-span-2 flex gap-2">
          {(["expense", "income"] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => pickEntryType(type)}
              className={[
                "rounded-full px-4 py-2 text-xs font-medium transition",
                draft.entry_type === type
                  ? "bg-orange-500 text-white"
                  : "bg-white text-stone-600 ring-1 ring-orange-100",
              ].join(" ")}
            >
              {type === "expense" ? "支出" : "收入"}
            </button>
          ))}
        </div>

        <label className="block">
          <span className="text-xs font-medium text-stone-500">金额（元）</span>
          <input
            type="number"
            min="0"
            step="0.01"
            className="mt-1.5 w-full rounded-xl border border-orange-100 bg-white px-3.5 py-2.5 text-base outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
            placeholder="35"
            value={draft.amount}
            onChange={(e) =>
              setDraft((d) => ({ ...d, amount: e.target.value }))
            }
          />
        </label>

        <label className="block">
          <span className="text-xs font-medium text-stone-500">日期</span>
          <input
            type="date"
            className="mt-1.5 w-full rounded-xl border border-orange-100 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-orange-300"
            value={draft.entry_date}
            onChange={(e) =>
              setDraft((d) => ({ ...d, entry_date: e.target.value }))
            }
          />
        </label>

        <div className="sm:col-span-2">
          <span className="text-xs font-medium text-stone-500">分类</span>
          <div className="mt-2 flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() =>
                  setDraft((d) => ({ ...d, category: cat.id as string }))
                }
                className={[
                  "rounded-full px-3 py-1.5 text-xs font-medium transition",
                  draft.category === cat.id
                    ? "bg-orange-500 text-white"
                    : "bg-white text-stone-600 ring-1 ring-orange-100/80",
                ].join(" ")}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>
        </div>

        <label className="block sm:col-span-2">
          <span className="text-xs font-medium text-stone-500">备注（可选）</span>
          <input
            className="mt-1.5 w-full rounded-xl border border-orange-100 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-orange-300"
            placeholder="午饭、地铁…"
            value={draft.note}
            onChange={(e) => setDraft((d) => ({ ...d, note: e.target.value }))}
          />
        </label>
      </div>

      {error && <p className="mt-3 text-xs text-rose-600">{error}</p>}

      <Button
        className="mt-4 rounded-2xl py-2.5"
        disabled={submitting}
        onClick={() => void handleSubmit()}
      >
        {submitting ? "保存中…" : "记下这一笔 ✨"}
      </Button>
    </>
  );

  if (variant === "embedded") return <div>{inner}</div>;

  return (
    <div className="rounded-3xl border border-orange-100/80 bg-gradient-to-br from-orange-50/40 via-white to-amber-50/20 p-4 sm:p-5">
      {inner}
    </div>
  );
}
