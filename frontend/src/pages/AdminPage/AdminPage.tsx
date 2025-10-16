"use client";

import { Select } from "@/src/shared/ui/Select";
import { TeacherListIsland } from "@/src/widgets/AdminPage";
import { ProgressIsland } from "@/src/widgets/AdminPage/ProgressIsland";
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

export function AdminPage() {
  return (
    <div className="flex m-5 gap-5 container mx-auto">
      <Sidebar />
      <div className="grid grid-flow-col gap-5">
        <ProgressIsland />
        <div className="gap-5 grid h-fit">
          <NotificationIsland data={notification} />
          <TeacherListIsland data={teacher} />
        </div>
      </div>
    </div>
  );
}
