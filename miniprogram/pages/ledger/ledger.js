const auth = require("../../utils/auth.js");
const guestStore = require("../../utils/guest-store.js");
const { request } = require("../../utils/request.js");
const dateUtil = require("../../utils/date.js");
const expensePlan = require("../../utils/expense-plan.js");
const { setTabSelected } = require("../../utils/tab.js");

function decorateExpense(item) {
  const meta = expensePlan.getCategoryMeta(item.category, item.entry_type);
  const sign = item.entry_type === "income" ? "+" : "-";
  return {
    ...item,
    categoryIcon: meta.icon,
    categoryLabel: meta.label,
    displayAmount: sign + expensePlan.formatAmount(item.amount),
    amountClass: item.entry_type === "income" ? "amount-income" : "amount-expense",
  };
}

Page({
  data: {
    selectedDate: "",
    dateLabel: "",
    dateWeekday: "",
    isToday: true,
    expenses: [],
    expenseTotal: "0.00",
    incomeTotal: "0.00",
    count: 0,
    loading: true,
    adding: false,
    loggedIn: false,
    loginError: "",
    expenseModalOpen: false,
    expenseModalAnim: false,
    expenseDraft: expensePlan.createDefaultExpenseDraft(""),
    expenseCategories: expensePlan.EXPENSE_CATEGORIES,
    incomeCategories: expensePlan.INCOME_CATEGORIES,
    activeCategories: expensePlan.EXPENSE_CATEGORIES,
    dateNavAnim: "",
    dateSlide: false,
    fabPressed: false,
    insightText: "",
    insightLoading: false,
    listExpanded: false,
  },

  _loadId: 0,

  onLoad() {
    const today = dateUtil.getTodayDateString();
    const updates = {
      selectedDate: today,
      dateLabel: dateUtil.formatDisplayDate(today),
      dateWeekday: dateUtil.formatWeekday(today),
      isToday: true,
      expenseDraft: expensePlan.createDefaultExpenseDraft(today),
    };

    if (!auth.hasValidSession()) {
      updates.loggedIn = false;
      updates.loading = false;
    }

    this.setData(updates);

    if (!auth.hasValidSession()) {
      this.loadGuestExpenses();
    }
  },

  onShow() {
    setTabSelected(this, 1);
    if (this.data.adding || this.data.expenseModalOpen) return;
    auth.ensureSession().then((session) => {
      if (session && this.data.loggedIn) {
        this.loadData({ silent: true });
        return;
      }
      this.bootstrap();
    });
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
          this.loadGuestExpenses();
          this.setData({
            loggedIn: false,
            loading: false,
            loginError: "",
          });
          return;
        }
        this.setData({ loggedIn: true, loginError: "" });
        return this.loadData();
      })
      .catch((err) => {
        this.setData({
          loading: false,
          loggedIn: false,
          loginError: err.message || "加载失败",
        });
      });
  },

  loadGuestExpenses() {
    const expenses = guestStore.getGuestExpensesByDate(this.data.selectedDate);
    const summary = guestStore.summarizeGuestExpenses(expenses);
    this.applyExpensesList(expenses, summary);
  },

  applyExpensesList(expenses, summary) {
    const decorated = (expenses || []).map(decorateExpense);
    const s = summary || {};
    this.setData({
      expenses: decorated,
      expenseTotal: expensePlan.formatAmount(s.expenseTotal || 0),
      incomeTotal: expensePlan.formatAmount(s.incomeTotal || 0),
      count: s.count ?? decorated.length,
      loading: false,
    });
  },

  loadExpenses(options = {}) {
    const silent = !!options.silent;
    const loadId = ++this._loadId;
    const { selectedDate } = this.data;

    if (!silent) this.setData({ loading: true });

    return request({
      url: `/api/mp/expenses?entry_date=${encodeURIComponent(selectedDate)}`,
      method: "GET",
    })
      .then((res) => {
        if (loadId !== this._loadId) return;
        const body = res.data || {};
        if (res.statusCode < 200 || res.statusCode >= 300) {
          throw new Error(body.error || "加载失败");
        }
        this.applyExpensesList(body.expenses, body.summary);
      })
      .catch((err) => {
        if (loadId !== this._loadId) return Promise.reject(err);
        this.setData({ loading: false });
        wx.showToast({
          title: err.message || "加载失败",
          icon: "none",
        });
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

  loadData(options = {}) {
    return Promise.all([
      this.loadExpenses(options),
      this.loadInsight(),
    ]).catch((err) => {
      if (!options.silent) {
        wx.showToast({
          title: err.message || "加载失败",
          icon: "none",
        });
      }
    });
  },

  playDateAnim(direction) {
    this.setData({ dateNavAnim: direction, dateSlide: true });
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
      listExpanded: false,
      expenseDraft: {
        ...this.data.expenseDraft,
        entry_date: dateStr,
      },
    });
    if (this.data.loggedIn) {
      this.setData({ loading: true });
      this.loadData();
      return;
    }
    this.loadGuestExpenses();
  },

  onToggleList() {
    this.setData({ listExpanded: !this.data.listExpanded });
  },

  openExpenseModal() {
    if (this.data.expenseModalOpen) return;

    this.setData({
      expenseModalOpen: true,
      expenseModalAnim: false,
      expenseDraft: expensePlan.createDefaultExpenseDraft(this.data.selectedDate),
      activeCategories: expensePlan.EXPENSE_CATEGORIES,
    });

    setTimeout(() => {
      if (this.data.expenseModalOpen) {
        this.setData({ expenseModalAnim: true });
      }
    }, 30);
  },

  closeExpenseModal() {
    if (!this.data.expenseModalOpen) return;
    this.setData({ expenseModalAnim: false });
    setTimeout(() => {
      this.setData({ expenseModalOpen: false });
    }, 300);
  },

  stopBubble() {},
  preventMove() {},

  onFabTouchStart() {
    this.setData({ fabPressed: true });
  },

  onFabTouchEnd() {
    this.setData({ fabPressed: false });
  },

  onAmountInput(e) {
    this.setData({
      expenseDraft: {
        ...this.data.expenseDraft,
        amount: (e.detail && e.detail.value) || "",
      },
    });
  },

  onNoteInput(e) {
    this.setData({
      expenseDraft: {
        ...this.data.expenseDraft,
        note: (e.detail && e.detail.value) || "",
      },
    });
  },

  onPickEntryType(e) {
    const entryType = e.currentTarget.dataset.type;
    const categories = expensePlan.getCategoriesForType(entryType);
    this.setData({
      expenseDraft: {
        ...this.data.expenseDraft,
        entry_type: entryType,
        category: categories[0].id,
      },
      activeCategories: categories,
    });
  },

  onPickCategory(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({
      expenseDraft: { ...this.data.expenseDraft, category: id },
    });
  },

  onSubmitExpense() {
    if (this.data.adding) return;

    const draft = this.data.expenseDraft;
    const amount = parseFloat(String(draft.amount).trim());
    if (!Number.isFinite(amount) || amount <= 0) {
      wx.showToast({ title: "请输入有效金额", icon: "none" });
      return;
    }

    this.setData({ adding: true });

    if (!this.data.loggedIn) {
      guestStore.addGuestExpense({
        amount,
        entry_type: draft.entry_type,
        category: draft.category,
        note: (draft.note || "").trim(),
        entry_date: this.data.selectedDate,
      });
      wx.showToast({ title: "已记下 ✨", icon: "success" });
      this.closeExpenseModal();
      this.loadGuestExpenses();
      this.setData({ adding: false });
      return;
    }

    request({
      url: "/api/mp/expenses",
      method: "POST",
      data: {
        amount,
        entry_type: draft.entry_type,
        category: draft.category,
        note: (draft.note || "").trim(),
        entry_date: this.data.selectedDate,
        source: "manual",
      },
    })
      .then((res) => {
        const body = res.data || {};
        if (res.statusCode < 200 || res.statusCode >= 300) {
          throw new Error(body.error || "记账失败");
        }
        wx.showToast({ title: "已记下 ✨", icon: "success" });
        this.closeExpenseModal();
        return this.loadData({ silent: true });
      })
      .catch((err) => {
        wx.showToast({ title: err.message || "记账失败", icon: "none" });
      })
      .finally(() => {
        this.setData({ adding: false });
      });
  },

  onDeleteExpense(e) {
    const id = e.currentTarget.dataset.id;
    const label = e.currentTarget.dataset.label || "这条记录";
    if (!id) return;

    wx.showModal({
      title: "删除记录",
      content: `确定删除「${label}」吗？`,
      confirmColor: "#ea580c",
      success: (res) => {
        if (!res.confirm) return;

        if (!this.data.loggedIn) {
          guestStore.deleteGuestExpense(id);
          this.loadGuestExpenses();
          wx.showToast({ title: "已删除", icon: "success" });
          return;
        }

        request({
          url: `/api/mp/expenses/${id}`,
          method: "DELETE",
        })
          .then((apiRes) => {
            const body = apiRes.data || {};
            if (apiRes.statusCode < 200 || apiRes.statusCode >= 300) {
              throw new Error(body.error || "删除失败");
            }
            const expenses = this.data.expenses.filter((x) => x.id !== id);
            let expenseSum = 0;
            let incomeSum = 0;
            expenses.forEach((x) => {
              if (x.entry_type === "income") incomeSum += x.amount;
              else expenseSum += x.amount;
            });
            this.applyExpensesList(expenses, {
              expenseTotal: expenseSum,
              incomeTotal: incomeSum,
              count: expenses.length,
            });
            this.loadInsight();
            wx.showToast({ title: "已删除", icon: "success" });
          })
          .catch((err) => {
            wx.showToast({ title: err.message || "删除失败", icon: "none" });
          });
      },
    });
  },
});
