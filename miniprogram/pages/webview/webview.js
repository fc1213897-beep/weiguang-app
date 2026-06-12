const { getWebBase } = require("../../utils/config.js");

Page({
  data: {
    url: "",
    pageTitle: "微光",
  },

  onLoad(options) {
    const path = options.path || "/growth";
    const safePath = path.startsWith("/") ? path : `/${path}`;
    const title = options.title ? decodeURIComponent(options.title) : "微光";
    const url = `${getWebBase()}${safePath}`;

    wx.setNavigationBarTitle({ title });
    this.setData({ url, pageTitle: title });
  },

  onWebError() {
    const { url } = this.data;
    wx.showModal({
      title: "网页打开失败",
      content:
        "请确认微信后台已配置业务域名 www.weiguanglife.top，或复制链接到浏览器打开。",
      confirmText: "复制链接",
      cancelText: "返回",
      success: (res) => {
        if (res.confirm) {
          wx.setClipboardData({
            data: url,
            success: () => {
              wx.showToast({ title: "链接已复制", icon: "success" });
            },
          });
          return;
        }
        wx.navigateBack();
      },
    });
  },
});
