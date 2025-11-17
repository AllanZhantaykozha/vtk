"use client";

import { useForm, FormProvider, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useEffect } from "react";
import { Group } from "@/src/entities/Group/types";
import { Subject } from "@/src/entities/Subject/types";
import { Button } from "@/src/shared/ui/Button";
import { ButtonVariantEnum } from "@/src/shared/ui/Button/Button";
import { Select } from "@/src/shared/ui/Select";
import { Eye, EyeClosed } from "lucide-react";
import { User } from "@/src/entities/User/types";

// ========== USER FORM ==========
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
): UserFormData["role"] | undefined =>
  id === 1 ? "student" : id === 2 ? "teacher" : id === 3 ? "admin" : undefined;

const mapTypeToId = (type: UserFormData["role"]): number | undefined =>
  type === "student"
    ? 1
    : type === "teacher"
    ? 2
    : type === "admin"
    ? 3
    : undefined;

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
    methods.reset({ ...initialData, password: "" });
  }, [initialData, methods]);

  const {
    handleSubmit,
    control,
    watch,
    setValue,
    register,
    formState: { errors },
  } = methods;
  const selectedType = watch("role");
  const [passwordOpen, setPasswordOpen] = useState(false);

  const handleToggleSubject = (id: number) => {
    const current = methods.getValues("subjectIds");
    setValue(
      "subjectIds",
      current.includes(id) ? current.filter((s) => s !== id) : [...current, id]
    );
  };

  return (
    <FormProvider {...methods}>
      <div className="mb-6 bg-white rounded-3xl border p-8 h-fit">
        <h3 className="text-lg font-semibold mb-4">
          {isEdit ? "Изменить пользователя" : "Добавить пользователя"}
        </h3>
        <form
          onSubmit={handleSubmit((data) =>
            onSubmit(data, isEdit ? "UPDATE" : "CREATE")
          )}
          className="space-y-4"
        >
          {/* Тип пользователя */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Тип пользователя
            </label>
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <Select
                  data={userTypes}
                  selectedId={
                    field.value ? mapTypeToId(field.value) : undefined
                  }
                  onChange={(id) =>
                    field.onChange(id ? mapIdToType(id) : undefined)
                  }
                  className="w-full"
                />
              )}
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
              {...register("login")}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
            {errors.login && (
              <p className="text-red-500 text-sm mt-1">
                {errors.login.message}
              </p>
            )}
          </div>

          {/* ФИО */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ФИО
            </label>
            <input
              {...register("fullName")}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
            {errors.fullName && (
              <p className="text-red-500 text-sm mt-1">
                {errors.fullName.message}
              </p>
            )}
          </div>

          {/* Пароль */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Пароль
            </label>
            <div className="relative">
              <input
                type={passwordOpen ? "text" : "password"}
                {...register("password")}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setPasswordOpen(!passwordOpen)}
                className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer"
              >
                {passwordOpen ? <Eye size={20} /> : <EyeClosed size={20} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Группа */}
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

          {/* Предметы */}
          {selectedType === "teacher" && (
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
                      onClick={() => handleToggleSubject(s.id)}
                      className={`px-3 py-1 rounded-md text-sm font-medium ${
                        isSelected
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
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
              variant={ButtonVariantEnum.BLUE}
              text={isEdit ? "Сохранить" : "Добавить"}
              disabled={loading}
              type="submit"
            />
            {onCancel && (
              <Button
                onClick={async () => onCancel()}
                variant={ButtonVariantEnum.GRAY}
                text="Отмена"
                type="submit"
              />
            )}
          </div>
        </form>
      </div>
    </FormProvider>
  );
}

// ========== GROUP FORM ==========
const groupFormSchema = z.object({
  name: z.string().min(1, "Название группы обязательно"),
  subjectIds: z.array(z.number()),
});
export type GroupFormData = z.infer<typeof groupFormSchema>;

interface GroupFormProps {
  subjects: Subject[];
  onSubmit: (data: GroupFormData, type: "CREATE" | "UPDATE") => Promise<void>;
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
    defaultValues: { name: "", subjectIds: [], ...initialData },
  });

  useEffect(() => methods.reset(initialData), [initialData, methods]);

  const {
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = methods;
  const toggleSubject = (id: number) => {
    const current = watch("subjectIds");
    setValue(
      "subjectIds",
      current.includes(id) ? current.filter((s) => s !== id) : [...current, id]
    );
  };

  return (
    <FormProvider {...methods}>
      <div className="mb-6 bg-white rounded-3xl border p-10 h-fit">
        <h3 className="text-lg font-semibold mb-4">
          {isEdit ? "Изменить группу" : "Добавить группу"}
        </h3>
        <form
          onSubmit={handleSubmit((data) =>
            onSubmit(data, isEdit ? "UPDATE" : "CREATE")
          )}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Название группы
            </label>
            <input
              {...methods.register("name")}
              className="w-full p-2 border border-gray-300 rounded-md"
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
                    onClick={() => toggleSubject(s.id)}
                    className={`px-3 py-1 rounded-md text-sm font-medium ${
                      isSelected
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {s.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              type="submit"
              variant={ButtonVariantEnum.BLUE}
              text={isEdit ? "Сохранить" : "Добавить"}
              disabled={loading}
            />
            {onCancel && (
              <Button
                type="submit"
                onClick={async () => onCancel()}
                variant={ButtonVariantEnum.GRAY}
                text="Отмена"
              />
            )}
          </div>
        </form>
      </div>
    </FormProvider>
  );
}

// ========== SUBJECT FORM ==========
const subjectFormSchema = z.object({
  name: z.string().min(1, "Название предмета обязательно"),
});
export type SubjectFormData = z.infer<typeof subjectFormSchema>;

interface SubjectFormProps {
  onSubmit: (data: SubjectFormData, type: "CREATE" | "UPDATE") => Promise<void>;
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
    defaultValues: { name: "", ...initialData },
  });

  useEffect(() => methods.reset(initialData), [initialData, methods]);
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = methods;

  return (
    <FormProvider {...methods}>
      <div className="mb-6 bg-white rounded-3xl border p-10 h-fit">
        <h3 className="text-lg font-semibold mb-4">
          {isEdit ? "Изменить предмет" : "Добавить предмет"}
        </h3>
        <form
          onSubmit={handleSubmit((data) =>
            onSubmit(data, isEdit ? "UPDATE" : "CREATE")
          )}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Название предмета
            </label>
            <input
              {...register("name")}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant={ButtonVariantEnum.BLUE}
              text={isEdit ? "Сохранить" : "Добавить"}
              disabled={loading}
              type="submit"
            />
            {onCancel && (
              <Button
                onClick={async () => onCancel()}
                variant={ButtonVariantEnum.GRAY}
                text="Отмена"
                type="submit"
              />
            )}
          </div>
        </form>
      </div>
    </FormProvider>
  );
}

// --- Notification Form Schema ---
const NotificationFormSchema = z.object({
  text: z.string().min(1, "Контент уведомления обязателен"),
  status: z.enum(["LOW", "MEDIUM", "HIGH"]),
  userIds: z
    .array(z.number())
    .min(1, "Нужно выбрать хотя бы одного получателя"),
});

export type NotificationFormData = z.infer<typeof NotificationFormSchema>;

interface NotificationFormProps {
  userIds?: User[];
  onSubmit: (
    data: NotificationFormData,
    type: "CREATE" | "UPDATE"
  ) => Promise<void>;
  onCancel?: () => void;
  initialData?: Partial<NotificationFormData>;
  isEdit?: boolean;
  loading?: boolean;
}

export function NotificationForm({
  userIds = [],
  onSubmit,
  onCancel,
  initialData = {},
  isEdit = false,
  loading = false,
}: NotificationFormProps) {
  const methods = useForm<NotificationFormData>({
    resolver: zodResolver(NotificationFormSchema),
    defaultValues: {
      text: "",
      status: "LOW",
      userIds: [],
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
    watch,
    setValue,
    register,
    formState: { errors },
  } = methods;

  const toggleuserIds = (id: number) => {
    const current = methods.getValues("userIds");
    setValue(
      "userIds",
      current.includes(id) ? current.filter((r) => r !== id) : [...current, id]
    );
  };

  const selecteduserIds = watch("userIds");

  return (
    <FormProvider {...methods}>
      <div className="mb-6 bg-white rounded-3xl border p-10 h-fit">
        <h3 className="text-lg font-semibold mb-4">
          {isEdit ? "Изменить уведомление" : "Добавить уведомление"}
        </h3>

        <form
          onSubmit={handleSubmit((data) =>
            onSubmit(data, isEdit ? "UPDATE" : "CREATE")
          )}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Текст уведомления
            </label>
            <textarea
              placeholder="Введите текст"
              {...register("text")}
              rows={3}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.text && (
              <p className="text-red-500 text-sm mt-1">{errors.text.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Приоритет
            </label>
            <div className="flex gap-2">
              {["HIGH", "MEDIUM", "LOW"].map((s) => (
                <label key={s} className="inline-flex items-center gap-2">
                  <input type="radio" value={s} {...register("status")} />

                  <span className="capitalize text-sm">{s}</span>
                </label>
              ))}
            </div>

            {errors.status && (
              <p className="text-red-500 text-sm mt-1">
                {errors.status.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Получатели
            </label>
            <div className="flex flex-wrap gap-2">
              {userIds.length > 0 ? (
                userIds.map((r) => {
                  const isSelected = selecteduserIds.includes(r.id);
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => toggleuserIds(r.id)}
                      className={`px-3 py-1 rounded-md text-sm font-medium ${
                        isSelected
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      {r.fullName}
                    </button>
                  );
                })
              ) : (
                <p className="text-sm text-gray-500">
                  Нет доступных получателей
                </p>
              )}
            </div>
            {errors.userIds && (
              <p className="text-red-500 text-sm mt-1">
                {errors.userIds.message as string}
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant={ButtonVariantEnum.BLUE}
              text={isEdit ? "Сохранить" : "Добавить"}
              disabled={loading}
              type="submit"
            />
            {onCancel && (
              <Button
                type="submit"
                onClick={async () => onCancel()}
                variant={ButtonVariantEnum.GRAY}
                text="Отмена"
              />
            )}
          </div>
        </form>
      </div>
    </FormProvider>
  );
}
