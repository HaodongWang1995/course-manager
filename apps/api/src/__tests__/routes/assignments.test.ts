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

describe("GET /api/courses/:courseId/assignments", () => {
  it("returns 401 without auth", async () => {
    const res = await request(app).get("/api/courses/c-1/assignments");
    expect(res.status).toBe(401);
  });

  it("returns assignment list", async () => {
    mockPool.query.mockResolvedValueOnce({
      rows: [{ id: "a-1", title: "HW1", course_id: "c-1", course_title: "Math" }],
      rowCount: 1,
    });

    const res = await request(app)
      .get("/api/courses/c-1/assignments")
      .set("Authorization", `Bearer ${teacherToken()}`);

    expect(res.status).toBe(200);
    expect(res.body[0].title).toBe("HW1");
  });

  it("returns 500 on database error", async () => {
    mockPool.query.mockRejectedValueOnce(new Error("DB down"));

    const res = await request(app)
      .get("/api/courses/c-1/assignments")
      .set("Authorization", `Bearer ${teacherToken()}`);

    expect(res.status).toBe(500);
  });
});

describe("POST /api/courses/:courseId/assignments", () => {
  it("returns 401 without auth", async () => {
    const res = await request(app)
      .post("/api/courses/c-1/assignments")
      .send({ title: "HW1", due_date: "2024-12-01" });
    expect(res.status).toBe(401);
  });

  it("returns 403 for student", async () => {
    const res = await request(app)
      .post("/api/courses/c-1/assignments")
      .set("Authorization", `Bearer ${studentToken()}`)
      .send({ title: "HW1", due_date: "2024-12-01" });
    expect(res.status).toBe(403);
  });

  it("returns 404 when course not found", async () => {
    mockPool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });

    const res = await request(app)
      .post("/api/courses/no-id/assignments")
      .set("Authorization", `Bearer ${teacherToken()}`)
      .send({ title: "HW1", due_date: "2024-12-01" });

    expect(res.status).toBe(404);
  });

  it("returns 403 when teacher does not own course", async () => {
    mockPool.query.mockResolvedValueOnce({ rows: [{ teacher_id: "other-teacher" }], rowCount: 1 });

    const res = await request(app)
      .post("/api/courses/c-1/assignments")
      .set("Authorization", `Bearer ${teacherToken("t-1")}`)
      .send({ title: "HW1", due_date: "2024-12-01" });

    expect(res.status).toBe(403);
  });

  it("returns 400 when title or due_date missing", async () => {
    mockPool.query.mockResolvedValueOnce({ rows: [{ teacher_id: "t-1" }], rowCount: 1 });

    const res = await request(app)
      .post("/api/courses/c-1/assignments")
      .set("Authorization", `Bearer ${teacherToken()}`)
      .send({ title: "HW1" }); // missing due_date

    expect(res.status).toBe(400);
  });

  it("returns 201 on success", async () => {
    mockPool.query
      .mockResolvedValueOnce({ rows: [{ teacher_id: "t-1" }], rowCount: 1 })
      .mockResolvedValueOnce({
        rows: [{ id: "a-new", title: "HW1", course_id: "c-1", due_date: "2024-12-01" }],
        rowCount: 1,
      });

    const res = await request(app)
      .post("/api/courses/c-1/assignments")
      .set("Authorization", `Bearer ${teacherToken("t-1")}`)
      .send({ title: "HW1", due_date: "2024-12-01" });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe("HW1");
  });

  it("returns 500 on database error", async () => {
    mockPool.query.mockRejectedValueOnce(new Error("DB down"));

    const res = await request(app)
      .post("/api/courses/c-1/assignments")
      .set("Authorization", `Bearer ${teacherToken()}`)
      .send({ title: "HW1", due_date: "2024-12-01" });

    expect(res.status).toBe(500);
  });
});

describe("GET /api/students/assignments", () => {
  it("returns 401 without auth", async () => {
    const res = await request(app).get("/api/students/assignments");
    expect(res.status).toBe(401);
  });

  it("returns student assignment list", async () => {
    mockPool.query.mockResolvedValueOnce({
      rows: [{ id: "a-1", title: "HW1", course_title: "Math", submission_status: "pending" }],
      rowCount: 1,
    });

    const res = await request(app)
      .get("/api/students/assignments")
      .set("Authorization", `Bearer ${studentToken()}`);

    expect(res.status).toBe(200);
    expect(res.body[0].submission_status).toBe("pending");
  });

  it("returns 500 on database error", async () => {
    mockPool.query.mockRejectedValueOnce(new Error("DB down"));

    const res = await request(app)
      .get("/api/students/assignments")
      .set("Authorization", `Bearer ${studentToken()}`);

    expect(res.status).toBe(500);
  });
});

describe("PATCH /api/assignments/:id/submit", () => {
  it("returns 401 without auth", async () => {
    const res = await request(app)
      .patch("/api/assignments/a-1/submit")
      .send({ status: "submitted" });
    expect(res.status).toBe(401);
  });

  it("returns 400 for invalid status", async () => {
    const res = await request(app)
      .patch("/api/assignments/a-1/submit")
      .set("Authorization", `Bearer ${studentToken()}`)
      .send({ status: "cheated" });
    expect(res.status).toBe(400);
  });

  it("returns 400 when status missing", async () => {
    const res = await request(app)
      .patch("/api/assignments/a-1/submit")
      .set("Authorization", `Bearer ${studentToken()}`)
      .send({});
    expect(res.status).toBe(400);
  });

  it("accepts submitted status", async () => {
    mockPool.query.mockResolvedValueOnce({
      rows: [{ assignment_id: "a-1", student_id: "s-1", status: "submitted" }],
      rowCount: 1,
    });

    const res = await request(app)
      .patch("/api/assignments/a-1/submit")
      .set("Authorization", `Bearer ${studentToken()}`)
      .send({ status: "submitted" });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("submitted");
  });

  it("accepts late status", async () => {
    mockPool.query.mockResolvedValueOnce({
      rows: [{ assignment_id: "a-1", student_id: "s-1", status: "late" }],
      rowCount: 1,
    });

    const res = await request(app)
      .patch("/api/assignments/a-1/submit")
      .set("Authorization", `Bearer ${studentToken()}`)
      .send({ status: "late" });

    expect(res.status).toBe(200);
  });

  it("returns 500 on database error", async () => {
    mockPool.query.mockRejectedValueOnce(new Error("DB down"));

    const res = await request(app)
      .patch("/api/assignments/a-1/submit")
      .set("Authorization", `Bearer ${studentToken()}`)
      .send({ status: "submitted" });

    expect(res.status).toBe(500);
  });
});
