import { useState, useMemo } from "react";
import { Button, Tabs, TabsList, TabsTrigger } from "@course-manager/ui";
import { Plus } from "lucide-react";
import {
  useTeacherSchedule,
  useTeacherCourses,
  useUpcomingDeadlines,
  useAddSchedule,
} from "@/hooks/use-queries";
import { CalendarGrid, type CalendarEvent, parseLocalTime, monthNames } from "./components/calendar-grid";
import { UpcomingListPanel } from "./components/upcoming-list";
import { NewEventDialog } from "./components/new-event-dialog";

const eventColors = [
  "bg-blue-100 border-blue-300 text-blue-800",
  "bg-green-100 border-green-300 text-green-800",
  "bg-purple-100 border-purple-300 text-purple-800",
  "bg-orange-100 border-orange-300 text-orange-800",
  "bg-teal-100 border-teal-300 text-teal-800",
];

const eventBgColors = ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500", "bg-teal-500"];

export function TeacherCalendarPage() {
  const [view, setView] = useState("month");
  const [showNewEvent, setShowNewEvent] = useState(false);
  const [currentDate, setCurrentDate] = useState(() => new Date());

  const { data: schedules = [] } = useTeacherSchedule();
  const { data: courses = [] } = useTeacherCourses();
  const { data: deadlines = [] } = useUpcomingDeadlines();
  const addScheduleMutation = useAddSchedule();

  // Course → color index map
  const courseColorMap = useMemo(() => {
    const map = new Map<string, number>();
    let idx = 0;
    schedules.forEach((s) => {
      if (!map.has(s.course_id)) {
        map.set(s.course_id, idx % eventColors.length);
        idx++;
      }
    });
    return map;
  }, [schedules]);

  const calendarEvents = useMemo<CalendarEvent[]>(() =>
    schedules.map((s) => {
      const colorIdx = courseColorMap.get(s.course_id) ?? 0;
      const start = parseLocalTime(s.start_time);
      const end = parseLocalTime(s.end_time);
      return {
        day: start.getDay(),
        startHour: start.getHours() + start.getMinutes() / 60,
        duration: (end.getTime() - start.getTime()) / (1000 * 60 * 60),
        title: s.course_title,
        room: s.room || "",
        color: eventColors[colorIdx],
        bgColor: eventBgColors[colorIdx],
        date: start,
        startTime: start.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }),
      };
    }),
    [schedules, courseColorMap]
  );

  // Sunday of the week containing currentDate
  const sunday = useMemo(() => {
    const d = new Date(currentDate);
    d.setDate(currentDate.getDate() - currentDate.getDay());
    d.setHours(0, 0, 0, 0);
    return d;
  }, [currentDate]);

  const weekDays = useMemo(() =>
    Array.from({ length: 7 }, (_, i) => {
      const d = new Date(sunday);
      d.setDate(sunday.getDate() + i);
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      return `${dayNames[d.getDay()]} ${d.getDate()}`;
    }),
    [sunday]
  );

  const todayDayIdx = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = Math.round((today.getTime() - sunday.getTime()) / 86400000);
    return diff >= 0 && diff < 7 ? today.getDay() : -1;
  }, [sunday]);

  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return calendarEvents
      .filter((e) => e.date >= now)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 3);
  }, [calendarEvents]);

  const headerTitle = useMemo(() => {
    if (view === "day") {
      return currentDate.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    }
    if (view === "week") {
      const sat = new Date(sunday);
      sat.setDate(sunday.getDate() + 6);
      const startStr = sunday.toLocaleDateString("en-US", { month: "long", day: "numeric" });
      return `${startStr} – ${sat.getDate()}, ${sat.getFullYear()}`;
    }
    return `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
  }, [view, currentDate, sunday]);

  const navigate = (dir: 1 | -1) => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      if (view === "week") d.setDate(d.getDate() + dir * 7);
      else if (view === "day") d.setDate(d.getDate() + dir);
      else { d.setDate(1); d.setMonth(d.getMonth() + dir); }
      return d;
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
          <p className="text-sm text-gray-500">Manage your schedule and events</p>
        </div>
        <div className="flex items-center gap-3">
          <Tabs value={view} onValueChange={setView}>
            <TabsList>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="day">Day</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button onClick={() => setShowNewEvent(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Event
          </Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-4">
        <div className="xl:col-span-3">
          <CalendarGrid
            view={view}
            headerTitle={headerTitle}
            allEvents={calendarEvents}
            currentDate={currentDate}
            sunday={sunday}
            weekDays={weekDays}
            todayDayIdx={todayDayIdx}
            onNavigate={navigate}
            onSetToday={() => setCurrentDate(new Date())}
            onDayClick={(d) => { setCurrentDate(d); setView("day"); }}
          />
        </div>
        <div>
          <UpcomingListPanel
            upcomingEvents={upcomingEvents}
            deadlines={deadlines}
            onAddEvent={() => setShowNewEvent(true)}
          />
        </div>
      </div>

      <NewEventDialog
        open={showNewEvent}
        onOpenChange={setShowNewEvent}
        courses={courses}
        onAdd={(data) =>
          addScheduleMutation.mutate(
            { courseId: data.courseId, data: { title: data.title, start_time: data.start_time, end_time: data.end_time, room: data.room } },
            { onSuccess: () => setShowNewEvent(false) }
          )
        }
        isLoading={addScheduleMutation.isPending}
      />
    </div>
  );
}
