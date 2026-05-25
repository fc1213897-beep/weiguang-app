# 微光小程序扫码登录

与仓库根目录 Next.js 项目联调。若你已在微信开发者工具里建了项目，可将本目录下 `pages/login/*` 和 `utils/config.js` 复制到你的小程序工程中。

## 直接点「编译」出现「未获取 scene」？

这是**正常的**。`scene` 只有扫 **电脑网页生成的小程序码** 时才会带到 `onLoad(options.scene)`。

请按顺序操作：

1. 电脑 `npm run dev`，打开 http://localhost:3000/settings → 微信扫码登录（先出码）
2. 微信开发者工具：**预览 / 真机扫电脑上的码**，或模拟器里用扫码功能扫该码
3. **不要**只点顶部「编译」进登录页（那样没有 scene）

开发调试：电脑出码后，在网页黄色调试区或接口响应里复制 `scene`，粘贴到登录页底部「开发调试」输入框 → 点「填入 scene」。

也可在开发者工具：「普通编译」旁 ▼ → **添加编译模式** → 启动页面 `pages/login/login`，启动参数填 `scene=你从电脑复制的值`。

## 使用步骤

1. 根目录 `.env.local` 增加：
   ```env
   WX_MP_ENV_VERSION=develop
   WX_MP_LOGIN_PAGE=pages/login/login
   ```
2. 根目录执行 `npm run dev`（默认 http://localhost:3000）
3. 用微信开发者工具打开 **本目录** `miniprogram`（或合并到你的工程）
4. 详情 → 本地设置 → 勾选 **不校验合法域名、web-view、TLS**
5. 浏览器打开 http://localhost:3000/settings → 微信扫码登录 → 用手机/模拟器扫开发版码
6. 在小程序页点击 **允许登录**

## 真机调试

修改 `utils/config.js` 的 `API_BASE` 为电脑局域网 IP，例如 `http://192.168.1.100:3000`。
