import { NextResponse } from "next/server";
import { getCronSecret } from "@/lib/wx-subscribe-config";
import { pushDueTaskReminders } from "@/lib/wx-notify-server";

/** POST /api/internal/push-task-reminders — 单任务到点提醒（cron） */
export async function POST(request: Request) {
  const secret = getCronSecret();
  const authHeader = request.headers.get("authorization")?.trim() ?? "";
  const token = authHeader.toLowerCase().startsWith("bearer ")
    ? authHeader.slice(7).trim()
    : "";

  if (!secret || token !== secret) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  try {
    const result = await pushDueTaskReminders();
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    const message = e instanceof Error ? e.message : "推送失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
