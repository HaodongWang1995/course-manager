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

describe("GET /api/teachers/students", () => {
  it("returns 401 without auth", async () => {
    const res = await request(app).get("/api/teachers/students");
    expect(res.status).toBe(401);
  });

  it("returns 403 for student", async () => {
    const res = await request(app)
      .get("/api/teachers/students")
      .set("Authorization", `Bearer ${studentToken()}`);
    expect(res.status).toBe(403);
  });

  it("returns enrolled students list", async () => {
    mockPool.query.mockResolvedValueOnce({
      rows: [
        { id: "s-1", name: "Alice", email: "alice@test.com", courses: ["Math"], course_count: 1 },
      ],
      rowCount: 1,
    });

    const res = await request(app)
      .get("/api/teachers/students")
      .set("Authorization", `Bearer ${teacherToken()}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe("Alice");
  });

  it("returns 500 on database error", async () => {
    mockPool.query.mockRejectedValueOnce(new Error("DB down"));

    const res = await request(app)
      .get("/api/teachers/students")
      .set("Authorization", `Bearer ${teacherToken()}`);

    expect(res.status).toBe(500);
  });
});

describe("GET /api/teachers/schedule", () => {
  it("returns 401 without auth", async () => {
    const res = await request(app).get("/api/teachers/schedule");
    expect(res.status).toBe(401);
  });

  it("returns schedule list", async () => {
    mockPool.query.mockResolvedValueOnce({
      rows: [{ id: "sch-1", course_title: "Math", start_time: "2024-01-01T10:00:00Z", student_count: 5 }],
      rowCount: 1,
    });

    const res = await request(app)
      .get("/api/teachers/schedule")
      .set("Authorization", `Bearer ${teacherToken()}`);

    expect(res.status).toBe(200);
    expect(res.body[0].course_title).toBe("Math");
  });

  it("returns 500 on database error", async () => {
    mockPool.query.mockRejectedValueOnce(new Error("DB down"));

    const res = await request(app)
      .get("/api/teachers/schedule")
      .set("Authorization", `Bearer ${teacherToken()}`);

    expect(res.status).toBe(500);
  });
});

describe("GET /api/teachers/stats", () => {
  it("returns 401 without auth", async () => {
    const res = await request(app).get("/api/teachers/stats");
    expect(res.status).toBe(401);
  });

  it("returns stats object", async () => {
    mockPool.query.mockResolvedValueOnce({
      rows: [{ course_count: "3", active_courses: "2", student_count: "10", pending_enrollments: "1", schedule_count: "6" }],
      rowCount: 1,
    });

    const res = await request(app)
      .get("/api/teachers/stats")
      .set("Authorization", `Bearer ${teacherToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.course_count).toBe("3");
  });

  it("returns 500 on database error", async () => {
    mockPool.query.mockRejectedValueOnce(new Error("DB down"));

    const res = await request(app)
      .get("/api/teachers/stats")
      .set("Authorization", `Bearer ${teacherToken()}`);

    expect(res.status).toBe(500);
  });
});

describe("GET /api/teachers/deadlines", () => {
  it("returns 401 without auth", async () => {
    const res = await request(app).get("/api/teachers/deadlines");
    expect(res.status).toBe(401);
  });

  it("returns deadlines list", async () => {
    mockPool.query.mockResolvedValueOnce({
      rows: [{ id: "d-1", title: "Submit grades", due_date: "2024-12-01", urgent: false }],
      rowCount: 1,
    });

    const res = await request(app)
      .get("/api/teachers/deadlines")
      .set("Authorization", `Bearer ${teacherToken()}`);

    expect(res.status).toBe(200);
    expect(res.body[0].title).toBe("Submit grades");
  });

  it("returns 500 on database error", async () => {
    mockPool.query.mockRejectedValueOnce(new Error("DB down"));

    const res = await request(app)
      .get("/api/teachers/deadlines")
      .set("Authorization", `Bearer ${teacherToken()}`);

    expect(res.status).toBe(500);
  });
});

describe("POST /api/teachers/deadlines", () => {
  it("returns 401 without auth", async () => {
    const res = await request(app).post("/api/teachers/deadlines").send({ title: "X", due_date: "2024-12-01" });
    expect(res.status).toBe(401);
  });

  it("returns 403 for student", async () => {
    const res = await request(app)
      .post("/api/teachers/deadlines")
      .set("Authorization", `Bearer ${studentToken()}`)
      .send({ title: "X", due_date: "2024-12-01" });
    expect(res.status).toBe(403);
  });

  it("returns 400 when title missing", async () => {
    const res = await request(app)
      .post("/api/teachers/deadlines")
      .set("Authorization", `Bearer ${teacherToken()}`)
      .send({ due_date: "2024-12-01" });
    expect(res.status).toBe(400);
  });

  it("returns 400 when due_date missing", async () => {
    const res = await request(app)
      .post("/api/teachers/deadlines")
      .set("Authorization", `Bearer ${teacherToken()}`)
      .send({ title: "Something" });
    expect(res.status).toBe(400);
  });

  it("returns 201 on success", async () => {
    mockPool.query.mockResolvedValueOnce({
      rows: [{ id: "d-1", title: "Submit grades", due_date: "2024-12-01", urgent: false }],
      rowCount: 1,
    });

    const res = await request(app)
      .post("/api/teachers/deadlines")
      .set("Authorization", `Bearer ${teacherToken()}`)
      .send({ title: "Submit grades", due_date: "2024-12-01", urgent: true });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe("Submit grades");
  });

  it("returns 500 on database error", async () => {
    mockPool.query.mockRejectedValueOnce(new Error("DB down"));

    const res = await request(app)
      .post("/api/teachers/deadlines")
      .set("Authorization", `Bearer ${teacherToken()}`)
      .send({ title: "Fail", due_date: "2024-12-01" });

    expect(res.status).toBe(500);
  });
});

describe("DELETE /api/teachers/deadlines/:id", () => {
  it("returns 401 without auth", async () => {
    const res = await request(app).delete("/api/teachers/deadlines/d-1");
    expect(res.status).toBe(401);
  });

  it("returns 404 when deadline not found or not owned", async () => {
    mockPool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });

    const res = await request(app)
      .delete("/api/teachers/deadlines/d-1")
      .set("Authorization", `Bearer ${teacherToken()}`);

    expect(res.status).toBe(404);
  });

  it("returns 200 on success", async () => {
    mockPool.query.mockResolvedValueOnce({ rows: [{ id: "d-1" }], rowCount: 1 });

    const res = await request(app)
      .delete("/api/teachers/deadlines/d-1")
      .set("Authorization", `Bearer ${teacherToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("returns 500 on database error", async () => {
    mockPool.query.mockRejectedValueOnce(new Error("DB down"));

    const res = await request(app)
      .delete("/api/teachers/deadlines/d-1")
      .set("Authorization", `Bearer ${teacherToken()}`);

    expect(res.status).toBe(500);
  });
});
