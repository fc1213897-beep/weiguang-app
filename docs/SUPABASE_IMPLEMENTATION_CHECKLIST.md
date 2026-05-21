# 微光 · Supabase 实施清单（MVP）

> 版本：V0.4  
> 依据：[DATABASE_DESIGN.md](./DATABASE_DESIGN.md) · [AUTH_PLAN.md](./AUTH_PLAN.md)  
> **本文档仅作执行清单，不修改现有业务代码。**  
> 实施时按顺序勾选；标 **👤** = 适合手动，**🤖** = 适合 Cursor 写代码，**👤+🤖** = 先手动后编码。

---

## 图例

| 标记 | 含义 |
|------|------|
| 👤 | 在 Supabase Dashboard / 本地配置中手动完成 |
| 🤖 | 在仓库中新增/修改代码（建议交给 Cursor） |
| 👤+🤖 | 手动准备环境 + 代码接入 |

**MVP 范围**：4 张表 + RLS + Magic Link + 登录后迁移 + Todo/Chat 双写同步。  
**MVP 不做**：Realtime、OAuth、强制登录、AI 长期记忆流水线。

---

## 总览进度

| # | 步骤 | 执行方 |
|---|------|--------|
| 1 | 创建 Supabase 项目 | 👤 |
| 2 | 获取 URL 与 anon key | 👤 |
| 3 | 配置环境变量 | 👤+🤖 |
| 4 | 执行 SQL 建表 | 👤 |
| 5 | 开启 RLS | 👤（含在 SQL 中） |
| 6 | 配置 Magic Link | 👤 |
| 7 | 本地接入 Supabase client | 🤖 |
| 8 | 登录状态读取 | 🤖 |
| 9 | 游客数据迁移 | 🤖 |
| 10 | Todo 云同步 | 🤖 |
| 11 | Chat 云同步 | 🤖 |

---

## 步骤 1：创建 Supabase 项目

| 项 | 内容 |
|----|------|
| **执行方** | 👤 |
| **目的** | 获得托管 Postgres + Auth，作为微光云端唯一后端。 |
| **操作位置** | [https://supabase.com/dashboard](https://supabase.com/dashboard) → **New project** |
| **建议操作** | 1. 选择组织；2. 项目名如 `weiguang`；3. 设置数据库密码（妥善保存）；4. 区域选离用户近的（如 `ap-southeast-1`）；5. 等待项目就绪（约 1–2 分钟）。 |
| **完成标志** | Dashboard 进入项目首页，左侧可见 **Table Editor**、**Authentication**、**SQL Editor**。 |

---

## 步骤 2：获取 URL 与 anon key

| 项 | 内容 |
|----|------|
| **执行方** | 👤 |
| **目的** | 浏览器端安全访问 Supabase（配合 RLS）；供 Next.js 环境变量使用。 |
| **操作位置** | Dashboard → **Project Settings**（齿轮）→ **API** |
| **需要复制的值** | 1. **Project URL**（`https://xxxx.supabase.co`）<br>2. **anon public** key（`eyJ...`，可暴露在前端）<br>3. （可选，仅服务端）**service_role** key — 存入 `.env.local`，**勿提交 Git** |
| **完成标志** | 已复制 URL + anon key 到本地备忘录；确认 **service_role** 未写入任何客户端代码。 |

---

## 步骤 3：配置环境变量

| 项 | 内容 |
|----|------|
| **执行方** | 👤+🤖 |
| **目的** | 本地开发与部署能连接正确 Supabase 项目。 |
| **操作位置** | 仓库根目录 `.env.local`（👤 创建）；`.env.example`（🤖 可新增模板，不含真实 key） |
| **变量清单** | ```env<br>NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co<br>NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...<br># 仅服务端，可选（迁移脚本 / BFF 写库）<br>SUPABASE_SERVICE_ROLE_KEY=eyJ...<br>``` |
| **建议操作** | 1. 确认 `.gitignore` 已忽略 `.env.local`；2. `npm run dev` 前重启 dev server 使变量生效。 |
| **完成标志** | 本地 `process.env.NEXT_PUBLIC_SUPABASE_URL` 有值；`npm run dev` 无环境变量相关报错。 |

---

## 步骤 4：执行 SQL 建表

| 项 | 内容 |
|----|------|
| **执行方** | 👤 |
| **目的** | 创建 `profiles`、`tasks`、`chat_sessions`、`messages` 及索引、触发器。 |
| **操作位置** | Dashboard → **SQL Editor** → New query |
| **SQL 来源** | [DATABASE_DESIGN.md §13](./DATABASE_DESIGN.md#13-推荐-sql-建表语句)（整段粘贴执行） |
| **建议操作** | 1. 先执行建表 + 索引 + `set_updated_at` 触发器；2. 再执行 **`handle_new_user`** 触发器（新用户自动写 `profiles`）；3. Table Editor 中能看到 4 张表。 |
| **完成标志** | 4 表均存在且无 SQL 报错；`profiles.id` 外键指向 `auth.users`。 |

---

## 步骤 5：开启 RLS

| 项 | 内容 |
|----|------|
| **执行方** | 👤 |
| **目的** | 用户只能读写自己的数据；即使 anon key 泄露也无法越权读他人行。 |
| **操作位置** | 同上 SQL Editor — DATABASE_DESIGN §13 后半段 **RLS** 与 **POLICY**；或 **Authentication → Policies** 核对 |
| **策略清单** | `profiles`：select/update/insert own<br>`tasks`：select/insert/update/delete own<br>`chat_sessions`：all own<br>`messages`：select/insert own + session 归属校验 |
| **验证（建议）** | 👤 手动：注册两个测试邮箱 → Table Editor 各只能看到自己的 `tasks`（或用 SQL 以不同 JWT 测，MVP 可简化为「两账号互不可见」目测）。 |
| **完成标志** | 4 表 **RLS enabled**；Policies 列表与文档一致；测试账号 A 无法看到账号 B 的 `tasks`。 |

---

## 步骤 6：配置 Magic Link

| 项 | 内容 |
|----|------|
| **执行方** | 👤 |
| **目的** | 邮箱无密码登录；邮件链接能回到微光并完成 Session。 |
| **操作位置** | Dashboard → **Authentication** → **Providers** → **Email** |
| **建议配置** | | 配置项 | MVP 建议 |
| |--------|----------|
| | Enable Email provider | 开启 |
| | Confirm email | 可关闭（Magic Link 即登录） |
| | Secure email change | 按需 |
| **URL 配置** | **Authentication → URL Configuration** | |
| | Site URL | `http://localhost:3000`（开发）/ 生产域名 |
| | Redirect URLs | `http://localhost:3000/auth/callback`、生产 `https://你的域名/auth/callback` |
| **邮件模板（可选）** | **Authentication → Email Templates** → Magic Link，标题改为「微光登录链接」 |
| **完成标志** | 用测试邮箱在应用中触发 `signInWithOtp` 后（步骤 8 后联调），能收到邮件且点击后跳转到 `/auth/callback` 并成功登录。 |

> 步骤 6 可与步骤 7–8 并行准备；**完整联调**依赖步骤 8 的回调路由。

---

## 步骤 7：本地接入 Supabase client

| 项 | 内容 |
|----|------|
| **执行方** | 🤖 |
| **目的** | 浏览器与 Server 均能创建带 Cookie 的 Supabase 客户端。 |
| **操作位置（建议新增文件）** | `lib/supabase/client.ts`（浏览器）<br>`lib/supabase/server.ts`（Server Components / Route Handlers）<br>可选：`middleware.ts` + `lib/supabase/middleware.ts`（刷新 Session） |
| **依赖** | `npm install @supabase/supabase-js @supabase/ssr` |
| **约束** | 仅使用 `NEXT_PUBLIC_*` 在客户端；**禁止**在前端引用 `SERVICE_ROLE_KEY`。 |
| **完成标志** | 开发环境能 `import { createClient } from '@/lib/supabase/client'` 且无类型错误；`npm run build` 通过。 |

---

## 步骤 8：登录状态读取

| 项 | 内容 |
|----|------|
| **执行方** | 🤖 |
| **目的** | 区分游客 / 已登录；Magic Link 回调后建立 Session；为迁移与同步提供 `user.id`。 |
| **操作位置（建议）** | `app/auth/callback/route.ts` — `exchangeCodeForSession`<br>`hooks/useAuth.ts` — `getSession()` + `onAuthStateChange`<br>`components/auth/LoginPanel.tsx`（或设置页入口）— `signInWithOtp`<br>可选：`app/auth/login/page.tsx` |
| **行为要点** | 见 [AUTH_PLAN.md §6–§8](./AUTH_PLAN.md#6-登录流程magic-link) |
| **完成标志** | 1. 输入邮箱 → 收到 Magic Link；2. 点击链接 → 回应用且 `useAuth` 为 `authenticated`；3. 刷新页面 Session 仍在；4. **游客不登录**时仍为 `guest`，现有 Todo/Chat 正常。 |

---

## 步骤 9：游客数据迁移

| 项 | 内容 |
|----|------|
| **执行方** | 🤖 |
| **目的** | 首次登录将 `weiguang-tasks`、`weiguang-ai-chat` 一次性写入云端，不丢本地数据。 |
| **操作位置（建议）** | `lib/migration/importLocalData.ts` — 纯函数<br>`hooks/useMigration.ts` — 登录后触发<br>localStorage 标记：`weiguang-migrated-at`、`weiguang-migrated-user-id` |
| **数据映射** | 见 DATABASE_DESIGN 附录 A；`client_id` / `client_seq` 去重 |
| **UI** | 迁移中 loading；成功 Toast；失败可重试 |
| **完成标志** | 1. 游客阶段创建任务与聊天；2. 登录后 Supabase Table Editor 可见对应 `tasks` / `messages`；3. 再次登录同一账号 **不重复插入**；4. 标记键已写入。 |

---

## 步骤 10：Todo 云同步

| 项 | 内容 |
|----|------|
| **执行方** | 🤖 |
| **目的** | 登录后任务以云端为准；增删改 debounce 写库；冷启动 pull；PC/手机同账号见同一批任务。 |
| **操作位置（建议）** | `lib/repositories/tasks.ts` — list / upsert / softDelete<br>`hooks/useTodoSync.ts` — 登录后替代/并行 `useTodoHydration`<br>`app/page.tsx` 或 `AppShell` — 按 auth 状态挂载 hydration vs sync |
| **规则** | 游客：仅 `useTodoHydration`；已登录：pull → Store → debounce upsert；冲突 `updated_at` 较新者胜（见 DATABASE_DESIGN §11） |
| **完成标志** | 1. 登录用户新增/完成/删除任务，Dashboard `tasks` 表同步更新；2. 另一浏览器同邮箱登录可见相同任务；3. 游客路径未回归。 |

---

## 步骤 11：Chat 云同步

| 项 | 内容 |
|----|------|
| **执行方** | 🤖 |
| **目的** | 登录后聊天记录上云；默认 `chat_sessions.is_default`；多端共享与小光对话历史。 |
| **操作位置（建议）** | `lib/repositories/chat.ts` — session + messages<br>`hooks/useChatSync.ts` — 登录后并行 `useChatHydration`<br>可选：`app/api/chat/route.ts` — 校验 JWT 后写入 `messages`（MVP 可二期） |
| **规则** | 迁移阶段已导入历史；日常发送后 insert `messages`；`reply_index` 写回 session |
| **完成标志** | 1. 登录后发消息，`messages` 表有记录；2. 换设备登录同账号可拉取历史；3. 游客仍只写 localStorage，AI 对话功能不破坏。 |

---

## MVP 完成后可选（不纳入本次必做）

| 项 | 执行方 | 说明 |
|----|--------|------|
| Realtime 订阅 `tasks` | 🤖 | 多端近实时，见 DATABASE_DESIGN §11-D |
| `/api/chat` 强制 JWT | 🤖 | AUTH_PLAN §11.4 V0.5 |
| `.env.example` + README 部署说明 | 🤖 |
| 生产 Supabase Redirect URL | 👤 |

---

## 联调验收（端到端）

按顺序自测一遍，全部通过即 MVP 上线 Supabase 就绪：

| # | 场景 | 预期 |
|---|------|------|
| A | 未登录使用 Todo + AI | 仅 localStorage，与现网一致 |
| B | Magic Link 登录 | Session 有效，`profiles` 有行 |
| C | 登录后迁移 | 本地任务/聊天出现在 Supabase |
| D | 登录后改任务 | `tasks.updated_at` 变化 |
| E | 另一设备同邮箱登录 | 看到 D 的任务与聊天 |
| F | 退出登录 | 回到游客；云端数据仍在 |
| G | `npm run build` | 通过 |

---

## 与文档的对应关系

| 清单步骤 | 设计文档章节 |
|----------|----------------|
| 4–5 | DATABASE_DESIGN §13、§10 |
| 6、8 | AUTH_PLAN §3、§6、§11 |
| 9 | DATABASE_DESIGN §9、AUTH_PLAN §7 |
| 10–11 | DATABASE_DESIGN §11、§14 步 5–10 |

---

## 维护说明

- 建表 SQL 变更时，先改 `DATABASE_DESIGN.md` §13，再更新本清单步骤 4–5 的引用说明。
- 实施代码阶段再改业务文件；**本清单文件本身不触发代码修改。**

---

*微光 · 温柔陪伴你的学习与小目标*
