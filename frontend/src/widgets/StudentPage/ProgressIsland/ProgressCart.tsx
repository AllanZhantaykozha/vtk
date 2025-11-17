import { Statistic } from "@/src/entities/Test/types";
import { BookOpen, Flame, Calendar, Clock } from "lucide-react";

export function ProgressCart({ data }: { data: Statistic }) {
  const grade = Number(data.averageGrade);
  const needsAttention = grade < 70;

  return (
    <div className="bg-white rounded-3xl p-4 w-full max-w-sm min-w-xs border relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full blur-xl translate-x-8 -translate-y-8" />

      {/* Header */}
      <div className="flex items-center justify-between mb-3 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-gray-600" />
          </div>
          <h3 className="text-sm font-semibold text-gray-800">
            {data.subjectName}
          </h3>
        </div>
        {needsAttention && (
          <div className="flex items-center gap-1 bg-red-500/20 px-2 py-1 rounded-full text-xs text-red-300">
            <Flame className="w-3 h-3" />
            <span>Needs attention</span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-3 relative z-10">
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-purple-500 to-indigo-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${grade}%` }}
          />
        </div>
      </div>
      <div className="flex relative">
        {/* Info Lines */}
        <div className="space-y-2 relative z-10 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>Назначенный: {data.totalTests}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>Выполнено: {data.totalSubmissions}</span>
          </div>
        </div>

        <span className="text-lg font-bold text-gray-600 flex absolute items-center right-0 bottom-1/2 translate-y-1/2">
          {grade}%
        </span>
      </div>
    </div>
  );
}
