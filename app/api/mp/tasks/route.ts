import { NextResponse } from "next/server";
import { requireMpAuth } from "@/lib/mp-auth";
import {
  createTaskForMp,
  listTasksForMp,
} from "@/lib/mp-tasks-server";
import type { CreateTaskInput } from "@/types/database";

/** GET /api/mp/tasks?task_date=YYYY-MM-DD */
export async function GET(request: Request) {
  const auth = await requireMpAuth(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { searchParams } = new URL(request.url);
    const taskDate = searchParams.get("task_date")?.trim() || undefined;
    const tasks = await listTasksForMp(auth.user.id, taskDate);
    return NextResponse.json({ tasks });
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

    const task = await createTaskForMp(auth.user.id, {
      title,
      task_date,
      completed: body.completed,
      task_type: body.task_type,
      priority: body.priority,
      pomodoro_minutes: body.pomodoro_minutes,
    });

    return NextResponse.json({ task });
  } catch (e) {
    const message = e instanceof Error ? e.message : "创建任务失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
