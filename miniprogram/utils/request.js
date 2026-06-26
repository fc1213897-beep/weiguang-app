const { getApiBase, formatRequestFail } = require("./config.js");
const auth = require("./auth.js");

/**
 * 带 Bearer Token 的请求；401 时尝试续期一次并重试
 */
function request(options, retried = false) {
  const session = auth.getSession();
  const url = options.url.startsWith("http")
    ? options.url
    : `${getApiBase()}${options.url}`;

  return new Promise((resolve, reject) => {
    wx.request({
      ...options,
      url,
      header: {
        "Content-Type": "application/json",
        ...(session && session.access_token
          ? { Authorization: `Bearer ${session.access_token}` }
          : {}),
        ...(options.header || {}),
      },
      success(res) {
        if (res.statusCode === 401 && !retried) {
          auth
            .renewSession()
            .then((newSession) => {
              if (!newSession) {
                auth.clearSession();
                reject(new Error("登录已失效，请重新登录"));
                return;
              }
              request(options, true).then(resolve).catch(reject);
            })
            .catch(() => {
              auth.clearSession();
              reject(new Error("登录已失效，请重新登录"));
            });
          return;
        }
        if (res.statusCode === 401) {
          auth.clearSession();
          reject(new Error("登录已失效，请重新登录"));
          return;
        }
        resolve(res);
      },
      fail(err) {
        reject(new Error(formatRequestFail(err)));
      },
    });
  });
}

module.exports = { request };
