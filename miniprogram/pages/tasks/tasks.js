const auth = require("../../utils/auth.js");
const guestStore = require("../../utils/guest-store.js");
const { request } = require("../../utils/request.js");
const dateUtil = require("../../utils/date.js");
const taskPlan = require("../../utils/task-plan.js");
const { setTabSelected } = require("../../utils/tab.js");

function decorateTask(task) {
  const cat = taskPlan.getCategoryMeta(task.task_type || "other");
  const priorityLabel = taskPlan.getPriorityLabel(task.priority || "medium");
  const pomodoro = task.pomodoro_minutes || 0;
  const metaParts = [cat.icon + " " + cat.label, priorityLabel];
  if (pomodoro > 0) {
    metaParts.push(taskPlan.getPomodoroLabel(pomodoro));
  }
  return {
    ...task,
    categoryIcon: cat.icon,
    categoryLabel: cat.label,
    priorityLabel,
    metaLine: metaParts.join(" · "),
  };
}

/** 圆形进度环样式（conic-gradient） */
function buildProgressMeta(doneCount, total) {
  const progressPercent = total > 0 ? Math.round((doneCount / total) * 100) : 0;
  const progressRingStyle = `background: conic-gradient(from -90deg, #22c55e 0%, #4ade80 ${progressPercent}%, #ffedd5 ${progressPercent}%, #ffedd5 100%);`;
  return { progressPercent, progressRingStyle };
}

Page({
  data: {
    selectedDate: "",
    dateLabel: "",
    dateWeekday: "",
    isToday: true,
    tasks: [],
    doneCount: 0,
    todoCount: 0,
    loading: true,
    adding: false,
    loggedIn: false,
    loginError: "",
    planModalOpen: false,
    planFlash: false,
    planDraft: taskPlan.createDefaultPlanDraft(""),
    suggestion: null,
    suggestionText: "点「换一条」看看小光的建议",
    categories: taskPlan.TASK_CATEGORIES,
    priorities: taskPlan.TASK_PRIORITIES,
    pomodoroOptions: taskPlan.POMODORO_OPTIONS,
    quickPresets: taskPlan.QUICK_PLAN_PRESETS,
    progressPercent: 0,
    progressRingStyle: "",
    planModalAnim: false,
    dateNavAnim: "",
    dateSlide: false,
    celebrateShow: false,
    fabPressed: false,
    insightText: "",
    insightLoading: false,
    splitGoal: "",
    splitLoading: false,
    splitPreview: null,
    splitSummary: "",
    batchAdding: false,
  },

  _tasksLoadId: 0,

  onLoad() {
    const today = dateUtil.getTodayDateString();
    const progress = buildProgressMeta(0, 0);
    const updates = {
      selectedDate: today,
      dateLabel: dateUtil.formatDisplayDate(today),
      dateWeekday: dateUtil.formatWeekday(today),
      isToday: true,
      planDraft: taskPlan.createDefaultPlanDraft(today),
      progressPercent: progress.progressPercent,
      progressRingStyle: progress.progressRingStyle,
    };

    // 未登录时立即进入体验模式，顶部提示不必等 bootstrap
    if (!auth.hasValidSession()) {
      updates.loggedIn = false;
      updates.loading = false;
    }

    this.setData(updates);

    if (!auth.hasValidSession()) {
      this.loadGuestTasks();
    }
  },

  onShow() {
    setTabSelected(this, 0);
    if (this.data.adding || this.data.planModalOpen) return;
    if (auth.hasValidSession() && this.data.loggedIn) {
      this.loadTasks({ silent: true });
      this.loadInsight();
      return;
    }
    this.bootstrap();
  },

  onPullDownRefresh() {
    this.bootstrap().finally(() => wx.stopPullDownRefresh());
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
          this.loadGuestTasks();
          this.setData({
            loggedIn: false,
            loading: false,
            loginError: "",
          });
          return;
        }
        this.setData({ loggedIn: true, loginError: "" });
        return Promise.all([this.loadTasks(), this.loadInsight()]);
      })
      .catch((err) => {
        this.setData({
          loading: false,
          loggedIn: false,
          loginError: err.message || "加载失败",
        });
      });
  },

  loadGuestTasks() {
    const raw = guestStore.getGuestTasksByDate(this.data.selectedDate);
    const tasks = raw.map((t) => ({
      id: t.id,
      title: t.title,
      completed: !!t.completed,
      task_type: t.task_type || "other",
      priority: t.priority || "medium",
      pomodoro_minutes: t.pomodoro_minutes || 0,
    }));
    this.applyTasksList(tasks);
  },

  applyTasksList(tasks, options = {}) {
    const keepIfEmpty = !!options.keepIfEmpty;
    const decorated = (tasks || []).map(decorateTask);
    if (keepIfEmpty && decorated.length === 0 && this.data.tasks.length > 0) {
      this.setData({ loading: false });
      return;
    }

    const doneCount = decorated.filter((t) => t.completed).length;
    const total = decorated.length;
    const progress = buildProgressMeta(doneCount, total);
    this.setData({
      tasks: decorated,
      doneCount,
      todoCount: total - doneCount,
      progressPercent: progress.progressPercent,
      progressRingStyle: progress.progressRingStyle,
      loading: false,
    });
  },

  loadTasks(options = {}) {
    const silent = !!options.silent;
    const loadId = ++this._tasksLoadId;
    const { selectedDate } = this.data;

    if (!silent) {
      this.setData({ loading: true });
    }

    return request({
      url: `/api/mp/tasks?task_date=${encodeURIComponent(selectedDate)}`,
      method: "GET",
    })
      .then((res) => {
        if (loadId !== this._tasksLoadId) return;

        const body = res.data || {};
        if (res.statusCode < 200 || res.statusCode >= 300) {
          throw new Error(body.error || "加载失败");
        }

        this.applyTasksList(body.tasks || [], {
          keepIfEmpty: silent,
        });
      })
      .catch((err) => {
        if (loadId !== this._tasksLoadId) return Promise.reject(err);
        this.setData({ loading: false });
        return Promise.reject(err);
      });
  },

  loadInsight() {
    const { selectedDate, loggedIn } = this.data;
    if (!loggedIn) return Promise.resolve();

    this.setData({ insightLoading: true });
    return request({
      url: "/api/mp/daily-insight",
      method: "POST",
      data: { entry_date: selectedDate },
    })
      .then((res) => {
        const body = res.data || {};
        if (res.statusCode < 200 || res.statusCode >= 300) {
          throw new Error(body.error || "建议加载失败");
        }
        this.setData({
          insightText: body.insight || "",
          insightLoading: false,
        });
      })
      .catch(() => {
        this.setData({ insightLoading: false });
      });
  },

  onGoLedger() {
    wx.switchTab({ url: "/pages/ledger/ledger" });
  },

  playDateAnim(direction) {
    this.setData({
      dateNavAnim: direction,
      dateSlide: true,
    });
    setTimeout(() => {
      this.setData({ dateNavAnim: "", dateSlide: false });
    }, 360);
  },

  onPrevDay() {
    this.playDateAnim("left");
    this.updateDate(dateUtil.addDays(this.data.selectedDate, -1));
  },

  onNextDay() {
    this.playDateAnim("right");
    this.updateDate(dateUtil.addDays(this.data.selectedDate, 1));
  },

  updateDate(dateStr) {
    const today = dateUtil.getTodayDateString();
    this.setData({
      selectedDate: dateStr,
      dateLabel: dateUtil.formatDisplayDate(dateStr),
      dateWeekday: dateUtil.formatWeekday(dateStr),
      isToday: dateStr === today,
      planDraft: {
        ...this.data.planDraft,
        date: dateStr,
      },
    });
    if (this.data.loggedIn) {
      this.setData({ loading: true });
      Promise.all([this.loadTasks(), this.loadInsight()]).catch((err) => {
        this.setData({ loading: false });
        wx.showToast({
          title: err.message || "加载失败",
          icon: "none",
        });
      });
      return;
    }
    this.loadGuestTasks();
  },

  openPlanModal() {
    if (this.data.planModalOpen) return;

    this.setData({
      planModalOpen: true,
      planModalAnim: false,
      planFlash: false,
      planDraft: taskPlan.createDefaultPlanDraft(this.data.selectedDate),
      suggestion: null,
      suggestionText: "点「换一条」看看小光的建议",
    });

    // 下一帧再播放入场动画，确保弹层已挂载
    setTimeout(() => {
      if (this.data.planModalOpen) {
        this.setData({ planModalAnim: true });
      }
    }, 30);
  },

  closePlanModal() {
    if (!this.data.planModalOpen) return;
    this.setData({
      planModalAnim: false,
      planFlash: false,
      splitPreview: null,
      splitGoal: "",
    });
    setTimeout(() => {
      this.setData({ planModalOpen: false });
    }, 300);
  },

  onSplitGoalInput(e) {
    this.setData({ splitGoal: (e.detail && e.detail.value) || "" });
  },

  onRequestSplit() {
    if (!this.data.loggedIn) {
      auth.navigateToLogin();
      return;
    }
    const goal = (this.data.splitGoal || "").trim();
    if (!goal || this.data.splitLoading) return;

    this.setData({ splitLoading: true });
    request({
      url: "/api/mp/tasks/split",
      method: "POST",
      data: {
        mode: "ai",
        goal,
        task_date: this.data.selectedDate,
      },
    })
      .then((res) => {
        const body = res.data || {};
        if (res.statusCode < 200 || res.statusCode >= 300) {
          throw new Error(body.error || "拆分失败");
        }
        this.setData({
          splitPreview: body.drafts || [],
          splitSummary: body.summary || "",
          splitLoading: false,
        });
      })
      .catch((err) => {
        this.setData({ splitLoading: false });
        wx.showToast({ title: err.message || "拆分失败", icon: "none" });
      });
  },

  onCancelSplitPreview() {
    this.setData({ splitPreview: null });
  },

  onConfirmSplitBatch() {
    const drafts = this.data.splitPreview || [];
    if (!drafts.length || this.data.batchAdding || !this.data.loggedIn) return;

    this.setData({ batchAdding: true });
    const tasks = drafts.map((d) => ({
      title: (d.text || "").trim(),
      task_date: this.data.selectedDate,
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
        wx.showToast({ title: `已添加 ${body.count || tasks.length} 项`, icon: "success" });
        this.triggerCelebrate();
        this.closePlanModal();
        return this.loadTasks({ silent: true });
      })
      .catch((err) => {
        wx.showToast({ title: err.message || "添加失败", icon: "none" });
      })
      .finally(() => {
        this.setData({ batchAdding: false });
      });
  },

  stopBubble() {},

  preventMove() {},

  onFabTouchStart() {
    this.setData({ fabPressed: true });
  },

  onFabTouchEnd() {
    this.setData({ fabPressed: false });
  },

  triggerCelebrate() {
    this.setData({ celebrateShow: true });
    setTimeout(() => {
      this.setData({ celebrateShow: false });
    }, 2200);
  },

  onPlanTextInput(e) {
    this.setData({
      planDraft: {
        ...this.data.planDraft,
        text: (e.detail && e.detail.value) || "",
      },
    });
  },

  onPickCategory(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({
      planDraft: { ...this.data.planDraft, category: id },
    });
  },

  onPickPriority(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({
      planDraft: { ...this.data.planDraft, priority: id },
    });
  },

  onPickPomodoro(e) {
    const minutes = Number(e.currentTarget.dataset.minutes);
    this.setData({
      planDraft: { ...this.data.planDraft, pomodoroMinutes: minutes },
    });
  },

  onRefreshSuggestion() {
    const suggestion = taskPlan.getRandomXiaoguangSuggestion();
    this.setData({
      suggestion,
      suggestionText: suggestion.text,
    });
  },

  onApplySuggestion() {
    const suggestion =
      this.data.suggestion || taskPlan.getRandomXiaoguangSuggestion();
    this.setData({
      suggestion,
      suggestionText: suggestion.text,
      planDraft: {
        ...this.data.planDraft,
        text: suggestion.text,
        category: suggestion.category,
        priority: suggestion.priority,
        pomodoroMinutes: suggestion.pomodoroMinutes,
      },
    });
  },

  createTaskFromDraft(draft, options = {}) {
    const title = (draft.text || "").trim();
    if (!title || this.data.adding) {
      if (!title) wx.showToast({ title: "请先填写计划名称", icon: "none" });
      return Promise.resolve(false);
    }

    if (!this.data.loggedIn) {
      guestStore.addGuestTask({
        title,
        task_date: this.data.selectedDate,
        task_type: draft.category || "other",
        priority: draft.priority || "medium",
        pomodoro_minutes: draft.pomodoroMinutes ?? 0,
        completed: false,
      });
      this.loadGuestTasks();
      if (!options.silentToast) {
        wx.showToast({
          title: options.toastTitle || "已放进今日计划 ✨",
          icon: "success",
        });
        if (options.celebrate !== false) {
          this.triggerCelebrate();
        }
      }
      return Promise.resolve(true);
    }

    this.setData({ adding: true });
    const selectedDate = this.data.selectedDate;

    return request({
      url: "/api/mp/tasks",
      method: "POST",
      data: {
        title,
        task_date: selectedDate,
        task_type: draft.category || "other",
        priority: draft.priority || "medium",
        pomodoro_minutes: draft.pomodoroMinutes ?? 0,
      },
    })
      .then((res) => {
        const body = res.data || {};
        if (res.statusCode < 200 || res.statusCode >= 300) {
          throw new Error(body.error || "添加失败");
        }

        const created = body.task;
        if (created && created.id) {
          const rest = this.data.tasks.filter((t) => t.id !== created.id);
          this.applyTasksList([created, ...rest]);
        }

        if (!options.silentToast) {
          wx.showToast({
            title: options.toastTitle || "已放进今日计划 ✨",
            icon: "success",
          });
          if (options.celebrate !== false) {
            this.triggerCelebrate();
          }
        }
        return true;
      })
      .catch((err) => {
        wx.showToast({
          title: err.message || "添加失败",
          icon: "none",
        });
        return false;
      })
      .finally(() => {
        this.setData({ adding: false });
      });
  },

  onQuickXiaoguang() {
    const draft = taskPlan.getRandomXiaoguangSuggestion();
    this.createTaskFromDraft(draft, { toastTitle: "小光帮你记下啦 ✨" });
  },

  onQuickPreset(e) {
    const index = Number(e.currentTarget.dataset.index);
    const preset = this.data.quickPresets[index];
    if (!preset) return;
    this.createTaskFromDraft(preset, { toastTitle: "已添加" });
  },

  onSubmitPlan() {
    if (this.data.adding) return;
    const draft = this.data.planDraft;
    this.createTaskFromDraft(draft).then((ok) => {
      if (!ok) return;
      this.setData({ planFlash: true });
      setTimeout(() => {
        this.closePlanModal();
      }, 520);
    });
  },

  onToggleTask(e) {
    const id = e.currentTarget.dataset.id;
    const completed = e.currentTarget.dataset.completed;
    if (!id) return;

    if (!this.data.loggedIn) {
      guestStore.updateGuestTask(id, { completed: !completed });
      this.loadGuestTasks();
      return;
    }

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
        return this.loadTasks({ silent: true });
      })
      .catch((err) => {
        wx.showToast({
          title: err.message || "更新失败",
          icon: "none",
        });
      });
  },

  onDeleteTask(e) {
    const id = e.currentTarget.dataset.id;
    const title = e.currentTarget.dataset.title || "这条任务";
    if (!id) return;

    wx.showModal({
      title: "删除任务",
      content: `确定删除「${title}」吗？`,
      confirmColor: "#ea580c",
      success: (res) => {
        if (!res.confirm) return;

        if (!this.data.loggedIn) {
          guestStore.deleteGuestTask(id);
          this.loadGuestTasks();
          wx.showToast({ title: "已删除", icon: "success" });
          return;
        }

        request({
          url: `/api/mp/tasks/${id}`,
          method: "DELETE",
        })
          .then((apiRes) => {
            const body = apiRes.data || {};
            if (apiRes.statusCode < 200 || apiRes.statusCode >= 300) {
              throw new Error(body.error || "删除失败");
            }
            const tasks = this.data.tasks.filter((t) => t.id !== id);
            this.applyTasksList(tasks);
            wx.showToast({ title: "已删除", icon: "success" });
          })
          .catch((err) => {
            wx.showToast({
              title: err.message || "删除失败",
              icon: "none",
            });
          });
      },
    });
  },
});
