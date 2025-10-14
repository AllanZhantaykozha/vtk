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

export interface StudentSubjectsResponse {
  group: {
    subjects: {
      subject: {
        id: number;
        name: string;
        tests: {
          id: number;
          title: string;
        }[];
        lectures: {
          id: number;
          title: string;
        }[];
        teachers: Teachers;
      };
    }[];
  };
}

// subject.type.ts
export interface Test {
  id: number;
  title: string;
}

export interface Lecture {
  id: number;
  title: string;
}

export interface Teacher {
  id: number;
  name: string;
}
