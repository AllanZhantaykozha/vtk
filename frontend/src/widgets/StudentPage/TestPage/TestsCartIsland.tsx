// TestCardIsland.tsx
"use client";

import { Test } from "@/src/entities/Test/types";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTestsStore } from "@/src/shared/lib/stores/testStore";

export function TestCardIsland() {
  const { tests, fetchTests } = useTestsStore();
  const router = useRouter();

  useEffect(() => {
    fetchTests();
  }, [fetchTests]);

  const handlePassTest = (testId: number) => {
    console.log(`Passing Test ${testId}`);
    router.push(`tests/${testId}`); // Example route
  };

  return (
    <div className="w-full bg-white rounded-3xl p-8">
      <div className="text-lg font-semibold mb-6">Тесты</div>
      <div className="grid gap-5">
        {tests?.map((Test: Test) => {
          const now = new Date();
          const deadline = new Date(Test.deadline);
          const isOverdue = deadline < now;
          const hasSubmission = Test.submissions?.length > 0;

          return (
            <div
              key={Test.id}
              className="border-2 border-gray-200 rounded-lg hover:shadow-md transition-shadow bg-white flex flex-col overflow-hidden" // Rectangular fixed height, no stripes
            >
              {/* Header */}
              <div className="p-6 flex-1 flex flex-col">
                <div>
                  <h3 className="text-lg font-semibold mb-3 line-clamp-2 text-gray-900">
                    {Test.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                    {Test.description || "Без описания"}
                  </p>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-800">Предмет:</span>
                    <span className="text-gray-900">
                      {Test.subject?.name || "Не указан"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-800">Дедлайн:</span>
                    <span className="text-gray-900">
                      {deadline.toLocaleDateString("ru-RU")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-800">
                      Преподаватель:
                    </span>
                    <span className="text-gray-900 truncate">
                      {Test.teacher?.user?.fullName || "Не указан"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status badges */}
              <div className="px-6 pb-4 space-y-1">
                {hasSubmission && (
                  <span className="block w-full bg-green-100 text-green-800 px-3 py-1 rounded-md text-xs font-medium text-center">
                    Отправлено
                  </span>
                )}
                {isOverdue && !hasSubmission && (
                  <span className="block w-full bg-red-100 text-red-800 px-3 py-1 rounded-md text-xs font-medium text-center">
                    Просрочено
                  </span>
                )}
              </div>

              {/* Bottom button */}
              <div className="px-6 pb-6">
                <button
                  onClick={() => handlePassTest(Test.id)}
                  disabled={hasSubmission || isOverdue}
                  className={`w-full py-3 rounded-lg text-white font-semibold text-sm transition-all border-0 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    hasSubmission || isOverdue
                      ? "bg-gray-300 cursor-not-allowed opacity-75 focus:ring-gray-300"
                      : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
                  }`}
                >
                  {hasSubmission
                    ? "Отправлено"
                    : isOverdue
                    ? "Просрочено"
                    : "Пройти задание"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {tests?.length === 0 && (
        <p className="text-gray-500 text-center py-12 text-lg">Нет заданий</p>
      )}
    </div>
  );
}
