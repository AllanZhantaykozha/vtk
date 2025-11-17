"use client";

import { GroupsListIsland } from "@/src/widgets/TeacherPage/GroupsPage/GroupsListIsland";
import { GroupsSortIsland } from "@/src/widgets/TeacherPage/GroupsPage/GroupsSortIsland";

export function GroupsPage() {
  return (
    <div className="">
      <div className="grid lg:grid-cols-[2fr_1fr] gap-5">
        <GroupsListIsland />
        <GroupsSortIsland />
      </div>
    </div>
  );
}
