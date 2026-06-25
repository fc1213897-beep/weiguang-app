import { NextResponse } from "next/server";
import { requireMpAuth } from "@/lib/mp-auth";
import { runTaskSplit } from "@/lib/task-split-ai";
import type { TaskSplitMode } from "@/lib/task-split";
import { getTodayDateString } from "@/lib/task-utils";

/** POST /api/mp/tasks/split — 小程序拆分/导入预览 */
export async function POST(request: Request) {
  const auth = await requireMpAuth(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = (await request.json()) as {
      goal?: string;
      task_date?: string;
      mode?: TaskSplitMode;
      lines?: string[];
      polish?: boolean;
    };

    const mode = body.mode === "import" ? "import" : "ai";
    const task_date = body.task_date?.trim() || getTodayDateString();

    const result = await runTaskSplit({
      goal: body.goal,
      task_date,
      mode,
      lines: body.lines,
      polish: body.polish,
    });

    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "拆分失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
