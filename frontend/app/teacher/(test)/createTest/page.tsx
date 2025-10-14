"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Question } from "@/components/types/test.type";

// Тип теста
type Test = {
  title: string;
  description: string;
  subjectId: number;
  questions: Question[];
};

type Subject = {
  id: number;
  name: string;
  description?: string;
};

export default function CreateTestPage() {
  const [currentQuestion, setCurrentQuestion] = useState<
    Omit<Question, "id"> & { file?: File }
  >({
    text: "",
    type: "single",
    options: [{ id: 1, text: "" }],
    correct: [],
    file: undefined,
  });

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [test, setTest] = useState<Test>({
    title: "",
    description: "",
    subjectId: 0,
    questions: [],
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:4000/subjects/get-my-subjects", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setSubjects(data))
      .catch((err) => console.error("Ошибка загрузки предметов:", err));
  }, []);

  const addOption = () => {
    setCurrentQuestion((prev) => ({
      ...prev,
      options: [
        ...(prev.options || []),
        { id: (prev.options?.length || 0) + 1, text: "" },
      ],
    }));
  };

  const removeOption = (optionId: number) => {
    setCurrentQuestion((prev) => ({
      ...prev,
      options: prev.options?.filter((opt) => opt.id !== optionId),
      correct: prev.correct?.filter((id) => id !== optionId),
      file: undefined,
    }));
  };

  const updateOptionText = (optionId: number, text: string) => {
    setCurrentQuestion((prev) => ({
      ...prev,
      options: prev.options?.map((opt) =>
        opt.id === optionId ? { ...opt, text } : opt
      ),
    }));
  };

  const handleCorrectAnswer = (optionId: number) => {
    setCurrentQuestion((prev) => {
      if (prev.type === "single") {
        return { ...prev, correct: [optionId] };
      }
      const currentCorrect = prev.correct || [];
      if (currentCorrect.includes(optionId)) {
        return {
          ...prev,
          correct: currentCorrect.filter((id) => id !== optionId),
        };
      }
      return { ...prev, correct: [...currentCorrect, optionId] };
    });
  };

  const addQuestion = () => {
    if (
      !currentQuestion.text ||
      !currentQuestion.options?.some((opt) => opt.text.trim())
    ) {
      alert("Заполните текст вопроса и хотя бы один вариант ответа.");
      return;
    }
    if (!currentQuestion.correct?.length) {
      alert("Выберите правильный ответ.");
      return;
    }
    setTest((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          ...currentQuestion,
          id: prev.questions.length + 1,
          options: currentQuestion.options || [],
          correct: currentQuestion.correct || [],
          file: currentQuestion.file,
        } as Question & { file?: File },
      ],
    }));

    setCurrentQuestion({
      text: "",
      type: "single",
      options: [{ id: 1, text: "" }],
      correct: [],
    });
  };

  const removeQuestion = (id: number) => {
    setTest((prev) => ({
      ...prev,
      questions: prev.questions.filter((q) => q.id !== id),
    }));
  };

  const saveTest = async () => {
    if (!test.title || !test.subjectId || !test.questions.length) {
      alert("Заполните все поля теста и добавьте хотя бы один вопрос.");
      return;
    }

    const formData = new FormData();

    // Текстовая часть
    formData.append("title", test.title);
    formData.append("description", test.description || "");
    formData.append("subjectId", String(test.subjectId));

    // Сериализуем вопросы, но без файлов
    const questions = test.questions.map(({ ...rest }) => rest);
    formData.append("questions", JSON.stringify(questions));

    // Прикрепляем файлы
    test.questions.forEach((q, index) => {
      if (q.file) {
        formData.append(`question_${index}`, q.file);
      }
    });

    try {
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:4000/tests", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json();
        console.error("Ошибка:", err);
        throw new Error(err.message || "Ошибка при создании теста");
      }

      alert("Тест успешно сохранён!");
      setTest({
        title: "",
        description: "",
        subjectId: 0,
        questions: [],
      });
    } catch (error) {
      console.error("Ошибка при сохранении теста:", error);
      alert("Ошибка при сохранении теста.");
    }
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-gray-800">
              Создание теста
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
              <Input
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
                value={test.subjectId ? String(test.subjectId) : ""}
                onValueChange={(val) =>
                  setTest({ ...test, subjectId: Number(val) })
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
            <CardTitle>Добавить вопрос</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="question-text">Текст вопроса</Label>
              <Input
                id="question-text"
                value={currentQuestion.text}
                onChange={(e) =>
                  setCurrentQuestion({
                    ...currentQuestion,
                    text: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <Label>Тип вопроса</Label>
              <Select
                value={currentQuestion.type}
                onValueChange={(value) =>
                  setCurrentQuestion({
                    ...currentQuestion,
                    type: value as "single" | "multiple",
                    correct: [],
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
              {currentQuestion.options?.map((opt) => (
                <div key={opt.id} className="flex items-center space-x-2 mt-2">
                  <Input
                    value={opt.text}
                    onChange={(e) => updateOptionText(opt.id, e.target.value)}
                    placeholder={`Вариант ${opt.id}`}
                  />
                  {currentQuestion.type === "single" ? (
                    <RadioGroup
                      value={currentQuestion.correct?.[0]?.toString() || ""}
                      onValueChange={() => handleCorrectAnswer(opt.id)}
                    >
                      <RadioGroupItem value={opt.id.toString()} />
                    </RadioGroup>
                  ) : (
                    <Checkbox
                      checked={
                        currentQuestion.correct?.includes(opt.id) || false
                      }
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
              <Button onClick={addOption} className="mt-2">
                Добавить вариант
              </Button>
            </div>
            <div>
              <Label htmlFor="question-image">
                Изображение (необязательно)
              </Label>
              <Input
                id="question-image"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setCurrentQuestion((prev) => ({ ...prev, file }));
                }}
              />
              {currentQuestion.file && (
                <p className="text-sm text-gray-500 mt-1">
                  {currentQuestion.file.name}
                </p>
              )}
            </div>
            <Button onClick={addQuestion}>Добавить вопрос</Button>
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
                        {q.correct.includes(opt.id) ? "(правильный)" : ""}
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeQuestion(q.id)}
                  >
                    Удалить вопрос
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <Button onClick={saveTest}>Сохранить тест</Button>
      </div>
    </div>
  );
}
