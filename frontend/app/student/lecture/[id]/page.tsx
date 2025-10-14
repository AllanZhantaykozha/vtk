"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { renderAsync } from "docx-preview";
import { Skeleton } from "@/components/ui/skeleton";

interface Lecture {
  id: number;
  title: string;
  description: string;
  subject: { id: number; name: string };
  uploadDate: string;
  teacher: { user: { fullName: string } };
  fileContent: { [key: string]: number }; // Байтовый объект
}

export default function LecturePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [lecture, setLecture] = useState<Lecture | null>(null);
  const [loadingLecture, setLoadingLecture] = useState(false);
  const [renderingDoc, setRenderingDoc] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const docContainerRef = useRef<HTMLDivElement | null>(null);

  const isValidFileContent = (fileContent: Lecture["fileContent"]) => {
    if (!fileContent) return false;
    return Object.entries(fileContent).every(
      ([key, val]) => Number.isInteger(+key) && Number.isInteger(val as number)
    );
  };

  const fileContentToArrayBuffer = (fileContent: Lecture["fileContent"]) => {
    const entries = Object.entries(fileContent)
      .map(([k, v]) => [Number(k), v as number])
      .sort((a, b) => a[0] - b[0]);
    return new Uint8Array(entries.map(([, v]) => v)).buffer;
  };

  // Загружаем лекцию
  useEffect(() => {
    const loadLecture = async () => {
      setLoadingLecture(true);
      setError(null);

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        const response = await fetch(`http://localhost:4000/lectures/${id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401)
            throw new Error("Нет доступа: пожалуйста, войдите снова");
          if (response.status === 404) throw new Error("Лекция не найдена");
          throw new Error(
            `Ошибка при получении лекции: ${response.statusText}`
          );
        }

        const data = await response.json();
        if (!isValidFileContent(data.fileContent)) {
          throw new Error("Неверный или отсутствующий файл лекции");
        }

        setLecture({
          id: data.id,
          title: data.title || "Без названия",
          description: data.description || "Описание отсутствует",
          subject: {
            id: data.subject?.id ?? 0,
            name: data.subject?.name ?? "Неизвестно",
          },
          uploadDate: data.uploadDate || new Date().toISOString(),
          teacher: {
            user: { fullName: data.teacher?.user?.fullName ?? "Неизвестно" },
          },
          fileContent: data.fileContent,
        });
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Произошла ошибка при загрузке лекции"
        );
      } finally {
        setLoadingLecture(false);
      }
    };

    if (id) loadLecture();
  }, [id, router]);

  // Рендерим docx
  useEffect(() => {
    const renderDoc = async () => {
      if (!lecture?.fileContent || !docContainerRef.current) return;

      setRenderingDoc(true);
      setError(null);

      try {
        const buffer = fileContentToArrayBuffer(lecture.fileContent);

        await renderAsync(buffer, docContainerRef.current, undefined, {
          className: "docx-content",
          ignoreWidth: true,
          ignoreHeight: true,
          inWrapper: true,
          ignoreLastRenderedPageBreak: true,
        });
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Не удалось отобразить содержимое лекции"
        );
      } finally {
        setRenderingDoc(false);
      }
    };

    renderDoc();
  }, [lecture]);

  const handleDownload = useCallback(() => {
    if (!lecture?.fileContent) {
      setError("Файл лекции недоступен для скачивания");
      return;
    }

    try {
      const buffer = fileContentToArrayBuffer(lecture.fileContent);
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `lecture-${lecture.id}.docx`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch {
      setError("Не удалось скачать лекцию: неверный формат файла");
    }
  }, [lecture]);

  if (loadingLecture || !lecture) {
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
              {lecture.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{lecture.description}</p>
            <p className="text-gray-500 text-sm mb-1">
              <span className="font-medium">Предмет:</span>{" "}
              {lecture.subject.name}
            </p>
            <p className="text-gray-500 text-sm mb-1">
              <span className="font-medium">Преподаватель:</span>{" "}
              {lecture.teacher.user.fullName}
            </p>
            <p className="text-gray-500 text-sm mb-4">
              <span className="font-medium">Дата загрузки:</span>{" "}
              {new Date(lecture.uploadDate).toLocaleDateString()}
            </p>
            <Button
              variant="outline"
              onClick={() => router.replace(`/student/lecture/${id}`)}
            >
              Перезагрузить лекцию
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-gray-800">
              Содержимое лекции
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderingDoc && (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            )}
            {error && <p className="text-red-600">{error}</p>}
            <div
              ref={docContainerRef}
              className="docx-content border border-gray-300 rounded-lg p-4 bg-white"
              style={{ minHeight: "400px", overflow: "auto" }}
            />
          </CardContent>
        </Card>

        <div className="mt-6 flex gap-4">
          <Button variant="outline" onClick={handleDownload}>
            Скачать лекцию (.docx)
          </Button>
          <Button asChild variant="default">
            <a
              href={`/student/lecture?subject=${encodeURIComponent(
                lecture.subject.name
              )}`}
            >
              Назад к лекциям
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
