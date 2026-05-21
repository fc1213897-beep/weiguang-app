import { create } from "zustand";
import type { DesktopNavId, MobileTabId } from "@/types/ui";

type UIState = {
  mobileTab: MobileTabId;
  desktopNav: DesktopNavId;
  createPlanOpen: boolean;
  setMobileTab: (tab: MobileTabId) => void;
  setDesktopNav: (nav: DesktopNavId) => void;
  setCreatePlanOpen: (open: boolean) => void;
};

export const useUIStore = create<UIState>((set) => ({
  mobileTab: "tasks",
  desktopNav: "today",
  createPlanOpen: false,
  setMobileTab: (tab) => set({ mobileTab: tab }),
  setDesktopNav: (nav) => set({ desktopNav: nav }),
  setCreatePlanOpen: (open) => set({ createPlanOpen: open }),
}));
