"use client";

import { Teacher } from "@/src/entities/User/types";
import { useTeachersStore } from "@/src/shared/lib/stores/teachersStore";
import { useEffect } from "react";
import { User, BookOpen, Mail, GraduationCap } from "lucide-react";

export function TeacherListIsland() {
  const { teachers, fetchTeachers } = useTeachersStore();

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  return (
    <div className="w-full bg-white rounded-3xl min-h-fit lg:min-h-[600px] max-h-[600px] overflow-hidden flex flex-col p-4">
      <div className="flex items-center gap-2 mb-4">
        <GraduationCap className="w-5 h-5 text-indigo-600" />
        <h2 className="text-lg font-semibold text-gray-900">Преподаватели</h2>
        {teachers && (
          <span className="ml-auto bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            {teachers.length}
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-2">
        {teachers && teachers.length > 0 ? (
          teachers.map((teacher: Teacher) => (
            <div
              key={teacher.user.id}
              className="bg-gradient-to-br from-gray-50 to-indigo-50 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow"
            >
              {/* Заголовок карточки */}
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white flex-shrink-0">
                  <User className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-gray-900 truncate">
                    {teacher.user.fullName}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-gray-600 mt-1">
                    <Mail className="w-3 h-3" />
                    <span className="truncate">{teacher.user.login}</span>
                  </div>
                </div>
                <div className="text-xs font-medium text-gray-500 bg-white px-2 py-1 rounded-full">
                  ID: {teacher.user.id}
                </div>
              </div>

              {/* Предметы */}
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-medium text-gray-700">
                    Предметы ({teacher.subjects?.length || 0})
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {teacher.subjects && teacher.subjects.length > 0 ? (
                    teacher.subjects.map((subj) => (
                      <span
                        key={subj.subject.id}
                        className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                      >
                        {subj.subject.name}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-gray-500 italic">
                      Нет предметов
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <GraduationCap className="w-12 h-12 mb-3 opacity-50" />
            <p className="text-sm">Нет преподавателей</p>
          </div>
        )}
      </div>
    </div>
  );
}
