import { API } from "@/src/app/api/client";
import { ROUTES } from "@/src/app/api/routes";
import { NotificationFormData } from "@/src/widgets/CreatePage/CreateForm";
import { AppNotification } from "../types";

export async function createNotification(
  NotificationData: NotificationFormData
): Promise<AppNotification | string> {
  try {
    const response = await API<AppNotification>({
      url: ROUTES.notification.create.path,
      method: ROUTES.notification.create.method,
      data: NotificationData,
    });

    return response.data;
  } catch (err) {
    return String(err);
  }
}

export async function updateNotification(
  id: number,
  NotificationData: Partial<NotificationFormData>
): Promise<AppNotification | string> {
  try {
    const response = await API<AppNotification>({
      url: ROUTES.notification.update.path + id,
      method: ROUTES.notification.update.method,
      data: NotificationData,
    });

    return response.data;
  } catch (err) {
    return String(err);
  }
}

export async function deleteNotification(id: number): Promise<void | string> {
  try {
    await API<void>({
      url: ROUTES.notification.delete.path + id,
      method: ROUTES.notification.delete.method,
    });

    return;
  } catch (err) {
    return String(err);
  }
}
