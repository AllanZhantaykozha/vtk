"use client";

import { useEffect, useState } from "react";
import { GroupForm, GroupFormData } from "../CreateForm";
import { useSubjectStore } from "@/src/shared/lib/stores/subjectsStore";
import { useGroupStore } from "@/src/shared/lib/stores";
import { CreateIslandSkeleton } from "../Skeleton";
import { toast } from "sonner";
import { CreateGroupList } from "./CreateGroupList";

export function CreateGroupIsland() {
  const [isEditMode, setIsEditMode] = useState(false);

  const { isLoadingGroup, fetchGroups } = useGroupStore();
  const { subjects, isLoadingSubjects, fetchSubjects } = useSubjectStore();
  const { createGroup } = useGroupStore();

  const [initialEditData, setInitialEditData] = useState<GroupFormData>({
    name: "",
    subjectIds: [],
  });

  const handleEdit = (data: GroupFormData) => {
    setInitialEditData(data);
    setIsEditMode(true);
  };

  useEffect(() => {
    fetchGroups();
    fetchSubjects();
  }, []);

  const handleCreate = async (newGroup: GroupFormData) => {
    await createGroup(newGroup);

    toast.success("Группа создана");
    fetchGroups();

    setInitialEditData({
      name: "",
      subjectIds: [],
    });
  };

  const handleCancel = () => {
    setIsEditMode(false);

    toast.success("Группа изменена");

    setInitialEditData({
      name: "",
      subjectIds: [],
    });
  };

  if (isLoadingSubjects || isLoadingGroup)
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
