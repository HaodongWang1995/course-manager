import { createQueryKeys, mergeQueryKeys } from "@lukemorales/query-key-factory";

export const authKeys = createQueryKeys("auth", {
  me: null,
});

export const teacherKeys = createQueryKeys("teacher", {
  courses: (params?: { search?: string; category?: string; status?: string }) => ({
    queryKey: [params],
  }),
  schedule: null,
  students: null,
  stats: null,
  deadlines: null,
  enrollments: (courseId: string, params?: { status?: string }) => ({
    queryKey: [courseId, params],
  }),
  feedbackDraft: (courseId: string) => ({
    queryKey: [courseId],
  }),
});

export const studentKeys = createQueryKeys("student", {
  courses: (params?: { search?: string; category?: string }) => ({
    queryKey: [params],
  }),
  enrollments: (params?: { status?: string }) => ({
    queryKey: [params],
  }),
  scheduleFromDB: (courseIds: string[]) => ({
    queryKey: [courseIds],
  }),
  grades: null,
  assignments: null,
  resources: null,
});

export const courseKeys = createQueryKeys("course", {
  detail: (id: string) => ({
    queryKey: [id],
  }),
  schedules: (courseId: string) => ({
    queryKey: [courseId],
  }),
  resources: (courseId: string) => ({
    queryKey: [courseId],
  }),
});

export const feedbackKeys = createQueryKeys("feedback", {
  detail: (courseId: string) => ({
    queryKey: [courseId],
  }),
});

export const attachmentKeys = createQueryKeys("attachment", {
  byCourse: (courseId: string) => ({
    queryKey: [courseId],
  }),
  bySchedule: (scheduleId: string) => ({
    queryKey: [scheduleId],
  }),
});

export const queryKeys = mergeQueryKeys(
  authKeys,
  teacherKeys,
  studentKeys,
  courseKeys,
  feedbackKeys,
  attachmentKeys,
);
