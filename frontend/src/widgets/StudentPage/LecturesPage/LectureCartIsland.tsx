"use client";

import { Lecture } from "@/src/entities/Lecture/types";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLecturesStore } from "@/src/shared/lib/stores/lecturesStore";

export function LectureCardIsland() {
  const { lectures, fetchLectures } = useLecturesStore();
  const router = useRouter();

  useEffect(() => {
    fetchLectures();
  }, [fetchLectures]);

  const handleViewLecture = (lectureId: number) => {
    console.log(`Viewing Lecture ${lectureId}`);
    router.push(`lectures/${lectureId}`); // Example route to download/view page
  };

  return (
    <div className="w-full bg-white rounded-3xl p-8">
      <div className="text-lg font-semibold mb-6">Лекции</div>
      <div className="grid gap-5">
        {lectures?.map((lecture: Lecture) => {
          return (
            <div
              key={lecture.id}
              className="border-2 border-gray-200 rounded-lg hover:shadow-md transition-shadow bg-white flex flex-col overflow-hidden" // Rectangular fixed height, no stripes
            >
              {/* Header */}
              <div className="p-6 flex-1 flex flex-col">
                <div>
                  <h3 className="text-lg font-semibold mb-3 line-clamp-2 text-gray-900">
                    {lecture.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                    {lecture.description || "Без описания"}
                  </p>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-800">Предмет:</span>
                    <span className="text-gray-900">
                      {lecture.subject?.name || "Не указан"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-800">
                      Дата загрузки:
                    </span>
                    <span className="text-gray-900">
                      {new Date(lecture.uploadDate).toLocaleDateString("ru-RU")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-800">
                      Преподаватель:
                    </span>
                    <span className="text-gray-900 truncate">
                      {lecture.teacher?.user?.fullName || "Не указан"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom button */}
              <div className="px-6 pb-6">
                <button
                  onClick={() => handleViewLecture(lecture.id)}
                  className="w-full py-3 rounded-lg text-white font-semibold text-sm transition-all border-0 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
                >
                  Открыть лекцию
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {lectures?.length === 0 && (
        <p className="text-gray-500 text-center py-12 text-lg">Нет лекций</p>
      )}
    </div>
  );
}
