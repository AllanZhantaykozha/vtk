// hooks/useStudentSubjects.ts
import { Subject } from "@/components/types/subject.type";
import { useApi } from "@/hooks/useApi";

// Нормализация данных из API
function normalizeSubjects(data: any[]): Subject[] {
  if (!Array.isArray(data)) return [];
  return data.flatMap((item) => {
    if (item.group?.subjects) {
      return item.group.subjects.map((s: any) => s.subject);
    }
    if (item.subject) {
      return [item.subject];
    }
    return [];
  });
}

export function useStudentSubjects() {
  const {
    data: rawData,
    error,
    isLoading,
  } = useApi<any[], "student", "getMySubjects">("student", "getMySubjects");

  const subjects = normalizeSubjects(rawData ?? []);

  return { subjects, error, isLoading };
}
