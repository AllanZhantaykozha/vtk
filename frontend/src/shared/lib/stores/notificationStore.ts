import { getNotifications } from "@/src/entities/Notification/api";
import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";

interface NotificationState {
  notifications: Notification[] | null;
  isLoading: boolean;

  fetchNotifications: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    devtools(
      (set, get) => ({
        statistics: null,
        isLoading: false,

        fetchNotifications: async () => {
          const { isLoading } = get();
          if (isLoading) return;

          set({ isLoading: true });

          try {
            const data = await getNotifications();
            if (typeof data === "string") {
              console.error("Statistic fetch error:", data);
              set({ notifications: null });
            } else {
              set({ notifications: data });
            }
          } catch (error) {
            console.error("Error in fetchStatistic:", error);
            set({ notifications: null });
          } finally {
            set({ isLoading: false });
          }
        },
      }),
      { name: "notifications-store" }
    ),
    {
      name: "notifications-storage",
      partialize: (state) => ({ statistics: state.notifications }),
    }
  )
);
