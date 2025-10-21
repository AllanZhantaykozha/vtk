import { ROUTES } from "@/lib/routes";
import { Subject } from "../types";
import { API } from "@/src/app/api/client";

export async function getAllSubjects(): Promise<Subject[] | string> {
  try {
    const response = await API<Subject[]>({
      url: ROUTES.subjects.getAll.path,
      method: ROUTES.subjects.getAll.method,
    });

    return response.data;
  } catch (err) {
    return String(err);
  }
}
