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
