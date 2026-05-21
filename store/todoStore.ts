import { create } from "zustand";
import type { TaskItem } from "@/types/task";
import { generateTaskId, getTodayDateString } from "@/lib/task-utils";

type TodoState = {
  selectedDate: string;
  tasks: TaskItem[];
  taskDraft: string;
  storageReady: boolean;
  setSelectedDate: (date: string) => void;
  setTaskDraft: (draft: string) => void;
  setTasks: (tasks: TaskItem[]) => void;
  setStorageReady: (ready: boolean) => void;
  addTask: () => void;
  toggleTask: (id: string) => void;
  editTask: (id: string, text: string) => void;
  deleteTask: (id: string) => void;
};

export const useTodoStore = create<TodoState>((set, get) => ({
  selectedDate: getTodayDateString(),
  tasks: [],
  taskDraft: "",
  storageReady: false,

  setSelectedDate: (date) => set({ selectedDate: date }),
  setTaskDraft: (draft) => set({ taskDraft: draft }),
  setTasks: (tasks) => set({ tasks }),
  setStorageReady: (ready) => set({ storageReady: ready }),

  addTask: () => {
    const { taskDraft, selectedDate, tasks } = get();
    const value = taskDraft.trim();
    if (!value) return;
    set({
      tasks: [
        ...tasks,
        { id: generateTaskId(), text: value, done: false, date: selectedDate },
      ],
      taskDraft: "",
    });
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
