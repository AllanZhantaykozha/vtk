"use client";

import React, { useEffect } from "react";
import { CreateListSkeleton } from "../Skeleton";
import { Pencil, Trash } from "lucide-react";
import { toast } from "sonner";
import { GroupFormData, UserFormData } from "../CreateForm";
import { Group } from "@/src/entities/Group/types";
import { useGroupStore } from "@/src/shared/lib/stores";

export function CreateGroupList({
  onClickEdit,
}: {
  onClickEdit: (group: GroupFormData) => void;
}) {
  const { groups, isLoadingGroup, fetchGroups } = useGroupStore();
  const { deleteGroup } = useGroupStore();

  const handleDelete = async (groupId: number) => {
    try {
      await deleteGroup(groupId);
      toast.success("Группа удален");
      fetchGroups();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Ошибка удаления группы");
    }
  };

  const handleEdit = (group: GroupFormData) => {
    onClickEdit(group);
  };

  if (isLoadingGroup || !groups) return <CreateListSkeleton />;

  return (
    <div className="w-full bg-white rounded-3xl h-[600px] overflow-y-scroll p-8">
      <div className="text-lg font-semibold mb-4">Список групп</div>
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
                Предметы
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {groups?.map((obj: Group) => (
              <tr key={obj.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {obj.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {obj.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {obj.subjects.map((obj) => (
                    <div key={obj.subjectId} className="">
                      {obj.subject.name}
                    </div>
                  ))}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() =>
                      handleEdit({
                        name: obj.name,
                        subjectIds:
                          obj.subjects.map((obj) => obj.subject.id) || [],
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
