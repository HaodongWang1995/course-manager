import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import { Sidebar, TopBar, NotificationBell, UserAvatar, AuthLoading } from "@course-manager/ui";
import {
  LayoutDashboard,
  Calendar,
  BookOpen,
  Users,
  BarChart3,
  ClipboardList,
  Settings,
  HelpCircle,
  LogOut,
} from "lucide-react";
import { useAuthGuard, useAuthLogout } from "@/hooks/use-auth-guard";

export const Route = createFileRoute("/teacher")({
  component: TeacherLayout,
});

const sidebarItems = [
  { label: "Dashboard", href: "/teacher", icon: LayoutDashboard },
  { label: "Calendar", href: "/teacher/calendar", icon: Calendar },
  { label: "Courses", href: "/teacher/courses", icon: BookOpen },
  { label: "Students", href: "/teacher/students", icon: Users },
  { label: "Enrollments", href: "/teacher/enrollments", icon: ClipboardList },
  { label: "Reports", href: "/teacher/reports", icon: BarChart3 },
];

const supportItems = [
  { label: "Settings", href: "/teacher/settings", icon: Settings },
  { label: "Support", href: "/teacher/support", icon: HelpCircle },
];

function TeacherLayout() {
  const location = useLocation();
  const { user, isLoading, isAuthed } = useAuthGuard("teacher");
  const handleLogout = useAuthLogout();

  if (isLoading) return <AuthLoading />;
  if (!isAuthed || !user) return null;

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
