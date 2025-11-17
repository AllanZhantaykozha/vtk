"use client";

import { NotificationIsland } from "@/src/widgets/NotificationIsland";
import { DeadlinesIsland } from "@/src/widgets/StudentPage/DeadlineIsland/DeadlineIsland";
import { ProgressIsland } from "@/src/widgets/StudentPage/ProgressIsland";

export function DashboardPage() {
  return (
    <div className="container mx-auto grid gap-5">
      <div className="grid xl:grid-cols-[1.8fr_1fr] gap-5">
        <div className="gap-5 grid h-fit">
          <ProgressIsland />
          <DeadlinesIsland />
        </div>

        <div className="grid gap-5">
          <NotificationIsland />
        </div>
      </div>
    </div>
  );
}
