import { Subject } from "./subject.type";
import { UserProfile } from "./user.type";

export type Group = {
  id: number;
  name: string;
  subjects: { subject: Subject }[];
  students: {
    id: number;
    user: UserProfile;
  };
};

export type Groups = {
  group: Group;
};
