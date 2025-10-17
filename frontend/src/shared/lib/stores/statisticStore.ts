import { getStatistic } from "@/src/entities/Test/api";
import { Statistic } from "@/src/entities/Test/types";
import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";

interface StatisticState {
  statistics: Statistic[] | null;
  isLoading: boolean;

  fetchStatistic: (groupId?: string) => Promise<void>; // Async action с опциональным groupId
}

export const useStatisticStore = create<StatisticState>()(
  persist(
    devtools(
      (set, get) => ({
        statistics: null,
        isLoading: false,

        fetchStatistic: async (groupId?: string) => {
          const { isLoading } = get();
          if (isLoading) return; // Нет дубликатов

          set({ isLoading: true });

          try {
            const data = await getStatistic(groupId); // Передаём groupId (или undefined)
            if (typeof data === "string") {
              console.error("Statistic fetch error:", data);
              set({ statistics: null });
            } else {
              set({ statistics: data });
            }
          } catch (error) {
            console.error("Error in fetchStatistic:", error);
            set({ statistics: null });
          } finally {
            set({ isLoading: false });
          }
        },
      }),
      { name: "statistic-store" }
    ),
    {
      name: "statistic-storage",
      partialize: (state) => ({ statistics: state.statistics }),
    }
  )
);
