import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Tabs,
  TabsList,
  TabsTrigger,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@course-manager/ui";
import { Plus, Clock, MapPin, ChevronLeft, ChevronRight, CalendarPlus } from "lucide-react";
import { useTeacherSchedule, useTeacherCourses, useUpcomingDeadlines, useAddSchedule } from "@/hooks/use-queries";

export const Route = createFileRoute("/(app)/teacher/calendar")({
  component: TeacherCalendar,
});

const hours = Array.from({ length: 10 }, (_, i) => i + 8); // 8 AM to 5 PM
const dayNamesFull = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

// PostgreSQL TIMESTAMP is serialized with a "Z" by res.json(), but the stored
// value represents the teacher's local wall-clock time (entered via datetime-local).
// Stripping the timezone suffix prevents the browser from applying UTC→local
// conversion and keeps the time as originally intended.
function parseLocalTime(isoStr: string): Date {
  const normalized = isoStr.replace(/Z$/, "").replace(/[+-]\d{2}:\d{2}$/, "");
  return new Date(normalized);
}

const eventColors = [
  "bg-blue-100 border-blue-300 text-blue-800",
  "bg-green-100 border-green-300 text-green-800",
  "bg-purple-100 border-purple-300 text-purple-800",
  "bg-orange-100 border-orange-300 text-orange-800",
  "bg-teal-100 border-teal-300 text-teal-800",
];

const eventBgColors = ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500", "bg-teal-500"];

const deadlineColors = [
  "border-red-500 bg-red-50",
  "border-amber-500 bg-amber-50",
  "border-blue-500 bg-blue-50",
];

function TeacherCalendar() {
  const [view, setView] = useState("month");
  const [showNewEvent, setShowNewEvent] = useState(false);
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const { data: schedules = [] } = useTeacherSchedule();
  const { data: deadlines = [] } = useUpcomingDeadlines();

  // Build course → color index map
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

  // Map DB schedules to calendar events
  const calendarEvents = useMemo(() =>
    schedules.map((s) => {
      const colorIdx = courseColorMap.get(s.course_id) ?? 0;
      const start = parseLocalTime(s.start_time);
      const end = parseLocalTime(s.end_time);
      const dayOfWeek = start.getDay(); // 0=Sun ... 6=Sat
      const startHour = start.getHours() + start.getMinutes() / 60;
      const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

      return {
        day: dayOfWeek,
        startHour,
        duration,
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
      return `${dayNamesFull[d.getDay()]} ${d.getDate()}`;
    }),
    [sunday]
  );

  // Today's column index (0=Sun ... 6=Sat) within the current week
  const todayDayIdx = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = Math.round((today.getTime() - sunday.getTime()) / 86400000);
    return diff >= 0 && diff < 7 ? today.getDay() : -1;
  }, [sunday]);

  // Navigate forward / back
  const navigate = (dir: 1 | -1) => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      if (view === "week") d.setDate(d.getDate() + dir * 7);
      else if (view === "day") d.setDate(d.getDate() + dir);
      else {
        // month
        d.setDate(1);
        d.setMonth(d.getMonth() + dir);
      }
      return d;
    });
  };

  // Events that fall within the displayed week (Sun–Sat)
  const weekEvents = useMemo(() =>
    calendarEvents.filter((e) => {
      const diff = Math.floor((e.date.getTime() - sunday.getTime()) / 86400000);
      return diff >= 0 && diff < 7;
    }),
    [calendarEvents, sunday]
  );

  // Events for the currently selected day (day view)
  const dayEvents = useMemo(() => {
    const target = new Date(currentDate);
    target.setHours(0, 0, 0, 0);
    return calendarEvents.filter((e) => {
      const d = new Date(e.date);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === target.getTime();
    });
  }, [calendarEvents, currentDate]);

  // Upcoming events: next 3 scheduled from today
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
      const endDay = sat.getDate();
      const endYear = sat.getFullYear();
      return `${startStr} – ${endDay}, ${endYear}`;
    }
    // month
    return `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
  }, [view, currentDate, sunday]);

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
        {/* Calendar Grid */}
        <div className="xl:col-span-3">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button className="rounded-lg p-1 hover:bg-gray-100" onClick={() => navigate(-1)}>
                    <ChevronLeft className="h-5 w-5 text-gray-500" />
                  </button>
                  <h2 className="text-lg font-semibold text-gray-900">{headerTitle}</h2>
                  <button className="rounded-lg p-1 hover:bg-gray-100" onClick={() => navigate(1)}>
                    <ChevronRight className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
                <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                  Today
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {view === "month" && (
                <MonthView
                  currentDate={currentDate}
                  events={calendarEvents}
                  onDayClick={(d) => { setCurrentDate(d); setView("day"); }}
                />
              )}
              {view === "day" && (
                <DayView
                  events={dayEvents}
                  dayLabel={currentDate.toLocaleDateString("en-US", { weekday: "short", month: "numeric", day: "numeric" })}
                />
              )}
              {view === "week" && (
                <WeekView events={weekEvents} weekDays={weekDays} todayIdx={todayDayIdx} />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-4">
          {/* Upcoming Events */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Upcoming Events</CardTitle>
                <button className="text-xs font-medium text-blue-600 hover:underline">View All</button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingEvents.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-2">No upcoming events</p>
              ) : (
                upcomingEvents.map((event, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className={`flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg text-white ${event.bgColor}`}>
                      <span className="text-[9px] font-bold uppercase leading-tight">
                        {monthNames[event.date.getMonth()].slice(0, 3).toUpperCase()}
                      </span>
                      <span className="text-sm font-bold leading-tight">{event.date.getDate()}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{event.title}</p>
                      <p className="text-xs text-gray-500">
                        {event.startTime}
                        {event.room ? ` · ${event.room}` : ""}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Deadlines */}
          {deadlines.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Deadlines</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {deadlines.map((item, idx) => (
                  <div
                    key={item.id}
                    className={`rounded-lg border-l-4 p-3 ${deadlineColors[idx % deadlineColors.length]}`}
                  >
                    <p className="text-sm font-medium text-gray-900">{item.title}</p>
                    <p className={`mt-0.5 text-xs font-medium ${item.urgent ? "text-red-600" : "text-gray-500"}`}>
                      {item.urgent ? "Due Today" : new Date(item.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Quick Add Task */}
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center gap-2 py-5 text-center">
              <CalendarPlus className="h-8 w-8 text-gray-300" />
              <p className="text-xs text-gray-400">Need to schedule something?</p>
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => setShowNewEvent(true)}
              >
                Quick Add Task
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <NewEventDialog open={showNewEvent} onOpenChange={setShowNewEvent} />
    </div>
  );
}

// ── Month View ─────────────────────────────────────────
function MonthView({
  currentDate,
  events,
  onDayClick,
}: {
  currentDate: Date;
  events: Array<{ date: Date; title: string; bgColor: string }>;
  onDayClick: (d: Date) => void;
}) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // First day of month and how many days in month
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startCol = firstDay.getDay(); // 0=Sun

  // Build 6x7 grid of day numbers (0 means padding day from prev/next month)
  const cells: Array<{ date: Date | null; dayNum: number | null; isCurrentMonth: boolean }> = [];

  // Prev month padding
  const prevMonthDays = new Date(year, month, 0).getDate();
  for (let i = startCol - 1; i >= 0; i--) {
    cells.push({ date: new Date(year, month - 1, prevMonthDays - i), dayNum: prevMonthDays - i, isCurrentMonth: false });
  }

  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(year, month, d), dayNum: d, isCurrentMonth: true });
  }

  // Next month padding to complete grid
  let next = 1;
  while (cells.length % 7 !== 0) {
    cells.push({ date: new Date(year, month + 1, next), dayNum: next, isCurrentMonth: false });
    next++;
  }

  // Events lookup by date string
  const eventsByDate = useMemo(() => {
    const map = new Map<string, typeof events>();
    events.forEach((e) => {
      const key = `${e.date.getFullYear()}-${e.date.getMonth()}-${e.date.getDate()}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
    });
    return map;
  }, [events]);

  const weeks: (typeof cells)[] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[560px]">
        {/* Day header */}
        <div className="grid grid-cols-7 border-b border-gray-200">
          {dayNamesFull.map((d) => (
            <div key={d} className="py-2 text-center text-xs font-medium text-gray-500">
              {d}
            </div>
          ))}
        </div>
        {/* Calendar grid */}
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 border-b border-gray-100 last:border-0">
            {week.map((cell, di) => {
              if (!cell.date) return <div key={di} className="min-h-[90px] border-r border-gray-100 p-1 last:border-0" />;
              const dateKey = `${cell.date.getFullYear()}-${cell.date.getMonth()}-${cell.date.getDate()}`;
              const dayEvents = eventsByDate.get(dateKey) || [];
              const cellDate = new Date(cell.date);
              cellDate.setHours(0, 0, 0, 0);
              const isToday = cellDate.getTime() === today.getTime();
              const isSelected = cellDate.getTime() === new Date(
                currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()
              ).getTime();

              return (
                <div
                  key={di}
                  className={`min-h-[90px] cursor-pointer border-r border-gray-100 p-1.5 last:border-0 hover:bg-gray-50 ${!cell.isCurrentMonth ? "bg-gray-50/50" : ""}`}
                  onClick={() => onDayClick(cell.date!)}
                >
                  <div className={`mb-1 flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                    isToday
                      ? "bg-blue-600 text-white"
                      : isSelected
                      ? "bg-blue-100 text-blue-700"
                      : cell.isCurrentMonth
                      ? "text-gray-900"
                      : "text-gray-300"
                  }`}>
                    {cell.dayNum}
                  </div>
                  <div className="space-y-0.5">
                    {dayEvents.slice(0, 2).map((e, i) => (
                      <div
                        key={i}
                        className={`truncate rounded px-1 py-0.5 text-[10px] font-medium text-white ${e.bgColor}`}
                      >
                        {e.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <p className="text-[10px] text-gray-400">+{dayEvents.length - 2} more</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── New Event Dialog ─────────────────────────────────
function NewEventDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { data: courses = [] } = useTeacherCourses();
  const addScheduleMutation = useAddSchedule();
  const [courseId, setCourseId] = useState("");
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [room, setRoom] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId || !startTime || !endTime) return;
    addScheduleMutation.mutate(
      { courseId, data: { title: title || undefined, start_time: startTime, end_time: endTime, room: room || undefined } },
      {
        onSuccess: () => {
          onOpenChange(false);
          setCourseId("");
          setTitle("");
          setStartTime("");
          setEndTime("");
          setRoom("");
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>New Event</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Course</Label>
            <Select value={courseId} onValueChange={setCourseId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Title (optional)</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Lesson title" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Time <span className="text-red-400">*</span></Label>
              <Input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>End Time <span className="text-red-400">*</span></Label>
              <Input type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Room (optional)</Label>
            <Input value={room} onChange={(e) => setRoom(e.target.value)} placeholder="e.g. A-301" />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={!courseId || !startTime || !endTime || addScheduleMutation.isPending}>
              {addScheduleMutation.isPending ? "Creating..." : "Create Event"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Day View ──────────────────────────────────────────
function DayView({ events, dayLabel }: { events: Array<{ startHour: number; duration: number; title: string; room: string; color: string }>; dayLabel: string }) {
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[400px]">
        <div className="grid grid-cols-[60px_1fr] border-b border-gray-200">
          <div className="p-2" />
          <div className="border-l border-gray-200 bg-blue-50 p-2 text-center text-sm font-medium text-blue-700">
            {dayLabel}
          </div>
        </div>
        <div className="relative">
          {hours.map((hour) => (
            <div
              key={hour}
              className="grid grid-cols-[60px_1fr] border-b border-gray-100"
              style={{ height: 60 }}
            >
              <div className="flex items-start justify-end pr-2 pt-1 text-xs text-gray-400">
                {hour > 12 ? hour - 12 : hour}
                {hour >= 12 ? " PM" : " AM"}
              </div>
              <div className="relative border-l border-gray-100" />
            </div>
          ))}
          {events.map((event, idx) => {
            const top = (event.startHour - 8) * 60;
            const height = event.duration * 60;
            return (
              <div
                key={idx}
                className={`absolute rounded-md border p-2 text-xs ${event.color}`}
                style={{ top, height, left: "64px", right: "4px" }}
              >
                <p className="font-medium">{event.title}</p>
                {event.room && (
                  <div className="mt-1 flex items-center gap-1 opacity-75">
                    <MapPin className="h-3 w-3" />
                    {event.room}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Week View ─────────────────────────────────────────
function WeekView({
  events,
  weekDays,
  todayIdx,
}: {
  events: Array<{ day: number; startHour: number; duration: number; title: string; room: string; color: string }>;
  weekDays: string[];
  todayIdx: number;
}) {
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[700px]">
        <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-gray-200">
          <div className="p-2" />
          {weekDays.map((day, i) => (
            <div
              key={day}
              className={`border-l border-gray-200 p-2 text-center text-sm font-medium ${
                i === todayIdx ? "bg-blue-50 text-blue-700" : "text-gray-600"
              }`}
            >
              {day}
            </div>
          ))}
        </div>
        <div className="relative">
          {hours.map((hour) => (
            <div
              key={hour}
              className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-gray-100"
              style={{ height: 60 }}
            >
              <div className="flex items-start justify-end pr-2 pt-1 text-xs text-gray-400">
                {hour > 12 ? hour - 12 : hour}
                {hour >= 12 ? " PM" : " AM"}
              </div>
              {weekDays.map((_, dayIdx) => (
                <div key={dayIdx} className="relative border-l border-gray-100" />
              ))}
            </div>
          ))}
          {events.filter((e) => e.day >= 0 && e.day < 7).map((event, idx) => {
            const top = (event.startHour - 8) * 60;
            const height = event.duration * 60;
            const left = `calc(60px + ${event.day} * ((100% - 60px) / 7) + 2px)`;
            const width = `calc((100% - 60px) / 7 - 4px)`;
            return (
              <div
                key={idx}
                className={`absolute rounded-md border p-1.5 text-xs ${event.color}`}
                style={{ top, height, left, width }}
              >
                <p className="font-medium leading-tight">{event.title}</p>
                {event.room && <p className="mt-0.5 opacity-75">{event.room}</p>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
