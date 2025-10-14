"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { UserProfile } from "@/components/types/user.type";
import { Subject } from "@/components/types/subject.type";
import { Group } from "@/components/types/group.type";
import { useApi } from "@/hooks/useApi";

export default function AdminPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);

  const [selectedType, setSelectedType] = useState("Студент");
  const [selectedSubjects, setSelectedSubjects] = useState<number[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);

  const [login, setLogin] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");

  const [newSubjectName, setNewSubjectName] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupSubjects, setNewGroupSubjects] = useState<number[]>([]);

  const [error, setError] = useState<string | null>(null);

  const [editUserId, setEditUserId] = useState<number | null>(null);
  const [editGroupId, setEditGroupId] = useState<number | null>(null);
  const [editSubjectId, setEditSubjectId] = useState<number | null>(null);

  // Хуки для списков
  const subjectsList = useApi<Subject[], "subjects", "getAll">(
    "subjects",
    "getAll",
    {
      enabled: true,
    }
  );

  const groupsList = useApi<Group[], "groups", "getAll">("groups", "getAll", {
    enabled: true,
  });

  const usersList = useApi<UserProfile[], "users", "getAll">(
    "users",
    "getAll",
    { enabled: true }
  );

  // Хуки для мутаций subjects
  const subjectsCreate = useApi<unknown, "subjects", "create">(
    "subjects",
    "create",
    {
      enabled: false,
    }
  );
  const subjectsUpdate = useApi<unknown, "subjects", "update">(
    "subjects",
    "update",
    {
      enabled: false,
    }
  );
  const subjectsDelete = useApi<unknown, "subjects", "delete">(
    "subjects",
    "delete",
    {
      enabled: false,
    }
  );

  // Хуки для мутаций groups
  const groupsCreate = useApi<unknown, "groups", "create">("groups", "create", {
    enabled: false,
  });
  const groupsUpdate = useApi<unknown, "groups", "update">("groups", "update", {
    enabled: false,
  });
  const groupsDelete = useApi<unknown, "groups", "delete">("groups", "delete", {
    enabled: false,
  });

  // Хуки для мутаций users
  const usersCreate = useApi<unknown, "users", "create">("users", "create", {
    enabled: false,
  });
  const usersUpdate = useApi<unknown, "users", "update">("users", "update", {
    enabled: false,
  });
  const usersDelete = useApi<unknown, "users", "delete">("users", "delete", {
    enabled: false,
  });

  // Обновление состояний из хуков
  useEffect(() => {
    if (subjectsList.data) setSubjects(subjectsList.data);
  }, [subjectsList.data]);

  useEffect(() => {
    if (groupsList.data) setGroups(groupsList.data);
  }, [groupsList.data]);

  useEffect(() => {
    if (usersList.data) setUsers(usersList.data);
  }, [usersList.data]);

  // Обработка ошибок списков
  useEffect(() => {
    if (subjectsList.error) setError(subjectsList.error);
  }, [subjectsList.error]);

  useEffect(() => {
    if (groupsList.error) setError(groupsList.error);
  }, [groupsList.error]);

  useEffect(() => {
    if (usersList.error) setError(usersList.error);
  }, [usersList.error]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    document.cookie = "token=; path=/; max-age=0";
    window.location.href = "/login";
  };

  const toggleSubject = (id: number) =>
    setSelectedSubjects((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );

  const toggleGroupSubject = (id: number) =>
    setNewGroupSubjects((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );

  // --- Users ---
  const createOrUpdateUser = async () => {
    const body: UserProfile = {
      login,
      fullName,
      id: 0,
      role: "",
      birthDate: null,
      password: "",
      course: null,
      student: null,
      teacher: null,
      groupId: 0,
      subjectIds: [],
      group: {
        name: "",
        subjects: [
          {
            subject: {
              name: "",
              id: 0,
              teacher: {
                user: {
                  fullName: "",
                },
              },
            },
          },
        ],
      },
    };
    if (password) body.password = password;
    if (selectedType === "Студент") {
      if (!selectedGroup) return setError("Выберите группу");
      body.role = "student";
      body.groupId = selectedGroup;
    } else if (selectedType === "Преподаватель") {
      if (selectedSubjects.length === 0)
        return setError("Выберите хотя бы один предмет");
      body.role = "teacher";
      body.subjectIds = selectedSubjects;
    } else {
      body.role = "admin";
    }

    const targetApi = editUserId ? usersUpdate : usersCreate;
    const options = editUserId
      ? { params: { id: editUserId.toString() }, body }
      : { body };

    await targetApi.refetch(options);
    if (targetApi.error) {
      setError(targetApi.error);
      return;
    }

    await usersList.refetch();
    setLogin("");
    setFullName("");
    setPassword("");
    setSelectedSubjects([]);
    setSelectedGroup(null);
    setEditUserId(null);
    setError(null);
  };

  const deleteUser = async (id: number) => {
    await usersDelete.refetch({ params: { id: id.toString() } });
    if (usersDelete.error) {
      setError(usersDelete.error);
      return;
    }
    await usersList.refetch();
  };

  // --- Groups ---
  const createOrUpdateGroup = async () => {
    const body = { name: newGroupName, subjectIds: newGroupSubjects };
    const targetApi = editGroupId ? groupsUpdate : groupsCreate;
    const options = editGroupId
      ? { params: { id: editGroupId.toString() }, body }
      : { body };

    await targetApi.refetch(options);
    if (targetApi.error) {
      setError(targetApi.error);
      return;
    }

    await groupsList.refetch();
    setNewGroupName("");
    setNewGroupSubjects([]);
    setEditGroupId(null);
    setError(null);
  };

  const deleteGroup = async (id: number) => {
    await groupsDelete.refetch({
      params: { id: id.toString() },
    });
    if (groupsDelete.error) {
      setError(groupsDelete.error);
      return;
    }
    await groupsList.refetch();
  };

  // --- Subjects ---
  const createOrUpdateSubject = async () => {
    const body = { name: newSubjectName };
    const targetApi = editSubjectId ? subjectsUpdate : subjectsCreate;
    const options = editSubjectId
      ? { params: { id: editSubjectId.toString() }, body }
      : { body };

    await targetApi.refetch(options);
    if (targetApi.error) {
      setError(targetApi.error);
      return;
    }

    await subjectsList.refetch();
    setNewSubjectName("");
    setEditSubjectId(null);
    setError(null);
  };

  const deleteSubject = async (id: number) => {
    await subjectsDelete.refetch({
      params: { id: id.toString() },
    });
    if (subjectsDelete.error) {
      setError(subjectsDelete.error);
      return;
    }
    await subjectsList.refetch();
  };

  const getUserType = (user: UserProfile) =>
    user.student ? "Студент" : user.teacher ? "Преподаватель" : "Админ";

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 bg-white shadow p-6">
        <h2 className="text-xl font-bold mb-6">Меню</h2>
        <nav className="flex flex-col gap-3">
          <Button variant="ghost">Пользователи</Button>
          <Button variant="ghost">Группы</Button>
          <Button variant="ghost">Предметы</Button>
        </nav>
      </aside>

      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6 flex justify-between items-center">
          Админ-панель
          <Button variant="destructive" onClick={handleLogout}>
            Выход
          </Button>
        </h1>
        {error && <div className="bg-red-100 text-red-700 p-4">{error}</div>}

        <Tabs defaultValue="users">
          <TabsList>
            <TabsTrigger value="users">Пользователи</TabsTrigger>
            <TabsTrigger value="groups">Группы</TabsTrigger>
            <TabsTrigger value="subjects">Предметы</TabsTrigger>
          </TabsList>

          {/* --- Users --- */}
          <TabsContent value="users">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>
                  {editUserId
                    ? "Изменить пользователя"
                    : "Добавить пользователя"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select
                  onValueChange={(value) => setSelectedType(value)}
                  value={selectedType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите тип" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Студент">Студент</SelectItem>
                    <SelectItem value="Преподаватель">Преподаватель</SelectItem>
                    <SelectItem value="Админ">Админ</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Логин"
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                />
                <Input
                  placeholder="ФИО"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
                <Input
                  placeholder="Пароль"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {selectedType === "Студент" && (
                  <Select
                    onValueChange={(v) => setSelectedGroup(Number(v))}
                    value={selectedGroup?.toString() || ""}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите группу" />
                    </SelectTrigger>
                    <SelectContent>
                      {groups.map((g) => (
                        <SelectItem key={g.id} value={g.id.toString()}>
                          {g.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {selectedType === "Преподаватель" && (
                  <div>
                    <div>Предметы:</div>
                    <div className="flex flex-wrap gap-2">
                      {subjects.map((s) => (
                        <Button
                          key={s.id}
                          variant={
                            selectedSubjects.includes(s.id)
                              ? "default"
                              : "outline"
                          }
                          onClick={() => toggleSubject(s.id)}
                        >
                          {s.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
                <Button onClick={createOrUpdateUser}>
                  {editUserId ? "Сохранить" : "Добавить"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Список пользователей</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>ФИО</TableHead>
                      <TableHead>Логин</TableHead>
                      <TableHead>Пароль</TableHead>
                      <TableHead>Тип</TableHead>
                      <TableHead>Группа/Предметы</TableHead>
                      <TableHead>Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell>{u.id}</TableCell>
                        <TableCell>{u.fullName}</TableCell>
                        <TableCell>{u.login}</TableCell>
                        <TableCell>{u.password}</TableCell>
                        <TableCell>{getUserType(u)}</TableCell>
                        <TableCell>
                          {u.student?.group?.name ||
                            (u.teacher?.subjects
                              .map((s) => s.subject.name)
                              .join(", ") ??
                              "")}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditUserId(u.id);
                              setLogin(u.login);
                              setFullName(u.fullName);
                              setPassword("");
                              setSelectedType(getUserType(u));
                              setSelectedGroup(
                                u.student ? u.student.group?.id ?? null : null
                              );
                              setSelectedSubjects(
                                u.teacher
                                  ? u.teacher.subjects.map((s) => s.subject.id)
                                  : []
                              );
                            }}
                          >
                            Изм.
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteUser(u.id)}
                          >
                            Удал.
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* --- Groups --- */}
          <TabsContent value="groups">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>
                  {editGroupId ? "Изменить группу" : "Добавить группу"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Название группы"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                />
                <div>
                  <div>Предметы:</div>
                  <div className="flex flex-wrap gap-2">
                    {subjects.map((s) => (
                      <Button
                        key={s.id}
                        variant={
                          newGroupSubjects.includes(s.id)
                            ? "default"
                            : "outline"
                        }
                        onClick={() => toggleGroupSubject(s.id)}
                      >
                        {s.name}
                      </Button>
                    ))}
                  </div>
                </div>
                <Button onClick={createOrUpdateGroup}>
                  {editGroupId ? "Сохранить" : "Добавить"}
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Список групп</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Название</TableHead>
                      <TableHead>Предметы</TableHead>
                      <TableHead>Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {groups.map((g) => (
                      <TableRow key={g.id}>
                        <TableCell>{g.id}</TableCell>
                        <TableCell>{g.name}</TableCell>
                        <TableCell>
                          {g.subjects.map((s) => s.subject.name).join(", ")}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditGroupId(g.id);
                              setNewGroupName(g.name);
                              setNewGroupSubjects(
                                g.subjects.map((s) => s.subject.id)
                              );
                            }}
                          >
                            Изм.
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteGroup(g.id)}
                          >
                            Удал.
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* --- Subjects --- */}
          <TabsContent value="subjects">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>
                  {editSubjectId ? "Изменить предмет" : "Добавить предмет"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Название предмета"
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                />
                <Button onClick={createOrUpdateSubject}>
                  {editSubjectId ? "Сохранить" : "Добавить"}
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Список предметов</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Название</TableHead>
                      <TableHead>Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subjects.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell>{s.id}</TableCell>
                        <TableCell>{s.name}</TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditSubjectId(s.id);
                              setNewSubjectName(s.name);
                            }}
                          >
                            Изм.
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteSubject(s.id)}
                          >
                            Удал.
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
