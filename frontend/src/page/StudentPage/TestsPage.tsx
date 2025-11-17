"use client";

import { TestCardIsland } from "@/src/widgets/StudentPage/TestPage/TestsCartIsland";
import { TestsSortIsland } from "@/src/widgets/StudentPage/TestPage/TestsSortIsland";

export function TestsPage() {
  return (
    <div className="">
      <div className="grid lg:grid-cols-[2fr_1fr] gap-5">
        <TestCardIsland />
        <TestsSortIsland />
      </div>
    </div>
  );
}
