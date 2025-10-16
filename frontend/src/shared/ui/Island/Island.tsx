import { cn } from "@/lib/utils";
import React from "react";

export enum IslandThemeEnum {
  BLUE = "blue",
  WHITE = "white",
  GRAY = "gray",
  BLACK = "black",
}

export function Island({
  children,
  theme,
  className,
}: {
  children: React.ReactNode;
  theme: IslandThemeEnum;
  className?: string;
}) {
  return (
    <div
      className={` ${cn(className)}
        rounded-4xl ${
          theme === IslandThemeEnum.BLUE
            ? "bg-[#589cff]"
            : theme === IslandThemeEnum.WHITE
            ? "bg-white"
            : theme === IslandThemeEnum.GRAY
            ? "bg-[#ecf3f3]"
            : "bg-[#303443]"
        }
  `}
    >
      {children}
    </div>
  );
}

export function IslandContent({
  children,
  className,
}: Readonly<{
  children: React.ReactNode;
  className?: string;
}>) {
  return (
    <div className={`p-6 overflow-hidden z-10 ${cn(className)}`}>
      {children}
    </div>
  );
}

export function IslandHeader({
  children,
  className,
}: Readonly<{
  children: React.ReactNode;
  className?: string;
}>) {
  return (
    <div
      className={`${cn(
        className
      )}p-2 grid grid-cols-[auto_auto_1fr] gap-5 items-center`}
    >
      {Array.isArray(children) && (
        <>
          {children[0]}
          {children[1]}
          <div className="justify-self-end">{children[2]}</div>
        </>
      )}
    </div>
  );
}
