"use client";

import { useState, useEffect } from "react";
import {
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Download,
  Loader,
} from "lucide-react";
import { useTasksStore } from "@/src/shared/lib/stores/taskStore";
import { download } from "@/src/shared/lib/download";

export function TaskViewPage({ id }: { id: number }) {
  const {
    currentTask,
    isLoadingTasks,
    error: storeError,
    fetchOneTask,
    clearError,
  } = useTasksStore();

  const taskData = currentTask;

  const [localError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  // Загрузка данных задачи
  useEffect(() => {
    fetchOneTask(id);
  }, [id, fetchOneTask]);

  // Очистка ошибки при загрузке
  useEffect(() => {
    if (storeError) {
      clearError();
    }
  }, [storeError, clearError]);

  // Инициализация таймера (для справки)
  useEffect(() => {
    if (taskData) {
      // Устанавливаем оставшееся время
      if (taskData?.timeRemaining) {
        setTimeLeft(Math.floor(taskData?.timeRemaining / 1000));
      }
    }
  }, [taskData]);

  // Таймер обратного отсчета (опционально для просмотра)
  useEffect(() => {
    if (timeLeft <= 0 || !taskData) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, taskData]);

  const formatTime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (days > 0) {
      return `${days}д ${hours}ч ${mins}м`;
    }
    if (hours > 0) {
      return `${hours}ч ${mins}м ${secs}с`;
    }
    return `${mins}м ${secs}с`;
  };

  if (isLoadingTasks) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка задачи...</p>
        </div>
      </div>
    );
  }

  if (storeError && !currentTask) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Ошибка</h2>
          <p className="text-gray-600">{storeError}</p>
        </div>
      </div>
    );
  }

  if (!currentTask) return null;

  if (taskData?.status === "PENDING") {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <Loader className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Ожидание проверки
          </h2>
        </div>
      </div>
    );
  }

  if ("message" in currentTask) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Задача выполнена
          </h2>
          <p className="text-gray-600">{currentTask.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 px-4 min-h-screen ">
      <div className="max-w-2xl mx-auto">
        {/* Заголовок задачи */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {taskData?.title}
              </h1>
              <p className="text-gray-600">{taskData?.description}</p>
              <p className="text-sm text-gray-500 mt-2">
                Предмет: {taskData?.subject?.name}
              </p>
            </div>
            {taskData?.deadline && (
              <div className="flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-lg">
                <Clock className="w-5 h-5 text-indigo-600" />
                <div className="text-right">
                  <p className="text-xs text-gray-600">До дедлайна</p>
                  <p
                    className={`font-bold ${
                      timeLeft < 3600 ? "text-red-600" : "text-indigo-600"
                    }`}
                  >
                    {formatTime(timeLeft)}
                  </p>
                </div>
              </div>
            )}
          </div>

          {(storeError || localError) && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-700">{storeError || localError}</p>
            </div>
          )}

          {taskData?.fileContent && (
            <a
              onClick={() =>
                download(taskData.fileContent, `${taskData?.title} - Задание`)
              }
              className="inline-flex cursor-pointer items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <Download className="w-5 h-5" />
              Скачать прикреплённый файл
            </a>
          )}
        </div>

        {/* Информация о задаче для просмотра */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Детали задания
          </h3>
          <div className="space-y-3 text-sm text-gray-600">
            <p>
              <strong>Дедлайн:</strong>{" "}
              {taskData?.deadline
                ? new Date(taskData.deadline).toLocaleString("ru-RU")
                : "Не указан"}
            </p>
            <p>
              <strong>Статус:</strong> {taskData?.status || "Активна"}
            </p>
            {taskData?.fileContent && (
              <p>
                <strong>Файл:</strong> Прикреплён (см. кнопку выше)
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
