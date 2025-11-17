import { Icon, IconThemeEnum } from "@/src/shared/ui/Icon/Icon";
import { Island } from "@/src/shared/ui/Island";
import {
  IslandContent,
  IslandHeader,
  IslandThemeEnum,
} from "@/src/shared/ui/Island/Island";
import { ProgressCart } from "./ProgressCart";
import { useStatisticStore } from "@/src/shared/lib/stores/statisticStore";
import { useEffect } from "react";
import { Statistic } from "@/src/entities/Test/types";
import { ProgressCartSkeleton } from "./Skeleton";

export function ProgressIsland() {
  const { statistics, isLoading, fetchStatistic } = useStatisticStore();

  useEffect(() => {
    fetchStatistic();
  }, [fetchStatistic]);

  return (
    <Island className="h-fit w-full" theme={IslandThemeEnum.BLUE}>
      <IslandHeader>
        <Icon icon="GraduationCap" theme={IconThemeEnum.WHITE} />
        <div className="text-white text-xl font-bold">Успеваемость</div>
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
            {isLoading ? (
              Array.from({ length: 3 }, (_, index) => (
                <ProgressCartSkeleton key={index} />
              ))
            ) : statistics?.length === 0 ? (
              <div className="text-white text-3xl flex justify-center items-center w-full">
                Нет данных
              </div>
            ) : (
              statistics?.map((obj: Statistic, index: number) => (
                <ProgressCart key={index} data={obj} />
              ))
            )}
          </div>
        </div>
      </IslandContent>
    </Island>
  );
}
