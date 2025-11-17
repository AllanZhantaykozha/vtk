// src/pages/TeacherTasksPage.tsx
"use client";

import { TeacherTaskCardIsland } from "@/src/widgets/TeacherPage/TaskPage/TaskCardIsland";
import { TeacherTasksSortIsland } from "@/src/widgets/TeacherPage/TaskPage/TaskSortIsland";

export function TeacherTasksPage() {
  return (
    <div className="">
      <div className="grid lg:grid-cols-[2fr_1fr] gap-5">
        <TeacherTaskCardIsland />
        <TeacherTasksSortIsland />
      </div>
    </div>
  );
}
