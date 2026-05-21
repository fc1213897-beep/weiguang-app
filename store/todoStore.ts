import { create } from "zustand";
import { DEFAULT_PLAN_DRAFT } from "@/lib/task-plan";
import type { PlanDraft, TaskItem } from "@/types/task";
import { generateTaskId, getTodayDateString } from "@/lib/task-utils";

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
  addTaskFromDraft: (draft: PlanDraft) => boolean;
  toggleTask: (id: string) => void;
  editTask: (id: string, text: string) => void;
  deleteTask: (id: string) => void;
};

export const useTodoStore = create<TodoState>((set, get) => ({
  selectedDate: getTodayDateString(),
  tasks: [],
  planDraft: { ...DEFAULT_PLAN_DRAFT },
  storageReady: false,

  setSelectedDate: (date) => set({ selectedDate: date }),
  setPlanDraft: (patch) =>
    set((s) => ({ planDraft: { ...s.planDraft, ...patch } })),
  resetPlanDraft: () => set({ planDraft: { ...DEFAULT_PLAN_DRAFT } }),
  setTasks: (tasks) => set({ tasks }),
  setStorageReady: (ready) => set({ storageReady: ready }),

  addTaskFromDraft: (draft) => {
    const value = draft.text.trim();
    if (!value) return false;
    const { selectedDate, tasks } = get();
    set({
      tasks: [
        ...tasks,
        {
          id: generateTaskId(),
          text: value,
          done: false,
          date: selectedDate,
          category: draft.category,
          priority: draft.priority,
          pomodoroMinutes: draft.pomodoroMinutes,
        },
      ],
    });
    return true;
  },

  addTask: () => {
    const { planDraft } = get();
    const ok = get().addTaskFromDraft(planDraft);
    if (ok) set({ planDraft: { ...DEFAULT_PLAN_DRAFT } });
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
