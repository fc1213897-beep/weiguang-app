/**
 * 微信小程序服务端 API：AccessToken 缓存、无限制小程序码
 * 本地 localhost:3000 时由 Next.js Route Handler 直接请求微信，与域名备案无关
 */

import { getWxEnvVersion, getWxLoginPage } from "@/lib/wechat-config";

const TOKEN_URL = "https://api.weixin.qq.com/cgi-bin/token";
const QRCODE_URL = "https://api.weixin.qq.com/wxa/getwxacodeunlimit";
const CODE2SESSION_URL = "https://api.weixin.qq.com/sns/jscode2session";

/** 微信 scene 最长 32 字符 */
export const WX_SCENE_MAX_LEN = 32;

type TokenCache = {
  token: string;
  expiresAt: number;
};

let tokenCache: TokenCache | null = null;

export type WechatCredentials = {
  appId: string;
  secret: string;
};

export function getWxCredentials(): WechatCredentials {
  const appId = process.env.NEXT_PUBLIC_WX_APPID?.trim();
  const secret = process.env.WX_APP_SECRET?.trim();

  if (!appId || !secret) {
    throw new Error(
      "缺少微信配置：请在 .env.local 配置 NEXT_PUBLIC_WX_APPID 与 WX_APP_SECRET"
    );
  }

  return { appId, secret };
}

/** 解析微信返回的错误 JSON（有时 Content-Type 不是 application/json） */
async function parseWechatErrorPayload(
  res: Response
): Promise<{ errcode?: number; errmsg?: string } | null> {
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length === 0) return null;
  if (buf[0] !== 0x7b) return null;
  try {
    return JSON.parse(buf.toString("utf8")) as {
      errcode?: number;
      errmsg?: string;
    };
  } catch {
    return null;
  }
}

function formatWechatError(
  prefix: string,
  err?: { errcode?: number; errmsg?: string }
): string {
  if (!err?.errmsg) return prefix;
  const code = err.errcode ?? "";
  let hint = "";
  if (err.errcode === 40001 || err.errcode === 40013) {
    hint = "（请检查 AppID / AppSecret 是否与小程序后台一致）";
  } else if (err.errcode === 41030) {
    hint = `（页面路径不存在或未发布，请设置 WX_MP_LOGIN_PAGE 为 app.json 中已有页面，当前：${getWxLoginPage()}）`;
  } else if (err.errcode === 85088) {
    hint = "（个人主体或未开通扫普通链接二维码能力，请用企业测试号或检查权限）";
  }
  return `${prefix}：${err.errmsg} (${code})${hint}`;
}

/** 获取并缓存 access_token */
export async function getWechatAccessToken(): Promise<string> {
  if (tokenCache && tokenCache.expiresAt > Date.now() + 60_000) {
    return tokenCache.token;
  }

  const { appId, secret } = getWxCredentials();
  const url = `${TOKEN_URL}?grant_type=client_credential&appid=${encodeURIComponent(appId)}&secret=${encodeURIComponent(secret)}`;

  const res = await fetch(url, { cache: "no-store" });
  const data = (await res.json()) as {
    access_token?: string;
    expires_in?: number;
    errcode?: number;
    errmsg?: string;
  };

  if (!data.access_token) {
    throw new Error(
      formatWechatError("微信 AccessToken 获取失败", data)
    );
  }

  tokenCache = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in ?? 7200) * 1000,
  };

  return data.access_token;
}

export type WxCode2SessionResult = {
  openid: string;
  session_key?: string;
  unionid?: string;
};

/**
 * 用 wx.login 的 code 换取 openid（仅服务端调用，不可暴露 Secret）
 */
export async function wxCode2Session(code: string): Promise<WxCode2SessionResult> {
  const trimmed = code?.trim();
  if (!trimmed) {
    throw new Error("缺少微信登录 code");
  }

  const { appId, secret } = getWxCredentials();
  const url = `${CODE2SESSION_URL}?appid=${encodeURIComponent(appId)}&secret=${encodeURIComponent(secret)}&js_code=${encodeURIComponent(trimmed)}&grant_type=authorization_code`;

  const res = await fetch(url, { cache: "no-store" });
  const data = (await res.json()) as {
    openid?: string;
    session_key?: string;
    unionid?: string;
    errcode?: number;
    errmsg?: string;
  };

  if (!data.openid) {
    throw new Error(
      formatWechatError("微信 code 换 openid 失败", data)
    );
  }

  return {
    openid: data.openid,
    session_key: data.session_key,
    unionid: data.unionid,
  };
}

/** 仅测 Token 是否正常（不生成码） */
export async function pingWechatApi(): Promise<void> {
  await getWechatAccessToken();
}

/**
 * 生成无限制小程序码（返回 PNG Buffer）
 * @param scene 场景值，最长 32 字符，会原样带到小程序 onLoad(options.scene)
 */
export async function getWechatUnlimitedQrcode(scene: string): Promise<Buffer> {
  if (!scene || scene.length > WX_SCENE_MAX_LEN) {
    throw new Error(`scene 长度须在 1–${WX_SCENE_MAX_LEN} 之间`);
  }

  const accessToken = await getWechatAccessToken();
  const page = getWxLoginPage();
  const envVersion = getWxEnvVersion();

  const res = await fetch(
    `${QRCODE_URL}?access_token=${encodeURIComponent(accessToken)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        scene,
        page,
        check_path: false,
        width: 280,
        env_version: envVersion,
      }),
      cache: "no-store",
    }
  );

  const contentType = res.headers.get("content-type") ?? "";

  if (!contentType.includes("image") && !res.ok) {
    const err = await parseWechatErrorPayload(res);
    throw new Error(formatWechatError("小程序码生成失败", err ?? undefined));
  }

  if (contentType.includes("application/json") || contentType.includes("text")) {
    const err = await parseWechatErrorPayload(res);
    throw new Error(formatWechatError("小程序码生成失败", err ?? undefined));
  }

  const buf = Buffer.from(await res.arrayBuffer());

  if (buf.length < 100 || buf[0] === 0x7b) {
    let errJson: { errcode?: number; errmsg?: string } | null = null;
    if (buf[0] === 0x7b) {
      try {
        errJson = JSON.parse(buf.toString("utf8"));
      } catch {
        /* ignore */
      }
    }
    throw new Error(
      formatWechatError("小程序码生成失败", errJson ?? undefined)
    );
  }

  return buf;
}
