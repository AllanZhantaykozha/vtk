"use client";

import { useTeachersStore } from "@/src/shared/lib/stores/teachersStore";
import { Button, ButtonTypeEnum } from "@/src/shared/ui/Button/Button";
import { Icon, IconThemeEnum } from "@/src/shared/ui/Icon/Icon";
import {
  Island,
  IslandContent,
  IslandHeader,
  IslandThemeEnum,
} from "@/src/shared/ui/Island/Island";
import Image from "next/image";
import { useEffect } from "react";
import { TeacherListIslandSkeleton } from "./Skeleton";
import { Teacher } from "@/src/entities/User/types";

export function TeacherListIsland() {
  const { teachers, isLoading, fetchTeachers } = useTeachersStore();

  useEffect(() => {
    fetchTeachers();
  }, []);

  if (isLoading) return <TeacherListIslandSkeleton />;

  return (
    <Island className="w-full h-[240px]" theme={IslandThemeEnum.WHITE}>
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
            {teachers?.map((obj: Teacher) => (
              <div
                key={obj.id}
                className="snap-center flex-shrink-0 w-20 grid gap-2"
              >
                <Image
                  className="aspect-square w-20 rounded-full object-cover"
                  src={obj.user.photoUrl || "/photo.jpg"}
                  width={100}
                  height={100}
                  alt={obj.user.fullName}
                />
                <div className="text-center">{obj.user.fullName}</div>
              </div>
            ))}
          </div>
        </div>
      </IslandContent>
    </Island>
  );
}
