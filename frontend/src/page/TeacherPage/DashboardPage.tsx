"use client";

import { ProgressIsland } from "@/src/widgets/AdminPage/ProgressIsland";
import { NotificationIsland } from "@/src/widgets/NotificationIsland";

export function DashboardPage() {
  return (
    <div className="flex gap-5 container mx-auto">
      <div className="grid lg:grid-cols-[1.8fr_1fr] gap-5 w-full">
        <ProgressIsland />
        <div className="gap-5 grid h-fit">
          <NotificationIsland />
        </div>
      </div>
    </div>
  );
}
