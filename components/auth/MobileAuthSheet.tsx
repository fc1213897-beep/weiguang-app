"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import AuthCard from "@/components/auth/AuthCard";
import { useAuth } from "@/hooks/useAuth";
import { Z_MODAL } from "@/lib/layout";
import { useUIStore } from "@/store/uiStore";

/** 手机端：按需弹出的账号登录层 */
export default function MobileAuthSheet() {
  const open = useUIStore((s) => s.authSheetOpen);
  const setOpen = useUIStore((s) => s.setAuthSheetOpen);
  const { isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isAuthenticated && open) {
      setOpen(false);
    }
  }, [isAuthenticated, open, setOpen]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, setOpen]);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="fixed inset-0 bg-stone-900/30 backdrop-blur-[2px] lg:hidden"
      style={{ zIndex: Z_MODAL }}
      onClick={() => setOpen(false)}
      role="presentation"
    >
      <aside
        className="absolute bottom-0 left-0 right-0 max-h-[88dvh] overflow-y-auto rounded-t-3xl border border-orange-100/80 bg-white p-4 shadow-2xl wg-modal-in"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="账号登录"
      >
        <div className="mb-3 flex items-center justify-between">
          <p className="text-base font-semibold text-stone-800">账号与同步</p>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-lg px-2 py-1 text-sm text-stone-500"
          >
            关闭
          </button>
        </div>
        <AuthCard compact />
      </aside>
    </div>,
    document.body
  );
}
