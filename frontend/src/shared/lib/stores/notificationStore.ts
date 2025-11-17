import {
  createNotification,
  deleteNotification,
  getNotifications,
  updateNotification,
} from "@/src/entities/Notification/api";
import { NotificationParams } from "@/src/entities/Notification/api/queries";
import { AppNotification } from "@/src/entities/Notification/types";
import { NotificationFormData } from "@/src/widgets/CreatePage/CreateForm";
import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";

interface NotificationState {
  notifications: AppNotification[] | null;
  isLoadingNotification: boolean;

  fetchNotifications: (filters?: NotificationParams) => Promise<void>;
  createNotification: (notificationData: NotificationFormData) => Promise<void>;
  updateNotification: (
    id: number,
    notificationData: Partial<NotificationFormData>
  ) => Promise<void>;
  deleteNotification: (id: number) => Promise<void>;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    devtools(
      (set, get) => ({
        notifications: null,
        isLoadingNotification: false,

        fetchNotifications: async (filters?: NotificationParams) => {
          const { isLoadingNotification } = get();
          if (isLoadingNotification) return;

          set({ isLoadingNotification: true });

          try {
            const data = await getNotifications(filters);
            if (typeof data === "string") {
              console.error("Notification fetch error:", data);
              set({ notifications: null });
            } else {
              set({ notifications: data });
            }
          } catch (error) {
            console.error("Error in fetchNotifications:", error);
            set({ notifications: null });
          } finally {
            set({ isLoadingNotification: false });
          }
        },

        createNotification: async (notificationData: NotificationFormData) => {
          const { isLoadingNotification } = get();
          if (isLoadingNotification) return;

          set({ isLoadingNotification: true });

          try {
            const result = await createNotification(notificationData);
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
          notificationData: Partial<NotificationFormData>
        ) => {
          const { isLoadingNotification } = get();
          if (isLoadingNotification) return;

          set({ isLoadingNotification: true });

          try {
            const result = await updateNotification(id, notificationData);
            if (typeof result === "string") {
              console.error("Update Notification error:", result);
              return;
            }
            await get().fetchNotifications();
          } catch (error) {
            console.error("Error in updateNotification:", error);
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
            console.error("Error in deleteNotification:", error);
          } finally {
            set({ isLoadingNotification: false });
          }
        },
      }),
      { name: "notifications-store" }
    ),
    {
      name: "notifications-storage",
      partialize: (state) => ({ notifications: state.notifications }),
    }
  )
);
