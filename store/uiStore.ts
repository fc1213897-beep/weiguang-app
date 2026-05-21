import { create } from "zustand";
import type { MobileTabId } from "@/types/ui";

type UIState = {
  mobileTab: MobileTabId;
  setMobileTab: (tab: MobileTabId) => void;
};

export const useUIStore = create<UIState>((set) => ({
  mobileTab: "tasks",
  setMobileTab: (tab) => set({ mobileTab: tab }),
}));
