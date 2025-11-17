"use client";

import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { Select } from "@/src/shared/ui/Select";
import { useTestsStore } from "@/src/shared/lib/stores/testStore";
import { Subject } from "@/src/entities/Subject/types";
import { useSubjectStore } from "@/src/shared/lib/stores/subjectsStore";
import { Trash2, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface OptionDto {
  text: string;
}

interface QuestionDto {
  text: string;
  type: "single" | "multiple";
  options: OptionDto[];
  correct: number[];
}

export interface CreateTestDto {
  title: string;
  description?: string;
  subjectId: number;
  deadline: string;
  questions: QuestionDto[];
}

const createTestSchema = z.object({
  title: z.string().min(1, "Название теста обязательно"),
  description: z.string().optional(),
  subjectId: z.number().min(1, "Выберите предмет"),
  deadline: z.string().min(1, "Дедлайн обязателен"),
  questions: z
    .array(
      z.object({
        text: z.string().min(1, "Текст вопроса обязателен"),
        type: z.enum(["single", "multiple"]),
        options: z
          .array(
            z.object({
              text: z.string().min(1, "Текст варианта обязателен"),
            })
          )
          .min(2, "Минимум 2 варианта ответа"),
        correct: z
          .array(z.number().min(0))
          .min(1, "Выберите хотя бы один правильный ответ"),
      })
    )
    .min(1, "Добавьте хотя бы один вопрос"),
});

export type CreateTestFormData = z.infer<typeof createTestSchema>;

export function CreateTestPage() {
  const { createTest } = useTestsStore();
  const { subjects } = useSubjectStore();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const router = useRouter();

  const methods = useForm<CreateTestFormData>({
    resolver: zodResolver(createTestSchema),
    defaultValues: {
      title: "",
      description: "",
      subjectId: 0,
      deadline: "",
      questions: [
        {
          text: "",
          type: "single" as const,
          options: [{ text: "" }, { text: "" }],
          correct: [], // ← Изменено
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: methods.control,
    name: "questions",
  });

  const {
    handleSubmit,
    register,
    setValue,
    watch,
    control,
    formState: { errors },
  } = methods;

  const onSubmit = async (data: CreateTestFormData): Promise<void> => {
    setIsSubmitting(true);
    try {
      // Преобразуем данные в нужный формат
      const testData: CreateTestDto = {
        title: data.title,
        description: data.description,
        subjectId: Number(data.subjectId),
        deadline: data.deadline,
        questions: data.questions.map((q) => ({
          text: q.text,
          type: q.type,
          options: q.options,
          correct: q.correct, // ← Уже правильное название
        })),
      };

      const success = await createTest(testData);

      if (success && typeof success !== "string") {
        console.log("Test created successfully");
        router.replace("/test/create");
      } else {
        console.error("Error:", success);
      }
    } catch (error) {
      console.error("Error creating test:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addQuestion = (): void => {
    append({
      text: "",
      type: "single" as const,
      options: [{ text: "" }, { text: "" }],
      correct: [],
    });
  };

  const addOption = (questionIndex: number): void => {
    const currentOptions = watch(`questions.${questionIndex}.options`) || [];
    setValue(`questions.${questionIndex}.options`, [
      ...currentOptions,
      { text: "" },
    ]);
  };

  const removeOption = (questionIndex: number, optionIndex: number): void => {
    const currentOptions = watch(`questions.${questionIndex}.options`) || [];
    if (currentOptions.length > 2) {
      // Удаляем опцию
      setValue(
        `questions.${questionIndex}.options`,
        currentOptions.filter((_, i) => i !== optionIndex)
      );

      // Корректируем индексы в массиве correct
      const currentCorrect = watch(`questions.${questionIndex}.correct`) || [];
      const adjustedCorrect = currentCorrect
        .filter((idx: number) => idx !== optionIndex)
        .map((idx: number) => (idx > optionIndex ? idx - 1 : idx));

      setValue(`questions.${questionIndex}.correct`, adjustedCorrect);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Создать тест
          </h1>
          <p className="text-gray-600">
            Заполните информацию о тесте и добавьте вопросы с вариантами ответов
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Основная информация теста */}
          <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Основная информация
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Название теста <span className="text-red-500">*</span>
              </label>
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    placeholder="Например: Тест по математике"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                )}
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Описание
              </label>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <textarea
                    {...field}
                    placeholder="Краткое описание теста (опционально)"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px]"
                  />
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Предмет <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="subjectId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      data={subjects || []}
                      selectedId={field.value}
                      getOptionLabel={(s: Subject) => s.name}
                      onChange={(id: number | undefined) =>
                        field.onChange(Number(id))
                      }
                    />
                  )}
                />
                {errors.subjectId && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.subjectId.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Дедлайн <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="deadline"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="datetime-local"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  )}
                />
                {errors.deadline && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.deadline.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Вопросы */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Вопросы</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Всего вопросов: {fields.length}
                </p>
              </div>
              <button
                type="button"
                onClick={addQuestion}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5" />
                Добавить вопрос
              </button>
            </div>

            {errors.questions &&
              typeof errors.questions.message === "string" && (
                <p className="text-red-500 text-sm mb-4">
                  {errors.questions.message}
                </p>
              )}

            {fields.map((field, questionIndex) => {
              const questionType =
                watch(`questions.${questionIndex}.type`) || "single";
              const options = watch(`questions.${questionIndex}.options`) || [];

              return (
                <div
                  key={field.id}
                  className="border-2 border-gray-200 rounded-xl p-6 mb-6 bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Заголовок вопроса */}
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-semibold text-gray-800">
                      Вопрос {questionIndex + 1}
                    </h4>
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => remove(questionIndex)}
                        className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  {/* Текст вопроса */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Текст вопроса
                    </label>
                    <Controller
                      name={`questions.${questionIndex}.text`}
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          placeholder="Введите текст вопроса"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      )}
                    />
                    {errors.questions?.[questionIndex]?.text && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.questions[questionIndex]?.text?.message}
                      </p>
                    )}
                  </div>

                  {/* Тип вопроса */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Тип вопроса
                    </label>
                    <select
                      {...register(`questions.${questionIndex}.type`)}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="single">Одиночный выбор</option>
                      <option value="multiple">Множественный выбор</option>
                    </select>
                  </div>

                  {/* Варианты ответа с чекбоксами */}
                  {/* Варианты ответа с чекбоксами */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Варианты ответа
                    </label>
                    <div className="space-y-3">
                      {options.map((option, optionIndex) => (
                        <div
                          key={optionIndex}
                          className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          {/* Чекбокс/Радио для правильного ответа */}
                          <div className="flex items-center pt-2">
                            <Controller
                              name={`questions.${questionIndex}.correct`}
                              control={control}
                              render={({ field }) => (
                                <input
                                  type={
                                    questionType === "single"
                                      ? "radio"
                                      : "checkbox"
                                  }
                                  checked={
                                    field.value?.includes(optionIndex) || false
                                  }
                                  onChange={(e) => {
                                    if (questionType === "single") {
                                      // Для radio - заменяем весь массив
                                      field.onChange(
                                        e.target.checked ? [optionIndex] : []
                                      );
                                    } else {
                                      // Для checkbox - добавляем/удаляем из массива
                                      const currentValue = field.value || [];
                                      if (e.target.checked) {
                                        field.onChange([
                                          ...currentValue,
                                          optionIndex,
                                        ]);
                                      } else {
                                        field.onChange(
                                          currentValue.filter(
                                            (idx: number) => idx !== optionIndex
                                          )
                                        );
                                      }
                                    }
                                  }}
                                  className="w-5 h-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                                  title="Отметить как правильный ответ"
                                />
                              )}
                            />
                          </div>

                          {/* Поле ввода текста варианта */}
                          <div className="flex-1">
                            <Controller
                              name={`questions.${questionIndex}.options.${optionIndex}.text`}
                              control={control}
                              render={({ field }) => (
                                <input
                                  {...field}
                                  type="text"
                                  placeholder={`Вариант ${optionIndex + 1}`}
                                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                              )}
                            />
                            {errors.questions?.[questionIndex]?.options?.[
                              optionIndex
                            ]?.text && (
                              <p className="text-red-500 text-xs mt-1">
                                {
                                  errors.questions[questionIndex]?.options?.[
                                    optionIndex
                                  ]?.text?.message
                                }
                              </p>
                            )}
                          </div>

                          {/* Кнопка удаления варианта */}
                          {options.length > 2 && (
                            <button
                              type="button"
                              onClick={() =>
                                removeOption(questionIndex, optionIndex)
                              }
                              className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    {errors.questions?.[questionIndex]?.options && (
                      <p className="text-red-500 text-sm mt-2">
                        {errors.questions[questionIndex]?.options?.message}
                      </p>
                    )}
                    {errors.questions?.[questionIndex]?.correct && (
                      <p className="text-red-500 text-sm mt-2">
                        {errors.questions[questionIndex]?.correct?.message}
                      </p>
                    )}

                    {/* Кнопка добавления варианта */}
                    <button
                      type="button"
                      onClick={() => addOption(questionIndex)}
                      className="mt-3 flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Добавить вариант
                    </button>
                  </div>

                  {/* Подсказка */}
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-700">
                      💡{" "}
                      {questionType === "single"
                        ? "Выберите один"
                        : "Выберите один или несколько"}{" "}
                      правильный{questionType === "multiple" ? "х" : ""} ответ
                      {questionType === "multiple" ? "ов" : ""}, отметив чекбокс
                      слева от варианта
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Кнопка отправки */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
            >
              {isSubmitting ? "Создание..." : "Создать тест"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
