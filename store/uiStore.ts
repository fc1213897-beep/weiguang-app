import { create } from "zustand";
import type { DesktopNavId, MobileTabId } from "@/types/ui";

type UIState = {
  mobileTab: MobileTabId;
  desktopNav: DesktopNavId;
  createPlanOpen: boolean;
  authSheetOpen: boolean;
  companionOpen: boolean;
  companionToast: string | null;
  setMobileTab: (tab: MobileTabId) => void;
  setDesktopNav: (nav: DesktopNavId) => void;
  setCreatePlanOpen: (open: boolean) => void;
  setAuthSheetOpen: (open: boolean) => void;
  setCompanionOpen: (open: boolean) => void;
  showCompanionToast: (message: string) => void;
  clearCompanionToast: () => void;
};

export const useUIStore = create<UIState>((set) => ({
  mobileTab: "tasks",
  desktopNav: "today",
  createPlanOpen: false,
  authSheetOpen: false,
  companionOpen: false,
  companionToast: null,
  setMobileTab: (tab) => set({ mobileTab: tab }),
  setDesktopNav: (nav) => set({ desktopNav: nav }),
  setCreatePlanOpen: (open) => set({ createPlanOpen: open }),
  setAuthSheetOpen: (open) => set({ authSheetOpen: open }),
  setCompanionOpen: (open) => set({ companionOpen: open }),
  showCompanionToast: (message) => set({ companionToast: message }),
  clearCompanionToast: () => set({ companionToast: null }),
}));
