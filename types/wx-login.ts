/** 微信扫码登录会话状态 */
export type WxLoginStatus = "pending" | "completed" | "consumed" | "expired";

export type WxLoginSessionRow = {
  scene: string;
  openid: string | null;
  status: WxLoginStatus;
  user_id: string | null;
  created_at: string;
  expires_at: string;
};

/** 生成小程序码 API 响应 */
export type WxQrcodeResponse = {
  scene: string;
  qrcode: string;
  expiresAt: string;
  debug?: { appId: string; envVersion: string; loginPage: string };
};

/** 兑换 Session API 响应 */
export type WxExchangeResponse = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at?: number;
  token_type: string;
  user: {
    id: string;
    email?: string;
  };
};
