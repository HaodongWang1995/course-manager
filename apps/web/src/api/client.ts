const API_BASE = import.meta.env.VITE_API_URL || "";

const TOKEN_KEY = "cm_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    const data = await res.json();
    // Only redirect to login for expired/invalid token on protected routes.
    // Don't redirect if already on the login page (e.g. wrong credentials).
    if (window.location.pathname !== "/login") {
      clearToken();
      window.location.href = "/login";
    }
    throw new ApiError(401, data.error || "未登录");
  }

  const data = await res.json();

  if (!res.ok) {
    throw new ApiError(res.status, data.error || "请求失败");
  }

  return data as T;
}

// ── Auth ──────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string;
  role: "teacher" | "student";
  avatar?: string;
  created_at?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export const authApi = {
  register(data: { email: string; password: string; name: string; role: string }) {
    return request<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  login(data: { email: string; password: string }) {
    return request<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  me() {
    return request<User>("/api/auth/me");
  },
};

// ── Courses ───────────────────────────────────────

export interface Course {
  id: string;
  teacher_id: string;
  title: string;
  description?: string;
  price: number;
  cover_image?: string;
  status: "active" | "draft" | "archived";
  category?: string;
  teacher_name: string;
  lesson_count: number;
  created_at: string;
  updated_at: string;
  schedules?: Schedule[];
}

export interface Schedule {
  id: string;
  course_id: string;
  lesson_number: number;
  title?: string;
  start_time: string;
  end_time: string;
  room?: string;
}

export const courseApi = {
  list(params?: { search?: string; category?: string; status?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set("search", params.search);
    if (params?.category) searchParams.set("category", params.category);
    if (params?.status) searchParams.set("status", params.status);
    const qs = searchParams.toString();
    return request<Course[]>(`/api/courses${qs ? `?${qs}` : ""}`);
  },

  get(id: string) {
    return request<Course>(`/api/courses/${id}`);
  },

  create(data: { title: string; description?: string; price?: number; category?: string; status?: string }) {
    return request<Course>("/api/courses", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update(id: string, data: Partial<Pick<Course, "title" | "description" | "price" | "cover_image" | "category">>) {
    return request<Course>(`/api/courses/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  delete(id: string) {
    return request<{ success: boolean }>(`/api/courses/${id}`, { method: "DELETE" });
  },

  updateStatus(id: string, status: string) {
    return request<Course>(`/api/courses/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },
};

// ── Enrollments ──────────────────────────────────

export interface Enrollment {
  id: string;
  student_id: string;
  course_id: string;
  status: "pending" | "approved" | "rejected";
  note?: string;
  reject_reason?: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  course_title?: string;
  teacher_name?: string;
  student_name?: string;
  student_email?: string;
}

export const enrollmentApi = {
  apply(data: { course_id: string; note?: string }) {
    return request<Enrollment>("/api/enrollments", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  listMine(params?: { status?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set("status", params.status);
    const qs = searchParams.toString();
    return request<Enrollment[]>(`/api/enrollments${qs ? `?${qs}` : ""}`);
  },

  listByCourse(courseId: string, params?: { status?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set("status", params.status);
    const qs = searchParams.toString();
    return request<Enrollment[]>(`/api/enrollments/course/${courseId}${qs ? `?${qs}` : ""}`);
  },

  review(id: string, data: { status: "approved" | "rejected"; reject_reason?: string }) {
    return request<Enrollment>(`/api/enrollments/${id}/review`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  cancel(id: string) {
    return request<{ success: boolean }>(`/api/enrollments/${id}`, { method: "DELETE" });
  },
};

// ── Teacher Aggregated ───────────────────────────

export interface TeacherStudent {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  courses: string[];
  course_count: number;
}

export interface TeacherScheduleItem {
  id: string;
  course_id: string;
  lesson_number: number;
  title?: string;
  start_time: string;
  end_time: string;
  room?: string;
  course_title: string;
  student_count: number;
}

export interface TeacherStats {
  course_count: string;
  active_courses: string;
  student_count: string;
  pending_enrollments: string;
  schedule_count: string;
}

export interface Deadline {
  id: string;
  teacher_id: string;
  title: string;
  due_date: string;
  urgent: boolean;
  created_at: string;
}

export const teacherApi = {
  students() {
    return request<TeacherStudent[]>("/api/teachers/students");
  },
  schedule() {
    return request<TeacherScheduleItem[]>("/api/teachers/schedule");
  },
  stats() {
    return request<TeacherStats>("/api/teachers/stats");
  },
  deadlines() {
    return request<Deadline[]>("/api/teachers/deadlines");
  },
  addDeadline(data: { title: string; due_date: string; urgent?: boolean }) {
    return request<Deadline>("/api/teachers/deadlines", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  deleteDeadline(id: string) {
    return request<{ success: boolean }>(`/api/teachers/deadlines/${id}`, { method: "DELETE" });
  },
};

// ── Assignments ─────────────────────────────────

export interface Assignment {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  due_date: string;
  created_at: string;
  course_title?: string;
}

export interface StudentAssignment extends Assignment {
  submission_status: string;
  submitted_at?: string;
}

export const assignmentApi = {
  listForCourse(courseId: string) {
    return request<Assignment[]>(`/api/courses/${courseId}/assignments`);
  },
  create(courseId: string, data: { title: string; description?: string; due_date: string }) {
    return request<Assignment>(`/api/courses/${courseId}/assignments`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  listForStudent() {
    return request<StudentAssignment[]>("/api/students/assignments");
  },
  submit(id: string, data: { status: string }) {
    return request<{ id: string }>(`/api/assignments/${id}/submit`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },
};

// ── Grades ───────────────────────────────────────

export interface GradeSummary {
  gpa: string;
  rank: string;
  completion: string;
  courses: Array<{
    course_id: string;
    name: string;
    teacher: string;
    overall: number;
    midterm: string;
    final: string;
  }>;
  chartData: Array<{
    subject: string;
    you: number;
    avg: number;
  }>;
}

export const gradeApi = {
  create(data: { course_id: string; student_id: string; type: string; label?: string; score: number; max_score?: number }) {
    return request<{ id: string }>("/api/grades", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  studentSummary() {
    return request<GradeSummary>("/api/grades/students/grades");
  },
};

// ── Resources ───────────────────────────────────

export interface Resource {
  id: string;
  course_id: string;
  title: string;
  file_type?: string;
  file_size?: string;
  featured: boolean;
  created_at: string;
  course_title?: string;
}

export interface StudentResources {
  featured: Resource[];
  all: Resource[];
}

export const resourceApi = {
  listForCourse(courseId: string) {
    return request<Resource[]>(`/api/courses/${courseId}/resources`);
  },
  create(courseId: string, data: { title: string; file_type?: string; file_size?: string; featured?: boolean }) {
    return request<Resource>(`/api/courses/${courseId}/resources`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  listForStudent() {
    return request<StudentResources>("/api/students/resources");
  },
};

// ── Feedback ────────────────────────────────────

export interface Feedback {
  id: string;
  course_id: string;
  teacher_id: string;
  summary?: string;
  quote?: string;
  requirements: string[];
  assignment_title?: string;
  due_date?: string;
  published: boolean;
  created_at: string;
  updated_at: string;
  course_title?: string;
  teacher_name?: string;
  actions?: Array<{ id: string; title: string; due_label?: string; pending: boolean }>;
}

export const feedbackApi = {
  getByCourse(courseId: string) {
    return request<Feedback | null>(`/api/feedback/course/${courseId}`);
  },
  save(data: {
    course_id: string;
    summary?: string;
    quote?: string;
    requirements?: string[];
    assignment_title?: string;
    due_date?: string;
    actions?: Array<{ title: string; due_label?: string; pending?: boolean }>;
  }) {
    return request<Feedback>("/api/feedback", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  publish(id: string) {
    return request<Feedback>(`/api/feedback/${id}/publish`, { method: "PATCH" });
  },
};

// ── Schedules ─────────────────────────────────────

export const scheduleApi = {
  list(courseId: string) {
    return request<Schedule[]>(`/api/courses/${courseId}/schedules`);
  },

  create(courseId: string, data: { lesson_number?: number; title?: string; start_time: string; end_time: string; room?: string }) {
    return request<Schedule>(`/api/courses/${courseId}/schedules`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update(id: string, data: Partial<Omit<Schedule, "id" | "course_id">>) {
    return request<Schedule>(`/api/schedules/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  delete(id: string) {
    return request<{ success: boolean }>(`/api/schedules/${id}`, { method: "DELETE" });
  },
};
