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

// Типы
type Student = {
  id: number;
  user: {
    id: number;
    fullName: string;
  };
};

type Subject = {
  subjectId: number;
  subject: {
    id: number;
    name: string;
  };
};

type Group = {
  id: number;
  name: string;
  subjects: Subject[];
  students: Student[];
};

export default function StudentsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Загружаем данные с сервера
  useEffect(() => {
    async function fetchData() {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }
        const res = await fetch("http://localhost:4000/teacher/students", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setGroups(data);
      } catch (err) {
        console.error("Ошибка при загрузке данных:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [router]);

  // Достаём список всех уникальных предметов
  const subjects = useMemo(() => {
    const all: { id: number; name: string }[] = [];
    groups.forEach((g) => {
      g.subjects.forEach((s) => {
        if (!all.some((subj) => subj.id === s.subject.id)) {
          all.push({ id: s.subject.id, name: s.subject.name });
        }
      });
    });
    return all;
  }, [groups]);

  // Группы по выбранному предмету
  const filteredGroups = useMemo(() => {
    if (!selectedSubject) return [];
    return groups.filter((g) =>
      g.subjects.some((s) => s.subject.id.toString() === selectedSubject)
    );
  }, [groups, selectedSubject]);

  // Студенты выбранной группы
  const students = useMemo(() => {
    if (!selectedGroup) return [];
    const group = groups.find((g) => g.id.toString() === selectedGroup);
    return group?.students || [];
  }, [groups, selectedGroup]);

  return (
    <div className="container mx-auto p-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Список студентов</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {/* Выбор предмета */}
              <div className="mb-6">
                <Select
                  onValueChange={(value) => {
                    setSelectedSubject(value);
                    setSelectedGroup("");
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите предмет" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem
                        key={subject.id}
                        value={subject.id.toString()}
                      >
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Выбор группы */}
              {selectedSubject && (
                <div className="mb-6">
                  <Select onValueChange={(value) => setSelectedGroup(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите группу" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredGroups.map((group) => (
                        <SelectItem key={group.id} value={group.id.toString()}>
                          {group.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Таблица студентов */}
              {selectedGroup && (
                <>
                  {students.length === 0 ? (
                    <p className="text-muted-foreground text-center">
                      Студенты в этой группе не найдены
                    </p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Имя</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {students.map((student) => (
                          <TableRow key={student.id}>
                            <TableCell>{student.user.id}</TableCell>
                            <TableCell>{student.user.fullName}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
