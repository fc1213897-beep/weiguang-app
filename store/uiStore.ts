import { create } from "zustand";
import type { MobileTabId } from "@/types/ui";

type UIState = {
  mobileTab: MobileTabId;
  createPlanOpen: boolean;
  setMobileTab: (tab: MobileTabId) => void;
  setCreatePlanOpen: (open: boolean) => void;
};

export const useUIStore = create<UIState>((set) => ({
  mobileTab: "tasks",
  createPlanOpen: false,
  setMobileTab: (tab) => set({ mobileTab: tab }),
  setCreatePlanOpen: (open) => set({ createPlanOpen: open }),
}));
