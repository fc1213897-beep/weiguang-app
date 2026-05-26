const { apiBase } = require("./config.js");

const SESSION_KEY = "wg_session";

function getSession() {
  try {
    return wx.getStorageSync(SESSION_KEY) || null;
  } catch {
    return null;
  }
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

/**
 * 确保已登录：本地有 token 则直接返回，否则 wx.login → mp-login
 */
function ensureLogin() {
  const existing = getSession();
  if (existing && existing.access_token) {
    return Promise.resolve(existing);
  }

  return new Promise((resolve, reject) => {
    wx.login({
      success(loginRes) {
        if (!loginRes.code) {
          reject(new Error("wx.login 失败"));
          return;
        }

        wx.request({
          url: `${apiBase}/api/auth/wx/mp-login`,
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
            reject(
              new Error((err && err.errMsg) || "网络失败，请检查服务器与域名")
            );
          },
        });
      },
      fail() {
        reject(new Error("wx.login 调用失败"));
      },
    });
  });
}

module.exports = {
  getSession,
  saveSession,
  clearSession,
  ensureLogin,
};
