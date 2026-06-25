import { NextResponse } from "next/server";
import { runTaskSplit } from "@/lib/task-split-ai";
import type { TaskSplitMode } from "@/lib/task-split";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getTodayDateString } from "@/lib/task-utils";

/** POST /api/tasks/split — Web 端拆分/导入预览（不落库） */
export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

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
