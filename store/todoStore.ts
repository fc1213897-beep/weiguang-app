import { create } from "zustand";
import { createDefaultPlanDraft } from "@/lib/task-plan";
import {
  createTask as createCloudTask,
  deleteTask as deleteCloudTask,
  updateTask as updateCloudTask,
} from "@/lib/supabase/tasks";
import { taskItemToCreateInput, taskRowToTaskItem } from "@/lib/task-cloud-map";
import type { PlanDraft, TaskItem } from "@/types/task";
import { getTaskCompleteLine } from "@/lib/companion-feedback";
import { loadFromStorage, STORAGE_KEYS } from "@/lib/storage";
import {
  computeTaskStats,
  generateTaskId,
  getTodayDateString,
  isValidDateString,
} from "@/lib/task-utils";
import { useUIStore } from "@/store/uiStore";
import type { CountdownSettings } from "@/types/countdown";

type TodoState = {
  selectedDate: string;
  tasks: TaskItem[];
  planDraft: PlanDraft;
  storageReady: boolean;
  /** 已登录时走 Supabase，不写 localStorage */
  syncEnabled: boolean;
  setSelectedDate: (date: string) => void;
  setPlanDraft: (patch: Partial<PlanDraft>) => void;
  resetPlanDraft: () => void;
  setTasks: (tasks: TaskItem[]) => void;
  setStorageReady: (ready: boolean) => void;
  setSyncEnabled: (enabled: boolean) => void;
  /** 用云端数据替换某一天的本地任务列表 */
  mergeTasksForDate: (date: string, items: TaskItem[]) => void;
  addTask: () => boolean;
  addTaskFromDraft: (draft: PlanDraft, options?: { useSelectedDate?: boolean }) => boolean;
  /** 批量写入计划任务（倒计时生成等） */
  addTasksFromDrafts: (drafts: PlanDraft[]) => number;
  toggleTask: (id: string) => void;
  editTask: (id: string, text: string) => void;
  setTaskRemind: (id: string, remindAt: string | null) => void;
  deleteTask: (id: string) => void;
};

export const useTodoStore = create<TodoState>((set, get) => ({
  selectedDate: getTodayDateString(),
  tasks: [],
  planDraft: createDefaultPlanDraft(getTodayDateString()),
  storageReady: false,
  syncEnabled: false,

  setSelectedDate: (date) =>
    set((s) => ({
      selectedDate: date,
      planDraft: { ...s.planDraft, date },
    })),

  setPlanDraft: (patch) =>
    set((s) => ({ planDraft: { ...s.planDraft, ...patch } })),

  resetPlanDraft: () =>
    set((s) => ({
      planDraft: createDefaultPlanDraft(s.selectedDate),
    })),

  setTasks: (tasks) => set({ tasks }),
  setStorageReady: (ready) => set({ storageReady: ready }),
  setSyncEnabled: (enabled) => set({ syncEnabled: enabled }),

  mergeTasksForDate: (date, items) =>
    set((s) => ({
      tasks: [...s.tasks.filter((t) => t.date !== date), ...items],
    })),

  addTaskFromDraft: (draft, options) => {
    const value = draft.text.trim();
    if (!value) return false;
    const { selectedDate, tasks, syncEnabled } = get();
    const taskDate =
      options?.useSelectedDate || !draft.date || !isValidDateString(draft.date)
        ? selectedDate
        : draft.date;

    const optimistic: TaskItem = {
      id: generateTaskId(),
      text: value,
      done: false,
      date: taskDate,
      category: draft.category,
      priority: draft.priority,
      pomodoroMinutes: draft.pomodoroMinutes,
      note: draft.note?.trim() ?? "",
    };

    set({ tasks: [...tasks, optimistic] });

    if (syncEnabled) {
      void (async () => {
        const res = await createCloudTask(taskItemToCreateInput(optimistic));
        if (res.data) {
          const saved = taskRowToTaskItem(res.data);
          set((s) => ({
            tasks: s.tasks.map((t) => (t.id === optimistic.id ? saved : t)),
          }));
        } else {
          set((s) => ({
            tasks: s.tasks.filter((t) => t.id !== optimistic.id),
          }));
          console.error("[todo sync] createTask", res.error);
        }
      })();
    }

    return true;
  },

  addTask: () => {
    const { planDraft } = get();
    const ok = get().addTaskFromDraft(planDraft);
    if (ok) get().resetPlanDraft();
    return ok;
  },

  addTasksFromDrafts: (drafts) => {
    let count = 0;
    for (const draft of drafts) {
      const value = draft.text.trim();
      if (!value || !draft.date) continue;
      const { syncEnabled } = get();

      const optimistic: TaskItem = {
        id: generateTaskId(),
        text: value,
        done: false,
        date: draft.date,
        category: draft.category,
        priority: draft.priority,
        pomodoroMinutes: draft.pomodoroMinutes,
        note: draft.note?.trim() ?? "",
      };

      set({ tasks: [...get().tasks, optimistic] });
      count++;

      if (syncEnabled) {
        void (async () => {
          const res = await createCloudTask(taskItemToCreateInput(optimistic));
          if (res.data) {
            const saved = taskRowToTaskItem(res.data);
            set((s) => ({
              tasks: s.tasks.map((t) =>
                t.id === optimistic.id ? saved : t
              ),
            }));
          } else {
            set((s) => ({
              tasks: s.tasks.filter((t) => t.id !== optimistic.id),
            }));
            console.error("[todo sync] createTask batch", res.error);
          }
        })();
      }
    }
    return count;
  },

  toggleTask: (id) => {
    const item = get().tasks.find((t) => t.id === id);
    if (!item) return;
    const nextDone = !item.done;
    set((s) => ({
      tasks: s.tasks.map((t) =>
        t.id === id
          ? {
              ...t,
              done: nextDone,
              ...(nextDone ? { remindAt: null, remindSentAt: null } : {}),
            }
          : t
      ),
    }));
    if (get().syncEnabled) {
      void updateCloudTask(id, {
        completed: nextDone,
        ...(nextDone ? { remind_at: null, remind_sent_at: null } : {}),
      }).then((res) => {
        if (res.error) console.error("[todo sync] updateTask", res.error);
      });
    }

    if (nextDone) {
      const updatedTasks = get().tasks;
      const countdownSettings = loadFromStorage<CountdownSettings>(
        STORAGE_KEYS.countdown,
        { targets: [] }
      );
      let line = getTaskCompleteLine(
        { ...item, done: true },
        updatedTasks,
        countdownSettings
      );
      const today = getTodayDateString();
      const todayStats = computeTaskStats(
        updatedTasks.filter((t) => t.date === today)
      );
      if (todayStats.total > 0 && todayStats.pending === 0) {
        line = "今天的任务都完成啦！给自己一点小小的奖励吧 ✨";
      }
      useUIStore.getState().showCompanionToast(line);
    }
  },

  editTask: (id, text) => {
    const value = text.trim();
    if (!value) return;
    set((s) => ({
      tasks: s.tasks.map((item) =>
        item.id === id ? { ...item, text: value } : item
      ),
    }));
    if (get().syncEnabled) {
      void updateCloudTask(id, { title: value }).then((res) => {
        if (res.error) console.error("[todo sync] updateTask", res.error);
      });
    }
  },

  setTaskRemind: (id, remindAt) => {
    set((s) => ({
      tasks: s.tasks.map((item) =>
        item.id === id
          ? { ...item, remindAt, remindSentAt: null }
          : item
      ),
    }));
    if (get().syncEnabled) {
      void updateCloudTask(id, {
        remind_at: remindAt,
        remind_sent_at: null,
      }).then((res) => {
        if (res.error) console.error("[todo sync] setTaskRemind", res.error);
      });
    }
  },

  deleteTask: (id) => {
    set((s) => ({ tasks: s.tasks.filter((item) => item.id !== id) }));
    if (get().syncEnabled) {
      void deleteCloudTask(id).then((res) => {
        if (res.error) console.error("[todo sync] deleteTask", res.error);
      });
    }
  },
}));
