import { NextResponse } from "next/server";
import {
  getWxEnvVersion,
  getWxLoginPage,
  isWxLocalDev,
  maskAppId,
} from "@/lib/wechat-config";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { generateWxScene, getWxLoginExpiresAt } from "@/lib/wx-login";
import { getWxCredentials, getWechatUnlimitedQrcode } from "@/lib/wechat";

/**
 * POST /api/auth/wx/qrcode
 * 生成 scene、写入 Supabase、用测试号 AppID 换 Token 并生成小程序码（base64）
 * 本地：http://localhost:3000 前端 fetch 同源即可，无需备案域名
 */
export async function POST() {
  try {
    const scene = generateWxScene();
    const expiresAt = getWxLoginExpiresAt();
    const admin = getSupabaseAdminClient();

    const { error: insertError } = await admin.from("wx_login_sessions").insert({
      scene,
      status: "pending",
      expires_at: expiresAt,
    });

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      );
    }

    const pngBuffer = await getWechatUnlimitedQrcode(scene);
    const qrcode = `data:image/png;base64,${pngBuffer.toString("base64")}`;
    const { appId } = getWxCredentials();

    const payload: Record<string, unknown> = {
      scene,
      qrcode,
      expiresAt,
    };

    if (isWxLocalDev()) {
      payload.debug = {
        appId: maskAppId(appId),
        envVersion: getWxEnvVersion(),
        loginPage: getWxLoginPage(),
      };
    }

    return NextResponse.json(payload);
  } catch (e) {
    const message = e instanceof Error ? e.message : "生成二维码失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
