import { API } from "@/src/apps/api/client";
import { ROUTES } from "@/src/apps/api/routes";
import { Test } from "../types";

export interface CreateTestDto {
  title: string;
  description?: string;
  subjectId: number;
  deadline: string;
  questions: QuestionDto[];
}

export interface QuestionDto {
  text: string;
  image?: string;
  type: "single" | "multiple";
  options: OptionDto[];
  correct: number[]; // ← Изменено с correctOptionIndices на correct
}

export interface OptionDto {
  text: string;
}

export interface UpdateTestDto {
  title?: string;
  description?: string;
  subjectId?: number;
  deadline?: string;
  questions?: QuestionDto[];
}

export interface SubmitTestDto {
  answers: Record<number, number[]>;
}

export async function createTest(
  testData: CreateTestDto,
  files?: File[]
): Promise<Test | string> {
  try {
    const formData = new FormData();

    // Добавляем текстовые поля
    formData.append("title", testData.title);
    if (testData.description) {
      formData.append("description", testData.description);
    }
    formData.append("subjectId", String(testData.subjectId));
    formData.append("deadline", testData.deadline);
    formData.append("questions", JSON.stringify(testData.questions));

    // Добавляем файлы (если есть)
    if (files && files.length > 0) {
      files.forEach((file, index) => {
        formData.append(`question-${index}`, file);
      });
    }

    const response = await API<Test>({
      url: ROUTES.tests.create.path,
      method: ROUTES.tests.create.method,
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (err) {
    return String(err);
  }
}

// ... остальные функции без изменений
export async function updateTest(
  id: number,
  testData: UpdateTestDto
): Promise<Test | string> {
  try {
    const response = await API<Test>({
      url: ROUTES.tests.update.path + id,
      method: ROUTES.tests.update.method,
      data: testData,
    });

    return response.data;
  } catch (err) {
    return String(err);
  }
}

export async function deleteTest(id: number): Promise<boolean | string> {
  try {
    await API({
      url: ROUTES.tests.delete.path + id,
      method: ROUTES.tests.delete.method,
    });

    return true;
  } catch (err) {
    return String(err);
  }
}

export async function submitTest(
  id: number,
  answers: Record<number, number[]>
): Promise<Test | string> {
  try {
    const response = await API({
      url: `${ROUTES.tests.submit.path}/${id}`,
      method: ROUTES.tests.submit.method,
      data: { answers },
    });

    return response.data;
  } catch (err) {
    return String(err);
  }
}

export async function checkSubmission(
  submissionId: number,
  status: "APPROVED" | "REJECTED"
): Promise<Test | string> {
  try {
    const response = await API({
      url: `${ROUTES.tests.check.path}${submissionId}/check`,
      method: ROUTES.tests.check.method,
      data: { status },
    });

    return response.data;
  } catch (err) {
    return String(err);
  }
}
