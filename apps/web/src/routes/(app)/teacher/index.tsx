import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Avatar,
  AvatarFallback,
  Button,
} from "@course-manager/ui";
import {
  ClipboardList,
  Megaphone,
  MessageSquare,
  FileBarChart,
  Clock,
  MapPin,
  Users,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
} from "lucide-react";
import { useTeacherSchedule, useUpcomingDeadlines } from "@/hooks/use-queries";

export const Route = createFileRoute("/(app)/teacher/")({
  component: TeacherDashboard,
});

const quickActions = [
  { icon: ClipboardList, label: "Assignment", color: "bg-blue-100 text-blue-600", path: "/teacher/courses" },
  { icon: Megaphone, label: "Announcement", color: "bg-orange-100 text-orange-600", path: "/teacher/courses" },
  { icon: MessageSquare, label: "Message", color: "bg-green-100 text-green-600", path: "/teacher/students" },
  { icon: FileBarChart, label: "Report", color: "bg-purple-100 text-purple-600", path: "/teacher/reports" },
];

const calendarDays = Array.from({ length: 31 }, (_, i) => i + 1);
const today = 24;

function statusLabel(status: string) {
  if (status === "completed") return "Completed";
  if (status === "in-progress") return "In Progress";
  return "Upcoming";
}

function TeacherDashboard() {
  const navigate = useNavigate();
  const { data: schedule = [] } = useTeacherSchedule();
  const { data: deadlines = [] } = useUpcomingDeadlines();

  // Map schedule data to display format
  const todaySchedule = schedule.map((item) => {
    const start = new Date(item.start_time);
    const end = new Date(item.end_time);
    const fmt = (d: Date) => d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    const now = new Date();
    const status = end < now ? "Completed" : start <= now ? "In Progress" : "Upcoming";
    return {
      id: item.id,
      time: `${fmt(start)} - ${fmt(end)}`,
      course: item.course_title,
      room: item.room || "",
      students: Number(item.student_count) || 0,
      status,
    };
  });
  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Good morning, Professor Smith!
        </h1>
        <p className="mt-1 text-gray-500">
          You have {todaySchedule.length} classes today and {deadlines.filter((d) => d.urgent).length} urgent deadlines.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column: Schedule + Quick Actions */}
        <div className="space-y-6 lg:col-span-2">
          {/* Today's Schedule */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Today's Schedule</CardTitle>
                <span className="text-sm text-gray-500">October 24, 2023</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {todaySchedule.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 rounded-lg border border-gray-100 p-4 transition-colors hover:bg-gray-50"
                >
                  <div className="flex min-w-[120px] flex-col">
                    <div className="flex items-center gap-1.5 text-sm font-medium text-gray-900">
                      <Clock className="h-3.5 w-3.5 text-gray-400" />
                      {item.time}
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.course}</p>
                    <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {item.room}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {item.students} students
                      </span>
                    </div>
                  </div>
                  <Badge
                    variant={
                      item.status === "Completed"
                        ? "secondary"
                        : item.status === "In Progress"
                          ? "default"
                          : "outline"
                    }
                  >
                    {item.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.label}
                      onClick={() => navigate({ to: action.path })}
                      className="flex flex-col items-center gap-2 rounded-xl border border-gray-100 p-4 transition-colors hover:bg-gray-50"
                    >
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-lg ${action.color}`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {action.label}
                      </span>
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
                  October 2023
                </CardTitle>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-500">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-500">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 text-center">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                  <div
                    key={d}
                    className="py-1 text-xs font-medium text-gray-400"
                  >
                    {d}
                  </div>
                ))}
                {/* Empty cells for first day offset (Oct 2023 starts on Sunday) */}
                {calendarDays.map((day) => (
                  <button
                    key={day}
                    className={`rounded-md py-1.5 text-xs transition-colors ${
                      day === today
                        ? "bg-blue-600 font-bold text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Deadlines */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Upcoming Deadlines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {deadlines.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 rounded-lg border border-gray-100 p-3"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-[10px] font-bold">
                      {item.title.slice(0, 3).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {item.title}
                    </p>
                    <p className="text-xs text-gray-500">{new Date(item.due_date).toLocaleString("zh-CN")}</p>
                  </div>
                  <span
                    className={`whitespace-nowrap text-xs font-medium ${
                      item.urgent ? "text-red-500" : "text-gray-400"
                    }`}
                  >
                    {new Date(item.due_date).toLocaleDateString("zh-CN")}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
