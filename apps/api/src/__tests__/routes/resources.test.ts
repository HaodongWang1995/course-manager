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

describe("GET /api/courses/:courseId/resources", () => {
  it("returns 401 without auth", async () => {
    const res = await request(app).get("/api/courses/c-1/resources");
    expect(res.status).toBe(401);
  });

  it("returns resource list", async () => {
    mockPool.query.mockResolvedValueOnce({
      rows: [{ id: "r-1", title: "Slides", course_title: "Math" }],
      rowCount: 1,
    });

    const res = await request(app)
      .get("/api/courses/c-1/resources")
      .set("Authorization", `Bearer ${teacherToken()}`);

    expect(res.status).toBe(200);
    expect(res.body[0].title).toBe("Slides");
  });

  it("returns 500 on database error", async () => {
    mockPool.query.mockRejectedValueOnce(new Error("DB down"));

    const res = await request(app)
      .get("/api/courses/c-1/resources")
      .set("Authorization", `Bearer ${teacherToken()}`);

    expect(res.status).toBe(500);
  });
});

describe("POST /api/courses/:courseId/resources", () => {
  it("returns 401 without auth", async () => {
    const res = await request(app)
      .post("/api/courses/c-1/resources")
      .send({ title: "Slides" });
    expect(res.status).toBe(401);
  });

  it("returns 403 for student", async () => {
    const res = await request(app)
      .post("/api/courses/c-1/resources")
      .set("Authorization", `Bearer ${studentToken()}`)
      .send({ title: "Slides" });
    expect(res.status).toBe(403);
  });

  it("returns 404 when course not found", async () => {
    mockPool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });

    const res = await request(app)
      .post("/api/courses/no-id/resources")
      .set("Authorization", `Bearer ${teacherToken()}`)
      .send({ title: "Slides" });

    expect(res.status).toBe(404);
  });

  it("returns 403 when teacher doesn't own course", async () => {
    mockPool.query.mockResolvedValueOnce({ rows: [{ teacher_id: "other" }], rowCount: 1 });

    const res = await request(app)
      .post("/api/courses/c-1/resources")
      .set("Authorization", `Bearer ${teacherToken("t-1")}`)
      .send({ title: "Slides" });

    expect(res.status).toBe(403);
  });

  it("returns 400 when title missing", async () => {
    mockPool.query.mockResolvedValueOnce({ rows: [{ teacher_id: "t-1" }], rowCount: 1 });

    const res = await request(app)
      .post("/api/courses/c-1/resources")
      .set("Authorization", `Bearer ${teacherToken("t-1")}`)
      .send({});

    expect(res.status).toBe(400);
  });

  it("returns 201 on success", async () => {
    mockPool.query
      .mockResolvedValueOnce({ rows: [{ teacher_id: "t-1" }], rowCount: 1 })
      .mockResolvedValueOnce({
        rows: [{ id: "r-new", title: "Slides", course_id: "c-1", featured: false }],
        rowCount: 1,
      });

    const res = await request(app)
      .post("/api/courses/c-1/resources")
      .set("Authorization", `Bearer ${teacherToken("t-1")}`)
      .send({ title: "Slides", file_type: "pdf", featured: true });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe("Slides");
  });

  it("returns 500 on database error", async () => {
    mockPool.query.mockRejectedValueOnce(new Error("DB down"));

    const res = await request(app)
      .post("/api/courses/c-1/resources")
      .set("Authorization", `Bearer ${teacherToken()}`)
      .send({ title: "Slides" });

    expect(res.status).toBe(500);
  });
});

describe("GET /api/students/resources", () => {
  it("returns 401 without auth", async () => {
    const res = await request(app).get("/api/students/resources");
    expect(res.status).toBe(401);
  });

  it("returns featured and non-featured resources", async () => {
    mockPool.query.mockResolvedValueOnce({
      rows: [
        { id: "r-1", title: "Key Slides", featured: true, course_title: "Math" },
        { id: "r-2", title: "Extra", featured: false, course_title: "Math" },
      ],
      rowCount: 2,
    });

    const res = await request(app)
      .get("/api/students/resources")
      .set("Authorization", `Bearer ${studentToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.featured).toHaveLength(1);
    expect(res.body.all).toHaveLength(1);
  });

  it("returns 500 on database error", async () => {
    mockPool.query.mockRejectedValueOnce(new Error("DB down"));

    const res = await request(app)
      .get("/api/students/resources")
      .set("Authorization", `Bearer ${studentToken()}`);

    expect(res.status).toBe(500);
  });
});
