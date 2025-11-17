import { create } from "zustand";

interface SidebarState {
  open: boolean;
  openSidebar: () => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  open: false,
  openSidebar: () => set((state) => ({ open: !state.open })),
}));
