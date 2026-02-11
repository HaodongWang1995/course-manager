import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  authApi,
  courseApi,
  scheduleApi,
  enrollmentApi,
  setToken,
  clearToken,
  getToken,
  type User,
  type Course,
  type Schedule,
  type Enrollment,
} from "@/api/client";
import {
  teacherScheduleStore,
  teacherStudentsStore,
  reportsStore,
  calendarStore,
  studentScheduleStore,
  studentGradesStore,
  studentAssignmentsStore,
  studentResourcesStore,
  feedbackStore,
  type TeacherStudent,
  type GeneratedReport,
  type UpcomingDeadline,
  type FeedbackDraft,
} from "@/api/storage";

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
    enabled: !!getToken(),
  });
}

export function useCourseDetail(id: string) {
  return useQuery({
    queryKey: ["course", id],
    queryFn: () => courseApi.get(id),
    enabled: !!id && !!getToken(),
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
    },
  });
}

export function useDeleteSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => scheduleApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
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

// ── Below: Legacy localStorage hooks (unchanged for Phase 1) ──

// Simulate API delay
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ── Teacher Schedule ───────────────────────────────

export function useTeacherSchedule() {
  return useQuery({
    queryKey: ["teacher", "schedule"],
    queryFn: async () => {
      await delay(100);
      return teacherScheduleStore.getAll();
    },
  });
}

// ── Teacher Students ───────────────────────────────

export function useTeacherStudents() {
  return useQuery({
    queryKey: ["teacher", "students"],
    queryFn: async () => {
      await delay(100);
      return teacherStudentsStore.getAll();
    },
  });
}

export function useAddStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (student: TeacherStudent) => {
      await delay(200);
      return teacherStudentsStore.add(student);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher", "students"] });
    },
  });
}

export function useDeleteStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await delay(200);
      return teacherStudentsStore.remove(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher", "students"] });
    },
  });
}

// ── Reports ────────────────────────────────────────

export function useReportKPIs() {
  return useQuery({
    queryKey: ["teacher", "reportKPIs"],
    queryFn: async () => {
      await delay(100);
      return reportsStore.getKPIs();
    },
  });
}

export function usePerformanceData() {
  return useQuery({
    queryKey: ["teacher", "performance"],
    queryFn: async () => {
      await delay(100);
      return reportsStore.getPerformance();
    },
  });
}

export function useAttendanceTrends() {
  return useQuery({
    queryKey: ["teacher", "attendance"],
    queryFn: async () => {
      await delay(100);
      return reportsStore.getAttendance();
    },
  });
}

export function useGeneratedReports() {
  return useQuery({
    queryKey: ["teacher", "reports"],
    queryFn: async () => {
      await delay(100);
      return reportsStore.getGenerated();
    },
  });
}

export function useAddReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (report: GeneratedReport) => {
      await delay(300);
      return reportsStore.addGenerated(report);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher", "reports"] });
    },
  });
}

// ── Calendar ───────────────────────────────────────

export function useCalendarEvents() {
  return useQuery({
    queryKey: ["teacher", "calendarEvents"],
    queryFn: async () => {
      await delay(100);
      return calendarStore.getEvents();
    },
  });
}

export function useUpcomingDeadlines() {
  return useQuery({
    queryKey: ["teacher", "deadlines"],
    queryFn: async () => {
      await delay(100);
      return calendarStore.getDeadlines();
    },
  });
}

export function useAddDeadline() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (deadline: UpcomingDeadline) => {
      await delay(200);
      return calendarStore.addDeadline(deadline);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher", "deadlines"] });
    },
  });
}

export function useRemoveDeadline() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (title: string) => {
      await delay(200);
      return calendarStore.removeDeadline(title);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher", "deadlines"] });
    },
  });
}

// ── Student Schedule ───────────────────────────────

export function useStudentSchedule() {
  return useQuery({
    queryKey: ["student", "schedule"],
    queryFn: async () => {
      await delay(100);
      return studentScheduleStore.getAll();
    },
  });
}

// ── Student Grades ─────────────────────────────────

export function useStudentGrades() {
  return useQuery({
    queryKey: ["student", "grades"],
    queryFn: async () => {
      await delay(100);
      return studentGradesStore.get();
    },
  });
}

// ── Student Assignments ────────────────────────────

export function useStudentAssignments() {
  return useQuery({
    queryKey: ["student", "assignments"],
    queryFn: async () => {
      await delay(100);
      return studentAssignmentsStore.getAll();
    },
  });
}

export function useUpdateAssignmentStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await delay(200);
      return studentAssignmentsStore.updateStatus(id, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student", "assignments"] });
    },
  });
}

// ── Student Resources ──────────────────────────────

export function useStudentResources() {
  return useQuery({
    queryKey: ["student", "resources"],
    queryFn: async () => {
      await delay(100);
      return studentResourcesStore.get();
    },
  });
}

// ── Course Feedback ────────────────────────────────

export function useCourseFeedbackDetail(_courseId: string) {
  return useQuery({
    queryKey: ["student", "feedback", _courseId],
    queryFn: async () => {
      await delay(100);
      return feedbackStore.getDetail();
    },
  });
}

export function useFeedbackDraft(courseId: string) {
  return useQuery({
    queryKey: ["teacher", "feedbackDraft", courseId],
    queryFn: async () => {
      await delay(100);
      return feedbackStore.getDraft(courseId);
    },
  });
}

export function useSaveFeedbackDraft() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (draft: FeedbackDraft) => {
      await delay(200);
      return feedbackStore.saveDraft(draft);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["teacher", "feedbackDraft", variables.courseId] });
    },
  });
}

export function usePublishFeedback() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (courseId: string) => {
      await delay(300);
      return feedbackStore.publish(courseId);
    },
    onSuccess: (_data, courseId) => {
      queryClient.invalidateQueries({ queryKey: ["teacher", "feedbackDraft", courseId] });
    },
  });
}
