"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useState, useEffect, useMemo, useCallback } from "react";
import { Lecture } from "@/components/types/lecture.type";
import { Subject } from "@/components/types/subject.type";
import { useDebounce } from "use-debounce";

export default function LecturePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [searchInput, setSearchInput] = useState(
    searchParams.get("search") || ""
  );
  const [debouncedSearch] = useDebounce(searchInput, 300);

  // Получение лекций и предметов
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        const [lecturesRes, subjectsRes] = await Promise.all([
          fetch("http://localhost:4000/teacher/lectures", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:4000/teacher/my-subjects", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!lecturesRes.ok || !subjectsRes.ok) {
          throw new Error("Ошибка при загрузке данных");
        }

        const lecturesData = await lecturesRes.json();
        const subjectsData = await subjectsRes.json();

        const transformedLectures: Lecture[] = lecturesData.map(
          (lecture: any) => ({
            id: lecture.id,
            title: lecture.title,
            description: lecture.description || "Описание отсутствует",
            subject: { id: lecture.subject.id, name: lecture.subject.name },
            uploadDate: lecture.uploadDate,
            fileContent: lecture.fileContent,
            instructor: lecture.instructor, // оставляем как есть с бэка
          })
        );

        setLectures(transformedLectures);
        setSubjects(subjectsData);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Ошибка при загрузке");
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  // Фильтры из URL
  const searchTerm = searchParams.get("search") || "";
  const selectedSubject = searchParams.get("subject") || "all";
  const selectedTopic = searchParams.get("topic") || "all";
  const startDate = searchParams.get("startDate") || "";
  const endDate = searchParams.get("endDate") || "";

  const topics = useMemo(
    () => [...new Set(lectures.map((lecture) => lecture.title))],
    [lectures]
  );

  // Обновление URL при изменении фильтров
  const updateFilters = useCallback(
    (newFilters: Partial<Record<string, string>>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(newFilters).forEach(([key, value]) => {
        if (value && value !== "all") params.set(key, value);
        else params.delete(key);
      });

      router.push(params.toString() ? `lecture?${params}` : "lecture", {
        scroll: false,
      });
    },
    [router, searchParams]
  );

  // Синхронизация поиска
  useEffect(() => {
    if (debouncedSearch !== searchTerm) {
      updateFilters({ search: debouncedSearch });
    }
  }, [debouncedSearch, searchTerm, updateFilters]);

  // Фильтрация лекций
  const filteredLectures = useMemo(() => {
    return lectures.filter((lecture) => {
      const matchesSearch = lecture.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesSubject =
        selectedSubject === "all" || lecture.subject.name === selectedSubject;
      const matchesTopic =
        selectedTopic === "all" || lecture.title === selectedTopic;
      const lectureDate = new Date(lecture.uploadDate);
      const matchesStartDate = startDate
        ? lectureDate >= new Date(startDate)
        : true;
      const matchesEndDate = endDate ? lectureDate <= new Date(endDate) : true;

      return (
        matchesSearch &&
        matchesSubject &&
        matchesTopic &&
        matchesStartDate &&
        matchesEndDate
      );
    });
  }, [
    lectures,
    searchTerm,
    selectedSubject,
    selectedTopic,
    startDate,
    endDate,
  ]);

  // Сброс фильтров
  const resetFilters = () => {
    setSearchInput("");
    router.push("/lecture", { scroll: false });
    setOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Загрузка лекций...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col">
        <p className="text-red-600">{error}</p>
        <Button
          variant="outline"
          onClick={() => router.push("/login")}
          className="mt-4"
        >
          Войти снова
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            {selectedSubject === "all"
              ? `Список лекций`
              : `Список лекций по предмету ${selectedSubject}`}
          </h1>
          <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
              <Button variant="outline">Фильтры</Button>
            </DrawerTrigger>
            <DrawerContent className="">
              <DrawerHeader>
                <DrawerTitle>Фильтры лекций</DrawerTitle>
                <DrawerDescription>Выберите параметры</DrawerDescription>
              </DrawerHeader>
              <div className="p-6 space-y-4 container mx-auto">
                <div>
                  <label
                    htmlFor="search"
                    className="text-gray-600 text-sm mb-2 block"
                  >
                    Поиск
                  </label>
                  <Input
                    id="search"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Введите название лекции"
                  />
                </div>
                <div>
                  <label className="text-gray-600 text-sm mb-2 block">
                    Предмет
                  </label>
                  <Select
                    value={selectedSubject}
                    onValueChange={(value) => updateFilters({ subject: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите предмет" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все предметы</SelectItem>
                      {subjects.map((s) => (
                        <SelectItem key={s.id} value={s.name}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-gray-600 text-sm mb-2 block">
                    Тема
                  </label>
                  <Select
                    value={selectedTopic}
                    onValueChange={(value) => updateFilters({ topic: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите тему" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все темы</SelectItem>
                      {topics.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col md:flex-row gap-4">
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) =>
                      updateFilters({ startDate: e.target.value })
                    }
                  />
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => updateFilters({ endDate: e.target.value })}
                  />
                </div>
              </div>
              <DrawerFooter className="mx-auto container">
                <Button onClick={resetFilters}>Сбросить</Button>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLectures.length > 0 ? (
            filteredLectures.map((lecture) => (
              <div
                key={lecture.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg flex flex-col"
              >
                <h2 className="text-xl font-semibold mb-2">{lecture.title}</h2>
                <p className="text-gray-600 mb-2 line-clamp-3">
                  {lecture.description}
                </p>
                <p className="text-gray-500 text-sm">
                  <span className="font-medium">Предмет:</span>{" "}
                  {lecture.subject.name}
                </p>
                <p className="text-gray-500 text-sm">
                  <span className="font-medium">Преподаватель:</span>{" "}
                  {lecture.instructor?.user?.fullName || "Не указан"}
                </p>
                <p className="text-gray-500 text-sm mb-4">
                  <span className="font-medium">Дата:</span>{" "}
                  {new Date(lecture.uploadDate).toLocaleDateString()}
                </p>
                <div className="w-full grid-cols-2 grid gap-2">
                  <Button onClick={() => router.push(`lecture/${lecture.id}`)}>
                    Открыть
                  </Button>
                  <Button
                    onClick={() => router.push(`updateLecture/${lecture.id}`)}
                  >
                    Изменить
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-600 col-span-full">
              Лекции не найдены
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
