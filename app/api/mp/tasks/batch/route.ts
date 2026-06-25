import { NextResponse } from "next/server";
import { requireMpAuth } from "@/lib/mp-auth";
import { createTasksBatchForMp } from "@/lib/mp-tasks-server";
import { trySendTaskAddedNotify } from "@/lib/wx-notify-server";
import type { CreateTaskInput } from "@/types/database";

/** POST /api/mp/tasks/batch — 批量创建任务 */
export async function POST(request: Request) {
  const auth = await requireMpAuth(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = (await request.json()) as { tasks?: CreateTaskInput[] };
    const raw = body.tasks ?? [];

    if (raw.length === 0) {
      return NextResponse.json({ error: "任务列表为空" }, { status: 400 });
    }
    if (raw.length > 20) {
      return NextResponse.json({ error: "单次最多添加 20 条" }, { status: 400 });
    }

    const tasks = await createTasksBatchForMp(auth.user.id, raw);

    void trySendTaskAddedNotify(auth.user.id, tasks.length, "批量添加");

    return NextResponse.json({ tasks, count: tasks.length });
  } catch (e) {
    const message = e instanceof Error ? e.message : "批量创建失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
