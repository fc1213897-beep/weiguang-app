const auth = require("../../utils/auth.js");

Page({
  data: {
    email: "",
  },

  onShow() {
    auth
      .ensureLogin()
      .then((session) => {
        const email =
          (session && session.user && session.user.email) || "";
        this.setData({ email });
      })
      .catch(() => {
        this.setData({ email: "" });
      });
  },

  onLogout() {
    wx.showModal({
      title: "退出登录",
      content: "退出后需重新打开小程序登录",
      success: (res) => {
        if (!res.confirm) return;
        auth.clearSession();
        wx.showToast({ title: "已退出", icon: "success" });
        auth
          .ensureLogin()
          .then((session) => {
            const email =
              (session && session.user && session.user.email) || "";
            this.setData({ email });
          })
          .catch(() => {});
      },
    });
  },
});
