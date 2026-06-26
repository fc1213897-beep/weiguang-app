import { NextResponse } from "next/server";

/**
 * POST /api/auth/mp-refresh
 * 小程序用 refresh_token 续期 Supabase Session
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { refresh_token?: string };
    const refreshToken = body.refresh_token?.trim();
    if (!refreshToken) {
      return NextResponse.json({ error: "缺少 refresh_token" }, { status: 400 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
    if (!url || !anonKey) {
      return NextResponse.json({ error: "服务未配置" }, { status: 500 });
    }

    const res = await fetch(`${url}/auth/v1/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
      body: JSON.stringify({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    });

    const data = (await res.json()) as Record<string, unknown>;
    if (!res.ok) {
      const msg =
        (typeof data.error_description === "string" && data.error_description) ||
        (typeof data.error === "string" && data.error) ||
        "续期失败";
      return NextResponse.json({ error: msg }, { status: 401 });
    }

    return NextResponse.json({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in,
      expires_at: data.expires_at,
      token_type: data.token_type ?? "bearer",
      user: data.user ?? null,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "续期失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
