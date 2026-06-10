import { create } from "zustand";
import { generatePlanId } from "@/lib/countdown/id-utils";
import {
  applyRecipe,
  createEmptyTarget,
} from "@/lib/countdown/load-recipes";
import {
  collectExistingCountdownNotes,
  generatePlansForTarget,
} from "@/lib/countdown/plan-orchestrator";
import { loadFromStorage, saveToStorage, STORAGE_KEYS } from "@/lib/storage";
import { getTodayDateString } from "@/lib/task-utils";
import { useTodoStore } from "@/store/todoStore";
import type {
  CountdownSettings,
  CountdownTarget,
  GeneratePlansResult,
  PlanBlueprint,
} from "@/types/countdown";

const DEFAULT_SETTINGS: CountdownSettings = {
  targets: [],
};

type CountdownState = {
  settings: CountdownSettings;
  storageReady: boolean;
  setStorageReady: (ready: boolean) => void;
  hydrate: () => void;
  persist: () => void;
  importSettings: (raw: CountdownSettings) => void;
  exportSettings: () => CountdownSettings;
  addFromRecipe: (
    recipeId: string,
    title: string,
    targetDate: string
  ) => string | null;
  addEmptyTarget: (title: string, targetDate: string) => string;
  updateTarget: (id: string, patch: Partial<CountdownTarget>) => void;
  removeTarget: (id: string) => void;
  addPlan: (targetId: string, plan: Omit<PlanBlueprint, "id">) => void;
  updatePlan: (
    targetId: string,
    planId: string,
    patch: Partial<PlanBlueprint>
  ) => void;
  removePlan: (targetId: string, planId: string) => void;
  setTargetStatus: (
    id: string,
    status: CountdownTarget["status"]
  ) => void;
  generatePlans: (targetId: string) => Promise<GeneratePlansResult>;
};

export const useCountdownStore = create<CountdownState>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  storageReady: false,

  setStorageReady: (ready) => set({ storageReady: ready }),

  hydrate: () => {
    const saved = loadFromStorage<CountdownSettings>(
      STORAGE_KEYS.countdown,
      DEFAULT_SETTINGS
    );
    set({
      settings: {
        targets: saved.targets ?? [],
      },
      storageReady: true,
    });
  },

  persist: () => {
    const { settings, storageReady } = get();
    if (!storageReady) return;
    saveToStorage(STORAGE_KEYS.countdown, settings);
  },

  importSettings: (raw) => {
    set({
      settings: {
        targets: raw.targets ?? [],
      },
    });
    get().persist();
  },

  exportSettings: () => get().settings,

  addFromRecipe: (recipeId, title, targetDate) => {
    const target = applyRecipe(recipeId, { title, targetDate });
    if (!target) return null;
    set((s) => ({
      settings: {
        ...s.settings,
        targets: [...s.settings.targets, target],
      },
    }));
    get().persist();
    return target.id;
  },

  addEmptyTarget: (title, targetDate) => {
    const target = createEmptyTarget(title, targetDate);
    set((s) => ({
      settings: {
        ...s.settings,
        targets: [...s.settings.targets, target],
      },
    }));
    get().persist();
    return target.id;
  },

  updateTarget: (id, patch) => {
    const now = new Date().toISOString();
    set((s) => ({
      settings: {
        ...s.settings,
        targets: s.settings.targets.map((t) =>
          t.id === id ? { ...t, ...patch, updatedAt: now } : t
        ),
      },
    }));
    get().persist();
  },

  removeTarget: (id) => {
    set((s) => ({
      settings: {
        ...s.settings,
        targets: s.settings.targets.filter((t) => t.id !== id),
      },
    }));
    get().persist();
  },

  addPlan: (targetId, plan) => {
    const now = new Date().toISOString();
    const newPlan: PlanBlueprint = { ...plan, id: generatePlanId() };
    set((s) => ({
      settings: {
        ...s.settings,
        targets: s.settings.targets.map((t) =>
          t.id === targetId
            ? {
                ...t,
                plans: [...t.plans, newPlan],
                updatedAt: now,
              }
            : t
        ),
      },
    }));
    get().persist();
  },

  updatePlan: (targetId, planId, patch) => {
    const now = new Date().toISOString();
    set((s) => ({
      settings: {
        ...s.settings,
        targets: s.settings.targets.map((t) =>
          t.id === targetId
            ? {
                ...t,
                plans: t.plans.map((p) =>
                  p.id === planId ? { ...p, ...patch } : p
                ),
                updatedAt: now,
              }
            : t
        ),
      },
    }));
    get().persist();
  },

  removePlan: (targetId, planId) => {
    const now = new Date().toISOString();
    set((s) => ({
      settings: {
        ...s.settings,
        targets: s.settings.targets.map((t) =>
          t.id === targetId
            ? {
                ...t,
                plans: t.plans.filter((p) => p.id !== planId),
                updatedAt: now,
              }
            : t
        ),
      },
    }));
    get().persist();
  },

  setTargetStatus: (id, status) => {
    get().updateTarget(id, { status });
  },

  generatePlans: async (targetId) => {
    const target = get().settings.targets.find((t) => t.id === targetId);
    if (!target) {
      return { created: 0, skipped: 0, warnings: ["未找到倒计时目标"] };
    }

    const tasks = useTodoStore.getState().tasks;
    const existingNotes = collectExistingCountdownNotes(tasks);
    const { drafts, result, lastGeneratedUntil } =
      await generatePlansForTarget(target, { existingNotes });

    if (drafts.length > 0) {
      useTodoStore.getState().addTasksFromDrafts(drafts);
    }

    const today = getTodayDateString();
    get().updateTarget(targetId, {
      lastGeneratedUntil,
      status: target.status === "draft" ? "active" : target.status,
      startDate:
        target.startDate > today ? today : target.startDate,
    });

    return result;
  },
}));
