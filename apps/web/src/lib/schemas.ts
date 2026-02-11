import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "请输入邮箱").email("请输入有效的邮箱地址"),
  password: z.string().min(1, "请输入密码"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: z.string().min(1, "请输入姓名"),
  email: z.string().min(1, "请输入邮箱").email("请输入有效的邮箱地址"),
  password: z.string().min(6, "密码至少需要6位"),
  role: z.enum(["student", "teacher"]),
});

export type RegisterFormData = z.infer<typeof registerSchema>;

const courseZod = z.object({
  title: z.string().min(1, "请输入课程标题"),
  description: z.string().optional(),
  price: z.number().min(0, "价格不能为负数").optional(),
  category: z.string().optional(),
  status: z.enum(["active", "draft"]),
});

export type CourseFormData = z.infer<typeof courseZod>;

const scheduleZod = z.object({
  lesson_number: z.number().int("课时编号必须是整数").optional(),
  title: z.string().optional(),
  start_time: z.string().min(1, "请选择开始时间"),
  end_time: z.string().min(1, "请选择结束时间"),
  room: z.string().optional(),
});

export type ScheduleFormData = z.infer<typeof scheduleZod>;

// Helper: convert Zod safeParse errors to TanStack Form field errors
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function zodToFieldErrors(schema: z.ZodType<any, any, any>, value: unknown) {
  const result = schema.safeParse(value);
  if (result.success) return undefined;
  const fieldErrors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const path = issue.path.join(".");
    if (path) {
      fieldErrors[path] = issue.message;
    }
  }
  if (Object.keys(fieldErrors).length > 0) {
    return { fields: fieldErrors };
  }
  return result.error.issues[0]?.message;
}

export function courseFormValidator({ value }: { value: unknown }) {
  return zodToFieldErrors(courseZod, value);
}

export function scheduleFormValidator({ value }: { value: unknown }) {
  const base = zodToFieldErrors(scheduleZod, value);
  if (base) return base;
  const v = value as ScheduleFormData;
  if (v.start_time && v.end_time && v.end_time <= v.start_time) {
    return { fields: { end_time: "结束时间必须晚于开始时间" } };
  }
  return undefined;
}
