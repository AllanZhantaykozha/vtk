"use client";

import { useSidebarStore } from "@/src/shared/lib/stores/sidebarStore";
import { Button } from "@/src/shared/ui/Button";
import { ButtonVariantEnum } from "@/src/shared/ui/Button/Button";
import { X } from "lucide-react";
import Cookies from "js-cookie";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

interface SidebarLinkDto {
  id: number;
  icon: string;
  role: "student" | "admin" | "teacher";
  text: string;
  href: string;
}

const links: SidebarLinkDto[] = [
  {
    id: 1,
    role: "admin",
    icon: "LayoutDashboard",
    text: "Dashboard",
    href: "/admin",
  },
  {
    id: 2,
    role: "admin",
    icon: "SquarePlus",
    text: "Создать",
    href: "/admin/create",
  },
  {
    id: 3,
    role: "admin",
    icon: "Bell",
    text: "Уведомления",
    href: "/admin/notification",
  },
  {
    id: 4,
    role: "admin",
    icon: "User",
    text: "Преподаватели",
    href: "/admin/teachers",
  },
  {
    id: 5,
    role: "admin",
    icon: "User",
    text: "Студенты",
    href: "/admin/students",
  },
  {
    id: 6,
    role: "admin",
    icon: "Settings",
    text: "Настройки",
    href: "/admin/settings",
  },

  {
    id: 7,
    role: "student",
    icon: "LayoutDashboard",
    text: "Dashboard",
    href: "/student",
  },
  {
    id: 8,
    role: "student",
    icon: "FileCheck",
    text: "Задания",
    href: "/student/tasks",
  },
  {
    id: 9,
    role: "student",
    icon: "SquareCheckBig",
    text: "Тесты",
    href: "/student/tests",
  },
  {
    id: 10,
    role: "student",
    icon: "BookMarked",
    text: "Лекции",
    href: "/student/lectures",
  },
  {
    id: 11,
    role: "student",
    icon: "Bell",
    text: "Уведомления",
    href: "/student/notifications",
  },
  {
    id: 12,
    role: "student",
    icon: "Settings",
    text: "Настройки",
    href: "/student/settings",
  },

  {
    id: 13,
    role: "teacher",
    icon: "LayoutDashboard",
    text: "Dashboard",
    href: "/test",
  },
  {
    id: 14,
    role: "teacher",
    icon: "SquarePlus",
    text: "Создать",
    href: "/test/create",
  },
  {
    id: 15,
    role: "teacher",
    icon: "SquareCheckBig",
    text: "Тесты",
    href: "/test/tests",
  },
  {
    id: 16,
    role: "teacher",
    icon: "FileCheck",
    text: "Задания",
    href: "/test/tasks",
  },
  {
    id: 17,
    role: "teacher",
    icon: "BookMarked",
    text: "Лекции",
    href: "/test/lectures",
  },
  {
    id: 18,
    role: "teacher",
    icon: "Users",
    text: "Группы",
    href: "/test/groups",
  },
  {
    id: 19,
    role: "teacher",
    icon: "LibraryBig",
    text: "Предметы",
    href: "/test/subjects",
  },
  {
    id: 20,
    role: "teacher",
    icon: "Bell",
    text: "Уведомления",
    href: "/test/notification",
  },
  {
    id: 21,
    role: "teacher",
    icon: "Settings",
    text: "Настройки",
    href: "/test/settings",
  },
];

interface MyJwtPayload {
  role: "student" | "admin" | "teacher";
}

export function Sidebar() {
  const [activeHref, setActiveHref] = useState<string>("");
  const { open, openSidebar } = useSidebarStore();
  const [role, setRole] = useState<MyJwtPayload["role"] | null>(null);
  const [loaded, setLoaded] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const token = Cookies.get("token");

    if (token) {
      try {
        const decoded = jwtDecode<MyJwtPayload>(token);
        setRole(decoded.role);
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }

    setLoaded(true);
  }, []);

  useLayoutEffect(() => {
    setActiveHref(pathname || "");
  }, [pathname]);

  if (!loaded) {
    return null;
  }

  const filteredLinks = role ? links.filter((link) => link.role === role) : [];

  return (
    <div
      className={`w-[250px] lg:h-fit transition-transform duration-400 bg-white rounded-3xl p-6 lg:sticky top-0 lg:top-5 left-0 select-none z-50 h-full fixed ${
        open ? "translate-x-0" : "lg:translate-x-0 -translate-x-full"
      }`}
    >
      <div className="font-bold text-2xl flex gap-2 items-center mb-2">
        VTK <p className="text-[#589cff]">Education</p>
        <X
          size={32}
          onClick={() => openSidebar()}
          className="lg:hidden block cursor-pointer ml-auto"
        />
      </div>

      <div className="pt-5 grid gap-2">
        {filteredLinks.map((link: SidebarLinkDto) => (
          <Link key={link.id} href={link.href} onClick={() => openSidebar()}>
            <Button
              onClick={async () => setActiveHref(link.href)}
              className="w-full"
              variant={
                activeHref === link.href
                  ? ButtonVariantEnum.BLUE
                  : ButtonVariantEnum.WHITE
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
