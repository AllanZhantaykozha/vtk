"use client";

import React from "react";
import { TeacherNavbar } from "@/components/ux/navbar/teacher-navbar";
import { Toaster } from "@/components/ui/sonner";

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col ">
      <TeacherNavbar />
      <main className="container mx-auto">{children}</main>
      <Toaster />
    </div>
  );
}
