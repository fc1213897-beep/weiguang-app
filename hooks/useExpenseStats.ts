"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { listExpenses } from "@/lib/supabase/expenses";
import { getTodayDateString } from "@/lib/task-utils";
import type { ExpenseRow } from "@/types/database";

export type ExpenseDayPoint = {
  day: string;
  expense: number;
};

export type ExpenseMonthMetrics = {
  expenseTotal: number;
  incomeTotal: number;
  todayExpenseTotal: number;
  todayIncomeTotal: number;
  netBalance: number;
  count: number;
  trend: ExpenseDayPoint[];
  recentExpenses: ExpenseRow[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
};

import { EXPENSE_CHANGED_EVENT } from "@/lib/expense-events";

function getCurrentMonth(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function buildMonthTrend(expenses: ExpenseRow[]): ExpenseDayPoint[] {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const dailyMap = new Map<number, number>();

  for (const e of expenses) {
    if (e.entry_type !== "expense") continue;
    const parts = e.entry_date.split("-").map(Number);
    if (parts[0] !== year || parts[1] - 1 !== month) continue;
    const day = parts[2];
    dailyMap.set(day, (dailyMap.get(day) ?? 0) + e.amount);
  }

  return Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    return {
      day: `${month + 1}/${day}`,
      expense: dailyMap.get(day) ?? 0,
    };
  });
}

function summarize(expenses: ExpenseRow[], today?: string) {
  let expenseTotal = 0;
  let incomeTotal = 0;
  let todayExpenseTotal = 0;
  let todayIncomeTotal = 0;

  for (const e of expenses) {
    if (e.entry_type === "income") {
      incomeTotal += e.amount;
      if (today && e.entry_date === today) todayIncomeTotal += e.amount;
    } else {
      expenseTotal += e.amount;
      if (today && e.entry_date === today) todayExpenseTotal += e.amount;
    }
  }

  return {
    expenseTotal,
    incomeTotal,
    todayExpenseTotal,
    todayIncomeTotal,
    netBalance: incomeTotal - expenseTotal,
    count: expenses.length,
  };
}

const EMPTY: Omit<ExpenseMonthMetrics, "refetch"> = {
  expenseTotal: 0,
  incomeTotal: 0,
  todayExpenseTotal: 0,
  todayIncomeTotal: 0,
  netBalance: 0,
  count: 0,
  trend: [],
  recentExpenses: [],
  loading: true,
  error: null,
};

/** 已登录时拉取本月记账 */
export function useExpenseStats(): ExpenseMonthMetrics {
  const { isAuthenticated, isLoading } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const [metrics, setMetrics] = useState<Omit<ExpenseMonthMetrics, "refetch">>(
    EMPTY
  );

  const refetch = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  useEffect(() => {
    const onChanged = () => refetch();
    window.addEventListener(EXPENSE_CHANGED_EVENT, onChanged);
    return () => window.removeEventListener(EXPENSE_CHANGED_EVENT, onChanged);
  }, [refetch]);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      setMetrics({ ...EMPTY, loading: false });
      return;
    }

    let cancelled = false;
    const month = getCurrentMonth();
    const today = getTodayDateString();

    void (async () => {
      setMetrics((prev) => ({ ...prev, loading: true, error: null }));
      const { data, error } = await listExpenses({ month });
      if (cancelled) return;

      if (error) {
        setMetrics({ ...EMPTY, loading: false, error });
        return;
      }

      const rows = data ?? [];
      const summary = summarize(rows, today);
      setMetrics({
        ...summary,
        trend: buildMonthTrend(rows),
        recentExpenses: rows.slice(0, 20),
        loading: false,
        error: null,
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isLoading, refreshKey]);

  return { ...metrics, refetch };
}
