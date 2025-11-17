import { Icon, IconThemeEnum } from "@/src/shared/ui/Icon/Icon";
import { Island } from "@/src/shared/ui/Island";
import {
  IslandContent,
  IslandHeader,
  IslandThemeEnum,
} from "@/src/shared/ui/Island/Island";
import { DeadlineCard } from "./DeadlineCard";
import { useEffect } from "react";
import { DeadlineCardSkeleton } from "./Skeleton";
import { useDeadlineStore } from "@/src/shared/lib/stores/deadlineStore";

export function DeadlinesIsland() {
  const { deadlines, isLoading, fetchDeadlines } = useDeadlineStore();

  useEffect(() => {
    fetchDeadlines();
  }, [fetchDeadlines]);

  console.log(deadlines);

  return (
    <Island className="h-[300px] w-full" theme={IslandThemeEnum.GRAY}>
      <IslandHeader>
        <Icon icon="CalendarDays" theme={IconThemeEnum.BLACK} />
        <div className="text-black text-xl font-bold">Ближайшие дедлайны</div>
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
                <DeadlineCardSkeleton key={index} />
              ))
            ) : deadlines?.length === 0 ? (
              <div className="text-black text-3xl flex justify-center items-center w-full">
                Нет заданий
              </div>
            ) : (
              deadlines.map((obj, index) => (
                <DeadlineCard key={index} data={obj} />
              ))
            )}
          </div>
        </div>
      </IslandContent>
    </Island>
  );
}
