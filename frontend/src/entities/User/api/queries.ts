import { API } from "@/src/app/api/client";
import { Teacher, User } from "../types";
import { ROUTES } from "@/src/app/api/routes";

export async function getMe(): Promise<User | string> {
  try {
    const response = await API<User>({
      url: ROUTES.users.getMe.path,
      method: ROUTES.users.getMe.method,
    });

    return response.data;
  } catch (err) {
    return String(err);
  }
}

export async function getTeachers(): Promise<Teacher[] | string> {
  try {
    const response = await API<Teacher[]>({
      url: ROUTES.teacher.getAllTeachers.path,
      method: ROUTES.teacher.getAllTeachers.method,
    });

    return response.data;
  } catch (err) {
    return String(err);
  }
}

export async function getAllUsers(): Promise<User[] | string> {
  try {
    const response = await API<User[]>({
      url: ROUTES.users.getAll.path,
      method: ROUTES.users.getAll.method,
    });

    return response.data;
  } catch (err) {
    return String(err);
  }
}
