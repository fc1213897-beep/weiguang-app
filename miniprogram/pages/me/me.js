const auth = require("../../utils/auth.js");
const { setTabSelected } = require("../../utils/tab.js");

Page({
  data: {
    email: "",
  },

  onShow() {
    setTabSelected(this, 2);
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
        setTimeout(() => {
          auth
            .ensureLogin()
            .then((session) => {
              const email =
                (session && session.user && session.user.email) || "";
              this.setData({ email });
            })
            .catch(() => {});
        }, 500);
      },
    });
  },
});
