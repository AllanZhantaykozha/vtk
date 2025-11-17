"use client";

import { useGroupStore } from "@/src/shared/lib/stores";
import { useState } from "react";

export interface GroupsParams {
  id?: string;
  name?: string;
  course?: string;
  sortBy?: string;
  order?: "asc" | "desc";
}

export function GroupsSortIsland() {
  const { fetchAllGroups } = useGroupStore();

  const [localFilters, setLocalFilters] = useState<GroupsParams>({
    id: "",
    name: "",
    course: "",
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
    fetchAllGroups(localFilters);
  }

  return (
    <div className="w-full bg-white rounded-3xl p-8">
      <div className="text-lg font-semibold mb-4">Сортировка и фильтрация</div>

      <div className="mb-6">
        <h3 className="text-md font-medium mb-3">Фильтры</h3>

        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ID
          </label>
          <input
            type="text"
            value={localFilters.id}
            onChange={(e) => handleFilterChange("id", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Введите ID"
          />
        </div>

        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Название
          </label>
          <input
            type="text"
            value={localFilters.name}
            onChange={(e) => handleFilterChange("name", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Введите название группы"
          />
        </div>

        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Курс
          </label>
          <input
            type="text"
            value={localFilters.course}
            onChange={(e) => handleFilterChange("course", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Номер курса"
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
            <option value="name">Название</option>
            <option value="course">Курс</option>
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
              id: "",
              name: "",
              course: "",
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
