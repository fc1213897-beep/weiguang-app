const { getApiBase, formatRequestFail } = require("./config.js");

const SESSION_KEY = "wg_session";
const LOGIN_PAGE = "/pages/login/login";

function getSession() {
  try {
    return wx.getStorageSync(SESSION_KEY) || null;
  } catch {
    return null;
  }
}

function hasValidSession() {
  const session = getSession();
  return !!(session && session.access_token);
}

function saveSession(data) {
  wx.setStorageSync(SESSION_KEY, {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: data.expires_at,
    user: data.user || null,
  });
}

function clearSession() {
  wx.removeStorageSync(SESSION_KEY);
}

/** 用户主动进入登录页（保留返回栈，符合审核「先体验后登录」） */
function navigateToLogin(query) {
  const suffix = query ? `?${query}` : "";
  wx.navigateTo({ url: `${LOGIN_PAGE}${suffix}` });
}

/** 仅用于 PC 扫码等必须直达登录页的场景 */
function redirectToLogin(query) {
  const suffix = query ? `?${query}` : "";
  wx.navigateTo({ url: `${LOGIN_PAGE}${suffix}` });
}

/**
 * 需要登录时温和提示，用户确认后再跳转
 */
function promptLogin(options = {}) {
  const title = options.title || "登录后可云同步";
  const content =
    options.content ||
    "登录后任务、记账与小光对话会保存到云端，并可与电脑网页同步。";
  return new Promise((resolve) => {
    wx.showModal({
      title,
      content,
      confirmText: options.confirmText || "去登录",
      cancelText: options.cancelText || "先看看",
      success: (res) => {
        if (res.confirm) {
          navigateToLogin(options.query || "");
          resolve(true);
        } else {
          resolve(false);
        }
      },
      fail: () => resolve(false),
    });
  });
}

/**
 * wx.login → mp-login，用于登录页一键登录或静默续期
 */
function loginWithMp() {
  return new Promise((resolve, reject) => {
    wx.login({
      success(loginRes) {
        if (!loginRes.code) {
          reject(new Error("wx.login 失败"));
          return;
        }

        wx.request({
          url: `${getApiBase()}/api/auth/wx/mp-login`,
          method: "POST",
          header: { "Content-Type": "application/json" },
          data: { code: loginRes.code },
          success(res) {
            const body = res.data || {};
            if (
              res.statusCode >= 200 &&
              res.statusCode < 300 &&
              body.access_token
            ) {
              saveSession(body);
              resolve(getSession());
              return;
            }
            let msg = body.error || `登录失败(${res.statusCode})`;
            if (res.statusCode === 404) {
              msg =
                "服务器未更新：缺少登录接口。请上传含 api/auth/wx/mp-login 的代码并 npm run build 后重启";
            }
            reject(new Error(msg));
          },
          fail(err) {
            reject(new Error(formatRequestFail(err)));
          },
        });
      },
      fail() {
        reject(new Error("wx.login 调用失败"));
      },
    });
  });
}

/**
 * 有 Session 则返回，否则返回 null（不强制跳转登录页）
 */
function resolveSession() {
  if (hasValidSession()) {
    return Promise.resolve(getSession());
  }
  return Promise.resolve(null);
}

/**
 * @deprecated 请使用 resolveSession，勿在页面 onShow 强制跳转登录
 */
function guardLogin() {
  return resolveSession();
}

/**
 * 确保已登录：有 Session 直接返回，否则静默 mp-login
 */
function ensureLogin() {
  if (hasValidSession()) {
    return Promise.resolve(getSession());
  }
  return loginWithMp();
}

module.exports = {
  getSession,
  hasValidSession,
  saveSession,
  clearSession,
  navigateToLogin,
  redirectToLogin,
  promptLogin,
  loginWithMp,
  resolveSession,
  guardLogin,
  ensureLogin,
};
