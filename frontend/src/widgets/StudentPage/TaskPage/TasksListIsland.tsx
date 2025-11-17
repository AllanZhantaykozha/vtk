// TasksListIsland.tsx
"use client";

import { useTasksStore } from "@/src/shared/lib/stores/taskStore";
import { useEffect } from "react";
import { TaskCardIsland } from "./TaskCartIsland";

export function TasksListIsland() {
  const { fetchTasks } = useTasksStore();

  useEffect(() => {
    fetchTasks(); // Assuming fetchTasks fetches all or my tasks
  }, [fetchTasks]);

  return (
    <div className="w-full bg-white rounded-3xl h-[600px] p-8 overflow-y-auto">
      <TaskCardIsland />
    </div>
  );
}
