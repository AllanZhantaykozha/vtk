import { Lecture } from "./lecture.type";
import { Test } from "./test.type";
import { UserProfile } from "./user.type";

export interface Teacher {
  id: number;
  tests: Test[];
  lectures: Lecture[];

  user: UserProfile;
}
