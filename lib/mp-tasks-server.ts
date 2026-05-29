import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { CreateTaskInput, TaskRow, UpdateTaskInput } from "@/types/database";

function mapRow(row: Record<string, unknown>): TaskRow {
  return row as unknown as TaskRow;
}

/** 小程序任务：用 service role + 显式 user_id，避免 RLS 与 JWT 头不一致 */
export async function listTasksForMp(
  userId: string,
  taskDate?: string
): Promise<TaskRow[]> {
  const admin = getSupabaseAdminClient();
  let query = admin
    .from("tasks")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (taskDate) {
    query = query.eq("task_date", taskDate);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => mapRow(row as Record<string, unknown>));
}

export async function createTaskForMp(
  userId: string,
  input: CreateTaskInput
): Promise<TaskRow> {
  const admin = getSupabaseAdminClient();
  const { data, error } = await admin
    .from("tasks")
    .insert({
      user_id: userId,
      title: input.title.trim(),
      task_date: input.task_date,
      completed: input.completed ?? false,
      task_type: input.task_type ?? "other",
      priority: input.priority ?? "medium",
      pomodoro_minutes: input.pomodoro_minutes ?? 0,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return mapRow(data as Record<string, unknown>);
}

export async function updateTaskForMp(
  userId: string,
  taskId: string,
  patch: UpdateTaskInput
): Promise<TaskRow> {
  const admin = getSupabaseAdminClient();
  const payload: Record<string, unknown> = { ...patch };
  if (typeof patch.title === "string") {
    payload.title = patch.title.trim();
  }

  const { data, error } = await admin
    .from("tasks")
    .update(payload)
    .eq("id", taskId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return mapRow(data as Record<string, unknown>);
}

export async function deleteTaskForMp(
  userId: string,
  taskId: string
): Promise<void> {
  const admin = getSupabaseAdminClient();
  const { error } = await admin
    .from("tasks")
    .delete()
    .eq("id", taskId)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
}
