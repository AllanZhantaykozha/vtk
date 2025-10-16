import { Button } from "@/src/shared/ui/Button";
import { ButtonTypeEnum } from "@/src/shared/ui/Button/Button";
import Link from "next/link";
import { useState } from "react";

interface SidebarLinkDto {
  id: number;
  icon: string;
  text: string;
  href: string;
}

const links: SidebarLinkDto[] = [
  {
    id: 1,
    icon: "LayoutDashboard",
    text: "Dashboard",
    href: "/",
  },
  {
    id: 2,
    icon: "SquarePlus",
    text: "Создать",
    href: "/create",
  },
  {
    id: 3,
    icon: "Bell",
    text: "Уведомления",
    href: "/notification",
  },
  {
    id: 4,
    icon: "User",
    text: "Преподователи",
    href: "/teachers",
  },
  {
    id: 5,
    icon: "User",
    text: "Студенты",
    href: "/students",
  },
  {
    id: 6,
    icon: "SquareCheckBig",
    text: "Тесты",
    href: "/tests",
  },
  {
    id: 7,
    icon: "BookMarked",
    text: "Лекции",
    href: "/lectures",
  },
  {
    id: 8,
    icon: "Settings",
    text: "Настройки",
    href: "/settings",
  },
];

export function Sidebar() {
  const [activeId, setActiveId] = useState<number>(1);

  return (
    <div className="w-[250px] h-fit bg-white rounded-3xl p-6 sticky top-5">
      <div className="font-bold text-2xl flex gap-2">
        VTK <p className="text-[#589cff]">Education</p>
      </div>
      <div className="pt-5 grid gap-2">
        {links.map((link: SidebarLinkDto) => (
          //   <Link key={link.id} href={link.href}>
          <Button
            key={link.id}
            onClick={() => setActiveId(link.id)}
            className="w-full"
            type={
              activeId === link.id ? ButtonTypeEnum.BLUE : ButtonTypeEnum.WHITE
            }
            text={link.text}
            icon={link.icon}
          />
          //   </Link>
        ))}
      </div>
    </div>
  );
}
