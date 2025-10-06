"use client";

import React, { useEffect, useState } from "react";

interface Student {
  id: number;
  fullName: string;
}

interface Group {
  id: number;
  name: string;
  students: Student[];
}

interface Subject {
  id: number;
  name: string;
  groups: Group[];
}

export default function StudentListBySubjects() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:4000/subjects/with-students", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Ошибка загрузки данных");

      const rawData = await res.json();

      // Трансформация
      const data: Subject[] = rawData.map((subject: any) => ({
        id: subject.id,
        name: subject.name,
        groups: subject.groups.map((g: any) => ({
          id: g.group.id,
          name: g.group.name,
          students: g.group.students.map((s: any) => ({
            id: s.id,
            fullName: s.user.fullName,
          })),
        })),
      }));

      console.log("Transformed data:", data);
      setSubjects(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Неизвестная ошибка");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (isLoading) return <p className="p-4">Загрузка...</p>;
  if (error) return <p className="p-4 text-red-600">{error}</p>;

  return (
    <div className="space-y-6 p-4">
      {subjects.length === 0 ? (
        <p>Нет данных</p>
      ) : (
        subjects.map((subject) => (
          <div key={subject.id} className="border rounded-lg p-4 shadow-sm">
            <h2 className="text-lg font-bold mb-3">{subject.name}</h2>

            {subject.groups.length === 0 ? (
              <p className="text-gray-500">Нет групп</p>
            ) : (
              subject.groups.map((group) => (
                <div key={group.id} className="mb-4">
                  <h3 className="text-md font-semibold mb-2">{group.name}</h3>

                  {group.students.length === 0 ? (
                    <p className="text-gray-400 text-sm">Нет студентов</p>
                  ) : (
                    <ul className="list-disc list-inside space-y-1">
                      {group.students.map((student) => (
                        <li key={student.id} className="text-sm">
                          {student.fullName}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))
            )}
          </div>
        ))
      )}
    </div>
  );
}
