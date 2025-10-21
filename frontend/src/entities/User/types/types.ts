import { Test, TestSubmission } from "../../Test/types";
import { AppNotification } from "../../Notification/types";
import { Group } from "../../Group/types";
import { Lecture } from "../../Lecture/types";
import { Subject } from "../../Subject/types";

export type NotificationStatus = "LOW" | "MEDIUM" | "HIGH";
export type TestSubmissionStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface User {
  id: number;
  login: string;
  password: string;
  fullName: string;
  createdAt: Date;
  updatedAt: Date;
  photoUrl?: string;
  teacher?: Teacher;
  student?: Student;
  admin?: Admin;
  notifications: AppNotification[];
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
