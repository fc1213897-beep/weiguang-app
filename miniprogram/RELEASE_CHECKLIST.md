# 微光小程序 · 发版清单（v0.2.1）

> 发版前请逐项勾选。AppID：`wx3a960e108120a74a`

---

## 一、服务器端（必须先完成）

- [ ] 服务器 `git pull` 到包含本版本的最新代码
- [ ] `npm install`（`package.json` 有变化时）
- [ ] `npm run build` 编译成功
- [ ] `pm2 restart weiguang-app` 重启服务
- [ ] 自检接口：`curl -I https://www.weiguanglife.top/api/auth/wx/ping` 返回 200

### 环境变量（服务器 `.env`）

| 变量 | 说明 |
|------|------|
| `NEXT_PUBLIC_APP_URL` | `https://www.weiguanglife.top` |
| `NEXT_PUBLIC_WX_APPID` | `wx3a960e108120a74a`（与小程序一致） |
| `WX_APP_SECRET` | 微信公众平台 AppSecret |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | 服务端写库 / 微信登录 |
| `DASHSCOPE_API_KEY` | 小光 AI（缺失则聊天失败） |
| `WX_MP_LOGIN_PAGE` | `pages/login/login` |
| `WX_MP_ENV_VERSION` | 本地开发 `develop`；体验版 `trial`；正式版 `release` |

### Supabase SQL（首次部署确认已执行）

- [ ] `supabase/sql/wx_login_init.sql`
- [ ] `supabase/sql/tasks_init.sql`
- [ ] `supabase/sql/chat_init.sql`
- [ ] `supabase/sql/expenses_init.sql`
- [ ] `supabase/sql/auth_lookup_rpc.sql`

---

## 二、微信公众平台配置

登录 [微信公众平台](https://mp.weixin.qq.com) → 开发 → 开发管理 → 开发设置：

- [ ] **request 合法域名**：`www.weiguanglife.top`
- [ ] **业务域名**（Web 内嵌页需要）：`www.weiguanglife.top`  
  - 下载校验文件放到网站根目录
  - 「我的 → 成长空间 / 备考计划」依赖此项
- [ ] AppID 与服务器 `NEXT_PUBLIC_WX_APPID` 一致
- [ ] 小程序类目、简介、头像已填写（提审必填）

---

## 三、小程序本地检查

打开微信开发者工具，目录选 `miniprogram/`：

- [ ] `utils/config.js` 中 `API_BASE_PROD` = `https://www.weiguanglife.top`
- [ ] `project.config.json` 中 AppID = `wx3a960e108120a74a`
- [ ] 编译无报错，Tab 四页正常显示

### 真机自测流程

1. [ ] 微信一键登录成功
2. [ ] 今日任务：添加 / 完成 / 删除
3. [ ] 记账：记一笔 / 删除
4. [ ] 小光：发送消息并收到回复
5. [ ] 我的 → 成长空间（Web 内嵌或复制链接）
6. [ ] 我的 → 备考计划
7. [ ] 我的 → 帮电脑扫码登录（PC 端生成码 → 手机授权）
8. [ ] 退出登录 → 重新登录
9. [ ] 与 PC 网页同一账号数据同步

---

## 四、上传与提审

1. 开发者工具 → **上传**（版本号建议 `0.2.1`，备注写本次改动摘要）
2. 公众平台 → 版本管理 → 选为**体验版**，邀请测试
3. 体验版真机再跑一遍第三节自测
4. 提交审核（填写功能说明、测试账号如有需要）
5. 审核通过后发布

### 提审说明参考

> 微光是一款学习陪伴工具。用户可管理每日任务、记录收支、与 AI 助手「小光」对话。登录后可与 PC 网页数据同步。成长统计与备考计划在 Web 页查看。

---

## 五、常见问题

| 现象 | 排查 |
|------|------|
| `url not in domain list` | 检查 HTTPS、微信 request 合法域名、重新上传 |
| 登录 404 | 服务器未部署 `api/auth/wx/mp-login`，需 build + restart |
| 小光无回复 | 检查 `DASHSCOPE_API_KEY` |
| Web 内嵌白屏 | 检查业务域名校验文件、Nginx 443 |
| 扫码登录失败 | AppID 不一致或 `WX_MP_LOGIN_PAGE` 路径错误 |

---

## 六、本版本改动摘要（v0.2.1）

- 「我的」页新增成长空间、备考计划 Web 入口
- 新增 `pages/webview/webview` 内嵌网页页
- 统一 AppID 文档、开启代码压缩
- 版本号升至 0.2.1
