import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { isValidCategory } from "@/lib/expense-plan";
import type {
  CreateExpenseInput,
  ExpenseRow,
  ExpenseSummary,
  UpdateExpenseInput,
} from "@/types/database";

function mapRow(row: Record<string, unknown>): ExpenseRow {
  const amount = row.amount;
  return {
    ...(row as unknown as ExpenseRow),
    amount: typeof amount === "string" ? parseFloat(amount) : Number(amount),
  };
}

function summarize(rows: ExpenseRow[]): ExpenseSummary {
  let expenseTotal = 0;
  let incomeTotal = 0;
  for (const row of rows) {
    if (row.entry_type === "income") {
      incomeTotal += row.amount;
    } else {
      expenseTotal += row.amount;
    }
  }
  return { expenseTotal, incomeTotal, count: rows.length };
}

/** 小程序记账：service role + 显式 user_id */
export async function listExpensesForMp(
  userId: string,
  options?: { entry_date?: string; month?: string; from?: string; to?: string }
): Promise<ExpenseRow[]> {
  const admin = getSupabaseAdminClient();
  let query = admin
    .from("expenses")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (options?.entry_date) {
    query = query.eq("entry_date", options.entry_date);
  } else if (options?.month) {
    const [y, m] = options.month.split("-").map(Number);
    const start = `${options.month}-01`;
    const lastDay = new Date(y, m, 0).getDate();
    const end = `${options.month}-${String(lastDay).padStart(2, "0")}`;
    query = query.gte("entry_date", start).lte("entry_date", end);
  } else if (options?.from && options?.to) {
    query = query.gte("entry_date", options.from).lte("entry_date", options.to);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => mapRow(row as Record<string, unknown>));
}

export async function sumExpensesForMp(
  userId: string,
  options: { entry_date?: string; from?: string; to?: string }
): Promise<ExpenseSummary> {
  const rows = await listExpensesForMp(userId, options);
  return summarize(rows);
}

export async function createExpenseForMp(
  userId: string,
  input: CreateExpenseInput
): Promise<ExpenseRow> {
  const entryType = input.entry_type ?? "expense";
  const category = input.category ?? "other";

  if (!isValidCategory(category, entryType)) {
    throw new Error("无效的分类");
  }
  if (!input.entry_date?.trim()) {
    throw new Error("缺少 entry_date");
  }
  const amount = Number(input.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("金额必须大于 0");
  }

  const admin = getSupabaseAdminClient();
  const { data, error } = await admin
    .from("expenses")
    .insert({
      user_id: userId,
      amount,
      entry_type: entryType,
      category,
      note: (input.note ?? "").trim(),
      entry_date: input.entry_date.trim(),
      source: input.source ?? "manual",
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return mapRow(data as Record<string, unknown>);
}

export async function updateExpenseForMp(
  userId: string,
  expenseId: string,
  patch: UpdateExpenseInput
): Promise<ExpenseRow> {
  const admin = getSupabaseAdminClient();
  const payload: Record<string, unknown> = { ...patch };

  if (patch.amount !== undefined) {
    const amount = Number(patch.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error("金额必须大于 0");
    }
    payload.amount = amount;
  }
  if (typeof patch.note === "string") {
    payload.note = patch.note.trim();
  }
  if (patch.category && patch.entry_type) {
    if (!isValidCategory(patch.category, patch.entry_type)) {
      throw new Error("无效的分类");
    }
  }

  const { data, error } = await admin
    .from("expenses")
    .update(payload)
    .eq("id", expenseId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return mapRow(data as Record<string, unknown>);
}

export async function deleteExpenseForMp(
  userId: string,
  expenseId: string
): Promise<void> {
  const admin = getSupabaseAdminClient();
  const { error } = await admin
    .from("expenses")
    .delete()
    .eq("id", expenseId)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
}
