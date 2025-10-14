"use client";

import React, { Suspense } from "react";
import { StudentNavbar } from "@/components/ux/navbar/student-navbar";

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col">
      <Suspense fallback={<div>Загрузка...</div>}>
        <StudentNavbar />
        <main className="container mx-auto">{children}</main>
      </Suspense>
    </div>
  );
}
