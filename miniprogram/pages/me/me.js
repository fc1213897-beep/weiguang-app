const auth = require("../../utils/auth.js");
const { APP_VERSION, getWebBase } = require("../../utils/config.js");
const { setTabSelected } = require("../../utils/tab.js");

Page({
  data: {
    email: "",
    version: APP_VERSION,
  },

  onShow() {
    setTabSelected(this, 3);
    if (!auth.hasValidSession()) {
      auth.redirectToLogin();
      return;
    }
    const session = auth.getSession();
    const email = (session && session.user && session.user.email) || "";
    this.setData({ email });
  },

  onOpenGrowth() {
    wx.navigateTo({
      url: `/pages/webview/webview?path=${encodeURIComponent("/growth")}&title=${encodeURIComponent("成长空间")}`,
    });
  },

  onOpenExamPlan() {
    wx.navigateTo({
      url: `/pages/webview/webview?path=${encodeURIComponent("/me")}&title=${encodeURIComponent("备考计划")}`,
    });
  },

  onCopyWebHome() {
    const url = getWebBase();
    wx.setClipboardData({
      data: url,
      success: () => {
        wx.showToast({ title: "链接已复制", icon: "success" });
      },
    });
  },

  onLogout() {
    wx.showModal({
      title: "退出登录",
      content: "退出后需重新登录才能使用任务与小光",
      success: (res) => {
        if (!res.confirm) return;
        auth.clearSession();
        wx.showToast({ title: "已退出", icon: "success" });
        setTimeout(() => {
          auth.redirectToLogin();
        }, 400);
      },
    });
  },
});
