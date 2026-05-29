import { NextResponse } from "next/server";
import { requireMpAuth } from "@/lib/mp-auth";
import { deleteTaskForMp, updateTaskForMp } from "@/lib/mp-tasks-server";
import type { UpdateTaskInput } from "@/types/database";

type RouteContext = { params: Promise<{ id: string }> };

/** PATCH /api/mp/tasks/:id */
export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireMpAuth(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { id } = await context.params;
    const body = (await request.json()) as UpdateTaskInput;

    if (typeof body.title === "string" && !body.title.trim()) {
      return NextResponse.json({ error: "标题不能为空" }, { status: 400 });
    }

    const task = await updateTaskForMp(auth.user.id, id, body);
    return NextResponse.json({ task });
  } catch (e) {
    const message = e instanceof Error ? e.message : "更新任务失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** DELETE /api/mp/tasks/:id */
export async function DELETE(request: Request, context: RouteContext) {
  const auth = await requireMpAuth(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { id } = await context.params;
    await deleteTaskForMp(auth.user.id, id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "删除任务失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
