import { getSupabaseClient } from "@/lib/supabase/client";
import { isValidCategory } from "@/lib/expense-plan";
import type {
  CreateExpenseInput,
  CrudResult,
  ExpenseRow,
  ListExpensesFilter,
} from "@/types/database";

/** 要求已登录 */
async function requireUserId(): Promise<CrudResult<string>> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    return { data: null, error: error.message };
  }
  if (!data.user) {
    return { data: null, error: "未登录，无法操作云端记账" };
  }
  return { data: data.user.id, error: null };
}

function mapRow(row: Record<string, unknown>): ExpenseRow {
  const amount = row.amount;
  return {
    ...(row as unknown as ExpenseRow),
    amount: typeof amount === "string" ? parseFloat(amount) : Number(amount),
  };
}

/** 列出当前用户的 expenses（RLS 自动限定 user_id） */
export async function listExpenses(
  filter?: ListExpensesFilter
): Promise<CrudResult<ExpenseRow[]>> {
  const auth = await requireUserId();
  if (auth.error || !auth.data) return { data: null, error: auth.error };

  const supabase = getSupabaseClient();
  let query = supabase
    .from("expenses")
    .select("*")
    .order("entry_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (filter?.entry_date) {
    query = query.eq("entry_date", filter.entry_date);
  } else if (filter?.month) {
    const [y, m] = filter.month.split("-").map(Number);
    const start = `${filter.month}-01`;
    const lastDay = new Date(y, m, 0).getDate();
    const end = `${filter.month}-${String(lastDay).padStart(2, "0")}`;
    query = query.gte("entry_date", start).lte("entry_date", end);
  } else if (filter?.from && filter?.to) {
    query = query.gte("entry_date", filter.from).lte("entry_date", filter.to);
  }

  const { data, error } = await query;
  if (error) return { data: null, error: error.message };

  return {
    data: (data ?? []).map((row) => mapRow(row as Record<string, unknown>)),
    error: null,
  };
}

/** 新建记账（user_id 自动取当前登录用户） */
export async function createExpense(
  input: CreateExpenseInput
): Promise<CrudResult<ExpenseRow>> {
  const auth = await requireUserId();
  if (auth.error || !auth.data) return { data: null, error: auth.error };

  const entryType = input.entry_type ?? "expense";
  const category = input.category ?? "other";
  const entry_date = input.entry_date?.trim();

  if (!entry_date) return { data: null, error: "缺少归属日期" };
  if (!isValidCategory(category, entryType)) {
    return { data: null, error: "无效的分类" };
  }

  const amount = Number(input.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return { data: null, error: "金额必须大于 0" };
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("expenses")
    .insert({
      user_id: auth.data,
      amount,
      entry_type: entryType,
      category,
      note: (input.note ?? "").trim(),
      entry_date,
      source: input.source ?? "manual",
    })
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data: mapRow(data as Record<string, unknown>), error: null };
}

/** 删除记账（仅能删除自己的，RLS） */
export async function deleteExpense(id: string): Promise<CrudResult<null>> {
  const auth = await requireUserId();
  if (auth.error || !auth.data) return { data: null, error: auth.error };

  const supabase = getSupabaseClient();
  const { error } = await supabase.from("expenses").delete().eq("id", id);

  if (error) return { data: null, error: error.message };
  return { data: null, error: null };
}
