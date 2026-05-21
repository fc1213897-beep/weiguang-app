"use client";

import { useState } from "react";
import AuthCard from "@/components/auth/AuthCard";
import AuthStatusBadge from "@/components/auth/AuthStatusBadge";

/** 手机端：可折叠账号区，不占用 Tab 主栏 */
export default function MobileAuthPanel() {
  const [open, setOpen] = useState(false);

  return (
    <div className="mb-3 lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-xl border border-orange-100/80 bg-white/80 px-3 py-2.5 text-left shadow-sm"
        aria-expanded={open}
      >
        <span className="text-xs font-medium text-stone-600">账号</span>
        <AuthStatusBadge />
        <span className="ml-2 text-stone-400" aria-hidden>
          {open ? "▴" : "▾"}
        </span>
      </button>
      {open && (
        <div className="mt-2">
          <AuthCard />
        </div>
      )}
    </div>
  );
}
