"use client";

import { useAuthStore } from "@/src/shared/lib/stores";
import { LogOut, Menu } from "lucide-react";
import Image from "next/image";
import { useEffect } from "react";
import { HeaderSkeleton } from "./Skeleton";
import { useSidebarStore } from "@/src/shared/lib/stores/sidebarStore";

function shortFullname(fullName: string) {
  const shortName = fullName.trim().split(" ");

  if (shortName.length === 1) return fullName;

  return `${shortName[0]} ${shortName[1].split("")[0]}${
    !shortName[2]?.split("")[0] ? "" : "." + shortName[2]?.split("")[0]
  }`;
}

export function Header() {
  const { user, isAuthenticated, isLoading, fetchMe, logout } = useAuthStore();
  const { openSidebar } = useSidebarStore();

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      fetchMe();
    }
  }, [isAuthenticated, isLoading, fetchMe]);

  if (isLoading || !isAuthenticated) return <HeaderSkeleton />;

  return (
    <div className="w-full h-fit px-3 py-2 flex justify-between items-center">
      <div className="font-bold text-4xl flex items-center gap-5">
        <Menu
          size={32}
          className="block lg:hidden cursor-pointer"
          onClick={() => openSidebar()}
        />
        <div className="sm:block hidden">{user?.fullName}</div>
      </div>
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
