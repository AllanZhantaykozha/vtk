"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

type Option = { id: number; text: string };

type Question = {
  id: number;
  text: string;
  image?: string;
  type: "single" | "multiple";
  options: Option[];
  // внутренне — array of option ids (not indices)
  correct: number[];
};

type Test = {
  id: number;
  title: string;
  description: string;
  subject: { id: number; name: string };
  questions: Question[];
};

type Subject = {
  id: number;
  name: string;
  description?: string;
};

interface ApiOption {
  id?: number;
  text: string;
}

interface ApiQuestion {
  id: number;
  text: string;
  type: "single" | "multiple";
  options: ApiOption[];
  correct: number[];
}

interface ApiTest {
  id: number;
  title: string;
  description: string;
  subject: { id: number; name: string };
  questions: ApiQuestion[];
}

interface PayloadOption {
  id: number;
  text: string;
}

interface PayloadQuestion {
  text: string;
  type: "single" | "multiple";
  options: PayloadOption[];
  correct: number[]; // indices
}

export default function EditTestPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [test, setTest] = useState<Test | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [editingQuestionId, setEditingQuestionId] = useState<number | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // для генерации временных id для новых опций
  const tempOptionId = useRef(-1);
  // для генерации временных id для новых вопросов (локально)
  const tempQuestionId = useRef(-1);

  useEffect(() => {
    const fetchTestAndSubjects = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        // Fetch test
        const testResponse = await fetch(
          `http://localhost:4000/teacher/tests/${id}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!testResponse.ok) {
          if (testResponse.status === 401)
            throw new Error("Нет доступа: пожалуйста, войдите снова");
          if (testResponse.status === 403)
            throw new Error(
              "Доступ запрещен: только создатель теста или администратор может редактировать"
            );
          if (testResponse.status === 404) throw new Error("Тест не найден");
          throw new Error(
            `Ошибка при получении теста: ${testResponse.statusText}`
          );
        }

        const testData: ApiTest = await testResponse.json();

        // Нормализуем вопросы: приведём correct к форме [optionId, ...]
        const questions: Question[] = Array.isArray(testData.questions)
          ? testData.questions.map((q: ApiQuestion) => {
              const options: Option[] = Array.isArray(q.options)
                ? q.options.map((opt: ApiOption) => ({
                    id:
                      typeof opt.id === "number"
                        ? opt.id
                        : // если id отсутствует — даём временный
                          tempOptionId.current--,
                    text: opt.text ?? "",
                  }))
                : [];

              // Приведём correct к массиву option.id
              let correctIds: number[] = [];
              if (Array.isArray(q.correct) && q.correct.length > 0) {
                // Если значения выглядят как индексы (0..options.length-1)
                const looksLikeIndices =
                  q.correct.every(
                    (c: number) =>
                      Number.isInteger(c) && c >= 0 && c < (options.length || 0)
                  ) && options.length > 0;

                if (looksLikeIndices) {
                  correctIds = q.correct
                    .map((idx: number) => options[idx]?.id)
                    .filter(
                      (v: number | undefined) => typeof v === "number"
                    ) as number[];
                } else {
                  // Скорее всего это уже id'шники
                  correctIds = q.correct
                    .filter((c: number) => Number.isInteger(c))
                    .map((c: number) => c);
                }
              } else {
                correctIds = [];
              }

              return {
                id: typeof q.id === "number" ? q.id : tempQuestionId.current--,
                text: q.text ?? "",
                type: q.type === "multiple" ? "multiple" : "single",
                options,
                correct: correctIds,
              } as Question;
            })
          : [];

        setTest({
          id: testData.id,
          title: testData.title ?? "",
          description: testData.description ?? "",
          subject: {
            id: testData.subject?.id ?? 0,
            name: testData.subject?.name ?? "Неизвестно",
          },
          questions,
        });

        // Fetch subjects (для селекта предмета)
        const subjectsResponse = await fetch(
          "http://localhost:4000/subjects/get-my-subjects",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!subjectsResponse.ok) {
          throw new Error("Ошибка при загрузке предметов");
        }
        const subjectsData: Subject[] = await subjectsResponse.json();
        setSubjects(subjectsData);
      } catch (err: unknown) {
        setError(
          err instanceof Error
            ? err.message
            : "Произошла ошибка при загрузке данных"
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchTestAndSubjects();
  }, [id, router]);

  // Добавление опции: даём безопасный уникальный временный id (отрицательный)
  const addOption = () => {
    setCurrentQuestion((prev) => {
      if (!prev) {
        return {
          id: tempQuestionId.current--,
          text: "",
          type: "single",
          options: [{ id: tempOptionId.current--, text: "" }],
          correct: [],
        };
      }

      const newId = tempOptionId.current--;
      return {
        ...prev,
        options: [...prev.options, { id: newId, text: "" }],
      };
    });
  };

  const removeOption = (optionId: number) => {
    setCurrentQuestion((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        options: prev.options.filter((opt) => opt.id !== optionId),
        correct: prev.correct.filter((id) => id !== optionId),
      };
    });
  };

  const updateOptionText = (optionId: number, text: string) => {
    setCurrentQuestion((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        options: prev.options.map((opt) =>
          opt.id === optionId ? { ...opt, text } : opt
        ),
      };
    });
  };

  // корректное переключение правильных ответов
  const handleCorrectAnswer = (optionId: number) => {
    setCurrentQuestion((prev) => {
      if (!prev) return prev;
      if (prev.type === "single") {
        return { ...prev, correct: [optionId] };
      } else {
        const currentCorrect = Array.isArray(prev.correct) ? prev.correct : [];
        if (currentCorrect.includes(optionId)) {
          return {
            ...prev,
            correct: currentCorrect.filter((id) => id !== optionId),
          };
        } else {
          return { ...prev, correct: [...currentCorrect, optionId] };
        }
      }
    });
  };

  // Редактировать: делаем глубокую (безопасную) копию вопроса
  const editQuestion = (question: Question) => {
    console.log(question);

    const clone: Question = {
      id: question.id,
      text: question.text,
      image: question.image,
      type: question.type === "multiple" ? "multiple" : "single",
      options: (question.options || []).map((o: Option) => ({
        id: o.id,
        text: o.text,
      })),
      correct: Array.isArray(question.correct) ? [...question.correct] : [],
    };
    setCurrentQuestion(clone);
    setEditingQuestionId(question.id);
  };

  const cancelEditQuestion = () => {
    setCurrentQuestion(null);
    setEditingQuestionId(null);
  };

  const addOrUpdateQuestion = () => {
    if (
      !currentQuestion?.text?.trim() ||
      !currentQuestion.options.some((opt) => opt.text.trim())
    ) {
      toast.error("Заполните текст вопроса и хотя бы один вариант ответа.");
      return;
    }
    if (!currentQuestion.correct.length) {
      toast.error("Выберите правильный ответ.");
      return;
    }
    if (test) {
      setTest((prev) => {
        if (!prev) return prev;
        if (editingQuestionId) {
          // Update existing question
          return {
            ...prev,
            questions: prev.questions.map((q) =>
              q.id === editingQuestionId ? { ...currentQuestion, id: q.id } : q
            ),
          };
        } else {
          // Add new question (локально даём временный id)
          const newQ: Question = {
            ...currentQuestion,
            id: tempQuestionId.current--,
          };
          return {
            ...prev,
            questions: [...prev.questions, newQ],
          };
        }
      });
    }
    setCurrentQuestion(null);
    setEditingQuestionId(null);
  };

  const removeQuestion = (id: number) => {
    setTest((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        questions: prev.questions.filter((q) => q.id !== id),
      };
    });
  };

  const handleSubmit = async () => {
    if (!test?.title || !test.subject.id || !test.questions.length) {
      toast.error("Заполните все поля теста и добавьте хотя бы один вопрос.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      // Подготовка payload: для бэка correct должны быть индексы вариантов.
      const questionsPayload: PayloadQuestion[] = test.questions.map((q) => {
        const options: PayloadOption[] = q.options.map((opt) => ({
          id: opt.id,
          text: opt.text,
        }));
        // переводим наши correct (option ids) в индексы в массиве options
        const correctIndices = q.correct
          .map((optId) => options.findIndex((o) => o.id === optId))
          .filter((idx) => idx !== -1);

        return {
          text: q.text,
          type: q.type,
          options,
          correct: correctIndices,
        };
      });

      // проверим что для каждого вопроса есть корректный индекс
      const bad = questionsPayload.find(
        (pq) => !Array.isArray(pq.correct) || pq.correct.length === 0
      );
      if (bad) {
        toast.error(
          "В некоторых вопросах не удалось сопоставить правильные ответы — проверьте варианты."
        );
        setSubmitting(false);
        return;
      }

      const payload = {
        title: test.title,
        description: test.description,
        subjectId: test.subject.id,
        questions: questionsPayload,
      };

      const response = await fetch(`http://localhost:4000/tests/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        if (response.status === 401)
          throw new Error("Нет доступа: пожалуйста, войдите снова");
        if (response.status === 403)
          throw new Error(
            "Доступ запрещен: только создатель теста или администратор может редактировать"
          );
        if (response.status === 404) throw new Error("Тест не найден");
        const text: string = await response
          .text()
          .catch((): string => response.statusText);
        throw new Error(`Ошибка при обновлении теста: ${text}`);
      }

      toast.success("Тест успешно обновлен");
      router.push(`/teacher/tests/${id}`);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Произошла ошибка при обновлении теста"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Вы уверены, что хотите удалить этот тест?")) return;

    setSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch(`http://localhost:4000/tests/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401)
          throw new Error("Нет доступа: пожалуйста, войдите снова");
        if (response.status === 403)
          throw new Error(
            "Доступ запрещен: только создатель теста или администратор может удалить"
          );
        if (response.status === 404) throw new Error("Тест не найден");
        throw new Error(`Ошибка при удалении теста: ${response.statusText}`);
      }

      toast.success("Тест успешно удален");
      router.push("/teacher/tests");
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Произошла ошибка при удалении теста"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !test) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-gray-800">
                Загрузка теста...
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-6 w-3/4 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3 mb-2" />
              {error && <p className="text-red-600">{error}</p>}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-gray-800">
              Редактирование теста: {test.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Название теста</Label>
              <Input
                id="title"
                value={test.title}
                onChange={(e) => setTest({ ...test, title: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                value={test.description}
                onChange={(e) =>
                  setTest({ ...test, description: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="subject">Предмет</Label>
              <Select
                value={test.subject.id ? String(test.subject.id) : ""}
                onValueChange={(val) =>
                  setTest({
                    ...test,
                    subject: {
                      ...test.subject,
                      id: Number(val),
                      name:
                        subjects.find((s) => s.id === Number(val))?.name ||
                        test.subject.name,
                    },
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите предмет" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subj) => (
                    <SelectItem key={subj.id} value={String(subj.id)}>
                      {subj.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {editingQuestionId ? "Редактировать вопрос" : "Добавить вопрос"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="question-text">Текст вопроса</Label>
              <Input
                id="question-text"
                value={currentQuestion?.text || ""}
                onChange={(e) =>
                  setCurrentQuestion((prev) => {
                    if (!prev) {
                      return {
                        id: tempQuestionId.current--,
                        text: e.target.value,
                        type: "single",
                        options: [{ id: tempOptionId.current--, text: "" }],
                        correct: [],
                      };
                    }
                    return { ...prev, text: e.target.value };
                  })
                }
              />
            </div>
            <div>
              <Label>Тип вопроса</Label>
              <Select
                value={currentQuestion?.type || "single"}
                onValueChange={(value) =>
                  setCurrentQuestion((prev) => {
                    if (!prev) {
                      return {
                        id: tempQuestionId.current--,
                        text: "",
                        type: value as "single" | "multiple",
                        options: [{ id: tempOptionId.current--, text: "" }],
                        correct: [],
                      };
                    }
                    return {
                      ...prev,
                      type: value as "single" | "multiple",
                      correct: [],
                    };
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите тип вопроса" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Один правильный ответ</SelectItem>
                  <SelectItem value="multiple">Несколько правильных</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Варианты ответа</Label>
              {currentQuestion?.options.map((opt) => (
                <div key={opt.id} className="flex items-center space-x-2 mt-2">
                  <Input
                    value={opt.text}
                    onChange={(e) => updateOptionText(opt.id, e.target.value)}
                    placeholder={`Вариант`}
                  />

                  {/* single = radio, multiple = checkbox */}
                  {currentQuestion.type === "single" ? (
                    <input
                      type="radio"
                      name={`q-${currentQuestion.id}`}
                      checked={currentQuestion.correct[0] === opt.id}
                      onChange={() => handleCorrectAnswer(opt.id)}
                    />
                  ) : (
                    <Checkbox
                      checked={currentQuestion.correct.includes(opt.id)}
                      onCheckedChange={() => handleCorrectAnswer(opt.id)}
                    />
                  )}

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeOption(opt.id)}
                  >
                    Удалить
                  </Button>
                </div>
              ))}

              <Button
                onClick={addOption}
                className="mt-2"
                disabled={!currentQuestion}
              >
                Добавить вариант
              </Button>
            </div>

            <div className="flex gap-2">
              <Button onClick={addOrUpdateQuestion} disabled={!currentQuestion}>
                {editingQuestionId ? "Сохранить вопрос" : "Добавить вопрос"}
              </Button>
              {editingQuestionId && (
                <Button variant="outline" onClick={cancelEditQuestion}>
                  Отмена редактирования
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {test.questions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Вопросы теста</CardTitle>
            </CardHeader>
            <CardContent>
              {test.questions.map((q) => (
                <div key={q.id} className="mb-4 border-b pb-2">
                  <p className="font-semibold">{q.text}</p>
                  <p className="text-sm text-gray-500">
                    Тип: {q.type === "single" ? "Один ответ" : "Несколько"}
                  </p>
                  <ul className="list-disc pl-5">
                    {q.options.map((opt) => (
                      <li key={opt.id}>
                        {opt.text}{" "}
                        {Array.isArray(q.correct) &&
                        q.correct.includes(opt.id) ? (
                          <span className="text-green-600">(правильный)</span>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                  <div className="flex gap-2 mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => editQuestion(q)}
                    >
                      Редактировать
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeQuestion(q.id)}
                    >
                      Удалить
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <div className="flex gap-4">
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Сохранение..." : "Сохранить изменения"}
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={submitting}
          >
            {submitting ? "Удаление..." : "Удалить тест"}
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push(`/teacher/test/${id}`)}
            disabled={submitting}
          >
            Отмена
          </Button>
        </div>
        {error && <p className="text-red-600">{error}</p>}
      </div>
    </div>
  );
}
