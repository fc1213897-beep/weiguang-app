"use client";

import { useEffect, useRef, useState } from "react";
import { isCountdownAutoTask } from "@/lib/countdown/note-utils";

type Props = {
  text: string;
  done: boolean;
  note?: string;
  onToggle?: () => void;
  onSave?: (text: string) => void;
  onDelete?: () => void;
};

/** 手机端紧凑任务卡：大触控区勾选，备考任务优先展示 */
export default function MobileTaskCard({
  text,
  done,
  note = "",
  onToggle,
  onSave,
  onDelete,
}: Props) {
  const isExam = isCountdownAutoTask(note);
  const [justCompleted, setJustCompleted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(text);
  const prevDone = useRef(done);

  useEffect(() => {
    if (!isEditing) setEditValue(text);
  }, [text, isEditing]);

  useEffect(() => {
    if (done && !prevDone.current) {
      setJustCompleted(true);
      const t = window.setTimeout(() => setJustCompleted(false), 600);
      prevDone.current = done;
      return () => window.clearTimeout(t);
    }
    prevDone.current = done;
  }, [done]);

  if (isEditing) {
    return (
      <div className="rounded-xl border border-orange-200 bg-white p-3">
        <input
          className="w-full rounded-lg border border-stone-200 px-3 py-2.5 text-base outline-none focus:border-orange-400"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          autoFocus
        />
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            onClick={() => {
              const v = editValue.trim();
              if (v) onSave?.(v);
              setIsEditing(false);
            }}
            className="flex-1 rounded-lg bg-orange-500 py-2 text-sm text-white"
          >
            保存
          </button>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="rounded-lg bg-stone-100 px-4 py-2 text-sm text-stone-600"
          >
            取消
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={[
        "relative flex items-center gap-3 rounded-xl border px-3 py-3 transition-all duration-300",
        done
          ? "border-emerald-100/80 bg-emerald-50/40"
          : isExam
            ? "border-indigo-100/80 bg-indigo-50/30"
            : "border-stone-200/70 bg-white",
        justCompleted ? "scale-[1.02] shadow-md" : "",
      ].join(" ")}
    >
      <button
        type="button"
        onClick={onToggle}
        disabled={!onToggle}
        aria-label={done ? "标记为未完成" : "标记为完成"}
        className={[
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 transition-all active:scale-95",
          done
            ? "border-emerald-400 bg-emerald-500 text-white"
            : "border-stone-300 bg-white text-transparent",
        ].join(" ")}
      >
        {done ? (
          <span className="text-lg font-bold" aria-hidden>
            ✓
          </span>
        ) : null}
      </button>

      <div className="min-w-0 flex-1">
        <p
          className={[
            "text-[15px] leading-snug",
            done ? "text-stone-400 line-through" : "font-medium text-stone-800",
          ].join(" ")}
        >
          {text}
        </p>
        {isExam && !done && (
          <span className="mt-1 inline-block rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-medium text-indigo-700">
            备考
          </span>
        )}
      </div>

      {(onSave || onDelete) && (
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="rounded-lg px-2 py-2 text-stone-400 active:bg-stone-100"
            aria-label="更多操作"
          >
            ⋮
          </button>
          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 top-full z-50 mt-1 min-w-[7rem] overflow-hidden rounded-xl border border-stone-200 bg-white py-1 shadow-lg">
                {onSave && (
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      setIsEditing(true);
                    }}
                    className="block w-full px-4 py-2.5 text-left text-sm text-stone-700 active:bg-stone-50"
                  >
                    编辑
                  </button>
                )}
                {onDelete && (
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      if (window.confirm("确定删除这条任务吗？")) onDelete();
                    }}
                    className="block w-full px-4 py-2.5 text-left text-sm text-rose-600 active:bg-rose-50"
                  >
                    删除
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
