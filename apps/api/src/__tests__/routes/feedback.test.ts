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

describe("GET /api/feedback/course/:courseId", () => {
  it("returns 401 without auth", async () => {
    const res = await request(app).get("/api/feedback/course/c-1");
    expect(res.status).toBe(401);
  });

  it("returns null when no feedback exists", async () => {
    mockPool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });

    const res = await request(app)
      .get("/api/feedback/course/c-1")
      .set("Authorization", `Bearer ${studentToken()}`);

    expect(res.status).toBe(200);
    expect(res.body).toBeNull();
  });

  it("returns feedback with actions", async () => {
    mockPool.query
      .mockResolvedValueOnce({
        rows: [{ id: "f-1", course_id: "c-1", summary: "Great class", published: true, course_title: "Math", teacher_name: "Prof T" }],
        rowCount: 1,
      })
      .mockResolvedValueOnce({
        rows: [{ id: "act-1", title: "Review notes", due_label: "Sunday", pending: true }],
        rowCount: 1,
      });

    const res = await request(app)
      .get("/api/feedback/course/c-1")
      .set("Authorization", `Bearer ${studentToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.summary).toBe("Great class");
    expect(res.body.actions).toHaveLength(1);
  });

  it("returns 500 on database error", async () => {
    mockPool.query.mockRejectedValueOnce(new Error("DB down"));

    const res = await request(app)
      .get("/api/feedback/course/c-1")
      .set("Authorization", `Bearer ${teacherToken()}`);

    expect(res.status).toBe(500);
  });
});

describe("POST /api/feedback", () => {
  it("returns 401 without auth", async () => {
    const res = await request(app)
      .post("/api/feedback")
      .send({ course_id: "c-1" });
    expect(res.status).toBe(401);
  });

  it("returns 403 for student", async () => {
    const res = await request(app)
      .post("/api/feedback")
      .set("Authorization", `Bearer ${studentToken()}`)
      .send({ course_id: "c-1" });
    expect(res.status).toBe(403);
  });

  it("returns 400 when course_id missing", async () => {
    const res = await request(app)
      .post("/api/feedback")
      .set("Authorization", `Bearer ${teacherToken()}`)
      .send({ summary: "Good class" });
    expect(res.status).toBe(400);
  });

  it("returns 403 when teacher doesn't own course", async () => {
    mockPool.query.mockResolvedValueOnce({ rows: [{ teacher_id: "other" }], rowCount: 1 });

    const res = await request(app)
      .post("/api/feedback")
      .set("Authorization", `Bearer ${teacherToken("t-1")}`)
      .send({ course_id: "c-1" });

    expect(res.status).toBe(403);
  });

  it("returns 403 when course not found", async () => {
    mockPool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });

    const res = await request(app)
      .post("/api/feedback")
      .set("Authorization", `Bearer ${teacherToken()}`)
      .send({ course_id: "no-id" });

    expect(res.status).toBe(403);
  });

  it("creates new feedback (insert path)", async () => {
    // No actions in payload → no DELETE/INSERT feedback_actions calls
    mockPool.query
      .mockResolvedValueOnce({ rows: [{ teacher_id: "t-1" }], rowCount: 1 }) // course check
      .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // no existing feedback
      .mockResolvedValueOnce({ rows: [{ id: "f-new" }], rowCount: 1 }) // insert
      .mockResolvedValueOnce({ rows: [{ id: "f-new", summary: "Nice session", published: false, requirements: [] }], rowCount: 1 }) // full feedback
      .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // actions

    const res = await request(app)
      .post("/api/feedback")
      .set("Authorization", `Bearer ${teacherToken("t-1")}`)
      .send({ course_id: "c-1", summary: "Nice session" });

    expect(res.status).toBe(200);
    expect(res.body.summary).toBe("Nice session");
  });

  it("updates existing feedback (update path)", async () => {
    // No actions in payload → no DELETE/INSERT feedback_actions calls
    mockPool.query
      .mockResolvedValueOnce({ rows: [{ teacher_id: "t-1" }], rowCount: 1 }) // course check
      .mockResolvedValueOnce({ rows: [{ id: "f-existing" }], rowCount: 1 }) // existing feedback
      .mockResolvedValueOnce({ rows: [], rowCount: 1 }) // update
      .mockResolvedValueOnce({ rows: [{ id: "f-existing", summary: "Updated", published: false, requirements: [] }], rowCount: 1 }) // full feedback
      .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // actions

    const res = await request(app)
      .post("/api/feedback")
      .set("Authorization", `Bearer ${teacherToken("t-1")}`)
      .send({ course_id: "c-1", summary: "Updated" });

    expect(res.status).toBe(200);
  });

  it("inserts actions when provided", async () => {
    mockPool.query
      .mockResolvedValueOnce({ rows: [{ teacher_id: "t-1" }], rowCount: 1 })
      .mockResolvedValueOnce({ rows: [], rowCount: 0 })
      .mockResolvedValueOnce({ rows: [{ id: "f-new" }], rowCount: 1 })
      .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // delete actions
      .mockResolvedValueOnce({ rows: [], rowCount: 1 }) // insert action 1
      .mockResolvedValueOnce({ rows: [{ id: "f-new", summary: null, published: false, requirements: [] }], rowCount: 1 })
      .mockResolvedValueOnce({ rows: [{ id: "act-1", title: "Review", pending: true }], rowCount: 1 });

    const res = await request(app)
      .post("/api/feedback")
      .set("Authorization", `Bearer ${teacherToken("t-1")}`)
      .send({ course_id: "c-1", actions: [{ title: "Review", pending: true }] });

    expect(res.status).toBe(200);
  });

  it("returns 500 on database error", async () => {
    mockPool.query.mockRejectedValueOnce(new Error("DB down"));

    const res = await request(app)
      .post("/api/feedback")
      .set("Authorization", `Bearer ${teacherToken()}`)
      .send({ course_id: "c-1" });

    expect(res.status).toBe(500);
  });
});

describe("PATCH /api/feedback/:id/publish", () => {
  it("returns 401 without auth", async () => {
    const res = await request(app).patch("/api/feedback/f-1/publish");
    expect(res.status).toBe(401);
  });

  it("returns 403 for student", async () => {
    const res = await request(app)
      .patch("/api/feedback/f-1/publish")
      .set("Authorization", `Bearer ${studentToken()}`);
    expect(res.status).toBe(403);
  });

  it("returns 404 when feedback not found or not owned", async () => {
    mockPool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });

    const res = await request(app)
      .patch("/api/feedback/no-id/publish")
      .set("Authorization", `Bearer ${teacherToken()}`);

    expect(res.status).toBe(404);
  });

  it("returns 200 on success", async () => {
    mockPool.query.mockResolvedValueOnce({
      rows: [{ id: "f-1", published: true }],
      rowCount: 1,
    });

    const res = await request(app)
      .patch("/api/feedback/f-1/publish")
      .set("Authorization", `Bearer ${teacherToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.published).toBe(true);
  });

  it("returns 500 on database error", async () => {
    mockPool.query.mockRejectedValueOnce(new Error("DB down"));

    const res = await request(app)
      .patch("/api/feedback/f-1/publish")
      .set("Authorization", `Bearer ${teacherToken()}`);

    expect(res.status).toBe(500);
  });
});
