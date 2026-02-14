import { test, expect } from "@playwright/test";

const API_URL =
  process.env.E2E_API_URL ||
  process.env.VITE_API_URL ||
  "http://localhost:3001";

async function registerOrLogin(request: Parameters<typeof test>[0]["request"], data: { name: string; email: string; password: string; role: "teacher" | "student" }) {
  const register = await request.post(`${API_URL}/api/auth/register`, { data });
  if (register.status() === 201) {
    const body = await register.json();
    return body as { token: string; user: { id: string; name: string; email: string; role: string } };
  }

  const login = await request.post(`${API_URL}/api/auth/login`, {
    data: { email: data.email, password: data.password },
  });
  if (!login.ok()) {
    const text = await login.text();
    throw new Error(`Login failed: ${login.status()} ${text}`);
  }
  const body = await login.json();
  return body as { token: string; user: { id: string; name: string; email: string; role: string } };
}

async function createCourse(request: Parameters<typeof test>[0]["request"], token: string, payload: { title: string; description?: string; price?: number; category?: string; status?: string }) {
  const res = await request.post(`${API_URL}/api/courses`, {
    data: payload,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok()) {
    const text = await res.text();
    throw new Error(`Create course failed: ${res.status()} ${text}`);
  }
  return (await res.json()) as { id: string; title: string };
}

test.describe("PRD E2E", () => {
  test("Public user can browse active courses and view details", async ({ page, request }) => {
    const teacher = await registerOrLogin(request, {
      name: "E2E Teacher",
      email: `teacher.e2e+${Date.now()}@example.com`,
      password: "password123",
      role: "teacher",
    });

    const courseTitle = `E2E Public Course ${Date.now()}`;
    const course = await createCourse(request, teacher.token, {
      title: courseTitle,
      description: "Public course for PRD E2E",
      price: 199,
      category: "数学",
      status: "active",
    });

    await page.goto("/courses");
    await expect(page.getByText(courseTitle)).toBeVisible();

    await page.getByText(courseTitle).click();
    await expect(page).toHaveURL(`/courses/${course.id}`);
    await expect(page.getByRole("heading", { name: courseTitle })).toBeVisible();
  });

  test("Teacher can log in and create a course from UI", async ({ page, request }) => {
    const teacher = await registerOrLogin(request, {
      name: "UI Teacher",
      email: `teacher.ui+${Date.now()}@example.com`,
      password: "password123",
      role: "teacher",
    });

    await page.goto("/login");

    await page.getByLabel("邮箱").fill(teacher.user.email);
    await page.getByLabel("密码").fill("password123");
    await page.getByRole("button", { name: "登录" }).nth(1).click();

    await expect(page).toHaveURL(/\/teacher/);
    await page.goto("/teacher/courses");
    await expect(page.getByText("课程管理")).toBeVisible();

    await page.getByRole("button", { name: "新建课程" }).click();

    const title = `UI 新建课程 ${Date.now()}`;
    await page.getByText("课程标题").locator("..")!.locator("input").fill(title);
    await page.getByText("课程描述").locator("..")!.locator("textarea").fill("通过 UI 创建的课程");
    await page.getByText("价格 (¥)").locator("..")!.locator("input").fill("99.99");
    await page.getByText("分类").locator("..")!.locator("input").fill("数学");

    await page.getByText("发布状态").locator("..")!.locator("button").click();
    await page.getByRole("option", { name: "立即上架" }).click();

    await page.getByRole("button", { name: /创建课程/ }).click();

    await expect(page.getByText(title)).toBeVisible();
  });
});
