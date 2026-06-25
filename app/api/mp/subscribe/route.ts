import { NextResponse } from "next/server";
import { requireMpAuth } from "@/lib/mp-auth";
import { saveSubscribeGrant } from "@/lib/wx-notify-server";

/** POST /api/mp/subscribe — 保存订阅消息授权结果 */
export async function POST(request: Request) {
  const auth = await requireMpAuth(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = (await request.json()) as {
      template_id?: string;
      status?: string;
      openid?: string;
    };

    const templateId = body.template_id?.trim();
    if (!templateId) {
      return NextResponse.json({ error: "缺少 template_id" }, { status: 400 });
    }

    const openid =
      body.openid?.trim() ||
      (auth.user.user_metadata?.wx_openid as string | undefined)?.trim() ||
      "";

    if (!openid) {
      return NextResponse.json({ error: "无法获取 openid" }, { status: 400 });
    }

    await saveSubscribeGrant({
      userId: auth.user.id,
      openid,
      templateId,
      status: body.status?.trim() || "accept",
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "保存授权失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
