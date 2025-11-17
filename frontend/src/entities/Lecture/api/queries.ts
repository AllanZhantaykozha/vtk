import { ROUTES } from "@/lib/routes";
import { API } from "@/src/apps/api/client";
import { Lecture } from "../types";

export interface CreateLectureDto {
  title: string;
  subjectId: number;
  description: string;
  fileContent: string;
}

export interface UpdateLectureDto {
  title?: string;
  subjectId?: number;
  description?: string;
  uploadDate?: string;
  fileContent?: string;
}

export interface LectureFilters {
  subject?: string;
  title?: string;
  startDate?: string;
  endDate?: string;
  sortBy: string;
  order: "asc" | "desc";
}

export async function getLectures(
  filters?: LectureFilters
): Promise<Lecture[] | string> {
  try {
    const params = new URLSearchParams();
    if (filters?.subject) params.append("subject", filters.subject);
    if (filters?.title) params.append("title", filters.title);
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);

    const queryString = params.toString();
    const url = queryString
      ? `${ROUTES.lectures.getAll.path}?${queryString}`
      : ROUTES.lectures.getAll.path;

    const response = await API<Lecture[]>({
      url,
      method: ROUTES.lectures.getAll.method,
    });

    return response.data;
  } catch (err) {
    return String(err);
  }
}

export async function getLectureById(id: number): Promise<Lecture | string> {
  try {
    const response = await API<Lecture>({
      url: `${ROUTES.lectures.getById.path}${id}`,
      method: ROUTES.lectures.getById.method,
    });

    return response.data;
  } catch (err) {
    return String(err);
  }
}
