import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "微光｜AI学习搭子",
  description: "温柔陪伴你的学习与小目标",
};

/** 部署后旧标签页 chunk 失效时自动刷新一次，避免白屏/加载失败 */
const CHUNK_RECOVERY_SCRIPT = `
(function () {
  var KEY = "wg-chunk-reload";
  var patterns = [
    /Failed to fetch dynamically imported module/i,
    /Loading chunk \\d+ failed/i,
    /Importing a module script failed/i,
    /Failed to load module script/i,
  ];
  function maybeReload(msg) {
    if (!msg || !patterns.some(function (rx) { return rx.test(msg); })) return;
    if (sessionStorage.getItem(KEY)) return;
    sessionStorage.setItem(KEY, "1");
    var url = new URL(location.href);
    url.searchParams.set("_r", String(Date.now()));
    location.replace(url.toString());
  }
  window.addEventListener("error", function (e) {
    maybeReload(e.message || "");
  });
  window.addEventListener("unhandledrejection", function (e) {
    var r = e.reason;
    maybeReload(r && r.message ? r.message : String(r || ""));
  });
  window.addEventListener("load", function () {
    sessionStorage.removeItem(KEY);
  });
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <Script id="chunk-recovery" strategy="beforeInteractive">
          {CHUNK_RECOVERY_SCRIPT}
        </Script>
        {children}
      </body>
    </html>
  );
}
