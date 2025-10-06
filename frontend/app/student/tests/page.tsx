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
import { useState, useEffect } from "react";
import {
  ITransformedTest,
  Question,
  Submission,
  Test,
} from "@/components/types/test.type";
import { useApi } from "@/hooks/useApi";
import { Error } from "@/components/ux/error";
import { Loading } from "@/components/ux/loading";
import { FilterConfig, useFilter } from "@/hooks/useFillter";

const transformedTests = (data: Test[]) => {
  return data.map((test: Test) => ({
    id: test.id,
    title: test.title,
    description: test.description,
    subject: { id: test.subject.id, name: test.subject.name },
    uploadDate: test.uploadDate,
    teacher: { user: { fullName: test.teacher.user.fullName } },
    questions: [],
    submissions: test.submissions,
  }));
};

export default function TestsPage() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [tests, setTests] = useState<ITransformedTest[]>([]);

  const testConfig: FilterConfig<ITransformedTest> = {
    basePath: "tests",
    getSubject: (test) => test.subject.name,
    getInstructor: (test) => test.teacher.user.fullName,
    getTopic: (test) => test.title,
    getUploadDate: (test) => test.uploadDate,
  };

  const {
    filteredItems,

    searchTerm,

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
  } = useFilter(tests, testConfig);

  const { data, error, isLoading } = useApi<Test[], "tests", "getAll">(
    "tests",
    "getAll"
  );

  useEffect(() => {
    if (data) return setTests(transformedTests(data));
  }, [data]);

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <Error error />;
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Список тестов</h1>
          <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
                Фильтры
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Фильтры тестов</DrawerTitle>
                <DrawerDescription>
                  Выберите параметры для фильтрации тестов
                </DrawerDescription>
              </DrawerHeader>
              <div className="p-6 space-y-4 container mx-auto">
                <div>
                  <label className="text-gray-600 text-sm font-medium mb-2 block">
                    Поиск по названию
                  </label>
                  <Input
                    type="text"
                    placeholder="Введите название теста"
                    value={searchTerm}
                    onChange={(e) => updateFilters({ search: e.target.value })}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-gray-600 text-sm font-medium mb-2 block">
                    Предмет
                  </label>
                  <Select
                    value={selectedSubject || "all"}
                    onValueChange={(value) => updateFilters({ subject: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите предмет" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все предметы</SelectItem>
                      {subjects.map((subject, index) => (
                        <SelectItem key={index} value={subject}>
                          {subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-gray-600 text-sm font-medium mb-2 block">
                    Тема
                  </label>
                  <Select
                    value={selectedTopic || "all"}
                    onValueChange={(value) => updateFilters({ topic: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите тему" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все темы</SelectItem>
                      {topics.map((topic) => (
                        <SelectItem key={topic} value={topic}>
                          {topic}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-gray-600 text-sm font-medium mb-2 block">
                    Преподаватель
                  </label>
                  <Select
                    value={selectedInstructor || "all"}
                    onValueChange={(value) =>
                      updateFilters({ instructor: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите преподавателя" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все преподаватели</SelectItem>
                      {instructors.map((instructor) => (
                        <SelectItem key={instructor} value={instructor || ""}>
                          {instructor}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col md:flex-row gap-4">
                  <div>
                    <label className="text-gray-600 text-sm font-medium mb-2 block">
                      Дата с
                    </label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) =>
                        updateFilters({ startDate: e.target.value })
                      }
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-gray-600 text-sm font-medium mb-2 block">
                      Дата по
                    </label>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) =>
                        updateFilters({ endDate: e.target.value })
                      }
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
              <DrawerFooter className="mx-auto container">
                <Button onClick={resetFilters}>Сбросить фильтры</Button>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </div>
        {/* Test Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.length > 0 ? (
            filteredItems.map((test) => (
              <div
                key={`test-${test.id}`}
                className="bg-white grid rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300 h-full"
              >
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  {test.title}
                </h2>
                <p className="text-gray-600 mb-2 line-clamp-3">
                  {test.description}
                </p>
                <p className="text-gray-500 text-sm mb-1">
                  <span className="font-medium">Предмет:</span>{" "}
                  {test.subject.name}
                </p>
                <p className="text-gray-500 text-sm mb-1">
                  <span className="font-medium">Тема:</span> {test.title}
                </p>
                <p className="text-gray-500 text-sm mb-1">
                  <span className="font-medium">Преподаватель:</span>{" "}
                  {test.teacher.user.fullName}
                </p>
                <p className="text-gray-500 text-sm mb-1">
                  <span className="font-medium">Количество вопросов:</span>{" "}
                  {test.questions.length}
                </p>
                <p className="text-gray-500 text-sm mb-4">
                  <span className="font-medium">Дата загрузки:</span>{" "}
                  {new Date(test.uploadDate).toLocaleDateString()}
                </p>
                <Button
                  className="mb-auto cursor-pointer"
                  onClick={() => router.push(`/student/tests/${test.id}`)}
                >
                  Пройти тест
                </Button>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-600 col-span-full">
              Тесты не найдены
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
