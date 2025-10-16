"use client";

import { Button, ButtonTypeEnum } from "@/src/shared/ui/Button/Button";
import { Icon, IconThemeEnum } from "@/src/shared/ui/Icon/Icon";
import {
  Island,
  IslandContent,
  IslandHeader,
  IslandThemeEnum,
} from "@/src/shared/ui/Island/Island";
import { Bell, CircleAlert } from "lucide-react";

interface NotificationIslandDto {
  text: string;
  status: NotificationIslandEnum;
  createdAt: string;
}

export enum NotificationIslandEnum {
  LOW,
  MEDIUM,
  HIGH,
}

export function NotificationIsland({
  data,
}: {
  data: NotificationIslandDto[];
}) {
  return (
    <Island className="w-[500px] h-fit" theme={IslandThemeEnum.GRAY}>
      <IslandHeader>
        <Icon icon="Bell" theme={IconThemeEnum.BLACK} />
        <div className="text-black text-xl font-bold">Уведомления</div>
        <Button isLink type={ButtonTypeEnum.GRAY} />
      </IslandHeader>
      <IslandContent className="grid gap-5  h-[250px]">
        <div className="flex flex-col gap-2 rounded-2xl overflow-hidden">
          {data.map((obj: NotificationIslandDto) => (
            <div
              key={obj.createdAt}
              className="flex p-3 rounded-2xl h-fit w-full justify-between bg-white"
            >
              <div className="flex gap-3">
                <CircleAlert />
                <div className="font-bold">{obj.text}</div>
              </div>
              <div className="text-gray-700">{obj.createdAt}</div>
            </div>
          ))}
        </div>
      </IslandContent>
    </Island>
  );
}
