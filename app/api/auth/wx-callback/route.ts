import { NextResponse } from "next/server";
import { completeWxLoginSession } from "@/lib/wx-auth-server";
import { wxCode2Session } from "@/lib/wechat";

/** POST /api/auth/wx-callback  Body: { code, scene } */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { code?: string; scene?: string };
    const code = body.code?.trim();
    const scene = body.scene?.trim();

    if (!code || !scene) {
      return NextResponse.json({ ok: false, error: "缺少 code 或 scene" }, { status: 400 });
    }

    const { openid } = await wxCode2Session(code);
    await completeWxLoginSession(scene, openid);

    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "授权失败";
    const status = message.includes("已使用") || message.includes("过期") ? 409 : 500;
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
