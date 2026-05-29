const auth = require("../../utils/auth.js");

Page({
  data: {
    /** mp：小程序一键登录；scan：PC 扫码授权 */
    mode: "mp",
    scene: "",
    devSceneInput: "",
    scanLoading: false,
    scanAuthorized: false,
    mpLoading: false,
    mpError: "",
    showPcHelp: false,
  },

  onLoad(options) {
    let scene = "";

    if (options.scene) {
      try {
        scene = decodeURIComponent(options.scene);
      } catch {
        scene = options.scene;
      }
    }

    if (scene) {
      this.setData({ mode: "scan", scene });
      return;
    }

    if (auth.hasValidSession()) {
      wx.switchTab({ url: "/pages/tasks/tasks" });
      return;
    }

    this.setData({
      mode: "mp",
      showPcHelp: options.hint === "pc",
    });
  },

  onShowPcHelp() {
    this.setData({ showPcHelp: true });
  },

  onDevSceneInput(e) {
    this.setData({ devSceneInput: (e.detail && e.detail.value) || "" });
  },

  applyDevScene() {
    const raw = (this.data.devSceneInput || "").trim();
    if (!raw) {
      wx.showToast({ title: "请先粘贴 scene", icon: "none" });
      return;
    }
    this.setData({ mode: "scan", scene: raw });
    wx.showToast({ title: "已切换扫码模式", icon: "success" });
  },

  /** 小程序一键登录 */
  onMpLogin() {
    if (this.data.mpLoading) return;

    this.setData({ mpLoading: true, mpError: "" });

    auth
      .loginWithMp()
      .then(() => {
        this.setData({ mpLoading: false });
        wx.showToast({ title: "登录成功", icon: "success" });
        setTimeout(() => {
          wx.switchTab({ url: "/pages/tasks/tasks" });
        }, 400);
      })
      .catch((err) => {
        this.setData({
          mpLoading: false,
          mpError: err.message || "登录失败",
        });
      });
  },

  /** PC 扫码：wx.login → wx-callback */
  handleScanLogin() {
    const { scene, scanLoading, scanAuthorized } = this.data;

    if (scanAuthorized) {
      wx.showToast({ title: "已授权", icon: "none" });
      return;
    }

    if (!scene) {
      wx.showToast({ title: "缺少 scene，请重新扫码", icon: "none" });
      return;
    }

    if (scanLoading) return;

    this.setData({ scanLoading: true });

    const { getApiBase } = require("../../utils/config.js");

    wx.login({
      success: (loginRes) => {
        if (!loginRes.code) {
          this.setData({ scanLoading: false });
          wx.showToast({ title: "wx.login 失败", icon: "none" });
          return;
        }

        wx.request({
          url: `${getApiBase()}/api/auth/wx-callback`,
          method: "POST",
          header: { "Content-Type": "application/json" },
          data: { code: loginRes.code, scene },
          success: (res) => {
            const body = res.data || {};
            if (res.statusCode >= 200 && res.statusCode < 300 && body.ok) {
              this.setData({ scanAuthorized: true, scanLoading: false });
              wx.showToast({
                title: "授权成功",
                icon: "success",
                duration: 2000,
              });
              return;
            }

            this.setData({ scanLoading: false });
            wx.showToast({
              title: body.error || `授权失败(${res.statusCode})`,
              icon: "none",
              duration: 3000,
            });
          },
          fail: (err) => {
            this.setData({ scanLoading: false });
            wx.showToast({
              title: (err && err.errMsg) || "网络失败",
              icon: "none",
              duration: 3000,
            });
          },
        });
      },
      fail: () => {
        this.setData({ scanLoading: false });
        wx.showToast({ title: "wx.login 调用失败", icon: "none" });
      },
    });
  },
});
