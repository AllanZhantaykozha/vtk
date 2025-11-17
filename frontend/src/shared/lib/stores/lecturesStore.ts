import { Lecture } from "@/src/entities/Lecture/types";
import {
  CreateLectureDto,
  UpdateLectureDto,
  LectureFilters,
  getLectures,
  getLectureById,
} from "@/src/entities/Lecture/api/queries";
import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";
import {
  createLecture,
  updateLecture,
  deleteLecture,
} from "@/src/entities/Lecture/api/mutations";

interface LecturesState {
  lectures: Lecture[] | null;
  currentLecture: Lecture | null;
  isLoadingLectures: boolean;
  error: string;

  fetchLectures: (filters?: LectureFilters) => Promise<void>;
  fetchLectureById: (id: number) => Promise<void>;
  createLecture: (lectureData: CreateLectureDto) => Promise<boolean>;
  updateLecture: (id: number, lectureData: UpdateLectureDto) => Promise<void>;
  deleteLecture: (id: number) => Promise<void>;
}

export const useLecturesStore = create<LecturesState>()(
  persist(
    devtools(
      (set, get) => ({
        lectures: null,
        currentLecture: null,
        isLoadingLectures: false,

        fetchLectures: async (filters?: LectureFilters) => {
          const { isLoadingLectures } = get();
          if (isLoadingLectures) return; // Нет дубликатов

          set({ isLoadingLectures: true });

          try {
            const data = await getLectures(filters);
            if (typeof data === "string") {
              console.error("Lectures fetch error:", data);
              set({ lectures: null });
            } else {
              set({ lectures: data });
            }
          } catch (error) {
            console.error("Error in fetchLectures:", error);
            set({ lectures: null });
          } finally {
            set({ isLoadingLectures: false });
          }
        },

        fetchLectureById: async (id: number) => {
          const { isLoadingLectures } = get();
          if (isLoadingLectures) return; // Нет дубликатов

          set({ isLoadingLectures: true });

          try {
            const data = await getLectureById(id);
            if (typeof data === "string") {
              console.error("Lecture fetch error:", data);
              set({ currentLecture: null });
            } else {
              set({ currentLecture: data });
            }
          } catch (error) {
            console.error("Error in fetchLecture:", error);
            set({ currentLecture: null });
          } finally {
            set({ isLoadingLectures: false });
          }
        },

        createLecture: async (lectureData: CreateLectureDto) => {
          const { isLoadingLectures } = get();
          if (isLoadingLectures) return;

          set({ isLoadingLectures: true });

          try {
            const result = await createLecture(lectureData);
            if (typeof result === "string") {
              console.error("Create lecture error:", result);
              return;
            }
            await get().fetchLectures();

            return true;
          } catch (error) {
            console.error("Error in createLecture:", error);
          } finally {
            set({ isLoadingLectures: false });
          }
        },

        updateLecture: async (id: number, lectureData: UpdateLectureDto) => {
          const { isLoadingLectures } = get();
          if (isLoadingLectures) return;

          set({ isLoadingLectures: true });

          try {
            const result = await updateLecture(id, lectureData);
            if (typeof result === "string") {
              console.error("Update lecture error:", result);
              return;
            }
            await get().fetchLectures();
          } catch (error) {
            console.error("Error in update lecture:", error);
          } finally {
            set({ isLoadingLectures: false });
          }
        },

        deleteLecture: async (id: number) => {
          const { isLoadingLectures } = get();
          if (isLoadingLectures) return;

          set({ isLoadingLectures: true });

          try {
            const result = await deleteLecture(id);
            if (typeof result === "string") {
              console.error("Delete lecture error:", result);
              return;
            }
            await get().fetchLectures();
          } catch (error) {
            console.error("Error in delete lecture:", error);
          } finally {
            set({ isLoadingLectures: false });
          }
        },
      }),
      { name: "lectures-store" }
    ),
    {
      name: "lectures-storage",
      partialize: (state) => ({
        lectures: state.lectures,
        currentLecture: state.currentLecture,
      }),
    }
  )
);
