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
import { Plus, Clock, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import { useTeacherSchedule, useTeacherCourses, useUpcomingDeadlines, useAddSchedule } from "@/hooks/use-queries";

export const Route = createFileRoute("/(app)/teacher/calendar")({
  component: TeacherCalendar,
});

const hours = Array.from({ length: 10 }, (_, i) => i + 8); // 8 AM to 5 PM
const dayNamesFull = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const dayIndexMap: Record<number, number> = { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4 }; // Mon-Fri → 0-4

const eventColors = [
  "bg-blue-100 border-blue-300 text-blue-800",
  "bg-green-100 border-green-300 text-green-800",
  "bg-purple-100 border-purple-300 text-purple-800",
  "bg-orange-100 border-orange-300 text-orange-800",
  "bg-red-100 border-red-300 text-red-800",
  "bg-teal-100 border-teal-300 text-teal-800",
];

function TeacherCalendar() {
  const [view, setView] = useState("week");
  const [showNewEvent, setShowNewEvent] = useState(false);
  const { data: schedules = [] } = useTeacherSchedule();
  const { data: deadlines = [] } = useUpcomingDeadlines();

  // Map DB schedules to calendar events
  const calendarEvents = useMemo(() => {
    const courseColorMap = new Map<string, string>();
    let colorIdx = 0;

    return schedules.map((s) => {
      if (!courseColorMap.has(s.course_id)) {
        courseColorMap.set(s.course_id, eventColors[colorIdx % eventColors.length]);
        colorIdx++;
      }
      const start = new Date(s.start_time);
      const end = new Date(s.end_time);
      const dayOfWeek = dayIndexMap[start.getDay()] ?? -1;
      const startHour = start.getHours() + start.getMinutes() / 60;
      const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

      return {
        day: dayOfWeek,
        startHour,
        duration,
        title: s.course_title,
        room: s.room || "",
        color: courseColorMap.get(s.course_id)!,
        date: start,
      };
    });
  }, [schedules]);

  // Get current week days
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  const weekDays = Array.from({ length: 5 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return `${dayNamesFull[d.getDay()]} ${d.getDate()}`;
  });

  const todayDayIdx = dayIndexMap[now.getDay()] ?? -1;

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
                  <button className="rounded-lg p-1 hover:bg-gray-100">
                    <ChevronLeft className="h-5 w-5 text-gray-500" />
                  </button>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {view === "day"
                      ? now.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
                      : `${monday.toLocaleDateString("en-US", { month: "long", day: "numeric" })} - ${new Date(monday.getTime() + 4 * 86400000).toLocaleDateString("en-US", { day: "numeric", year: "numeric" })}`}
                  </h2>
                  <button className="rounded-lg p-1 hover:bg-gray-100">
                    <ChevronRight className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
                <Button variant="outline" size="sm">
                  Today
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {view === "day" ? (
                <DayView
                  events={calendarEvents.filter((e) => e.day === todayDayIdx)}
                  dayLabel={weekDays[todayDayIdx] || "Today"}
                />
              ) : (
                <WeekView events={calendarEvents} weekDays={weekDays} todayIdx={todayDayIdx} />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Schedule Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Schedule Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{schedules.length}</p>
                <p className="text-xs text-gray-500">Total lessons</p>
              </div>
            </CardContent>
          </Card>

          {/* Deadlines */}
          {deadlines.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Deadlines</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {deadlines.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg border border-gray-100 p-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.title}</p>
                    </div>
                    <span className={`whitespace-nowrap text-xs font-medium ${item.urgent ? "text-red-500" : "text-gray-500"}`}>
                      {new Date(item.due_date).toLocaleDateString("zh-CN")}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <NewEventDialog open={showNewEvent} onOpenChange={setShowNewEvent} />
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
function WeekView({ events, weekDays, todayIdx }: { events: Array<{ day: number; startHour: number; duration: number; title: string; room: string; color: string }>; weekDays: string[]; todayIdx: number }) {
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[700px]">
        <div className="grid grid-cols-[60px_repeat(5,1fr)] border-b border-gray-200">
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
              className="grid grid-cols-[60px_repeat(5,1fr)] border-b border-gray-100"
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
          {events.filter((e) => e.day >= 0 && e.day < 5).map((event, idx) => {
            const top = (event.startHour - 8) * 60;
            const height = event.duration * 60;
            const left = `calc(60px + ${event.day} * ((100% - 60px) / 5) + 2px)`;
            const width = `calc((100% - 60px) / 5 - 4px)`;
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
