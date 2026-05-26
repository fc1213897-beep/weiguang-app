import { NextResponse } from "next/server";
import { requireMpAuth } from "@/lib/mp-auth";
import type { TaskRow, UpdateTaskInput } from "@/types/database";

function mapRow(row: Record<string, unknown>): TaskRow {
  return row as unknown as TaskRow;
}

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
    const payload: Record<string, unknown> = { ...body };

    if (typeof body.title === "string") {
      const t = body.title.trim();
      if (!t) {
        return NextResponse.json({ error: "标题不能为空" }, { status: 400 });
      }
      payload.title = t;
    }

    const { data, error } = await auth.supabase
      .from("tasks")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      task: mapRow(data as Record<string, unknown>),
    });
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
    const { error } = await auth.supabase.from("tasks").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "删除任务失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
