"use client";

import { useUsersStore } from "@/src/shared/lib/stores/usersStore";
import React, { useEffect } from "react";
import { CreateListSkeleton } from "../Skeleton";
import { User } from "@/src/entities/User/types";
import { Pencil, Trash } from "lucide-react";
import { toast } from "sonner";
import { UserFormData } from "../CreateForm";

export function CreateUserList({
  onClickEdit,
}: {
  onClickEdit: (id: number, user: UserFormData) => void;
}) {
  const { users, isLoading, fetchUsers } = useUsersStore();
  const { deleteUser } = useUsersStore();

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (userId: number) => {
    try {
      await deleteUser(userId);
      toast.success("Пользователь удален");
      fetchUsers();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Ошибка удаления пользователя");
    }
  };

  const handleEdit = (id: number, user: UserFormData) => {
    onClickEdit(id, user);
  };

  if (isLoading || !users) return <CreateListSkeleton />;

  return (
    <div className="w-full bg-white rounded-3xl h-[600px] overflow-y-scroll p-8">
      <div className="text-lg font-semibold mb-4">Список пользователей</div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ФИО
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Логин
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Роль
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users?.map((obj: User) => (
              <tr key={obj.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {obj.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {obj.fullName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {obj.login}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {obj.student
                    ? "Студент"
                    : obj.teacher
                    ? "Преподаватель"
                    : "Админ"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() =>
                      handleEdit(obj.id, {
                        role: obj.teacher
                          ? "teacher"
                          : obj.student
                          ? "student"
                          : "admin",
                        login: obj.login,
                        password: obj.password,
                        groupId: obj.student?.group?.id || 0,
                        fullName: obj.fullName,
                        subjectIds:
                          obj.teacher?.subjects?.map((obj) => obj.subject.id) ||
                          [],
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
