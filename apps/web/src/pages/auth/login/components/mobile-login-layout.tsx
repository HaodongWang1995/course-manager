import { useState } from "react";
import { Button, Input, Label, Checkbox } from "@course-manager/ui";
import {
  GraduationCap,
  Eye,
  EyeOff,
  Mail,
  Lock,
  BookOpen,
  CheckCircle2,
} from "lucide-react";
import { useLogin, useRegister } from "@/hooks/use-queries";
import { useForm } from "@tanstack/react-form";
import { loginSchema, registerSchema } from "@/lib/schemas";

function formatFieldErrors(errors: unknown[]): string {
  return errors
    .map((e) =>
      typeof e === "string" ? e : (e as { message?: string })?.message ?? String(e)
    )
    .join(", ");
}

interface MobileLoginLayoutProps {
  onSuccess: (role: "student" | "teacher") => void;
}

export function MobileLoginLayout({ onSuccess }: MobileLoginLayoutProps) {
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [role, setRole] = useState<"student" | "teacher">("student");

  function selectRole(r: "student" | "teacher") {
    setRole(r);
  }

  const loginForm = useForm({
    defaultValues: { email: "", password: "" },
    validators: { onChange: loginSchema },
    onSubmit: ({ value }) => {
      setError("");
      loginMutation.mutate(value, {
        onSuccess: (user) => onSuccess(user.role),
        onError: (err) => setError(err.message || "登录失败"),
      });
    },
  });

  const registerForm = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "student" as "student" | "teacher",
    },
    validators: { onBlur: registerSchema },
    onSubmit: ({ value }) => {
      setError("");
      registerMutation.mutate({ ...value, role }, {
        onSuccess: (user) => onSuccess(user.role),
        onError: (err) => setError(err.message || "注册失败"),
      });
    },
  });

  const isLoading = loginMutation.isPending || registerMutation.isPending;

  return (
    <div className="flex w-full flex-col lg:hidden">
      {/* Hero Section */}
      <div className="relative h-[220px] w-full overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=960&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/30 to-white" />
        <div className="absolute bottom-6 left-6 right-6">
          <h1 className="text-[30px] font-bold text-slate-900 leading-tight">
            Welcome Back
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your schedule and feedback with ease.
          </p>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 px-6 pb-8">
        {/* Error Message */}
        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {tab === "login" ? (
          <form
            onSubmit={(e) => { e.preventDefault(); loginForm.handleSubmit(); }}
            className="mt-6 space-y-4"
          >
            <loginForm.Field name="email">
              {(field) => (
                <div className="space-y-1.5">
                  <Label htmlFor="m-email" className="text-sm font-medium text-slate-900">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="m-email"
                      type="email"
                      placeholder="name@example.com"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      className="h-12 rounded-lg border-slate-200 pl-11 text-base placeholder:text-slate-400"
                    />
                  </div>
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-xs text-red-500">{formatFieldErrors(field.state.meta.errors)}</p>
                  )}
                </div>
              )}
            </loginForm.Field>

            <loginForm.Field name="password">
              {(field) => (
                <div className="space-y-1.5">
                  <Label htmlFor="m-password" className="text-sm font-medium text-slate-900">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="m-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      className="h-12 rounded-lg border-slate-200 pl-11 pr-11 text-base placeholder:text-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-xs text-red-500">{formatFieldErrors(field.state.meta.errors)}</p>
                  )}
                </div>
              )}
            </loginForm.Field>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked === true)}
                />
                <span className="text-sm text-slate-500">Remember me</span>
              </label>
              <button type="button" className="text-sm font-medium text-[#137FEC]">
                Forgot Password?
              </button>
            </div>

            <Button
              type="submit"
              className="mt-2 h-12 w-full rounded-lg bg-[#137FEC] text-base font-bold shadow-md hover:bg-[#1172d4]"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>
        ) : (
          <>
            {/* Role Selection — only shown during registration */}
            <div className="mt-6">
              <p className="text-base font-medium text-slate-900">I am a...</p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => selectRole("student")}
                  className={`relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 py-5 transition-all ${
                    role === "student"
                      ? "border-[#137FEC] bg-blue-50/50"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  {role === "student" && (
                    <CheckCircle2 className="absolute right-2 top-2 h-5 w-5 text-[#137FEC]" />
                  )}
                  <GraduationCap
                    className={`h-8 w-8 ${role === "student" ? "text-[#137FEC]" : "text-slate-400"}`}
                  />
                  <span
                    className={`text-sm font-semibold ${role === "student" ? "text-[#137FEC]" : "text-slate-500"}`}
                  >
                    Student
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => selectRole("teacher")}
                  className={`relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 py-5 transition-all ${
                    role === "teacher"
                      ? "border-[#137FEC] bg-blue-50/50"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  {role === "teacher" && (
                    <CheckCircle2 className="absolute right-2 top-2 h-5 w-5 text-[#137FEC]" />
                  )}
                  <BookOpen
                    className={`h-8 w-8 ${role === "teacher" ? "text-[#137FEC]" : "text-slate-400"}`}
                  />
                  <span
                    className={`text-sm font-semibold ${role === "teacher" ? "text-[#137FEC]" : "text-slate-500"}`}
                  >
                    Teacher
                  </span>
                </button>
              </div>
            </div>

            <form
              onSubmit={(e) => { e.preventDefault(); registerForm.handleSubmit(); }}
              className="mt-6 space-y-4"
            >
              <registerForm.Field name="name">
                {(field) => (
                  <div className="space-y-1.5">
                    <Label htmlFor="m-reg-name" className="text-sm font-medium text-slate-900">
                      Name
                    </Label>
                    <Input
                      id="m-reg-name"
                      type="text"
                      placeholder="Your name"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      className="h-12 rounded-lg border-slate-200 text-base placeholder:text-slate-400"
                    />
                    {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
                      <p className="text-xs text-red-500">{formatFieldErrors(field.state.meta.errors)}</p>
                    )}
                  </div>
                )}
              </registerForm.Field>

              <registerForm.Field name="email">
                {(field) => (
                  <div className="space-y-1.5">
                    <Label htmlFor="m-reg-email" className="text-sm font-medium text-slate-900">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                      <Input
                        id="m-reg-email"
                        type="email"
                        placeholder="name@example.com"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        className="h-12 rounded-lg border-slate-200 pl-11 text-base placeholder:text-slate-400"
                      />
                    </div>
                    {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
                      <p className="text-xs text-red-500">{formatFieldErrors(field.state.meta.errors)}</p>
                    )}
                  </div>
                )}
              </registerForm.Field>

              <registerForm.Field name="password">
                {(field) => (
                  <div className="space-y-1.5">
                    <Label htmlFor="m-reg-password" className="text-sm font-medium text-slate-900">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                      <Input
                        id="m-reg-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="At least 6 characters"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        className="h-12 rounded-lg border-slate-200 pl-11 pr-11 text-base placeholder:text-slate-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
                      <p className="text-xs text-red-500">{formatFieldErrors(field.state.meta.errors)}</p>
                    )}
                  </div>
                )}
              </registerForm.Field>

              <Button
                type="submit"
                className="mt-2 h-12 w-full rounded-lg bg-[#137FEC] text-base font-bold shadow-md hover:bg-[#1172d4]"
                disabled={isLoading}
              >
                {isLoading ? "Registering..." : "Sign Up"}
              </Button>
            </form>
          </>
        )}

        {/* Footer: Switch link */}
        <p className="mt-6 text-center text-sm text-slate-500">
          {tab === "login" ? (
            <>
              Don&apos;t have an account?{" "}
              <button
                onClick={() => { setTab("register"); setError(""); }}
                className="font-bold text-[#137FEC]"
              >
                Sign Up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                onClick={() => { setTab("login"); setError(""); }}
                className="font-bold text-[#137FEC]"
              >
                Login
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
