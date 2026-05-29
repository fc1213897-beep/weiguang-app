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

/** 跳转登录页（未登录时 Tab 页调用） */
function redirectToLogin() {
  wx.reLaunch({ url: LOGIN_PAGE });
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
 * Tab 页守卫：无本地 Session 则跳转登录页
 */
function guardLogin() {
  if (hasValidSession()) {
    return Promise.resolve(getSession());
  }
  redirectToLogin();
  return Promise.reject(new Error("请先登录"));
}

/**
 * 确保已登录：有 Session 直接返回，否则静默 mp-login（兼容旧逻辑）
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
  redirectToLogin,
  loginWithMp,
  guardLogin,
  ensureLogin,
};
