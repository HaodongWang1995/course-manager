import { vi } from "vitest";

// Mock the pg pool globally
vi.mock("../db.js", () => {
  const mockPool = {
    query: vi.fn(),
    connect: vi.fn(),
    end: vi.fn(),
    on: vi.fn(),
  };
  return { default: mockPool };
});
