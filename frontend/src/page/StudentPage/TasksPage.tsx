"use client";

import { TaskCardIsland } from "@/src/widgets/StudentPage/TaskPage/TaskCartIsland";
import { TasksSortIsland } from "@/src/widgets/StudentPage/TaskPage/TasksSortIsland";

export function TasksPage() {
  return (
    <div className="">
      <div className="grid lg:grid-cols-[2fr_1fr] gap-5">
        <TaskCardIsland />
        <TasksSortIsland />
      </div>
    </div>
  );
}
