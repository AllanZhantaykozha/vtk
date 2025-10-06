"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type PassedTest = {
  id: number;
  score: number;
  submittedAt: string;
  student: {
    id: number;
    group: { id: number; name: string } | null;
    user: { id: number; fullName: string };
  };
  test: {
    id: number;
    title: string;
    subject: { id: number; name: string };
    questions: string[];
  };
};

export default function PassedTestsPage() {
  const [tests, setTests] = useState<PassedTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedGroup, setSelectedGroup] = useState<string>("");

  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        const res = await fetch("http://localhost:4000/teacher/passed-tests", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setTests(data);
      } catch (err) {
        console.error("Ошибка при загрузке данных:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [router]);

  // Уникальные предметы
  const subjects = useMemo(() => {
    const unique = new Map<number, string>();
    tests.forEach((t) => {
      unique.set(t.test.subject.id, t.test.subject.name);
    });
    return Array.from(unique.entries()).map(([id, name]) => ({ id, name }));
  }, [tests]);

  // Уникальные группы
  const groups = useMemo(() => {
    const unique = new Map<number, string>();
    tests.forEach((t) => {
      if (t.student.group) {
        unique.set(t.student.group.id, t.student.group.name);
      }
    });
    return Array.from(unique.entries()).map(([id, name]) => ({ id, name }));
  }, [tests]);

  // Фильтрация
  const filteredTests = useMemo(() => {
    return tests.filter((t) => {
      const subjectMatch =
        !selectedSubject || t.test.subject.id.toString() === selectedSubject;
      const groupMatch =
        !selectedGroup || t.student.group?.id.toString() === selectedGroup;
      return subjectMatch && groupMatch;
    });
  }, [tests, selectedSubject, selectedGroup]);

  return (
    <div className="container mx-auto p-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Пройденные тесты студентов
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {/* Фильтры */}
              <div className="flex gap-4 mb-6">
                <Select onValueChange={(value) => setSelectedSubject(value)}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Фильтр по предмету" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((s) => (
                      <SelectItem key={s.id} value={s.id.toString()}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select onValueChange={(value) => setSelectedGroup(value)}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Фильтр по группе" />
                  </SelectTrigger>
                  <SelectContent>
                    {groups.map((g) => (
                      <SelectItem key={g.id} value={g.id.toString()}>
                        {g.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Таблица */}
              {filteredTests.length === 0 ? (
                <p className="text-muted-foreground text-center">
                  Ничего не найдено
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Название теста</TableHead>
                      <TableHead>Предмет</TableHead>
                      <TableHead>Студент</TableHead>
                      <TableHead>Группа</TableHead>
                      <TableHead>Баллы</TableHead>
                      <TableHead>Дата прохождения</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTests.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell>{t.test.title}</TableCell>
                        <TableCell>{t.test.subject.name}</TableCell>
                        <TableCell>{t.student.user.fullName}</TableCell>
                        <TableCell>{t.student.group?.name || "—"}</TableCell>
                        <TableCell>
                          {t.score} / {t.test.questions.length}
                        </TableCell>
                        <TableCell>
                          {new Date(t.submittedAt).toLocaleString("ru-RU")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
