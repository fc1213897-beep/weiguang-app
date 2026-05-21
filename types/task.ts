/** 任务类型 */
export type TaskCategory = "study" | "coding" | "sport" | "life" | "other";

/** 优先级 */
export type TaskPriority = "low" | "medium" | "high";

export type TaskItem = {
  id: string;
  text: string;
  done: boolean;
  /** 任务归属日期 YYYY-MM-DD */
  date: string;
  category: TaskCategory;
  priority: TaskPriority;
  /** 番茄钟分钟数，0 表示未设置 */
  pomodoroMinutes: number;
};

/** 创建面板草稿 */
export type PlanDraft = {
  text: string;
  category: TaskCategory;
  priority: TaskPriority;
  pomodoroMinutes: number;
};
