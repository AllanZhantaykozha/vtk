import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";
import {
  getAllTests,
  getOneTest,
  getStatistic,
} from "@/src/entities/Test/api/queries";
import {
  createTest,
  updateTest,
  deleteTest,
  submitTest,
  checkSubmission,
  CreateTestDto,
  UpdateTestDto,
} from "@/src/entities/Test/api/mutations";
import { Test, Statistic } from "@/src/entities/Test/types";

export interface TestParams {
  title?: string;
  description?: string;
  subject?: string;
  dateFrom?: string;
  teacher?: string;
  dateTo?: string;
  sortBy: string;
  order: "asc" | "desc";
}

interface TestsState {
  tests: Test[] | null;
  currentTest: Test | null;
  statistics: Statistic[] | null;
  isLoadingTests: boolean;
  error: string | null;

  // Queries
  fetchTests: (filters?: TestParams) => Promise<void>;
  fetchOneTest: (id: number) => Promise<void>;
  fetchStatistic: (groupId?: string) => Promise<void>;

  // Mutations
  createTest: (testData: CreateTestDto, files?: File[]) => Promise<boolean>;
  updateTest: (id: number, testData: UpdateTestDto) => Promise<boolean>;
  deleteTest: (id: number) => Promise<boolean>;
  submitTest: (id: number, answers: Record<number, number[]>) => Promise<Test>;
  checkSubmission: (
    submissionId: number,
    status: "APPROVED" | "REJECTED"
  ) => Promise<boolean>;

  // Utility
  clearError: () => void;
  clearCurrentTest: () => void;
}

export const useTestsStore = create<TestsState>()(
  persist(
    devtools(
      (set, get) => ({
        tests: null,
        currentTest: null,
        statistics: null,
        isLoadingTests: false,
        error: null,

        // ========== QUERIES ==========

        fetchTests: async (filters?: TestParams) => {
          const { isLoadingTests } = get();
          if (isLoadingTests) return;

          set({ isLoadingTests: true, error: null });

          try {
            const data = await getAllTests(filters);
            if (typeof data === "string") {
              console.error("Tests fetch error:", data);
              set({ tests: null, error: data });
            } else {
              set({ tests: data, error: null });
            }
          } catch (error) {
            console.error("Error in fetch tests:", error);
            set({ tests: null, error: String(error) });
          } finally {
            set({ isLoadingTests: false });
          }
        },

        fetchOneTest: async (id: number) => {
          const { isLoadingTests } = get();
          if (isLoadingTests) return;

          set({ isLoadingTests: true, error: null });

          try {
            const data = await getOneTest(id);
            if (typeof data === "string") {
              console.error("Test fetch error:", data);
              set({ currentTest: null, error: data });
            } else {
              set({ currentTest: data, error: null });
            }
          } catch (error) {
            console.error("Error in fetch test:", error);
            set({ currentTest: null, error: String(error) });
          } finally {
            set({ isLoadingTests: false });
          }
        },

        fetchStatistic: async (groupId?: string) => {
          const { isLoadingTests } = get();
          if (isLoadingTests) return;

          set({ isLoadingTests: true, error: null });

          try {
            const data = await getStatistic(groupId);
            if (typeof data === "string") {
              console.error("Statistic fetch error:", data);
              set({ statistics: null, error: data });
            } else {
              set({ statistics: data, error: null });
            }
          } catch (error) {
            console.error("Error in fetch statistic:", error);
            set({ statistics: null, error: String(error) });
          } finally {
            set({ isLoadingTests: false });
          }
        },

        // ========== MUTATIONS ==========

        createTest: async (testData: CreateTestDto, files?: File[]) => {
          const { isLoadingTests } = get();
          if (isLoadingTests) return false;

          set({ isLoadingTests: true, error: null });

          try {
            const result = await createTest(testData, files);
            if (typeof result === "string") {
              console.error("Create test error:", result);
              set({ error: result });
              return false;
            }

            // Обновляем список тестов
            await get().fetchTests();
            return true;
          } catch (error) {
            console.error("Error in createTest:", error);
            set({ error: String(error) });
            return false;
          } finally {
            set({ isLoadingTests: false });
          }
        },

        updateTest: async (id: number, testData: UpdateTestDto) => {
          const { isLoadingTests } = get();
          if (isLoadingTests) return false;

          set({ isLoadingTests: true, error: null });

          try {
            const result = await updateTest(id, testData);
            if (typeof result === "string") {
              console.error("Update test error:", result);
              set({ error: result });
              return false;
            }

            // Обновляем список тестов
            await get().fetchTests();
            return true;
          } catch (error) {
            console.error("Error in update test:", error);
            set({ error: String(error) });
            return false;
          } finally {
            set({ isLoadingTests: false });
          }
        },

        deleteTest: async (id: number) => {
          const { isLoadingTests } = get();
          if (isLoadingTests) return false;

          set({ isLoadingTests: true, error: null });

          try {
            const result = await deleteTest(id);
            if (typeof result === "string") {
              console.error("Delete test error:", result);
              set({ error: result });
              return false;
            }

            // Обновляем список тестов
            set((state) => ({
              tests: state.tests
                ? state.tests.filter((test) => test.id !== id)
                : null,
            }));
            return true;
          } catch (error) {
            console.error("Error in delete test:", error);
            set({ error: String(error) });
            return false;
          } finally {
            set({ isLoadingTests: false });
          }
        },

        submitTest: async (id: number, answers: Record<number, number[]>) => {
          const { isLoadingTests } = get();
          if (isLoadingTests) return null;

          set({ isLoadingTests: true, error: null });

          try {
            const result = await submitTest(id, answers);
            if (typeof result === "string") {
              console.error("Submit test error:", result);
              set({ error: result });
              return null;
            }

            return result;
          } catch (error) {
            console.error("Error in submit test:", error);
            set({ error: String(error) });
            return null;
          } finally {
            set({ isLoadingTests: false });
          }
        },

        checkSubmission: async (
          submissionId: number,
          status: "APPROVED" | "REJECTED"
        ) => {
          const { isLoadingTests } = get();
          if (isLoadingTests) return false;

          set({ isLoadingTests: true, error: null });

          try {
            const result = await checkSubmission(submissionId, status);
            if (typeof result === "string") {
              console.error("Check submission error:", result);
              set({ error: result });
              return false;
            }

            return true;
          } catch (error) {
            console.error("Error in check submission:", error);
            set({ error: String(error) });
            return false;
          } finally {
            set({ isLoadingTests: false });
          }
        },

        // ========== UTILITY ==========

        clearError: () => set({ error: null }),
        clearCurrentTest: () => set({ currentTest: null }),
      }),
      { name: "tests-store" }
    ),
    {
      name: "tests-storage",
      partialize: (state) => ({
        tests: state.tests,
        currentTest: state.currentTest,
      }),
    }
  )
);
