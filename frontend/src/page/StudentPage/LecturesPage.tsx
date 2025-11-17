"use client";

import { LectureCardIsland } from "@/src/widgets/StudentPage/LecturesPage/LectureCartIsland";
import { LecturesSortIsland } from "@/src/widgets/StudentPage/LecturesPage/LecturesSortIsland";

export function LecturesPage() {
  return (
    <div className="">
      <div className="grid lg:grid-cols-[2fr_1fr] gap-5">
        <LectureCardIsland />
        <LecturesSortIsland />
      </div>
    </div>
  );
}
