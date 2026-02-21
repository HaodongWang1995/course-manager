import { useState, useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Button } from "@course-manager/ui";
import { Calendar, List } from "lucide-react";
import { useStudentScheduleFromDB } from "@/hooks/use-queries";
import { EmptyState } from "@/components/empty-state";
import { CalendarGrid } from "./components/calendar-grid";
import { CourseDetailPanel } from "./components/course-detail-panel";
import { ListScheduleView } from "./components/list-schedule-view";
import { MobileScheduleView } from "./components/mobile-schedule-view";

const dayNamesMap: Record<number, number> = { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4 }; // Mon-Fri → 0-4

export type ScheduleEvent = {
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

const COLOR_COUNT = 6;

export function StudentSchedulePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);

  const { data: schedules = [], isLoading } = useStudentScheduleFromDB();

  const dayNamesShort = [
    t("schedule.days.mon"), t("schedule.days.tue"), t("schedule.days.wed"),
    t("schedule.days.thu"), t("schedule.days.fri"),
  ];

  // Course → color index map
  const courseColorMap = useMemo(() => {
    const map = new Map<string, number>();
    let idx = 0;
    schedules.forEach((s) => {
      if (!map.has(s.course_id)) { map.set(s.course_id, idx % COLOR_COUNT); idx++; }
    });
    return map;
  }, [schedules]);

  // Monday of the current week
  const monday = useMemo(() => {
    const d = new Date(currentDate);
    const day = d.getDay();
    d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
    d.setHours(0, 0, 0, 0);
    return d;
  }, [currentDate]);

  const friday = useMemo(() => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + 4);
    return d;
  }, [monday]);

  const calendarEvents = useMemo<ScheduleEvent[]>(() =>
    schedules.map((s) => {
      const start = new Date(s.start_time);
      const end = new Date(s.end_time);
      return {
        id: s.id,
        course_id: s.course_id,
        course_title: s.course_title,
        lesson_number: s.lesson_number,
        title: s.title,
        start_time: s.start_time,
        end_time: s.end_time,
        room: s.room,
        dayOfWeek: dayNamesMap[start.getDay()] ?? -1,
        startHour: start.getHours() + start.getMinutes() / 60,
        duration: (end.getTime() - start.getTime()) / (1000 * 60 * 60),
        colorIdx: courseColorMap.get(s.course_id) ?? 0,
        startDate: start,
      };
    }),
    [schedules, courseColorMap]
  );

  const weekEvents = useMemo(() =>
    calendarEvents.filter((e) => {
      const diff = Math.round((e.startDate.getTime() - monday.getTime()) / 86400000);
      return diff >= 0 && diff <= 4;
    }),
    [calendarEvents, monday]
  );

  const todayColIdx = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = Math.round((today.getTime() - monday.getTime()) / 86400000);
    return diff >= 0 && diff <= 4 ? diff : -1;
  }, [monday]);

  const weekDayLabels = useMemo(() =>
    Array.from({ length: 5 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return { label: `${dayNamesShort[i]} ${d.getDate()}`, date: d };
    }),
    [monday, dayNamesShort]
  );

  const todayEvents = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return calendarEvents
      .filter((e) => { const d = new Date(e.startDate); d.setHours(0, 0, 0, 0); return d.getTime() === today.getTime(); })
      .sort((a, b) => a.startHour - b.startHour);
  }, [calendarEvents]);

  const navigateWeek = (dir: 1 | -1) => {
    setCurrentDate((prev) => { const d = new Date(prev); d.setDate(d.getDate() + dir * 7); return d; });
    setSelectedEvent(null);
  };

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
          <Button variant={viewMode === "list" ? "default" : "outline"} size="sm" onClick={() => setViewMode("list")} className="gap-1.5">
            <List className="h-4 w-4" />
            {t("schedule.listView")}
          </Button>
          <Button variant={viewMode === "calendar" ? "default" : "outline"} size="sm" onClick={() => setViewMode("calendar")} className="gap-1.5">
            <Calendar className="h-4 w-4" />
            {t("schedule.calendarView")}
          </Button>
        </div>
      </div>

      {schedules.length === 0 ? (
        <EmptyState icon={Calendar} title={t("schedule.noSchedule.title")} description={t("schedule.noSchedule.description")} />
      ) : (
        <>
          {/* Mobile */}
          <div className="lg:hidden">
            <MobileScheduleView
              morningEvents={todayEvents.filter((e) => e.startHour < 12)}
              afternoonEvents={todayEvents.filter((e) => e.startHour >= 12)}
              onGoToFeedback={(courseId) => navigate({ to: `/student/feedback/${courseId}` })}
              onViewCourse={(courseId) => navigate({ to: `/student/courses/${courseId}` })}
            />
          </div>

          {/* Desktop */}
          <div className="hidden lg:block">
            {viewMode === "list" ? (
              <ListScheduleView
                events={calendarEvents}
                selectedEventId={selectedEvent?.id}
                onSelectEvent={setSelectedEvent}
              />
            ) : (
              <div className={`flex gap-4 ${selectedEvent ? "items-start" : ""}`}>
                <div className={`flex-1 overflow-hidden ${selectedEvent ? "min-w-0" : ""}`}>
                  <CalendarGrid
                    weekEvents={weekEvents}
                    weekDayLabels={weekDayLabels}
                    todayColIdx={todayColIdx}
                    selectedEventId={selectedEvent?.id}
                    onSelectEvent={setSelectedEvent}
                    onNavigateWeek={navigateWeek}
                    weekRangeLabel={weekRangeLabel}
                    onGoToToday={() => { setCurrentDate(new Date()); setSelectedEvent(null); }}
                    todayLabel={t("schedule.today")}
                  />
                </div>
                {selectedEvent && (
                  <CourseDetailPanel
                    event={selectedEvent}
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
