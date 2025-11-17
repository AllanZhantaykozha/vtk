import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";
import * as Icons from "lucide-react";
import { ElementType, ComponentPropsWithoutRef } from "react";

export enum ButtonVariantEnum {
  BLUE = "blue",
  BLACK = "black",
  WHITE = "white",
  GRAY = "gray",
}

interface ButtonProps extends ComponentPropsWithoutRef<"button"> {
  text?: string;
  variant: ButtonVariantEnum;
  isLink?: boolean;
  icon?: string;
  className?: string;
}

export function Button({
  text,
  variant,
  isLink,
  className,
  icon,
  disabled,
  type = "button",
  ...props
}: ButtonProps) {
  const IconComponent = icon
    ? (Icons[icon as keyof typeof Icons] as ElementType)
    : null;

  return (
    <button
      type={type}
      disabled={disabled}
      className={cn(
        "w-fit cursor-pointer py-2 px-4 text-center font-medium rounded-full flex items-center justify-center gap-2 transition-all duration-200 ",
        variant === ButtonVariantEnum.BLACK
          ? "bg-[#303443] text-white hover:bg-[#242a3a]"
          : variant === ButtonVariantEnum.WHITE
          ? "text-[#303443] bg-white hover:bg-gray-50 "
          : variant === ButtonVariantEnum.BLUE
          ? "bg-[#589cff] text-white hover:bg-[#4682ff]"
          : "bg-[#dae1ef] text-gray-700 hover:bg-[#c7d2e2]",
        isLink && "aspect-square rounded-full !p-3",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      {...props}
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
