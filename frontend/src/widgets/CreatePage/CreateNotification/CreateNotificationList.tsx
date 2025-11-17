"use client";

import React from "react";
import { CreateListSkeleton } from "../Skeleton";
import { Pencil, Trash } from "lucide-react";
import { toast } from "sonner";
import { NotificationFormData } from "../CreateForm";
import { useNotificationStore } from "@/src/shared/lib/stores";
import { AppNotification } from "@/src/entities/Notification/types";
import { User } from "@/src/entities/User/types";

export function CreateNotificationList({
  onClickEdit,
}: {
  onClickEdit: (id: number, Notification: NotificationFormData) => void;
}) {
  const { notifications, isLoadingNotification, fetchNotifications } =
    useNotificationStore();
  const { deleteNotification } = useNotificationStore();

  const handleDelete = async (notificationId: number) => {
    try {
      await deleteNotification(notificationId);
      toast.success("Предмет удален");
      fetchNotifications();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Ошибка удаления предмета");
    }
  };

  const handleEdit = (id: number, notification: NotificationFormData) => {
    onClickEdit(id, notification);
  };

  if (isLoadingNotification || !notifications) return <CreateListSkeleton />;

  console.log(notifications);

  return (
    <div className="w-full bg-white rounded-3xl h-[600px] overflow-y-scroll p-8">
      <div className="text-lg font-semibold mb-4">
        Список уведомлений админа
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Название
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Статус
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Кому
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {notifications?.map((obj: AppNotification) => (
              <tr key={obj.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {obj.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {obj.text}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {obj.status}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {(() => {
                    const roles: Set<"Админ" | "Преподаватель" | "Студент"> =
                      new Set(
                        obj.users.map((u: User) =>
                          u.admin
                            ? "Админ"
                            : u.student
                            ? "Студент"
                            : "Преподаватель"
                        )
                      );

                    const allRoles: Array<
                      "Админ" | "Преподаватель" | "Студент"
                    > = ["Админ", "Преподаватель", "Студент"];

                    const hasAll: boolean = allRoles.every((r) => roles.has(r));

                    return hasAll ? "Всем" : Array.from(roles).join(", ");
                  })()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() =>
                      handleEdit(obj.id, {
                        text: obj.text,
                        status: obj.status,
                        userIds: obj.users.map((u) => u.id),
                      })
                    }
                    className="cursor-pointer text-gray-500 hover:text-gray-700 mr-2 transition-all"
                  >
                    <Pencil size={20} />
                  </button>
                  <button
                    onClick={() => handleDelete(obj.id)}
                    className="cursor-pointer text-gray-500 hover:text-gray-700 p-1 transition-all"
                  >
                    <Trash size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
