"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { UserProfile } from "@/components/types/user.type";
import { Test } from "@/components/types/test.type";
import StudentListBySubjects from "@/components/ux/teacher/StudentListBySubjects";
import Link from "next/link";
import { useApi } from "@/hooks/useApi";
import { LoginPage } from "@/src/pages/LoginPage";

export default function TeacherPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const profileHook = useApi<UserProfile, "users", "getMe">("users", "getMe", {
    enabled: true,
  });
  const testsHook = useApi<Test[], "tests", "getAll">("tests", "getAll", {
    enabled: true,
  });

  useEffect(() => {
    const unauthorized =
      profileHook.error?.includes("Unauthorized") ||
      testsHook.error?.includes("Unauthorized");
    if (unauthorized) {
      localStorage.removeItem("token");
      document.cookie = "token=; path=/; max-age=0";
      router.push("/login");
      return;
    }

    if (profileHook.error || testsHook.error) {
      setError(profileHook.error || testsHook.error);
      setLoading(false);
      return;
    }

    if (profileHook.data && testsHook.data) {
      setProfile(profileHook.data);
      setTests(testsHook.data);
      setLoading(false);
    }
  }, [
    profileHook.data,
    profileHook.error,
    testsHook.data,
    testsHook.error,
    router,
  ]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    document.cookie = "token=; path=/; max-age=0"; // кука сбрасывается
    window.location.href = "/login"; // жёсткий редирект, чтобы middleware отработал
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      <div className="container mx-auto">
        <div className="flex gap-10">
          <div className="rounded-full overflow-hidden w-[250px] h-[250px]">
            <Avatar className="w-full h-full">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </div>
          <div className="flex flex-col">
            <div className="font-bold text-2xl">
              {profile?.fullName ?? "Неизвестно"}
            </div>
            <div>
              {profile?.birthDate
                ? new Date(profile.birthDate).toLocaleDateString("ru-RU")
                : "Не указано"}
            </div>
            <div>{profile?.role ?? "Учитель"}</div>
            <div className="flex gap-5 mt-auto">
              <Button className="cursor-pointer">
                <Link href={"teacher/createTest"}>Создать тест</Link>
              </Button>
              <Button className="cursor-pointer">
                <Link href={"teacher/createLecture"}>Создать лекцию</Link>
              </Button>
              <Button
                variant="destructive"
                onClick={handleLogout}
                className="cursor-pointer"
              >
                Выйти
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-10" id="tests">
          <h2 className="text-2xl font-bold mb-5 text-center">Мои тесты</h2>
          {tests.length === 0 ? (
            <p className="text-gray-600 text-center">
              Вы ещё не создали тестов
            </p>
          ) : (
            <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 sticky top-0">
                    <th className="border p-3 text-left">Название</th>
                    <th className="border p-3 text-left">Предмет</th>
                    <th className="border p-3 text-left">Дата создания</th>
                  </tr>
                </thead>
                <tbody>
                  {tests.map((test) => (
                    <tr key={test.id} className="hover:bg-gray-50">
                      <td className="border p-3">{test.title}</td>
                      <td className="border p-3">{test.subject.name}</td>
                      <td className="border p-3">
                        {new Date(test.uploadDate).toISOString().split("T")[0]}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <StudentListBySubjects />
      </div>
    </div>
  );
}
