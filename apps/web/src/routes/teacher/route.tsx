import { createFileRoute, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { Sidebar, TopBar, NotificationBell, UserAvatar } from "@course-manager/ui";
import {
  LayoutDashboard,
  Calendar,
  BookOpen,
  Users,
  BarChart3,
  Settings,
  HelpCircle,
  LogOut,
} from "lucide-react";
import { useCurrentUser, useLogout } from "@/hooks/use-queries";
import { getToken } from "@/api/client";
import { useEffect } from "react";

export const Route = createFileRoute("/teacher")({
  component: TeacherLayout,
});

const sidebarItems = [
  { label: "Dashboard", href: "/teacher", icon: LayoutDashboard },
  { label: "Calendar", href: "/teacher/calendar", icon: Calendar },
  { label: "Courses", href: "/teacher/courses", icon: BookOpen },
  { label: "Students", href: "/teacher/students", icon: Users },
  { label: "Reports", href: "/teacher/reports", icon: BarChart3 },
];

const supportItems = [
  { label: "Settings", href: "/teacher/settings", icon: Settings },
  { label: "Support", href: "/teacher/support", icon: HelpCircle },
];

function TeacherLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const logoutMutation = useLogout();
  const { data: user, isLoading, isError } = useCurrentUser();

  // Auth guard
  useEffect(() => {
    if (!getToken()) {
      navigate({ to: "/login" });
      return;
    }
    if (!isLoading && (isError || (user && user.role !== "teacher"))) {
      navigate({ to: "/login" });
    }
  }, [user, isLoading, isError, navigate]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  if (!user || user.role !== "teacher") {
    return null;
  }

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => navigate({ to: "/login" }),
    });
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - hidden on mobile */}
      <div className="hidden lg:block">
        <Sidebar
          items={sidebarItems}
          sections={[
            { items: sidebarItems },
            { title: "Support", items: supportItems },
          ]}
          activeHref={location.pathname}
          user={{
            name: user.name,
            role: "老师",
          }}
          appName="EduManager"
        />
      </div>

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar searchPlaceholder="搜索课程、学生...">
          <NotificationBell count={0} />
          <button
            onClick={handleLogout}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            title="退出登录"
          >
            <LogOut className="h-4 w-4" />
          </button>
          <UserAvatar name={user.name} />
        </TopBar>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
