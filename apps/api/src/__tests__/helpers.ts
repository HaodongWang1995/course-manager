import jwt from "jsonwebtoken";
import { vi } from "vitest";
import type { JwtPayload } from "../middleware/auth.js";

const JWT_SECRET = "dev-secret-change-in-production";

export function makeTeacherToken(overrides: Partial<JwtPayload> = {}): string {
  const payload: JwtPayload = {
    userId: "teacher-1",
    email: "teacher@test.com",
    role: "teacher",
    name: "Test Teacher",
    ...overrides,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function makeStudentToken(overrides: Partial<JwtPayload> = {}): string {
  const payload: JwtPayload = {
    userId: "student-1",
    email: "student@test.com",
    role: "student",
    name: "Test Student",
    ...overrides,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function makeExpiredToken(): string {
  const payload: JwtPayload = {
    userId: "user-1",
    email: "expired@test.com",
    role: "teacher",
    name: "Expired User",
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "-1s" });
}

export function mockQueryResult(rows: unknown[] = [], rowCount?: number) {
  return { rows, rowCount: rowCount ?? rows.length, command: "", oid: 0, fields: [] };
}

export function getMockPool() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pool = require("../db.js").default;
  return pool as { query: ReturnType<typeof vi.fn> };
}
