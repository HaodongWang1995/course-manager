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

function studentToken() {
  return jwt.sign({ userId: "s-1", email: "s@s.com", role: "student", name: "S" }, JWT_SECRET, { expiresIn: "7d" });
}

beforeEach(() => {
  mockPool.query.mockReset();
});

describe("GET /api/courses/:courseId/schedules", () => {
  it("returns 401 without auth", async () => {
    const res = await request(app).get("/api/courses/c-1/schedules");
    expect(res.status).toBe(401);
  });

  it("returns schedules for a course", async () => {
    mockPool.query.mockResolvedValueOnce({
      rows: [
        { id: "s-1", course_id: "c-1", lesson_number: 1, title: "Lesson 1" },
        { id: "s-2", course_id: "c-1", lesson_number: 2, title: "Lesson 2" },
      ],
      rowCount: 2,
    });

    const res = await request(app)
      .get("/api/courses/c-1/schedules")
      .set("Authorization", `Bearer ${teacherToken()}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });
});

describe("POST /api/courses/:courseId/schedules", () => {
  it("returns 403 for student", async () => {
    const res = await request(app)
      .post("/api/courses/c-1/schedules")
      .set("Authorization", `Bearer ${studentToken()}`)
      .send({ start_time: "2024-01-01T09:00:00", end_time: "2024-01-01T10:00:00" });
    expect(res.status).toBe(403);
  });

  it("returns 404 when course not found", async () => {
    mockPool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });

    const res = await request(app)
      .post("/api/courses/no-id/schedules")
      .set("Authorization", `Bearer ${teacherToken()}`)
      .send({ start_time: "2024-01-01T09:00:00", end_time: "2024-01-01T10:00:00" });
    expect(res.status).toBe(404);
  });

  it("returns 403 when teacher doesn't own the course", async () => {
    mockPool.query.mockResolvedValueOnce({
      rows: [{ teacher_id: "other" }],
      rowCount: 1,
    });

    const res = await request(app)
      .post("/api/courses/c-1/schedules")
      .set("Authorization", `Bearer ${teacherToken("t-1")}`)
      .send({ start_time: "2024-01-01T09:00:00", end_time: "2024-01-01T10:00:00" });
    expect(res.status).toBe(403);
  });

  it("returns 400 when missing time fields", async () => {
    mockPool.query.mockResolvedValueOnce({
      rows: [{ teacher_id: "t-1" }],
      rowCount: 1,
    });

    const res = await request(app)
      .post("/api/courses/c-1/schedules")
      .set("Authorization", `Bearer ${teacherToken("t-1")}`)
      .send({ title: "No time" });
    expect(res.status).toBe(400);
  });

  it("returns 201 on success", async () => {
    mockPool.query
      .mockResolvedValueOnce({ rows: [{ teacher_id: "t-1" }], rowCount: 1 })
      .mockResolvedValueOnce({
        rows: [{
          id: "new-s",
          course_id: "c-1",
          lesson_number: 1,
          title: "New Lesson",
          start_time: "2024-01-01T09:00:00",
          end_time: "2024-01-01T10:00:00",
          room: "A101",
        }],
        rowCount: 1,
      });

    const res = await request(app)
      .post("/api/courses/c-1/schedules")
      .set("Authorization", `Bearer ${teacherToken("t-1")}`)
      .send({
        title: "New Lesson",
        start_time: "2024-01-01T09:00:00",
        end_time: "2024-01-01T10:00:00",
        room: "A101",
      });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe("New Lesson");
  });
});

describe("PUT /api/schedules/:id", () => {
  it("returns 404 when schedule not found", async () => {
    mockPool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });

    const res = await request(app)
      .put("/api/schedules/no-id")
      .set("Authorization", `Bearer ${teacherToken()}`)
      .send({ title: "Updated" });
    expect(res.status).toBe(404);
  });

  it("returns 403 when teacher doesn't own the schedule's course", async () => {
    mockPool.query.mockResolvedValueOnce({
      rows: [{ id: "s-1", teacher_id: "other" }],
      rowCount: 1,
    });

    const res = await request(app)
      .put("/api/schedules/s-1")
      .set("Authorization", `Bearer ${teacherToken("t-1")}`)
      .send({ title: "Updated" });
    expect(res.status).toBe(403);
  });

  it("returns 200 on success", async () => {
    mockPool.query
      .mockResolvedValueOnce({
        rows: [{ id: "s-1", teacher_id: "t-1" }],
        rowCount: 1,
      })
      .mockResolvedValueOnce({
        rows: [{ id: "s-1", title: "Updated", lesson_number: 1 }],
        rowCount: 1,
      });

    const res = await request(app)
      .put("/api/schedules/s-1")
      .set("Authorization", `Bearer ${teacherToken("t-1")}`)
      .send({ title: "Updated" });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe("Updated");
  });
});

describe("DELETE /api/schedules/:id", () => {
  it("returns 404 when schedule not found", async () => {
    mockPool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });

    const res = await request(app)
      .delete("/api/schedules/no-id")
      .set("Authorization", `Bearer ${teacherToken()}`);
    expect(res.status).toBe(404);
  });

  it("returns 403 when teacher doesn't own the schedule's course", async () => {
    mockPool.query.mockResolvedValueOnce({
      rows: [{ id: "s-1", teacher_id: "other" }],
      rowCount: 1,
    });

    const res = await request(app)
      .delete("/api/schedules/s-1")
      .set("Authorization", `Bearer ${teacherToken("t-1")}`);
    expect(res.status).toBe(403);
  });

  it("returns 200 on successful delete", async () => {
    mockPool.query
      .mockResolvedValueOnce({
        rows: [{ id: "s-1", teacher_id: "t-1" }],
        rowCount: 1,
      })
      .mockResolvedValueOnce({ rows: [], rowCount: 1 });

    const res = await request(app)
      .delete("/api/schedules/s-1")
      .set("Authorization", `Bearer ${teacherToken("t-1")}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("returns 500 on database error", async () => {
    mockPool.query.mockRejectedValueOnce(new Error("DB down"));

    const res = await request(app)
      .delete("/api/schedules/s-1")
      .set("Authorization", `Bearer ${teacherToken()}`);
    expect(res.status).toBe(500);
  });
});

describe("GET /api/courses/:courseId/schedules (error handling)", () => {
  it("returns 500 on database error", async () => {
    mockPool.query.mockRejectedValueOnce(new Error("DB down"));

    const res = await request(app)
      .get("/api/courses/c-1/schedules")
      .set("Authorization", `Bearer ${teacherToken()}`);
    expect(res.status).toBe(500);
  });
});

describe("POST /api/courses/:courseId/schedules (error handling)", () => {
  it("returns 500 on database error", async () => {
    mockPool.query.mockRejectedValueOnce(new Error("DB down"));

    const res = await request(app)
      .post("/api/courses/c-1/schedules")
      .set("Authorization", `Bearer ${teacherToken()}`)
      .send({ start_time: "2024-01-01T09:00:00", end_time: "2024-01-01T10:00:00" });
    expect(res.status).toBe(500);
  });
});

describe("PUT /api/schedules/:id (error handling)", () => {
  it("returns 500 on database error", async () => {
    mockPool.query.mockRejectedValueOnce(new Error("DB down"));

    const res = await request(app)
      .put("/api/schedules/s-1")
      .set("Authorization", `Bearer ${teacherToken()}`)
      .send({ title: "Fail" });
    expect(res.status).toBe(500);
  });
});

describe("GET /api/health", () => {
  it("returns 200 with status ok", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body.timestamp).toBeDefined();
  });
});
