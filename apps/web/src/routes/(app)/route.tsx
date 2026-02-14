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
  Users,
  BarChart3,
  ClipboardList,
  Settings,
  HelpCircle,
  MessageSquare,
  Home,
  User,
  LogOut,
} from "lucide-react";
import { useAuthGuard, useAuthLogout } from "@/hooks/use-auth-guard";

export const Route = createFileRoute("/(app)")({
  component: AppLayout,
});

const teacherSidebarItems = [
  { label: "Dashboard", href: "/teacher", icon: LayoutDashboard },
  { label: "Calendar", href: "/teacher/calendar", icon: Calendar },
  { label: "Courses", href: "/teacher/courses", icon: BookOpen },
  { label: "Students", href: "/teacher/students", icon: Users },
  { label: "Enrollments", href: "/teacher/enrollments", icon: ClipboardList },
  { label: "Reports", href: "/teacher/reports", icon: BarChart3 },
];

const studentSidebarItems = [
  { label: "Dashboard", href: "/student", icon: LayoutDashboard },
  { label: "Schedule", href: "/student", icon: Calendar },
  { label: "Courses", href: "/student/assignments", icon: BookOpen },
  { label: "Grades", href: "/student/grades", icon: BarChart3 },
  { label: "Enrollments", href: "/student/enrollments", icon: ClipboardList },
  { label: "Messages", href: "/student/messages", icon: MessageSquare },
];

const teacherSupportItems = [
  { label: "Settings", href: "/teacher/settings", icon: Settings },
  { label: "Support", href: "/teacher/support", icon: HelpCircle },
];

const studentSupportItems = [
  { label: "Settings", href: "/student/settings", icon: Settings },
  { label: "Support", href: "/student/support", icon: HelpCircle },
];

const studentBottomNavItems = [
  { label: "Home", href: "/student", icon: Home },
  { label: "Grades", href: "/student/grades", icon: BarChart3 },
  { label: "Schedule", href: "/student", icon: Calendar },
  { label: "Profile", href: "/student/profile", icon: User },
];

function AppLayout() {
  const location = useLocation();
  const isTeacherRoute = location.pathname.startsWith("/teacher");
  const role = isTeacherRoute ? "teacher" : "student";
  const { user, isLoading, isAuthed } = useAuthGuard(role);
  const handleLogout = useAuthLogout();

  if (isLoading) return <AuthLoading />;
  if (!isAuthed || !user) return null;

  const isStudent = role === "student";
  const sidebarItems = isTeacherRoute ? teacherSidebarItems : studentSidebarItems;
  const supportItems = isTeacherRoute ? teacherSupportItems : studentSupportItems;
  const appName = isTeacherRoute ? "EduManager" : "EduPortal";
  const userRoleLabel = isTeacherRoute ? "老师" : "学生";
  const topBarPlaceholder = isTeacherRoute ? "搜索课程、学生..." : "搜索课程、资源...";
  const isGradesImmersive = isStudent && location.pathname === "/student/grades";

  if (isGradesImmersive) {
    return (
      <div className="flex h-screen bg-[#eff6ff]">
        <main className="flex-1 overflow-y-auto pb-20">
          <Outlet />
        </main>
        <BottomNav items={studentBottomNavItems} activeHref={location.pathname} />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
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
            role: userRoleLabel,
          }}
          appName={appName}
        />
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        {isStudent ? (
          <div className="hidden lg:block">
            <TopBar searchPlaceholder={topBarPlaceholder}>
              <NotificationBell count={0} />
              <button
                onClick={handleLogout}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                title="退出登录"
              >
                <LogOut className="h-4 w-4" />
              </button>
              <UserAvatar name={user.name} />
            </TopBar>
          </div>
        ) : (
          <TopBar searchPlaceholder={topBarPlaceholder}>
            <NotificationBell count={0} />
            <button
              onClick={handleLogout}
              className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              title="退出登录"
            >
              <LogOut className="h-4 w-4" />
            </button>
            <UserAvatar name={user.name} />
          </TopBar>
        )}

        <main className={`flex-1 overflow-y-auto p-4 md:p-6 ${isStudent ? "pb-20 lg:pb-6" : ""}`}>
          <Outlet />
        </main>
      </div>

      {isStudent ? (
        <div className="lg:hidden">
          <BottomNav items={studentBottomNavItems} activeHref={location.pathname} />
        </div>
      ) : null}
    </div>
  );
}
