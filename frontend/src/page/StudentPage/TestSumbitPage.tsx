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

interface SubmitResult {
  success: boolean;
  score?: number;
  total?: number;
}

export function TestSubmitPage({ id }: { id: number }) {
  const {
    currentTest,
    isLoadingTests,
    error: storeError,
    fetchOneTest,
    submitTest,
    clearError,
  } = useTestsStore();

  const testData = currentTest;

  const [answers, setAnswers] = useState<Record<number, number[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [submitResult, setSubmitResult] = useState<SubmitResult | null>(null);

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

  // Инициализация ответов и таймера
  useEffect(() => {
    if (testData) {
      // Инициализируем пустые ответы
      const initialAnswers: Record<number, number[]> = {};
      testData.questions?.forEach((q) => {
        initialAnswers[q.id] = [];
      });
      setAnswers(initialAnswers);

      // Устанавливаем оставшееся время
      if (testData.timeRemaining) {
        setTimeLeft(Math.floor(testData.timeRemaining / 1000));
      }
    }
  }, [testData]);

  // Таймер обратного отсчета
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

  const handleAnswerChange = (
    questionId: number,
    optionIndex: number,
    isMultiple: boolean
  ) => {
    setAnswers((prev) => {
      const current = prev[questionId] || [];

      if (isMultiple) {
        // Для множественного выбора
        if (current.includes(optionIndex)) {
          return {
            ...prev,
            [questionId]: current.filter((i) => i !== optionIndex),
          };
        } else {
          return {
            ...prev,
            [questionId]: [...current, optionIndex],
          };
        }
      } else {
        // Для одиночного выбора
        return {
          ...prev,
          [questionId]: [optionIndex],
        };
      }
    });
  };

  const handleSubmit = async () => {
    if (!testData) return;

    // Проверка, что все вопросы отвечены
    const unanswered = testData.questions?.filter(
      (q) => !answers[q.id] || answers[q.id].length === 0
    );

    if (unanswered && unanswered.length > 0) {
      setLocalError(
        `Пожалуйста, ответьте на все вопросы. Не отвечено: ${unanswered.length}`
      );
      return;
    }

    try {
      setIsSubmitting(true);
      setLocalError(null);
      clearError(); // Очищаем store error перед submit

      const result = await submitTest(id, answers);
      if (!result) {
        // Error уже установлен в store
        setSubmitResult({ success: false });
        return;
      }

      setSubmitResult({
        success: true,
        score: result.submissions[0].score,
        total: testData.questions?.length || 0,
      });
    } catch (err) {
      // Fallback error handling, though store should handle it
      setLocalError(
        err instanceof Error ? err.message : "Failed to submit test"
      );
      setSubmitResult({ success: false });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingTests) {
    return (
      <div className="flex h-min-screen items-center justify-center">
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

  if (submitResult) {
    return (
      <div className=" bg-gradient-to-br flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          {submitResult.success ? (
            <>
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Тест отправлен!
              </h2>
              <p className="text-gray-600 mb-4">
                Ваш результат: {submitResult.score} из {submitResult.total}
              </p>
              <p className="text-sm text-gray-500">
                Процент:{" "}
                {Math.round(
                  ((submitResult.score || 0) / (submitResult.total || 1)) * 100
                )}
                %
              </p>
              <p className="text-xs text-gray-400 mt-4">
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
    <div className=" bg-gradient-to-br  py-8 px-4">
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
                {question.options?.map((option, optIndex) => (
                  <label
                    key={option.id}
                    className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-indigo-50 hover:border-indigo-300"
                    style={{
                      borderColor: answers[question.id]?.includes(optIndex)
                        ? "#4f46e5"
                        : "#e5e7eb",
                      backgroundColor: answers[question.id]?.includes(optIndex)
                        ? "#eef2ff"
                        : "white",
                    }}
                  >
                    <input
                      type={question.type === "multiple" ? "checkbox" : "radio"}
                      name={`question-${question.id}`}
                      checked={
                        answers[question.id]?.includes(optIndex) || false
                      }
                      onChange={() =>
                        handleAnswerChange(
                          question.id,
                          optIndex,
                          question.type === "multiple"
                        )
                      }
                      className="w-5 h-5 text-indigo-600"
                    />
                    <span className="text-gray-700">{option.text}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Кнопка отправки */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || isLoadingTests}
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
                Отправить тест
              </>
            )}
          </button>
          <p className="text-sm text-gray-500 text-center mt-4">
            Отвечено вопросов:{" "}
            {Object.values(answers).filter((a) => a.length > 0).length} из{" "}
            {testData.questions?.length || 0}
          </p>
        </div>
      </div>
    </div>
  );
}
