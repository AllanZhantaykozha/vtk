"use client";

import { useState, useEffect } from "react";
import {
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Upload,
  Download,
  Loader,
} from "lucide-react";
import { useTasksStore } from "@/src/shared/lib/stores/taskStore";
import { download } from "@/src/shared/lib/download";

export interface User {
  fullName: string;
}

export interface Teacher {
  user: User;
}

export interface Subject {
  name: string;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  deadline: string; // ISO string
  timeRemaining: number; // in ms
  isExpired: boolean;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "NOT_SUBMITTED";
  fileContent?: string; // base64 or URL — зависит от API
  subject: Subject;
  teacher: Teacher;
  submissions?: Array<{ id: number }>;
}

// Используется в submitTask
export interface SubmitTaskPayload {
  text?: string;
  fileContent?: string; // base64 без префикса
}

export interface SubmitTaskResponse {
  id: number;
  submissions?: Array<{ id: number }>;
}

interface SubmitResult {
  success: boolean;
  submissionId?: number;
}

export function TaskSubmitPage({ id }: { id: number }) {
  const {
    currentTask,
    isLoadingTasks,
    error: storeError,
    fetchOneTask,
    submitTask,
    clearError,
  } = useTasksStore();

  const taskData = currentTask as Task | null;

  const [text, setText] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [submitResult, setSubmitResult] = useState<SubmitResult | null>(null);

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

  // Инициализация таймера
  useEffect(() => {
    if (taskData?.timeRemaining != null) {
      setTimeLeft(Math.floor(taskData.timeRemaining / 1000));
    }
  }, [taskData]);

  // Таймер обратного отсчета
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

  const formatTime = (seconds: number): string => {
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
  };

  const handleSubmit = async () => {
    if (!taskData) return;

    if (!text && !file) {
      setLocalError("Пожалуйста, введите текст или загрузите файл");
      return;
    }

    try {
      setIsSubmitting(true);
      setLocalError(null);
      clearError();

      let fileContent: string | undefined;
      if (file) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        await new Promise<void>((resolve, reject) => {
          reader.onload = () => resolve();
          reader.onerror = () => reject(reader.error);
        });
        const result = reader.result as string;
        fileContent = result.split(",")[1]; // Убираем data:...;base64,
      }

      const submitData: SubmitTaskPayload = {};
      if (text) submitData.text = text;
      if (fileContent) submitData.fileContent = fileContent;

      const result = await submitTask(id, submitData);
      if (!result) {
        setSubmitResult({ success: false });
        return;
      }

      const submissionId =
        (result as SubmitTaskResponse).id ??
        (result as SubmitTaskResponse).submissions?.[0]?.id;

      setSubmitResult({
        success: true,
        submissionId,
      });
    } catch (err) {
      setLocalError(
        err instanceof Error ? err.message : "Не удалось отправить задачу"
      );
      setSubmitResult({ success: false });
    } finally {
      setIsSubmitting(false);
    }
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

  if (!taskData) return null;

  if (taskData.status === "PENDING") {
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

  if ("message" in taskData) {
    // Это нестандартный случай — возможно, API возвращает { message: string }
    // Но тип Task не включает `message`, значит это отдельный тип.
    // Для безопасности проверим тип.
    const successMessage = taskData as { message: string };
    return (
      <div className="flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Задача выполнена
          </h2>
          <p className="text-gray-600">{successMessage.message}</p>
        </div>
      </div>
    );
  }

  if (taskData.isExpired || timeLeft <= 0) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Дедлайн истёк
          </h2>
          <p className="text-gray-600 mb-4">
            К сожалению, время для выполнения этой задачи истекло.
          </p>
          <p className="text-sm text-gray-500">
            Дедлайн был:{" "}
            {taskData.deadline
              ? new Date(taskData.deadline).toLocaleString("ru-RU")
              : "N/A"}
          </p>
        </div>
      </div>
    );
  }

  if (submitResult) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          {submitResult.success ? (
            <>
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Задача отправлена!
              </h2>
              {submitResult.submissionId && (
                <p className="text-gray-600 mb-4">
                  ID отправки: {submitResult.submissionId}
                </p>
              )}
              <p className="text-sm text-gray-500">
                Результат ожидает проверки преподавателем
              </p>
            </>
          ) : (
            <>
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Ошибка отправки
              </h2>
              <p className="text-gray-600">{storeError || localError}</p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Заголовок задачи */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {taskData.title}
              </h1>
              <p className="text-gray-600">{taskData.description}</p>
              <p className="text-sm text-gray-500 mt-2">
                Предмет: {taskData.subject.name}
              </p>
            </div>
            {taskData.deadline && (
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
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 my-4">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-700">{storeError || localError}</p>
            </div>
          )}

          {taskData.fileContent && (
            <a
              onClick={(e) => {
                e.preventDefault();
                download(
                  taskData.fileContent!,
                  `${taskData.title} ${taskData.teacher.user.fullName}`
                );
              }}
              className="inline-flex cursor-pointer items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <Download className="w-5 h-5" />
              Скачать файл
            </a>
          )}
        </div>

        {/* Форма отправки */}
        <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Текст ответа (опционально)
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={8}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Введите ваш ответ здесь..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Файл (опционально)
            </label>
            <div className="flex items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-indigo-400 transition-colors">
              <input
                type="file"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex items-center gap-2 text-gray-500 hover:text-indigo-600"
              >
                <Upload className="w-5 h-5" />
                <span>{file ? file.name : "Выберите файл"}</span>
              </label>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting || isLoadingTasks}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-bold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Отправка...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Отправить задачу
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
