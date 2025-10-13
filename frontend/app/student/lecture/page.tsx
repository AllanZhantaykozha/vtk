"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useMemo, useCallback } from "react";
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
import { Lecture } from "@/components/types/lecture.type";
import { useApi } from "@/hooks/useApi";
import { Loading } from "@/components/ux/loading";
import { Error } from "@/components/ux/error";
import { FilterConfig, useFilter } from "@/hooks/useFillter";

export default function LecturePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [open, setOpen] = useState(false);
  const [lectures, setLectures] = useState<Lecture[]>([]);

  const [searchInput, setSearchInput] = useState(
    searchParams.get("search") || ""
  );

  const lectureConfig: FilterConfig<Lecture> = {
    basePath: "lecture",
    getSubject: (lecture) => lecture.subject.name,
    getInstructor: (lecture) => lecture.teacher.user.fullName,
    getTopic: (lecture) => lecture.title,
    getUploadDate: (lecture) => lecture.uploadDate,
  };

  const {
    filteredItems,

    topics,
    selectedTopic,

    subjects,
    selectedSubject,

    endDate,
    startDate,

    selectedInstructor,
    instructors,

    updateFilters: updateFilters,
    resetFilters: resetFilters,
  } = useFilter(lectures, lectureConfig);

  const { data, isLoading, error } = useApi<Lecture[], "lectures", "getAll">(
    "lectures",
    "getAll"
  );

  useEffect(() => {
    if (data) return setLectures(data);
  });

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <Error error />;
  }

  return (
    <div className="min-h-screen container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">
          {selectedSubject === "all"
            ? "Список лекций"
            : `Лекции по предмету ${selectedSubject}`}
        </h1>
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerTrigger asChild>
            <Button variant="outline">Фильтры</Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Фильтры</DrawerTitle>
              <DrawerDescription>Выберите параметры</DrawerDescription>
            </DrawerHeader>
            <div className="p-4 space-y-4 mx-auto container">
              <Input
                placeholder="Поиск"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <Select
                value={selectedSubject}
                onValueChange={(v) => updateFilters({ subject: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Предмет" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все предметы</SelectItem>
                  {subjects.map((subjectName: string) => (
                    <SelectItem key={subjectName} value={subjectName}>
                      {subjectName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={selectedTopic}
                onValueChange={(v) => updateFilters({ topic: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Тема" />
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
              <Select
                value={selectedInstructor}
                onValueChange={(v) => updateFilters({ instructor: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Преподаватель" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все преподаватели</SelectItem>
                  {instructors.map((i) => (
                    <SelectItem key={i} value={i || ""}>
                      {i}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex gap-4">
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => updateFilters({ startDate: e.target.value })}
                />
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => updateFilters({ endDate: e.target.value })}
                />
              </div>
            </div>
            <DrawerFooter className=" mx-auto container">
              <Button onClick={resetFilters}>Сбросить</Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.length > 0 ? (
          filteredItems.map((l) => (
            <div
              key={l.id}
              className="bg-white rounded-lg shadow p-6 flex flex-col"
            >
              <h2 className="text-xl font-semibold mb-2">{l.title}</h2>
              <p className="text-gray-600 mb-2 line-clamp-3">{l.description}</p>
              <p className="text-sm text-gray-500">
                <span className="font-medium">Предмет:</span> {l.subject.name}
              </p>
              <p className="text-sm text-gray-500">
                <span className="font-medium">Преподаватель:</span>{" "}
                {l.teacher?.user?.fullName || "Не указан"}
              </p>
              <p className="text-sm text-gray-500 mb-4">
                <span className="font-medium">Дата:</span>{" "}
                {new Date(l.uploadDate).toLocaleDateString()}
              </p>
              <Button onClick={() => router.push(`lecture/${l.id}`)}>
                Открыть
              </Button>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-600 col-span-full">
            Лекции не найдены
          </p>
        )}
      </div>
    </div>
  );
}
