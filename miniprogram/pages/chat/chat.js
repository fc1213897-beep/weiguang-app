const auth = require("../../utils/auth.js");
const { request } = require("../../utils/request.js");

Page({
  data: {
    messages: [],
    input: "",
    sending: false,
    scrollIntoView: "",
  },

  onShow() {
    auth
      .ensureLogin()
      .then(() => this.loadMessages())
      .catch((err) => {
        wx.showToast({
          title: err.message || "登录失败",
          icon: "none",
          duration: 3000,
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
    if (!text || this.data.sending) return;

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

        const assistant = body.assistant_message;
        const userMsg = body.user_message;

        const messages = this.data.messages
          .filter((m) => m.id !== tempUser.id)
          .concat([
            {
              id: userMsg.id,
              role: "user",
              content: userMsg.content,
            },
            {
              id: assistant.id,
              role: "assistant",
              content: assistant.content,
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
    if (len === 0) return;
    this.setData({ scrollIntoView: `msg-${len - 1}` });
  },
});
