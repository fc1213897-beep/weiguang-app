"use client";

import { useEffect, useMemo, useState } from "react";
import {
  addDaysToDateString,
  formatDateString,
  formatSelectedDateDisplay,
  getMonthCalendarDays,
  getTodayDateString,
  parseDateString,
} from "@/lib/task-utils";

type Props = {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  /** 有任务的日期集合，用于日历上显示小圆点 */
  datesWithTasks?: Set<string>;
  /** 手机端默认 false 收起，桌面端可 true */
  defaultExpanded?: boolean;
};

const WEEKDAY_LABELS = ["日", "一", "二", "三", "四", "五", "六"];

export default function TodoCalendar({
  selectedDate,
  onSelectDate,
  datesWithTasks,
  defaultExpanded = false,
}: Props) {
  const today = getTodayDateString();
  const parsedSelected = parseDateString(selectedDate);
  const initialView = parsedSelected ?? new Date();

  const [expanded, setExpanded] = useState(defaultExpanded);
  const [viewYear, setViewYear] = useState(initialView.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialView.getMonth());

  // 外部切换选中日期时，同步月历视图
  useEffect(() => {
    const parsed = parseDateString(selectedDate);
    if (!parsed) return;
    setViewYear(parsed.getFullYear());
    setViewMonth(parsed.getMonth());
  }, [selectedDate]);

  const calendarDays = useMemo(
    () => getMonthCalendarDays(viewYear, viewMonth),
    [viewYear, viewMonth]
  );

  const selectedHasTasks = datesWithTasks?.has(selectedDate);
  const isToday = selectedDate === today;

  function goPrevMonth() {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  }

  function goNextMonth() {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

  function goToday() {
    const now = new Date();
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
    onSelectDate(today);
  }

  function toggleExpanded() {
    setExpanded((prev) => !prev);
  }

  return (
    <div className="w-full min-w-0 max-w-full overflow-hidden rounded-2xl border border-orange-100/80 bg-gradient-to-br from-orange-50/60 via-white to-amber-50/40 p-3 sm:rounded-3xl sm:p-4">
      {/* 精简态：日期切换 + 展开入口 */}
      {!expanded && (
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onSelectDate(addDaysToDateString(selectedDate, -1))}
              className="shrink-0 rounded-xl px-2.5 py-2 text-sm text-stone-500 transition hover:bg-orange-100/80 hover:text-orange-600"
              aria-label="前一天"
            >
              ‹
            </button>

            <button
              type="button"
              onClick={toggleExpanded}
              className="min-w-0 flex-1 rounded-xl bg-white/80 px-3 py-2 text-center transition hover:bg-orange-50/90"
              aria-expanded={false}
            >
              <p className="truncate text-sm font-semibold text-stone-700 sm:text-base">
                {formatSelectedDateDisplay(selectedDate)}
              </p>
              <p className="mt-0.5 text-xs text-stone-400">
                {isToday ? "今天" : "已选日期"}
                {selectedHasTasks ? " · 有任务" : ""}
              </p>
            </button>

            <button
              type="button"
              onClick={() => onSelectDate(addDaysToDateString(selectedDate, 1))}
              className="shrink-0 rounded-xl px-2.5 py-2 text-sm text-stone-500 transition hover:bg-orange-100/80 hover:text-orange-600"
              aria-label="后一天"
            >
              ›
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {!isToday && (
              <button
                type="button"
                onClick={goToday}
                className="rounded-xl bg-orange-100/70 px-3 py-1.5 text-xs font-medium text-orange-700 transition hover:bg-orange-200/80"
              >
                回到今天
              </button>
            )}
            <button
              type="button"
              onClick={toggleExpanded}
              className="flex-1 rounded-xl border border-orange-200/60 bg-white/60 py-1.5 text-xs font-medium text-orange-600 transition hover:bg-orange-50 sm:text-sm"
            >
              展开日历 ▾
            </button>
          </div>
        </div>
      )}

      {/* 完整月历 */}
      {expanded && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={goPrevMonth}
              className="rounded-xl px-2.5 py-1.5 text-sm text-stone-500 transition hover:bg-orange-100/80 hover:text-orange-600"
              aria-label="上个月"
            >
              ‹
            </button>

            <p className="min-w-0 flex-1 text-center text-sm font-semibold text-stone-700 sm:text-base">
              {viewYear}年{viewMonth + 1}月
            </p>

            <button
              type="button"
              onClick={goNextMonth}
              className="rounded-xl px-2.5 py-1.5 text-sm text-stone-500 transition hover:bg-orange-100/80 hover:text-orange-600"
              aria-label="下个月"
            >
              ›
            </button>
          </div>

          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={goToday}
              className="rounded-xl bg-orange-100/70 px-3 py-1.5 text-xs font-medium text-orange-700 transition hover:bg-orange-200/80 sm:text-sm"
            >
              回到今天
            </button>
            <button
              type="button"
              onClick={toggleExpanded}
              className="flex-1 rounded-xl border border-orange-200/60 bg-white/60 py-1.5 text-xs font-medium text-orange-600 transition hover:bg-orange-50 sm:text-sm"
              aria-expanded={true}
            >
              收起日历 ▴
            </button>
          </div>

          <div className="mt-3 grid grid-cols-7 gap-1 text-center text-xs text-stone-400 sm:gap-1.5 sm:text-sm">
            {WEEKDAY_LABELS.map((label) => (
              <span key={label} className="py-1 font-medium">
                {label}
              </span>
            ))}
          </div>

          <div className="mt-1 grid grid-cols-7 gap-1 sm:gap-1.5">
            {calendarDays.map((day) => {
              const dateStr = formatDateString(day);
              const isCurrentMonth = day.getMonth() === viewMonth;
              const isSelected = dateStr === selectedDate;
              const isTodayCell = dateStr === today;
              const hasTasks = datesWithTasks?.has(dateStr);

              return (
                <button
                  key={dateStr}
                  type="button"
                  onClick={() => onSelectDate(dateStr)}
                  className={[
                    "relative flex min-h-[2.25rem] flex-col items-center justify-center rounded-xl text-xs transition sm:min-h-[2.5rem] sm:text-sm",
                    isCurrentMonth ? "text-stone-700" : "text-stone-300",
                    isSelected
                      ? "bg-orange-500 font-semibold text-white shadow-sm"
                      : "hover:bg-orange-100/70",
                    isTodayCell && !isSelected
                      ? "ring-2 ring-orange-300/80 ring-offset-1"
                      : "",
                  ].join(" ")}
                  aria-label={`选择 ${dateStr}`}
                  aria-pressed={isSelected}
                >
                  <span>{day.getDate()}</span>
                  {hasTasks && (
                    <span
                      className={[
                        "absolute bottom-0.5 h-1 w-1 rounded-full",
                        isSelected ? "bg-white/90" : "bg-orange-400",
                      ].join(" ")}
                      aria-hidden
                    />
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
