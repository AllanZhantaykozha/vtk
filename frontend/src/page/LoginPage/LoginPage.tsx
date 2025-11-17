"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { Button } from "@/src/shared/ui/Button";
import { Icon } from "@/src/shared/ui/Icon";
import { IconThemeEnum } from "@/src/shared/ui/Icon/Icon";
import { Island } from "@/src/shared/ui/Island";
import {
  IslandContent,
  IslandHeader,
  IslandThemeEnum,
} from "@/src/shared/ui/Island/Island";
import { Eye, EyeClosed } from "lucide-react";
import { login } from "@/src/entities/User/api/mutations";
import { useRouter } from "next/navigation";
import { ButtonVariantEnum } from "@/src/shared/ui/Button/Button";

const loginFormSchema = z.object({
  login: z.string().min(1, "Логин обязателен"),
  password: z.string().min(1, "Пароль обязателен"),
});

export type LoginFormData = z.infer<typeof loginFormSchema>;

export function LoginPage() {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const methods = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      login: "",
      password: "",
    },
  });

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = methods;

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    try {
      const result = await login(data);
      if (typeof result === "string") {
        return;
      }

      localStorage.setItem("token", result.access_token);

      const expires = new Date();
      expires.setDate(expires.getDate() + 7);
      document.cookie = `token=${
        result.access_token
      }; expires=${expires.toUTCString()}; path=/; Secure; SameSite=Strict`;

      router.replace("/student");
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center h-screen">
      <FormProvider {...methods}>
        <Island className="my-auto w-[500px]" theme={IslandThemeEnum.BLACK}>
          <IslandHeader>
            <Icon icon="LogIn" theme={IconThemeEnum.WHITE} />
            <div className="text-white text-xl font-bold">Авторизация</div>
          </IslandHeader>
          <IslandContent className="grid gap-3 ">
            <label className="text-white">Логин</label>

            <div>
              <input
                {...register("login")}
                type="text"
                placeholder="Логин"
                className={`w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 ${
                  errors.login
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                } ${
                  IslandThemeEnum.BLACK ? "bg-gray-800 text-white" : "bg-white"
                }`}
              />
              {errors.login && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.login.message}
                </p>
              )}
            </div>
            <label className="text-white">Пароль</label>

            <div className="relative">
              <input
                {...register("password")}
                type={passwordVisible ? "text" : "password"}
                placeholder="Пароль"
                className={`w-full px-3 py-2 pr-10 rounded-md focus:outline-none focus:ring-2 ${
                  errors.password
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                } ${
                  IslandThemeEnum.BLACK ? "bg-gray-800 text-white" : "bg-white"
                }`}
              />
              <button
                type="button"
                onClick={() => setPasswordVisible(!passwordVisible)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
              >
                {passwordVisible ? <Eye size={20} /> : <EyeClosed size={20} />}
              </button>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>
            <Button
              className="m-auto w-full mt-5"
              text={isSubmitting ? "Вход..." : "Войти"}
              variant={ButtonVariantEnum.GRAY}
              disabled={isSubmitting}
              onClick={handleSubmit(onSubmit)}
            />
          </IslandContent>
        </Island>
      </FormProvider>
    </div>
  );
}
