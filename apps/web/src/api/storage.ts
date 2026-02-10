/**
 * localStorage-based data layer.
 * Seeds with mock data on first visit, then reads/writes from localStorage.
 */

import {
  teacherSchedule,
  teacherCourses,
  teacherStudents,
  reportKPIs,
  performanceData,
  attendanceTrends,
  generatedReports,
  calendarEvents,
  upcomingDeadlines,
  studentSchedule,
  studentGrades,
  studentAssignments,
  studentResources,
  courseFeedbackDetail,
} from "./mock-data";

// ── Types ──────────────────────────────────────────

export type TeacherScheduleItem = (typeof teacherSchedule)[number];
export type TeacherCourse = (typeof teacherCourses)[number];
export type TeacherStudent = (typeof teacherStudents)[number];
export type ReportKPI = (typeof reportKPIs)[number];
export type PerformanceItem = (typeof performanceData)[number];
export type AttendanceTrend = (typeof attendanceTrends)[number];
export type GeneratedReport = (typeof generatedReports)[number];
export type CalendarEvents = typeof calendarEvents;
export type UpcomingDeadline = (typeof upcomingDeadlines)[number];
export type StudentScheduleItem = (typeof studentSchedule)[number];
export type StudentGrades = typeof studentGrades;
export type StudentAssignment = (typeof studentAssignments)[number];
export type StudentResources = typeof studentResources;
export type CourseFeedbackDetail = typeof courseFeedbackDetail;

export interface AuthState {
  isLoggedIn: boolean;
  role: "student" | "teacher";
  email: string;
}

export interface FeedbackDraft {
  courseId: string;
  requirementsText: string;
  feedbackText: string;
  assignmentTitle: string;
  dueDate: string;
  published: boolean;
}

// ── Keys ───────────────────────────────────────────

const KEYS = {
  SEEDED: "cm_seeded",
  AUTH: "cm_auth",
  TEACHER_SCHEDULE: "cm_teacher_schedule",
  TEACHER_COURSES: "cm_teacher_courses",
  TEACHER_STUDENTS: "cm_teacher_students",
  REPORT_KPIS: "cm_report_kpis",
  PERFORMANCE: "cm_performance",
  ATTENDANCE: "cm_attendance",
  REPORTS: "cm_reports",
  CALENDAR: "cm_calendar",
  DEADLINES: "cm_deadlines",
  STUDENT_SCHEDULE: "cm_student_schedule",
  STUDENT_GRADES: "cm_student_grades",
  STUDENT_ASSIGNMENTS: "cm_student_assignments",
  STUDENT_RESOURCES: "cm_student_resources",
  FEEDBACK_DETAIL: "cm_feedback_detail",
  FEEDBACK_DRAFTS: "cm_feedback_drafts",
} as const;

// ── Helpers ────────────────────────────────────────

function get<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function set(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value));
}

// ── Seed ───────────────────────────────────────────

export function seedIfNeeded(): void {
  if (localStorage.getItem(KEYS.SEEDED)) return;

  set(KEYS.TEACHER_SCHEDULE, teacherSchedule);
  set(KEYS.TEACHER_COURSES, teacherCourses);
  set(KEYS.TEACHER_STUDENTS, teacherStudents);
  set(KEYS.REPORT_KPIS, reportKPIs);
  set(KEYS.PERFORMANCE, performanceData);
  set(KEYS.ATTENDANCE, attendanceTrends);
  set(KEYS.REPORTS, generatedReports);
  set(KEYS.CALENDAR, calendarEvents);
  set(KEYS.DEADLINES, upcomingDeadlines);
  set(KEYS.STUDENT_SCHEDULE, studentSchedule);
  set(KEYS.STUDENT_GRADES, studentGrades);
  set(KEYS.STUDENT_ASSIGNMENTS, studentAssignments);
  set(KEYS.STUDENT_RESOURCES, studentResources);
  set(KEYS.FEEDBACK_DETAIL, courseFeedbackDetail);
  set(KEYS.FEEDBACK_DRAFTS, []);

  localStorage.setItem(KEYS.SEEDED, "1");
}

// ── Auth ───────────────────────────────────────────

export const auth = {
  get(): AuthState | null {
    return get<AuthState | null>(KEYS.AUTH, null);
  },
  login(email: string, role: "student" | "teacher"): AuthState {
    const state: AuthState = { isLoggedIn: true, role, email };
    set(KEYS.AUTH, state);
    return state;
  },
  logout(): void {
    localStorage.removeItem(KEYS.AUTH);
  },
};

// ── Teacher Schedule ───────────────────────────────

export const teacherScheduleStore = {
  getAll(): TeacherScheduleItem[] {
    return get(KEYS.TEACHER_SCHEDULE, [] as TeacherScheduleItem[]);
  },
  update(id: string, data: Partial<TeacherScheduleItem>): TeacherScheduleItem[] {
    const items = this.getAll();
    const idx = items.findIndex((i) => i.id === id);
    if (idx !== -1) items[idx] = { ...items[idx], ...data };
    set(KEYS.TEACHER_SCHEDULE, items);
    return items;
  },
};

// ── Teacher Courses ────────────────────────────────

let courseIdCounter = 100;

export const teacherCoursesStore = {
  getAll(): TeacherCourse[] {
    return get(KEYS.TEACHER_COURSES, [] as TeacherCourse[]);
  },
  add(course: Omit<TeacherCourse, "progress"> & { progress?: number }): TeacherCourse[] {
    const items = this.getAll();
    items.push({ progress: 0, ...course } as TeacherCourse);
    set(KEYS.TEACHER_COURSES, items);
    return items;
  },
  update(code: string, data: Partial<TeacherCourse>): TeacherCourse[] {
    const items = this.getAll();
    const idx = items.findIndex((c) => c.code === code);
    if (idx !== -1) items[idx] = { ...items[idx], ...data };
    set(KEYS.TEACHER_COURSES, items);
    return items;
  },
  remove(code: string): TeacherCourse[] {
    const items = this.getAll().filter((c) => c.code !== code);
    set(KEYS.TEACHER_COURSES, items);
    return items;
  },
  nextCode(): string {
    courseIdCounter++;
    return `NEW${courseIdCounter}`;
  },
};

// ── Teacher Students ───────────────────────────────

export const teacherStudentsStore = {
  getAll(): TeacherStudent[] {
    return get(KEYS.TEACHER_STUDENTS, [] as TeacherStudent[]);
  },
  add(student: TeacherStudent): TeacherStudent[] {
    const items = this.getAll();
    items.push(student);
    set(KEYS.TEACHER_STUDENTS, items);
    return items;
  },
  update(id: string, data: Partial<TeacherStudent>): TeacherStudent[] {
    const items = this.getAll();
    const idx = items.findIndex((s) => s.id === id);
    if (idx !== -1) items[idx] = { ...items[idx], ...data };
    set(KEYS.TEACHER_STUDENTS, items);
    return items;
  },
  remove(id: string): TeacherStudent[] {
    const items = this.getAll().filter((s) => s.id !== id);
    set(KEYS.TEACHER_STUDENTS, items);
    return items;
  },
};

// ── Reports ────────────────────────────────────────

export const reportsStore = {
  getKPIs(): ReportKPI[] {
    return get(KEYS.REPORT_KPIS, [] as ReportKPI[]);
  },
  getPerformance(): PerformanceItem[] {
    return get(KEYS.PERFORMANCE, [] as PerformanceItem[]);
  },
  getAttendance(): AttendanceTrend[] {
    return get(KEYS.ATTENDANCE, [] as AttendanceTrend[]);
  },
  getGenerated(): GeneratedReport[] {
    return get(KEYS.REPORTS, [] as GeneratedReport[]);
  },
  addGenerated(report: GeneratedReport): GeneratedReport[] {
    const items = this.getGenerated();
    items.unshift(report);
    set(KEYS.REPORTS, items);
    return items;
  },
};

// ── Calendar ───────────────────────────────────────

export const calendarStore = {
  getEvents(): CalendarEvents {
    return get(KEYS.CALENDAR, {} as CalendarEvents);
  },
  addEvent(day: number, event: string): CalendarEvents {
    const events = this.getEvents();
    if (!events[day]) events[day] = [];
    events[day].push(event);
    set(KEYS.CALENDAR, events);
    return events;
  },
  getDeadlines(): UpcomingDeadline[] {
    return get(KEYS.DEADLINES, [] as UpcomingDeadline[]);
  },
  addDeadline(deadline: UpcomingDeadline): UpcomingDeadline[] {
    const items = this.getDeadlines();
    items.push(deadline);
    set(KEYS.DEADLINES, items);
    return items;
  },
  removeDeadline(title: string): UpcomingDeadline[] {
    const items = this.getDeadlines().filter((d) => d.title !== title);
    set(KEYS.DEADLINES, items);
    return items;
  },
};

// ── Student Schedule ───────────────────────────────

export const studentScheduleStore = {
  getAll(): StudentScheduleItem[] {
    return get(KEYS.STUDENT_SCHEDULE, [] as StudentScheduleItem[]);
  },
};

// ── Student Grades ─────────────────────────────────

export const studentGradesStore = {
  get(): StudentGrades {
    return get(KEYS.STUDENT_GRADES, studentGrades);
  },
};

// ── Student Assignments ────────────────────────────

export const studentAssignmentsStore = {
  getAll(): StudentAssignment[] {
    return get(KEYS.STUDENT_ASSIGNMENTS, [] as StudentAssignment[]);
  },
  updateStatus(id: string, status: string): StudentAssignment[] {
    const items = this.getAll();
    const idx = items.findIndex((a) => a.id === id);
    if (idx !== -1) {
      (items[idx] as Record<string, unknown>).status = status;
    }
    set(KEYS.STUDENT_ASSIGNMENTS, items);
    return items;
  },
};

// ── Student Resources ──────────────────────────────

export const studentResourcesStore = {
  get(): StudentResources {
    return get(KEYS.STUDENT_RESOURCES, studentResources);
  },
};

// ── Course Feedback ────────────────────────────────

export const feedbackStore = {
  getDetail(): CourseFeedbackDetail {
    return get(KEYS.FEEDBACK_DETAIL, courseFeedbackDetail);
  },
  getDrafts(): FeedbackDraft[] {
    return get(KEYS.FEEDBACK_DRAFTS, [] as FeedbackDraft[]);
  },
  getDraft(courseId: string): FeedbackDraft | null {
    const drafts = this.getDrafts();
    return drafts.find((d) => d.courseId === courseId) ?? null;
  },
  saveDraft(draft: FeedbackDraft): FeedbackDraft[] {
    const drafts = this.getDrafts();
    const idx = drafts.findIndex((d) => d.courseId === draft.courseId);
    if (idx !== -1) {
      drafts[idx] = draft;
    } else {
      drafts.push(draft);
    }
    set(KEYS.FEEDBACK_DRAFTS, drafts);
    return drafts;
  },
  publish(courseId: string): FeedbackDraft[] {
    const drafts = this.getDrafts();
    const idx = drafts.findIndex((d) => d.courseId === courseId);
    if (idx !== -1) {
      drafts[idx].published = true;
    }
    set(KEYS.FEEDBACK_DRAFTS, drafts);
    return drafts;
  },
};
