import { Group } from "../Group/types";
import { Lecture } from "../Lecture/types";
import { Test } from "../Test/types";
import { TeacherSubject } from "../User/types";

export interface Subject {
  id: number;
  name: string;
  groups: Group[];
  teachers: TeacherSubject[];
  tests: Test[];
  lectures: Lecture[];
}
