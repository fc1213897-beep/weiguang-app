Component({
  data: {
    selected: 0,
    list: [
      {
        pagePath: "/pages/tasks/tasks",
        text: "今日任务",
        icon: "📋",
      },
      {
        pagePath: "/pages/chat/chat",
        text: "小光",
        icon: "✨",
      },
      {
        pagePath: "/pages/me/me",
        text: "我的",
        icon: "👤",
      },
    ],
  },

  methods: {
    switchTab(e) {
      const path = e.currentTarget.dataset.path;
      const index = e.currentTarget.dataset.index;
      wx.switchTab({ url: path });
      this.setData({ selected: index });
    },
  },
});
