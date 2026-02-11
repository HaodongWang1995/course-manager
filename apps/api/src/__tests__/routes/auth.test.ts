import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import app from "../../app.js";
import pool from "../../db.js";
import bcrypt from "bcryptjs";

const mockPool = pool as unknown as { query: ReturnType<typeof vi.fn> };

beforeEach(() => {
  mockPool.query.mockReset();
});

describe("POST /api/auth/register", () => {
  it("returns 400 when missing required fields", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "a@b.com" });
    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid role", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "a@b.com", password: "123456", name: "A", role: "admin" });
    expect(res.status).toBe(400);
  });

  it("returns 400 for short password", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "a@b.com", password: "123", name: "A", role: "teacher" });
    expect(res.status).toBe(400);
  });

  it("returns 409 when email already exists", async () => {
    mockPool.query.mockResolvedValueOnce({ rows: [{ id: "1" }], rowCount: 1 });
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "dup@test.com", password: "123456", name: "Dup", role: "teacher" });
    expect(res.status).toBe(409);
  });

  it("returns 201 with token on success", async () => {
    mockPool.query
      .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // email check
      .mockResolvedValueOnce({
        rows: [{
          id: "new-1",
          email: "new@test.com",
          name: "New User",
          role: "teacher",
          avatar: null,
          created_at: new Date().toISOString(),
        }],
        rowCount: 1,
      });

    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "new@test.com", password: "123456", name: "New User", role: "teacher" });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe("new@test.com");
  });

  it("returns 500 on database error", async () => {
    mockPool.query.mockRejectedValueOnce(new Error("DB down"));
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "err@test.com", password: "123456", name: "Err", role: "student" });
    expect(res.status).toBe(500);
  });
});

describe("POST /api/auth/login", () => {
  it("returns 400 when missing fields", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "a@b.com" });
    expect(res.status).toBe(400);
  });

  it("returns 401 when user not found", async () => {
    mockPool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "ghost@test.com", password: "123456" });
    expect(res.status).toBe(401);
  });

  it("returns 401 on wrong password", async () => {
    const hash = await bcrypt.hash("correct-pass", 10);
    mockPool.query.mockResolvedValueOnce({
      rows: [{
        id: "1",
        email: "user@test.com",
        password_hash: hash,
        name: "User",
        role: "teacher",
        avatar: null,
      }],
      rowCount: 1,
    });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "user@test.com", password: "wrong-pass" });
    expect(res.status).toBe(401);
  });

  it("returns 200 with token on success", async () => {
    const hash = await bcrypt.hash("mypassword", 10);
    mockPool.query.mockResolvedValueOnce({
      rows: [{
        id: "1",
        email: "user@test.com",
        password_hash: hash,
        name: "User",
        role: "teacher",
        avatar: null,
      }],
      rowCount: 1,
    });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "user@test.com", password: "mypassword" });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe("user@test.com");
    expect(res.body.user).not.toHaveProperty("password_hash");
  });

  it("returns 500 on database error", async () => {
    mockPool.query.mockRejectedValueOnce(new Error("DB down"));
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "err@test.com", password: "123456" });
    expect(res.status).toBe(500);
  });
});

describe("GET /api/auth/me", () => {
  it("returns 401 without auth", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });

  it("returns 404 when user not found in DB", async () => {
    // First, register to get a valid token
    mockPool.query
      .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // email check
      .mockResolvedValueOnce({
        rows: [{ id: "gone-1", email: "gone@test.com", name: "Gone", role: "teacher", avatar: null, created_at: new Date().toISOString() }],
        rowCount: 1,
      });

    const regRes = await request(app)
      .post("/api/auth/register")
      .send({ email: "gone@test.com", password: "123456", name: "Gone", role: "teacher" });
    const token = regRes.body.token;

    // Now /me returns no user
    mockPool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });

    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(404);
  });

  it("returns 200 with user data", async () => {
    // Register to get token
    mockPool.query
      .mockResolvedValueOnce({ rows: [], rowCount: 0 })
      .mockResolvedValueOnce({
        rows: [{ id: "me-1", email: "me@test.com", name: "Me", role: "student", avatar: null, created_at: new Date().toISOString() }],
        rowCount: 1,
      });

    const regRes = await request(app)
      .post("/api/auth/register")
      .send({ email: "me@test.com", password: "123456", name: "Me", role: "student" });
    const token = regRes.body.token;

    mockPool.query.mockResolvedValueOnce({
      rows: [{ id: "me-1", email: "me@test.com", name: "Me", role: "student", avatar: null, created_at: new Date().toISOString() }],
      rowCount: 1,
    });

    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe("me@test.com");
  });

  it("returns 500 on database error", async () => {
    // Register to get token
    mockPool.query
      .mockResolvedValueOnce({ rows: [], rowCount: 0 })
      .mockResolvedValueOnce({
        rows: [{ id: "err-1", email: "err@test.com", name: "Err", role: "teacher", avatar: null, created_at: new Date().toISOString() }],
        rowCount: 1,
      });

    const regRes = await request(app)
      .post("/api/auth/register")
      .send({ email: "err@test.com", password: "123456", name: "Err", role: "teacher" });
    const token = regRes.body.token;

    mockPool.query.mockRejectedValueOnce(new Error("DB down"));

    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(500);
  });
});
