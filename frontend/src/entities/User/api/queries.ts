import { API } from "@/src/apps/api/client";
import { Student, Teacher, User } from "../types";
import { ROUTES } from "@/src/apps/api/routes";

export interface TeachersParams {
  id?: string;
  login?: string;
  fullName?: string;
  subjectsId?: string[];
  sortBy?: string;
  order?: "asc" | "desc";
}

export interface StudentsParams {
  id?: string;
  login?: string;
  fullName?: string;
  groupId?: string;
  sortBy?: string;
  order?: "asc" | "desc";
}

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

export async function getTeachers(
  filters?: TeachersParams
): Promise<Teacher[] | string> {
  try {
    const queryString = filters
      ? "?" + new URLSearchParams(filters as Record<string, string>).toString()
      : "";

    const response = await API<Teacher[]>({
      url: ROUTES.teacher.getAllTeachers.path + queryString,
      method: ROUTES.teacher.getAllTeachers.method,
    });

    return response.data;
  } catch (err) {
    return String(err);
  }
}

export async function getStudents(
  filters?: StudentsParams
): Promise<Student[] | string> {
  try {
    const queryString = filters
      ? "?" + new URLSearchParams(filters as Record<string, string>).toString()
      : "";

    const response = await API<Student[]>({
      url: ROUTES.student.getAll.path + queryString,
      method: ROUTES.student.getAll.method,
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
