import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  createSessionForUser,
  ensureWxAuthUser,
  getValidWxSession,
} from "@/lib/wx-auth-server";

/**
 * POST /api/auth/wx/exchange
 * 网页端轮询到 completed 后，用 scene 兑换 Supabase Session
 * Body: { "scene": "..." }
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { scene?: string };
    const scene = body.scene?.trim();

    if (!scene) {
      return NextResponse.json({ error: "缺少 scene" }, { status: 400 });
    }

    const row = await getValidWxSession(scene);

    if (row.status === "consumed") {
      return NextResponse.json({ error: "该二维码已使用" }, { status: 400 });
    }

    if (row.status !== "completed" || !row.openid) {
      return NextResponse.json(
        { error: "等待小程序确认登录" },
        { status: 409 }
      );
    }

    const user = await ensureWxAuthUser(row.openid);
    const session = await createSessionForUser(user);
    const admin = getSupabaseAdminClient();

    await admin
      .from("wx_login_sessions")
      .update({
        status: "consumed",
        user_id: user.id,
      })
      .eq("scene", scene);

    return NextResponse.json({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_in: session.expires_in ?? 3600,
      expires_at: session.expires_at,
      token_type: session.token_type ?? "bearer",
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "登录兑换失败";
    const status =
      message.includes("等待") || message.includes("过期") ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
