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
  FolderOpen,
  Home,
  LogOut,
} from "lucide-react";
import { useAuthGuard, useAuthLogout } from "@/hooks/use-auth-guard";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/(app)")({
  component: AppLayout,
});

function AppLayout() {
  const location = useLocation();
  const { t } = useTranslation();
  const isTeacherRoute = location.pathname.startsWith("/teacher");
  const role = isTeacherRoute ? "teacher" : "student";
  const { user, isLoading, isAuthed } = useAuthGuard(role);
  const handleLogout = useAuthLogout();

  if (isLoading) return <AuthLoading />;
  if (!isAuthed || !user) return null;

  const isStudent = role === "student";

  const teacherSidebarItems = [
    { label: t("nav.dashboard"), href: "/teacher", icon: LayoutDashboard },
    { label: t("nav.calendar"), href: "/teacher/calendar", icon: Calendar },
    { label: t("nav.courses"), href: "/teacher/courses", icon: BookOpen },
    { label: t("nav.students"), href: "/teacher/students", icon: Users },
    { label: t("nav.enrollments"), href: "/teacher/enrollments", icon: ClipboardList },
    { label: t("nav.reports"), href: "/teacher/reports", icon: BarChart3 },
  ];

  const studentSidebarItems = [
    { label: t("nav.schedule"), href: "/student", icon: Calendar },
    { label: t("nav.courses"), href: "/student/enrollments", icon: BookOpen },
    { label: t("nav.grades"), href: "/student/grades", icon: BarChart3 },
    { label: t("nav.messages"), href: "/student/messages", icon: MessageSquare },
    { label: t("nav.resources"), href: "/student/resources", icon: FolderOpen },
  ];

  const teacherSupportItems = [
    { label: t("nav.settings"), href: "/teacher/settings", icon: Settings },
    { label: t("nav.support"), href: "/teacher/support", icon: HelpCircle },
  ];

  const studentSupportItems = [
    { label: t("nav.settings"), href: "/student/settings", icon: Settings },
    { label: t("nav.support"), href: "/student/support", icon: HelpCircle },
  ];

  const studentBottomNavItems = [
    { label: t("nav.home"), href: "/student", icon: Home },
    { label: t("nav.grades"), href: "/student/grades", icon: BarChart3 },
    { label: t("nav.schedule"), href: "/student", icon: Calendar },
    { label: t("nav.settings"), href: "/student/settings", icon: Settings },
  ];

  const sidebarItems = isTeacherRoute ? teacherSidebarItems : studentSidebarItems;
  const supportItems = isTeacherRoute ? teacherSupportItems : studentSupportItems;
  const appName = isTeacherRoute ? "EduManager" : "EduPortal";
  const userRoleLabel = isTeacherRoute ? "老师" : "学生";
  const topBarPlaceholder = isTeacherRoute ? "搜索课程、学生..." : "搜索课程、资源...";

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
