/**
 * Next.js 后端地址（与网页访问一致：http://www.weiguanglife.top:3000）
 * - 须与 .env.local 中 NEXT_PUBLIC_APP_URL 保持一致
 * - 微信正式版要求 HTTPS 且无端口，上线前建议 Nginx 反代到 443
 */
const API_BASE = "http://www.weiguanglife.top:3000";

module.exports = {
  apiBase: API_BASE,
};
