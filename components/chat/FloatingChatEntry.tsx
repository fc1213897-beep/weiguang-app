"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import ChatPanel from "@/components/chat/ChatPanel";
import { Z_FLOATING_CHAT, Z_FLOATING_CHAT_PANEL } from "@/lib/layout";
import { useUIStore } from "@/store/uiStore";

/** AI 浮动入口：醒目光点按钮 + 完整高度 Drawer（桌面端） */
export default function FloatingChatEntry() {
  const open = useUIStore((s) => s.companionOpen);
  const setCompanionOpen = useUIStore((s) => s.setCompanionOpen);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setCompanionOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, setCompanionOpen]);

  const ui = (
    <>
      {/* 浮动入口：带标签与呼吸光晕，更易发现 */}
      {!open && (
        <button
          type="button"
          onClick={() => setCompanionOpen(true)}
          style={{ zIndex: Z_FLOATING_CHAT }}
          className={[
            "fixed bottom-6 right-5 hidden items-center gap-2.5 rounded-full lg:flex",
            "border-2 border-amber-300/90 bg-gradient-to-r from-amber-100 via-orange-50 to-amber-200",
            "px-4 py-3 shadow-[0_10px_36px_-4px_rgba(251,191,36,0.65),0_4px_14px_rgba(251,146,60,0.35)]",
            "backdrop-blur-md transition hover:scale-[1.03] active:scale-[0.98]",
            "max-lg:bottom-[max(5.5rem,calc(4.5rem+env(safe-area-inset-bottom)))]",
            "lg:bottom-8 lg:right-8",
          ].join(" ")}
          aria-label="打开小光陪伴"
        >
          <span
            className="absolute inset-0 -z-10 rounded-full bg-amber-300/40 wg-fab-pulse"
            aria-hidden
          />
          <span className="shrink-0 text-2xl wg-character-breathe" aria-hidden>
            🌙
          </span>
          <span className="flex flex-col items-start leading-tight">
            <span className="text-sm font-semibold text-amber-900">小光</span>
            <span className="text-[11px] text-amber-800/75">聊聊今天</span>
          </span>
        </button>
      )}

      {/* 遮罩 + 聊天面板 */}
      {open && (
        <div
          className="fixed inset-0 bg-stone-900/25 backdrop-blur-[3px]"
          style={{ zIndex: Z_FLOATING_CHAT_PANEL }}
          onClick={() => setCompanionOpen(false)}
          role="presentation"
        >
          <aside
            className={[
              "absolute flex flex-col overflow-hidden border border-orange-200/80 bg-white shadow-2xl",
              "bottom-0 right-0 left-0 max-h-[min(92dvh,760px)] w-full rounded-t-3xl",
              "max-lg:pb-[env(safe-area-inset-bottom)]",
              "sm:left-auto sm:max-w-[min(100vw-2rem,440px)]",
              "lg:bottom-8 lg:right-8 lg:max-h-[min(86vh,720px)] lg:rounded-3xl",
              "wg-modal-in",
            ].join(" ")}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="小光陪伴"
          >
            {/* 顶栏 */}
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-orange-100/80 bg-gradient-to-r from-amber-50/90 to-orange-50/50 px-4 py-3.5">
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm ring-1 ring-amber-200/80 wg-character-breathe"
                  aria-hidden
                >
                  🌙
                </span>
                <div className="min-w-0">
                  <p className="text-base font-semibold text-stone-800">小光</p>
                  <p className="truncate text-xs text-stone-500">
                    陪你走路的人 · 说说今天的心情
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCompanionOpen(false)}
                className="shrink-0 rounded-xl border border-stone-200/80 bg-white px-3 py-1.5 text-sm text-stone-600 transition hover:bg-stone-50"
                aria-label="收起"
              >
                收起
              </button>
            </div>

            {/* 聊天主体：占满剩余高度 */}
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-4 py-3">
              <ChatPanel showHeader={false} variant="drawer" />
            </div>
          </aside>
        </div>
      )}
    </>
  );

  if (!mounted) return null;
  return createPortal(ui, document.body);
}
