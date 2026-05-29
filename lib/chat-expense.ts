import { formatAmount, getCategoryMeta } from "@/lib/expense-plan";
import { parseExpenseFromMessage } from "@/lib/expense-parse";
import type { CreateExpenseInput, ExpenseRow } from "@/types/database";

/** 今日日期 YYYY-MM-DD */
export function getTodayDateString(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function buildExpenseConfirmReply(expense: ExpenseRow): string {
  const meta = getCategoryMeta(expense.category, expense.entry_type);
  const typeLabel = expense.entry_type === "income" ? "收入" : "支出";
  const label = expense.note?.trim() || meta.label;
  return `帮你记下啦，${label} ${formatAmount(expense.amount)} 元（${typeLabel}）～`;
}

/** 为 AI 注入记账上下文 */
export function buildExpenseAiMessage(
  message: string,
  expense: ExpenseRow
): string {
  const meta = getCategoryMeta(expense.category, expense.entry_type);
  const typeLabel = expense.entry_type === "income" ? "收入" : "支出";
  return `${message}\n\n[系统提示：用户刚刚通过对话记录了一笔${typeLabel}，金额 ${formatAmount(expense.amount)} 元，分类 ${meta.label}。请温柔确认已记下，简短回应即可，不要批评消费。]`;
}

/** 解析并记账，失败返回 null（不阻断聊天） */
export async function tryRecordExpenseFromChat(
  message: string,
  create: (input: CreateExpenseInput) => Promise<ExpenseRow>
): Promise<ExpenseRow | null> {
  const parsed = parseExpenseFromMessage(message, getTodayDateString());
  if (!parsed) return null;

  try {
    return await create({
      amount: parsed.amount,
      entry_type: parsed.entry_type,
      category: parsed.category,
      note: parsed.note,
      entry_date: parsed.entry_date,
      source: "chat",
    });
  } catch {
    return null;
  }
}

function mapExpenseRow(row: Record<string, unknown>): ExpenseRow {
  const amount = row.amount;
  return {
    ...(row as unknown as ExpenseRow),
    amount: typeof amount === "string" ? parseFloat(amount) : Number(amount),
  };
}

export { mapExpenseRow };
