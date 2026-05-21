import type { TaskRow, CreateTaskInput, UpdateTaskInput } from "@/types/database";
import type { TaskItem } from "@/types/task";

/** 云端行 → 本地 TaskItem（note 云端暂无，置空） */
export function taskRowToTaskItem(row: TaskRow): TaskItem {
  return {
    id: row.id,
    text: row.title,
    done: row.completed,
    date: row.task_date,
    category: row.task_type,
    priority: row.priority,
    pomodoroMinutes: row.pomodoro_minutes,
    note: "",
  };
}

/** 本地 TaskItem → 新建入参 */
export function taskItemToCreateInput(item: TaskItem): CreateTaskInput {
  return {
    title: item.text,
    task_date: item.date,
    completed: item.done,
    task_type: item.category,
    priority: item.priority,
    pomodoro_minutes: item.pomodoroMinutes,
  };
}

/** 本地字段 → 更新入参 */
export function taskItemToUpdateInput(
  patch: Partial<TaskItem>
): UpdateTaskInput {
  const out: UpdateTaskInput = {};
  if (patch.text !== undefined) out.title = patch.text;
  if (patch.done !== undefined) out.completed = patch.done;
  if (patch.date !== undefined) out.task_date = patch.date;
  if (patch.category !== undefined) out.task_type = patch.category;
  if (patch.priority !== undefined) out.priority = patch.priority;
  if (patch.pomodoroMinutes !== undefined) {
    out.pomodoro_minutes = patch.pomodoroMinutes;
  }
  return out;
}
