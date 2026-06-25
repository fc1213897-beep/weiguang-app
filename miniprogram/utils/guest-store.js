const TASKS_KEY = "wg_guest_tasks";
const EXPENSES_KEY = "wg_guest_expenses";

function readJson(key, fallback) {
  try {
    const raw = wx.getStorageSync(key);
    return raw || fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, data) {
  wx.setStorageSync(key, data);
}

function genId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function getGuestTasks() {
  return readJson(TASKS_KEY, []);
}

function getGuestTasksByDate(date) {
  return getGuestTasks().filter((t) => t.task_date === date);
}

function addGuestTask(task) {
  const item = { ...task, id: genId("guest-task") };
  const tasks = getGuestTasks();
  tasks.unshift(item);
  writeJson(TASKS_KEY, tasks);
  return item;
}

function updateGuestTask(id, patch) {
  const tasks = getGuestTasks();
  const idx = tasks.findIndex((t) => t.id === id);
  if (idx < 0) return null;
  tasks[idx] = { ...tasks[idx], ...patch };
  writeJson(TASKS_KEY, tasks);
  return tasks[idx];
}

function deleteGuestTask(id) {
  writeJson(
    TASKS_KEY,
    getGuestTasks().filter((t) => t.id !== id)
  );
}

function getGuestExpenses() {
  return readJson(EXPENSES_KEY, []);
}

function getGuestExpensesByDate(date) {
  return getGuestExpenses().filter((e) => e.entry_date === date);
}

function summarizeGuestExpenses(expenses) {
  let expenseTotal = 0;
  let incomeTotal = 0;
  expenses.forEach((item) => {
    if (item.entry_type === "income") {
      incomeTotal += Number(item.amount) || 0;
    } else {
      expenseTotal += Number(item.amount) || 0;
    }
  });
  return {
    expenseTotal,
    incomeTotal,
    count: expenses.length,
  };
}

function addGuestExpense(expense) {
  const item = { ...expense, id: genId("guest-expense"), source: "manual" };
  const list = getGuestExpenses();
  list.unshift(item);
  writeJson(EXPENSES_KEY, list);
  return item;
}

function deleteGuestExpense(id) {
  writeJson(
    EXPENSES_KEY,
    getGuestExpenses().filter((e) => e.id !== id)
  );
}

module.exports = {
  getGuestTasksByDate,
  addGuestTask,
  updateGuestTask,
  deleteGuestTask,
  getGuestExpensesByDate,
  summarizeGuestExpenses,
  addGuestExpense,
  deleteGuestExpense,
};
