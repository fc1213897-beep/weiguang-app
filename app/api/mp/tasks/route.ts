import { NextResponse } from "next/server";
import { requireMpAuth } from "@/lib/mp-auth";
import type { CreateTaskInput, TaskRow } from "@/types/database";

function mapRow(row: Record<string, unknown>): TaskRow {
  return row as unknown as TaskRow;
}

/** GET /api/mp/tasks?task_date=YYYY-MM-DD */
export async function GET(request: Request) {
  const auth = await requireMpAuth(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { searchParams } = new URL(request.url);
    const taskDate = searchParams.get("task_date")?.trim();

    let query = auth.supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false });

    if (taskDate) {
      query = query.eq("task_date", taskDate);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      tasks: (data ?? []).map((row) =>
        mapRow(row as Record<string, unknown>)
      ),
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "获取任务失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** POST /api/mp/tasks */
export async function POST(request: Request) {
  const auth = await requireMpAuth(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = (await request.json()) as CreateTaskInput;
    const title = body.title?.trim();
    const task_date = body.task_date?.trim();

    if (!title) {
      return NextResponse.json({ error: "标题不能为空" }, { status: 400 });
    }
    if (!task_date) {
      return NextResponse.json({ error: "缺少 task_date" }, { status: 400 });
    }

    const { data, error } = await auth.supabase
      .from("tasks")
      .insert({
        user_id: auth.user.id,
        title,
        task_date,
        completed: body.completed ?? false,
        task_type: body.task_type ?? "other",
        priority: body.priority ?? "medium",
        pomodoro_minutes: body.pomodoro_minutes ?? 0,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      task: mapRow(data as Record<string, unknown>),
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "创建任务失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
