import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../../app.js";
import pool from "../../db.js";

const JWT_SECRET = "dev-secret-change-in-production";
const mockPool = pool as unknown as { query: ReturnType<typeof vi.fn> };

function teacherToken(userId = "t-1") {
  return jwt.sign({ userId, email: "t@t.com", role: "teacher", name: "T" }, JWT_SECRET, { expiresIn: "7d" });
}

function studentToken(userId = "s-1") {
  return jwt.sign({ userId, email: "s@s.com", role: "student", name: "S" }, JWT_SECRET, { expiresIn: "7d" });
}

beforeEach(() => {
  mockPool.query.mockReset();
});

describe("GET /api/courses", () => {
  it("returns active courses without auth (public browse)", async () => {
    // GET /api/courses uses attachUser (optional auth) — public users see active courses
    mockPool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
    const res = await request(app).get("/api/courses");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("returns teacher's own courses", async () => {
    mockPool.query.mockResolvedValueOnce({
      rows: [{ id: "c-1", title: "Math 101", teacher_id: "t-1" }],
      rowCount: 1,
    });

    const res = await request(app)
      .get("/api/courses")
      .set("Authorization", `Bearer ${teacherToken()}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe("Math 101");
  });

  it("returns active courses for student", async () => {
    mockPool.query.mockResolvedValueOnce({
      rows: [{ id: "c-1", title: "Active Course", status: "active" }],
      rowCount: 1,
    });

    const res = await request(app)
      .get("/api/courses")
      .set("Authorization", `Bearer ${studentToken()}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  it("supports search parameter", async () => {
    mockPool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });

    const res = await request(app)
      .get("/api/courses?search=math")
      .set("Authorization", `Bearer ${teacherToken()}`);

    expect(res.status).toBe(200);
    // Verify search param was included in query
    const queryCall = mockPool.query.mock.calls[0];
    expect(queryCall[0]).toContain("ILIKE");
    expect(queryCall[1]).toContain("%math%");
  });

  it("supports category filter", async () => {
    mockPool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });

    await request(app)
      .get("/api/courses?category=science")
      .set("Authorization", `Bearer ${teacherToken()}`);

    const queryCall = mockPool.query.mock.calls[0];
    expect(queryCall[0]).toContain("category");
    expect(queryCall[1]).toContain("science");
  });

  it("supports status filter for teacher", async () => {
    mockPool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });

    await request(app)
      .get("/api/courses?status=draft")
      .set("Authorization", `Bearer ${teacherToken()}`);

    const queryCall = mockPool.query.mock.calls[0];
    expect(queryCall[0]).toContain("status");
    expect(queryCall[1]).toContain("draft");
  });

  it("ignores status filter for student", async () => {
    mockPool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });

    await request(app)
      .get("/api/courses?status=draft")
      .set("Authorization", `Bearer ${studentToken()}`);

    const queryCall = mockPool.query.mock.calls[0];
    // Status param should NOT be in query params for student
    expect(queryCall[1]).not.toContain("draft");
  });
});

describe("GET /api/courses/:id", () => {
  it("returns 404 when course not found", async () => {
    mockPool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });

    const res = await request(app)
      .get("/api/courses/non-existent")
      .set("Authorization", `Bearer ${teacherToken()}`);
    expect(res.status).toBe(404);
  });

  it("returns 403 when teacher doesn't own the course", async () => {
    mockPool.query.mockResolvedValueOnce({
      rows: [{ id: "c-1", teacher_id: "other-teacher", status: "active", teacher_name: "Other" }],
      rowCount: 1,
    });

    const res = await request(app)
      .get("/api/courses/c-1")
      .set("Authorization", `Bearer ${teacherToken("t-1")}`);
    expect(res.status).toBe(403);
  });

  it("returns 403 when student accesses non-active course", async () => {
    mockPool.query.mockResolvedValueOnce({
      rows: [{ id: "c-1", teacher_id: "t-1", status: "draft", teacher_name: "T" }],
      rowCount: 1,
    });

    const res = await request(app)
      .get("/api/courses/c-1")
      .set("Authorization", `Bearer ${studentToken()}`);
    expect(res.status).toBe(403);
  });

  it("returns course with schedules for teacher owner", async () => {
    mockPool.query
      .mockResolvedValueOnce({
        rows: [{ id: "c-1", teacher_id: "t-1", title: "My Course", status: "active", teacher_name: "T" }],
        rowCount: 1,
      })
      .mockResolvedValueOnce({
        rows: [{ id: "s-1", course_id: "c-1", lesson_number: 1, title: "Lesson 1" }],
        rowCount: 1,
      });

    const res = await request(app)
      .get("/api/courses/c-1")
      .set("Authorization", `Bearer ${teacherToken("t-1")}`);

    expect(res.status).toBe(200);
    expect(res.body.title).toBe("My Course");
    expect(res.body.schedules).toHaveLength(1);
  });

  it("returns active course for student", async () => {
    mockPool.query
      .mockResolvedValueOnce({
        rows: [{ id: "c-1", teacher_id: "t-1", title: "Active", status: "active", teacher_name: "T" }],
        rowCount: 1,
      })
      .mockResolvedValueOnce({ rows: [], rowCount: 0 });

    const res = await request(app)
      .get("/api/courses/c-1")
      .set("Authorization", `Bearer ${studentToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.title).toBe("Active");
  });
});

describe("POST /api/courses", () => {
  it("returns 403 for student", async () => {
    const res = await request(app)
      .post("/api/courses")
      .set("Authorization", `Bearer ${studentToken()}`)
      .send({ title: "Test" });
    expect(res.status).toBe(403);
  });

  it("returns 400 when title is missing", async () => {
    const res = await request(app)
      .post("/api/courses")
      .set("Authorization", `Bearer ${teacherToken()}`)
      .send({ description: "No title" });
    expect(res.status).toBe(400);
  });

  it("returns 201 on success", async () => {
    mockPool.query.mockResolvedValueOnce({
      rows: [{ id: "new-c", teacher_id: "t-1", title: "New Course", status: "active" }],
      rowCount: 1,
    });

    const res = await request(app)
      .post("/api/courses")
      .set("Authorization", `Bearer ${teacherToken()}`)
      .send({ title: "New Course", description: "Desc", price: 100 });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe("New Course");
  });
});

describe("PUT /api/courses/:id", () => {
  it("returns 404 when course not found", async () => {
    mockPool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });

    const res = await request(app)
      .put("/api/courses/no-id")
      .set("Authorization", `Bearer ${teacherToken()}`)
      .send({ title: "Updated" });
    expect(res.status).toBe(404);
  });

  it("returns 403 when teacher doesn't own the course", async () => {
    mockPool.query.mockResolvedValueOnce({
      rows: [{ teacher_id: "other" }],
      rowCount: 1,
    });

    const res = await request(app)
      .put("/api/courses/c-1")
      .set("Authorization", `Bearer ${teacherToken("t-1")}`)
      .send({ title: "Updated" });
    expect(res.status).toBe(403);
  });

  it("returns 200 on success", async () => {
    mockPool.query
      .mockResolvedValueOnce({ rows: [{ teacher_id: "t-1" }], rowCount: 1 })
      .mockResolvedValueOnce({
        rows: [{ id: "c-1", title: "Updated", teacher_id: "t-1" }],
        rowCount: 1,
      });

    const res = await request(app)
      .put("/api/courses/c-1")
      .set("Authorization", `Bearer ${teacherToken("t-1")}`)
      .send({ title: "Updated" });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe("Updated");
  });

  it("returns 500 on database error", async () => {
    mockPool.query.mockRejectedValueOnce(new Error("DB down"));

    const res = await request(app)
      .put("/api/courses/c-1")
      .set("Authorization", `Bearer ${teacherToken()}`)
      .send({ title: "Fail" });
    expect(res.status).toBe(500);
  });
});

describe("DELETE /api/courses/:id", () => {
  it("returns 404 when course not found", async () => {
    mockPool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });

    const res = await request(app)
      .delete("/api/courses/no-id")
      .set("Authorization", `Bearer ${teacherToken()}`);
    expect(res.status).toBe(404);
  });

  it("returns 403 when teacher doesn't own the course", async () => {
    mockPool.query.mockResolvedValueOnce({
      rows: [{ teacher_id: "other" }],
      rowCount: 1,
    });

    const res = await request(app)
      .delete("/api/courses/c-1")
      .set("Authorization", `Bearer ${teacherToken("t-1")}`);
    expect(res.status).toBe(403);
  });

  it("returns 200 on successful delete", async () => {
    mockPool.query
      .mockResolvedValueOnce({ rows: [{ teacher_id: "t-1" }], rowCount: 1 })
      .mockResolvedValueOnce({ rows: [], rowCount: 1 });

    const res = await request(app)
      .delete("/api/courses/c-1")
      .set("Authorization", `Bearer ${teacherToken("t-1")}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("returns 500 on database error", async () => {
    mockPool.query.mockRejectedValueOnce(new Error("DB down"));

    const res = await request(app)
      .delete("/api/courses/c-1")
      .set("Authorization", `Bearer ${teacherToken()}`);
    expect(res.status).toBe(500);
  });
});

describe("PATCH /api/courses/:id/status", () => {
  it("returns 400 for invalid status", async () => {
    const res = await request(app)
      .patch("/api/courses/c-1/status")
      .set("Authorization", `Bearer ${teacherToken()}`)
      .send({ status: "invalid" });
    expect(res.status).toBe(400);
  });

  it("returns 404 when course not found", async () => {
    mockPool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });

    const res = await request(app)
      .patch("/api/courses/no-id/status")
      .set("Authorization", `Bearer ${teacherToken()}`)
      .send({ status: "draft" });
    expect(res.status).toBe(404);
  });

  it("returns 403 when teacher doesn't own the course", async () => {
    mockPool.query.mockResolvedValueOnce({
      rows: [{ teacher_id: "other" }],
      rowCount: 1,
    });

    const res = await request(app)
      .patch("/api/courses/c-1/status")
      .set("Authorization", `Bearer ${teacherToken("t-1")}`)
      .send({ status: "archived" });
    expect(res.status).toBe(403);
  });

  it("returns 200 on success", async () => {
    mockPool.query
      .mockResolvedValueOnce({ rows: [{ teacher_id: "t-1" }], rowCount: 1 })
      .mockResolvedValueOnce({
        rows: [{ id: "c-1", status: "archived", teacher_id: "t-1" }],
        rowCount: 1,
      });

    const res = await request(app)
      .patch("/api/courses/c-1/status")
      .set("Authorization", `Bearer ${teacherToken("t-1")}`)
      .send({ status: "archived" });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("archived");
  });

  it("returns 500 on database error", async () => {
    mockPool.query.mockRejectedValueOnce(new Error("DB down"));

    const res = await request(app)
      .patch("/api/courses/c-1/status")
      .set("Authorization", `Bearer ${teacherToken()}`)
      .send({ status: "active" });
    expect(res.status).toBe(500);
  });
});

describe("GET /api/courses (error handling)", () => {
  it("returns 500 on database error", async () => {
    mockPool.query.mockRejectedValueOnce(new Error("DB down"));

    const res = await request(app)
      .get("/api/courses")
      .set("Authorization", `Bearer ${teacherToken()}`);
    expect(res.status).toBe(500);
  });
});

describe("GET /api/courses/:id (error handling)", () => {
  it("returns 500 on database error", async () => {
    mockPool.query.mockRejectedValueOnce(new Error("DB down"));

    const res = await request(app)
      .get("/api/courses/c-1")
      .set("Authorization", `Bearer ${teacherToken()}`);
    expect(res.status).toBe(500);
  });
});

describe("POST /api/courses (error handling)", () => {
  it("returns 500 on database error", async () => {
    mockPool.query.mockRejectedValueOnce(new Error("DB down"));

    const res = await request(app)
      .post("/api/courses")
      .set("Authorization", `Bearer ${teacherToken()}`)
      .send({ title: "Fail" });
    expect(res.status).toBe(500);
  });
});
