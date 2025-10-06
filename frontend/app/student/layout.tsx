"use client";

import React from "react";
import { StudentNavbar } from "@/components/ux/navbar/student-navbar";

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col">
      <StudentNavbar />
      <main className="container mx-auto">{children}</main>
    </div>
  );
}
