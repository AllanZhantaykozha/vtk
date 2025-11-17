import { ROUTES } from "@/lib/routes";
import { API } from "@/src/apps/api/client";
import { Task, TaskSubmission } from "../types";

export async function createTask(taskData: {
  title: string;
  description?: string;
  subjectId: number;
  deadline: string;
  fileContent?: string;
}): Promise<Task | string> {
  try {
    const response = await API<Task>({
      url: ROUTES.tasks.create.path,
      method: ROUTES.tasks.create.method,
      data: taskData,
    });

    return response.data;
  } catch (err) {
    return String(err);
  }
}

export async function updateTask(
  id: string,
  taskData: {
    title?: string;
    description?: string;
    deadline?: string;
    fileContent?: string;
  }
): Promise<Task | string> {
  try {
    const response = await API<Task>({
      url: `${ROUTES.tasks.update.path}${id}`,
      method: ROUTES.tasks.update.method,
      data: taskData,
    });

    return response.data;
  } catch (err) {
    return String(err);
  }
}

export async function deleteTask(
  id: string
): Promise<{ message: string } | string> {
  try {
    const response = await API<{ message: string }>({
      url: `${ROUTES.tasks.delete.path}${id}`,
      method: ROUTES.tasks.delete.method,
    });

    return response.data;
  } catch (err) {
    return String(err);
  }
}

export async function submitTask(
  id: string,
  submissionData: {
    text?: string;
    fileContent?: string;
  }
): Promise<TaskSubmission | string> {
  try {
    const response = await API<TaskSubmission>({
      url: `${ROUTES.tasks.submit.path}/${id}`,
      method: ROUTES.tasks.submit.method,
      data: submissionData,
    });

    return response.data;
  } catch (err) {
    return String(err);
  }
}
