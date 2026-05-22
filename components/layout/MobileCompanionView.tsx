"use client";

import CompanionRail from "@/components/companion/CompanionRail";
import { panelClass } from "@/lib/tokens";
import { useUIStore } from "@/store/uiStore";

/** 手机端：轻量陪伴 */
export default function MobileCompanionView() {
  const mobileTab = useUIStore((s) => s.mobileTab);

  if (mobileTab !== "companion") return null;

  return (
    <div className={[panelClass, "flex min-w-0 flex-col gap-3"].join(" ")}>
      <CompanionRail variant="mobile" />
      <div className="rounded-2xl border border-dashed border-orange-200/80 bg-orange-50/30 p-4 text-center">
        <p className="text-sm font-medium text-stone-700">今日陪伴提示</p>
        <p className="mt-1 text-xs leading-relaxed text-stone-500">
          给自己一个小目标，再去「聊天」Tab 和小光说说现在的状态。
        </p>
      </div>
    </div>
  );
}
