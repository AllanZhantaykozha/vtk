"use client";

import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="max-w-md w-full text-center p-8">
        <div className="text-6xl font-bold text-gray-800">404</div>
        <div className="text-gray-600">
          <p className="text-lg mb-4">Страница не найдена</p>
          <p className="text-sm mb-6">
            Возможно, вы ошиблись в ссылке или страница была удалена.
          </p>
          <Button onClick={() => router.push("/login")} className="mx-auto">
            На главную
          </Button>
        </div>
      </div>
    </div>
  );
}
