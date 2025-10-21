import { API } from "@/src/app/api/client";
import { ROUTES } from "@/src/app/api/routes";
import { AppNotification } from "../types";

export async function getNotifications(): Promise<AppNotification[] | string> {
  try {
    const response = await API<AppNotification[]>({
      url: ROUTES.notification.getNotification.path,
      method: ROUTES.notification.getNotification.method,
    });

    return response.data;
  } catch (err) {
    return String(err);
  }
}
