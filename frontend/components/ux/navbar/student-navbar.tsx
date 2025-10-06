// components/student/StudentNavbar.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useApi } from "@/hooks/useApi";
import { Subject } from "@/components/types/subject.type";
import { ListItem } from "../ListItem";

function normalizeSubjects(data: any): Subject[] {
  if (!Array.isArray(data)) return [];
  return data.flatMap((entry) =>
    Array.isArray(entry.group?.subjects)
      ? entry.group.subjects.map((item: any) => item.subject)
      : []
  );
}

export function StudentNavbar() {
  const { data, error, isLoading } = useApi<
    Subject[],
    "student",
    "getMySubjects"
  >("student", "getMySubjects");

  const subjects = normalizeSubjects(data);

  const renderSubjectsList = (
    subjects: Subject[],
    getCount: (s: Subject) => number,
    baseHref: string
  ) => {
    if (!subjects.length) {
      return <li className="text-gray-600 p-2">Нет доступных предметов</li>;
    }

    return subjects.map((subject) => {
      const count = getCount(subject) ?? 0;

      return (
        <ListItem
          key={`${baseHref}-${subject.id}`}
          title={subject.name}
          href={`${baseHref}?subject=${subject.name}`}
        >
          {count > 0 ? `${count} элементов` : "Нет элементов"}
        </ListItem>
      );
    });
  };

  return (
    <NavigationMenu className="z-10 py-10 w-full container mx-auto">
      <NavigationMenuList>
        {/* Лекции */}
        <NavigationMenuItem>
          <NavigationMenuTrigger>Лекции</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-2 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
              {isLoading ? (
                <li className="text-gray-600 p-2">Загрузка...</li>
              ) : error ? (
                <li className="text-red-600 p-2">{error}</li>
              ) : subjects.length > 0 ? (
                renderSubjectsList(
                  subjects,
                  (s) => s.lectures?.length ?? 0,
                  "/student/lecture"
                )
              ) : (
                <li className="text-gray-600 p-2">Нет доступных предметов</li>
              )}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {/* Тесты */}
        <NavigationMenuItem>
          <NavigationMenuTrigger>Тесты</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-2 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
              {isLoading ? (
                <li className="text-gray-600 p-2">Загрузка...</li>
              ) : error ? (
                <li className="text-red-600 p-2">{error}</li>
              ) : subjects.length > 0 ? (
                renderSubjectsList(
                  subjects.filter((s) => s.tests?.length > 0),
                  (s) => s.tests?.length ?? 0,
                  "/student/tests"
                )
              ) : (
                <li className="text-gray-600 p-2">Нет доступных тестов</li>
              )}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {/* Журнал */}
        <NavigationMenuItem>
          <NavigationMenuTrigger>Журнал</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[300px] gap-4 p-4">
              <ListItem href="/student/#subjects" title="Предметы">
                Просмотр количества предметов и преподавателей
              </ListItem>
              <ListItem href="/student/#tests" title="Успеваемость">
                Журнал оценок
              </ListItem>
              <ListItem href="#" title="Сессии">
                Даты проведения сессий
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {/* FAQ */}
        <NavigationMenuItem>
          <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
            <Link href="/student/faq">FAQ</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>

        {/* Профиль */}
        <NavigationMenuItem>
          <NavigationMenuLink
            asChild
            className={`${navigationMenuTriggerStyle()} w-10 h-10 rounded-full overflow-hidden p-0`}
          >
            <Link href="/student" className="transition-all">
              <Avatar className="w-full h-full">
                <AvatarImage
                  src="https://github.com/shadcn.png"
                  alt="Аватар пользователя"
                />
                <AvatarFallback>ПУ</AvatarFallback>
              </Avatar>
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>

        {/* Вход */}
        <NavigationMenuItem>
          <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
            <Link href="/student" className="bg-slate-200 transition-all">
              Войти
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
