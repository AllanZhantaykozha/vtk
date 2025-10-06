import { Subject } from "./subject.type";

export interface Lecture {
  id: number;
  title: string;
  subject: Subject;
  description: string;
  uploadDate: string;
  fileContent: string | null;
  teacher: { user: { fullName: string } };
}
