import { Button, ButtonTypeEnum } from "@/src/shared/ui/Button/Button";
import { Icon, IconThemeEnum } from "@/src/shared/ui/Icon/Icon";
import { Island } from "@/src/shared/ui/Island";
import {
  IslandContent,
  IslandHeader,
  IslandThemeEnum,
} from "@/src/shared/ui/Island/Island";
import { ProgressCart } from "./ProgressCart";
import { Select } from "@/src/shared/ui/Select";
import { useStatisticStore } from "@/src/shared/lib/stores/statisticStore";
import { useState, useEffect } from "react";
import { Statistic } from "@/src/entities/Test/types";
import { useGroupStore } from "@/src/shared/lib/stores/groupStore";
import { ProgressCartSkeleton } from "./Skeleton";

export function ProgressIsland() {
  const { statistics, isLoading, fetchStatistic } = useStatisticStore();
  const { groups, isLoadingGroup, fetchGroup } = useGroupStore();
  const [selectedGroupId, setSelectedGroupId] = useState<number | undefined>(
    undefined
  );

  useEffect(() => {
    fetchGroup();
  }, [fetchGroup]);

  useEffect(() => {
    fetchStatistic(
      selectedGroupId === undefined ? "" : String(selectedGroupId)
    );
  }, [selectedGroupId, fetchStatistic]);

  return (
    <Island className="h-[300px] w-full" theme={IslandThemeEnum.BLUE}>
      <IslandHeader>
        <Icon icon="GraduationCap" theme={IconThemeEnum.WHITE} />
        <div className="text-white text-xl font-bold">Успеваемость</div>
        <Select
          data={groups || []}
          selectedGroupId={selectedGroupId}
          onChange={setSelectedGroupId}
          className="w-[200px]"
        />
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
            {isLoading || isLoadingGroup ? (
              Array.from({ length: 3 }, (_, index) => (
                <ProgressCartSkeleton key={index} />
              ))
            ) : statistics?.length === 0 ? (
              <div className="text-white text-3xl flex justify-center items-center w-full">
                По этой группе нет данных
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
