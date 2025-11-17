"use client";

import { TeacherListIsland } from "@/src/widgets/AdminPage/TeacherIsland";
import { ProgressIsland } from "@/src/widgets/AdminPage/ProgressIsland";
import { NotificationIsland } from "@/src/widgets/NotificationIsland";

export function DashboardPage() {
  return (
    <div className="container mx-auto grid gap-5">
      <div className="grid xl:grid-cols-[1.8fr_1fr] gap-5">
        <div className="grid gap-5 h-fit">
          <ProgressIsland />
          <TeacherListIsland />
        </div>

        <div className="gap-5 grid ">
          <NotificationIsland />
        </div>
      </div>
    </div>
  );
}
