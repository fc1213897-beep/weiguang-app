const auth = require("../../utils/auth.js");
const { request } = require("../../utils/request.js");
const { setTabSelected } = require("../../utils/tab.js");

Page({
  data: {
    messages: [],
    input: "",
    sending: false,
    scrollIntoView: "",
    loggedIn: false,
    loginError: "",
  },

  onShow() {
    setTabSelected(this, 1);
    this.bootstrap();
  },

  onRetryLogin() {
    auth.clearSession();
    this.setData({ loginError: "" });
    this.bootstrap();
  },

  bootstrap() {
    return auth
      .ensureLogin()
      .then(() => {
        this.setData({ loggedIn: true, loginError: "" });
        return this.loadMessages();
      })
      .catch((err) => {
        this.setData({
          loggedIn: false,
          loginError: err.message || "登录失败",
        });
      });
  },

  loadMessages() {
    return request({
      url: "/api/mp/chat/messages",
      method: "GET",
    }).then((res) => {
      const body = res.data || {};
      if (res.statusCode < 200 || res.statusCode >= 300) {
        throw new Error(body.error || "加载失败");
      }

      const messages = body.messages || [];
      this.setData({ messages });
      this.scrollToBottom();
    });
  },

  onInput(e) {
    this.setData({ input: (e.detail && e.detail.value) || "" });
  },

  onSend() {
    const text = (this.data.input || "").trim();
    if (!text || this.data.sending || !this.data.loggedIn) return;

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
            },
          ]);

        this.setData({ messages, sending: false });
        this.scrollToBottom();
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
});
