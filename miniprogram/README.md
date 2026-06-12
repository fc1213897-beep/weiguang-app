# 微光小程序

与 PC 网页（`weiguanglife.top`）共用同一微信账号与 Supabase 数据。

## 功能

| Tab | 说明 |
|-----|------|
| 今日任务 | 查看/添加/完成打卡，与 PC 云端同步；展示小光今日建议条 |
| 记账 | 记一笔、日汇总、流水；结合待办给出混合建议 |
| 小光 | AI 聊天，支持自然语言记账（如「午饭 35」） |
| 我的 | 账号信息、帮 PC 扫码登录、退出；入口跳转成长/记账 |

## Web 与小程序能力地图（v0.2.1）

| 能力 | Web 路由 | 小程序 |
|------|----------|--------|
| 今日任务 | `/today` | Tab「今日任务」 |
| 小光聊天 | 桌面浮动 + 手机 Tab | Tab「小光」 |
| 记账 | `/ledger` | Tab「记账」 |
| 成长（概览/旅程/统计） | `/growth` | 我的 → 成长空间（Web 内嵌） |
| 备考倒计时 | `/me` 备考计划 | 我的 → 备考计划（Web 内嵌） |
| 账号 | `/me` | 我的 |

> 备考倒计时、成长统计详情等 **Web 优先** 配置；小程序侧重每日执行（任务/记账/聊天）。

## 配置

`utils/config.js`：

- **体验版 / 正式版 / 提审**：`API_BASE_PROD`（默认 `https://www.weiguanglife.top`），须与服务器 `NEXT_PUBLIC_APP_URL` 一致
- **开发版**：自动使用 `API_BASE_DEV`（默认 `http://127.0.0.1:3000`，本机 `npm run dev`），开发者工具需勾选「不校验合法域名」
- **真机调试**：修改 `config.js` 中 `API_BASE_LAN` 为电脑局域网 IP

提审前必须在微信公众平台配置 **request 合法域名** `www.weiguanglife.top`，且服务器已启用 HTTPS（见 `docs/服务器部署指南.md`）。  
若使用「成长空间 / 备考计划」Web 内嵌，还需配置 **业务域名** `www.weiguanglife.top`。

发版步骤见 [`RELEASE_CHECKLIST.md`](RELEASE_CHECKLIST.md)。

## 开发

1. 根目录配置 `.env.local`（含微信、Supabase）
2. 在 Supabase 执行 `supabase/sql/expenses_init.sql`（记账表）
3. 服务器或本地 `npm run dev` / `npm run start`
4. 微信开发者工具打开本目录 `miniprogram`
5. 详情 → 勾选「不校验合法域名」（**仅开发版**；体验版/提审必须 HTTPS + 后台合法域名）

## PC 扫码登录

「我的」→「帮电脑扫码登录」，或直接进入 `pages/login/login`（带 scene 参数）。

## API（小程序 BFF）

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/auth/wx/mp-login` | 小程序直接登录 |
| GET | `/api/mp/tasks?task_date=` | 任务列表 |
| POST | `/api/mp/tasks` | 新建任务 |
| PATCH | `/api/mp/tasks/:id` | 更新任务 |
| GET | `/api/mp/expenses?entry_date=` | 按日记账列表 |
| POST | `/api/mp/expenses` | 新建记账 |
| PATCH / DELETE | `/api/mp/expenses/:id` | 更新 / 删除 |
| POST | `/api/mp/daily-insight` | 待办 + 记账混合建议 |
| GET | `/api/mp/chat/messages` | 聊天记录 |
| POST | `/api/mp/chat/send` | 发送消息（含对话记账） |

请求头：`Authorization: Bearer <access_token>`
