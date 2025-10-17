"use client";

import { Button } from "@/src/shared/ui/Button";
import { ButtonTypeEnum } from "@/src/shared/ui/Button/Button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useState } from "react";

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
    href: "/test",
  },
  {
    id: 2,
    icon: "SquarePlus",
    text: "Создать",
    href: "/test/create",
  },
  {
    id: 3,
    icon: "Bell",
    text: "Уведомления",
    href: "/test/notification",
  },
  {
    id: 4,
    icon: "User",
    text: "Преподователи",
    href: "/test/teachers",
  },
  {
    id: 5,
    icon: "User",
    text: "Студенты",
    href: "/test/students",
  },
  {
    id: 6,
    icon: "SquareCheckBig",
    text: "Тесты",
    href: "/test/tests",
  },
  {
    id: 7,
    icon: "BookMarked",
    text: "Лекции",
    href: "/test/lectures",
  },
  {
    id: 8,
    icon: "Settings",
    text: "Настройки",
    href: "/test/settings",
  },
];

export function Sidebar() {
  const [activeHref, setActiveHref] = useState<string>("");

  const pathname = usePathname();

  useLayoutEffect(() => {
    setActiveHref(pathname || "");
  }, []);

  return (
    <div className="w-[250px] h-fit bg-white rounded-3xl p-6 sticky top-5 select-none">
      <div className="font-bold text-2xl flex gap-2">
        VTK <p className="text-[#589cff]">Education</p>
      </div>
      <div className="pt-5 grid gap-2">
        {links.map((link: SidebarLinkDto) => (
          <Link key={link.id} href={link.href}>
            <Button
              key={link.id}
              onClick={async () => setActiveHref(link.href)}
              className="w-full"
              type={
                activeHref === link.href
                  ? ButtonTypeEnum.BLUE
                  : ButtonTypeEnum.WHITE
              }
              text={link.text}
              icon={link.icon}
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
