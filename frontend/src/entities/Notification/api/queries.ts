import { API } from "@/src/apps/api/client";
import { ROUTES } from "@/src/apps/api/routes";
import { AppNotification } from "../types";

export interface NotificationParams {
  status?: string;
  text?: string;
  id?: string;
  userType?: "teacher" | "admin" | "student" | "all";
  userId?: string;
  sortBy?: string;
  order?: "asc" | "desc";
  dateFrom?: string;
  dateTo?: string;
}

export async function getNotifications(
  filters?: NotificationParams
): Promise<AppNotification[] | string> {
  try {
    const queryString = filters
      ? "?" + new URLSearchParams(filters as Record<string, string>).toString()
      : "";

    const response = await API<AppNotification[]>({
      url: ROUTES.notification.getNotification.path + queryString,
      method: ROUTES.notification.getNotification.method,
    });

    return response.data;
  } catch (err) {
    return String(err);
  }
}
