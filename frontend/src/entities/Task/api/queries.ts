import { API } from "@/src/apps/api/client";
import { ROUTES } from "@/src/apps/api/routes";
import { Task } from "../types";
import { TaskParams } from "@/src/shared/lib/stores/taskStore";

export async function getAllTasks(
  filters?: Partial<TaskParams>
): Promise<Task[] | string> {
  try {
    let queryString = "";
    if (filters) {
      const params = Object.fromEntries(
        Object.entries(filters).map(([key, value]) => [key, String(value)])
      );
      queryString = "?" + new URLSearchParams(params).toString();
    }

    const response = await API<Task[]>({
      url: ROUTES.tasks.getAll.path + queryString,
      method: ROUTES.tasks.getAll.method,
    });

    return response.data;
  } catch (err) {
    return String(err);
  }
}

export async function getTaskById(id: string): Promise<Task | string> {
  try {
    const response = await API<Task>({
      url: `${ROUTES.tasks.getById.path}${id}`,
      method: ROUTES.tasks.getById.method,
    });

    return response.data;
  } catch (err) {
    return String(err);
  }
}

export async function getMyTasks(): Promise<Task[] | string> {
  try {
    const response = await API<Task[]>({
      url: `${ROUTES.tasks.getAll.path}`,
      method: `${ROUTES.tasks.getAll.method}`,
    });

    return response.data;
  } catch (err) {
    return String(err);
  }
}
