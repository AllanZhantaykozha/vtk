"use client";

import { AppNotification } from "@/src/entities/Notification/types";
import { useNotificationStore } from "@/src/shared/lib/stores";
import { useEffect, useState } from "react";
import { Bell, Users, AlertCircle, CheckCircle, Info } from "lucide-react";
import { User } from "@/src/entities/User/types";

export function NotificationListIsland() {
  const { notifications, fetchNotifications } = useNotificationStore();
  const [isMobile, setIsMobile] = useState(false);
  console.log(isMobile);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case "HIGH":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case "MEDIUM":
        return <Info className="w-4 h-4 text-yellow-500" />;
      case "LOW":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<
      string,
      { bg: string; text: string; label: string }
    > = {
      HIGH: { bg: "bg-red-100", text: "text-red-800", label: "Высокий" },
      MEDIUM: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        label: "Средний",
      },
      LOW: { bg: "bg-green-100", text: "text-green-800", label: "Низкий" },
    };

    const style = statusMap[status.toUpperCase()] || {
      bg: "bg-gray-100",
      text: "text-gray-800",
      label: status,
    };

    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}
      >
        {getStatusIcon(status)}
        {style.label}
      </span>
    );
  };

  const getTargetUsers = (notification: AppNotification): string => {
    const roles = new Set<"Админ" | "Преподаватель" | "Студент">(
      notification.users.map((u: User) =>
        u.admin ? "Админ" : u.student ? "Студент" : "Преподаватель"
      )
    );

    const allRoles: Array<"Админ" | "Преподаватель" | "Студент"> = [
      "Админ",
      "Преподаватель",
      "Студент",
    ];

    const hasAll = allRoles.every((r) => roles.has(r));
    return hasAll ? "Всем" : Array.from(roles).join(", ");
  };

  return (
    <div className="w-full bg-white rounded-3xl min-h-[600px] max-h-[600px] overflow-hidden flex flex-col p-4">
      <div className="flex items-center gap-2 mb-4">
        <Bell className="w-5 h-5 text-indigo-600" />
        <h2 className="text-lg font-semibold text-gray-900">Уведомления</h2>
        {notifications && (
          <span className="ml-auto bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            {notifications.length}
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-2">
        {notifications && notifications.length > 0 ? (
          notifications.map((notification: AppNotification) => (
            <div
              key={notification.id}
              className="bg-gray-50 rounded-3xl p-4 border border-gray-200"
            >
              {/* Заголовок карточки */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-sm">
                    #{notification.id}
                  </div>
                  {getStatusBadge(notification.status)}
                </div>
              </div>

              {/* Текст уведомления */}
              <p className="text-sm text-gray-800 mb-3 leading-relaxed">
                {notification.text}
              </p>

              {/* Кому адресовано */}
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Users className="w-4 h-4" />
                <span className="font-medium">
                  {getTargetUsers(notification)}
                </span>
              </div>

              {/* Дата создания (если есть) */}
              {notification.createdAt && (
                <div className="mt-2 text-xs text-gray-500">
                  {new Date(notification.createdAt).toLocaleString("ru-RU", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <Bell className="w-12 h-12 mb-3 opacity-50" />
            <p className="text-sm">Нет уведомлений</p>
          </div>
        )}
      </div>
    </div>
  );
}
