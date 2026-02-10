import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import { Sidebar, TopBar, NotificationBell, UserAvatar } from "@course-manager/ui";
import {
  LayoutDashboard,
  Calendar,
  BookOpen,
  Users,
  BarChart3,
  Settings,
  HelpCircle,
} from "lucide-react";

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
            name: "Prof. Smith",
            role: "Mathematics Department",
          }}
          appName="EduManager"
        />
      </div>

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar searchPlaceholder="Search courses, students...">
          <NotificationBell count={3} />
          <UserAvatar name="Prof. Smith" />
        </TopBar>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
