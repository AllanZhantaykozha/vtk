"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { Submission } from "@/components/types/test.type";

interface Subject {
  id: number;
  name: string;
  teachers: Array<{
    teacher: {
      id: number;
      user: { fullName: string };
    };
  }>;
}

interface UserProfile {
  id: number;
  login: string;
  fullName: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  group: string;
  submissionsCount: number;
  averageScore: number;
  submissions: Array<{
    id: number;
    score: number;
    test: {
      id: number;
      subject: { id: number; name: string };
      uploadDate: string;
    };
  }>;
  subjects: Subject[];
  birthDate?: string;
  course?: number;
}

interface TestData {
  id: number;
  title: string;
  score: number;
  date: string;
  grade: number;
  total: number;
}

interface LessonData {
  subject: string;
  teachers: string[];
}

interface Test {
  id: number;
  title: string;
  submissions: Submission[];
}

export default function StudentPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [testData, setTestData] = useState<TestData[]>([]);
  const [lessons, setLessons] = useState<LessonData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [grade, setGrade] = useState<number | null>(null);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const profileResponse = await fetch("http://localhost:4000/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!profileResponse.ok) throw new Error("Ошибка при загрузке профиля");
      const profileData: UserProfile = await profileResponse.json();
      setProfile(profileData);

      if (profileData.subjects) {
        const lessonsList: LessonData[] = profileData.subjects.map((s) => ({
          subject: s.name,
          teachers: s.teachers.map((t) => t.teacher.user.fullName),
        }));
        setLessons(lessonsList);
      }

      const testsResponse = await fetch("http://localhost:4000/tests", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!testsResponse.ok) throw new Error("Ошибка при загрузке тестов");
      const testsData: Test[] = await testsResponse.json();

      console.log(testsData);

      const transformedTestData: TestData[] = testsData
        .flatMap((test: Test) =>
          test.submissions.map((s: Submission) => ({
            id: test.id,
            title: test.title,
            score: s.score,
            total: Object.keys(s.answers).length,
            grade: Math.round(
              (Number(s.score) / Number(Object.keys(s.answers).length)) * 100
            ),
            date: new Date(s.submittedAt).toISOString().split("T")[0],
          }))
        )
        .sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );

      console.log(transformedTestData);

      setTestData(transformedTestData);
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      if (err.message.includes("Unauthorized")) {
        localStorage.removeItem("token");
        document.cookie = "auth_token=; path=/; max-age=0";
        router.push("/login");
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    document.cookie = "token=; path=/; max-age=0";
    window.location.href = "/login";
  };

  useEffect(() => {
    fetchData();
  }, [router]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Загрузка...
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        {error}
      </div>
    );

  return (
    <div className="container mx-auto px-4 py-8">
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
          <div>Курс: {profile?.course ?? "Не указано"}</div>
          <div>Группа: {profile?.group ?? "Не указано"}</div>
          <div className="flex gap-5 mt-auto">
            <Button className="cursor-pointer">Редактировать</Button>
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

      <div className="mt-10" id="lessons">
        <h2 className="text-2xl font-bold mb-5 text-center">Мои уроки</h2>
        {lessons.length === 0 ? (
          <p className="text-gray-600 text-center">Нет назначенных уроков</p>
        ) : (
          <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 sticky top-0">
                  <th className="border p-3 text-left">Предмет</th>
                  <th className="border p-3 text-left">Преподаватели</th>
                </tr>
              </thead>
              <tbody>
                {lessons.map((l, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="border p-3">{l.subject}</td>
                    <td className="border p-3">
                      {l.teachers.length > 0
                        ? l.teachers.join(", ")
                        : "Не назначены"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-10" id="tests">
        <h2 className="text-2xl font-bold mb-5 text-center">
          Результаты тестов
        </h2>
        {testData.length === 0 ? (
          <p className="text-gray-600 text-center">Нет результатов тестов</p>
        ) : (
          <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 sticky top-0">
                  <th className="border p-3 text-left">Название</th>
                  <th className="border p-3 text-left">Дата</th>
                  <th className="border p-3 text-left">Оценка</th>
                </tr>
              </thead>
              <tbody>
                {testData.map((test, index) => (
                  <tr
                    key={`${test.title}-${index}`}
                    className="hover:bg-gray-50"
                  >
                    <td className="border p-3">{test.title}</td>
                    <td className="border p-3">{test.date}</td>
                    <td className="border p-3">{test.grade}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
