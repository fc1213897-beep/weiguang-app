const { apiBase } = require("../../utils/config.js");

Page({
  data: {
    scene: "",
    devSceneInput: "",
    loading: false,
    authorized: false,
  },

  /**
   * 扫 PC 端无限制小程序码进入时，scene 在 options.scene（不是 URL 的 ?scene=）
   */
  onLoad(options) {
    let scene = "";

    if (options.scene) {
      try {
        scene = decodeURIComponent(options.scene);
      } catch {
        scene = options.scene;
      }
    }

    this.setData({ scene });
  },

  onDevSceneInput(e) {
    this.setData({ devSceneInput: (e.detail && e.detail.value) || "" });
  },

  /** 开发调试：手动填入电脑端 qrcode 接口返回的 scene */
  applyDevScene() {
    const raw = (this.data.devSceneInput || "").trim();
    if (!raw) {
      wx.showToast({ title: "请先粘贴 scene", icon: "none" });
      return;
    }
    this.setData({ scene: raw });
    wx.showToast({ title: "已填入 scene", icon: "success" });
  },

  /** 绿色按钮：wx.login → 通知 Next.js 写入 openid */
  handleWxLogin() {
    const { scene, loading, authorized } = this.data;

    if (authorized) {
      wx.showToast({ title: "已授权", icon: "none" });
      return;
    }

    if (!scene) {
      wx.showToast({ title: "缺少 scene，请重新扫码", icon: "none" });
      return;
    }

    if (loading) return;

    this.setData({ loading: true });

    wx.login({
      success: (loginRes) => {
        if (!loginRes.code) {
          this.setData({ loading: false });
          wx.showToast({ title: "wx.login 失败", icon: "none" });
          return;
        }

        wx.request({
          url: `${apiBase}/api/auth/wx-callback`,
          method: "POST",
          header: { "Content-Type": "application/json" },
          data: {
            code: loginRes.code,
            scene,
          },
          success: (res) => {
            const body = res.data || {};
            if (res.statusCode >= 200 && res.statusCode < 300 && body.ok) {
              this.setData({ authorized: true, loading: false });
              wx.showToast({
                title: "授权成功",
                icon: "success",
                duration: 2000,
              });
              return;
            }

            this.setData({ loading: false });
            wx.showToast({
              title: body.error || `授权失败(${res.statusCode})`,
              icon: "none",
              duration: 3000,
            });
          },
          fail: (err) => {
            this.setData({ loading: false });
            wx.showToast({
              title:
                (err && err.errMsg) ||
                "网络失败，请确认 Next.js 已启动且勾选了不校验域名",
              icon: "none",
              duration: 3000,
            });
          },
        });
      },
      fail: () => {
        this.setData({ loading: false });
        wx.showToast({ title: "wx.login 调用失败", icon: "none" });
      },
    });
  },
});
