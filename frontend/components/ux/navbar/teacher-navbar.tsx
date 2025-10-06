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
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { ListItem } from "../ListItem";
import { useApi } from "@/hooks/useApi";

export function TeacherNavbar() {
  const {
    data: subjects,
    error,
    isLoading,
  } = useApi<
    any[], // TData
    "subjects", // C
    "getTeacherNavbar" // A
  >("subjects", "getTeacherNavbar");

  const renderSubjectsList = (
    subjects: any[],
    getDescription: (s: any) => string,
    getCount: (s: any) => number,
    baseHref: string
  ) => {
    return subjects.map((subject) => {
      const description = getDescription(subject);
      const count = getCount(subject);
      return (
        <ListItem
          key={`${baseHref}-${subject.id}`}
          title={subject.name}
          href={`${baseHref}?subject=${subject.name}`}
        >
          {description} — {count}
        </ListItem>
      );
    });
  };

  return (
    <NavigationMenu className="z-10 py-10 w-full container mx-auto">
      <NavigationMenuList>
        {/* Лекции */}
        <NavigationMenuItem>
          <NavigationMenuTrigger>Мои лекции</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-2 p-4 md:w-[500px] lg:w-[600px]">
              {isLoading ? (
                <li className="text-gray-600 p-2">Загрузка...</li>
              ) : error ? (
                <li className="text-red-600 p-2">{error}</li>
              ) : subjects ? (
                renderSubjectsList(
                  subjects,
                  (s) => s.lectures[0]?.description || "Без описания",
                  (s) => s.lectures.length,
                  "/teacher/lecture"
                )
              ) : null}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {/* Тесты */}
        <NavigationMenuItem>
          <NavigationMenuTrigger>Мои тесты</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-2 p-4 md:w-[500px] lg:w-[600px]">
              {isLoading ? (
                <li className="text-gray-600 p-2">Загрузка...</li>
              ) : error ? (
                <li className="text-red-600 p-2">{error}</li>
              ) : subjects ? (
                renderSubjectsList(
                  subjects.filter((s) => s.tests.length > 0),
                  (s) => s.tests[0]?.description || "Без описания",
                  (s) => s.tests.length,
                  "/teacher/tests"
                )
              ) : null}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {/* Журнал студентов */}
        <NavigationMenuItem>
          <NavigationMenuTrigger>Журнал</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[300px] gap-4 p-4">
              <ListItem href="/teacher/students" title="Студенты">
                Список студентов по предметам
              </ListItem>
              <ListItem href="/teacher/grades" title="Оценки">
                Просмотр и выставление оценок
              </ListItem>
              <ListItem href="/teacher/sessions" title="Сессии">
                Управление датами сессий
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {/* FAQ */}
        <NavigationMenuItem>
          <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
            <Link href="/teacher/faq">FAQ</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>

        {/* Профиль */}
        <NavigationMenuItem>
          <NavigationMenuLink
            asChild
            className={`${navigationMenuTriggerStyle()} w-10 h-10 rounded-full overflow-hidden p-0`}
          >
            <Link href="/teacher" className="transition-all">
              <Avatar className="w-full h-full">
                <AvatarImage
                  src="https://github.com/shadcn.png"
                  alt="Аватар учителя"
                />
                <AvatarFallback>УЧ</AvatarFallback>
              </Avatar>
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

//(4@HLGupG9LdsQg
