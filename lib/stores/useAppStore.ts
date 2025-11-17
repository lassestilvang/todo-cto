import { create } from "zustand";
import { ViewType } from "@/lib/types";

interface AppState {
  currentView: ViewType;
  currentListId: string | null;
  currentLabelId: string | null;
  showCompletedTasks: boolean;
  sidebarCollapsed: boolean;
  searchQuery: string;
  setCurrentView: (view: ViewType) => void;
  setCurrentListId: (id: string | null) => void;
  setCurrentLabelId: (id: string | null) => void;
  toggleShowCompletedTasks: () => void;
  toggleSidebar: () => void;
  setSearchQuery: (query: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentView: "today",
  currentListId: null,
  currentLabelId: null,
  showCompletedTasks: false,
  sidebarCollapsed: false,
  searchQuery: "",
  setCurrentView: (view) =>
    set({ currentView: view, currentListId: null, currentLabelId: null }),
  setCurrentListId: (id) =>
    set({ currentListId: id, currentLabelId: null, currentView: id ? "list" : "today" }),
  setCurrentLabelId: (id) =>
    set({ currentLabelId: id, currentListId: null, currentView: id ? "label" : "today" }),
  toggleShowCompletedTasks: () =>
    set((state) => ({ showCompletedTasks: !state.showCompletedTasks })),
  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSearchQuery: (query) => set({ searchQuery: query }),
}));
