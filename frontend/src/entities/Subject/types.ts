import { GroupSubject } from "../Group/types";
import { Lecture } from "../Lecture/types";
import { Test } from "../Test/types";
import { TeacherSubject } from "../User/types/types";

export interface Subject {
  id: number;
  name: string;
  groups: GroupSubject[];
  teachers: TeacherSubject[];
  tests: Test[];
  lectures: Lecture[];
}
