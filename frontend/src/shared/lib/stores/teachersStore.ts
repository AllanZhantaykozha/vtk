import { getTeachers } from "@/src/entities/User/api";
import { TeachersParams } from "@/src/entities/User/api/queries";
import { Teacher } from "@/src/entities/User/types";
import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";

interface TeachersState {
  teachers: Teacher[] | null;
  isLoadingTeachers: boolean;

  fetchTeachers: (filters?: TeachersParams) => Promise<void>;
  // createTeachers: (TeachersData: TeachersFormData) => Promise<void>;
  // updateTeachers: (
  //   id: number,
  //   TeachersData: Partial<TeachersFormData>
  // ) => Promise<void>;
  deleteTeachers: (id: number) => Promise<void>;
}

export const useTeachersStore = create<TeachersState>()(
  persist(
    devtools(
      (set, get) => ({
        statistics: null,
        isLoadingTeachers: false,

        fetchTeachers: async (filters?: TeachersParams) => {
          const { isLoadingTeachers } = get();
          if (isLoadingTeachers) return;

          set({ isLoadingTeachers: true });

          try {
            const data = await getTeachers(filters);
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
            set({ isLoadingTeachers: false });
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
