"use client";

import { useSubjectStore } from "@/src/shared/lib/stores/subjectsStore";
import { useTeachersStore } from "@/src/shared/lib/stores/teachersStore";
import { useState } from "react";

export interface TeachersParams {
  id?: string;
  login?: string;
  fullName?: string;
  subjectsId?: string[];
  sortBy?: string;
  order?: "asc" | "desc";
}

export function TeacherSortIsland() {
  const { fetchTeachers } = useTeachersStore();
  const { subjects } = useSubjectStore();

  const [localFilters, setLocalFilters] = useState<TeachersParams>({
    id: "",
    login: "",
    fullName: "",
    subjectsId: [],
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
    fetchTeachers(localFilters);
  }

  const [isOpen, setIsOpen] = useState(false);

  const toggleSubject = (id: string) => {
    setLocalFilters((prev) => {
      const current = prev.subjectsId || [];
      const exists = current.includes(id);
      return {
        ...prev,
        subjectsId: exists ? current.filter((s) => s !== id) : [...current, id],
      };
    });
  };

  const selectedSubjects =
    subjects?.filter((s) => localFilters.subjectsId?.includes(String(s.id))) ||
    [];

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

        {/* По тексту */}
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Логин
          </label>
          <input
            type="text"
            value={localFilters.login}
            onChange={(e) => handleFilterChange("login", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Введите текст"
          />
        </div>

        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ФИО
          </label>
          <input
            type="text"
            value={localFilters.fullName}
            onChange={(e) => handleFilterChange("fullName", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Введите текст"
          />
        </div>

        <div className="mb-3 relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Предметы
          </label>

          <div
            onClick={() => setIsOpen(!isOpen)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {selectedSubjects.length > 0
              ? selectedSubjects.map((s) => s.name).join(", ")
              : "Выберите предметы"}
          </div>

          {isOpen && (
            <div className="absolute z-10 mt-1 w-full max-h-40 overflow-y-auto border border-gray-300 rounded-md bg-white shadow-lg">
              {subjects?.map((obj) => (
                <label
                  key={obj.id}
                  className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={localFilters.subjectsId?.includes(String(obj.id))}
                    onChange={() => toggleSubject(String(obj.id))}
                    className="mr-2"
                  />
                  {obj.name}
                </label>
              ))}
            </div>
          )}
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
            <option value="login">Логин</option>
            <option value="fullName">ФИО</option>
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
              login: "",
              fullName: "",
              subjectsId: [],
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
