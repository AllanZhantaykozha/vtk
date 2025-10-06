"use client";

import { useState, useRef, useEffect } from "react";
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

type Subject = {
  id: number;
  name: string;
};

export default function CreateLecturePage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [lecture, setLecture] = useState({
    title: "",
    description: "",
    subjectId: 0,
    fileContent: "",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:4000/subjects/get-my-subjects", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setSubjects(data))
      .catch((err) => console.error("Ошибка загрузки предметов:", err));
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".docx")) {
      alert("Пожалуйста, загрузите файл в формате .docx.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const base64String = (e.target?.result as string).split(",")[1]; // вырезаем "data:application/..."
        setLecture((prev) => ({ ...prev, fileContent: base64String }));
      } catch (error) {
        console.error("Ошибка при чтении файла:", error);
        alert("Ошибка при чтении файла.");
      }
    };
    reader.readAsDataURL(file);
  };

  const saveLecture = async () => {
    if (
      !lecture.title ||
      !lecture.subjectId ||
      !lecture.description ||
      !lecture.fileContent
    ) {
      alert("Заполните все поля и загрузите .docx файл.");
      return;
    }

    const payload = {
      title: lecture.title,
      description: lecture.description,
      subjectId: lecture.subjectId,
      fileContent: lecture.fileContent,
    };

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:4000/lectures", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const err = await response.json();
        console.error("Ошибка:", err);
        throw new Error(err.message || "Ошибка при создании лекции");
      }

      alert("Лекция успешно сохранена!");
      setLecture({
        title: "",
        description: "",
        subjectId: 0,
        fileContent: "",
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Ошибка при сохранении лекции:", error);
      alert("Ошибка при сохранении лекции.");
    }
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-gray-800">
              Создание лекции
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Название лекции</Label>
              <Input
                id="title"
                value={lecture.title}
                onChange={(e) =>
                  setLecture({ ...lecture, title: e.target.value })
                }
                placeholder="Введите название лекции"
              />
            </div>
            <div>
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                value={lecture.description}
                onChange={(e) =>
                  setLecture({ ...lecture, description: e.target.value })
                }
                placeholder="Введите описание лекции"
              />
            </div>
            <div>
              <Label htmlFor="subject">Предмет</Label>
              <Select
                value={lecture.subjectId ? String(lecture.subjectId) : ""}
                onValueChange={(val) =>
                  setLecture({ ...lecture, subjectId: Number(val) })
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
            <div>
              <Label htmlFor="lecture-file">Файл лекции (.docx)</Label>
              <Input
                id="lecture-file"
                type="file"
                accept=".docx"
                ref={fileInputRef}
                onChange={handleFileUpload}
              />
            </div>
            <Button onClick={saveLecture}>Сохранить лекцию</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
