import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../../app.js";
import pool from "../../db.js";

// Mock the S3/R2 module so tests don't make real cloud calls
vi.mock("../../lib/s3.js", () => ({
  isStubMode: true,
  generateFileKey: vi.fn(
    (scope: string, scopeId: string, filename: string) =>
      `${scope}/${scopeId}/123-${filename}`,
  ),
  createPresignedPutUrl: vi.fn(() => Promise.resolve("stub://upload/test-key")),
  createPresignedGetUrl: vi.fn(() => Promise.resolve("stub://download/test-key")),
  deleteObject: vi.fn(() => Promise.resolve()),
}));

const JWT_SECRET = "dev-secret-change-in-production";
const mockPool = pool as unknown as { query: ReturnType<typeof vi.fn> };

function teacherToken(userId = "t-1") {
  return jwt.sign({ userId, email: "t@t.com", role: "teacher", name: "T" }, JWT_SECRET);
}

function studentToken(userId = "s-1") {
  return jwt.sign({ userId, email: "s@s.com", role: "student", name: "S" }, JWT_SECRET);
}

beforeEach(() => {
  mockPool.query.mockReset();
});

// ── POST /api/attachments/presign ─────────────────────────────────────────────

describe("POST /api/attachments/presign", () => {
  it("returns 401 without auth", async () => {
    const res = await request(app).post("/api/attachments/presign").send({});
    expect(res.status).toBe(401);
  });

  it("returns 403 for students", async () => {
    const res = await request(app)
      .post("/api/attachments/presign")
      .set("Authorization", `Bearer ${studentToken()}`)
      .send({});
    expect(res.status).toBe(403);
  });

  it("returns 400 when filename missing", async () => {
    const res = await request(app)
      .post("/api/attachments/presign")
      .set("Authorization", `Bearer ${teacherToken()}`)
      .send({ content_type: "application/pdf", course_id: "c-1" });
    expect(res.status).toBe(400);
  });

  it("returns 400 when neither course_id nor schedule_id provided", async () => {
    const res = await request(app)
      .post("/api/attachments/presign")
      .set("Authorization", `Bearer ${teacherToken()}`)
      .send({ filename: "test.pdf", content_type: "application/pdf" });
    expect(res.status).toBe(400);
  });

  it("returns 400 for disallowed file type", async () => {
    const res = await request(app)
      .post("/api/attachments/presign")
      .set("Authorization", `Bearer ${teacherToken()}`)
      .send({ filename: "script.sh", content_type: "application/x-sh", course_id: "c-1" });
    expect(res.status).toBe(400);
  });

  it("returns 400 when file_size exceeds 50MB", async () => {
    const res = await request(app)
      .post("/api/attachments/presign")
      .set("Authorization", `Bearer ${teacherToken()}`)
      .send({
        filename: "huge.pdf",
        content_type: "application/pdf",
        file_size: 60 * 1024 * 1024,
        course_id: "c-1",
      });
    expect(res.status).toBe(400);
  });

  it("returns upload_url and file_key on success (course)", async () => {
    const res = await request(app)
      .post("/api/attachments/presign")
      .set("Authorization", `Bearer ${teacherToken()}`)
      .send({
        filename: "lecture.pdf",
        content_type: "application/pdf",
        course_id: "c-1",
      });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("upload_url");
    expect(res.body).toHaveProperty("file_key");
  });

  it("returns upload_url and file_key on success (schedule)", async () => {
    const res = await request(app)
      .post("/api/attachments/presign")
      .set("Authorization", `Bearer ${teacherToken()}`)
      .send({
        filename: "notes.pdf",
        content_type: "application/pdf",
        schedule_id: "s-1",
      });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("upload_url");
  });
});

// ── POST /api/attachments/confirm ────────────────────────────────────────────

describe("POST /api/attachments/confirm", () => {
  it("returns 401 without auth", async () => {
    const res = await request(app).post("/api/attachments/confirm").send({});
    expect(res.status).toBe(401);
  });

  it("returns 403 for students", async () => {
    const res = await request(app)
      .post("/api/attachments/confirm")
      .set("Authorization", `Bearer ${studentToken()}`)
      .send({});
    expect(res.status).toBe(403);
  });

  it("returns 400 when file_key missing", async () => {
    const res = await request(app)
      .post("/api/attachments/confirm")
      .set("Authorization", `Bearer ${teacherToken()}`)
      .send({ filename: "test.pdf", course_id: "c-1" });
    expect(res.status).toBe(400);
  });

  it("returns 400 when no parent id", async () => {
    const res = await request(app)
      .post("/api/attachments/confirm")
      .set("Authorization", `Bearer ${teacherToken()}`)
      .send({ file_key: "courses/c-1/123-test.pdf", filename: "test.pdf" });
    expect(res.status).toBe(400);
  });

  it("returns 201 on success", async () => {
    mockPool.query.mockResolvedValueOnce({
      rows: [
        {
          id: "a-1",
          course_id: "c-1",
          filename: "lecture.pdf",
          file_key: "courses/c-1/123-lecture.pdf",
          file_type: "application/pdf",
          file_size: 102400,
          created_at: new Date().toISOString(),
        },
      ],
      rowCount: 1,
    });

    const res = await request(app)
      .post("/api/attachments/confirm")
      .set("Authorization", `Bearer ${teacherToken("t-1")}`)
      .send({
        file_key: "courses/c-1/123-lecture.pdf",
        filename: "lecture.pdf",
        file_size: 102400,
        file_type: "application/pdf",
        course_id: "c-1",
      });

    expect(res.status).toBe(201);
    expect(res.body.filename).toBe("lecture.pdf");
  });

  it("returns 500 on DB error", async () => {
    mockPool.query.mockRejectedValueOnce(new Error("DB down"));

    const res = await request(app)
      .post("/api/attachments/confirm")
      .set("Authorization", `Bearer ${teacherToken()}`)
      .send({
        file_key: "courses/c-1/123.pdf",
        filename: "test.pdf",
        course_id: "c-1",
      });
    expect(res.status).toBe(500);
  });
});

// ── GET /api/courses/:id/attachments ─────────────────────────────────────────

describe("GET /api/courses/:id/attachments", () => {
  it("returns 401 without auth", async () => {
    const res = await request(app).get("/api/courses/c-1/attachments");
    expect(res.status).toBe(401);
  });

  it("returns attachment list with download_url", async () => {
    mockPool.query.mockResolvedValueOnce({
      rows: [
        {
          id: "a-1",
          filename: "notes.pdf",
          file_key: "courses/c-1/123-notes.pdf",
          file_type: "application/pdf",
          file_size: 5000,
        },
      ],
      rowCount: 1,
    });

    const res = await request(app)
      .get("/api/courses/c-1/attachments")
      .set("Authorization", `Bearer ${teacherToken()}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0]).toHaveProperty("download_url");
  });

  it("returns 500 on DB error", async () => {
    mockPool.query.mockRejectedValueOnce(new Error("DB down"));

    const res = await request(app)
      .get("/api/courses/c-1/attachments")
      .set("Authorization", `Bearer ${teacherToken()}`);
    expect(res.status).toBe(500);
  });
});

// ── GET /api/schedules/:id/attachments ───────────────────────────────────────

describe("GET /api/schedules/:id/attachments", () => {
  it("returns 401 without auth", async () => {
    const res = await request(app).get("/api/schedules/s-1/attachments");
    expect(res.status).toBe(401);
  });

  it("returns attachment list for schedule", async () => {
    mockPool.query.mockResolvedValueOnce({
      rows: [
        {
          id: "a-2",
          filename: "handout.pdf",
          file_key: "schedules/s-1/456-handout.pdf",
          file_type: "application/pdf",
          file_size: 3000,
        },
      ],
      rowCount: 1,
    });

    const res = await request(app)
      .get("/api/schedules/s-1/attachments")
      .set("Authorization", `Bearer ${studentToken()}`);

    expect(res.status).toBe(200);
    expect(res.body[0].filename).toBe("handout.pdf");
    expect(res.body[0]).toHaveProperty("download_url");
  });
});

// ── DELETE /api/attachments/:id ──────────────────────────────────────────────

describe("DELETE /api/attachments/:id", () => {
  it("returns 401 without auth", async () => {
    const res = await request(app).delete("/api/attachments/a-1");
    expect(res.status).toBe(401);
  });

  it("returns 403 for students", async () => {
    const res = await request(app)
      .delete("/api/attachments/a-1")
      .set("Authorization", `Bearer ${studentToken()}`);
    expect(res.status).toBe(403);
  });

  it("returns 404 when attachment not found or not owned", async () => {
    mockPool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });

    const res = await request(app)
      .delete("/api/attachments/a-1")
      .set("Authorization", `Bearer ${teacherToken()}`);
    expect(res.status).toBe(404);
  });

  it("returns 200 on success", async () => {
    mockPool.query
      .mockResolvedValueOnce({
        rows: [{ id: "a-1", file_key: "courses/c-1/123-notes.pdf" }],
        rowCount: 1,
      })
      .mockResolvedValueOnce({ rows: [], rowCount: 1 });

    const res = await request(app)
      .delete("/api/attachments/a-1")
      .set("Authorization", `Bearer ${teacherToken("t-1")}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("returns 500 on DB error", async () => {
    mockPool.query.mockRejectedValueOnce(new Error("DB down"));

    const res = await request(app)
      .delete("/api/attachments/a-1")
      .set("Authorization", `Bearer ${teacherToken()}`);
    expect(res.status).toBe(500);
  });
});
