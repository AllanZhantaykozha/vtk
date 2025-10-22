import { createSubject } from "@/src/entities/Subject/api";
import {
  updateSubject,
  deleteSubject,
} from "@/src/entities/Subject/api/mutations";
import { getAllSubjects } from "@/src/entities/Subject/api/queries";
import { Subject } from "@/src/entities/Subject/types";
import { SubjectFormData } from "@/src/widgets/CreatePage/CreateForm";
import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";

interface SubjectState {
  subjects: Subject[] | null;
  isLoadingSubject: boolean;

  fetchSubject: () => Promise<void>;
  createSubject: (subjectData: SubjectFormData) => Promise<void>;
  updateSubject: (id: number, subjectData: Partial<Subject>) => Promise<void>;
  deleteSubject: (id: number) => Promise<void>;
}

export const useSubjectStore = create<SubjectState>()(
  persist(
    devtools(
      (set, get) => ({
        statistics: null,
        isLoading: false,

        fetchSubject: async () => {
          const { isLoadingSubject } = get();
          if (isLoadingSubject) return;

          set({ isLoadingSubject: true });

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
            set({ isLoadingSubject: false });
          }
        },

        createSubject: async (subjectData: SubjectFormData) => {
          const { isLoadingSubject } = get();
          if (isLoadingSubject) return;

          set({ isLoadingSubject: true });

          try {
            const result = await createSubject(subjectData);
            if (typeof result === "string") {
              console.error("Create subject error:", result);
              return;
            }
            await get().fetchSubject();
          } catch (error) {
            console.error("Error in createSubject:", error);
          } finally {
            set({ isLoadingSubject: false });
          }
        },

        updateSubject: async (
          id: number,
          subjectData: Partial<SubjectFormData>
        ) => {
          const { isLoadingSubject } = get();
          if (isLoadingSubject) return;

          set({ isLoadingSubject: true });

          try {
            const result = await updateSubject(id, subjectData);
            if (typeof result === "string") {
              console.error("Update subject error:", result);
              return;
            }
            await get().fetchSubject();
          } catch (error) {
            console.error("Error in update subject:", error);
          } finally {
            set({ isLoadingSubject: false });
          }
        },

        deleteSubject: async (id: number) => {
          const { isLoadingSubject } = get();
          if (isLoadingSubject) return;

          set({ isLoadingSubject: true });

          try {
            const result = await deleteSubject(id);
            if (typeof result === "string") {
              console.error("Delete subject error:", result);
              return;
            }
            await get().fetchSubject();
          } catch (error) {
            console.error("Error in delete subject:", error);
          } finally {
            set({ isLoadingSubject: false });
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
