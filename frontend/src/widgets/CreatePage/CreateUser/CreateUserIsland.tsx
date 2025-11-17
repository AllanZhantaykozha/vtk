"use client";

import { useEffect, useState } from "react";
import { UserForm, UserFormData } from "../CreateForm";
import { useSubjectStore } from "@/src/shared/lib/stores/subjectsStore";
import { useGroupStore } from "@/src/shared/lib/stores";
import { useUsersStore } from "@/src/shared/lib/stores/usersStore";
import { CreateIslandSkeleton } from "../Skeleton";
import { toast } from "sonner";
import { CreateUserList } from "./CreateUserList";
import { updateUser } from "@/src/entities/User/api/mutations";

export function CreateUserIsland() {
  const [isEditMode, setIsEditMode] = useState(false);

  const { groups, isLoadingGroup, fetchAllGroups } = useGroupStore();
  const { subjects, isLoadingSubject, fetchSubject } = useSubjectStore();
  const { createUser, fetchUsers } = useUsersStore();

  const [initialEditData, setInitialEditData] = useState<UserFormData>({
    role: "student",
    login: "",
    fullName: "",
    password: "",
    groupId: 1,
    subjectIds: [],
  });

  const [updateId, setUpdateId] = useState<number>(0);

  const handleEdit = async (id: number, data: UserFormData) => {
    setInitialEditData(data);
    setUpdateId(id);
    setIsEditMode(true);
  };

  useEffect(() => {
    fetchAllGroups();
    fetchSubject();
  }, []);

  const handleCreate = async (
    newUser: UserFormData,
    type: "CREATE" | "UPDATE"
  ) => {
    if (type === "CREATE") {
      await createUser(newUser);
      toast.success("Пользователь создан");
      fetchUsers();
    }

    if (type === "UPDATE") {
      await updateUser(updateId, newUser);
      toast.success("Пользователь изменен");
      fetchUsers();
    }

    setInitialEditData({
      role: "student",
      login: "",
      fullName: "",
      password: "",
      groupId: 1,
      subjectIds: [],
    });
  };

  const handleCancel = () => {
    setIsEditMode(false);

    setInitialEditData({
      role: "student",
      login: "",
      fullName: "",
      password: "",
      groupId: 1,
      subjectIds: [],
    });
  };

  if (isLoadingSubject || isLoadingGroup)
    return <CreateIslandSkeleton title="Управление пользователями" />;
  return (
    <div className="p-3">
      <h1 className="text-3xl font-bold mb-4 text-center">
        Управление пользователями
      </h1>
      <div className="grid grid-cols-[1fr_2fr] gap-5">
        <UserForm
          subjects={subjects || []}
          groups={groups || []}
          onSubmit={handleCreate}
          onCancel={handleCancel}
          initialData={initialEditData}
          isEdit={isEditMode}
        />
        <CreateUserList onClickEdit={handleEdit} />
      </div>
    </div>
  );
}
