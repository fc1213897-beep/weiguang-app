import { NextResponse } from "next/server";
import { completeWxLoginSession, getValidWxSession } from "@/lib/wx-auth-server";

/** POST /api/auth/web/confirm  Body: { scene } — 手机网页端确认登录 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { scene?: string };
    const scene = body.scene?.trim();
    if (!scene) {
      return NextResponse.json({ ok: false, error: "缺少 scene" }, { status: 400 });
    }

    await getValidWxSession(scene);
    await completeWxLoginSession(scene, `web_pair_${scene}`);

    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "确认失败";
    const status = message.includes("已使用") || message.includes("过期") ? 409 : 500;
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
