/** 与 lib/expense-plan.ts 对齐的记账配置（小程序端） */

const EXPENSE_CATEGORIES = [
  { id: "food", label: "餐饮", icon: "🍜", entry_type: "expense" },
  { id: "transport", label: "交通", icon: "🚌", entry_type: "expense" },
  { id: "study", label: "学习", icon: "📚", entry_type: "expense" },
  { id: "daily", label: "日用", icon: "🧴", entry_type: "expense" },
  { id: "entertain", label: "娱乐", icon: "🎮", entry_type: "expense" },
  { id: "other", label: "其他", icon: "✨", entry_type: "expense" },
];

const INCOME_CATEGORIES = [
  { id: "salary", label: "工资", icon: "💼", entry_type: "income" },
  { id: "side", label: "副业", icon: "💡", entry_type: "income" },
  { id: "other", label: "其他", icon: "✨", entry_type: "income" },
];

function getCategoriesForType(entryType) {
  return entryType === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
}

function getCategoryMeta(category, entryType) {
  const list = getCategoriesForType(entryType || "expense");
  return list.find((c) => c.id === category) || list[list.length - 1];
}

function formatAmount(amount) {
  return Number(amount).toFixed(2);
}

function createDefaultExpenseDraft(date) {
  return {
    amount: "",
    entry_type: "expense",
    category: "food",
    note: "",
    entry_date: date,
  };
}

module.exports = {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  getCategoriesForType,
  getCategoryMeta,
  formatAmount,
  createDefaultExpenseDraft,
};
