const auth = require("../../utils/auth.js");
const { APP_VERSION, getWebBase } = require("../../utils/config.js");
const { request } = require("../../utils/request.js");
const { setTabSelected } = require("../../utils/tab.js");

Page({
  data: {
    email: "",
    loggedIn: false,
    version: APP_VERSION,
    remindEnabled: false,
    instantOnAdd: false,
    remindTime: "08:00",
    tmplDaily: "",
    tmplTaskAdded: "",
    notifyLoading: false,
  },

  onShow() {
    setTabSelected(this, 3);
    auth.ensureSession().then((session) => {
      const loggedIn = !!session;
      const email = (session && session.user && session.user.email) || "";
      this.setData({ loggedIn, email });

      if (loggedIn) {
        this.loadNotifyPrefs();
        this.loadSubscribeConfig();
      }
    });
  },

  loadSubscribeConfig() {
    request({ url: "/api/mp/subscribe-config", method: "GET" })
      .then((res) => {
        const body = res.data || {};
        if (res.statusCode >= 200 && res.statusCode < 300) {
          this.setData({
            tmplDaily: body.daily || "",
            tmplTaskAdded: body.task_added || "",
          });
        }
      })
      .catch(() => {});
  },

  loadNotifyPrefs() {
    request({ url: "/api/mp/notification-prefs", method: "GET" })
      .then((res) => {
        const body = res.data || {};
        if (res.statusCode >= 200 && res.statusCode < 300 && body.prefs) {
          this.setData({
            remindEnabled: !!body.prefs.remind_enabled,
            instantOnAdd: !!body.prefs.instant_on_add,
            remindTime: body.prefs.remind_time || "08:00",
          });
        }
      })
      .catch(() => {});
  },

  saveNotifyPrefs(patch) {
    return request({
      url: "/api/mp/notification-prefs",
      method: "PATCH",
      data: patch,
    });
  },

  requestSubscribe(templateId) {
    return new Promise((resolve) => {
      if (!templateId) {
        resolve("skip");
        return;
      }
      wx.requestSubscribeMessage({
        tmplIds: [templateId],
        success: (res) => {
          const status = res[templateId] || "reject";
          request({
            url: "/api/mp/subscribe",
            method: "POST",
            data: { template_id: templateId, status },
          }).finally(() => resolve(status));
        },
        fail: () => resolve("fail"),
      });
    });
  },

  onToggleRemind(e) {
    if (!this.data.loggedIn) {
      auth.navigateToLogin();
      return;
    }
    const enabled = !!e.detail.value;
    this.setData({ notifyLoading: true });
    const run = enabled
      ? this.requestSubscribe(this.data.tmplDaily)
      : Promise.resolve("skip");

    run
      .then(() => this.saveNotifyPrefs({ remind_enabled: enabled }))
      .then(() => {
        this.setData({ remindEnabled: enabled, notifyLoading: false });
        wx.showToast({
          title: enabled ? "已开启每日提醒" : "已关闭",
          icon: "none",
        });
      })
      .catch(() => {
        this.setData({ notifyLoading: false });
        wx.showToast({ title: "设置失败", icon: "none" });
      });
  },

  onRemindTimePick(e) {
    if (!this.data.loggedIn) return;
    const remindTime = (e.detail && e.detail.value) || "08:00";
    this.saveNotifyPrefs({ remind_time: remindTime })
      .then(() => {
        this.setData({ remindTime });
        wx.showToast({ title: "已更新提醒时间", icon: "none" });
      })
      .catch(() => {
        wx.showToast({ title: "保存失败", icon: "none" });
      });
  },

  onToggleRemind(e) {
    if (!this.data.loggedIn) {
      auth.navigateToLogin();
      return;
    }
    const enabled = !!e.detail.value;
    this.setData({ notifyLoading: true });
    const run = enabled
      ? this.requestSubscribe(this.data.tmplDaily)
      : Promise.resolve("skip");

    run
      .then(() => this.saveNotifyPrefs({ remind_enabled: enabled }))
      .then(() => {
        this.setData({ remindEnabled: enabled, notifyLoading: false });
        wx.showToast({
          title: enabled ? "已开启每日提醒" : "已关闭",
          icon: "none",
        });
      })
      .catch(() => {
        this.setData({ notifyLoading: false });
        wx.showToast({ title: "设置失败", icon: "none" });
      });
  },

  onRemindTimeChange(e) {
    if (!this.data.loggedIn) return;
    const remindTime = (e.detail && e.detail.value) || "08:00";
    this.setData({ remindTime });
    this.saveNotifyPrefs({ remind_time: remindTime })
      .then(() => {
        wx.showToast({ title: "提醒时间已更新", icon: "none" });
      })
      .catch(() => {
        wx.showToast({ title: "保存失败", icon: "none" });
      });
  },

  onToggleInstant(e) {
    if (!this.data.loggedIn) {
      auth.navigateToLogin();
      return;
    }
    const enabled = !!e.detail.value;
    this.setData({ notifyLoading: true });
    const run = enabled
      ? this.requestSubscribe(this.data.tmplTaskAdded)
      : Promise.resolve("skip");

    run
      .then(() => this.saveNotifyPrefs({ instant_on_add: enabled }))
      .then(() => {
        this.setData({ instantOnAdd: enabled, notifyLoading: false });
        wx.showToast({
          title: enabled ? "已开启添加通知" : "已关闭",
          icon: "none",
        });
      })
      .catch(() => {
        this.setData({ notifyLoading: false });
        wx.showToast({ title: "设置失败", icon: "none" });
      });
  },

  onGoLogin() {
    auth.navigateToLogin();
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
      content: "退出后本地体验数据仍保留，重新登录可恢复云端同步",
      success: (res) => {
        if (!res.confirm) return;
        auth.clearSession();
        wx.showToast({ title: "已退出", icon: "success" });
        this.setData({ loggedIn: false, email: "" });
      },
    });
  },
});
