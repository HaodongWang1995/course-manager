import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Button,
} from "@course-manager/ui";
import {
  ClipboardList,
  Megaphone,
  MessageSquare,
  FileBarChart,
  MapPin,
  Users,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  ChevronDown,
} from "lucide-react";
import { useState, useMemo } from "react";
import { useTeacherSchedule, useUpcomingDeadlines, useCurrentUser } from "@/hooks/use-queries";
import { WelcomeHeader } from "./components/welcome-header";
import { DeadlineList } from "./components/deadline-list";

const quickActionDefs = [
  { icon: ClipboardList, key: "assignment" as const, color: "bg-blue-100 text-blue-600", path: "/teacher/courses" },
  { icon: Megaphone, key: "announcement" as const, color: "bg-orange-100 text-orange-600", path: "/teacher/courses" },
  { icon: MessageSquare, key: "message" as const, color: "bg-green-100 text-green-600", path: "/teacher/students" },
  { icon: FileBarChart, key: "report" as const, color: "bg-purple-100 text-purple-600", path: "/teacher/reports" },
];

function getCourseType(title: string, lessonTitle?: string): "Lecture" | "Lab" | "Admin" {
  const text = ((lessonTitle || "") + " " + title).toLowerCase();
  if (/lab|practical|workshop|experiment/.test(text)) return "Lab";
  if (/meeting|admin|department|seminar|office/.test(text)) return "Admin";
  return "Lecture";
}

const typeStyles: Record<string, string> = {
  Lecture: "bg-blue-50 text-blue-600 border-blue-100",
  Lab: "bg-green-50 text-green-600 border-green-100",
  Admin: "bg-gray-100 text-gray-500 border-gray-200",
};

const statusStyle: Record<string, string> = {
  Upcoming: "border-blue-200 text-blue-600",
  "Pending Prep": "border-red-200 bg-red-50 text-red-600",
  Finished: "border-gray-200 text-gray-400",
  Scheduled: "border-gray-200 text-gray-500",
};

export function TeacherDashboardPage() {
  const { t } = useTranslation("dashboard");
  const navigate = useNavigate();
  const { data: user } = useCurrentUser();
  const { data: schedule = [] } = useTeacherSchedule();
  const { data: deadlines = [] } = useUpcomingDeadlines();
  const [semester] = useState(() => t("semester.fall2023"));
  const [showSemesterMenu, setShowSemesterMenu] = useState(false);

  const [calMonth, setCalMonth] = useState(() => new Date(2026, 1, 1));
  const today = useMemo(() => new Date(), []);

  const calendarGrid = useMemo(() => {
    const year = calMonth.getFullYear();
    const month = calMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { firstDay, daysInMonth, year, month };
  }, [calMonth]);

  const monthLabel = calMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const todaySchedule = schedule.map((item) => {
    const start = new Date(item.start_time);
    const end = new Date(item.end_time);
    const fmt = (d: Date) =>
      d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    const now = new Date();
    const isCompleted = end < now;
    const isInProgress = start <= now && end >= now;
    const status = isCompleted ? "Finished" : isInProgress ? "Pending Prep" : "Upcoming";
    const type = getCourseType(item.course_title, item.title);
    return {
      id: item.id,
      startTime: fmt(start),
      endTime: fmt(end),
      course: item.course_title,
      room: item.room || "TBA",
      students: Number(item.student_count) || 0,
      status,
      type,
    };
  });

  const urgentDeadlineCount = deadlines.filter((d) => d.urgent).length;

  return (
    <div className="space-y-6">
      {/* Semester Selector Row */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>
        <div className="relative">
          <button
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            onClick={() => setShowSemesterMenu(!showSemesterMenu)}
          >
            {semester}
            <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
          </button>
          {showSemesterMenu && (
            <div className="absolute right-0 top-full z-10 mt-1 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
              {[t("semester.spring2026"), t("semester.fall2025"), t("semester.fall2023")].map((s) => (
                <button
                  key={s}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${s === semester ? "font-semibold text-blue-600" : "text-gray-700"}`}
                  onClick={() => setShowSemesterMenu(false)}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <WelcomeHeader
        userName={user?.name ?? ""}
        classCount={todaySchedule.length}
        urgentDeadlineCount={urgentDeadlineCount}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column: Schedule + Quick Actions */}
        <div className="space-y-6 lg:col-span-2">
          {/* Today's Schedule */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{t("scheduleSection.title")}</CardTitle>
                  <p className="mt-0.5 text-xs text-gray-400">
                    {today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                  </p>
                </div>
                <button
                  className="text-sm font-medium text-blue-600 hover:underline"
                  onClick={() => navigate({ to: "/teacher/calendar" })}
                >
                  {t("scheduleSection.viewCalendar")}
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-0 divide-y divide-gray-50">
              {todaySchedule.length === 0 ? (
                <p className="py-6 text-center text-sm text-gray-400">{t("scheduleSection.noClasses")}</p>
              ) : (
                todaySchedule.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 py-3.5 transition-colors hover:bg-gray-50/50"
                  >
                    <div className="w-[90px] shrink-0">
                      <p className="text-sm font-semibold text-gray-900">{item.startTime}</p>
                      <p className="text-xs text-gray-400">{item.endTime}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900 truncate">{item.course}</p>
                        <span
                          className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold border ${typeStyles[item.type]}`}
                        >
                          {t(`courseType.${item.type}`)}
                        </span>
                      </div>
                      <div className="mt-0.5 flex items-center gap-3 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {item.room}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {t("scheduleSection.students", { count: item.students })}
                        </span>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={`shrink-0 text-xs ${statusStyle[item.status] || statusStyle.Scheduled}`}
                    >
                      {t(`status.${item.status}`)}
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{t("quickActions.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {quickActionDefs.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.key}
                      onClick={() => navigate({ to: action.path })}
                      className="flex flex-col items-center gap-2 rounded-xl border border-gray-100 p-4 transition-colors hover:bg-gray-50"
                    >
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${action.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">{t(`quickActions.${action.key}`)}</span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column: Calendar + Deadlines */}
        <div className="space-y-6">
          {/* Mini Calendar */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  <CalendarDays className="mr-2 inline h-4 w-4" />
                  {monthLabel}
                </CardTitle>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-gray-500"
                    onClick={() => setCalMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-gray-500"
                    onClick={() => setCalMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-0.5 text-center">
                {[t("calendarDays.su"), t("calendarDays.mo"), t("calendarDays.tu"), t("calendarDays.we"), t("calendarDays.th"), t("calendarDays.fr"), t("calendarDays.sa")].map((d) => (
                  <div key={d} className="py-1 text-[11px] font-medium text-gray-400">
                    {d}
                  </div>
                ))}
                {Array.from({ length: calendarGrid.firstDay }).map((_, i) => (
                  <div key={`pad-${i}`} />
                ))}
                {Array.from({ length: calendarGrid.daysInMonth }, (_, i) => i + 1).map((day) => {
                  const isToday =
                    day === today.getDate() &&
                    calendarGrid.month === today.getMonth() &&
                    calendarGrid.year === today.getFullYear();
                  return (
                    <button
                      key={day}
                      className={`rounded-md py-1 text-xs transition-colors ${
                        isToday
                          ? "bg-blue-600 font-bold text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                      onClick={() => navigate({ to: "/teacher/calendar" })}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <DeadlineList deadlines={deadlines} />
        </div>
      </div>
    </div>
  );
}
