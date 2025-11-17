import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";
import { getAllTasks, getTaskById } from "@/src/entities/Task/api/queries";
import {
  createTask,
  updateTask,
  deleteTask,
  submitTask,
} from "@/src/entities/Task/api/mutations";
import { Task } from "@/src/entities/Task/types";
import { Test } from "@/src/entities/Test/types";

export interface CreateTaskDto {
  title: string;
  description?: string;
  subjectId: number;
  deadline: string;
  fileContent?: string;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  deadline?: string;
  fileContent?: string;
}

export interface SubmitTaskDto {
  text?: string;
  fileContent?: string;
}

export interface TaskParams {
  title?: string;
  description?: string;
  subject?: string;
  teacherId?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  order?: "asc" | "desc";
}

interface TasksState {
  tasks: Task[] | null;
  currentTask: Task | null;
  isLoadingTasks: boolean;
  error: string | null;

  // Queries
  fetchTasks: (filters?: TaskParams) => Promise<void>;
  fetchOneTask: (id: number) => Promise<void>;

  // Mutations
  createTask: (taskData: CreateTaskDto) => Promise<boolean>;
  updateTask: (id: number, taskData: UpdateTaskDto) => Promise<boolean>;
  deleteTask: (id: number) => Promise<boolean>;
  submitTask: (id: number, submitData: SubmitTaskDto) => Promise<Test>;

  // Utility
  clearError: () => void;
  clearCurrentTask: () => void;
}

export const useTasksStore = create<TasksState>()(
  persist(
    devtools(
      (set, get) => ({
        tasks: null,
        currentTask: null,
        isLoadingTasks: false,
        error: null,

        // ========== QUERIES ==========

        fetchTasks: async (filters?: TaskParams) => {
          const { isLoadingTasks } = get();
          if (isLoadingTasks) return;

          set({ isLoadingTasks: true, error: null });

          try {
            const data = await getAllTasks(filters);
            if (typeof data === "string") {
              console.error("Tasks fetch error:", data);
              set({ tasks: null, error: data });
            } else {
              set({ tasks: data, error: null });
            }
          } catch (error) {
            console.error("Error in fetch tasks:", error);
            set({ tasks: null, error: String(error) });
          } finally {
            set({ isLoadingTasks: false });
          }
        },

        fetchOneTask: async (id: string) => {
          const { isLoadingTasks } = get();
          if (isLoadingTasks) return;

          set({ isLoadingTasks: true, error: null });

          try {
            const data = await getTaskById(id);
            if (typeof data === "string") {
              console.error("Task fetch error:", data);
              set({ currentTask: null, error: data });
            } else {
              set({ currentTask: data, error: null });
            }
          } catch (error) {
            console.error("Error in fetch task:", error);
            set({ currentTask: null, error: String(error) });
          } finally {
            set({ isLoadingTasks: false });
          }
        },

        // ========== MUTATIONS ==========

        createTask: async (taskData: CreateTaskDto) => {
          const { isLoadingTasks } = get();
          if (isLoadingTasks) return false;

          set({ isLoadingTasks: true, error: null });

          try {
            const result = await createTask(taskData);
            if (typeof result === "string") {
              console.error("Create task error:", result);
              set({ error: result });
              return false;
            }

            // Обновляем список задач
            await get().fetchTasks();
            return true;
          } catch (error) {
            console.error("Error in createTask:", error);
            set({ error: String(error) });
            return false;
          } finally {
            set({ isLoadingTasks: false });
          }
        },

        updateTask: async (id: string, taskData: UpdateTaskDto) => {
          const { isLoadingTasks } = get();
          if (isLoadingTasks) return false;

          set({ isLoadingTasks: true, error: null });

          try {
            const result = await updateTask(id, taskData);
            if (typeof result === "string") {
              console.error("Update task error:", result);
              set({ error: result });
              return false;
            }

            // Обновляем список задач
            await get().fetchTasks();
            return true;
          } catch (error) {
            console.error("Error in update task:", error);
            set({ error: String(error) });
            return false;
          } finally {
            set({ isLoadingTasks: false });
          }
        },

        deleteTask: async (id: string) => {
          const { isLoadingTasks } = get();
          if (isLoadingTasks) return false;

          set({ isLoadingTasks: true, error: null });

          try {
            const result = await deleteTask(id);
            if (typeof result === "string") {
              console.error("Delete task error:", result);
              set({ error: result });
              return false;
            }

            // Обновляем список задач
            set((state) => ({
              tasks: state.tasks
                ? state.tasks.filter((task) => task.id !== Number(id))
                : null,
            }));
            return true;
          } catch (error) {
            console.error("Error in delete task:", error);
            set({ error: String(error) });
            return false;
          } finally {
            set({ isLoadingTasks: false });
          }
        },

        submitTask: async (id: string, submitData: SubmitTaskDto) => {
          const { isLoadingTasks } = get();
          if (isLoadingTasks) return null;

          set({ isLoadingTasks: true, error: null });

          try {
            const result = await submitTask(id, submitData);
            if (typeof result === "string") {
              console.error("Submit task error:", result);
              set({ error: result });
              return null;
            }

            return result;
          } catch (error) {
            console.error("Error in submit task:", error);
            set({ error: String(error) });
            return null;
          } finally {
            set({ isLoadingTasks: false });
          }
        },

        // ========== UTILITY ==========

        clearError: () => set({ error: null }),
        clearCurrentTask: () => set({ currentTask: null }),
      }),
      { name: "tasks-store" }
    ),
    {
      name: "tasks-storage",
      partialize: (state) => ({
        tasks: state.tasks,
        currentTask: state.currentTask,
      }),
    }
  )
);
