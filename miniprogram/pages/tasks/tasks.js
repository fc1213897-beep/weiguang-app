const auth = require("../../utils/auth.js");
const { request } = require("../../utils/request.js");
const dateUtil = require("../../utils/date.js");

Page({
  data: {
    selectedDate: "",
    dateLabel: "",
    isToday: true,
    tasks: [],
    doneCount: 0,
    todoCount: 0,
    newTitle: "",
    loading: true,
    adding: false,
  },

  onLoad() {
    const today = dateUtil.getTodayDateString();
    this.setData({
      selectedDate: today,
      dateLabel: dateUtil.formatDisplayDate(today),
      isToday: true,
    });
  },

  onShow() {
    this.bootstrap();
  },

  onPullDownRefresh() {
    this.loadTasks().finally(() => wx.stopPullDownRefresh());
  },

  bootstrap() {
    auth
      .ensureLogin()
      .then(() => this.loadTasks())
      .catch((err) => {
        this.setData({ loading: false });
        wx.showToast({
          title: err.message || "登录失败",
          icon: "none",
          duration: 3000,
        });
      });
  },

  loadTasks() {
    const { selectedDate } = this.data;
    this.setData({ loading: true });

    return request({
      url: `/api/mp/tasks?task_date=${selectedDate}`,
      method: "GET",
    }).then((res) => {
      const body = res.data || {};
      if (res.statusCode < 200 || res.statusCode >= 300) {
        throw new Error(body.error || "加载失败");
      }

      const tasks = body.tasks || [];
      const doneCount = tasks.filter((t) => t.completed).length;
      this.setData({
        tasks,
        doneCount,
        todoCount: tasks.length - doneCount,
        loading: false,
      });
    });
  },

  onPrevDay() {
    const next = dateUtil.addDays(this.data.selectedDate, -1);
    this.updateDate(next);
  },

  onNextDay() {
    const next = dateUtil.addDays(this.data.selectedDate, 1);
    this.updateDate(next);
  },

  updateDate(dateStr) {
    const today = dateUtil.getTodayDateString();
    this.setData({
      selectedDate: dateStr,
      dateLabel: dateUtil.formatDisplayDate(dateStr),
      isToday: dateStr === today,
    });
    this.loadTasks();
  },

  onTitleInput(e) {
    this.setData({ newTitle: (e.detail && e.detail.value) || "" });
  },

  onAddTask() {
    const title = (this.data.newTitle || "").trim();
    if (!title || this.data.adding) return;

    this.setData({ adding: true });

    request({
      url: "/api/mp/tasks",
      method: "POST",
      data: {
        title,
        task_date: this.data.selectedDate,
      },
    })
      .then((res) => {
        const body = res.data || {};
        if (res.statusCode < 200 || res.statusCode >= 300) {
          throw new Error(body.error || "添加失败");
        }
        this.setData({ newTitle: "" });
        wx.showToast({ title: "已添加", icon: "success" });
        return this.loadTasks();
      })
      .catch((err) => {
        wx.showToast({
          title: err.message || "添加失败",
          icon: "none",
        });
      })
      .finally(() => {
        this.setData({ adding: false });
      });
  },

  onToggleTask(e) {
    const id = e.currentTarget.dataset.id;
    const completed = e.currentTarget.dataset.completed;
    if (!id) return;

    request({
      url: `/api/mp/tasks/${id}`,
      method: "PATCH",
      data: { completed: !completed },
    })
      .then((res) => {
        const body = res.data || {};
        if (res.statusCode < 200 || res.statusCode >= 300) {
          throw new Error(body.error || "更新失败");
        }
        return this.loadTasks();
      })
      .catch((err) => {
        wx.showToast({
          title: err.message || "更新失败",
          icon: "none",
        });
      });
  },
});
