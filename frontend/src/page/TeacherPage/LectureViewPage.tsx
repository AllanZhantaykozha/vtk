"use client";

import { useEffect } from "react";
import { AlertCircle, XCircle, Download, Loader } from "lucide-react";
import { useLecturesStore } from "@/src/shared/lib/stores/lecturesStore";
import { Lecture } from "@/src/entities/Lecture/types";
import { download } from "@/src/shared/lib/download";

export function LectureViewPage({ id }: { id: number }) {
  const {
    currentLecture,
    isLoadingLectures,
    error: storeError,
    fetchLectureById,
  } = useLecturesStore();
  const lectureData = currentLecture as Lecture | null;

  // Загрузка данных лекции
  useEffect(() => {
    fetchLectureById(id);
  }, [id, fetchLectureById]);

  if (isLoadingLectures) {
    return (
      <div className=" flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-16 h-16 text-indigo-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Загрузка лекции...</p>
        </div>
      </div>
    );
  }

  if (storeError && !lectureData) {
    return (
      <div className=" flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Ошибка</h2>
          <p className="text-gray-600">{storeError}</p>
        </div>
      </div>
    );
  }

  if (!lectureData) return null;

  return (
    <div className=" py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Заголовок лекции */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {lectureData.title}
              </h1>
              <p className="text-gray-600 mb-4">{lectureData.description}</p>
              <p className="text-sm text-gray-500">
                Предмет: {lectureData.subject?.name}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Дата загрузки:{" "}
                {new Date(lectureData.uploadDate).toLocaleDateString("ru-RU")}
              </p>
            </div>
          </div>

          {storeError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 mb-4">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-700">{storeError}</p>
            </div>
          )}

          {/* Кнопка скачивания */}
          <button
            onClick={() => download(lectureData.fileContent, lectureData.title)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <Download className="w-5 h-5" />
            Скачать лекцию
          </button>
        </div>
      </div>
    </div>
  );
}
