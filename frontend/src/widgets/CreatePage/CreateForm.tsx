"use client";

import { useForm, FormProvider, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useEffect } from "react";
import { Group } from "@/src/entities/Group/types";
import { Subject } from "@/src/entities/Subject/types";
import { Button } from "@/src/shared/ui/Button";
import { ButtonTypeEnum } from "@/src/shared/ui/Button/Button";
import { Select } from "@/src/shared/ui/Select";
import { Eye, EyeClosed } from "lucide-react";

const userFormSchema = z.object({
  role: z.enum(["student", "teacher", "admin"]),
  login: z.string().min(1, "Логин обязателен"),
  fullName: z.string().min(1, "ФИО обязательно"),
  password: z.string(),
  groupId: z.number().nullable(),
  subjectIds: z.array(z.number()),
});

export type UserFormData = z.infer<typeof userFormSchema>;

interface UserFormProps {
  subjects: Subject[];
  groups: Group[];
  onSubmit: (data: UserFormData, type: "CREATE" | "UPDATE") => Promise<void>;
  onCancel?: () => void;
  initialData?: Partial<UserFormData>;
  isEdit?: boolean;
  loading?: boolean;
}

const userTypes = [
  { id: 1, name: "student" },
  { id: 2, name: "teacher" },
  { id: 3, name: "admin" },
];

const mapIdToType = (
  id: number | undefined
): UserFormData["role"] | undefined => {
  switch (id) {
    case 1:
      return "student";
    case 2:
      return "teacher";
    case 3:
      return "admin";
    default:
      return undefined;
  }
};

const mapTypeToId = (type: UserFormData["role"]): number | undefined => {
  switch (type) {
    case "student":
      return 1;
    case "teacher":
      return 2;
    case "admin":
      return 3;
    default:
      return undefined;
  }
};

export function UserForm({
  subjects,
  groups,
  onSubmit,
  onCancel,
  initialData = {},
  isEdit = false,
  loading = false,
}: UserFormProps) {
  const methods = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      role: "student",
      login: "",
      fullName: "",
      password: "",
      groupId: null,
      subjectIds: [],
      ...initialData,
    },
  });

  useEffect(() => {
    if (initialData) {
      methods.reset({
        ...initialData,
        password: "",
      });
      if (initialData.role) {
        methods.setValue("role", initialData.role);
      }
    }
  }, [initialData, methods]);

  const {
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = methods;
  const selectedType = watch("role");

  const handleToggleSubject = (id: number) => {
    const current = methods.getValues("subjectIds");
    if (current.includes(id)) {
      setValue(
        "subjectIds",
        current.filter((s) => s !== id)
      );
    } else {
      setValue("subjectIds", [...current, id]);
    }
  };

  const [passwordOpen, setPasswordOpen] = useState<boolean>(false);

  return (
    <FormProvider {...methods}>
      <div className="mb-6 bg-white rounded-3xl border p-8  h-fit">
        <h3 className="text-lg font-semibold mb-4">
          {isEdit ? "Изменить пользователя" : "Добавить пользователя"}
        </h3>
        <form
          onSubmit={handleSubmit((data) =>
            onSubmit(data, isEdit ? "UPDATE" : "CREATE")
          )}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Тип пользователя
            </label>
            <Controller
              name="role"
              control={control}
              render={({ field }) => {
                const currentSelectedId = mapTypeToId(field.value);
                return (
                  <select
                    value={currentSelectedId || ""}
                    onChange={(e) => {
                      const id = parseInt(e.target.value, 10);
                      const type = mapIdToType(id);
                      if (type) {
                        field.onChange(type);
                      }
                    }}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {userTypes.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                );
              }}
            />
            {errors.role && (
              <p className="text-red-500 text-sm mt-1">{errors.role.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Логин
            </label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...methods.register("login")}
            />
            {errors.login && (
              <p className="text-red-500 text-sm mt-1">
                {errors.login.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ФИО
            </label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...methods.register("fullName")}
            />
            {errors.fullName && (
              <p className="text-red-500 text-sm mt-1">
                {errors.fullName.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Пароль
            </label>
            <div className="relative">
              <input
                type={passwordOpen ? "text" : "password"}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                {...methods.register("password")}
              />

              <button
                type="button"
                onClick={() => setPasswordOpen(!passwordOpen)}
                className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer"
              >
                {passwordOpen ? (
                  <Eye size={20} color="#616161" />
                ) : (
                  <EyeClosed size={20} color="#616161" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {selectedType === "student" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Группа
              </label>
              <Controller
                name="groupId"
                control={control}
                render={({ field }) => (
                  <Select
                    data={groups}
                    selectedId={field.value ?? undefined}
                    getOptionLabel={(g) => g.name}
                    onChange={(id) => field.onChange(id ?? null)}
                  />
                )}
              />
              {errors.groupId && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.groupId.message}
                </p>
              )}
            </div>
          )}

          {selectedType === "teacher" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Предметы
              </label>
              <div className="flex flex-wrap gap-2">
                {subjects.map((s) => {
                  const isSelected = methods.watch("subjectIds").includes(s.id);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      className={`px-3 py-1 rounded-md text-sm font-medium ${
                        isSelected
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                      onClick={() => handleToggleSubject(s.id)}
                    >
                      {s.name}
                    </button>
                  );
                })}
              </div>
              {errors.subjectIds && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.subjectIds.message}
                </p>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              type={ButtonTypeEnum.BLUE}
              text={isEdit ? "Сохранить" : "Добавить"}
              disabled={loading}
            />
            {onCancel && (
              <Button
                onClick={async () => onCancel()}
                type={ButtonTypeEnum.GRAY}
                text={"Отмена"}
              />
            )}
          </div>
        </form>
      </div>
    </FormProvider>
  );
}

// --- Group Form Schema ---
const groupFormSchema = z.object({
  name: z.string().min(1, "Название группы обязательно"),
  subjectIds: z.array(z.number()),
});

export type GroupFormData = z.infer<typeof groupFormSchema>;

// --- Group Form Component ---
interface GroupFormProps {
  subjects: Subject[];
  onSubmit: (data: GroupFormData) => Promise<void>;
  onCancel?: () => void;
  initialData?: Partial<GroupFormData>;
  isEdit?: boolean;
  loading?: boolean;
}

export function GroupForm({
  subjects,
  onSubmit,
  onCancel,
  initialData = {},
  isEdit = false,
  loading = false,
}: GroupFormProps) {
  const methods = useForm<GroupFormData>({
    resolver: zodResolver(groupFormSchema),
    defaultValues: {
      name: "",
      subjectIds: [],
      ...initialData,
    },
  });

  useEffect(() => {
    if (initialData) {
      methods.reset(initialData);
    }
  }, [initialData, methods]);

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = methods;

  const handleToggleSubject = (id: number) => {
    const current = methods.getValues("subjectIds");
    if (current.includes(id)) {
      setValue(
        "subjectIds",
        current.filter((s) => s !== id)
      );
    } else {
      setValue("subjectIds", [...current, id]);
    }
  };

  return (
    <FormProvider {...methods}>
      <div className="mb-6 bg-white rounded-3xl border p-10 h-fit">
        <h3 className="text-lg font-semibold mb-4">
          {isEdit ? "Изменить группу" : "Добавить группу"}
        </h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Название группы
            </label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...methods.register("name")}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Предметы
            </label>
            <div className="flex flex-wrap gap-2">
              {subjects.map((s) => {
                const isSelected = watch("subjectIds").includes(s.id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    className={`px-3 py-1 rounded-md text-sm font-medium ${
                      isSelected
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                    onClick={() => handleToggleSubject(s.id)}
                  >
                    {s.name}
                  </button>
                );
              })}
            </div>
            {errors.subjectIds && (
              <p className="text-red-500 text-sm mt-1">
                {errors.subjectIds.message}
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              type={ButtonTypeEnum.BLUE}
              text={isEdit ? "Сохранить" : "Добавить"}
              disabled={loading}
            />
            {onCancel && (
              <Button
                onClick={async () => onCancel()}
                type={ButtonTypeEnum.GRAY}
                text="Отмена"
              />
            )}
          </div>
        </form>
      </div>
    </FormProvider>
  );
}

// --- Subject Form Schema ---
const subjectFormSchema = z.object({
  name: z.string().min(1, "Название предмета обязательно"),
});

export type SubjectFormData = z.infer<typeof subjectFormSchema>;

// --- Subject Form Component ---
interface SubjectFormProps {
  onSubmit: (data: SubjectFormData) => Promise<void>;
  onCancel?: () => void;
  initialData?: Partial<SubjectFormData>;
  isEdit?: boolean;
  loading?: boolean;
}

export function SubjectForm({
  onSubmit,
  onCancel,
  initialData = {},
  isEdit = false,
  loading = false,
}: SubjectFormProps) {
  const methods = useForm<SubjectFormData>({
    resolver: zodResolver(subjectFormSchema),
    defaultValues: {
      name: "",
      ...initialData,
    },
  });

  // Сброс формы при изменении initialData (для режима редактирования)
  useEffect(() => {
    if (initialData) {
      methods.reset(initialData);
    }
  }, [initialData, methods]);

  const {
    handleSubmit,
    formState: { errors },
  } = methods;

  return (
    <FormProvider {...methods}>
      <div className="mb-6 bg-white rounded-3xl border p-10  h-fit">
        <h3 className="text-lg font-semibold mb-4">
          {isEdit ? "Изменить предмет" : "Добавить предмет"}
        </h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Название предмета
            </label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...methods.register("name")}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              type={ButtonTypeEnum.BLUE}
              text={isEdit ? "Сохранить" : "Добавить"}
              disabled={loading}
            />
            {onCancel && (
              <Button
                onClick={async () => onCancel()}
                type={ButtonTypeEnum.GRAY}
                text="Отмена"
              />
            )}
          </div>
        </form>
      </div>
    </FormProvider>
  );
}
