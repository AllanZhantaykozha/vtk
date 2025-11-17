"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect, useState } from "react";
import { Upload, CheckCircle2, FileText } from "lucide-react";
import { useTasksStore } from "@/src/shared/lib/stores/taskStore";
import { useRouter } from "next/navigation";

const editTaskSchema = z.object({
  title: z.string().min(1, "Название задачи обязательно"),
  description: z.string().min(1, "Описание обязательно"),
  deadline: z.string().min(1, "Дедлайн обязателен"),
  fileContent: z.string().optional(),
});

export type EditTaskFormData = z.infer<typeof editTaskSchema>;

export function EditTaskPage({ id }: { id: number }) {
  const { currentTask, fetchOneTask, updateTask } = useTasksStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (id) {
      fetchOneTask(id);
    }
  }, [id, fetchOneTask]);

  const methods = useForm<EditTaskFormData>({
    resolver: zodResolver(editTaskSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      description: "",
      deadline: "",
      fileContent: "",
    },
  });

  const {
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors, isValid },
  } = methods;

  const watchedFileContent = watch("fileContent");

  useEffect(() => {
    if (currentTask) {
      setValue("title", currentTask.title);
      setValue("description", currentTask.description || "");
      const deadlineString =
        currentTask.deadline instanceof Date
          ? currentTask.deadline.toISOString().slice(0, 16)
          : typeof currentTask.deadline === "string"
          ? currentTask.deadline
          : "";
      setValue("deadline", deadlineString);
      if (currentTask.fileContent) {
        setValue("fileContent", currentTask.fileContent);
      }
    }
  }, [currentTask, setValue]);

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

  const onSubmit = async (data: EditTaskFormData) => {
    if (!id) return;
    setIsSubmitting(true);
    try {
      console.log("Updating task data:", data);

      const taskData: EditTaskFormData = {
        title: data.title,
        description: data.description,
        deadline: data.deadline,
      };

      if (watchedFileContent && file) {
        taskData.fileContent = watchedFileContent;
      } else if (!watchedFileContent && !file && currentTask?.fileContent) {
        // Keep existing if no new file uploaded and no removal
        taskData.fileContent = currentTask.fileContent;
      } else if (!watchedFileContent && !file) {
        // If clearing file, omit or set to empty
        delete taskData.fileContent;
      }

      const success = await updateTask(Number(id), taskData);

      if (success) {
        console.log("Task updated successfully");
        router.push("/tasks");
      } else {
        console.error("Error:", success);
      }
    } catch (error) {
      console.error("Error updating task:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentTask || !id) {
    return (
      <div className="min-h-screen py-8 px-4 flex items-center justify-center">
        <div className="text-center">Загрузка...</div>
      </div>
    );
  }

  const hasFile = !!(file || watchedFileContent);

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Редактировать задачу
          </h1>
          <p className="text-gray-600">
            Обновите информацию о задаче для студентов
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white rounded-xl shadow-lg p-6 space-y-6"
        >
          {/* Название */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Название задачи <span className="text-red-500">*</span>
            </label>
            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  placeholder="Например: Практическое задание №1"
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:outline-none focus:border-transparent transition-all ${
                    errors.title
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-indigo-500"
                  }`}
                />
              )}
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
              Описание задачи <span className="text-red-500">*</span>
            </label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <textarea
                  {...field}
                  placeholder="Подробное описание задачи, требования и критерии оценки"
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:outline-none focus:border-transparent transition-all ${
                    errors.description
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-indigo-500"
                  }`}
                  rows={6}
                />
              )}
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Дедлайн */}
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
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:outline-none focus:border-transparent transition-all ${
                    errors.deadline
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-indigo-500"
                  }`}
                />
              )}
            />
            {errors.deadline && (
              <p className="text-red-500 text-sm mt-1">
                {errors.deadline.message}
              </p>
            )}
          </div>

          {/* Загрузка файла */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Файл задачи (опционально)
            </label>
            <div
              className={`flex flex-col items-center justify-center w-full border-2 border-dashed rounded-lg p-8 transition-all ${
                hasFile
                  ? "border-green-500 bg-green-50"
                  : "border-gray-300 hover:border-indigo-400 hover:bg-indigo-50"
              }`}
            >
              <input
                type="file"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
                accept=".pdf,.doc,.docx,.txt,.zip,.rar"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center gap-3 w-full"
              >
                {file ? (
                  <>
                    <FileText className="w-12 h-12 text-green-600" />
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-700">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                      <p className="text-xs text-indigo-600 mt-2 hover:underline">
                        Нажмите, чтобы изменить файл
                      </p>
                    </div>
                  </>
                ) : watchedFileContent ? (
                  <>
                    <FileText className="w-12 h-12 text-green-600" />
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-700">
                        Файл прикреплён
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Существующий файл
                      </p>
                      <p className="text-xs text-indigo-600 mt-2 hover:underline">
                        Нажмите, чтобы заменить
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <Upload className="w-12 h-12 text-gray-400" />
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-700">
                        Нажмите для загрузки файла
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PDF, DOC, DOCX, TXT, ZIP (макс. 10MB)
                      </p>
                    </div>
                  </>
                )}
              </label>
            </div>
          </div>

          {/* Индикатор валидации */}
          <div className="bg-gray-50 rounded-lg p-4">
            {isValid ? (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-sm font-medium">
                  Все обязательные поля заполнены корректно
                </span>
              </div>
            ) : (
              <div className="flex items-start gap-2 text-yellow-600">
                <div className="w-5 h-5 rounded-full border-2 border-yellow-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs">!</span>
                </div>
                <div>
                  <p className="text-sm font-medium">
                    Заполните обязательные поля
                  </p>
                  <ul className="text-xs mt-1 space-y-1">
                    {!watch("title") && <li>• Название задачи</li>}
                    {!watch("description") && <li>• Описание задачи</li>}
                    {!watch("deadline") && <li>• Дедлайн</li>}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Кнопки */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
            <button
              type="button"
              className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors"
              onClick={() => router.back()}
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Сохранение...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Сохранить изменения
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
