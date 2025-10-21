import { getNotifications } from "@/src/entities/Notification/api";
import { getTeachers } from "@/src/entities/User/api";
import { Teacher } from "@/src/entities/User/types";
import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";

interface TeachersState {
  teachers: Teacher[] | null;
  isLoading: boolean;

  fetchTeachers: () => Promise<void>;
}

export const useTeachersStore = create<TeachersState>()(
  persist(
    devtools(
      (set, get) => ({
        statistics: null,
        isLoading: false,

        fetchTeachers: async () => {
          const { isLoading } = get();
          if (isLoading) return;

          set({ isLoading: true });

          try {
            const data = await getTeachers();
            if (typeof data === "string") {
              console.error("Statistic fetch error:", data);
              set({ teachers: null });
            } else {
              set({ teachers: data });
            }
          } catch (error) {
            console.error("Error in fetchStatistic:", error);
            set({ teachers: null });
          } finally {
            set({ isLoading: false });
          }
        },
      }),
      { name: "teachers-store" }
    ),
    {
      name: "teachers-storage",
      partialize: (state) => ({ statistics: state.teachers }),
    }
  )
);
