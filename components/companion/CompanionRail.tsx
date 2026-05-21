"use client";

import XiaoguangAvatar from "@/components/companion/XiaoguangAvatar";
import TaskStats from "@/components/todo/TaskStats";
import { wgTokens } from "@/lib/tokens";

type Props = {
  variant: "desktop" | "mobile";
};

/** 陪伴左栏：品牌 + 小光 + 今日进度 */
export default function CompanionRail({ variant }: Props) {
  if (variant === "mobile") {
    return (
      <div className="w-full min-w-0 space-y-3">
        <header className="border-b border-orange-100/60 pb-2.5">
          <h1 className="text-lg font-bold text-orange-500">微光 ✨</h1>
        </header>
        <XiaoguangAvatar compact />
        <div className="min-w-0">
          <TaskStats variant="companion" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-w-0 flex-col">
      <header className="shrink-0 border-b border-orange-100/60 pb-3">
        <h1 className={wgTokens.typography.brand}>微光 ✨</h1>
      </header>
      <div className="mt-4 shrink-0">
        <XiaoguangAvatar />
      </div>
      <div className="mt-4 min-w-0 shrink-0">
        <TaskStats variant="companion" />
      </div>
      <p className="mt-auto hidden pt-4 text-center text-xs leading-5 text-stone-400 lg:block">
        陪你熬过备考的每一天
      </p>
    </div>
  );
}
