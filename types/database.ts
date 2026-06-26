/**
 * Supabase 云端表类型（与本地 TaskItem 字段名不同，同步阶段再做映射）
 * 表：public.tasks
 */

/** 任务类型（云端 task_type） */
export type DbTaskType = "study" | "coding" | "sport" | "life" | "other";

/** 优先级（云端 priority） */
export type DbTaskPriority = "low" | "medium" | "high";

/** tasks 表完整行 */
export type TaskRow = {
  id: string;
  user_id: string;
  title: string;
  completed: boolean;
  task_type: DbTaskType;
  priority: DbTaskPriority;
  pomodoro_minutes: number;
  /** 归属日期 YYYY-MM-DD */
  task_date: string;
  remind_at: string | null;
  remind_sent_at: string | null;
  created_at: string;
  updated_at: string;
};

/** 新建任务入参（不含 id / user_id / 时间戳） */
export type CreateTaskInput = {
  title: string;
  task_date: string;
  completed?: boolean;
  task_type?: DbTaskType;
  priority?: DbTaskPriority;
  pomodoro_minutes?: number;
  remind_at?: string | null;
  remind_sent_at?: string | null;
};

/** 更新任务入参（部分字段） */
export type UpdateTaskInput = Partial<
  Pick<
    TaskRow,
    | "title"
    | "completed"
    | "task_type"
    | "priority"
    | "pomodoro_minutes"
    | "task_date"
    | "remind_at"
    | "remind_sent_at"
  >
>;

/** 列表筛选 */
export type ListTasksFilter = {
  task_date?: string;
  completed?: boolean;
};

/** CRUD 统一返回结构 */
export type CrudResult<T> = {
  data: T | null;
  error: string | null;
};

/** @deprecated 使用 CrudResult */
export type TaskCrudResult<T> = CrudResult<T>;

/** 聊天消息角色 */
export type DbMessageRole = "user" | "assistant" | "system";

/** chat_sessions 表行 */
export type ChatSessionRow = {
  id: string;
  user_id: string;
  title: string;
  is_default: boolean;
  reply_index: number;
  last_message_at: string | null;
  created_at: string;
  updated_at: string;
};

/** messages 表行 */
export type MessageRow = {
  id: string;
  session_id: string;
  user_id: string;
  role: DbMessageRole;
  content: string;
  client_seq: number | null;
  created_at: string;
};

/** 写入消息入参 */
export type InsertMessageInput = {
  session_id: string;
  role: DbMessageRole;
  content: string;
  client_seq: number;
};

/** 收支类型 */
export type DbEntryType = "expense" | "income";

/** 记账来源 */
export type DbExpenseSource = "manual" | "chat";

/** 支出分类 */
export type DbExpenseCategory =
  | "food"
  | "transport"
  | "study"
  | "daily"
  | "entertain"
  | "other";

/** 收入分类 */
export type DbIncomeCategory = "salary" | "side" | "other";

/** expenses 表完整行 */
export type ExpenseRow = {
  id: string;
  user_id: string;
  amount: number;
  entry_type: DbEntryType;
  category: string;
  note: string;
  /** 归属日期 YYYY-MM-DD */
  entry_date: string;
  source: DbExpenseSource;
  created_at: string;
  updated_at: string;
};

/** 新建记账入参 */
export type CreateExpenseInput = {
  amount: number;
  entry_type?: DbEntryType;
  category?: string;
  note?: string;
  entry_date: string;
  source?: DbExpenseSource;
};

/** 更新记账入参 */
export type UpdateExpenseInput = Partial<
  Pick<
    ExpenseRow,
    "amount" | "entry_type" | "category" | "note" | "entry_date"
  >
>;

/** 记账汇总 */
export type ExpenseSummary = {
  expenseTotal: number;
  incomeTotal: number;
  count: number;
};

/** 列表筛选 */
export type ListExpensesFilter = {
  entry_date?: string;
  month?: string;
  from?: string;
  to?: string;
};
