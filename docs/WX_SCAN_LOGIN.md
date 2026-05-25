# 微信扫码登录（PC 网页 + 小程序）

## 环境变量（`.env.local`）

```env
NEXT_PUBLIC_WX_APPID=你的小程序AppID
WX_APP_SECRET=你的小程序AppSecret
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=你的ServiceRole密钥

WX_MP_ENV_VERSION=develop
WX_MP_LOGIN_PAGE=pages/login/login
```

## 小程序工程

仓库内已提供可联调工程：`miniprogram/`（见 `miniprogram/README.md`）。

若你已有独立小程序项目，复制 `pages/login/*` 与 `utils/config.js` 即可。

## 本地 localhost:3000 联调

1. `.env.local` 配置如上，**重启** `npm run dev`
2. 微信开发者工具打开 `miniprogram` 目录，勾选 **不校验合法域名**
3. 浏览器 `http://localhost:3000/api/auth/wx/ping` → `ok: true`
4. `http://localhost:3000/settings` → 微信扫码登录 → 扫开发版小程序码
5. 小程序点 **允许登录** → `POST http://localhost:3000/api/auth/wx-callback`
6. 网页自动轮询到 `status=completed` 后完成登录

## 闭环流程

```
PC  POST /api/auth/wx/qrcode     → scene + 小程序码
小程序 onLoad(options.scene)    → 展示 scene
小程序 handleWxLogin            → wx.login → code
小程序 POST /api/auth/wx-callback → code+scene → openid → DB status=completed
PC  轮询 Supabase               → completed
PC  POST /api/auth/wx/exchange  → setSession 登录
```

**注意**：数据库 `status` 必须为 **`completed`**（不是 `confirmed`）。

## API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/auth/wx/ping` | 自检 AccessToken |
| POST | `/api/auth/wx/qrcode` | 生成 scene + 小程序码 |
| POST | `/api/auth/wx-callback` | 小程序提交 code+scene，写 openid |
| POST | `/api/auth/wx/exchange` | 网页兑换 Session |

## 真机调试

修改 `miniprogram/utils/config.js` 中 `API_BASE` 为电脑局域网 IP，例如 `http://192.168.1.100:3000`。
