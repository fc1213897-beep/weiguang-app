/** 全局记账数据变更事件（PC 各入口同步刷新） */
export const EXPENSE_CHANGED_EVENT = "wg-expense-changed";

/** 打开浮动记账弹层 */
export const OPEN_EXPENSE_MODAL_EVENT = "wg-open-expense-modal";

export function notifyExpenseChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(EXPENSE_CHANGED_EVENT));
}

export function openExpenseModal() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(OPEN_EXPENSE_MODAL_EVENT));
}
