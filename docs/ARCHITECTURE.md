# 微光 Weiguang · V1 架构设计文档

> 版本：V1  
> 目标：从 Demo 型单页应用，升级为可长期维护的 AI 学习陪伴产品  
> 技术栈：Next.js 16 · React 19 · Zustand · Tailwind CSS 4 · localStorage（V1）→ Supabase（预留）

---

## 1. 系统架构图（文字版）

```
┌─────────────────────────────────────────────────────────────────┐
│                         用户浏览器                               │
├─────────────────────────────────────────────────────────────────┤
│  app/page.tsx（入口）                                            │
│    ├─ useTodoHydration / useChatHydration（持久化副作用）          │
│    └─ AppShell（三栏布局组装）                                    │
├──────────────┬──────────────────────┬───────────────────────────┤
│  Companion   │  Todo 工作台          │  AI Chat                  │
│  品牌/小光    │  日历/任务/统计        │  对话 UI                   │
│  今日进度     │                       │                           │
├──────────────┴──────────────────────┴───────────────────────────┤
│  Zustand Store Layer                                             │
│    todoStore │ chatStore │ uiStore                               │
├─────────────────────────────────────────────────────────────────┤
│  Domain / Utils                                                  │
│    task-utils │ time-greeting │ fallback-reply │ tokens           │
├─────────────────────────────────────────────────────────────────┤
│  Persistence (V1)          │  API (V1)                          │
│    localStorage            │    POST /api/chat → 千问 + 兜底     │
│    weiguang-tasks          │    lib/xiaoguang-prompt             │
│    weiguang-ai-chat        │                                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                    （V2 预留）Supabase
                    Auth · Postgres · Realtime · Edge Functions
```

**分层原则**

| 层 | 职责 | 禁止事项 |
|----|------|----------|
| `app/` | 路由入口、全局 hydration 挂载 | 不写业务 UI 与 CRUD |
| `components/*` | 展示与局部交互 | 不直接读写 localStorage |
| `store/` | 客户端状态与动作 | 不依赖 React 组件 |
| `hooks/` | 副作用（持久化、派生） | 不渲染 UI |
| `lib/` | 纯函数、API 封装、设计令牌 | 不持有可变全局状态 |
| `types/` | 领域类型契约 | 无运行时逻辑 |

---

## 2. 前端模块结构

```
weiguang-app/
├── app/
│   ├── page.tsx              # 入口：hydration + <AppShell />
│   ├── layout.tsx
│   └── api/chat/route.ts     # AI 对话 BFF（未纳入本次前端模块化）
│
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx      # 三栏 / 手机 Tab 总布局
│   │   └── MobileTabNav.tsx
│   ├── todo/
│   │   ├── TaskPanel.tsx     # 任务主栏组装
│   │   ├── TodoCalendar.tsx
│   │   ├── TaskList.tsx / TaskCard.tsx / TaskInput.tsx
│   │   └── TaskStats.tsx
│   ├── chat/
│   │   ├── ChatPanel.tsx
│   │   └── AIChat.tsx
│   ├── companion/
│   │   ├── CompanionRail.tsx
│   │   ├── XiaoguangAvatar.tsx
│   │   ├── TimeGreeting.tsx
│   │   └── CharacterModal.tsx
│   └── ui/
│       ├── card.tsx / button.tsx / section.tsx
│       └── motion-styles.tsx
│
├── store/                    # Zustand
├── hooks/                    # 持久化 + selectors
├── types/                    # 领域类型
├── lib/                      # storage · tokens · task-utils · 问候/兜底
└── docs/
    └── ARCHITECTURE.md       # 本文档
```

**兼容层**：根目录 `components/TaskCard.tsx` 等仍为 **re-export**，便于渐进迁移与旧路径引用。

---

## 3. Zustand 状态结构

### 3.1 `todoStore`

| 字段 | 类型 | 说明 |
|------|------|------|
| `selectedDate` | `string` | 当前选中日期 `YYYY-MM-DD` |
| `tasks` | `TaskItem[]` | 全量任务列表 |
| `taskDraft` | `string` | 输入框草稿 |
| `storageReady` | `boolean` | 已完成 localStorage 恢复，避免空写 |

| 动作 | 说明 |
|------|------|
| `setSelectedDate` | 切换日历日期 |
| `setTaskDraft` / `setTasks` / `setStorageReady` | 基础 setter |
| `addTask` | 向 `selectedDate` 追加任务 |
| `toggleTask` / `editTask` / `deleteTask` | 任务 CRUD |

### 3.2 `chatStore`

| 字段 | 类型 | 说明 |
|------|------|------|
| `messages` | `ChatMessage[]` | 会话消息 |
| `replyIndex` | `number` | 兜底回复轮换索引 |
| `nextId` | `number` | 下一条消息 id |
| `input` | `string` | 输入框 |
| `isSending` | `boolean` | 请求中（展示「正在思考」） |
| `storageReady` | `boolean` | 持久化就绪 |
| `fadeInAssistantId` | `number \| null` | 最新 AI 回复渐显标记 |

| 动作 | 说明 |
|------|------|
| `hydrate` | 从存储恢复 messages / replyIndex / nextId |
| `sendMessage` | 发用户消息 → `/api/chat` → 追加助手消息 |
| `setInput` / `setStorageReady` | 基础 setter |

### 3.3 `uiStore`

| 字段 | 类型 | 说明 |
|------|------|------|
| `mobileTab` | `"tasks" \| "chat" \| "me"` | 手机底部 Tab |

### 3.4 派生数据（`hooks/useTodoSelectors.ts`）

- `tasksForSelectedDate`：`filterTasksByDate(tasks, selectedDate)`
- `datesWithTasks`：有任务的日期 `Set<string>`

> **扩展建议**：V2 可将 selectors 迁入 `todoStore` 的 `createSelectors` 或拆 `store/todoSelectors.ts`，避免组件内重复 `useMemo`。

---

## 4. Todo 数据结构

**类型定义**：`types/task.ts`

```ts
type TaskItem = {
  id: string;      // UUID 或 fallback 生成
  text: string;    // 任务正文
  done: boolean;   // 完成状态
  date: string;    // 归属日期 YYYY-MM-DD
};
```

**存储形态（localStorage `weiguang-tasks`）**

```json
[
  { "id": "uuid", "text": "背50个单词", "done": false, "date": "2026-05-21" }
]
```

**工具链**：`lib/task-utils.ts`

- `normalizeTaskItems`：兼容旧数据（无 id/date 时自动补全）
- `filterTasksByDate` / `computeTaskStats` / 日历格子生成等

---

## 5. AIChat 数据结构

**类型定义**：`types/chat.ts`

```ts
type ChatMessage = {
  id: number;
  role: "user" | "assistant";
  text: string;
};

type AIChatStorage = {
  messages: ChatMessage[];
  replyIndex: number;   // 兜底轮换
  nextId: number;       // 自增 id 游标
};
```

**存储键**：`weiguang-ai-chat`

**请求流**：`chatStore.sendMessage` → `POST /api/chat`（body: `message` + `history`）→ 失败时 `lib/fallback-reply`

**UI 状态（不入库）**：`isSending`、`fadeInAssistantId`

---

## 6. Companion（小光）数据结构

Companion **无独立持久化 Store**，由以下模块组合：

| 模块 | 数据来源 | 说明 |
|------|----------|------|
| `XiaoguangAvatar` | — | 角色展示 + 呼吸动画 |
| `TimeGreeting` | `lib/time-greeting` | 时段随机问候（客户端随机） |
| `CompanionRail` | `todoStore` + selectors | 品牌 + 小光 + **今日进度**（TaskStats companion） |
| `CharacterModal` | `getWelcomeContent()` | `sessionStorage` 控制会话内仅展示一次 |
| `ChatPanel` / `AIChat` | `chatStore` | 对话能力 |

**sessionStorage**

- 键：`weiguang-welcome-seen`
- 值：`"1"` 表示本会话已看过欢迎弹窗

**后续可扩展为 `companionStore`**

```ts
// V2 预留示意
type CompanionState = {
  mood: "calm" | "encourage" | "rest";
  lastGreetingAt: string;
  personaVersion: string;
};
```

---

## 7. 页面数据流

```
用户打开 /
    │
    ▼
page.tsx
    ├─ useTodoHydration()
    │     └─ rAF → load weiguang-tasks → normalize → todoStore.setTasks
    │              → storageReady=true → 后续 tasks 变化自动 save
    │
    ├─ useChatHydration()
    │     └─ rAF → load weiguang-ai-chat → chatStore.hydrate
    │              → storageReady=true → 后续 messages 变化自动 save
    │
    └─ <AppShell />
            │
            ├─ 左栏 CompanionRail
            │     └─ 订阅 todoStore + useTodoSelectors（进度统计）
            │
            ├─ 中栏 TaskPanel
            │     ├─ TodoCalendar → setSelectedDate
            │     ├─ TaskInput → taskDraft / addTask
            │     └─ TaskList → toggle / edit / delete
            │
            └─ 右栏 ChatPanel → AIChat → sendMessage → /api/chat
```

**单向数据流**：UI 事件 → Store Action → State 更新 → 组件重渲染 → Hydration Hook 持久化。

---

## 8. localStorage 同步机制

| 键名 | 内容 | 读取时机 | 写入时机 |
|------|------|----------|----------|
| `weiguang-tasks` | `TaskItem[]` | `useTodoHydration` 挂载 | `tasks` 变化且 `storageReady` |
| `weiguang-ai-chat` | `AIChatStorage` | `useChatHydration` 挂载 | `messages/replyIndex/nextId` 变化且 `storageReady` |

**防竞态**：`storageReady` 为 `false` 时不写入，避免首屏用空数组覆盖已有数据。

**工具**：`lib/storage.ts` 的 `loadFromStorage` / `saveToStorage`（SSR 安全、静默失败）。

**迁移**：`normalizeTaskItems` 在读取层统一旧格式，无需用户手动清缓存。

---

## 9. 后续接 Supabase 的预留方案

### 9.1 推荐表结构（示意）

```sql
-- profiles（关联 auth.users）
profiles (id, display_name, timezone, created_at)

-- tasks
tasks (id, user_id, text, done, date, created_at, updated_at)

-- chat_messages
chat_messages (id, user_id, role, content, created_at, session_id)

-- companion_sessions（可选）
companion_sessions (id, user_id, mood, metadata jsonb)
```

### 9.2 迁移路径（渐进，不重写 UI）

```
Phase A  双写：Zustand 变更 → debounce → Supabase upsert
Phase B  启动时：Supabase pull → hydrate Store（冲突以 updated_at 为准）
Phase C  下线 localStorage 主存储，仅保留离线草稿缓存
Phase D  Realtime 订阅 tasks / messages（多设备同步）
```

### 9.3 代码落点建议

| 现状 | Supabase 后 |
|------|-------------|
| `hooks/useTodoHydration` | `hooks/useTodoSync` + `lib/supabase/tasks.ts` |
| `hooks/useChatHydration` | `hooks/useChatSync` + `lib/supabase/chat.ts` |
| `store/*` 动作 | 动作末尾调用 `repository` 层，Store 仍为 UI 单一数据源 |
| `/api/chat` | 可迁至 Edge Function，或保留 BFF 校验 JWT 后调模型 |

### 9.4 认证

- Supabase Auth（邮箱 / OAuth）→ `user_id` 注入 RLS 策略  
- 匿名游客模式可保留：本地 id + 登录后 `merge_tasks` 迁移函数

---

## 10. 手机端与桌面端布局策略

### 10.1 桌面端（`lg+`）三栏工作台

| 栏位 | 宽度策略 | 内容 |
|------|----------|------|
| 左 | `240px` 固定 | 品牌、小光、今日进度 |
| 中 | `1fr` 主视觉 | 学习计划、日历、任务列表 |
| 右 | `300–400px` | 小光陪伴聊天 |

- 左右栏 `sticky` + 最小高度 `calc(100vh - 4rem)`
- 统计**仅左栏**展示，避免与中栏重复

### 10.2 手机端（`< lg`）Tab 切换

| Tab | 路由 | 显示 |
|-----|------|------|
| `tasks` | `/today` | `MobileTaskView`（倒计时、任务列表、底部快捷添加条） |
| `chat` | `/chat` | `MobileChatView`（全屏 `ChatPanel`） |
| `me` | `/me` | `MobileMeView`（账号、备考、成长/记账二级入口） |

**二级页**（`/growth`、`/ledger`）：`MobileRouteView` 复用桌面视图，顶栏带「返回」至 `/me`，底 Tab 不高亮。

- 底部 `MobileTabNav` 固定 + `safe-area-inset-bottom`
- 今日页 `MobileQuickAddBar` 叠在 Tab 上方，高度常量见 `lib/layout.ts`
- 根容器 `overflow-x-hidden`、`min-w-0` 防止横向溢出
- 聊天区 `min-height` 使用 `MOBILE_CHAT_MIN_H`（`dvh` − 顶栏 − Tab）

**状态**：`uiStore.mobileTab` 与 URL 同步（`/today` `/chat` `/me`）。

---

## 11. 动画系统设计

**集中定义**：`components/ui/motion-styles.tsx` + `lib/tokens.ts`（`wgTokens.motion`）

| 类名 / 动画 | 用途 | 性能策略 |
|-------------|------|----------|
| `wg-page-in` | 页面进入渐显 | 仅 opacity + translateY |
| `wg-character-breathe` | 小光 🌙 呼吸 | `transform: scale`，4s 循环 |
| `wg-panel-card` / `wg-inner-card` | 卡片 hover 上浮阴影 | 仅 `(hover: hover)` 桌面生效 |
| `wg-msg-fade-in` | AI 新回复渐显 | 仅最新一条 assistant |
| `wg-thinking-dot` | 正在思考省略号 | 低频率 opacity 脉冲 |

**原则**

1. 只动画 `transform` / `opacity`  
2. 尊重 `prefers-reduced-motion: reduce`  
3. 手机端避免大面积 `hover` 与过长 `box-shadow` 过渡  
4. 弹窗（`CharacterModal`）保留独立 `wg-modal-in` / `wg-glow-breathe`

---

## 12. 产品未来扩展路线（Roadmap）

### V1.0（当前）✅

- [x] Todo + 日历 + 按日归属  
- [x] AI 对话（API + 兜底）  
- [x] localStorage 持久化  
- [x] Zustand + 模块化目录  
- [x] 三栏桌面 / Tab 手机  
- [x] 设计令牌 + 基础 UI 组件  

### V1.1（短期维护）

- [ ] `repository` 抽象层，Store 与存储解耦  
- [ ] 路由级 Tab（`/tasks` `/chat`）+ 分享深链  
- [ ] 任务分类 / 标签（扩展 `TaskItem` 可选字段）  
- [ ] 聊天流式输出（SSE）  
- [ ] 单元测试：stores + task-utils  

### V1.5（陪伴深化）

- [ ] `companionStore`：情绪、连续打卡、陪伴语录池  
- [ ] 小光多状态形象（表情 / Lottie，非仅 emoji）  
- [ ] 今日总结：AI 根据完成任务生成日报  
- [ ] 专注模式（番茄钟 + 轻提示）  

### V2.0（平台化）

- [ ] Supabase Auth + Postgres + RLS  
- [ ] 多设备同步与冲突合并  
- [ ] 用户设置云同步（主题、问候偏好）  
- [ ] 管理后台 / 数据看板（可选）  

### V2.5+（产品化）

- [ ] 推送提醒（PWA / 邮件）  
- [ ] 备考计划模板市场  
- [ ] 多人自习室（Realtime presence）  
- [ ] 合规与内容安全审计链路  

---

## 附录：关键文件索引

|  Concern | 文件 |
|---------|------|
| 入口 | `app/page.tsx` |
| 布局 | `components/layout/AppShell.tsx` |
| Todo Store | `store/todoStore.ts` |
| Chat Store | `store/chatStore.ts` |
| 持久化 | `hooks/useTodoHydration.ts`, `hooks/useChatHydration.ts` |
| 类型 | `types/task.ts`, `types/chat.ts`, `types/ui.ts` |
| 设计令牌 | `lib/tokens.ts` |
| AI BFF | `app/api/chat/route.ts` |

---

*文档随代码演进更新；重大目录或 Store 变更时请同步修订本节与第 2、3 章。*
