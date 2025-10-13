export type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

export interface RouteConfig {
  path: string;
  method: HttpMethod;
}

export const ROUTES = {
  auth: {
    login: { path: `/auth/login`, method: "POST" },
  },
  users: {
    create: { path: `/users`, method: "POST" },
    getAll: { path: `/users`, method: "GET" },
    getMe: { path: `/users/me`, method: "GET" },
    update: { path: `/users/{id}`, method: "PATCH" },
    delete: { path: `/users/{id}`, method: "DELETE" },
  },
  lectures: {
    create: { path: `/lectures`, method: "POST" },
    getAll: { path: `/lectures`, method: "GET" },
    getById: { path: `/lectures/{id}`, method: "GET" },
    update: { path: `/lectures/{id}`, method: "PATCH" },
    delete: { path: `/lectures/{id}`, method: "DELETE" },
  },
  tests: {
    create: { path: `/tests`, method: "POST" },
    getAll: { path: `/tests`, method: "GET" },
    update: { path: `/tests/{id}`, method: "PATCH" },
    delete: { path: `/tests/{id}`, method: "DELETE" },
    getById: { path: `/tests/{id}`, method: "GET" },
    getMyTests: { path: `/tests/my-tests`, method: "GET" },
    submit: { path: `/tests/{id}/submit`, method: "POST" },
    check: { path: `/tests/submissions/{id}/check`, method: "POST" },
  },
  groups: {
    addSubject: { path: `/groups/subjects`, method: "POST" },
    updateSubject: {
      path: `/groups/subjects/{id}`,
      method: "PATCH",
    },
    deleteSubject: {
      path: `/groups/subjects/{id}`,
      method: "DELETE",
    },
    create: { path: `/groups`, method: "POST" },
    getAll: { path: `/groups`, method: "GET" },
    update: { path: `/groups/{id}`, method: "PATCH" },
    delete: { path: `/groups/{id}`, method: "DELETE" },
    getById: { path: `/groups/{id}`, method: "GET" },
  },
  subjects: {
    getAll: { path: `/subjects`, method: "GET" },
    getWithStudents: {
      path: `/subjects/with-students`,
      method: "GET",
    },
    getTeacherNavbar: {
      path: `/subjects/teacher-navbar`,
      method: "GET",
    },
    getMySubjects: {
      path: `/subjects/get-my-subjects`,
      method: "GET",
    },
  },
  teacher: {
    getLectures: { path: `/teacher/lectures`, method: "GET" },
    getTests: { path: `/teacher/tests`, method: "GET" },
    getTestById: { path: `/teacher/tests/{id}`, method: "GET" },
    getMySubjects: { path: `/teacher/my-subjects`, method: "GET" },
    getStudents: { path: `/teacher/students`, method: "GET" },
    getPassedTests: { path: `/teacher/passed-tests`, method: "GET" },
  },
  student: {
    getMySubjects: { path: `/student/my-subjects`, method: "GET" },
  },
  notification: {
    getNotification: { path: `/notification`, method: "GET" },
  },
} as const satisfies Record<string, Record<string, RouteConfig>>;

export type Route = typeof ROUTES;

export type RouteEntry<
  C extends keyof Route,
  A extends keyof Route[C]
> = Route[C][A];
