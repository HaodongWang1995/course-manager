import { describe, it, expect, vi, beforeEach } from "vitest";
import jwt from "jsonwebtoken";
import { signToken, authRequired, teacherOnly } from "../../middleware/auth.js";
import type { Request, Response, NextFunction } from "express";

const JWT_SECRET = "dev-secret-change-in-production";

function mockReq(overrides: Partial<Request> = {}): Request {
  return {
    headers: {},
    ...overrides,
  } as Request;
}

function mockRes(): Response {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
  return res;
}

describe("signToken()", () => {
  it("returns a valid JWT string", () => {
    const token = signToken({
      userId: "1",
      email: "test@test.com",
      role: "teacher",
      name: "Test",
    });
    expect(typeof token).toBe("string");
    expect(token.split(".")).toHaveLength(3);
  });

  it("contains the correct payload", () => {
    const payload = {
      userId: "42",
      email: "user@example.com",
      role: "student" as const,
      name: "Alice",
    };
    const token = signToken(payload);
    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
    expect(decoded.userId).toBe("42");
    expect(decoded.email).toBe("user@example.com");
    expect(decoded.role).toBe("student");
    expect(decoded.name).toBe("Alice");
  });

  it("has 7d expiry", () => {
    const token = signToken({
      userId: "1",
      email: "t@t.com",
      role: "teacher",
      name: "T",
    });
    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
    const diff = decoded.exp! - decoded.iat!;
    expect(diff).toBe(7 * 24 * 60 * 60);
  });
});

describe("authRequired()", () => {
  let next: NextFunction;

  beforeEach(() => {
    next = vi.fn();
  });

  it("returns 401 without authorization header", () => {
    const req = mockReq();
    const res = mockRes();
    authRequired(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 401 with non-Bearer header", () => {
    const req = mockReq({ headers: { authorization: "Basic abc" } as any });
    const res = mockRes();
    authRequired(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 401 with invalid token", () => {
    const req = mockReq({ headers: { authorization: "Bearer invalid.token.here" } as any });
    const res = mockRes();
    authRequired(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 401 with expired token", () => {
    const token = jwt.sign(
      { userId: "1", email: "e@e.com", role: "teacher", name: "E" },
      JWT_SECRET,
      { expiresIn: "-1s" }
    );
    const req = mockReq({ headers: { authorization: `Bearer ${token}` } as any });
    const res = mockRes();
    authRequired(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("sets req.user and calls next on valid token", () => {
    const token = signToken({
      userId: "5",
      email: "valid@test.com",
      role: "teacher",
      name: "Valid",
    });
    const req = mockReq({ headers: { authorization: `Bearer ${token}` } as any });
    const res = mockRes();
    authRequired(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user).toBeDefined();
    expect(req.user!.userId).toBe("5");
    expect(req.user!.role).toBe("teacher");
  });
});

describe("teacherOnly()", () => {
  let next: NextFunction;

  beforeEach(() => {
    next = vi.fn();
  });

  it("returns 403 for student role", () => {
    const req = mockReq();
    req.user = { userId: "1", email: "s@s.com", role: "student", name: "S" };
    const res = mockRes();
    teacherOnly(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 403 if no user set", () => {
    const req = mockReq();
    const res = mockRes();
    teacherOnly(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it("calls next for teacher role", () => {
    const req = mockReq();
    req.user = { userId: "1", email: "t@t.com", role: "teacher", name: "T" };
    const res = mockRes();
    teacherOnly(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});
