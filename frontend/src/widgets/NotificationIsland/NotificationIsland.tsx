"use client";

import { AppNotification } from "@/src/entities/Notification/types";
import { useNotificationStore } from "@/src/shared/lib/stores";
import { Button, ButtonTypeEnum } from "@/src/shared/ui/Button/Button";
import { Icon, IconThemeEnum } from "@/src/shared/ui/Icon/Icon";
import {
  Island,
  IslandContent,
  IslandHeader,
  IslandThemeEnum,
} from "@/src/shared/ui/Island/Island";
import { CircleAlert } from "lucide-react";
import { useEffect } from "react";
import { NotificationIslandSkeleton } from "./Skeleton";
import { formatDate } from "@/src/shared/lib";

export function NotificationIsland() {
  const { notifications, isLoading, fetchNotifications } =
    useNotificationStore();

  useEffect(() => {
    fetchNotifications();
  }, []);

  if (isLoading) return <NotificationIslandSkeleton />;

  return (
    <Island className="w-full h-[300px]" theme={IslandThemeEnum.GRAY}>
      <IslandHeader>
        <Icon icon="Bell" theme={IconThemeEnum.BLACK} />
        <div className="text-black text-xl font-bold">Уведомления</div>
        <Button isLink type={ButtonTypeEnum.GRAY} />
      </IslandHeader>
      <IslandContent className="grid gap-5  h-[250px]">
        <div className="flex flex-col gap-2 rounded-2xl overflow-hidden">
          {notifications?.length === 0 ? (
            <div className="flex justify-center">У вас нет уведомлений</div>
          ) : (
            notifications?.map((obj: AppNotification) => (
              <div
                key={obj.id}
                className="py-3 px-4 rounded-2xl h-fit w-full gap-3 bg-white grid grid-cols-[5fr_1fr]"
              >
                <div className="flex gap-3">
                  <CircleAlert />
                  <div className="font-bold">{obj.text}</div>
                </div>
                <div className="text-gray-700 flex justify-end items-center">
                  {formatDate(String(obj.createdAt))}
                </div>
              </div>
            ))
          )}
        </div>
      </IslandContent>
    </Island>
  );
}
