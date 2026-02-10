import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button, Input, Label } from "@course-manager/ui";
import { GraduationCap, Eye, EyeOff } from "lucide-react";
import { useLogin, useRegister } from "@/hooks/use-queries";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [role, setRole] = useState<"student" | "teacher">("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("请输入邮箱和密码");
      return;
    }
    loginMutation.mutate(
      { email, password },
      {
        onSuccess: (user) => {
          if (user.role === "teacher") {
            navigate({ to: "/teacher" });
          } else {
            navigate({ to: "/student" });
          }
        },
        onError: (err) => {
          setError(err.message || "登录失败");
        },
      }
    );
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password || !name) {
      setError("请填写所有字段");
      return;
    }
    if (password.length < 6) {
      setError("密码至少需要6位");
      return;
    }
    registerMutation.mutate(
      { email, password, name, role },
      {
        onSuccess: (user) => {
          if (user.role === "teacher") {
            navigate({ to: "/teacher" });
          } else {
            navigate({ to: "/student" });
          }
        },
        onError: (err) => {
          setError(err.message || "注册失败");
        },
      }
    );
  };

  const isLoading = loginMutation.isPending || registerMutation.isPending;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4">
      <div className="w-full max-w-md">
        {/* Logo & Hero */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-200">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            {tab === "login" ? "欢迎回来" : "创建账号"}
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            {tab === "login"
              ? "登录您的教学管理平台"
              : "注册并开始使用教学管理平台"}
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          {/* Login/Register Toggle */}
          <div className="mb-6">
            <div className="flex rounded-lg bg-gray-100 p-1">
              <button
                type="button"
                onClick={() => { setTab("login"); setError(""); }}
                className={`flex-1 rounded-md py-2.5 text-sm font-medium transition-all ${
                  tab === "login"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                登录
              </button>
              <button
                type="button"
                onClick={() => { setTab("register"); setError(""); }}
                className={`flex-1 rounded-md py-2.5 text-sm font-medium transition-all ${
                  tab === "register"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                注册
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {tab === "login" ? (
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">邮箱</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">密码</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="输入密码"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? "登录中..." : "登录"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-5">
              {/* Role Toggle */}
              <div className="space-y-2">
                <Label>角色</Label>
                <div className="flex rounded-lg bg-gray-100 p-1">
                  <button
                    type="button"
                    onClick={() => setRole("student")}
                    className={`flex-1 rounded-md py-2 text-sm font-medium transition-all ${
                      role === "student"
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    学生
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("teacher")}
                    className={`flex-1 rounded-md py-2 text-sm font-medium transition-all ${
                      role === "teacher"
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    老师
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-name">姓名</Label>
                <Input
                  id="reg-name"
                  type="text"
                  placeholder="您的姓名"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-email">邮箱</Label>
                <Input
                  id="reg-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-password">密码</Label>
                <div className="relative">
                  <Input
                    id="reg-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="至少6位密码"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? "注册中..." : "注册"}
              </Button>
            </form>
          )}
        </div>

        {/* Switch link */}
        <p className="mt-6 text-center text-sm text-gray-500">
          {tab === "login" ? (
            <>
              没有账号？{" "}
              <button
                onClick={() => { setTab("register"); setError(""); }}
                className="font-medium text-blue-600 hover:text-blue-700"
              >
                立即注册
              </button>
            </>
          ) : (
            <>
              已有账号？{" "}
              <button
                onClick={() => { setTab("login"); setError(""); }}
                className="font-medium text-blue-600 hover:text-blue-700"
              >
                立即登录
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
