import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";
import * as Icons from "lucide-react";
import { ElementType } from "react";

export enum ButtonTypeEnum {
  BLUE = "blue",
  BLACK = "black",
  WHITE = "white",
  GRAY = "gray",
}

interface ButtonDto {
  text?: string;
  type: ButtonTypeEnum;
  isLink?: boolean;
  className?: string;
  icon?: string;
  onClick?: () => Promise<void>;
}

export function Button({
  text,
  type,
  isLink,
  className,
  icon,
  onClick,
}: ButtonDto) {
  const IconComponent = icon
    ? (Icons[icon as keyof typeof Icons] as ElementType)
    : null;

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-fit cursor-pointer py-2 px-4 text-center font-medium rounded-full flex items-center justify-center gap-2 transition",
        type === ButtonTypeEnum.BLACK
          ? "bg-[#303443] text-white"
          : type === ButtonTypeEnum.WHITE
          ? "text-[#303443] bg-white"
          : type === ButtonTypeEnum.BLUE
          ? "bg-[#589cff] text-white"
          : "bg-[#dae1ef]",
        isLink && "aspect-square rounded-full !p-3",
        className
      )}
    >
      {!text && isLink ? (
        <ArrowUpRight size={28} />
      ) : (
        <div className={`flex gap-2 w-full ${icon ? "" : "justify-center"}`}>
          {IconComponent && <IconComponent size={24} />}
          {text}
        </div>
      )}
    </button>
  );
}
