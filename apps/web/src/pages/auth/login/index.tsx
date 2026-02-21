import { useNavigate } from "@tanstack/react-router";
import { MobileLoginLayout } from "./components/mobile-login-layout";
import { DesktopLoginLayout } from "./components/desktop-login-layout";

export function LoginPage() {
  const navigate = useNavigate();

  function handleSuccess(role: "student" | "teacher") {
    navigate({ to: role === "teacher" ? "/teacher" : "/student" });
  }

  return (
    <div className="flex min-h-screen flex-col lg:items-center lg:justify-center bg-white lg:bg-gradient-to-br lg:from-blue-50 lg:via-white lg:to-indigo-50">
      <MobileLoginLayout onSuccess={handleSuccess} />
      <DesktopLoginLayout onSuccess={handleSuccess} />
    </div>
  );
}
