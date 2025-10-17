"use client";

import { Select } from "@/src/shared/ui/Select";
import { TeacherListIsland } from "@/src/widgets/AdminPage";
import { ProgressIsland } from "@/src/widgets/AdminPage/ProgressIsland";
import { Header } from "@/src/widgets/Header";
import { NotificationIsland } from "@/src/widgets/NotificationIsland";
import { NotificationIslandEnum } from "@/src/widgets/NotificationIsland/NotificationIsland";
import { Sidebar } from "@/src/widgets/Sidebar";

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

const notification = [
  {
    text: "sadasd",
    status: NotificationIslandEnum.HIGH,
    createdAt: "10.02.2001",
  },
  {
    text: "sadasd",
    status: NotificationIslandEnum.MEDIUM,
    createdAt: "10.02.2002",
  },
  {
    text: "sadasd",
    status: NotificationIslandEnum.LOW,
    createdAt: "10.02.2003",
  },
  {
    text: "sadasd",
    status: NotificationIslandEnum.MEDIUM,
    createdAt: "10.02.2004",
  },
  {
    text: "sadasd",
    status: NotificationIslandEnum.LOW,
    createdAt: "10.02.2005",
  },
];

export function DashboardPage() {
  return (
    <div className="flex gap-5 container mx-auto">
      <div className="grid grid-cols-[2fr_1fr] gap-5 w-full">
        <ProgressIsland />
        <div className="gap-5 grid h-fit">
          <NotificationIsland data={notification} />
          <TeacherListIsland data={teacher} />
        </div>
      </div>
    </div>
  );
}
