"use client";

import { useEffect, useRef, useState } from "react";
import { isCountdownAutoTask } from "@/lib/countdown/note-utils";
import {
  getCategoryMeta,
  getPriorityLabel,
} from "@/lib/task-plan";
import type { TaskCategory, TaskPriority } from "@/types/task";

type Props = {
  text: string;
  done: boolean;
  category?: TaskCategory;
  priority?: TaskPriority;
  pomodoroMinutes?: number;
  note?: string;
  remindAt?: string | null;
  onToggle?: () => void;
  onSave?: (text: string) => void;
  onRemindChange?: (remindAt: string | null) => void;
  onDelete?: () => void;
};

function toDatetimeLocalValue(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function TaskCard({
  text,
  done,
  category = "study",
  priority = "medium",
  pomodoroMinutes = 0,
  note = "",
  remindAt = null,
  onToggle,
  onSave,
  onRemindChange,
  onDelete,
}: Props) {
  const catMeta = getCategoryMeta(category);
  const priorityLabel = getPriorityLabel(priority);
  const [justCompleted, setJustCompleted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(text);
  const prevDone = useRef(done);

  useEffect(() => {
    if (!isEditing) {
      setEditValue(text);
    }
  }, [text, isEditing]);

  useEffect(() => {
    if (done && !prevDone.current) {
      setJustCompleted(true);
      const timer = window.setTimeout(() => setJustCompleted(false), 720);
      prevDone.current = done;
      return () => window.clearTimeout(timer);
    }
    prevDone.current = done;
  }, [done]);

  function handleStartEdit() {
    setEditValue(text);
    setIsEditing(true);
  }

  function handleCancelEdit() {
    setEditValue(text);
    setIsEditing(false);
  }

  function handleSaveEdit() {
    const value = editValue.trim();
    if (!value) return;
    onSave?.(value);
    setIsEditing(false);
  }

  function handleDelete() {
    if (!window.confirm("确定删除这条任务吗？")) return;
    onDelete?.();
  }

  return (
    <>
      <style>{`
        @keyframes task-card-complete {
          0% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(167, 243, 208, 0);
          }
          45% {
            transform: scale(1.015);
            box-shadow: 0 0 0 10px rgba(167, 243, 208, 0.35);
          }
          100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(167, 243, 208, 0);
          }
        }
        @keyframes task-badge-pop {
          0% {
            opacity: 0;
            transform: scale(0.85);
          }
          60% {
            transform: scale(1.06);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes task-strike-grow {
          from {
            transform: scaleX(0);
          }
          to {
            transform: scaleX(1);
          }
        }
        @keyframes task-sparkle {
          0%,
          100% {
            opacity: 0.5;
            transform: scale(1) rotate(0deg);
          }
          50% {
            opacity: 1;
            transform: scale(1.12) rotate(8deg);
          }
        }
        .task-card-complete {
          animation: task-card-complete 0.72s ease-out;
        }
        .task-badge-pop {
          animation: task-badge-pop 0.5s ease-out;
        }
        .task-strike-grow {
          animation: task-strike-grow 0.45s ease-out forwards;
          transform-origin: left center;
        }
        .task-sparkle {
          animation: task-sparkle 0.72s ease-in-out;
        }
      `}</style>

      <div
        className={[
          "group relative flex flex-col gap-3 overflow-hidden rounded-2xl border p-4 sm:rounded-3xl sm:p-5",
          "transition-all duration-300 ease-out",
          "sm:hover:-translate-y-0.5 sm:hover:shadow-[0_10px_28px_-14px_rgba(251,191,136,0.45)]",
          "sm:hover:border-amber-200/90",
          done
            ? "border-emerald-100/90 bg-gradient-to-br from-emerald-50/80 via-white to-amber-50/40"
            : "border-orange-100/80 bg-gradient-to-br from-orange-50/90 via-[#FFFBF5] to-amber-50/50",
          justCompleted ? "task-card-complete" : "",
        ].join(" ")}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          aria-hidden
        >
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-amber-200/25 blur-2xl" />
          <div className="absolute -bottom-4 -left-4 h-20 w-20 rounded-full bg-orange-200/20 blur-xl" />
        </div>

        {isEditing ? (
          <div className="relative flex w-full min-w-0 flex-col gap-3">
            <input
              className="w-full min-w-0 rounded-xl border border-orange-200 bg-white px-3 py-2.5 text-base outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 sm:px-4 sm:py-3"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSaveEdit();
                }
                if (e.key === "Escape") handleCancelEdit();
              }}
              autoFocus
            />
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleSaveEdit}
                className="rounded-full bg-orange-500 px-4 py-1.5 text-sm text-white shadow-sm transition hover:bg-orange-600"
              >
                保存
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="rounded-full bg-stone-100 px-4 py-1.5 text-sm text-stone-600 transition hover:bg-stone-200"
              >
                取消
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="relative flex w-full min-w-0 flex-1 items-start gap-2.5 sm:items-center sm:gap-3">
              <span
                className={[
                  "shrink-0 text-xl transition-transform duration-300 group-hover:scale-110",
                  done ? "opacity-60" : "opacity-90",
                  justCompleted ? "task-sparkle" : "",
                ].join(" ")}
                aria-hidden
              >
                {done ? "✨" : "🌙"}
              </span>

              <span className="relative min-w-0 flex-1">
                <span
                  className={[
                    "block break-words text-base leading-relaxed transition-colors duration-300 sm:text-lg",
                    done
                      ? "font-normal text-stone-400"
                      : "font-medium text-stone-700 group-hover:text-stone-800",
                  ].join(" ")}
                >
                  {text}
                </span>
                {!isEditing && (
                  <span className="mt-1.5 flex flex-wrap gap-1.5">
                    <span className="rounded-full bg-white/80 px-2 py-0.5 text-[11px] text-stone-500 ring-1 ring-orange-100/80">
                      {catMeta.icon} {catMeta.label}
                    </span>
                    <span
                      className={[
                        "rounded-full px-2 py-0.5 text-[11px] ring-1",
                        priority === "high"
                          ? "bg-rose-50/90 text-rose-600 ring-rose-100"
                          : priority === "low"
                            ? "bg-emerald-50/90 text-emerald-600 ring-emerald-100"
                            : "bg-amber-50/90 text-amber-700 ring-amber-100",
                      ].join(" ")}
                    >
                      {priorityLabel}
                    </span>
                    {pomodoroMinutes > 0 && (
                      <span className="rounded-full bg-orange-50/90 px-2 py-0.5 text-[11px] text-orange-600 ring-1 ring-orange-100">
                        🍅 {pomodoroMinutes} 分钟
                      </span>
                    )}
                    {isCountdownAutoTask(note) && (
                      <span className="rounded-full bg-indigo-50/90 px-2 py-0.5 text-[11px] text-indigo-600 ring-1 ring-indigo-100">
                        备考
                      </span>
                    )}
                  </span>
                )}
                {!isEditing && note.trim() && (
                  <p className="mt-1.5 text-xs leading-relaxed text-stone-400">
                    {note}
                  </p>
                )}
                {done && (
                  <span
                    className={[
                      "absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-stone-300/70",
                      justCompleted ? "task-strike-grow" : "",
                    ].join(" ")}
                    aria-hidden
                  />
                )}
              </span>
            </div>

            <div className="relative flex flex-wrap items-center justify-end gap-2 sm:gap-2.5">
              {onSave && (
                <button
                  type="button"
                  onClick={handleStartEdit}
                  className="rounded-full bg-stone-100/90 px-3 py-1.5 text-sm text-stone-600 ring-1 ring-stone-200/60 transition hover:bg-stone-200/80"
                >
                  编辑
                </button>
              )}

              {onDelete && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="rounded-full bg-rose-50/90 px-3 py-1.5 text-sm text-rose-600 ring-1 ring-rose-200/60 transition hover:bg-rose-100/80"
                >
                  删除
                </button>
              )}

              <button
                type="button"
                onClick={onToggle}
                disabled={!onToggle}
                className={[
                  "shrink-0 rounded-full px-3.5 py-1.5 text-sm transition-all duration-300",
                  "sm:group-hover:scale-105",
                  "cursor-pointer disabled:cursor-default",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/80",
                  done
                  ? "bg-emerald-100/90 text-emerald-700 ring-1 ring-emerald-200/60 hover:bg-emerald-200/80"
                    : "bg-orange-500 text-white shadow-sm hover:bg-orange-600",
                  justCompleted ? "task-badge-pop" : "",
                ].join(" ")}
              >
                {done ? (
                  <span className="flex items-center gap-1">
                    <span aria-hidden>✓</span>
                    已完成
                  </span>
                ) : (
                  "待完成"
                )}
              </button>
            </div>

            {!done && onRemindChange && (
              <div className="relative border-t border-orange-100/60 pt-3">
                <label className="flex flex-col gap-1.5 text-xs text-stone-500">
                  <span>微信提醒时间（需已在小程序授权，到点推送到微信）</span>
                  <input
                    type="datetime-local"
                    className="w-full max-w-xs rounded-lg border border-orange-200 bg-white px-3 py-2 text-sm text-stone-700 outline-none focus:border-orange-400"
                    value={toDatetimeLocalValue(remindAt)}
                    onChange={(e) => {
                      const raw = e.target.value;
                      if (!raw) {
                        onRemindChange(null);
                        return;
                      }
                      const iso = new Date(raw).toISOString();
                      if (new Date(iso).getTime() <= Date.now()) {
                        window.alert("请选择将来的时间");
                        return;
                      }
                      onRemindChange(iso);
                    }}
                  />
                </label>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
