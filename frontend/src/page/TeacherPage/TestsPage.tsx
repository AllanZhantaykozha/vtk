// src/pages/TeacherTestsPage.tsx
"use client";

import { TeacherTestCardIsland } from "@/src/widgets/TeacherPage/TestPage/TestCardIsland";
import { TeacherTestsSortIsland } from "@/src/widgets/TeacherPage/TestPage/TestsSortIsland";

export function TestsPage() {
  return (
    <div className="">
      <div className="grid lg:grid-cols-[2fr_1fr] gap-5">
        <TeacherTestCardIsland />
        <TeacherTestsSortIsland />
      </div>
    </div>
  );
}
