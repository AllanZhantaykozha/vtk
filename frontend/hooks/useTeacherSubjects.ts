import { ROUTES } from "@/lib/routes";
import { Subject } from "@/src/entities/Subject/types";
import { useState, useEffect } from "react";

export function useTeacherSubjects() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(ROUTES.subjects.getTeacherNavbar.path, {
        method: ROUTES.subjects.getTeacherNavbar.method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Не удалось загрузить предметы");
      }

      const data = (await response.json()) as Subject[];
      setSubjects(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Произошла ошибка";
      setError(errorMessage);
      setSubjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { subjects, error, isLoading };
}
