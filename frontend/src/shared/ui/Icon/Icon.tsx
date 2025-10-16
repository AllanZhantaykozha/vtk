import { cn } from "@/lib/utils";
import * as Icons from "lucide-react";
import { ElementType } from "react";

interface IconDto {
  className?: string;
  icon: string;
  theme: IconThemeEnum;
}

export enum IconThemeEnum {
  WHITE = "white",
  BLACK = "black",
}

export function Icon(data: IconDto) {
  const icons = Icons as unknown as Record<string, ElementType>;
  const LucideIcon = icons[data.icon];

  if (!LucideIcon) {
    console.warn(`Icon "${data.icon}" not found in lucide-react`);
    return null;
  }

  return (
    <div
      className={`${cn(data.className)}border-2 w-fit rounded-full p-3 ${
        data.theme === IconThemeEnum.BLACK ? "border-black" : "border-white"
      }`}
    >
      <LucideIcon
        color={data.theme === IconThemeEnum.BLACK ? "black" : "white"}
      />
    </div>
  );
}
