import { getAllSubjects } from "@/src/entities/Subject/api/queries";
import { Subject } from "@/src/entities/Subject/types";
import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";

interface SubjectState {
  subjects: Subject[] | null;
  isLoadingSubjects: boolean;

  fetchSubjects: () => Promise<void>;
}

export const useSubjectStore = create<SubjectState>()(
  persist(
    devtools(
      (set, get) => ({
        statistics: null,
        isLoading: false,

        fetchSubjects: async () => {
          const { isLoadingSubjects } = get();
          if (isLoadingSubjects) return;

          set({ isLoadingSubjects: true });

          try {
            const data = await getAllSubjects();
            if (typeof data === "string") {
              console.error("subjects fetch error:", data);
              set({ subjects: null });
            } else {
              set({ subjects: data });
            }
          } catch (error) {
            console.error("Error in fetchSubjects:", error);
            set({ subjects: null });
          } finally {
            set({ isLoadingSubjects: false });
          }
        },
      }),
      { name: "subjects-store" }
    ),
    {
      name: "subjects-storage",
      partialize: (state) => ({ subjects: state.subjects }),
    }
  )
);
