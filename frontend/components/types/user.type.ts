export interface UserProfile {
  id: number;
  email: string;
  fullName: string;
  role: string;
  birthDate: string | null;
  course: string | null;
  group: {
    name: string;
    subjects: [
      subject: {
        name: string;
        id: number;
        teacher: {
          user: {
            fullName: string;
          };
        };
      }
    ];
  };
}
