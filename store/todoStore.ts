import { create } from "zustand";
import { createDefaultPlanDraft } from "@/lib/task-plan";
import type { PlanDraft, TaskItem } from "@/types/task";
import {
  generateTaskId,
  getTodayDateString,
  isValidDateString,
} from "@/lib/task-utils";

type TodoState = {
  selectedDate: string;
  tasks: TaskItem[];
  planDraft: PlanDraft;
  storageReady: boolean;
  setSelectedDate: (date: string) => void;
  setPlanDraft: (patch: Partial<PlanDraft>) => void;
  resetPlanDraft: () => void;
  setTasks: (tasks: TaskItem[]) => void;
  setStorageReady: (ready: boolean) => void;
  addTask: () => boolean;
  addTaskFromDraft: (draft: PlanDraft, options?: { useSelectedDate?: boolean }) => boolean;
  toggleTask: (id: string) => void;
  editTask: (id: string, text: string) => void;
  deleteTask: (id: string) => void;
};

export const useTodoStore = create<TodoState>((set, get) => ({
  selectedDate: getTodayDateString(),
  tasks: [],
  planDraft: createDefaultPlanDraft(getTodayDateString()),
  storageReady: false,

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

  addTaskFromDraft: (draft, options) => {
    const value = draft.text.trim();
    if (!value) return false;
    const { selectedDate, tasks } = get();
    const taskDate =
      options?.useSelectedDate || !draft.date || !isValidDateString(draft.date)
        ? selectedDate
        : draft.date;

    set({
      tasks: [
        ...tasks,
        {
          id: generateTaskId(),
          text: value,
          done: false,
          date: taskDate,
          category: draft.category,
          priority: draft.priority,
          pomodoroMinutes: draft.pomodoroMinutes,
          note: draft.note?.trim() ?? "",
        },
      ],
    });
    return true;
  },

  addTask: () => {
    const { planDraft } = get();
    const ok = get().addTaskFromDraft(planDraft);
    if (ok) get().resetPlanDraft();
    return ok;
  },

  toggleTask: (id) =>
    set((s) => ({
      tasks: s.tasks.map((item) =>
        item.id === id ? { ...item, done: !item.done } : item
      ),
    })),

  editTask: (id, text) => {
    const value = text.trim();
    if (!value) return;
    set((s) => ({
      tasks: s.tasks.map((item) =>
        item.id === id ? { ...item, text: value } : item
      ),
    }));
  },

  deleteTask: (id) =>
    set((s) => ({ tasks: s.tasks.filter((item) => item.id !== id) })),
}));
