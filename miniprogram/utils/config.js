/**
 * 小程序 API 根地址
 * - 正式/体验/审核：必须 HTTPS、无端口（与 NEXT_PUBLIC_APP_URL 一致）
 * - 开发：可用 http:3000，开发者工具勾选「不校验合法域名」
 * - 微信公众平台 → 开发设置 → 服务器域名 → request 合法域名：www.weiguanglife.top
 */
const API_BASE_PROD = "https://www.weiguanglife.top";
const API_BASE_DEV = "http://www.weiguanglife.top:3000";

function getApiBase() {
  try {
    const { envVersion } = wx.getAccountInfoSync().miniProgram;
    if (envVersion === "develop") {
      return API_BASE_DEV;
    }
  } catch (_) {
    // 非小程序运行时忽略
  }
  return API_BASE_PROD;
}

/** 将 wx.request 失败信息转为可读提示 */
function formatRequestFail(err) {
  const raw = (err && err.errMsg) || "网络请求失败";
  if (/url\s*not\s*in\s*domain\s*list/i.test(raw)) {
    return (
      "请求域名未通过校验：请确认服务器已启用 HTTPS（443），" +
      "并在微信公众平台配置 request 合法域名为 www.weiguanglife.top"
    );
  }
  return raw;
}

module.exports = {
  getApiBase,
  API_BASE_PROD,
  API_BASE_DEV,
  formatRequestFail,
};
