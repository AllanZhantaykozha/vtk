"use client";

import { useEffect, useState } from "react";
import { CreateIslandSkeleton } from "../Skeleton";
import { toast } from "sonner";
import { useNotificationStore } from "@/src/shared/lib/stores";
import { NotificationForm, NotificationFormData } from "../CreateForm";
import { CreateNotificationList } from "./CreateNotificationList";
import { useUsersStore } from "@/src/shared/lib/stores/usersStore";

export function CreateNotificationIsland() {
  const [isEditMode, setIsEditMode] = useState(false);

  const { notifications, isLoadingNotification, fetchNotifications } =
    useNotificationStore();
  const { createNotification, updateNotification } = useNotificationStore();
  const [updateId, setUpdateId] = useState<number>(0);
  const { users, fetchUsers } = useUsersStore();

  const [initialEditData, setInitialEditData] = useState<NotificationFormData>({
    text: "",
    status: "LOW",
    userIds: [],
  });

  const handleEdit = (id: number, data: NotificationFormData) => {
    setInitialEditData({
      text: data.text,
      status: data.status,
      userIds: data.userIds,
    });

    setUpdateId(id);
    setIsEditMode(true);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleCreate = async (
    newNotification: NotificationFormData,
    type: "CREATE" | "UPDATE"
  ) => {
    if (type === "CREATE") {
      await createNotification(newNotification);
      toast.success("Уведомление создан");
      fetchNotifications();
    }

    if (type === "UPDATE") {
      await updateNotification(updateId, newNotification);
      toast.success("Уведомление изменена");
      fetchNotifications();
    }

    setInitialEditData({
      text: "",
      status: "LOW",
      userIds: [],
    });
  };

  const handleCancel = () => {
    setIsEditMode(false);

    setInitialEditData({
      text: "",
      status: "LOW",
      userIds: [],
    });
  };

  if (isLoadingNotification || isLoadingNotification)
    return <CreateIslandSkeleton title="Управление уведомлениями админа" />;
  return (
    <div className="p-3">
      <h1 className="text-3xl font-bold mb-4 text-center">
        Управление уведомлениями админа
      </h1>
      <div className="grid grid-cols-[1fr_2fr] gap-5">
        <NotificationForm
          userIds={users || []}
          onSubmit={handleCreate}
          onCancel={handleCancel}
          initialData={initialEditData}
          isEdit={isEditMode}
        />
        <CreateNotificationList onClickEdit={handleEdit} />
      </div>
    </div>
  );
}
