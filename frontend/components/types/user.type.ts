import { Subject } from "./subject.type";

export interface UserProfile {
  id: number;
  login: string;
  fullName: string;
  role: string;
  birthDate: string | null;
  password: string;
  course: string | null;
  student: { group: { id: number; name: string } | null } | null;
  teacher: { subjects: { subject: Subject }[] } | null;
  groupId: number;
  subjectIds: number[];
  group: {
    name: string;
    subjects: [
      {
        subject: {
          name: string;
          id: number;
          teacher: {
            user: {
              fullName: string;
            };
          };
        };
      }
    ];
  };
}

export type RawSubject = {
  id: number;
  name: string;
  groups: {
    group: {
      id: number;
      name: string;
      students: {
        id: number;
        user: { fullName: string };
      }[];
    };
  }[];
};
