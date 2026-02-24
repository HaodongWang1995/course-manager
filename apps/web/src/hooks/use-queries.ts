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
  attachmentApi,
  setToken,
  clearToken,
  getToken,
  type User,
  type Course,
  type Schedule,
  type Enrollment,
  type Deadline,
  type Feedback,
  type Assignment,
} from "@/api/client";
import {
  authKeys,
  teacherKeys,
  studentKeys,
  courseKeys,
  feedbackKeys,
  attachmentKeys,
} from "@/lib/query-keys";

// ── Auth (Real API) ──────────────────────────────────

export function useCurrentUser() {
  return useQuery({
    queryKey: authKeys.me.queryKey,
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
      queryClient.invalidateQueries({ queryKey: authKeys._def });
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
      queryClient.invalidateQueries({ queryKey: authKeys._def });
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

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string }) => authApi.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.me.queryKey });
    },
  });
}

export function useUpdatePassword() {
  return useMutation({
    mutationFn: (data: { current_password: string; new_password: string }) =>
      authApi.updatePassword(data),
  });
}

// ── Courses (Real API) ────────────────────────────────

export function useTeacherCourses(params?: { search?: string; category?: string; status?: string }) {
  return useQuery({
    queryKey: teacherKeys.courses(params).queryKey,
    queryFn: () => courseApi.list(params),
    enabled: !!getToken(),
  });
}

export function useStudentCourses(params?: { search?: string; category?: string }) {
  return useQuery({
    queryKey: studentKeys.courses(params).queryKey,
    queryFn: () => courseApi.list(params),
    enabled: true,
  });
}

export function useCourseDetail(id: string) {
  return useQuery({
    queryKey: courseKeys.detail(id).queryKey,
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
      queryClient.invalidateQueries({ queryKey: teacherKeys.courses._def });
    },
  });
}

export function useUpdateCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Pick<Course, "title" | "description" | "price" | "cover_image" | "category">> }) =>
      courseApi.update(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: teacherKeys.courses._def });
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(variables.id).queryKey });
    },
  });
}

export function useDeleteCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => courseApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teacherKeys.courses._def });
    },
  });
}

export function useUpdateCourseStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      courseApi.updateStatus(id, status),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: teacherKeys.courses._def });
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(variables.id).queryKey });
    },
  });
}

// ── Schedules (Real API) ──────────────────────────────

export function useCourseSchedules(courseId: string) {
  return useQuery({
    queryKey: courseKeys.schedules(courseId).queryKey,
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
      queryClient.invalidateQueries({ queryKey: courseKeys.schedules(variables.courseId).queryKey });
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(variables.courseId).queryKey });
    },
  });
}

export function useUpdateSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<Schedule, "id" | "course_id">> }) =>
      scheduleApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.schedules._def });
      queryClient.invalidateQueries({ queryKey: courseKeys._def });
    },
  });
}

export function useDeleteSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => scheduleApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.schedules._def });
      queryClient.invalidateQueries({ queryKey: courseKeys._def });
    },
  });
}

// ── Enrollments (Real API) ────────────────────────────

export function useMyEnrollments(params?: { status?: string }) {
  return useQuery({
    queryKey: studentKeys.enrollments(params).queryKey,
    queryFn: () => enrollmentApi.listMine(params),
    enabled: !!getToken(),
  });
}

export function useCourseEnrollments(courseId: string, params?: { status?: string }) {
  return useQuery({
    queryKey: teacherKeys.enrollments(courseId, params).queryKey,
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
      queryClient.invalidateQueries({ queryKey: studentKeys.enrollments._def });
      queryClient.invalidateQueries({ queryKey: studentKeys.courses._def });
    },
  });
}

export function useReviewEnrollment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { status: "approved" | "rejected"; reject_reason?: string } }) =>
      enrollmentApi.review(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teacherKeys.enrollments._def });
    },
  });
}

export function useCancelEnrollment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => enrollmentApi.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentKeys.enrollments._def });
    },
  });
}

// ── Student Schedule from DB (approved enrollments → course schedules) ──

export function useStudentScheduleFromDB() {
  const { data: enrollments = [] } = useMyEnrollments({ status: "approved" });
  const courseIds = enrollments.map((e) => e.course_id);

  return useQuery({
    queryKey: studentKeys.scheduleFromDB(courseIds).queryKey,
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
    queryKey: teacherKeys.schedule.queryKey,
    queryFn: () => teacherApi.schedule(),
    enabled: !!getToken(),
  });
}

export function useTeacherStudents() {
  return useQuery({
    queryKey: teacherKeys.students.queryKey,
    queryFn: () => teacherApi.students(),
    enabled: !!getToken(),
  });
}

export function useTeacherStats() {
  return useQuery({
    queryKey: teacherKeys.stats.queryKey,
    queryFn: () => teacherApi.stats(),
    enabled: !!getToken(),
  });
}

export function useUpcomingDeadlines() {
  return useQuery({
    queryKey: teacherKeys.deadlines.queryKey,
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
      queryClient.invalidateQueries({ queryKey: teacherKeys.deadlines.queryKey });
    },
  });
}

export function useRemoveDeadline() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => teacherApi.deleteDeadline(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teacherKeys.deadlines.queryKey });
    },
  });
}

// ── Student Grades (Real API) ─────────────────────────

export function useStudentGrades() {
  return useQuery({
    queryKey: studentKeys.grades.queryKey,
    queryFn: () => gradeApi.studentSummary(),
    enabled: !!getToken(),
  });
}

// ── Student Assignments (Real API) ────────────────────

export function useStudentAssignments() {
  return useQuery({
    queryKey: studentKeys.assignments.queryKey,
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
      queryClient.invalidateQueries({ queryKey: studentKeys.assignments.queryKey });
    },
  });
}

// ── Student Resources (Real API) ──────────────────────

export function useStudentResources() {
  return useQuery({
    queryKey: studentKeys.resources.queryKey,
    queryFn: () => resourceApi.listForStudent(),
    enabled: !!getToken(),
  });
}

export function useCourseResources(courseId: string) {
  return useQuery({
    queryKey: courseKeys.resources(courseId).queryKey,
    queryFn: () => resourceApi.listForCourse(courseId),
    enabled: !!getToken() && !!courseId,
  });
}

export function useCreateResource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ courseId, data }: {
      courseId: string;
      data: { title: string; file_type?: string; file_size?: string; featured?: boolean };
    }) => resourceApi.create(courseId, data),
    onSuccess: (_res, { courseId }) => {
      queryClient.invalidateQueries({ queryKey: courseKeys.resources(courseId).queryKey });
      queryClient.invalidateQueries({ queryKey: studentKeys.resources.queryKey });
    },
  });
}

export function useDeleteResource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, courseId }: { id: string; courseId: string }) =>
      resourceApi.delete(id),
    onSuccess: (_res, { courseId }) => {
      queryClient.invalidateQueries({ queryKey: courseKeys.resources(courseId).queryKey });
      queryClient.invalidateQueries({ queryKey: studentKeys.resources.queryKey });
    },
  });
}

// ── Teacher Assignments (Real API) ────────────────────

export function useCourseAssignments(courseId: string) {
  return useQuery({
    queryKey: courseKeys.assignments(courseId).queryKey,
    queryFn: () => assignmentApi.listForCourse(courseId),
    enabled: !!getToken() && !!courseId,
  });
}

export function useCreateAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ courseId, data }: {
      courseId: string;
      data: { title: string; description?: string; due_date: string };
    }) => assignmentApi.create(courseId, data),
    onSuccess: (_res, { courseId }) => {
      queryClient.invalidateQueries({ queryKey: courseKeys.assignments(courseId).queryKey });
      queryClient.invalidateQueries({ queryKey: studentKeys.assignments.queryKey });
    },
  });
}

export function useDeleteAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, courseId }: { id: string; courseId: string }) =>
      assignmentApi.delete(id),
    onSuccess: (_res, { courseId }) => {
      queryClient.invalidateQueries({ queryKey: courseKeys.assignments(courseId).queryKey });
      queryClient.invalidateQueries({ queryKey: studentKeys.assignments.queryKey });
    },
  });
}

export function useUpdateAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<Assignment, "id" | "course_id" | "created_at">> }) =>
      assignmentApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.assignments._def });
      queryClient.invalidateQueries({ queryKey: studentKeys.assignments.queryKey });
    },
  });
}

// ── Course Feedback (Real API) ────────────────────────

export function useCourseFeedbackDetail(courseId: string) {
  return useQuery({
    queryKey: feedbackKeys.detail(courseId).queryKey,
    queryFn: () => feedbackApi.getByCourse(courseId),
    enabled: !!courseId && !!getToken(),
  });
}

export function useFeedbackDraft(courseId: string) {
  return useQuery({
    queryKey: teacherKeys.feedbackDraft(courseId).queryKey,
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
      queryClient.invalidateQueries({ queryKey: teacherKeys.feedbackDraft(variables.course_id).queryKey });
      queryClient.invalidateQueries({ queryKey: feedbackKeys.detail(variables.course_id).queryKey });
    },
  });
}

export function usePublishFeedback() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => feedbackApi.publish(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teacherKeys.feedbackDraft._def });
      queryClient.invalidateQueries({ queryKey: feedbackKeys._def });
    },
  });
}

// ── Attachments (Real API) ────────────────────────────

export function useCourseAttachments(courseId: string) {
  return useQuery({
    queryKey: attachmentKeys.byCourse(courseId).queryKey,
    queryFn: () => attachmentApi.listByCourse(courseId),
    enabled: !!courseId && !!getToken(),
  });
}

export function useScheduleAttachments(scheduleId: string) {
  return useQuery({
    queryKey: attachmentKeys.bySchedule(scheduleId).queryKey,
    queryFn: () => attachmentApi.listBySchedule(scheduleId),
    enabled: !!scheduleId && !!getToken(),
  });
}

export function useDeleteAttachment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => attachmentApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attachmentKeys._def });
    },
  });
}

export function useUploadAttachment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      file: File;
      courseId?: string;
      scheduleId?: string;
    }) => {
      const { file, courseId, scheduleId } = params;

      // Step 1: Get presigned PUT URL from API
      const { upload_url, file_key } = await attachmentApi.presign({
        filename: file.name,
        content_type: file.type || "application/octet-stream",
        file_size: file.size,
        course_id: courseId,
        schedule_id: scheduleId,
      });

      // Step 2: Upload file
      if (upload_url.startsWith("/api/")) {
        // Local/stub mode: multipart POST to API server
        const formData = new FormData();
        formData.append("file", file);
        const resp = await fetch(upload_url, {
          method: "POST",
          headers: { Authorization: `Bearer ${getToken()}` },
          body: formData,
        });
        if (!resp.ok) throw new Error(`Upload failed: ${resp.status}`);
      } else if (!upload_url.startsWith("stub://")) {
        // S3/R2 mode: PUT directly to presigned URL
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("PUT", upload_url);
          xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
          xhr.onload = () =>
            xhr.status < 300 ? resolve() : reject(new Error(`Upload failed: ${xhr.status}`));
          xhr.onerror = () => reject(new Error("Upload network error"));
          xhr.send(file);
        });
      }

      // Step 3: Confirm metadata with API
      return attachmentApi.confirm({
        file_key,
        filename: file.name,
        file_size: file.size,
        file_type: file.type || undefined,
        course_id: courseId,
        schedule_id: scheduleId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attachmentKeys._def });
    },
  });
}
