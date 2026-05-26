# 微光小程序

与 PC 网页（`weiguanglife.top`）共用同一微信账号与 Supabase 数据。

## 功能

| Tab | 说明 |
|-----|------|
| 今日任务 | 查看/添加/完成打卡，与 PC 云端同步 |
| 小光 | AI 聊天，消息写入云端，与 PC 同步 |
| 我的 | 账号信息、帮 PC 扫码登录、退出 |

打开小程序会自动 `wx.login` 登录，无需再扫 PC 码。

## 配置

`utils/config.js` 中的 `API_BASE` 须与服务器 `NEXT_PUBLIC_APP_URL` 一致。

## 开发

1. 根目录配置 `.env.local`（含微信、Supabase）
2. 服务器或本地 `npm run dev` / `npm run start`
3. 微信开发者工具打开本目录 `miniprogram`
4. 详情 → 勾选「不校验合法域名」（仅开发；正式须 HTTPS + 配置合法域名）

## PC 扫码登录

「我的」→「帮电脑扫码登录」，或直接进入 `pages/login/login`（带 scene 参数）。

## API（小程序 BFF）

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/auth/wx/mp-login` | 小程序直接登录 |
| GET | `/api/mp/tasks?task_date=` | 任务列表 |
| POST | `/api/mp/tasks` | 新建任务 |
| PATCH | `/api/mp/tasks/:id` | 更新任务 |
| GET | `/api/mp/chat/messages` | 聊天记录 |
| POST | `/api/mp/chat/send` | 发送消息 |

请求头：`Authorization: Bearer <access_token>`
