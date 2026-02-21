import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Button,
  Card,
  CardContent,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Badge,
  ScrollArea,
} from "@course-manager/ui";
import {
  ChevronLeft,
  ChevronRight,
  X,
  MapPin,
  Calendar,
  List,
  ExternalLink,
  BookOpen,
  MessageSquare,
  FileText,
  Clock,
} from "lucide-react";
import { useStudentScheduleFromDB } from "@/hooks/use-queries";
import { EmptyState } from "@/components/empty-state";

export const Route = createFileRoute("/(app)/student/")({
  component: StudentDashboard,
});

const hours = Array.from({ length: 11 }, (_, i) => i + 8); // 8 AM to 6 PM
const dayNamesMap: Record<number, number> = { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4 }; // Mon-Fri → 0-4

const courseColors = [
  { bg: "bg-blue-100", border: "border-blue-300", text: "text-blue-800", solid: "bg-blue-500" },
  { bg: "bg-purple-100", border: "border-purple-300", text: "text-purple-800", solid: "bg-purple-500" },
  { bg: "bg-green-100", border: "border-green-300", text: "text-green-800", solid: "bg-green-500" },
  { bg: "bg-orange-100", border: "border-orange-300", text: "text-orange-800", solid: "bg-orange-500" },
  { bg: "bg-pink-100", border: "border-pink-300", text: "text-pink-800", solid: "bg-pink-500" },
  { bg: "bg-teal-100", border: "border-teal-300", text: "text-teal-800", solid: "bg-teal-500" },
];

type ScheduleEvent = {
  id: string;
  course_id: string;
  course_title: string;
  lesson_number: number;
  title?: string;
  start_time: string;
  end_time: string;
  room?: string;
  teacher_name?: string;
  dayOfWeek: number;
  startHour: number;
  duration: number;
  colorIdx: number;
  startDate: Date;
};

function StudentDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);

  const { data: schedules = [], isLoading } = useStudentScheduleFromDB();

  const dayNamesShort = [
    t("schedule.days.mon"),
    t("schedule.days.tue"),
    t("schedule.days.wed"),
    t("schedule.days.thu"),
    t("schedule.days.fri"),
  ];

  // Build course → color index map
  const courseColorMap = useMemo(() => {
    const map = new Map<string, number>();
    let idx = 0;
    schedules.forEach((s) => {
      if (!map.has(s.course_id)) {
        map.set(s.course_id, idx % courseColors.length);
        idx++;
      }
    });
    return map;
  }, [schedules]);

  // Monday of the current week
  const monday = useMemo(() => {
    const d = new Date(currentDate);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }, [currentDate]);

  const friday = useMemo(() => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + 4);
    return d;
  }, [monday]);

  // Events mapped to calendar grid
  const calendarEvents = useMemo<ScheduleEvent[]>(() =>
    schedules.map((s) => {
      const start = new Date(s.start_time);
      const end = new Date(s.end_time);
      const dayOfWeek = dayNamesMap[start.getDay()] ?? -1;
      const startHour = start.getHours() + start.getMinutes() / 60;
      const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      return {
        id: s.id,
        course_id: s.course_id,
        course_title: s.course_title,
        lesson_number: s.lesson_number,
        title: s.title,
        start_time: s.start_time,
        end_time: s.end_time,
        room: s.room,
        dayOfWeek,
        startHour,
        duration,
        colorIdx: courseColorMap.get(s.course_id) ?? 0,
        startDate: start,
      };
    }),
    [schedules, courseColorMap]
  );

  // Events within the current Mon-Fri week
  const weekEvents = useMemo(() =>
    calendarEvents.filter((e) => {
      const diff = Math.round((e.startDate.getTime() - monday.getTime()) / 86400000);
      return diff >= 0 && diff <= 4;
    }),
    [calendarEvents, monday]
  );

  // Today's column index
  const todayColIdx = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = Math.round((today.getTime() - monday.getTime()) / 86400000);
    return diff >= 0 && diff <= 4 ? diff : -1;
  }, [monday]);

  // Week header labels: "Mon 24", "Tue 25", etc.
  const weekDayLabels = useMemo(() =>
    Array.from({ length: 5 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return { label: `${dayNamesShort[i]} ${d.getDate()}`, date: d };
    }),
    [monday]
  );

  // Navigate week
  const navigateWeek = (dir: 1 | -1) => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + dir * 7);
      return d;
    });
    setSelectedEvent(null);
  };

  // Mobile: group today's events by period
  const todayEvents = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return calendarEvents.filter((e) => {
      const d = new Date(e.startDate);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === today.getTime();
    }).sort((a, b) => a.startHour - b.startHour);
  }, [calendarEvents]);

  const morningEvents = todayEvents.filter((e) => e.startHour < 12);
  const afternoonEvents = todayEvents.filter((e) => e.startHour >= 12);

  const weekRangeLabel = `${monday.toLocaleDateString("en-US", { month: "long", day: "numeric" })} - ${friday.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`;

  if (isLoading) {
    return <div className="flex items-center justify-center py-12 text-gray-500">{t("schedule.loading")}</div>;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("schedule.title")}</h1>
          <p className="text-sm text-gray-500">{weekRangeLabel}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
            className="gap-1.5"
          >
            <List className="h-4 w-4" />
            {t("schedule.listView")}
          </Button>
          <Button
            variant={viewMode === "calendar" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("calendar")}
            className="gap-1.5"
          >
            <Calendar className="h-4 w-4" />
            {t("schedule.calendarView")}
          </Button>
        </div>
      </div>

      {schedules.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title={t("schedule.noSchedule.title")}
          description={t("schedule.noSchedule.description")}
        />
      ) : (
        <>
          {/* ── Mobile: List view grouped by period ── */}
          <div className="lg:hidden">
            <MobileScheduleView
              morningEvents={morningEvents}
              afternoonEvents={afternoonEvents}
              courseColors={courseColors}
              onGoToFeedback={(courseId) => navigate({ to: `/student/feedback/${courseId}` })}
              onViewCourse={(courseId) => navigate({ to: `/student/courses/${courseId}` })}
            />
          </div>

          {/* ── Desktop: Calendar or List view ── */}
          <div className="hidden lg:block">
            {viewMode === "list" ? (
              <ListScheduleView
                events={calendarEvents}
                courseColors={courseColors}
                onSelectEvent={setSelectedEvent}
                selectedEventId={selectedEvent?.id}
              />
            ) : (
              <div className={`flex gap-4 ${selectedEvent ? "items-start" : ""}`}>
                {/* Calendar grid */}
                <div className={`flex-1 overflow-hidden rounded-xl border border-gray-200 bg-white ${selectedEvent ? "min-w-0" : ""}`}>
                  {/* Week nav */}
                  <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        className="rounded-lg p-1.5 hover:bg-gray-100"
                        onClick={() => navigateWeek(-1)}
                      >
                        <ChevronLeft className="h-4 w-4 text-gray-500" />
                      </button>
                      <span className="text-sm font-semibold text-gray-900">{weekRangeLabel}</span>
                      <button
                        className="rounded-lg p-1.5 hover:bg-gray-100"
                        onClick={() => navigateWeek(1)}
                      >
                        <ChevronRight className="h-4 w-4 text-gray-500" />
                      </button>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => { setCurrentDate(new Date()); setSelectedEvent(null); }}
                    >
                      {t("schedule.today")}
                    </Button>
                  </div>

                  {/* Grid */}
                  <div className="overflow-x-auto">
                    <div className="min-w-[600px]">
                      {/* Day headers */}
                      <div className="grid grid-cols-[56px_repeat(5,1fr)] border-b border-gray-100">
                        <div />
                        {weekDayLabels.map((d, i) => (
                          <div
                            key={d.label}
                            className={`border-l border-gray-100 py-2 text-center text-sm font-medium ${
                              i === todayColIdx ? "bg-blue-50 text-blue-600" : "text-gray-600"
                            }`}
                          >
                            {d.label}
                          </div>
                        ))}
                      </div>

                      {/* Time rows */}
                      <div className="relative">
                        {hours.map((hour) => (
                          <div
                            key={hour}
                            className="grid grid-cols-[56px_repeat(5,1fr)] border-b border-gray-50"
                            style={{ height: 60 }}
                          >
                            <div className="flex items-start justify-end pr-2 pt-1 text-[11px] text-gray-400">
                              {hour > 12 ? hour - 12 : hour}
                              {hour >= 12 ? " PM" : " AM"}
                            </div>
                            {[0, 1, 2, 3, 4].map((col) => (
                              <div
                                key={col}
                                className={`border-l border-gray-50 ${col === todayColIdx ? "bg-blue-50/30" : ""}`}
                              />
                            ))}
                          </div>
                        ))}

                        {/* Events */}
                        {weekEvents.filter((e) => e.dayOfWeek >= 0 && e.startHour >= 8).map((event) => {
                          const top = (event.startHour - 8) * 60;
                          const height = Math.max(event.duration * 60, 24);
                          const col = event.dayOfWeek;
                          const c = courseColors[event.colorIdx];
                          const isSelected = selectedEvent?.id === event.id;

                          return (
                            <button
                              key={event.id}
                              className={`absolute rounded-md border p-1.5 text-left text-xs transition-all ${c.bg} ${c.border} ${c.text} ${
                                isSelected ? "ring-2 ring-blue-400 ring-offset-1" : "hover:brightness-95"
                              }`}
                              style={{
                                top,
                                height,
                                left: `calc(56px + ${col} * ((100% - 56px) / 5) + 2px)`,
                                width: `calc((100% - 56px) / 5 - 4px)`,
                              }}
                              onClick={() => setSelectedEvent(isSelected ? null : event)}
                            >
                              <p className="truncate font-semibold leading-tight">{event.course_title}</p>
                              {height >= 40 && (
                                <p className="mt-0.5 truncate opacity-75">
                                  {new Date(event.start_time).toLocaleTimeString("en-US", {
                                    hour: "numeric",
                                    minute: "2-digit",
                                    hour12: true,
                                  })}
                                </p>
                              )}
                              {height >= 55 && event.room && (
                                <p className="mt-0.5 flex items-center gap-0.5 truncate opacity-75">
                                  <MapPin className="h-2.5 w-2.5 shrink-0" />
                                  {event.room}
                                </p>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right detail panel */}
                {selectedEvent && (
                  <CourseDetailPanel
                    event={selectedEvent}
                    colorIdx={selectedEvent.colorIdx}
                    onClose={() => setSelectedEvent(null)}
                    onNavigate={() => navigate({ to: `/student/courses/${selectedEvent.course_id}` })}
                    onFeedback={() => navigate({ to: `/student/feedback/${selectedEvent.course_id}` })}
                  />
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ── Right Detail Panel ─────────────────────────────────
function CourseDetailPanel({
  event,
  colorIdx,
  onClose,
  onNavigate,
  onFeedback,
}: {
  event: ScheduleEvent;
  colorIdx: number;
  onClose: () => void;
  onNavigate: () => void;
  onFeedback: () => void;
}) {
  const { t } = useTranslation();
  const c = courseColors[colorIdx];
  const startTime = new Date(event.start_time).toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  const endTime = new Date(event.end_time).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <div className="w-[300px] shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-white">
      {/* Header */}
      <div className={`relative ${c.bg} p-4`}>
        <button
          className="absolute right-2 top-2 rounded-lg p-1 hover:bg-black/10"
          onClick={onClose}
        >
          <X className="h-4 w-4 text-gray-600" />
        </button>
        <Badge className="mb-2 text-xs font-medium bg-white/70 text-gray-700 border-0">
          {t("schedule.requiredCourse")}
        </Badge>
        <h3 className="pr-6 text-base font-bold text-gray-900">{event.course_title}</h3>
        <p className="mt-1 text-xs text-gray-600">
          {startTime} – {endTime}
        </p>
        {event.room && (
          <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
            <MapPin className="h-3 w-3" />
            {event.room}
          </p>
        )}
      </div>

      {/* Join Class Stream button */}
      <div className="border-b border-gray-100 px-4 py-3">
        <Button className="w-full gap-2 bg-blue-600 hover:bg-blue-700" size="sm">
          <ExternalLink className="h-4 w-4" />
          {t("schedule.joinStream")}
        </Button>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="instructions">
        <TabsList className="w-full rounded-none border-b border-gray-100 bg-white px-4 justify-start gap-0 h-auto p-0">
          <TabsTrigger
            value="instructions"
            className="rounded-none border-b-2 border-transparent px-3 py-2.5 text-xs data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:bg-transparent"
          >
            {t("schedule.instructions")}
          </TabsTrigger>
          <TabsTrigger
            value="feedback"
            className="rounded-none border-b-2 border-transparent px-3 py-2.5 text-xs data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:bg-transparent"
          >
            {t("schedule.feedback")}
          </TabsTrigger>
          <TabsTrigger
            value="resources"
            className="rounded-none border-b-2 border-transparent px-3 py-2.5 text-xs data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:bg-transparent"
          >
            {t("schedule.resources")}
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="h-[260px]">
          <TabsContent value="instructions" className="m-0 p-4">
            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{t("schedule.classAgenda")}</p>
                <p className="mt-1 text-sm text-gray-600">
                  Today's session covers the scheduled curriculum for {event.course_title}.
                  {event.title ? ` Topic: ${event.title}.` : ""}
                </p>
              </div>
              <button
                onClick={onNavigate}
                className="flex w-full items-center gap-2 rounded-lg border border-gray-200 p-3 text-left text-sm hover:bg-gray-50"
              >
                <FileText className="h-4 w-4 shrink-0 text-gray-400" />
                <span className="text-gray-700">{t("schedule.viewSyllabus")}</span>
                <ExternalLink className="ml-auto h-3.5 w-3.5 text-gray-400" />
              </button>
            </div>
          </TabsContent>

          <TabsContent value="feedback" className="m-0 p-4">
            <button
              onClick={onFeedback}
              className="flex w-full items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 text-left hover:bg-blue-100"
            >
              <MessageSquare className="h-4 w-4 shrink-0 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">{t("schedule.postFeedback")}</span>
              <ExternalLink className="ml-auto h-3.5 w-3.5 text-blue-500" />
            </button>
          </TabsContent>

          <TabsContent value="resources" className="m-0 p-4">
            <button
              onClick={() => {}}
              className="flex w-full items-center gap-2 rounded-lg border border-gray-200 p-3 text-left text-sm hover:bg-gray-50"
            >
              <BookOpen className="h-4 w-4 shrink-0 text-gray-400" />
              <span className="text-gray-700">{t("schedule.viewResources")}</span>
              <ExternalLink className="ml-auto h-3.5 w-3.5 text-gray-400" />
            </button>
          </TabsContent>
        </ScrollArea>
      </Tabs>

      {/* See Course Syllabus footer */}
      <div className="border-t border-gray-100 px-4 py-3">
        <button
          onClick={onNavigate}
          className="text-xs font-medium text-blue-600 hover:underline"
        >
          {t("schedule.seeSyllabus")}
        </button>
      </div>
    </div>
  );
}

type CourseColorEntry = { bg: string; border: string; text: string; solid: string };

// ── Mobile Schedule View ───────────────────────────────
function MobileScheduleView({
  morningEvents,
  afternoonEvents,
  courseColors,
  onGoToFeedback,
  onViewCourse,
}: {
  morningEvents: ScheduleEvent[];
  afternoonEvents: ScheduleEvent[];
  courseColors: CourseColorEntry[];
  onGoToFeedback: (courseId: string) => void;
  onViewCourse: (courseId: string) => void;
}) {
  const { t } = useTranslation();
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const renderEvent = (event: ScheduleEvent) => {
    const c = courseColors[event.colorIdx];
    const startTime = new Date(event.start_time).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    const endTime = new Date(event.end_time).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    return (
      <div key={event.id} className={`rounded-xl border-l-4 ${c.border.replace("border-", "border-l-")} bg-white shadow-sm overflow-hidden`}>
        <div className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                {startTime} – {endTime}
              </p>
              <h4 className="mt-1 text-base font-semibold text-gray-900">{event.course_title}</h4>
              {event.room && (
                <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
                  <MapPin className="h-3 w-3" />
                  {event.room}
                </p>
              )}
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs gap-1.5"
              onClick={() => onViewCourse(event.course_id)}
            >
              <FileText className="h-3.5 w-3.5" />
              {t("schedule.requirements")}
            </Button>
            <Button
              size="sm"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-xs gap-1.5"
              onClick={() => onGoToFeedback(event.course_id)}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              {t("schedule.postFeedback")}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  if (morningEvents.length === 0 && afternoonEvents.length === 0) {
    return (
      <div className="space-y-4">
        <p className="text-sm font-medium text-gray-500">{today}</p>
        <EmptyState
          icon={Clock}
          title={t("schedule.noClassesToday.title")}
          description={t("schedule.noClassesToday.description")}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm font-medium text-gray-500">{today}</p>
      {morningEvents.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">{t("schedule.morning")}</h3>
          {morningEvents.map(renderEvent)}
        </div>
      )}
      {afternoonEvents.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">{t("schedule.afternoon")}</h3>
          {afternoonEvents.map(renderEvent)}
        </div>
      )}
    </div>
  );
}

// ── List Schedule View ─────────────────────────────────
function ListScheduleView({
  events,
  courseColors,
  onSelectEvent,
  selectedEventId,
}: {
  events: ScheduleEvent[];
  courseColors: CourseColorEntry[];
  onSelectEvent: (event: ScheduleEvent) => void;
  selectedEventId?: string;
}) {
  const { t } = useTranslation();
  const sorted = [...events].sort(
    (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  );

  if (sorted.length === 0) {
    return (
      <EmptyState
        icon={Calendar}
        title={t("schedule.noClassesScheduled.title")}
        description={t("schedule.noClassesScheduled.description")}
      />
    );
  }

  return (
    <div className="space-y-2">
      {sorted.map((event) => {
        const c = courseColors[event.colorIdx];
        const isSelected = selectedEventId === event.id;
        const startTime = new Date(event.start_time).toLocaleString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });
        const endTime = new Date(event.end_time).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });

        return (
          <button
            key={event.id}
            className={`w-full rounded-xl border text-left transition-all ${
              isSelected
                ? "border-blue-300 bg-blue-50"
                : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
            }`}
            onClick={() => onSelectEvent(isSelected ? null as unknown as ScheduleEvent : event)}
          >
            <div className="flex items-center gap-4 p-4">
              <div className={`h-10 w-1.5 rounded-full ${c.solid}`} />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{event.course_title}</p>
                <p className="mt-0.5 text-sm text-gray-500">
                  {startTime} – {endTime}
                </p>
                {event.room && (
                  <p className="flex items-center gap-1 mt-0.5 text-xs text-gray-400">
                    <MapPin className="h-3 w-3" />
                    {event.room}
                  </p>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
