"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

type FAQItem = {
  question: string;
  answer: string;
};

const faqData: FAQItem[] = [
  {
    question: "Как зарегистрироваться на сайте?",
    answer:
      "Нажмите кнопку 'Регистрация' в правом верхнем углу и заполните все поля.",
  },
  {
    question: "Можно ли изменить пароль?",
    answer: "Да, перейдите в настройки профиля и выберите 'Сменить пароль'.",
  },
  {
    question: "Как добавить новый тест?",
    answer: "Зайдите в раздел 'Мои тесты' и нажмите кнопку 'Создать тест'.",
  },
  {
    question: "Что делать, если забыл логин?",
    answer: "Используйте опцию восстановления логина через вашу почту.",
  },
  {
    question: "Как удалить вопрос из теста?",
    answer: "Откройте тест, найдите нужный вопрос и нажмите 'Удалить'.",
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 space-y-6">
        <h1 className="text-4xl font-bold text-gray-800">
          FAQ — Часто задаваемые вопросы
        </h1>

        {faqData.map((item, index) => (
          <Card key={index} className="cursor-pointer">
            <CardHeader
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            >
              <CardTitle className="text-lg font-semibold">
                {item.question}
              </CardTitle>
            </CardHeader>
            {openIndex === index && (
              <CardContent className="text-gray-700">{item.answer}</CardContent>
            )}
          </Card>
        ))}

        <p className="text-gray-500 text-sm mt-4">
          Если вы не нашли ответ на свой вопрос, свяжитесь с нашей поддержкой.
        </p>
      </div>
    </div>
  );
}
