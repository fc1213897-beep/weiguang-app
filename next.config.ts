import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // HTML 不长期缓存，避免部署后浏览器仍用旧页面引用已删除的 JS chunk
  async headers() {
    return [
      {
        source: "/((?!_next/static|_next/image|favicon.ico).*)",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, must-revalidate",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
