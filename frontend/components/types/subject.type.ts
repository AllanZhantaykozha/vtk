export interface Subject {
  tests: string[];
  lectures: string[];
  teachers: Teachers[];
  id: number;
  name: string;
}

export interface Teachers {
  teacher: {
    user: {
      fullName: string;
    };
  };
}

export interface SubjectStudent {
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
