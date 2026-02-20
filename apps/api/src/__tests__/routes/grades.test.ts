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

describe("POST /api/grades", () => {
  it("returns 401 without auth", async () => {
    const res = await request(app)
      .post("/api/grades")
      .send({ course_id: "c-1", student_id: "s-1", type: "midterm", score: 85 });
    expect(res.status).toBe(401);
  });

  it("returns 403 for student", async () => {
    const res = await request(app)
      .post("/api/grades")
      .set("Authorization", `Bearer ${studentToken()}`)
      .send({ course_id: "c-1", student_id: "s-1", type: "midterm", score: 85 });
    expect(res.status).toBe(403);
  });

  it("returns 400 when required fields missing", async () => {
    const res = await request(app)
      .post("/api/grades")
      .set("Authorization", `Bearer ${teacherToken()}`)
      .send({ course_id: "c-1" }); // missing student_id, type, score
    expect(res.status).toBe(400);
  });

  it("returns 403 when teacher doesn't own course", async () => {
    mockPool.query.mockResolvedValueOnce({
      rows: [{ teacher_id: "other-teacher" }],
      rowCount: 1,
    });

    const res = await request(app)
      .post("/api/grades")
      .set("Authorization", `Bearer ${teacherToken("t-1")}`)
      .send({ course_id: "c-1", student_id: "s-1", type: "midterm", score: 85 });

    expect(res.status).toBe(403);
  });

  it("returns 403 when course not found", async () => {
    mockPool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });

    const res = await request(app)
      .post("/api/grades")
      .set("Authorization", `Bearer ${teacherToken()}`)
      .send({ course_id: "no-id", student_id: "s-1", type: "midterm", score: 85 });

    expect(res.status).toBe(403);
  });

  it("returns 201 on success", async () => {
    mockPool.query
      .mockResolvedValueOnce({ rows: [{ teacher_id: "t-1" }], rowCount: 1 })
      .mockResolvedValueOnce({
        rows: [{ id: "g-1", course_id: "c-1", student_id: "s-1", type: "midterm", score: 85, max_score: 100 }],
        rowCount: 1,
      });

    const res = await request(app)
      .post("/api/grades")
      .set("Authorization", `Bearer ${teacherToken("t-1")}`)
      .send({ course_id: "c-1", student_id: "s-1", type: "midterm", score: 85 });

    expect(res.status).toBe(201);
    expect(res.body.score).toBe(85);
  });

  it("returns 500 on database error", async () => {
    mockPool.query.mockRejectedValueOnce(new Error("DB down"));

    const res = await request(app)
      .post("/api/grades")
      .set("Authorization", `Bearer ${teacherToken()}`)
      .send({ course_id: "c-1", student_id: "s-1", type: "midterm", score: 85 });

    expect(res.status).toBe(500);
  });
});

describe("GET /api/grades/students/grades", () => {
  it("returns 401 without auth", async () => {
    const res = await request(app).get("/api/grades/students/grades");
    expect(res.status).toBe(401);
  });

  it("returns empty grades summary when no grades", async () => {
    mockPool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });

    const res = await request(app)
      .get("/api/grades/students/grades")
      .set("Authorization", `Bearer ${studentToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.courses).toEqual([]);
    expect(res.body.gpa).toBe("2.0");
    expect(res.body.completion).toBe("0%");
  });

  it("computes grades summary with midterm and final", async () => {
    mockPool.query.mockResolvedValueOnce({
      rows: [
        { course_id: "c-1", type: "midterm", label: "Mid", score: "90", max_score: "100", course_title: "Math", teacher_name: "Prof T" },
        { course_id: "c-1", type: "final", label: "Final", score: "80", max_score: "100", course_title: "Math", teacher_name: "Prof T" },
      ],
      rowCount: 2,
    });

    const res = await request(app)
      .get("/api/grades/students/grades")
      .set("Authorization", `Bearer ${studentToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.courses).toHaveLength(1);
    expect(res.body.courses[0].name).toBe("Math");
    expect(res.body.courses[0].midterm).toBe("90");
    expect(res.body.courses[0].final).toBe("80");
    expect(res.body.chartData).toHaveLength(1);
  });

  it("returns 500 on database error", async () => {
    mockPool.query.mockRejectedValueOnce(new Error("DB down"));

    const res = await request(app)
      .get("/api/grades/students/grades")
      .set("Authorization", `Bearer ${studentToken()}`);

    expect(res.status).toBe(500);
  });
});
