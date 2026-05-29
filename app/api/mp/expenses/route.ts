import { NextResponse } from "next/server";
import { requireMpAuth } from "@/lib/mp-auth";
import {
  createExpenseForMp,
  listExpensesForMp,
  sumExpensesForMp,
} from "@/lib/mp-expenses-server";
import type { CreateExpenseInput } from "@/types/database";

/** GET /api/mp/expenses?entry_date= | ?month= | ?from=&to= */
export async function GET(request: Request) {
  const auth = await requireMpAuth(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { searchParams } = new URL(request.url);
    const entry_date = searchParams.get("entry_date")?.trim() || undefined;
    const month = searchParams.get("month")?.trim() || undefined;
    const from = searchParams.get("from")?.trim() || undefined;
    const to = searchParams.get("to")?.trim() || undefined;

    const expenses = await listExpensesForMp(auth.user.id, {
      entry_date,
      month,
      from,
      to,
    });

    let summary;
    if (month && !entry_date) {
      const [y, m] = month.split("-").map(Number);
      const start = `${month}-01`;
      const lastDay = new Date(y, m, 0).getDate();
      const end = `${month}-${String(lastDay).padStart(2, "0")}`;
      summary = await sumExpensesForMp(auth.user.id, { from: start, to: end });
    } else if (from && to) {
      summary = await sumExpensesForMp(auth.user.id, { from, to });
    } else if (entry_date) {
      summary = await sumExpensesForMp(auth.user.id, { entry_date });
    } else {
      summary = { expenseTotal: 0, incomeTotal: 0, count: expenses.length };
    }

    return NextResponse.json({ expenses, summary });
  } catch (e) {
    const message = e instanceof Error ? e.message : "获取记账失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** POST /api/mp/expenses */
export async function POST(request: Request) {
  const auth = await requireMpAuth(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = (await request.json()) as CreateExpenseInput;
    const entry_date = body.entry_date?.trim();

    if (!entry_date) {
      return NextResponse.json({ error: "缺少 entry_date" }, { status: 400 });
    }

    const expense = await createExpenseForMp(auth.user.id, {
      amount: body.amount,
      entry_type: body.entry_type,
      category: body.category,
      note: body.note,
      entry_date,
      source: body.source ?? "manual",
    });

    return NextResponse.json({ expense });
  } catch (e) {
    const message = e instanceof Error ? e.message : "创建记账失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
