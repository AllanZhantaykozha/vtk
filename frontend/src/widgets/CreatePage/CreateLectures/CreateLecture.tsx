"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { Upload, CheckCircle2 } from "lucide-react";
import { useLecturesStore } from "@/src/shared/lib/stores/lecturesStore";
import { CreateLectureDto } from "@/src/entities/Lecture/api/queries";
import { useSubjectStore } from "@/src/shared/lib/stores/subjectsStore";
import { Select } from "@/src/shared/ui/Select";
import { useRouter } from "next/navigation";

const createLectureSchema = z.object({
  title: z.string().min(1, "Название лекции обязательно"),
  description: z.string(),
  subjectId: z.number().min(1, "Выберите предмет"),
  fileContent: z.string().min(1, "Файл обязателен"),
});

export type CreateLectureFormData = z.infer<typeof createLectureSchema>;

export function CreateLecturePage() {
  const { createLecture } = useLecturesStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const router = useRouter();

  const { subjects } = useSubjectStore();

  const methods = useForm<CreateLectureFormData>({
    resolver: zodResolver(createLectureSchema),
    mode: "onChange", // Real-time validation
    defaultValues: {
      title: "",
      description: "",
      subjectId: 0,
      fileContent: "",
    },
  });

  const {
    handleSubmit,
    register,
    setValue,
    watch,
    formState: { errors, isValid },
  } = methods;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.readAsDataURL(selectedFile);
      reader.onload = () => {
        const base64 = (reader.result as string).split(",")[1];
        setValue("fileContent", base64, { shouldValidate: true });
      };
    }
  };

  const onSubmit = async (data: CreateLectureDto) => {
    setIsSubmitting(true);
    try {
      const lectureData: CreateLectureDto = {
        ...data,
      };
      const success = await createLecture(lectureData);
      console.log(success);
      if (success && typeof success !== "string") {
        console.log("Lecture created successfully");
        router.replace("/test/create");
      } else {
        console.error("Error:", success);
      }
    } catch (error) {
      console.error("Error creating lecture:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Создать лекцию</h1>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white rounded-lg shadow-lg p-6 space-y-6"
        >
          {/* Название */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Название <span className="text-red-500">*</span>
            </label>
            <input
              {...register("title")}
              type="text"
              placeholder="Введите название лекции"
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:border-transparent ${
                errors.title
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-indigo-500"
              }`}
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Описание */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Описание (опционально)
            </label>
            <textarea
              {...register("description")}
              placeholder="Введите описание лекции"
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:border-transparent ${
                errors.description
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-indigo-500"
              }`}
              rows={4}
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Предмет */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Предмет <span className="text-red-500">*</span>
            </label>
            <Select
              data={subjects || []}
              selectedId={watch("subjectId")}
              getOptionLabel={(s) => s.name}
              onChange={(id) => {
                const newId = Number(id);
                setValue("subjectId", newId, { shouldValidate: true });
                console.log("Selected subjectId:", newId); // Debug
              }}
            />
            {errors.subjectId && (
              <p className="text-red-500 text-sm mt-1">
                {errors.subjectId.message}
              </p>
            )}
          </div>

          {/* Загрузка файла */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Файл лекции <span className="text-red-500">*</span>
            </label>
            <div
              className={`flex items-center justify-center w-full border-2 border-dashed rounded-lg p-6 transition-colors ${
                errors.fileContent
                  ? "border-red-500 bg-red-50"
                  : "border-gray-300 hover:border-indigo-400"
              }`}
            >
              <input
                type="file"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.zip"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex items-center gap-2 text-gray-500 hover:text-indigo-600"
              >
                <Upload className="w-5 h-5" />
                <span>{file ? file.name : "Выберите файл лекции"}</span>
              </label>
            </div>
            {errors.fileContent && (
              <p className="text-red-500 text-sm mt-1">
                {errors.fileContent.message}
              </p>
            )}
          </div>

          {/* Индикатор валидации */}
          <div className="text-sm text-gray-500">
            {isValid ? (
              <span className="text-green-600 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                Все поля заполнены корректно
              </span>
            ) : (
              <span className="text-yellow-600">
                Заполните обязательные поля для разблокировки кнопки
              </span>
            )}
          </div>

          {/* Кнопки */}
          <div className="flex justify-end gap-4 w-full">
            <button
              type="button"
              className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors w-full"
              onClick={() => window.history.back()} // or router.back()
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors w-full flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Создание...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Создать лекцию
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
