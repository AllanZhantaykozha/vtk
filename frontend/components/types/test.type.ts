import { Subject } from "./subject.type";

export interface Option {
  id: number;
  text: string;
}

export interface Question {
  id: number;
  text: string;
  image?: string;
  type: "single" | "multiple";
  options: Option[];
}

export interface Submission {
  id: number;
  testId: number;
  studentId: number;
  answers: Record<string, number[]>;
  score: number;
  submittedAt: string;
}

export interface Test {
  id: number;
  title: string;
  description: string;
  subject: Subject;
  uploadDate: string;
  teacher: { user: { fullName: string } };
  questions: Question[];
  submissions: Submission[];
}

export interface ITransformedTest {
  id: number;
  title: string;
  description: string;
  subject: { id: number; name: string };
  uploadDate: string;
  teacher: { user: { fullName: string } };
  questions: Question[];
  submissions: Submission[];
}
