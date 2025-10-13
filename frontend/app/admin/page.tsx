"use client";

import { useState, useEffect, useCallback } from "react";
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

type Subject = { id: number; name: string };
type Group = { id: number; name: string; subjects: { subject: Subject }[] };
interface User {
  id: number;
  fullName: string;
  login: string;
  password: string;
  createdAt: string;
  student: { group: { id: number; name: string } | null } | null;
  teacher: { subjects: { subject: Subject }[] } | null;
}
type UserType = "Админ" | "Студент" | "Преподаватель";

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [users, setUsers] = useState<User[]>([]);

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

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (t) setToken(t);
    setReady(true);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    document.cookie = "token=; path=/; max-age=0";
    window.location.href = "/login";
  };

  const fetchWithToken = async (url: string, options: RequestInit = {}) => {
    if (!token) throw new Error("JWT токен не найден");
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || `${res.status} ${res.statusText}`);
    }
    return res.json();
  };

  const fetchAll = useCallback(async () => {
    try {
      const [subjData, groupData, userData] = await Promise.all([
        fetchWithToken("http://localhost:4000/subjects"),
        fetchWithToken("http://localhost:4000/groups"),
        fetchWithToken("http://localhost:4000/users"),
      ]);
      setSubjects(subjData);
      setGroups(groupData);
      setUsers(userData);
    } catch (err) {
      if (err instanceof Error) setError(err.message);
    }
  }, [token]);

  useEffect(() => {
    if (ready && token) fetchAll();
  }, [ready, token, fetchAll]);

  useEffect(() => {
    if (ready && token) fetchAll();
  }, [ready, token]);

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
    const body: any = { login, fullName };
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

    try {
      if (editUserId) {
        await fetchWithToken(`http://localhost:4000/users/${editUserId}`, {
          method: "PATCH",
          body: JSON.stringify(body),
        });
        setEditUserId(null);
      } else {
        await fetchWithToken("http://localhost:4000/users", {
          method: "POST",
          body: JSON.stringify(body),
        });
      }
      await fetchAll();
      setLogin("");
      setFullName("");
      setPassword("");
      setSelectedSubjects([]);
      setSelectedGroup(null);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const deleteUser = async (id: number) => {
    await fetchWithToken(`http://localhost:4000/users/${id}`, {
      method: "DELETE",
    });
    await fetchAll();
  };

  // --- Groups ---
  const createOrUpdateGroup = async () => {
    const body = { name: newGroupName, subjectIds: newGroupSubjects };
    try {
      if (editGroupId) {
        await fetchWithToken(`http://localhost:4000/groups/${editGroupId}`, {
          method: "PATCH",
          body: JSON.stringify(body),
        });
        setEditGroupId(null);
      } else {
        await fetchWithToken("http://localhost:4000/groups", {
          method: "POST",
          body: JSON.stringify(body),
        });
      }
      await fetchAll();
      setNewGroupName("");
      setNewGroupSubjects([]);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const deleteGroup = async (id: number) => {
    await fetchWithToken(`http://localhost:4000/groups/${id}`, {
      method: "DELETE",
    });
    await fetchAll();
  };

  // --- Subjects ---
  const createOrUpdateSubject = async () => {
    const body = { name: newSubjectName };
    try {
      if (editSubjectId) {
        await fetchWithToken(
          `http://localhost:4000/subjects/${editSubjectId}`,
          {
            method: "PATCH",
            body: JSON.stringify(body),
          }
        );
        setEditSubjectId(null);
      } else {
        await fetchWithToken("http://localhost:4000/subjects", {
          method: "POST",
          body: JSON.stringify(body),
        });
      }
      await fetchAll();
      setNewSubjectName("");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const deleteSubject = async (id: number) => {
    await fetchWithToken(`http://localhost:4000/subjects/${id}`, {
      method: "DELETE",
    });
    await fetchAll();
  };

  const getUserType = (user: User): UserType =>
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
