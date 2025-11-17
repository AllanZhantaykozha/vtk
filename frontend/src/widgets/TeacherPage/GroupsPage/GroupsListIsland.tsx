"use client";

import { Group } from "@/src/entities/Group/types";
import { useGroupStore } from "@/src/shared/lib/stores";
import { Users, GraduationCap, BookOpen } from "lucide-react";
import { useEffect } from "react";

export function GroupsListIsland() {
  const { groups, fetchAllGroups } = useGroupStore();

  useEffect(() => {
    fetchAllGroups();
  }, [fetchAllGroups]);

  return (
    <div className="w-full bg-white rounded-3xl min-h-fit lg:min-h-[600px] max-h-[600px] overflow-hidden flex flex-col p-4">
      <div className="flex items-center gap-2 mb-4">
        <GraduationCap className="w-5 h-5 text-indigo-600" />
        <h2 className="text-lg font-semibold text-gray-900">Группы</h2>
        {groups && (
          <span className="ml-auto bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            {groups.length}
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-2">
        {groups && groups.length > 0 ? (
          groups.map((group: Group) => (
            <div
              key={group.id}
              className="bg-gradient-to-br from-gray-50 to-indigo-50 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white flex-shrink-0">
                  <Users className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-gray-900 truncate">
                    {group.name}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-2  text-xs text-gray-600">
                    <BookOpen className="w-3 h-3 flex-shrink-0" />
                    <span className="font-medium">{`Кол-во студентов: ${
                      group.students?.length || 0
                    }`}</span>
                  </div>
                  {/* Отображение предметов */}
                  {group.subjects && group.subjects.length > 0 ? (
                    <div className="mt-2">
                      <div className="flex items-center gap-1.5 text-xs text-gray-600">
                        <BookOpen className="w-3 h-3 flex-shrink-0" />
                        <span className="font-medium">Предметы:</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {group.subjects.map((gs) => (
                          <span
                            key={gs.subjectId}
                            className="text-xs bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded"
                          >
                            {gs.subject.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2 text-xs text-gray-500 italic">
                      Нет назначенных предметов
                    </div>
                  )}

                  {/* Опционально: количество студентов */}
                  {/* <div className="mt-2 text-xs text-gray-600">
                    Студентов: {group.students?.length || 0}
                  </div> */}
                </div>
                <div className="text-xs font-medium text-gray-500 bg-white px-2 py-1 rounded-full whitespace-nowrap">
                  ID: {group.id}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <GraduationCap className="w-12 h-12 mb-3 opacity-50" />
            <p className="text-sm">Нет групп</p>
          </div>
        )}
      </div>
    </div>
  );
}
