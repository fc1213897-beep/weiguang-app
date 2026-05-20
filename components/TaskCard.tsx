"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  text: string;
  done: boolean;
  onToggle?: () => void;
};

export default function TaskCard({
  text,
  done,
  onToggle,
}: Props) {
  const [justCompleted, setJustCompleted] = useState(false);
  const prevDone = useRef(done);

  useEffect(() => {
    if (done && !prevDone.current) {
      setJustCompleted(true);
      const timer = window.setTimeout(() => setJustCompleted(false), 720);
      prevDone.current = done;
      return () => window.clearTimeout(timer);
    }
    prevDone.current = done;
  }, [done]);

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
          "group relative flex flex-col gap-3 overflow-hidden rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:rounded-3xl sm:p-5",
          "transition-all duration-300 ease-out",
          "sm:hover:-translate-y-0.5 sm:hover:shadow-[0_10px_28px_-12px_rgba(251,191,136,0.55)]",
          "sm:hover:border-amber-200/90",
          done
            ? "border-emerald-100/90 bg-gradient-to-br from-emerald-50/80 via-white to-amber-50/40"
            : "border-orange-100/80 bg-gradient-to-br from-orange-50/90 via-[#FFFBF5] to-amber-50/50",
          justCompleted ? "task-card-complete" : "",
        ].join(" ")}
      >
        {/* 悬停时的柔光层 */}
        <div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          aria-hidden
        >
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-amber-200/25 blur-2xl" />
          <div className="absolute -bottom-4 -left-4 h-20 w-20 rounded-full bg-orange-200/20 blur-xl" />
        </div>

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

          <span className="relative min-w-0">
            <span
              className={[
                "block break-words text-base leading-relaxed transition-colors duration-300 sm:truncate sm:text-lg",
                done
                  ? "font-normal text-stone-400"
                  : "font-medium text-stone-700 group-hover:text-stone-800",
              ].join(" ")}
            >
              {text}
            </span>
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

        <button
          type="button"
          onClick={onToggle}
          disabled={!onToggle}
          className={[
            "relative shrink-0 self-end rounded-full px-3.5 py-1.5 text-sm transition-all duration-300 sm:self-auto",
            "sm:group-hover:scale-105",
            "cursor-pointer disabled:cursor-default",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/80",
            done
              ? "bg-emerald-100/90 text-emerald-700 ring-1 ring-emerald-200/60 hover:bg-emerald-200/80"
              : "bg-amber-100/90 text-amber-800/90 ring-1 ring-amber-200/50 hover:bg-amber-200/80",
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
    </>
  );
}
