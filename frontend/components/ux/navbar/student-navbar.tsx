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
import { Badge } from "@/components/ui/badge"; // Assuming Badge is available from shadcn/ui
import { CheckCircle, AlertCircle, MessageCircle, Info } from "lucide-react"; // Assuming Lucide icons are installed
import { useApi } from "@/hooks/useApi";
import { Subject } from "@/components/types/subject.type";
import { ListItem } from "../ListItem";

// Define Notification type from backend
type BackendNotification = {
  id: number;
  userId: number;
  text: string;
  status: "LOW" | "MEDIUM" | "HIGH";
  createdAt: string;
  read: boolean;
};

// Transformed notification for UI
type UINotification = {
  id: number;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  badge: number;
  href: string;
  timestamp: string;
  bgColor: string;
  textColor: string;
};

interface GroupSubjectEntry {
  group?: {
    subjects: {
      subject: Subject;
    }[];
  };
}

function normalizeSubjects(data: GroupSubjectEntry[]): Subject[] {
  if (!Array.isArray(data)) return [];
  return data.flatMap((entry) =>
    Array.isArray(entry.group?.subjects)
      ? entry.group.subjects.map((item) => item.subject)
      : []
  );
}

// Function to format timestamp to relative time
function formatRelativeTime(dateString: string): string {
  const now = new Date();
  const created = new Date(dateString);
  const diffMs = now.getTime() - created.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return "Только что";
  if (diffHours < 1) return `${diffMinutes} минут назад`;
  if (diffDays < 1) return `${diffHours} часов назад`;
  return `${diffDays} дней назад`;
}

// Function to get icon and colors based on status
function getStyleForStatus(status: BackendNotification["status"]) {
  switch (status) {
    case "LOW":
      return {
        icon: Info,
        bgColor: "bg-green-100",
        textColor: "text-green-600",
      };
    case "MEDIUM":
      return {
        icon: AlertCircle,
        bgColor: "bg-yellow-100",
        textColor: "text-yellow-600",
      };
    case "HIGH":
      return {
        icon: MessageCircle,
        bgColor: "bg-red-100",
        textColor: "text-red-600",
      };
    default:
      return {
        icon: CheckCircle,
        bgColor: "bg-blue-100",
        textColor: "text-blue-600",
      };
  }
}

// Function to parse text into title and description (simple split by ":")
function parseTextToTitleDesc(text: string): {
  title: string;
  description: string;
} {
  const parts = text.split(":");
  return {
    title: parts[0] || text,
    description: parts.slice(1).join(":") || "",
  };
}

// Function to infer href based on text (basic keyword matching)
function inferHref(text: string): string {
  const lowerText = text.toLowerCase();
  if (lowerText.includes("тест")) return "/student/tests";
  if (lowerText.includes("оценка") || lowerText.includes("результат"))
    return "/student/journal";
  if (lowerText.includes("лекция")) return "/student/lecture";
  return "/student/notifications";
}

// Transform backend data to UI format
function transformNotifications(
  backendData: BackendNotification[] | undefined | null
): UINotification[] {
  if (!backendData || !Array.isArray(backendData)) return [];
  return backendData.map((notif) => {
    const { title, description } = parseTextToTitleDesc(notif.text);
    const {
      icon: IconComponent,
      bgColor,
      textColor,
    } = getStyleForStatus(notif.status);
    return {
      id: notif.id,
      title,
      description,
      icon: IconComponent,
      badge: notif.read ? 0 : 1,
      href: inferHref(notif.text),
      timestamp: formatRelativeTime(notif.createdAt),
      bgColor,
      textColor,
    };
  });
}

export function StudentNavbar() {
  const { data, error, isLoading } = useApi<
    GroupSubjectEntry[],
    "student",
    "getMySubjects"
  >("student", "getMySubjects");

  const subjects = normalizeSubjects(data ?? []);

  const {
    data: backendNotifications,
    error: notificationError,
    isLoading: notificationLoading,
  } = useApi<BackendNotification[], "notification", "getNotification">(
    "notification",
    "getNotification"
  );

  const notifications: UINotification[] =
    transformNotifications(backendNotifications);

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

  const renderNotificationsList = () => {
    if (notificationLoading) {
      return <li className="text-gray-600 p-4 text-center">Загрузка...</li>;
    }
    if (notificationError) {
      return (
        <li className="text-red-600 p-4 text-center">{notificationError}</li>
      );
    }
    if (!notifications.length) {
      return <li className="text-gray-600 p-4 text-center">Нет уведомлений</li>;
    }

    return notifications.map((notif) => {
      const Icon = notif.icon;
      return (
        <li
          key={notif.id}
          className="p-2 border-b border-gray-100 last:border-b-0"
        >
          <Link
            href={notif.href}
            className="block hover:bg-gray-50 rounded-lg p-3 transition-colors"
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div
                  className={`w-10 h-10 rounded-full ${notif.bgColor} flex items-center justify-center`}
                >
                  <Icon className={`w-5 h-5 ${notif.textColor}`} />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900 truncate">
                    {notif.title}
                  </h3>
                  {notif.badge > 0 && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {notif.badge}
                    </Badge>
                  )}
                </div>
                {notif.description && (
                  <p className="text-sm text-gray-500 mt-1">
                    {notif.description}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-1">{notif.timestamp}</p>
              </div>
            </div>
          </Link>
        </li>
      );
    });
  };

  const unreadCount = notifications.reduce((sum, n) => sum + n.badge, 0);

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

        {/* Уведомления */}
        <NavigationMenuItem>
          <NavigationMenuTrigger className="relative">
            Уведомления
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="ml-1 h-4 w-4 text-xs flex items-center justify-center"
              >
                {unreadCount}
              </Badge>
            )}
          </NavigationMenuTrigger>
          <NavigationMenuContent className="w-[900px] p-0">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Уведомления
              </h3>
            </div>
            <ul className="max-h-[400px] overflow-y-auto">
              {renderNotificationsList()}
            </ul>
            {notifications.length > 3 && (
              <div className="p-4 border-t border-gray-200">
                <Link
                  href="/student/notifications"
                  className="text-sm text-blue-600 hover:underline"
                >
                  Просмотреть все
                </Link>
              </div>
            )}
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
