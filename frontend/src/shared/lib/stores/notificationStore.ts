import {
  createNotification,
  deleteNotification,
  getNotifications,
  updateNotification,
} from "@/src/entities/Notification/api";
import { AppNotification } from "@/src/entities/Notification/types";
import { NotificationFormData } from "@/src/widgets/CreatePage/CreateForm";
import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";

interface NotificationState {
  notifications: AppNotification[] | null;
  isLoadingNotification: boolean;

  fetchNotifications: () => Promise<void>;
  createNotification: (notificationData: NotificationFormData) => Promise<void>;
  updateNotification: (
    id: number,
    notificationData: Partial<Notification>
  ) => Promise<void>;
  deleteNotification: (id: number) => Promise<void>;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    devtools(
      (set, get) => ({
        statistics: null,
        isLoading: false,

        fetchNotifications: async () => {
          const { isLoadingNotification } = get();
          if (isLoadingNotification) return;

          set({ isLoadingNotification: true });

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
            set({ isLoadingNotification: false });
          }
        },

        createNotification: async (NotificationData: NotificationFormData) => {
          const { isLoadingNotification } = get();
          if (isLoadingNotification) return;

          set({ isLoadingNotification: true });

          try {
            const result = await createNotification(NotificationData);
            if (typeof result === "string") {
              console.error("Create Notification error:", result);
              return;
            }
            await get().fetchNotifications();
          } catch (error) {
            console.error("Error in createNotification:", error);
          } finally {
            set({ isLoadingNotification: false });
          }
        },

        updateNotification: async (
          id: number,
          NotificationData: Partial<NotificationFormData>
        ) => {
          const { isLoadingNotification } = get();
          if (isLoadingNotification) return;

          set({ isLoadingNotification: true });

          try {
            const result = await updateNotification(id, NotificationData);
            if (typeof result === "string") {
              console.error("Update Notification error:", result);
              return;
            }
            await get().fetchNotifications();
          } catch (error) {
            console.error("Error in update Notification:", error);
          } finally {
            set({ isLoadingNotification: false });
          }
        },

        deleteNotification: async (id: number) => {
          const { isLoadingNotification } = get();
          if (isLoadingNotification) return;

          set({ isLoadingNotification: true });

          try {
            const result = await deleteNotification(id);
            if (typeof result === "string") {
              console.error("Delete Notification error:", result);
              return;
            }
            await get().fetchNotifications();
          } catch (error) {
            console.error("Error in delete Notification:", error);
          } finally {
            set({ isLoadingNotification: false });
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
