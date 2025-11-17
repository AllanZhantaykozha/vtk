"use client";

import { LectureFilters } from "@/src/entities/Lecture/api/queries";
import { Subject } from "@/src/entities/Subject/types";
import { useLecturesStore } from "@/src/shared/lib/stores/lecturesStore";
import { useSubjectStore } from "@/src/shared/lib/stores/subjectsStore";
import { Select } from "@/src/shared/ui/Select";
import { useState } from "react";

export function LecturesSortIsland() {
  const { fetchLectures } = useLecturesStore();
  const { subjects } = useSubjectStore();
  const [localFilters, setLocalFilters] = useState<LectureFilters>({
    title: "",
    subject: "",
    startDate: "",
    endDate: "",
    sortBy: "id",
    order: "asc",
  });

  const handleFilterChange = (
    key: keyof typeof localFilters,
    value: string
  ) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  function applyFiltersAndSort() {
    fetchLectures(localFilters);
  }

  return (
    <div className="w-full bg-white rounded-3xl p-8">
      <div className="text-lg font-semibold mb-4">
        Сортировка и фильтрация лекций
      </div>

      <div className="mb-6">
        <h3 className="text-md font-medium mb-3">Фильтры</h3>

        {/* По названию */}
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Название
          </label>
          <input
            type="text"
            value={localFilters.title}
            onChange={(e) => handleFilterChange("title", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Введите название"
          />
        </div>

        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Предмет
          </label>
          <Select
            data={subjects || []}
            selectedId={
              localFilters.subject ? Number(localFilters.subject) : undefined
            }
            getOptionLabel={(s: Subject) => s.name}
            onChange={(id: string | number | undefined) => {
              const newId = id !== undefined ? Number(id) : undefined;
              handleFilterChange("subject", newId?.toString() ?? "");
              console.log("Selected subjectId:", newId);
            }}
          />
        </div>

        {/* По дате загрузки (от) */}
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Дата загрузки от
          </label>
          <input
            type="date"
            value={localFilters.startDate}
            onChange={(e) => handleFilterChange("startDate", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* По дате загрузки (до) */}
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Дата загрузки до
          </label>
          <input
            type="date"
            value={localFilters.endDate}
            onChange={(e) => handleFilterChange("endDate", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Сортировка */}
      <div className="mb-6">
        <h3 className="text-md font-medium mb-3">Сортировка</h3>

        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            По полю
          </label>
          <select
            value={localFilters.sortBy}
            onChange={(e) => handleFilterChange("sortBy", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="id">ID</option>
            <option value="title">Название</option>
            <option value="uploadDate">Дата загрузки</option>
          </select>
        </div>

        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Порядок
          </label>
          <select
            value={localFilters.order}
            onChange={(e) => handleFilterChange("order", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="asc">По возрастанию</option>
            <option value="desc">По убыванию</option>
          </select>
        </div>
      </div>

      {/* Кнопки */}
      <div className="flex gap-3">
        <button
          onClick={applyFiltersAndSort}
          className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Применить
        </button>
        <button
          onClick={() =>
            setLocalFilters({
              title: "",
              subject: "",
              startDate: "",
              endDate: "",
              sortBy: "id",
              order: "asc",
            })
          }
          className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Сбросить
        </button>
      </div>
    </div>
  );
}
