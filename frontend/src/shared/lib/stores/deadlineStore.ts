import { getMyTasks } from "@/src/entities/Task/api/queries";
import { Task } from "@/src/entities/Task/types";
import { getMyTests } from "@/src/entities/Test/api/queries";
import { Test } from "@/src/entities/Test/types";
import { create } from "zustand";

export interface Deadline {
  id: number;
  title: string;
  subject: string;
  dueDate: string;
  status: "pending" | "completed" | "overdue";
  type: "test" | "task";
}


interface DeadlineStore {
  deadlines: Deadline[];
  isLoading: boolean;
  fetchDeadlines: () => Promise<void>;
}

export const useDeadlineStore = create<DeadlineStore>((set) => ({
  deadlines: [],
  isLoading: false,

  fetchDeadlines: async () => {
    set({ isLoading: true });
    try {
      const [testsResponse, tasksResponse] = await Promise.all([
        getMyTests(),
        getMyTasks(),
      ]);

      if (
        typeof testsResponse === "string" ||
        typeof tasksResponse === "string"
      ) {
        throw new Error("Failed to fetch deadlines");
      }

      const tests: Test[] = Array.isArray(testsResponse) ? testsResponse : [];
      const tasks: Task[] = Array.isArray(tasksResponse) ? tasksResponse : [];

      const now = new Date();
      now.setHours(0, 0, 0, 0); 

      const pendingTests = tests.filter(
        (test) => !test.submissions || test.submissions.length === 0
      );
      const pendingTasks = tasks.filter(
        (task) => !task.submissions || task.submissions.length === 0
      );

      const deadlines: Deadline[] = [
        ...pendingTests.map((test): Deadline => {
          return {
            id: test.id,
            title: test.title,
            subject: test.subject.name,
            dueDate: String(test.deadline),
            status: test.deadline < now ? "overdue" : "pending",
            type: "test",
          };
        }),
        ...pendingTasks.map((task): Deadline => {
          return {
            id: task.id,
            title: task.title,
            subject: task.subject.name,
            dueDate: String(task.deadline),
            status: task.deadline < now ? "overdue" : "pending",
            type: "task",
          };
        }),
      ];

      // Sort by dueDate ascending
      deadlines.sort(
        (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      );

      set({ deadlines });
    } catch (error) {
      console.error("Error fetching deadlines:", error);
      set({ deadlines: [] });
    } finally {
      set({ isLoading: false });
    }
  },
}));
