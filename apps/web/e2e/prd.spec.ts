import { test, expect, type Page } from "@playwright/test";

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

async function applyEnrollment(request: Parameters<typeof test>[0]["request"], token: string, courseId: string) {
  const res = await request.post(`${API_URL}/api/enrollments`, {
    data: { course_id: courseId },
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok()) {
    const text = await res.text();
    throw new Error(`Enrollment apply failed: ${res.status()} ${text}`);
  }
  return (await res.json()) as { id: string; status: string };
}

/** Log in via the UI login page and wait for redirect. */
async function loginViaUI(page: Page, email: string, password: string, role: "teacher" | "student") {
  await page.goto("/login");
  await page.getByLabel("邮箱").fill(email);
  await page.getByLabel("密码").fill(password);
  // The second button is the login submit (first is register tab/toggle)
  await page.getByRole("button", { name: "登录" }).nth(1).click();
  await expect(page).toHaveURL(new RegExp(`/${role}`));
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

  test("Student can log in, view course detail, and apply for enrollment", async ({ page, request }) => {
    // Setup: create teacher + active course via API
    const teacher = await registerOrLogin(request, {
      name: "Enroll Teacher",
      email: `teacher.enroll+${Date.now()}@example.com`,
      password: "password123",
      role: "teacher",
    });
    const courseTitle = `Enroll Course ${Date.now()}`;
    const course = await createCourse(request, teacher.token, {
      title: courseTitle,
      description: "A course for enrollment E2E",
      price: 0,
      status: "active",
    });

    // Register student
    const student = await registerOrLogin(request, {
      name: "E2E Student",
      email: `student.enroll+${Date.now()}@example.com`,
      password: "password123",
      role: "student",
    });

    // Log in via UI
    await loginViaUI(page, student.user.email, "password123", "student");

    // Navigate directly to the course detail page
    await page.goto(`/student/courses/${course.id}`);
    await expect(page.getByRole("heading", { name: courseTitle })).toBeVisible();

    // Open enrollment dialog
    await page.getByRole("button", { name: "申请选课" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByText(`申请加入「${courseTitle}」`)).toBeVisible();

    // Submit enrollment
    await page.getByRole("button", { name: "提交申请" }).click();

    // Confirm success state
    await expect(page.getByText("申请已提交！")).toBeVisible();
  });

  test("Teacher can review (approve) a pending enrollment", async ({ page, request }) => {
    // Setup: teacher + active course + student enrollment via API
    const teacher = await registerOrLogin(request, {
      name: "Review Teacher",
      email: `teacher.review+${Date.now()}@example.com`,
      password: "password123",
      role: "teacher",
    });
    const courseTitle = `Review Course ${Date.now()}`;
    const course = await createCourse(request, teacher.token, {
      title: courseTitle,
      status: "active",
    });

    const student = await registerOrLogin(request, {
      name: "Review Student",
      email: `student.review+${Date.now()}@example.com`,
      password: "password123",
      role: "student",
    });
    await applyEnrollment(request, student.token, course.id);

    // Log in as teacher via UI
    await loginViaUI(page, teacher.user.email, "password123", "teacher");

    // Go to enrollments page
    await page.goto("/teacher/enrollments");
    await expect(page.getByText("Enrollment Management")).toBeVisible();

    // The student's enrollment should appear as Pending
    await expect(page.getByText(student.user.name)).toBeVisible();
    await expect(page.getByText("Pending")).toBeVisible();

    // Approve the enrollment
    await page.getByRole("button", { name: "Approve" }).first().click();

    // Status should update to Approved
    await expect(page.getByText("Approved")).toBeVisible();
  });

  test("Teacher can update display name in settings", async ({ page, request }) => {
    const teacher = await registerOrLogin(request, {
      name: "Settings Teacher",
      email: `teacher.settings+${Date.now()}@example.com`,
      password: "password123",
      role: "teacher",
    });

    await loginViaUI(page, teacher.user.email, "password123", "teacher");
    await page.goto("/teacher/settings");

    // Profile form is visible
    await expect(page.getByRole("heading", { name: /设置|Settings/ })).toBeVisible();

    // Clear and update display name
    const nameInput = page.locator("#profile-name");
    await nameInput.clear();
    await nameInput.fill("Updated Teacher Name");

    await page.getByRole("button", { name: /保存更改|Save Changes/ }).click();

    // Success message appears
    await expect(page.getByText(/保存成功|Saved successfully/)).toBeVisible();
  });

  test("Teacher can create a schedule (New Event) from calendar", async ({ page, request }) => {
    const teacher = await registerOrLogin(request, {
      name: "Calendar Teacher",
      email: `teacher.cal+${Date.now()}@example.com`,
      password: "password123",
      role: "teacher",
    });
    await createCourse(request, teacher.token, {
      title: `Cal Course ${Date.now()}`,
      status: "active",
    });

    await loginViaUI(page, teacher.user.email, "password123", "teacher");
    await page.goto("/teacher/calendar");

    await page.getByRole("button", { name: "New Event" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();

    // Select a course
    await page.getByRole("combobox").click();
    await page.getByRole("option").first().click();

    // Set start and end times via datetime-local inputs
    const [startInput, endInput] = await page.locator('input[type="datetime-local"]').all();
    await startInput.fill("2026-06-01T09:00");
    await endInput.fill("2026-06-01T10:00");

    await page.getByRole("button", { name: "Create Event" }).click();

    // Dialog closes on success
    await expect(page.getByRole("dialog")).not.toBeVisible({ timeout: 5000 });
  });

  test("Student can view enrollment list and filter by status", async ({ page, request }) => {
    const teacher = await registerOrLogin(request, {
      name: "Filter Teacher",
      email: `teacher.filter+${Date.now()}@example.com`,
      password: "password123",
      role: "teacher",
    });
    const course = await createCourse(request, teacher.token, {
      title: `Filter Course ${Date.now()}`,
      status: "active",
    });

    const student = await registerOrLogin(request, {
      name: "Filter Student",
      email: `student.filter+${Date.now()}@example.com`,
      password: "password123",
      role: "student",
    });
    await applyEnrollment(request, student.token, course.id);

    await loginViaUI(page, student.user.email, "password123", "student");
    await page.goto("/student/enrollments");

    // Enrollment appears in "All" view
    await expect(page.getByText(course.title)).toBeVisible();

    // Filter to "Pending" tab
    await page.getByRole("button", { name: /待审核|Pending/ }).click();
    await expect(page.getByText(course.title)).toBeVisible();

    // Filter to "Approved" tab - course should not appear (still pending)
    await page.getByRole("button", { name: /已通过|Approved/ }).click();
    await expect(page.getByText(course.title)).not.toBeVisible();
  });

  test("Teacher students page shows enrolled students", async ({ page, request }) => {
    const teacher = await registerOrLogin(request, {
      name: "Students Teacher",
      email: `teacher.students+${Date.now()}@example.com`,
      password: "password123",
      role: "teacher",
    });
    const course = await createCourse(request, teacher.token, {
      title: `Students Course ${Date.now()}`,
      status: "active",
    });

    const student = await registerOrLogin(request, {
      name: "Enrolled Student",
      email: `student.students+${Date.now()}@example.com`,
      password: "password123",
      role: "student",
    });
    await applyEnrollment(request, student.token, course.id);

    await loginViaUI(page, teacher.user.email, "password123", "teacher");
    await page.goto("/teacher/students");

    // Student who applied appears in the list
    await expect(page.getByText(student.user.name)).toBeVisible();
    await expect(page.getByText(student.user.email)).toBeVisible();
  });
});
