"use client";

import { Button, ButtonTypeEnum } from "@/src/shared/ui/Button/Button";
import { Icon, IconThemeEnum } from "@/src/shared/ui/Icon/Icon";
import {
  Island,
  IslandContent,
  IslandHeader,
  IslandThemeEnum,
} from "@/src/shared/ui/Island/Island";
import Image from "next/image";

interface TeacherListIslandDto {
  fullName: string;
  imageUrl: string;
}

export function TeacherListIsland({ data }: { data: TeacherListIslandDto[] }) {
  return (
    <Island className="w-[500px] h-fit" theme={IslandThemeEnum.WHITE}>
      <IslandHeader>
        <Icon icon="User" theme={IconThemeEnum.BLACK} />
        <div className="text-black text-xl font-bold">Преподаватели</div>
        <Button isLink type={ButtonTypeEnum.GRAY} />
      </IslandHeader>
      <IslandContent className="grid grid-flow-col gap-5">
        <div className="overflow-x-auto custom-scroll pb-2">
          <div
            className="
              flex gap-5 
              scrollbar-hide
              scroll-smooth
              snap-x snap-mandatory
            "
          >
            {data.map((obj) => (
              <div
                key={obj.fullName}
                className="snap-center flex-shrink-0 w-20 grid gap-2"
              >
                <Image
                  className="aspect-square w-20 rounded-full object-cover"
                  src={obj.imageUrl}
                  width={100}
                  height={100}
                  alt={obj.fullName}
                />
                <div className="text-center">{obj.fullName}</div>
              </div>
            ))}
          </div>
        </div>
      </IslandContent>
    </Island>
  );
}
