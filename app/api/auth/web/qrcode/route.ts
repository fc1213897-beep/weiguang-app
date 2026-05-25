import { NextResponse } from "next/server";
import { getPublicAppUrl } from "@/lib/app-url";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { generateWxScene, getWxLoginExpiresAt } from "@/lib/wx-login";

/** POST /api/auth/web/qrcode — 生成网页确认登录二维码（普通 URL，非小程序码） */
export async function POST() {
  try {
    const scene = generateWxScene();
    const expiresAt = getWxLoginExpiresAt();
    const base = getPublicAppUrl();
    const approveUrl = `${base}/auth/approve?scene=${encodeURIComponent(scene)}`;

    const admin = getSupabaseAdminClient();
    const { error } = await admin.from("wx_login_sessions").insert({
      scene,
      status: "pending",
      expires_at: expiresAt,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const qrcode = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(approveUrl)}`;

    return NextResponse.json({
      scene,
      approveUrl,
      qrcode,
      expiresAt,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "生成二维码失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
