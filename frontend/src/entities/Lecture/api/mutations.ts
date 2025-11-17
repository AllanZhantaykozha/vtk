import { ROUTES } from "@/lib/routes";
import { API } from "@/src/apps/api/client";
import { Lecture } from "../types";
import { CreateLectureDto, UpdateLectureDto } from "./queries";

export async function createLecture(
  lectureData: CreateLectureDto
): Promise<Lecture | string> {
  try {
    const response = await API<Lecture>({
      url: ROUTES.lectures.create.path,
      method: ROUTES.lectures.create.method,
      data: lectureData,
    });

    return response.data;
  } catch (err) {
    return String(err);
  }
}

export async function updateLecture(
  id: number,
  lectureData: UpdateLectureDto
): Promise<Lecture | string> {
  try {
    const response = await API<Lecture>({
      url: `${ROUTES.lectures.update.path}${id}`,
      method: ROUTES.lectures.update.method,
      data: lectureData,
    });

    return response.data;
  } catch (err) {
    return String(err);
  }
}

export async function deleteLecture(
  id: number
): Promise<{ message: string } | string> {
  try {
    const response = await API<{ message: string }>({
      url: `${ROUTES.lectures.delete.path}${id}`,
      method: ROUTES.lectures.delete.method,
    });

    return response.data;
  } catch (err) {
    return String(err);
  }
}
