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
  >
>;

/** 列表筛选 */
export type ListTasksFilter = {
  task_date?: string;
  completed?: boolean;
};

/** CRUD 统一返回结构 */
export type TaskCrudResult<T> = {
  data: T | null;
  error: string | null;
};
