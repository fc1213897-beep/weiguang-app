import { NextResponse } from "next/server";
import { getWxEnvVersion, getWxLoginPage, isWxLocalDev } from "@/lib/wechat-config";
import { pingWechatApi } from "@/lib/wechat";

/** GET /api/auth/wx/ping — 自检 AccessToken（生产环境仅返回 ok） */
export async function GET() {
  try {
    await pingWechatApi();
    if (isWxLocalDev()) {
      return NextResponse.json({
        ok: true,
        envVersion: getWxEnvVersion(),
        loginPage: getWxLoginPage(),
      });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "微信接口不可用";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
