"use client";

import { useEffect, useState } from "react";
import { SubjectForm, SubjectFormData } from "../CreateForm";
import { CreateIslandSkeleton } from "../Skeleton";
import { toast } from "sonner";
import { CreateSubjectList } from "./CreateSubjectList";
import { updateSubject } from "@/src/entities/Subject/api/mutations";
import { useSubjectStore } from "@/src/shared/lib/stores/subjectsStore";

export function CreateSubjectIsland() {
  const [isEditMode, setIsEditMode] = useState(false);

  const { isLoadingSubject, fetchSubject } = useSubjectStore();
  const { createSubject } = useSubjectStore();
  const [updateId, setUpdateId] = useState<number>(0);

  const [initialEditData, setInitialEditData] = useState<SubjectFormData>({
    name: "",
  });

  const handleEdit = (id: number, data: SubjectFormData) => {
    setInitialEditData(data);
    setUpdateId(id);
    setIsEditMode(true);
  };

  useEffect(() => {
    fetchSubject();
  }, []);

  const handleCreate = async (
    newSubject: SubjectFormData,
    type: "CREATE" | "UPDATE"
  ) => {
    if (type === "CREATE") {
      await createSubject(newSubject);
      toast.success("Группа создан");
      fetchSubject();
    }

    if (type === "UPDATE") {
      await updateSubject(updateId, newSubject);
      toast.success("Группа изменена");
      fetchSubject();
    }

    setInitialEditData({
      name: "",
    });
  };

  const handleCancel = () => {
    setIsEditMode(false);

    setInitialEditData({
      name: "",
    });
  };

  if (isLoadingSubject || isLoadingSubject)
    return <CreateIslandSkeleton title="Управление предметами" />;
  return (
    <div className="p-3">
      <h1 className="text-3xl font-bold mb-4 text-center">
        Управление предметами
      </h1>
      <div className="grid grid-cols-[1fr_2fr] gap-5">
        <SubjectForm
          onSubmit={handleCreate}
          onCancel={handleCancel}
          initialData={initialEditData}
          isEdit={isEditMode}
        />
        <CreateSubjectList onClickEdit={handleEdit} />
      </div>
    </div>
  );
}
