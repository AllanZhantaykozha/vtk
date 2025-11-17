import { Button, ButtonVariantEnum } from "@/src/shared/ui/Button/Button";
import { Icon, IconThemeEnum } from "@/src/shared/ui/Icon/Icon";
import { Island } from "@/src/shared/ui/Island";
import {
  IslandContent,
  IslandHeader,
  IslandThemeEnum,
} from "@/src/shared/ui/Island/Island";
import Link from "next/link";
import { Plus } from "lucide-react";

export interface CreateIslandDto {
  id: number;
  title: string;
  icon: string;
  href: string;
}

export function CreateListIsland({ data }: { data: CreateIslandDto }) {
  return (
    <Island
      className="w-full bg-white rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 overflow-hidden group cursor-pointer"
      theme={IslandThemeEnum.WHITE}
    >
      <IslandHeader className="p-6 pb-4 border-b border-gray-100 flex items-center justify-between w-full">
        <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
          <Icon
            icon={data.icon}
            theme={IconThemeEnum.BLACK}
            className="w-5 h-5 text-indigo-600"
          />
        </div>
        <h3 className="text-xl font-bold text-gray-900 leading-tight">
          {data.title}
        </h3>
      </IslandHeader>
      <IslandContent className="p-6 pt-4">
        <Link href={data.href} className="block w-full">
          <Button
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center gap-2"
            variant={ButtonVariantEnum.BLACK}
            text="Создать"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </Link>
      </IslandContent>
    </Island>
  );
}
