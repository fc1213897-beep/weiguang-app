/**
 * 小程序 API 根地址
 * - 正式/体验/审核：必须 HTTPS、无端口（与 NEXT_PUBLIC_APP_URL 一致）
 * - 开发：可用 http:3000，开发者工具勾选「不校验合法域名」
 * - 微信公众平台 → 开发设置 → 服务器域名 → request 合法域名：www.weiguanglife.top
 */
const APP_VERSION = "0.2.1";
const API_BASE_PROD = "https://www.weiguanglife.top";
/** 开发者工具 / 模拟器联调：本机 Next.js（npm run dev） */
const API_BASE_DEV = "http://127.0.0.1:3000";
/** 真机调试时改为电脑局域网 IP，例如 http://192.168.1.100:3000 */
const API_BASE_LAN = API_BASE_DEV;
const WEB_BASE_PROD = API_BASE_PROD;

function getApiBase() {
  try {
    const { envVersion } = wx.getAccountInfoSync().miniProgram;
    if (envVersion === "develop") {
      return API_BASE_LAN;
    }
  } catch {
    // 非小程序运行时忽略
  }
  return API_BASE_PROD;
}

/** Web 页根地址（成长/备考等 H5 内嵌或复制链接） */
function getWebBase() {
  try {
    const { envVersion } = wx.getAccountInfoSync().miniProgram;
    if (envVersion === "develop") {
      return API_BASE_LAN;
    }
  } catch {
    // 非小程序运行时忽略
  }
  return WEB_BASE_PROD;
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
  APP_VERSION,
  getApiBase,
  getWebBase,
  API_BASE_PROD,
  API_BASE_DEV,
  API_BASE_LAN,
  WEB_BASE_PROD,
  formatRequestFail,
};
