"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Test } from "@/components/types/test.type";

export default function TestPage() {
  const { id } = useParams();
  const router = useRouter();
  const [test, setTest] = useState<Test | null>(null);
  const [answers, setAnswers] = useState<Record<number, number[]>>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch test data
  useEffect(() => {
    const fetchTest = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        const response = await fetch(`http://localhost:4000/tests/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("Unauthorized");
          }
          throw new Error("Ошибка при загрузке теста");
        }
        const data: Test = await response.json();
        setTest(data);
        setLoading(false);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
        if (err.message.includes("Unauthorized")) {
          localStorage.removeItem("token");
          document.cookie = "auth_token=; path=/; max-age=0";
          router.push("/login");
        }
      }
    };

    fetchTest();
  }, [id, router]);

  // Handle single-choice selection
  const handleSingle = (questionId: number, optionId: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: [optionId] }));
  };

  // Handle multiple-choice selection
  const handleMultiple = (questionId: number, optionId: number) => {
    setAnswers((prev) => {
      const current = prev[questionId] || [];
      if (current.includes(optionId)) {
        return { ...prev, [questionId]: current.filter((o) => o !== optionId) };
      }
      return { ...prev, [questionId]: [...current, optionId] };
    });
  };

  // Submit answers
  const handleSubmit = async () => {
    if (!test) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch(`http://localhost:4000/tests/${id}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ answers }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Unauthorized");
        }
        throw new Error("Ошибка при отправке теста");
      }

      const result = await response.json();
      setScore(result.score);
      setIsDialogOpen(true);
    } catch (err: any) {
      setError(err.message);
      if (err.message.includes("Unauthorized")) {
        localStorage.removeItem("token");
        document.cookie = "auth_token=; path=/; max-age=0";
        router.push("/login");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 space-y-6">
        {!test ? (
          <p className="text-gray-600">Тест не найден</p>
        ) : (
          <>
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-3xl font-bold text-gray-800">
                  {test.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{test.description}</p>
                <p className="text-gray-500 text-sm mb-1">
                  <span className="font-medium">Предмет:</span>{" "}
                  {test.subject.name}
                </p>
                <p className="text-gray-500 text-sm mb-1">
                  <span className="font-medium">Преподаватель:</span>{" "}
                  {test.teacher.user.fullName}
                </p>
                <p className="text-gray-500 text-sm mb-4">
                  <span className="font-medium">Дата загрузки:</span>{" "}
                  {new Date(test.uploadDate).toLocaleDateString("ru-RU")}
                </p>
              </CardContent>
            </Card>

            {test.questions.map((q) => (
              <Card key={q.id}>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">
                    {q.text}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {q.image && (
                    <div className="mb-4">
                      <Image
                        src={q.image}
                        alt="question"
                        width={400}
                        height={300}
                        className="rounded-md border"
                      />
                    </div>
                  )}

                  {q.type === "single" ? (
                    <RadioGroup
                      value={answers[q.id]?.[0]?.toString() || ""}
                      onValueChange={(val) => handleSingle(q.id, Number(val))}
                    >
                      {q.options.map((opt) => (
                        <div
                          key={opt.id}
                          className="flex items-center space-x-2"
                        >
                          <RadioGroupItem
                            value={opt.id.toString()}
                            id={`opt-${opt.id}`}
                          />
                          <label htmlFor={`opt-${opt.id}`}>{opt.text}</label>
                        </div>
                      ))}
                    </RadioGroup>
                  ) : (
                    <div className="space-y-2">
                      {q.options.map((opt) => (
                        <div
                          key={opt.id}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`opt-${opt.id}`}
                            checked={answers[q.id]?.includes(opt.id) || false}
                            onCheckedChange={() => handleMultiple(q.id, opt.id)}
                          />
                          <label htmlFor={`opt-${opt.id}`}>{opt.text}</label>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            <Button onClick={handleSubmit}>Отправить</Button>
          </>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Результаты теста</DialogTitle>
              <DialogDescription>
                Ты ответил правильно на {score} из {test?.questions.length || 0}{" "}
                вопросов.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={() => setIsDialogOpen(false)}>Закрыть</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
