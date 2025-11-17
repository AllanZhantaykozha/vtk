"use client";

import Link from "next/link";
import { BookOpen, TestTube, ClipboardList } from "lucide-react";

export default function CreatePage() {
  const createItems = [
    {
      href: "create/lecture",
      icon: BookOpen,
      title: "Лекция",
      description: "Загрузите новую лекцию с материалами для студентов.",
      color: "from-purple-500 to-indigo-600",
    },
    {
      href: "create/test",
      icon: TestTube,
      title: "Тест",
      description: "Создайте тест с вопросами для проверки знаний.",
      color: "from-emerald-500 to-teal-600",
    },
    {
      href: "create/task",
      icon: ClipboardList,
      title: "Задача",
      description: "Добавьте домашнее задание с дедлайном и файлами.",
      color: "from-orange-500 to-red-600",
    },
  ];

  return (
    <div className="min-h-screen  py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Создать новый контент
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Выберите тип материала, который хотите добавить для ваших студентов.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {createItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <Link
                key={index}
                href={item.href}
                className="group block bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden"
              >
                <div className={`p-8 text-center`}>
                  <div className="w-23 h-23 border-2 border-black rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <IconComponent className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
                  <p className=" mb-6 opacity-90">{item.description}</p>
                  <div className="flex items-center justify-center  gap-2 text-sm font-medium opacity-90">
                    <span>Создать</span>
                    <svg
                      className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
