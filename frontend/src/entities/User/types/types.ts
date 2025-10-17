import { Group } from "@/components/types/group.type";
import { Test, Lecture, Subject } from "@/components/types/subject.type";
import { TestSubmission } from "../../Test/types";

export type NotificationStatus = "LOW" | "MEDIUM" | "HIGH";
export type TestSubmissionStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface User {
  id: number;
  login: string;
  password: string;
  fullName: string;
  createdAt: Date;
  updatedAt: Date;
  teacher?: Teacher;
  student?: Student;
  admin?: Admin;
  notifications: Notification[];
}

export interface Teacher {
  id: number;
  userId: number;
  user: User;
  subjects: TeacherSubject[];
  tests: Test[];
  lectures: Lecture[];
}

export interface TeacherSubject {
  teacherId: number;
  subjectId: number;
  teacher: Teacher;
  subject: Subject;
}

export interface Student {
  id: number;
  userId: number;
  groupId?: number;
  group?: Group;
  user: User;
  submissions: TestSubmission[];
}

export interface Admin {
  id: number;
  userId: number;
  user: User;
}
