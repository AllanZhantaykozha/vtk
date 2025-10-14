"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie"; // добавляем
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    login: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!formData.login || !formData.password) {
      setError("Пожалуйста, заполните все поля");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:4000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Ошибка при входе");
      }

      const { access_token, user } = await response.json();

      // 1) кладём токен в localStorage
      localStorage.setItem("token", access_token);

      // 2) кладём токен в cookies (для middleware)
      Cookies.set("token", access_token, {
        expires: 1, // срок жизни (1 день)
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
      });

      // Перенаправляем в зависимости от роли
      switch (user.role) {
        case "student":
          router.push("/student");
          break;
        case "teacher":
          router.push("/teacher");
          break;
        case "admin":
          router.push("/admin");
          break;
        default:
          throw new Error("Неизвестная роль пользователя");
      }
    } catch (err: unknown) {
      setLoading(false);

      if (err instanceof Error) {
        setError(err.message);

        if (err.message.includes("Unauthorized")) {
          localStorage.removeItem("token");
          document.cookie = "auth_token=; path=/; max-age=0";
          router.push("/login");
        }
      } else {
        // Если это не Error, можно обработать как неизвестную ошибку
        setError("Произошла неизвестная ошибка");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md mx-4">
        <div>
          <div className="text-2xl font-bold text-center">Вход</div>
        </div>
        <div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="login" className="pb-2">
                Логин
              </Label>
              <Input
                id="login"
                name="login"
                type="text"
                value={formData.login}
                onChange={handleInputChange}
                placeholder="Введите login"
                required
                disabled={loading}
              />
            </div>
            <div>
              <Label htmlFor="password" className="pb-2">
                Пароль
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Введите пароль"
                required
                disabled={loading}
              />
            </div>
            {error && (
              <p className="text-red-600 text-sm text-center">{error}</p>
            )}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Вход..." : "Войти"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
