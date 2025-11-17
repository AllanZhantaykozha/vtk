import { Subject } from "../Subject/types";
import { Teacher, Student } from "../User/types";
import { TestSubmissionStatus } from "../User/types/types";

export interface Test {
  id: number;
  title: string;
  description?: string;
  subjectId: number;
  subject: Subject;
  deadline: Date;
  teacherId: number;
  teacher: Teacher;
  uploadDate: Date;
  questions: Question[];
  submissions: TestSubmission[];
  timeRemaining: number;
  isExpired: boolean;
  status?: string;
}

export interface Question {
  id: number;
  testId: number;
  test: Test;
  text: string;
  image?: string;
  type: string;
  options: Option[];
  correct: number[];
}

export interface Option {
  id: number;
  questionId: number;
  question: Question;
  text: string;
}

export interface TestSubmission {
  id: number;
  testId: number;
  test: Test;
  studentId: number;
  student: Student;
  answers: Record<string, number[]>;
  score: number;
  submittedAt: Date;
  status: TestSubmissionStatus;
}

export interface Statistic {
  groupName: string;
  subjectName: string;
  totalTests: number;
  totalSubmissions: number;
  averageGrade: number;
}
