import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import {
  Sidebar,
  TopBar,
  NotificationBell,
  UserAvatar,
  BottomNav,
  AuthLoading,
} from "@course-manager/ui";
import {
  LayoutDashboard,
  Calendar,
  BookOpen,
  BarChart3,
  MessageSquare,
  ClipboardList,
  Settings,
  HelpCircle,
  Home,
  User,
  LogOut,
} from "lucide-react";
import { useAuthGuard, useAuthLogout } from "@/hooks/use-auth-guard";

export const Route = createFileRoute("/student")({
  component: StudentLayout,
});

const sidebarItems = [
  { label: "Dashboard", href: "/student", icon: LayoutDashboard },
  { label: "Schedule", href: "/student", icon: Calendar },
  { label: "Courses", href: "/student/assignments", icon: BookOpen },
  { label: "Grades", href: "/student/grades", icon: BarChart3 },
  { label: "Enrollments", href: "/student/enrollments", icon: ClipboardList },
  { label: "Messages", href: "/student/messages", icon: MessageSquare },
];

const supportItems = [
  { label: "Settings", href: "/student/settings", icon: Settings },
  { label: "Support", href: "/student/support", icon: HelpCircle },
];

const bottomNavItems = [
  { label: "Home", href: "/student", icon: Home },
  { label: "Grades", href: "/student/grades", icon: BarChart3 },
  { label: "Schedule", href: "/student", icon: Calendar },
  { label: "Profile", href: "/student/profile", icon: User },
];

function StudentLayout() {
  const location = useLocation();
  const { user, isLoading, isAuthed } = useAuthGuard("student");
  const handleLogout = useAuthLogout();
  const isGradesImmersive = location.pathname === "/student/grades";

  if (isLoading) return <AuthLoading />;
  if (!isAuthed || !user) return null;

  if (isGradesImmersive) {
    return (
      <div className="flex h-screen bg-[#eff6ff]">
        <main className="flex-1 overflow-y-auto pb-20">
          <Outlet />
        </main>
        <BottomNav items={bottomNavItems} activeHref={location.pathname} />
      </div>
    );
  }

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
            role: "学生",
          }}
          appName="EduPortal"
        />
      </div>

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* TopBar - hidden on mobile */}
        <div className="hidden lg:block">
          <TopBar searchPlaceholder="搜索课程、资源...">
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
        </div>

        <main className="flex-1 overflow-y-auto pb-20 lg:pb-6 p-4 md:p-6">
          <Outlet />
        </main>
      </div>

      {/* Bottom nav - visible only on mobile */}
      <div className="lg:hidden">
        <BottomNav items={bottomNavItems} activeHref={location.pathname} />
      </div>
    </div>
  );
}
