"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface Lecture {
  id: number;
  title: string;
  description: string | null;
  subject: { id: number; name: string };
  uploadDate: string;
  instructor: { id: number; user: { fullName: string } };
  fileContent: { [key: string]: number } | null;
}

interface Subject {
  id: number;
  name: string;
}

export default function EditLecturePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [lecture, setLecture] = useState<Lecture | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [formData, setFormData] = useState<{
    title: string;
    description: string | null;
    subjectId: number | null;
    file: File | null;
  }>({
    title: "",
    description: "",
    subjectId: null,
    file: null,
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isValidFileContent = (fileContent: Lecture["fileContent"]) => {
    if (!fileContent) return false;
    return Object.entries(fileContent).every(
      ([key, val]) => Number.isInteger(+key) && Number.isInteger(val as number)
    );
  };

  const fetchLectureAndSubjects = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      // Fetch lecture
      const lectureResponse = await fetch(
        `http://localhost:4000/lectures/${id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!lectureResponse.ok) {
        if (lectureResponse.status === 401)
          throw new Error("Нет доступа: пожалуйста, войдите снова");
        if (lectureResponse.status === 403)
          throw new Error(
            "Доступ запрещен: только создатель лекции или администратор может редактировать"
          );
        if (lectureResponse.status === 404)
          throw new Error("Лекция не найдена");
        throw new Error(
          `Ошибка при получении лекции: ${lectureResponse.statusText}`
        );
      }

      const lectureData = await lectureResponse.json();
      if (!lectureData.id) {
        throw new Error("Неверные данные лекции");
      }

      setLecture({
        id: lectureData.id,
        title: lectureData.title || "Без названия",
        description: lectureData.description || null,
        subject: {
          id: lectureData.subject?.id ?? 0,
          name: lectureData.subject?.name ?? "Неизвестно",
        },
        uploadDate: lectureData.uploadDate || new Date().toISOString(),
        instructor: {
          id: lectureData.instructor?.id ?? 0,
          user: {
            fullName: lectureData.instructor?.user?.fullName ?? "Неизвестно",
          },
        },
        fileContent:
          lectureData.fileContent && isValidFileContent(lectureData.fileContent)
            ? lectureData.fileContent
            : null,
      });

      setFormData({
        title: lectureData.title || "",
        description: lectureData.description || "",
        subjectId: lectureData.subject?.id ?? null,
        file: null,
      });

      // Fetch subjects
      const subjectsResponse = await fetch(
        "http://localhost:4000/subjects/get-my-subjects",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!subjectsResponse.ok) {
        throw new Error("Ошибка при получении списка предметов");
      }

      const subjectsData = await subjectsResponse.json();
      setSubjects(subjectsData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Произошла ошибка при загрузке данных"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchLectureAndSubjects();
  }, [id, router]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubjectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, subjectId: Number(value) }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      let fileContentBase64: string | undefined;
      if (formData.file) {
        const arrayBuffer = await formData.file.arrayBuffer();
        fileContentBase64 = Buffer.from(arrayBuffer).toString("base64");
      }

      const updateData = {
        title: formData.title,
        description: formData.description || null,
        subjectId: formData.subjectId,
        fileContent: fileContentBase64,
      };

      const response = await fetch(`http://localhost:4000/lectures/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        if (response.status === 401)
          throw new Error("Нет доступа: пожалуйста, войдите снова");
        if (response.status === 403)
          throw new Error(
            "Доступ запрещен: только создатель лекции или администратор может редактировать"
          );
        if (response.status === 404) throw new Error("Лекция не найдена");
        throw new Error(`Ошибка при обновлении лекции: ${response.statusText}`);
      }

      toast.success("Лекция успешно обновлена");
      router.push(`/student/lecture/${id}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Произошла ошибка при обновлении лекции"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Вы уверены, что хотите удалить эту лекцию?")) return;

    setSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch(`http://localhost:4000/lectures/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401)
          throw new Error("Нет доступа: пожалуйста, войдите снова");
        if (response.status === 403)
          throw new Error(
            "Доступ запрещен: только создатель лекции или администратор может удалить"
          );
        if (response.status === 404) throw new Error("Лекция не найдена");
        throw new Error(`Ошибка при удалении лекции: ${response.statusText}`);
      }

      toast.success("Лекция успешно удалена");
      router.push("/student/lecture");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Произошла ошибка при удалении лекции"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !lecture) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-gray-800">
                Загрузка лекции...
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-6 w-3/4 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3 mb-2" />
              {error && <p className="text-red-600">{error}</p>}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-gray-800">
              Редактирование лекции: {lecture.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="title" className="text-sm font-medium">
                  Название лекции
                </Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="description" className="text-sm font-medium">
                  Описание
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description || ""}
                  onChange={handleInputChange}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="subjectId" className="text-sm font-medium">
                  Предмет
                </Label>
                <Select
                  value={formData.subjectId?.toString() || ""}
                  onValueChange={handleSubjectChange}
                >
                  <SelectTrigger className="mt-1">
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
              <div>
                <Label htmlFor="file" className="text-sm font-medium">
                  Файл лекции (DOCX)
                </Label>
                <Input
                  id="file"
                  type="file"
                  accept=".docx"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  className="mt-1"
                />
              </div>
              {error && <p className="text-red-600">{error}</p>}
              <div className="flex gap-4">
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Сохранение..." : "Сохранить изменения"}
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={submitting}
                >
                  {submitting ? "Удаление..." : "Удалить лекцию"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/student/lecture/${id}`)}
                >
                  Отмена
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
