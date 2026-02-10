import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import {
  Sidebar,
  TopBar,
  NotificationBell,
  UserAvatar,
  BottomNav,
} from "@course-manager/ui";
import {
  LayoutDashboard,
  Calendar,
  BookOpen,
  BarChart3,
  MessageSquare,
  Settings,
  HelpCircle,
  Home,
  User,
} from "lucide-react";

export const Route = createFileRoute("/student")({
  component: StudentLayout,
});

const sidebarItems = [
  { label: "Dashboard", href: "/student", icon: LayoutDashboard },
  { label: "Schedule", href: "/student", icon: Calendar },
  { label: "Courses", href: "/student/assignments", icon: BookOpen },
  { label: "Grades", href: "/student/grades", icon: BarChart3 },
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
            name: "Alex Morgan",
            role: "Student ID: 48291",
          }}
          appName="EduPortal"
        />
      </div>

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* TopBar - hidden on mobile */}
        <div className="hidden lg:block">
          <TopBar searchPlaceholder="Search courses, resources...">
            <NotificationBell count={5} />
            <UserAvatar name="Alex Morgan" />
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
