import { Subject } from "../Subject/types";
import { Teacher } from "../User/types";

export interface Task {
  id: number;
  title: string;
  description: string;
  subject: Subject;
  subjectId: number;
  teacherId: number;
  submissions: TaskSubmission[];
  teacher: Teacher;
  uploadDate: Date;
  deadline: Date;
  fileContent: string; // base64 string for file content, optional
  timeRemaining: number;
  message?: string;
  isExpired: boolean;
  status?: string;
}

export interface TaskSubmission {
  id: number;
  taskId: number;
  studentId: number;
  text?: string;
  fileContent?: string; // base64 string, optional
  score?: number;
  submittedAt: Date;
  status: "PENDING" | "APPROVED" | "REJECTED";
  task?: Task;
  student?: {
    id: number;
    userId: number;
    user?: {
      id: number;
      fullName: string;
    };
  };
}
