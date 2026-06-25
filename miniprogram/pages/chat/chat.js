const auth = require("../../utils/auth.js");
const { request } = require("../../utils/request.js");
const { setTabSelected } = require("../../utils/tab.js");

const GUEST_WELCOME = {
  id: "guest-welcome",
  role: "assistant",
  content:
    "你好呀，我是小光 ✨ 你可以先逛逛今日任务和记账。想和我聊天、或把数据同步到云端时，在「我的」里登录就好～",
};

Page({
  data: {
    messages: [],
    input: "",
    sending: false,
    loading: false,
    scrollIntoView: "",
    loggedIn: false,
    loginError: "",
  },

  onShow() {
    setTabSelected(this, 2);
    this.bootstrap();
  },

  onRetryLogin() {
    auth.navigateToLogin();
  },

  onGoLogin() {
    auth.navigateToLogin();
  },

  bootstrap() {
    this.setData({ loading: true, loginError: "" });
    return auth
      .resolveSession()
      .then((session) => {
        if (!session) {
          this.setData({
            loggedIn: false,
            loading: false,
            messages: [GUEST_WELCOME],
            loginError: "",
          });
          this.scrollToBottom();
          return;
        }
        this.setData({ loggedIn: true, loginError: "" });
        return this.loadMessages();
      })
      .catch((err) => {
        this.setData({
          loading: false,
          loggedIn: false,
          loginError: err.message || "加载失败",
        });
      });
  },

  loadMessages() {
    this.setData({ loading: true });
    return request({
      url: "/api/mp/chat/messages",
      method: "GET",
    })
      .then((res) => {
        const body = res.data || {};
        if (res.statusCode < 200 || res.statusCode >= 300) {
          throw new Error(body.error || "加载失败");
        }

        const messages = body.messages || [];
        this.setData({ messages, loading: false });
        this.scrollToBottom();
      })
      .catch((err) => {
        this.setData({
          loading: false,
          loginError: err.message || "加载失败",
        });
      });
  },

  onInput(e) {
    this.setData({ input: (e.detail && e.detail.value) || "" });
  },

  onSend() {
    const text = (this.data.input || "").trim();
    if (!text || this.data.sending) return;

    if (!this.data.loggedIn) {
      auth.promptLogin({
        title: "登录后与小光聊天",
        content: "登录后可保存对话记录，并与电脑网页同步。",
      });
      return;
    }

    const tempUser = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: text,
    };

    this.setData({
      input: "",
      sending: true,
      messages: [...this.data.messages, tempUser],
    });
    this.scrollToBottom();

    request({
      url: "/api/mp/chat/send",
      method: "POST",
      data: { message: text },
    })
      .then((res) => {
        const body = res.data || {};
        if (res.statusCode < 200 || res.statusCode >= 300) {
          throw new Error(body.error || "发送失败");
        }

        const messages = this.data.messages
          .filter((m) => m.id !== tempUser.id)
          .concat([
            {
              id: body.user_message.id,
              role: "user",
              content: body.user_message.content,
            },
            {
              id: body.assistant_message.id,
              role: "assistant",
              content: body.assistant_message.content,
              expense_recorded: !!body.expense_recorded,
              tasks_suggested: body.tasks_suggested || null,
            },
          ]);

        this.setData({ messages, sending: false });
        this.scrollToBottom();

        if (body.expense_recorded) {
          const amount = Number(body.expense_recorded.amount || 0).toFixed(2);
          wx.showToast({
            title: `已记下 ${amount} 元`,
            icon: "none",
          });
        }
      })
      .catch((err) => {
        const messages = this.data.messages.filter(
          (m) => m.id !== tempUser.id
        );
        this.setData({ messages, sending: false, input: text });
        wx.showToast({
          title: err.message || "发送失败",
          icon: "none",
        });
      });
  },

  scrollToBottom() {
    const len = this.data.messages.length;
    const target = len > 0 ? `msg-${len - 1}` : "scroll-bottom";
    this.setData({ scrollIntoView: target });
  },

  onAddSuggestedTasks(e) {
    const index = Number(e.currentTarget.dataset.index);
    const msg = this.data.messages[index];
    const drafts = msg && msg.tasks_suggested;
    if (!drafts || !drafts.length || !this.data.loggedIn) return;

    const dateUtil = require("../../utils/date.js");
    const today = dateUtil.getTodayDateString();
    const tasks = drafts.map((d) => ({
      title: (d.text || "").trim(),
      task_date: today,
      task_type: d.category || "study",
      priority: d.priority || "medium",
      pomodoro_minutes: d.pomodoroMinutes ?? 0,
    })).filter((t) => t.title);

    request({
      url: "/api/mp/tasks/batch",
      method: "POST",
      data: { tasks },
    })
      .then((res) => {
        const body = res.data || {};
        if (res.statusCode < 200 || res.statusCode >= 300) {
          throw new Error(body.error || "添加失败");
        }
        wx.showToast({ title: `已加入 ${body.count || tasks.length} 项`, icon: "success" });
        const messages = this.data.messages.map((m, i) =>
          i === index ? { ...m, tasks_suggested: null } : m
        );
        this.setData({ messages });
      })
      .catch((err) => {
        wx.showToast({ title: err.message || "添加失败", icon: "none" });
      });
  },
});
