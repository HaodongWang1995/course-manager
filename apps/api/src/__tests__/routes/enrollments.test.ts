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

// ── POST /api/enrollments ────────────────────────────

describe("POST /api/enrollments", () => {
  it("returns 401 without auth", async () => {
    const res = await request(app).post("/api/enrollments").send({ course_id: "c-1" });
    expect(res.status).toBe(401);
  });

  it("returns 403 for teacher", async () => {
    const res = await request(app)
      .post("/api/enrollments")
      .set("Authorization", `Bearer ${teacherToken()}`)
      .send({ course_id: "c-1" });
    expect(res.status).toBe(403);
  });

  it("returns 400 when course_id is missing", async () => {
    const res = await request(app)
      .post("/api/enrollments")
      .set("Authorization", `Bearer ${studentToken()}`)
      .send({});
    expect(res.status).toBe(400);
  });

  it("returns 404 when course does not exist", async () => {
    mockPool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });

    const res = await request(app)
      .post("/api/enrollments")
      .set("Authorization", `Bearer ${studentToken()}`)
      .send({ course_id: "non-existent" });
    expect(res.status).toBe(404);
  });

  it("returns 400 when course is not active", async () => {
    mockPool.query.mockResolvedValueOnce({
      rows: [{ id: "c-1", status: "draft", teacher_id: "t-1" }],
      rowCount: 1,
    });

    const res = await request(app)
      .post("/api/enrollments")
      .set("Authorization", `Bearer ${studentToken()}`)
      .send({ course_id: "c-1" });
    expect(res.status).toBe(400);
  });

  it("returns 409 for duplicate enrollment", async () => {
    // Course exists and is active
    mockPool.query.mockResolvedValueOnce({
      rows: [{ id: "c-1", status: "active", teacher_id: "t-1" }],
      rowCount: 1,
    });
    // Check duplicate - found existing
    mockPool.query.mockResolvedValueOnce({
      rows: [{ id: "e-1" }],
      rowCount: 1,
    });

    const res = await request(app)
      .post("/api/enrollments")
      .set("Authorization", `Bearer ${studentToken()}`)
      .send({ course_id: "c-1" });
    expect(res.status).toBe(409);
  });

  it("returns 201 on successful enrollment", async () => {
    // Course exists and is active
    mockPool.query.mockResolvedValueOnce({
      rows: [{ id: "c-1", status: "active", teacher_id: "t-1" }],
      rowCount: 1,
    });
    // No duplicate
    mockPool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
    // Insert enrollment
    mockPool.query.mockResolvedValueOnce({
      rows: [{
        id: "e-1",
        student_id: "s-1",
        course_id: "c-1",
        status: "pending",
        note: "I want to learn",
        created_at: "2024-01-01",
      }],
      rowCount: 1,
    });

    const res = await request(app)
      .post("/api/enrollments")
      .set("Authorization", `Bearer ${studentToken()}`)
      .send({ course_id: "c-1", note: "I want to learn" });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe("pending");
    expect(res.body.course_id).toBe("c-1");
  });

  it("returns 500 on database error", async () => {
    mockPool.query.mockRejectedValueOnce(new Error("DB down"));

    const res = await request(app)
      .post("/api/enrollments")
      .set("Authorization", `Bearer ${studentToken()}`)
      .send({ course_id: "c-1" });
    expect(res.status).toBe(500);
  });
});

// ── GET /api/enrollments ─────────────────────────────

describe("GET /api/enrollments", () => {
  it("returns 401 without auth", async () => {
    const res = await request(app).get("/api/enrollments");
    expect(res.status).toBe(401);
  });

  it("returns student's enrollments with course info", async () => {
    mockPool.query.mockResolvedValueOnce({
      rows: [
        {
          id: "e-1",
          student_id: "s-1",
          course_id: "c-1",
          status: "pending",
          note: null,
          reject_reason: null,
          created_at: "2024-01-01",
          updated_at: "2024-01-01",
          course_title: "Math 101",
          teacher_name: "Mr. T",
        },
      ],
      rowCount: 1,
    });

    const res = await request(app)
      .get("/api/enrollments")
      .set("Authorization", `Bearer ${studentToken()}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].course_title).toBe("Math 101");
    expect(res.body[0].teacher_name).toBe("Mr. T");
  });

  it("supports status filter", async () => {
    mockPool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });

    const res = await request(app)
      .get("/api/enrollments?status=approved")
      .set("Authorization", `Bearer ${studentToken()}`);

    expect(res.status).toBe(200);
    const queryCall = mockPool.query.mock.calls[0];
    expect(queryCall[0]).toContain("e.status");
    expect(queryCall[1]).toContain("approved");
  });

  it("returns empty array when no enrollments", async () => {
    mockPool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });

    const res = await request(app)
      .get("/api/enrollments")
      .set("Authorization", `Bearer ${studentToken()}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("returns 500 on database error", async () => {
    mockPool.query.mockRejectedValueOnce(new Error("DB down"));

    const res = await request(app)
      .get("/api/enrollments")
      .set("Authorization", `Bearer ${studentToken()}`);
    expect(res.status).toBe(500);
  });
});

// ── GET /api/enrollments/course/:courseId ─────────────

describe("GET /api/enrollments/course/:courseId", () => {
  it("returns 401 without auth", async () => {
    const res = await request(app).get("/api/enrollments/course/c-1");
    expect(res.status).toBe(401);
  });

  it("returns 403 for student", async () => {
    const res = await request(app)
      .get("/api/enrollments/course/c-1")
      .set("Authorization", `Bearer ${studentToken()}`);
    expect(res.status).toBe(403);
  });

  it("returns 403 when teacher does not own the course", async () => {
    // Course lookup returns different teacher
    mockPool.query.mockResolvedValueOnce({
      rows: [{ id: "c-1", teacher_id: "other-teacher" }],
      rowCount: 1,
    });

    const res = await request(app)
      .get("/api/enrollments/course/c-1")
      .set("Authorization", `Bearer ${teacherToken("t-1")}`);
    expect(res.status).toBe(403);
  });

  it("returns 404 when course not found", async () => {
    mockPool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });

    const res = await request(app)
      .get("/api/enrollments/course/non-existent")
      .set("Authorization", `Bearer ${teacherToken()}`);
    expect(res.status).toBe(404);
  });

  it("returns enrollments with student info", async () => {
    // Course ownership check
    mockPool.query.mockResolvedValueOnce({
      rows: [{ id: "c-1", teacher_id: "t-1" }],
      rowCount: 1,
    });
    // Enrollments list
    mockPool.query.mockResolvedValueOnce({
      rows: [
        {
          id: "e-1",
          student_id: "s-1",
          course_id: "c-1",
          status: "pending",
          note: "Please enroll me",
          created_at: "2024-01-01",
          student_name: "Alice",
          student_email: "alice@test.com",
        },
      ],
      rowCount: 1,
    });

    const res = await request(app)
      .get("/api/enrollments/course/c-1")
      .set("Authorization", `Bearer ${teacherToken("t-1")}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].student_name).toBe("Alice");
    expect(res.body[0].student_email).toBe("alice@test.com");
  });

  it("supports status filter", async () => {
    mockPool.query.mockResolvedValueOnce({
      rows: [{ id: "c-1", teacher_id: "t-1" }],
      rowCount: 1,
    });
    mockPool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });

    const res = await request(app)
      .get("/api/enrollments/course/c-1?status=pending")
      .set("Authorization", `Bearer ${teacherToken("t-1")}`);

    expect(res.status).toBe(200);
    const queryCall = mockPool.query.mock.calls[1];
    expect(queryCall[0]).toContain("e.status");
    expect(queryCall[1]).toContain("pending");
  });

  it("returns 500 on database error", async () => {
    mockPool.query.mockRejectedValueOnce(new Error("DB down"));

    const res = await request(app)
      .get("/api/enrollments/course/c-1")
      .set("Authorization", `Bearer ${teacherToken()}`);
    expect(res.status).toBe(500);
  });
});

// ── PATCH /api/enrollments/:id/review ────────────────

describe("PATCH /api/enrollments/:id/review", () => {
  it("returns 401 without auth", async () => {
    const res = await request(app)
      .patch("/api/enrollments/e-1/review")
      .send({ status: "approved" });
    expect(res.status).toBe(401);
  });

  it("returns 403 for student", async () => {
    const res = await request(app)
      .patch("/api/enrollments/e-1/review")
      .set("Authorization", `Bearer ${studentToken()}`)
      .send({ status: "approved" });
    expect(res.status).toBe(403);
  });

  it("returns 400 for invalid status", async () => {
    const res = await request(app)
      .patch("/api/enrollments/e-1/review")
      .set("Authorization", `Bearer ${teacherToken()}`)
      .send({ status: "invalid" });
    expect(res.status).toBe(400);
  });

  it("returns 404 when enrollment not found", async () => {
    mockPool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });

    const res = await request(app)
      .patch("/api/enrollments/non-existent/review")
      .set("Authorization", `Bearer ${teacherToken()}`)
      .send({ status: "approved" });
    expect(res.status).toBe(404);
  });

  it("returns 403 when teacher does not own the course", async () => {
    mockPool.query.mockResolvedValueOnce({
      rows: [{
        id: "e-1",
        status: "pending",
        course_id: "c-1",
        teacher_id: "other-teacher",
      }],
      rowCount: 1,
    });

    const res = await request(app)
      .patch("/api/enrollments/e-1/review")
      .set("Authorization", `Bearer ${teacherToken("t-1")}`)
      .send({ status: "approved" });
    expect(res.status).toBe(403);
  });

  it("returns 400 when enrollment is not pending", async () => {
    mockPool.query.mockResolvedValueOnce({
      rows: [{
        id: "e-1",
        status: "approved",
        course_id: "c-1",
        teacher_id: "t-1",
      }],
      rowCount: 1,
    });

    const res = await request(app)
      .patch("/api/enrollments/e-1/review")
      .set("Authorization", `Bearer ${teacherToken("t-1")}`)
      .send({ status: "rejected" });
    expect(res.status).toBe(400);
  });

  it("returns 200 on successful approval", async () => {
    // Enrollment lookup with course ownership
    mockPool.query.mockResolvedValueOnce({
      rows: [{
        id: "e-1",
        status: "pending",
        course_id: "c-1",
        teacher_id: "t-1",
      }],
      rowCount: 1,
    });
    // Update enrollment
    mockPool.query.mockResolvedValueOnce({
      rows: [{
        id: "e-1",
        student_id: "s-1",
        course_id: "c-1",
        status: "approved",
        updated_at: "2024-01-02",
      }],
      rowCount: 1,
    });

    const res = await request(app)
      .patch("/api/enrollments/e-1/review")
      .set("Authorization", `Bearer ${teacherToken("t-1")}`)
      .send({ status: "approved" });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("approved");
  });

  it("returns 200 on rejection with reason", async () => {
    mockPool.query.mockResolvedValueOnce({
      rows: [{
        id: "e-1",
        status: "pending",
        course_id: "c-1",
        teacher_id: "t-1",
      }],
      rowCount: 1,
    });
    mockPool.query.mockResolvedValueOnce({
      rows: [{
        id: "e-1",
        student_id: "s-1",
        course_id: "c-1",
        status: "rejected",
        reject_reason: "Class is full",
        updated_at: "2024-01-02",
      }],
      rowCount: 1,
    });

    const res = await request(app)
      .patch("/api/enrollments/e-1/review")
      .set("Authorization", `Bearer ${teacherToken("t-1")}`)
      .send({ status: "rejected", reject_reason: "Class is full" });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("rejected");
    expect(res.body.reject_reason).toBe("Class is full");
  });

  it("returns 500 on database error", async () => {
    mockPool.query.mockRejectedValueOnce(new Error("DB down"));

    const res = await request(app)
      .patch("/api/enrollments/e-1/review")
      .set("Authorization", `Bearer ${teacherToken()}`)
      .send({ status: "approved" });
    expect(res.status).toBe(500);
  });
});

// ── DELETE /api/enrollments/:id ──────────────────────

describe("DELETE /api/enrollments/:id", () => {
  it("returns 401 without auth", async () => {
    const res = await request(app).delete("/api/enrollments/e-1");
    expect(res.status).toBe(401);
  });

  it("returns 404 when enrollment not found", async () => {
    mockPool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });

    const res = await request(app)
      .delete("/api/enrollments/non-existent")
      .set("Authorization", `Bearer ${studentToken()}`);
    expect(res.status).toBe(404);
  });

  it("returns 403 when student does not own the enrollment", async () => {
    mockPool.query.mockResolvedValueOnce({
      rows: [{ id: "e-1", student_id: "other-student", status: "pending" }],
      rowCount: 1,
    });

    const res = await request(app)
      .delete("/api/enrollments/e-1")
      .set("Authorization", `Bearer ${studentToken("s-1")}`);
    expect(res.status).toBe(403);
  });

  it("returns 400 when enrollment is not pending", async () => {
    mockPool.query.mockResolvedValueOnce({
      rows: [{ id: "e-1", student_id: "s-1", status: "approved" }],
      rowCount: 1,
    });

    const res = await request(app)
      .delete("/api/enrollments/e-1")
      .set("Authorization", `Bearer ${studentToken("s-1")}`);
    expect(res.status).toBe(400);
  });

  it("returns 200 on successful cancellation", async () => {
    mockPool.query.mockResolvedValueOnce({
      rows: [{ id: "e-1", student_id: "s-1", status: "pending" }],
      rowCount: 1,
    });
    mockPool.query.mockResolvedValueOnce({ rows: [], rowCount: 1 });

    const res = await request(app)
      .delete("/api/enrollments/e-1")
      .set("Authorization", `Bearer ${studentToken("s-1")}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("returns 500 on database error", async () => {
    mockPool.query.mockRejectedValueOnce(new Error("DB down"));

    const res = await request(app)
      .delete("/api/enrollments/e-1")
      .set("Authorization", `Bearer ${studentToken()}`);
    expect(res.status).toBe(500);
  });
});
