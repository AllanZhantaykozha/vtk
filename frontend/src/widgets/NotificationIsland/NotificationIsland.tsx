"use client";

import { AppNotification } from "@/src/entities/Notification/types";
import { useNotificationStore } from "@/src/shared/lib/stores";
import { Button, ButtonVariantEnum } from "@/src/shared/ui/Button/Button";
import { Icon, IconThemeEnum } from "@/src/shared/ui/Icon/Icon";
import {
  Island,
  IslandContent,
  IslandHeader,
  IslandThemeEnum,
} from "@/src/shared/ui/Island/Island";
import { useEffect } from "react";
import { NotificationIslandSkeleton } from "./Skeleton";
import { AlertCircle, Info, CheckCircle, Bell } from "lucide-react";

export function NotificationIsland() {
  const { notifications, isLoadingNotification, fetchNotifications } =
    useNotificationStore();

  useEffect(() => {
    fetchNotifications();
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

  if (isLoadingNotification) return <NotificationIslandSkeleton />;

  return (
    <Island
      className="w-full h-fit h-max-[500px] overflow-hidden"
      theme={IslandThemeEnum.GRAY}
    >
      <IslandHeader>
        <Icon icon="Bell" theme={IconThemeEnum.BLACK} />
        <div className="text-black text-xl font-bold">Уведомления</div>
        <Button isLink variant={ButtonVariantEnum.GRAY} />
      </IslandHeader>
      <IslandContent className="grid gap-5 max-h-[500px]">
        <div className="flex flex-col gap-2 rounded-2xl overflow-hidden">
          {notifications?.length === 0 ? (
            <div className="flex justify-center">У вас нет уведомлений</div>
          ) : (
            notifications?.map((notification: AppNotification) => (
              <div
                key={notification.id}
                className="bg-gray-50 rounded-3xl p-4 border border-gray-200"
              >
                {/* Заголовок карточки */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getStatusBadge(notification.status)}
                  </div>
                </div>

                {/* Текст уведомления */}
                <p className="text-sm text-gray-800 mb-3 leading-relaxed">
                  {notification.text}
                </p>

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
          )}
        </div>
      </IslandContent>
    </Island>
  );
}
