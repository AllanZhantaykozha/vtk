import { getStudents, StudentsParams } from "@/src/entities/User/api/queries";
import { Student } from "@/src/entities/User/types";
import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";

interface StudentsState {
  students: Student[] | null;
  isLoadingStudents: boolean;

  fetchStudents: (filters?: StudentsParams) => Promise<void>;
  // createStudents: (StudentsData: StudentsFormData) => Promise<void>;
  // updateStudents: (
  //   id: number,
  //   StudentsData: Partial<StudentsFormData>
  // ) => Promise<void>;
  deleteStudents: (id: number) => Promise<void>;
}

export const useStudentsStore = create<StudentsState>()(
  persist(
    devtools(
      (set, get) => ({
        statistics: null,
        isLoadingStudents: false,

        fetchStudents: async (filters?: StudentsParams) => {
          const { isLoadingStudents } = get();
          if (isLoadingStudents) return;

          set({ isLoadingStudents: true });

          try {
            const data = await getStudents(filters);
            if (typeof data === "string") {
              console.error("Statistic fetch error:", data);
              set({ students: null });
            } else {
              set({ students: data });
            }
          } catch (error) {
            console.error("Error in fetchStatistic:", error);
            set({ students: null });
          } finally {
            set({ isLoadingStudents: false });
          }
        },
      }),
      { name: "students-store" }
    ),
    {
      name: "students-storage",
      partialize: (state) => ({ statistics: state.students }),
    }
  )
);
