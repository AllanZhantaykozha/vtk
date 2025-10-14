import {
  Lecture,
  StudentSubjectsResponse,
  Subject,
  Teacher,
  Test,
  Teachers,
} from "@/components/types/subject.type";
import { UserProfile } from "@/components/types/user.type";
import { useApi } from "@/hooks/useApi";

function normalizeSubjects(
  data: StudentSubjectsResponse[] | undefined
): Subject[] {
  if (!Array.isArray(data)) return [];

  return data.flatMap(
    (item) =>
      item.group?.subjects?.map((s) => ({
        id: s.subject.id,
        name: s.subject.name,
        tests: (s.subject.tests ?? []).map((t: Test) => t.id.toString()),
        lectures: (s.subject.lectures ?? []).map((l: Lecture) =>
          l.id.toString()
        ),
        teachers: Array.isArray(s.subject.teachers)
          ? (s.subject.teachers as Teacher[]).map(
              (t: Teacher) => ({ teacher: t } as unknown as Teachers)
            )
          : s.subject.teachers
          ? [
              {
                teacher: s.subject.teachers as unknown as Teacher,
              } as unknown as Teachers,
            ]
          : [],
      })) ?? []
  );
}

export function useStudentSubjects() {
  const {
    data: rawData,
    error,
    isLoading,
  } = useApi<UserProfile[], "student", "getMySubjects">(
    "student",
    "getMySubjects"
  );

  const subjects = normalizeSubjects(
    rawData as unknown as StudentSubjectsResponse[]
  );

  return { subjects, error, isLoading };
}
