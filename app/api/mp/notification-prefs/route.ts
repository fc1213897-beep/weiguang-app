import { NextResponse } from "next/server";
import { requireMpAuth } from "@/lib/mp-auth";
import {
  getNotificationPrefsForUser,
  upsertNotificationPrefs,
} from "@/lib/wx-notify-server";

/** GET /api/mp/notification-prefs */
export async function GET(request: Request) {
  const auth = await requireMpAuth(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const prefs = await getNotificationPrefsForUser(auth.user.id);
    return NextResponse.json({ prefs });
  } catch (e) {
    const message = e instanceof Error ? e.message : "读取失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** PATCH /api/mp/notification-prefs */
export async function PATCH(request: Request) {
  const auth = await requireMpAuth(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = (await request.json()) as {
      remind_enabled?: boolean;
      remind_time?: string;
      instant_on_add?: boolean;
    };

    await upsertNotificationPrefs(auth.user.id, body);
    const prefs = await getNotificationPrefsForUser(auth.user.id);
    return NextResponse.json({ prefs });
  } catch (e) {
    const message = e instanceof Error ? e.message : "保存失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
