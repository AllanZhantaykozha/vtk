"use client";

import { useEffect, useState } from "react";
import { GroupForm, GroupFormData } from "../CreateForm";
import { useSubjectStore } from "@/src/shared/lib/stores/subjectsStore";
import { useGroupStore } from "@/src/shared/lib/stores";
import { CreateIslandSkeleton } from "../Skeleton";
import { toast } from "sonner";
import { CreateGroupList } from "./CreateGroupList";
import { updateGroup } from "@/src/entities/Group/api";

export function CreateGroupIsland() {
  const [isEditMode, setIsEditMode] = useState(false);

  const { isLoadingGroup, fetchAllGroups } = useGroupStore();
  const { subjects, isLoadingSubject, fetchSubject } = useSubjectStore();
  const { createGroup } = useGroupStore();
  const [updateId, setUpdateId] = useState<number>(0);

  const [initialEditData, setInitialEditData] = useState<GroupFormData>({
    name: "",
    subjectIds: [],
  });

  const handleEdit = (id: number, data: GroupFormData) => {
    setInitialEditData(data);
    setUpdateId(id);
    setIsEditMode(true);
  };

  useEffect(() => {
    fetchAllGroups();
    fetchSubject();
  }, []);

  const handleCreate = async (
    newGroup: GroupFormData,
    type: "CREATE" | "UPDATE"
  ) => {
    if (type === "CREATE") {
      await createGroup(newGroup);
      toast.success("Группа создан");
      fetchAllGroups();
    }

    if (type === "UPDATE") {
      await updateGroup(updateId, newGroup);
      toast.success("Группа изменена");
      fetchAllGroups();
    }

    setInitialEditData({
      name: "",
      subjectIds: [],
    });
  };

  const handleCancel = () => {
    setIsEditMode(false);

    setInitialEditData({
      name: "",
      subjectIds: [],
    });
  };

  if (isLoadingSubject || isLoadingGroup)
    return <CreateIslandSkeleton title="Управление группами" />;
  return (
    <div className="p-3">
      <h1 className="text-3xl font-bold mb-4 text-center">
        Управление группами
      </h1>
      <div className="grid grid-cols-[1fr_2fr] gap-5">
        <GroupForm
          subjects={subjects || []}
          onSubmit={handleCreate}
          onCancel={handleCancel}
          initialData={initialEditData}
          isEdit={isEditMode}
        />
        <CreateGroupList onClickEdit={handleEdit} />
      </div>
    </div>
  );
}
