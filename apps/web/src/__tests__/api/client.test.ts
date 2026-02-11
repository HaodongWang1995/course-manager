import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getToken, setToken, clearToken, authApi, courseApi, scheduleApi } from "../../api/client.js";

// Mock fetch globally
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

// Mock window.location
const mockLocation = { href: "" };
Object.defineProperty(window, "location", {
  value: mockLocation,
  writable: true,
});

beforeEach(() => {
  localStorage.clear();
  mockFetch.mockReset();
  mockLocation.href = "";
});

describe("Token management", () => {
  it("getToken returns null when no token set", () => {
    expect(getToken()).toBeNull();
  });

  it("setToken stores and getToken retrieves", () => {
    setToken("my-token");
    expect(getToken()).toBe("my-token");
  });

  it("clearToken removes the token", () => {
    setToken("my-token");
    clearToken();
    expect(getToken()).toBeNull();
  });

  it("uses cm_token key in localStorage", () => {
    setToken("test-token");
    expect(localStorage.getItem("cm_token")).toBe("test-token");
  });
});

describe("request helper (via authApi)", () => {
  it("sets Content-Type header", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ id: "1" }),
    });

    await authApi.me();

    const [, options] = mockFetch.mock.calls[0];
    expect(options.headers["Content-Type"]).toBe("application/json");
  });

  it("injects Authorization header when token exists", async () => {
    setToken("bearer-test");
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ id: "1" }),
    });

    await authApi.me();

    const [, options] = mockFetch.mock.calls[0];
    expect(options.headers["Authorization"]).toBe("Bearer bearer-test");
  });

  it("does not inject Authorization without token", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ id: "1" }),
    });

    await authApi.me();

    const [, options] = mockFetch.mock.calls[0];
    expect(options.headers["Authorization"]).toBeUndefined();
  });

  it("redirects to /login on 401", async () => {
    setToken("expired");
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ error: "Unauthorized" }),
    });

    await expect(authApi.me()).rejects.toThrow();
    expect(getToken()).toBeNull();
    expect(mockLocation.href).toBe("/login");
  });

  it("throws ApiError on non-ok response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ error: "Server error" }),
    });

    await expect(authApi.me()).rejects.toThrow("Server error");
  });

  it("uses fallback message when response has no error field", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 422,
      json: () => Promise.resolve({}),
    });

    await expect(authApi.me()).rejects.toThrow("请求失败");
  });
});

describe("authApi", () => {
  it("register sends POST with body", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: () => Promise.resolve({ token: "t", user: { id: "1" } }),
    });

    const result = await authApi.register({
      email: "a@b.com",
      password: "123456",
      name: "A",
      role: "teacher",
    });

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain("/api/auth/register");
    expect(options.method).toBe("POST");
    expect(result.token).toBe("t");
  });

  it("login sends POST with body", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ token: "t", user: { id: "1" } }),
    });

    await authApi.login({ email: "a@b.com", password: "123456" });

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain("/api/auth/login");
    expect(options.method).toBe("POST");
  });

  it("me sends GET", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ id: "1", email: "a@b.com" }),
    });

    await authApi.me();

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain("/api/auth/me");
    expect(options.method).toBeUndefined(); // GET is default
  });
});

describe("courseApi", () => {
  it("get sends GET with course id", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ id: "c-1", title: "Course" }),
    });

    const result = await courseApi.get("c-1");

    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain("/api/courses/c-1");
    expect(result.title).toBe("Course");
  });

  it("update sends PUT with body", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ id: "c-1", title: "Updated" }),
    });

    await courseApi.update("c-1", { title: "Updated" });

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain("/api/courses/c-1");
    expect(options.method).toBe("PUT");
    expect(JSON.parse(options.body)).toEqual({ title: "Updated" });
  });

  it("list builds query string from params", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve([]),
    });

    await courseApi.list({ search: "math", category: "science" });

    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain("search=math");
    expect(url).toContain("category=science");
  });

  it("list with status param includes it in query string", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve([]),
    });

    await courseApi.list({ status: "active" });

    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain("status=active");
  });

  it("list without params sends no query string", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve([]),
    });

    await courseApi.list();

    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain("/api/courses");
    expect(url).not.toContain("?");
  });

  it("create sends POST", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: () => Promise.resolve({ id: "1", title: "Test" }),
    });

    await courseApi.create({ title: "Test" });

    const [, options] = mockFetch.mock.calls[0];
    expect(options.method).toBe("POST");
  });

  it("delete sends DELETE", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ success: true }),
    });

    await courseApi.delete("c-1");

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain("/api/courses/c-1");
    expect(options.method).toBe("DELETE");
  });

  it("updateStatus sends PATCH", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ id: "c-1", status: "archived" }),
    });

    await courseApi.updateStatus("c-1", "archived");

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain("/api/courses/c-1/status");
    expect(options.method).toBe("PATCH");
  });
});

describe("scheduleApi", () => {
  it("list sends GET with courseId", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve([]),
    });

    await scheduleApi.list("c-1");

    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain("/api/courses/c-1/schedules");
  });

  it("create sends POST", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: () => Promise.resolve({ id: "s-1" }),
    });

    await scheduleApi.create("c-1", {
      start_time: "2024-01-01T09:00",
      end_time: "2024-01-01T10:00",
    });

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain("/api/courses/c-1/schedules");
    expect(options.method).toBe("POST");
  });

  it("update sends PUT", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ id: "s-1" }),
    });

    await scheduleApi.update("s-1", { title: "Updated" });

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain("/api/schedules/s-1");
    expect(options.method).toBe("PUT");
  });

  it("delete sends DELETE", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ success: true }),
    });

    await scheduleApi.delete("s-1");

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain("/api/schedules/s-1");
    expect(options.method).toBe("DELETE");
  });
});
