"use client";

import { useState, useEffect } from "react";
import {
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  CircleCheckBig,
  Loader,
} from "lucide-react";
import { useTestsStore } from "@/src/shared/lib/stores/testStore";
import Image from "next/image";

export function TestViewPage({ id }: { id: number }) {
  const {
    currentTest,
    isLoadingTests,
    error: storeError,
    fetchOneTest,
    clearError,
  } = useTestsStore();

  const testData = currentTest;

  const [localError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  // Загрузка данных теста
  useEffect(() => {
    fetchOneTest(id);
  }, [id, fetchOneTest]);

  // Очистка ошибки при загрузке
  useEffect(() => {
    if (storeError) {
      clearError();
    }
  }, [storeError, clearError]);

  // Устанавливаем оставшееся время (для справки, если нужно)
  useEffect(() => {
    if (testData) {
      // Устанавливаем оставшееся время
      if (testData.timeRemaining) {
        setTimeLeft(Math.floor(testData.timeRemaining / 1000));
      }
    }
  }, [testData]);

  // Таймер обратного отсчета (опционально для просмотра)
  useEffect(() => {
    if (timeLeft <= 0 || !testData) return;

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
  }, [timeLeft, testData]);

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

  if (isLoadingTests) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка теста...</p>
        </div>
      </div>
    );
  }

  if (storeError && !testData) {
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

  if (!testData) return null;

  if (testData.status === "PENDING") {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          {testData.status === "PENDING" ? (
            <Loader className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          ) : (
            <CircleCheckBig className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          )}
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {testData.status === "PENDING" ? "Ожидание проверки" : "Принят"}
          </h2>
        </div>
      </div>
    );
  }

  if (testData.isExpired || timeLeft <= 0) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Дедлайн истёк
          </h2>
          <p className="text-gray-600 mb-4">
            К сожалению, время для прохождения этого теста истекло.
          </p>
          <p className="text-sm text-gray-500">
            Дедлайн был:{" "}
            {testData.deadline
              ? new Date(testData.deadline).toLocaleString("ru-RU")
              : "N/A"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className=" py-8 px-4 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Заголовок теста */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {testData.title}
              </h1>
              <p className="text-gray-600">{testData.description}</p>
              <p className="text-sm text-gray-500 mt-2">
                Предмет: {testData.subject?.name}
              </p>
            </div>
            {testData.deadline && (
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
        </div>

        {/* Вопросы */}
        <div className="space-y-6">
          {testData.questions?.map((question, qIndex) => (
            <div
              key={question.id}
              className="bg-white rounded-lg shadow-lg p-6"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">
                  {qIndex + 1}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {question.text}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {question.type === "multiple"
                      ? "Множественный выбор"
                      : "Один вариант"}
                  </p>
                  {question.image && (
                    <Image
                      src={`${process.env.NEXT_PUBLIC_API_URL}${question.image}`}
                      alt="Question"
                      className="mt-4 rounded-lg max-w-md w-full"
                    />
                  )}
                </div>
              </div>

              <div className="space-y-3 ml-12">
                {/* Для преподавателей: отображаем правильные ответы */}
                {question.options?.map((option, optIndex) => {
                  const isCorrect =
                    question.correct?.includes(optIndex) || false;
                  return (
                    <div
                      key={option.id}
                      className={`flex items-center gap-3 p-4 border-2 rounded-lg transition-all cursor-default ${
                        isCorrect
                          ? "bg-green-50 border-green-300"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded flex-shrink-0 ${
                          isCorrect ? "bg-green-500" : "bg-gray-300"
                        }`}
                      >
                        {isCorrect && (
                          <CheckCircle2 className="w-5 h-5 text-white m-auto" />
                        )}
                      </div>
                      <span
                        className={`${
                          isCorrect
                            ? "text-green-800 font-medium"
                            : "text-gray-700"
                        }`}
                      >
                        {option.text}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
