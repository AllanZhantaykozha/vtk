"use client";

import { TeacherLectureCardIsland } from "@/src/widgets/TeacherPage/LecturePage/LectureCardIsland";
import { TeacherLecturesSortIsland } from "@/src/widgets/TeacherPage/LecturePage/LectureSortIsland";

export function LecturesPage() {
  return (
    <div className="">
      <div className="grid lg:grid-cols-[2fr_1fr] gap-5">
        <TeacherLectureCardIsland />
        <TeacherLecturesSortIsland />
      </div>
    </div>
  );
}
