import type { DbEntryType, DbExpenseCategory, DbIncomeCategory } from "@/types/database";

export type ExpenseCategoryMeta = {
  id: DbExpenseCategory | DbIncomeCategory;
  label: string;
  icon: string;
  entry_type: DbEntryType;
};

/** 支出分类 */
export const EXPENSE_CATEGORIES: ExpenseCategoryMeta[] = [
  { id: "food", label: "餐饮", icon: "🍜", entry_type: "expense" },
  { id: "transport", label: "交通", icon: "🚌", entry_type: "expense" },
  { id: "study", label: "学习", icon: "📚", entry_type: "expense" },
  { id: "daily", label: "日用", icon: "🧴", entry_type: "expense" },
  { id: "entertain", label: "娱乐", icon: "🎮", entry_type: "expense" },
  { id: "other", label: "其他", icon: "✨", entry_type: "expense" },
];

/** 收入分类 */
export const INCOME_CATEGORIES: ExpenseCategoryMeta[] = [
  { id: "salary", label: "工资", icon: "💼", entry_type: "income" },
  { id: "side", label: "副业", icon: "💡", entry_type: "income" },
  { id: "other", label: "其他", icon: "✨", entry_type: "income" },
];

const ALL_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

/** 分类关键词映射（对话解析用） */
export const CATEGORY_KEYWORDS: Record<string, string> = {
  餐饮: "food",
  午饭: "food",
  早饭: "food",
  晚饭: "food",
  早餐: "food",
  午餐: "food",
  晚餐: "food",
  咖啡: "food",
  奶茶: "food",
  外卖: "food",
  交通: "transport",
  地铁: "transport",
  公交: "transport",
  打车: "transport",
  学习: "study",
  课程: "study",
  书: "study",
  日用: "daily",
  娱乐: "entertain",
  电影: "entertain",
  工资: "salary",
  薪水: "salary",
  副业: "side",
};

export function getCategoriesForType(entryType: DbEntryType): ExpenseCategoryMeta[] {
  return entryType === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
}

export function getCategoryMeta(
  category: string,
  entryType: DbEntryType = "expense"
): ExpenseCategoryMeta {
  const list = getCategoriesForType(entryType);
  return list.find((c) => c.id === category) ?? list[list.length - 1];
}

export function formatAmount(amount: number): string {
  return Number(amount).toFixed(2);
}

export function createDefaultExpenseDraft(date: string) {
  return {
    amount: "",
    entry_type: "expense" as DbEntryType,
    category: "food",
    note: "",
    entry_date: date,
  };
}

export function resolveCategoryFromKeyword(text: string): string | null {
  for (const [keyword, id] of Object.entries(CATEGORY_KEYWORDS)) {
    if (text.includes(keyword)) return id;
  }
  return null;
}

export function isValidCategory(
  category: string,
  entryType: DbEntryType
): boolean {
  return getCategoriesForType(entryType).some((c) => c.id === category);
}

export { ALL_CATEGORIES };
