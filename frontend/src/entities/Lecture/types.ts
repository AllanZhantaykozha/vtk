import { Subject } from "../Subject/types";
import { Teacher } from "../User/types";

export interface Lecture {
  id: number;
  title: string;
  subjectId: number;
  subject: Subject;
  teacherId: number;
  teacher: Teacher;
  description: string;
  uploadDate: Date;
  fileContent?: string;
}
