import { NextResponse } from "next/server";
import { requireMpAuth } from "@/lib/mp-auth";
import {
  deleteExpenseForMp,
  updateExpenseForMp,
} from "@/lib/mp-expenses-server";
import type { UpdateExpenseInput } from "@/types/database";

type RouteContext = { params: Promise<{ id: string }> };

/** PATCH /api/mp/expenses/:id */
export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireMpAuth(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { id } = await context.params;
    const body = (await request.json()) as UpdateExpenseInput;
    const expense = await updateExpenseForMp(auth.user.id, id, body);
    return NextResponse.json({ expense });
  } catch (e) {
    const message = e instanceof Error ? e.message : "更新记账失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** DELETE /api/mp/expenses/:id */
export async function DELETE(request: Request, context: RouteContext) {
  const auth = await requireMpAuth(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { id } = await context.params;
    await deleteExpenseForMp(auth.user.id, id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "删除记账失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
