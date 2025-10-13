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
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Info, MessageCircle } from "lucide-react";
import { Subject } from "@/components/types/subject.type";

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

function normalizeSubjects(data: any): Subject[] {
  if (!Array.isArray(data)) return [];
  return data.flatMap((entry) =>
    Array.isArray(entry.group?.subjects)
      ? entry.group.subjects.map((item: any) => item.subject)
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
  backendData: BackendNotification[] | undefined
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
