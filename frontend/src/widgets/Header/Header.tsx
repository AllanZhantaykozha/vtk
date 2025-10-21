"use client";

import { useAuthStore } from "@/src/shared/lib/stores";
import { Button } from "@/src/shared/ui/Button";
import { ButtonTypeEnum } from "@/src/shared/ui/Button/Button";
import { LogOut } from "lucide-react";
import Image from "next/image";
import { useEffect } from "react";
import { HeaderSkeleton } from "./Skeleton";

interface HeaderDto {
  fullName: string;
  imageUrl: string;
}

function shortFullname(fullName: string) {
  const shortName = fullName.trim().split(" ");

  if (shortName.length === 1) return fullName;

  return `${shortName[0]} ${shortName[1].split("")[0]}${
    !shortName[2]?.split("")[0] ? "" : "." + shortName[2]?.split("")[0]
  }`;
}

export function Header() {
  const { user, isAuthenticated, isLoading, fetchMe, logout } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      fetchMe();
    }
  }, [isAuthenticated, isLoading, fetchMe]);

  if (isLoading || !isAuthenticated) return <HeaderSkeleton />;

  return (
    <div className="w-full h-fit px-3 py-2 flex justify-between items-center">
      <div className="font-bold text-4xl">{user?.fullName}</div>
      <div className="flex gap-10 items-center">
        <div className="flex items-center gap-3">
          <Image
            src={"/photo.jpg"}
            width={50}
            height={50}
            alt="photo"
            className="rounded-full aspect-square"
          />
          <div className="font-semibold text-lg select-none">
            {shortFullname(user?.fullName || "")}
          </div>
        </div>
        <div
          onClick={logout}
          className=" bg-white p-3 rounded-full cursor-pointer"
        >
          <LogOut />
        </div>
      </div>
    </div>
  );
}
