"use client";

import React from "react";
import { CreateListSkeleton } from "../Skeleton";
import { Pencil, Trash } from "lucide-react";
import { toast } from "sonner";
import { SubjectFormData } from "../CreateForm";
import { Subject } from "@/src/entities/Subject/types";
import { useSubjectStore } from "@/src/shared/lib/stores/subjectsStore";
import { Group } from "@/src/entities/Group/types";

export function CreateSubjectList({
  onClickEdit,
}: {
  onClickEdit: (id: number, subject: SubjectFormData) => void;
}) {
  const { subjects, isLoadingSubject, fetchSubject } = useSubjectStore();
  const { deleteSubject } = useSubjectStore();

  const handleDelete = async (subjectId: number) => {
    try {
      await deleteSubject(subjectId);
      toast.success("Предмет удален");
      fetchSubject();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Ошибка удаления предмета");
    }
  };

  const handleEdit = (id: number, subject: SubjectFormData) => {
    onClickEdit(id, subject);
  };

  console.log(subjects);

  if (isLoadingSubject || !subjects) return <CreateListSkeleton />;

  return (
    <div className="w-full bg-white rounded-3xl h-[600px] overflow-y-scroll p-8">
      <div className="text-lg font-semibold mb-4">Список предметов</div>
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
                Группы
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {subjects?.map((obj: Subject) => (
              <tr key={obj.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {obj.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {obj.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {obj.groups?.map((obj: Group) => (
                    <div key={obj.id} className="">
                      {obj.name}
                    </div>
                  ))}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() =>
                      handleEdit(obj.id, {
                        name: obj.name,
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
