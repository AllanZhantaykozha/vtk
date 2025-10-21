"use client";

import { TeacherListIsland } from "@/src/widgets/AdminPage/TeacherIsland";
import { ProgressIsland } from "@/src/widgets/AdminPage/ProgressIsland";
import { NotificationIsland } from "@/src/widgets/NotificationIsland";

const teacher = [
  {
    fullName: "Тимур",
    imageUrl: "/photo.jpg",
  },
  {
    fullName: "Арман",
    imageUrl: "/photo.jpg",
  },
  {
    fullName: "Аллан",
    imageUrl: "/photo.jpg",
  },
  {
    fullName: "Алия",
    imageUrl: "/photo.jpg",
  },
  {
    fullName: "Адиль",
    imageUrl: "/photo.jpg",
  },
  {
    fullName: "Артем",
    imageUrl: "/photo.jpg",
  },
];

export function DashboardPage() {
  return (
    <div className="flex gap-5 container mx-auto">
      <div className="grid grid-cols-[1.8fr_1fr] gap-5 w-full">
        <ProgressIsland />
        <div className="gap-5 grid h-fit">
          <NotificationIsland />
          <TeacherListIsland />
        </div>
      </div>
    </div>
  );
}
