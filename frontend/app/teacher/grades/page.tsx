"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";
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
import { Button } from "@/components/ui/button";
import { TestSubmissionStatus } from "@/components/types/test.type";
import { useApi } from "@/hooks/useApi";

type PassedTest = {
  id: number;
  score: number;
  submittedAt: string;
  status: TestSubmissionStatus;
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

const writeStatus = (status: "PENDING" | "APPROVED" | "REJECTED") => {
  if (status === "PENDING") {
    return "Ожидание проверки";
  } else if (status === "APPROVED") {
    return "Тест пройден";
  } else if (status === "REJECTED") {
    return "Пройти заново";
  } else {
    return "Неизвестный статус";
  }
};

export default function PassedTestsPage() {
  const [tests, setTests] = useState<PassedTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [check, setCheck] = useState<boolean>(false);

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
  }, [router, check]);

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
  // Фильтрация + выбор последней попытки + сортировка
  const filteredTests = useMemo(() => {
    // Сначала фильтруем по предмету и группе
    const filtered = tests.filter((t) => {
      const subjectMatch =
        !selectedSubject || t.test.subject.id.toString() === selectedSubject;
      const groupMatch =
        !selectedGroup || t.student.group?.id.toString() === selectedGroup;
      return subjectMatch && groupMatch;
    });

    // Сортируем по дате (новые сверху)
    const sorted = [...filtered].sort(
      (a, b) =>
        new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );

    // Убираем дубликаты (оставляем только самую новую попытку)
    const uniqueMap = new Map<string, PassedTest>();
    for (const test of sorted) {
      const key = `${test.test.id}-${test.student.user.id}`;
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, test);
      }
    }

    return Array.from(uniqueMap.values());
  }, [tests, selectedSubject, selectedGroup]);

  const { refetch } = useApi("tests", "check", {
    enabled: false,
  });

  const handleCheck = async (id: number, status: TestSubmissionStatus) => {
    await refetch({
      params: { id: String(id) },
      body: { status },
    });

    setCheck(!check);
  };

  const handleXlsx = () => {
    const output = filteredTests.map((submission) => {
      const { id, score, status, submittedAt, student, test } = submission;
      const numQuestions = test.questions.length;
      const percentage = Math.round((score / numQuestions) * 100) + "%";
      const statusRu =
        status === "APPROVED"
          ? "Одобренный"
          : status === "REJECTED"
          ? "Отклоненный"
          : "Ожидание проверки";
      const dateTime = new Date(submittedAt);
      const date = dateTime.toISOString().split("T")[0];
      const time = dateTime.toTimeString().split(" ")[0].slice(0, 8);
      const fullName = student.user.fullName;
      const testTitle = test.title;
      const subject = test.subject.name;

      return {
        "№": id,
        Оценка: percentage,
        Статус: statusRu,
        "Дата прохождение": date,
        "Время прохождение": time,
        "ФИО студента": fullName,
        "Название теста": testTitle,
        Предмет: subject,
      };
    });

    // 1. Создайте рабочий лист из данных JSON
    const worksheet = XLSX.utils.json_to_sheet(output);

    // 2. Создайте новую рабочую книгу
    const workbook = XLSX.utils.book_new();

    // 3. Добавьте рабочий лист в рабочую книгу
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    // 4. Сгенерируйте файл XLSX (байтовый массив)
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    // 5. Сформируйте Blob из байтового массива
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });

    // 6. Создайте URL для скачивания файла (для браузера)
    const url = URL.createObjectURL(blob);

    // 7. Создайте ссылку для скачивания и имитируйте клик
    const link = document.createElement("a");
    link.href = url;
    link.download = `${Date.now()}_tests_results.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url); // Освободите URL объекта
  };

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

                <Button onClick={handleXlsx}>Выгрузить в Excel документ</Button>
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
                          {Math.round(
                            (t.score / t.test.questions.length) * 100
                          ) + "%"}
                        </TableCell>
                        <TableCell>
                          {new Date(t.submittedAt).toLocaleString("ru-RU")}
                        </TableCell>
                        <TableCell>{writeStatus(t.status)}</TableCell>
                        <TableCell>
                          <Button
                            onClick={() =>
                              handleCheck(t.id, TestSubmissionStatus.REJECTED)
                            }
                          >
                            Повторное прохождение
                          </Button>
                        </TableCell>
                        <TableCell>
                          <Button
                            onClick={() =>
                              handleCheck(t.id, TestSubmissionStatus.APPROVED)
                            }
                          >
                            Утвердить
                          </Button>
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
