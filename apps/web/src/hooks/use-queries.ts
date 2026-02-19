import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  authApi,
  courseApi,
  scheduleApi,
  enrollmentApi,
  teacherApi,
  assignmentApi,
  gradeApi,
  resourceApi,
  feedbackApi,
  setToken,
  clearToken,
  getToken,
  type User,
  type Course,
  type Schedule,
  type Enrollment,
  type Deadline,
  type Feedback,
} from "@/api/client";

// ── Auth (Real API) ──────────────────────────────────

export function useCurrentUser() {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => authApi.me(),
    enabled: !!getToken(),
    retry: false,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const res = await authApi.login(data);
      setToken(res.token);
      return res.user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth"] });
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { email: string; password: string; name: string; role: string }) => {
      const res = await authApi.register(data);
      setToken(res.token);
      return res.user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth"] });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      clearToken();
    },
    onSuccess: () => {
      queryClient.clear();
    },
  });
}

// ── Courses (Real API) ────────────────────────────────

export function useTeacherCourses(params?: { search?: string; category?: string; status?: string }) {
  return useQuery({
    queryKey: ["teacher", "courses", params],
    queryFn: () => courseApi.list(params),
    enabled: !!getToken(),
  });
}

export function useStudentCourses(params?: { search?: string; category?: string }) {
  return useQuery({
    queryKey: ["student", "courses", params],
    queryFn: () => courseApi.list(params),
    enabled: true,
  });
}

export function useCourseDetail(id: string) {
  return useQuery({
    queryKey: ["course", id],
    queryFn: () => courseApi.get(id),
    enabled: !!id,
  });
}

export function useAddCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { title: string; description?: string; price?: number; category?: string; status?: string }) =>
      courseApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher", "courses"] });
    },
  });
}

export function useUpdateCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Pick<Course, "title" | "description" | "price" | "cover_image" | "category">> }) =>
      courseApi.update(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["teacher", "courses"] });
      queryClient.invalidateQueries({ queryKey: ["course", variables.id] });
    },
  });
}

export function useDeleteCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => courseApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher", "courses"] });
    },
  });
}

export function useUpdateCourseStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      courseApi.updateStatus(id, status),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["teacher", "courses"] });
      queryClient.invalidateQueries({ queryKey: ["course", variables.id] });
    },
  });
}

// ── Schedules (Real API) ──────────────────────────────

export function useCourseSchedules(courseId: string) {
  return useQuery({
    queryKey: ["schedules", courseId],
    queryFn: () => scheduleApi.list(courseId),
    enabled: !!courseId && !!getToken(),
  });
}

export function useAddSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ courseId, data }: { courseId: string; data: { lesson_number?: number; title?: string; start_time: string; end_time: string; room?: string } }) =>
      scheduleApi.create(courseId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["schedules", variables.courseId] });
      queryClient.invalidateQueries({ queryKey: ["course", variables.courseId] });
    },
  });
}

export function useUpdateSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<Schedule, "id" | "course_id">> }) =>
      scheduleApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      queryClient.invalidateQueries({ queryKey: ["course"] });
    },
  });
}

export function useDeleteSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => scheduleApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      queryClient.invalidateQueries({ queryKey: ["course"] });
    },
  });
}

// ── Enrollments (Real API) ────────────────────────────

export function useMyEnrollments(params?: { status?: string }) {
  return useQuery({
    queryKey: ["student", "enrollments", params],
    queryFn: () => enrollmentApi.listMine(params),
    enabled: !!getToken(),
  });
}

export function useCourseEnrollments(courseId: string, params?: { status?: string }) {
  return useQuery({
    queryKey: ["teacher", "enrollments", courseId, params],
    queryFn: () => enrollmentApi.listByCourse(courseId, params),
    enabled: !!courseId && !!getToken(),
  });
}

export function useApplyEnrollment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { course_id: string; note?: string }) =>
      enrollmentApi.apply(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student", "enrollments"] });
      queryClient.invalidateQueries({ queryKey: ["student", "courses"] });
    },
  });
}

export function useReviewEnrollment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { status: "approved" | "rejected"; reject_reason?: string } }) =>
      enrollmentApi.review(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher", "enrollments"] });
    },
  });
}

export function useCancelEnrollment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => enrollmentApi.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student", "enrollments"] });
    },
  });
}

// ── Student Schedule from DB (approved enrollments → course schedules) ──

export function useStudentScheduleFromDB() {
  const { data: enrollments = [] } = useMyEnrollments({ status: "approved" });
  const courseIds = enrollments.map((e) => e.course_id);

  return useQuery({
    queryKey: ["student", "scheduleFromDB", courseIds],
    queryFn: async () => {
      if (courseIds.length === 0) return [];
      const results = await Promise.all(
        courseIds.map(async (id) => {
          const course = await courseApi.get(id);
          return (course.schedules || []).map((s: Schedule) => ({
            ...s,
            course_title: course.title,
            course_id: course.id,
          }));
        }),
      );
      return results.flat();
    },
    enabled: courseIds.length > 0,
  });
}

// ── Teacher Aggregated (Real API) ─────────────────────

export function useTeacherSchedule() {
  return useQuery({
    queryKey: ["teacher", "schedule"],
    queryFn: () => teacherApi.schedule(),
    enabled: !!getToken(),
  });
}

export function useTeacherStudents() {
  return useQuery({
    queryKey: ["teacher", "students"],
    queryFn: () => teacherApi.students(),
    enabled: !!getToken(),
  });
}

export function useTeacherStats() {
  return useQuery({
    queryKey: ["teacher", "stats"],
    queryFn: () => teacherApi.stats(),
    enabled: !!getToken(),
  });
}

export function useUpcomingDeadlines() {
  return useQuery({
    queryKey: ["teacher", "deadlines"],
    queryFn: () => teacherApi.deadlines(),
    enabled: !!getToken(),
  });
}

export function useAddDeadline() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { title: string; due_date: string; urgent?: boolean }) =>
      teacherApi.addDeadline(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher", "deadlines"] });
    },
  });
}

export function useRemoveDeadline() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => teacherApi.deleteDeadline(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher", "deadlines"] });
    },
  });
}

// ── Student Grades (Real API) ─────────────────────────

export function useStudentGrades() {
  return useQuery({
    queryKey: ["student", "grades"],
    queryFn: () => gradeApi.studentSummary(),
    enabled: !!getToken(),
  });
}

// ── Student Assignments (Real API) ────────────────────

export function useStudentAssignments() {
  return useQuery({
    queryKey: ["student", "assignments"],
    queryFn: () => assignmentApi.listForStudent(),
    enabled: !!getToken(),
  });
}

export function useUpdateAssignmentStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      assignmentApi.submit(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student", "assignments"] });
    },
  });
}

// ── Student Resources (Real API) ──────────────────────

export function useStudentResources() {
  return useQuery({
    queryKey: ["student", "resources"],
    queryFn: () => resourceApi.listForStudent(),
    enabled: !!getToken(),
  });
}

export function useCourseResources(courseId: string) {
  return useQuery({
    queryKey: ["course", "resources", courseId],
    queryFn: () => resourceApi.listForCourse(courseId),
    enabled: !!getToken() && !!courseId,
  });
}

// ── Course Feedback (Real API) ────────────────────────

export function useCourseFeedbackDetail(courseId: string) {
  return useQuery({
    queryKey: ["feedback", courseId],
    queryFn: () => feedbackApi.getByCourse(courseId),
    enabled: !!courseId && !!getToken(),
  });
}

export function useFeedbackDraft(courseId: string) {
  return useQuery({
    queryKey: ["teacher", "feedbackDraft", courseId],
    queryFn: () => feedbackApi.getByCourse(courseId),
    enabled: !!courseId && !!getToken(),
  });
}

export function useSaveFeedbackDraft() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      course_id: string;
      summary?: string;
      quote?: string;
      requirements?: string[];
      assignment_title?: string;
      due_date?: string;
      actions?: Array<{ title: string; due_label?: string; pending?: boolean }>;
    }) => feedbackApi.save(data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["teacher", "feedbackDraft", variables.course_id] });
      queryClient.invalidateQueries({ queryKey: ["feedback", variables.course_id] });
    },
  });
}

export function usePublishFeedback() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => feedbackApi.publish(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher", "feedbackDraft"] });
      queryClient.invalidateQueries({ queryKey: ["feedback"] });
    },
  });
}
