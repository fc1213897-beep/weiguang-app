import { NextResponse } from "next/server";
import {
  createSessionForUser,
  ensureWxAuthUser,
} from "@/lib/wx-auth-server";
import { wxCode2Session } from "@/lib/wechat";

/**
 * POST /api/auth/wx/mp-login
 * 小程序内直接微信登录（无需 scene），返回 Supabase Session
 * Body: { "code": "wx.login 返回的 code" }
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { code?: string };
    const code = body.code?.trim();

    if (!code) {
      return NextResponse.json({ error: "缺少 code" }, { status: 400 });
    }

    const { openid } = await wxCode2Session(code);
    const user = await ensureWxAuthUser(openid);
    const session = await createSessionForUser(user);

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
    const message = e instanceof Error ? e.message : "登录失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
