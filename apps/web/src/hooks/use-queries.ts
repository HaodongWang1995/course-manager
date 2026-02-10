import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  teacherScheduleStore,
  teacherCoursesStore,
  teacherStudentsStore,
  reportsStore,
  calendarStore,
  studentScheduleStore,
  studentGradesStore,
  studentAssignmentsStore,
  studentResourcesStore,
  feedbackStore,
  auth,
  type TeacherCourse,
  type TeacherStudent,
  type GeneratedReport,
  type UpcomingDeadline,
  type FeedbackDraft,
} from "@/api/storage";

// Simulate API delay
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ── Auth ───────────────────────────────────────────

export function useAuth() {
  return useQuery({
    queryKey: ["auth"],
    queryFn: async () => {
      return auth.get();
    },
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ email, role }: { email: string; role: "student" | "teacher" }) => {
      await delay(300);
      return auth.login(email, role);
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
      auth.logout();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth"] });
    },
  });
}

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

// ── Teacher Courses ────────────────────────────────

export function useTeacherCourses() {
  return useQuery({
    queryKey: ["teacher", "courses"],
    queryFn: async () => {
      await delay(100);
      return teacherCoursesStore.getAll();
    },
  });
}

export function useAddCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (course: Omit<TeacherCourse, "progress"> & { progress?: number }) => {
      await delay(200);
      return teacherCoursesStore.add(course);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher", "courses"] });
    },
  });
}

export function useUpdateCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ code, data }: { code: string; data: Partial<TeacherCourse> }) => {
      await delay(200);
      return teacherCoursesStore.update(code, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher", "courses"] });
    },
  });
}

export function useDeleteCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (code: string) => {
      await delay(200);
      return teacherCoursesStore.remove(code);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher", "courses"] });
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
