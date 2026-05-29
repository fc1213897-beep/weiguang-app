const auth = require("../../utils/auth.js");
const { setTabSelected } = require("../../utils/tab.js");

Page({
  data: {
    email: "",
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
