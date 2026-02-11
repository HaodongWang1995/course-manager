import { describe, it, expect, beforeEach } from "vitest";
import {
  seedIfNeeded,
  auth,
  teacherScheduleStore,
  teacherCoursesStore,
  teacherStudentsStore,
  feedbackStore,
  studentAssignmentsStore,
  studentScheduleStore,
  studentGradesStore,
  studentResourcesStore,
  calendarStore,
  reportsStore,
} from "../../api/storage.js";

beforeEach(() => {
  localStorage.clear();
});

describe("seedIfNeeded()", () => {
  it("seeds data on first call", () => {
    seedIfNeeded();
    expect(localStorage.getItem("cm_seeded")).toBe("1");
    expect(localStorage.getItem("cm_teacher_courses")).not.toBeNull();
  });

  it("does not re-seed on second call", () => {
    seedIfNeeded();
    const firstCourses = localStorage.getItem("cm_teacher_courses");
    // Manually change to detect re-seed
    localStorage.setItem("cm_teacher_courses", "[]");
    seedIfNeeded();
    expect(localStorage.getItem("cm_teacher_courses")).toBe("[]");
  });
});

describe("auth", () => {
  it("get() returns null when not logged in", () => {
    expect(auth.get()).toBeNull();
  });

  it("login() stores auth state", () => {
    const state = auth.login("test@test.com", "teacher");
    expect(state.isLoggedIn).toBe(true);
    expect(state.role).toBe("teacher");
    expect(state.email).toBe("test@test.com");
  });

  it("get() returns stored auth state", () => {
    auth.login("student@test.com", "student");
    const state = auth.get();
    expect(state).not.toBeNull();
    expect(state!.role).toBe("student");
  });

  it("logout() removes auth state", () => {
    auth.login("test@test.com", "teacher");
    auth.logout();
    expect(auth.get()).toBeNull();
  });
});

describe("teacherCoursesStore", () => {
  beforeEach(() => seedIfNeeded());

  it("getAll() returns seeded courses", () => {
    const courses = teacherCoursesStore.getAll();
    expect(courses.length).toBeGreaterThan(0);
  });

  it("add() appends a course", () => {
    const before = teacherCoursesStore.getAll().length;
    teacherCoursesStore.add({
      code: "NEW101",
      title: "New Course",
      students: 0,
      status: "Active",
      category: "Test",
    } as any);
    expect(teacherCoursesStore.getAll().length).toBe(before + 1);
  });

  it("update() modifies an existing course", () => {
    const courses = teacherCoursesStore.getAll();
    const code = courses[0].code;
    teacherCoursesStore.update(code, { title: "Updated Title" });
    const updated = teacherCoursesStore.getAll().find((c) => c.code === code);
    expect(updated!.title).toBe("Updated Title");
  });

  it("remove() deletes a course by code", () => {
    const courses = teacherCoursesStore.getAll();
    const code = courses[0].code;
    const before = courses.length;
    teacherCoursesStore.remove(code);
    expect(teacherCoursesStore.getAll().length).toBe(before - 1);
  });

  it("nextCode() returns incrementing codes", () => {
    const c1 = teacherCoursesStore.nextCode();
    const c2 = teacherCoursesStore.nextCode();
    expect(c1).not.toBe(c2);
    expect(c1).toMatch(/^NEW\d+$/);
  });
});

describe("teacherStudentsStore", () => {
  beforeEach(() => seedIfNeeded());

  it("getAll() returns seeded students", () => {
    expect(teacherStudentsStore.getAll().length).toBeGreaterThan(0);
  });

  it("add() appends a student", () => {
    const before = teacherStudentsStore.getAll().length;
    teacherStudentsStore.add({ id: "new-s", name: "New Student" } as any);
    expect(teacherStudentsStore.getAll().length).toBe(before + 1);
  });

  it("update() modifies an existing student", () => {
    const students = teacherStudentsStore.getAll();
    const id = students[0].id;
    teacherStudentsStore.update(id, { name: "Updated Name" } as any);
    const updated = teacherStudentsStore.getAll().find((s) => s.id === id);
    expect((updated as any).name).toBe("Updated Name");
  });

  it("remove() deletes a student", () => {
    const students = teacherStudentsStore.getAll();
    const id = students[0].id;
    teacherStudentsStore.remove(id);
    expect(teacherStudentsStore.getAll().find((s) => s.id === id)).toBeUndefined();
  });
});

describe("feedbackStore", () => {
  beforeEach(() => seedIfNeeded());

  it("getDrafts() returns empty initially", () => {
    expect(feedbackStore.getDrafts()).toEqual([]);
  });

  it("saveDraft() creates a new draft", () => {
    feedbackStore.saveDraft({
      courseId: "c-1",
      requirementsText: "req",
      feedbackText: "fb",
      assignmentTitle: "HW1",
      dueDate: "2024-01-01",
      published: false,
    });
    expect(feedbackStore.getDrafts()).toHaveLength(1);
  });

  it("getDraft() retrieves draft by courseId", () => {
    feedbackStore.saveDraft({
      courseId: "c-2",
      requirementsText: "req",
      feedbackText: "fb",
      assignmentTitle: "HW2",
      dueDate: "2024-02-01",
      published: false,
    });
    const draft = feedbackStore.getDraft("c-2");
    expect(draft).not.toBeNull();
    expect(draft!.assignmentTitle).toBe("HW2");
  });

  it("getDraft() returns null for unknown courseId", () => {
    expect(feedbackStore.getDraft("nonexistent")).toBeNull();
  });

  it("saveDraft() updates existing draft", () => {
    feedbackStore.saveDraft({
      courseId: "c-3",
      requirementsText: "v1",
      feedbackText: "v1",
      assignmentTitle: "HW3",
      dueDate: "2024-03-01",
      published: false,
    });
    feedbackStore.saveDraft({
      courseId: "c-3",
      requirementsText: "v2",
      feedbackText: "v2",
      assignmentTitle: "HW3",
      dueDate: "2024-03-01",
      published: false,
    });
    expect(feedbackStore.getDrafts()).toHaveLength(1);
    expect(feedbackStore.getDraft("c-3")!.requirementsText).toBe("v2");
  });

  it("publish() marks draft as published", () => {
    feedbackStore.saveDraft({
      courseId: "c-4",
      requirementsText: "req",
      feedbackText: "fb",
      assignmentTitle: "HW4",
      dueDate: "2024-04-01",
      published: false,
    });
    feedbackStore.publish("c-4");
    expect(feedbackStore.getDraft("c-4")!.published).toBe(true);
  });
});

describe("studentAssignmentsStore", () => {
  beforeEach(() => seedIfNeeded());

  it("getAll() returns seeded assignments", () => {
    expect(studentAssignmentsStore.getAll().length).toBeGreaterThan(0);
  });

  it("updateStatus() changes assignment status", () => {
    const assignments = studentAssignmentsStore.getAll();
    const id = assignments[0].id;
    studentAssignmentsStore.updateStatus(id, "completed");
    const updated = studentAssignmentsStore.getAll().find((a) => a.id === id);
    expect((updated as any).status).toBe("completed");
  });
});

describe("calendarStore", () => {
  beforeEach(() => seedIfNeeded());

  it("addEvent() adds event to a day", () => {
    calendarStore.addEvent(15, "New Event");
    const events = calendarStore.getEvents();
    expect(events[15]).toContain("New Event");
  });

  it("addDeadline() appends deadline", () => {
    const before = calendarStore.getDeadlines().length;
    calendarStore.addDeadline({ title: "New Deadline", date: "2024-05-01", course: "Math" } as any);
    expect(calendarStore.getDeadlines().length).toBe(before + 1);
  });

  it("removeDeadline() removes by title", () => {
    calendarStore.addDeadline({ title: "To Remove", date: "2024-06-01", course: "Sci" } as any);
    calendarStore.removeDeadline("To Remove");
    expect(calendarStore.getDeadlines().find((d) => d.title === "To Remove")).toBeUndefined();
  });
});

describe("reportsStore", () => {
  beforeEach(() => seedIfNeeded());

  it("addGenerated() prepends report", () => {
    const before = reportsStore.getGenerated().length;
    reportsStore.addGenerated({ id: "r-new", title: "New Report" } as any);
    const after = reportsStore.getGenerated();
    expect(after.length).toBe(before + 1);
    expect((after[0] as any).id).toBe("r-new");
  });

  it("getKPIs() returns seeded KPIs", () => {
    expect(reportsStore.getKPIs().length).toBeGreaterThan(0);
  });

  it("getPerformance() returns seeded performance data", () => {
    expect(reportsStore.getPerformance().length).toBeGreaterThan(0);
  });

  it("getAttendance() returns seeded attendance data", () => {
    expect(reportsStore.getAttendance().length).toBeGreaterThan(0);
  });

  it("getGenerated() returns seeded reports", () => {
    expect(reportsStore.getGenerated().length).toBeGreaterThan(0);
  });
});

describe("teacherScheduleStore", () => {
  beforeEach(() => seedIfNeeded());

  it("getAll() returns seeded schedule items", () => {
    expect(teacherScheduleStore.getAll().length).toBeGreaterThan(0);
  });

  it("update() modifies a schedule item", () => {
    const items = teacherScheduleStore.getAll();
    const id = items[0].id;
    teacherScheduleStore.update(id, { title: "Updated Lesson" } as any);
    const updated = teacherScheduleStore.getAll().find((i) => i.id === id);
    expect((updated as any).title).toBe("Updated Lesson");
  });
});

describe("studentScheduleStore", () => {
  beforeEach(() => seedIfNeeded());

  it("getAll() returns seeded student schedule", () => {
    expect(studentScheduleStore.getAll().length).toBeGreaterThan(0);
  });
});

describe("studentGradesStore", () => {
  beforeEach(() => seedIfNeeded());

  it("get() returns seeded grades", () => {
    const grades = studentGradesStore.get();
    expect(grades).toBeDefined();
  });
});

describe("studentResourcesStore", () => {
  beforeEach(() => seedIfNeeded());

  it("get() returns seeded resources", () => {
    const resources = studentResourcesStore.get();
    expect(resources).toBeDefined();
  });
});

describe("feedbackStore (getDetail)", () => {
  beforeEach(() => seedIfNeeded());

  it("getDetail() returns seeded feedback detail", () => {
    const detail = feedbackStore.getDetail();
    expect(detail).toBeDefined();
  });
});

describe("localStorage error handling", () => {
  it("get() returns fallback on corrupt JSON", () => {
    // Set seeded flag so seedIfNeeded won't overwrite
    localStorage.setItem("cm_seeded", "1");
    // Write corrupt JSON to a key
    localStorage.setItem("cm_teacher_courses", "{invalid json");
    const courses = teacherCoursesStore.getAll();
    // Should return fallback (empty array) since JSON.parse fails
    expect(courses).toEqual([]);
  });
});
