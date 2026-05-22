# 项目结构与技术栈分析（2026-05-22）

## 技术栈（当前）
- 框架：Next.js 16.2.6（App Router）
- UI：React 19.2.4 + Tailwind CSS 4
- 语言：TypeScript 5
- 状态管理：Zustand 5
- 后端能力：Next.js Route Handlers（`app/api/chat/route.ts`）
- 数据层：当前 localStorage + 预埋 Supabase（`@supabase/ssr`、`@supabase/supabase-js`）
- 质量工具：ESLint 9 + `eslint-config-next`

## 目录职责（按层）
- `app/`：路由与页面入口，以及 API 路由。
- `components/`：业务 UI 组件，已按 `layout` / `todo` / `chat` / `companion` / `ui` 分层。
- `store/`：Zustand 状态（todo/chat/ui）。
- `hooks/`：hydration、sync、selector 等副作用与派生逻辑。
- `lib/`：纯工具、令牌、提示词、Supabase 客户端封装。
- `types/`：领域类型（task/chat/ui/database）。
- `docs/`：架构、数据库、实施清单。
- `supabase/sql/`：初始化 SQL。

## 可优化点（优先级）
1. **清理重复与兼容层**：当前根目录组件与 `components/todo`、`components/companion` 有并存与 re-export 迹象，建议逐步移除旧路径，统一 import 入口。
2. **数据访问抽象化**：将 store 内部与持久化细节进一步解耦，落地 repository 层（文档已有方向），降低未来 Supabase 全量切换风险。
3. **完善测试体系**：补充 store、`lib/task-utils`、关键 hooks 的单测；对 chat API 增加最小集成测试。
4. **性能优化**：
   - 减少不必要重渲染（细化 selector、浅比较）。
   - 将重计算派生（统计、映射）收敛到 memoized selectors。
5. **配置治理**：补充 `env` 校验（如 zod schema）和运行时缺失提示，避免部署时隐性失败。
6. **可观测性与错误处理**：为 API 与 sync 增加结构化日志、错误分级与回退策略可视化。
7. **一致性改进**：统一命名与目录（例如移动端/桌面端组件命名规范），减少新成员上手成本。

## 结论
项目主体分层已经比较清晰，且未来向 Supabase 演进路径在文档中定义充分。下一阶段最有价值的是：**去重 + repository 抽象 + 测试补齐**。
