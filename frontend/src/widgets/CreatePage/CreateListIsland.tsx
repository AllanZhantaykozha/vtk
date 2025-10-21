import { Button, ButtonTypeEnum } from "@/src/shared/ui/Button/Button";
import { Icon, IconThemeEnum } from "@/src/shared/ui/Icon/Icon";
import { Island } from "@/src/shared/ui/Island";
import {
  IslandContent,
  IslandHeader,
  IslandThemeEnum,
} from "@/src/shared/ui/Island/Island";
import Link from "next/link";

export interface CreateIslandDto {
  id: number;
  title: string;
  icon: string;
  href: string;
}

export function CreateListIsland({ data }: { data: CreateIslandDto }) {
  return (
    <Island className="w-full" theme={IslandThemeEnum.WHITE}>
      <IslandHeader>
        <Icon icon={data.icon} theme={IconThemeEnum.BLACK} />
        <div className="text-black text-xl font-bold">{data.title}</div>
        <Button isLink type={ButtonTypeEnum.GRAY} />
      </IslandHeader>
      <IslandContent className=" flex flex-col justify-between ">
        <Link href={data.href}>
          <Button
            className="w-full flex-shrink-0"
            type={ButtonTypeEnum.BLACK}
            text="Создать"
          />
        </Link>
      </IslandContent>
    </Island>
  );
}
