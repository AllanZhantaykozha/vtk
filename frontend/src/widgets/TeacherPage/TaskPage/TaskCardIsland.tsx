// src/widgets/TeacherPage/TaskPage/TeacherTaskCardIsland.tsx
"use client";

import { Task } from "@/src/entities/Task/types";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTasksStore } from "@/src/shared/lib/stores/taskStore";

export function TeacherTaskCardIsland() {
  const { tasks, fetchTasks } = useTasksStore();
  const router = useRouter();

  useEffect(() => {
    fetchTasks(); // Автоматически фильтрует по teacherId
  }, [fetchTasks]);

  const handleEditTask = (taskId: number) => {
    console.log(`Editing Task ${taskId}`);
    router.push(`tasks/${taskId}`); // Маршрут редактирования
  };

  return (
    <div className="w-full bg-white rounded-3xl p-8">
      <div className="text-lg font-semibold mb-6">Мои задания</div>
      <div className="grid gap-5">
        {tasks?.map((task: Task) => {
          const deadline = new Date(task.deadline);
          const now = new Date();
          const isOverdue = deadline < now;

          return (
            <div
              key={task.id}
              className="border-2 border-gray-200 rounded-lg hover:shadow-md transition-shadow bg-white flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 flex-1 flex flex-col">
                <div>
                  <h3 className="text-lg font-semibold mb-3 line-clamp-2 text-gray-900">
                    {task.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                    {task.description || "Без описания"}
                  </p>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-800">Предмет:</span>
                    <span className="text-gray-900">
                      {task.subject?.name || "Не указан"}
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
                      {task.teacher?.user?.fullName || "Вы"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-800">
                      Отправлено:
                    </span>
                    <span className="text-gray-900">
                      {task.submissions?.length || 0} студентов
                    </span>
                  </div>
                </div>
              </div>

              {/* Status badges */}
              <div className="px-6 pb-4 space-y-1">
                {isOverdue ? (
                  <span className="block w-full bg-red-100 text-red-800 px-3 py-1 rounded-md text-xs font-medium text-center">
                    Дедлайн истёк
                  </span>
                ) : (
                  <span className="block w-full bg-blue-100 text-blue-800 px-3 py-1 rounded-md text-xs font-medium text-center">
                    Активно
                  </span>
                )}
              </div>

              {/* Bottom button */}
              <div className="px-6 pb-6">
                <button
                  onClick={() => handleEditTask(task.id)}
                  className="w-full py-3 rounded-lg text-white font-semibold text-sm transition-all border-0 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
                >
                  Открыть
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {tasks?.length === 0 && (
        <p className="text-gray-500 text-center py-12 text-lg">Нет заданий</p>
      )}
    </div>
  );
}
