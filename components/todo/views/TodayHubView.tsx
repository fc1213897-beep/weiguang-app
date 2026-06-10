"use client";

import CountdownDayBar from "@/components/todo/views/CountdownDayBar";
import TaskManageView from "@/components/todo/views/TaskManageView";
import TodayPlanView from "@/components/todo/views/TodayPlanView";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

type TodayMode = "plan" | "manage";

/** 今日聚合：今日计划 + 全部任务 */
export default function TodayHubView() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const mode: TodayMode =
    searchParams.get("mode") === "manage" ? "manage" : "plan";

  const setMode = useCallback(
    (next: TodayMode) => {
      const params = new URLSearchParams(searchParams.toString());
      if (next === "plan") params.delete("mode");
      else params.set("mode", "manage");
      const q = params.toString();
      router.replace(q ? `/today?${q}` : "/today");
    },
    [router, searchParams]
  );

  return (
    <div className="min-w-0">
      <div className="mb-4 flex flex-wrap gap-2 border-b border-orange-50 pb-4">
        <button
          type="button"
          onClick={() => setMode("plan")}
          className={[
            "rounded-full px-4 py-1.5 text-sm transition",
            mode === "plan"
              ? "bg-orange-100 font-medium text-orange-800"
              : "bg-stone-100 text-stone-600",
          ].join(" ")}
        >
          今日计划
        </button>
        <button
          type="button"
          onClick={() => setMode("manage")}
          className={[
            "rounded-full px-4 py-1.5 text-sm transition",
            mode === "manage"
              ? "bg-orange-100 font-medium text-orange-800"
              : "bg-stone-100 text-stone-600",
          ].join(" ")}
        >
          全部任务
        </button>
      </div>

      <CountdownDayBar />

      {mode === "plan" ? <TodayPlanView embedded /> : <TaskManageView embedded />}
    </div>
  );
}
