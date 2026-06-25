const { getApiBase, formatRequestFail } = require("./config.js");
const auth = require("./auth.js");

/**
 * 带 Bearer Token 的请求；401 时清 session 并抛错
 */
function request(options) {
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
