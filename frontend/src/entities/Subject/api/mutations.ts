import { API } from "@/src/apps/api/client";
import { ROUTES } from "@/src/apps/api/routes";
import { SubjectFormData } from "@/src/widgets/CreatePage/CreateForm";
import { Subject } from "../../Subject/types";

export async function createSubject(
  subjectData: SubjectFormData
): Promise<Subject | string> {
  try {
    const response = await API<Subject>({
      url: ROUTES.subjects.create.path,
      method: ROUTES.subjects.create.method,
      data: subjectData,
    });

    return response.data;
  } catch (err) {
    return String(err);
  }
}

export async function updateSubject(
  id: number,
  subjectData: Partial<SubjectFormData>
): Promise<Subject | string> {
  try {
    const response = await API<Subject>({
      url: ROUTES.subjects.update.path + id,
      method: ROUTES.subjects.update.method,
      data: subjectData,
    });

    return response.data;
  } catch (err) {
    return String(err);
  }
}

export async function deleteSubject(id: number): Promise<void | string> {
  try {
    await API<void>({
      url: ROUTES.subjects.delete.path + id,
      method: ROUTES.subjects.delete.method,
    });

    return;
  } catch (err) {
    return String(err);
  }
}
