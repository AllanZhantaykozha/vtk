import { Subject } from "../Subject/types";
import { Student } from "../User/types/types";

export interface Group {
  id: number;
  name: string;
  subjects: GroupSubject[];
  students: Student[];
}

export interface GroupSubject {
  groupId: number;
  subjectId: number;
  group: Group;
  subject: Subject;
}
