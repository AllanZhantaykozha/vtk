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
    update: { path: `/users/`, method: "PATCH" },
    delete: { path: `/users/`, method: "DELETE" },
  },
  lectures: {
    create: { path: `/lectures`, method: "POST" },
    getAll: { path: `/lectures`, method: "GET" },
    getById: { path: `/lectures/`, method: "GET" },
    update: { path: `/lectures/`, method: "PATCH" },
    delete: { path: `/lectures/`, method: "DELETE" },
  },
  tests: {
    create: { path: `/tests`, method: "POST" },
    getAll: { path: `/tests/`, method: "GET" },
    update: { path: `/tests/`, method: "PATCH" },
    delete: { path: `/tests/`, method: "DELETE" },
    getById: { path: `/tests/`, method: "GET" },
    getMyTests: { path: `/tests/`, method: "GET" },
    submit: { path: `/tests/submit`, method: "POST" },
    check: { path: `/tests/submissions/check`, method: "POST" },

    getStatistic: { path: `/tests/getStatistic`, method: "GET" },
  },
  tasks: {
    create: { path: `/tasks`, method: "POST" },
    getAll: { path: `/tasks`, method: "GET" },
    getById: { path: `/tasks/`, method: "GET" },
    update: { path: `/tasks/`, method: "PATCH" },
    delete: { path: `/tasks/`, method: "DELETE" },
    submit: { path: `/tasks/submit`, method: "POST" },
  },
  groups: {
    addSubject: { path: `/groups/subjects`, method: "POST" },
    updateSubject: {
      path: `/groups/subjects/`,
      method: "PATCH",
    },
    deleteSubject: {
      path: `/groups/subjects/`,
      method: "DELETE",
    },
    create: { path: `/groups`, method: "POST" },
    getAll: { path: `/groups`, method: "GET" },
    update: { path: `/groups/`, method: "PATCH" },
    delete: { path: `/groups/`, method: "DELETE" },
    getById: { path: `/groups/`, method: "GET" },
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
    create: { path: `/subjects/`, method: "POST" },
    update: { path: `/subjects/`, method: "PATCH" },
    delete: { path: `/subjects/`, method: "DELETE" },
  },
  teacher: {
    getLectures: { path: `/teacher/lectures`, method: "GET" },
    getTests: { path: `/teacher/tests`, method: "GET" },
    getTestById: { path: `/teacher/tests/`, method: "GET" },
    getMySubjects: { path: `/teacher/my-subjects`, method: "GET" },
    getStudents: { path: `/teacher/students`, method: "GET" },
    getPassedTests: { path: `/teacher/passed-tests`, method: "GET" },
    getAllTeachers: { path: `/teacher/get-all-teachers`, method: "GET" },
  },
  student: {
    getMySubjects: { path: `/student/my-subjects`, method: "GET" },
    getAll: { path: `/student/get-all-students`, method: "GET" },
  },
  notification: {
    getNotification: { path: `/notification`, method: "GET" },
    create: { path: `/notification/create/`, method: "POST" },
    update: { path: `/notification/update/`, method: "PATCH" },
    delete: { path: `/notification/delete/`, method: "DELETE" },
  },
} as const satisfies Record<string, Record<string, RouteConfig>>;

export type Route = typeof ROUTES;
