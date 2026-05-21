import { getSupabaseClient } from "@/lib/supabase/client";
import type {
  CreateTaskInput,
  ListTasksFilter,
  TaskCrudResult,
  TaskRow,
  UpdateTaskInput,
} from "@/types/database";

/** 要求已登录，否则返回错误文案 */
async function requireUserId(): Promise<TaskCrudResult<string>> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    return { data: null, error: error.message };
  }
  if (!data.user) {
    return { data: null, error: "未登录，无法操作云端任务" };
  }
  return { data: data.user.id, error: null };
}

function mapRow(row: Record<string, unknown>): TaskRow {
  return row as unknown as TaskRow;
}

/**
 * 列出当前用户的 tasks（RLS 自动限定 user_id）
 */
export async function listTasks(
  filter?: ListTasksFilter
): Promise<TaskCrudResult<TaskRow[]>> {
  const auth = await requireUserId();
  if (auth.error || !auth.data) return { data: null, error: auth.error };

  const supabase = getSupabaseClient();
  let query = supabase
    .from("tasks")
    .select("*")
    .order("task_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (filter?.task_date) {
    query = query.eq("task_date", filter.task_date);
  }
  if (filter?.completed !== undefined) {
    query = query.eq("completed", filter.completed);
  }

  const { data, error } = await query;

  if (error) return { data: null, error: error.message };
  return {
    data: (data ?? []).map((row) => mapRow(row as Record<string, unknown>)),
    error: null,
  };
}

/**
 * 按 id 获取单条任务（仅能访问自己的，RLS）
 */
export async function getTaskById(
  id: string
): Promise<TaskCrudResult<TaskRow>> {
  const auth = await requireUserId();
  if (auth.error || !auth.data) return { data: null, error: auth.error };

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) return { data: null, error: error.message };
  if (!data) return { data: null, error: "任务不存在" };
  return { data: mapRow(data as Record<string, unknown>), error: null };
}

/**
 * 新建任务（user_id 自动取当前登录用户）
 */
export async function createTask(
  input: CreateTaskInput
): Promise<TaskCrudResult<TaskRow>> {
  const auth = await requireUserId();
  if (auth.error || !auth.data) return { data: null, error: auth.error };

  const title = input.title.trim();
  if (!title) return { data: null, error: "标题不能为空" };

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("tasks")
    .insert({
      user_id: auth.data,
      title,
      task_date: input.task_date,
      completed: input.completed ?? false,
      task_type: input.task_type ?? "other",
      priority: input.priority ?? "medium",
      pomodoro_minutes: input.pomodoro_minutes ?? 0,
    })
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data: mapRow(data as Record<string, unknown>), error: null };
}

/**
 * 更新任务（仅能更新自己的，RLS）
 */
export async function updateTask(
  id: string,
  patch: UpdateTaskInput
): Promise<TaskCrudResult<TaskRow>> {
  const auth = await requireUserId();
  if (auth.error || !auth.data) return { data: null, error: auth.error };

  const payload: Record<string, unknown> = { ...patch };
  if (typeof patch.title === "string") {
    const t = patch.title.trim();
    if (!t) return { data: null, error: "标题不能为空" };
    payload.title = t;
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("tasks")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data: mapRow(data as Record<string, unknown>), error: null };
}

/**
 * 删除任务（仅能删除自己的，RLS）
 */
export async function deleteTask(id: string): Promise<TaskCrudResult<null>> {
  const auth = await requireUserId();
  if (auth.error || !auth.data) return { data: null, error: auth.error };

  const supabase = getSupabaseClient();
  const { error } = await supabase.from("tasks").delete().eq("id", id);

  if (error) return { data: null, error: error.message };
  return { data: null, error: null };
}
