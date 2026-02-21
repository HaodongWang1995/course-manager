import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@course-manager/ui";
import { Calendar, Clock, MapPin, BookOpen } from "lucide-react";
import { useStudentScheduleFromDB } from "@/hooks/use-queries";
import { EmptyState } from "@/components/empty-state";

export const Route = createFileRoute("/(app)/student/schedule")({
  component: StudentSchedule,
});

const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM to 7 PM

const dayIndexMap: Record<number, number> = { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 0: 6 };

const colors = [
  "bg-blue-100 border-blue-300 text-blue-800",
  "bg-green-100 border-green-300 text-green-800",
  "bg-purple-100 border-purple-300 text-purple-800",
  "bg-orange-100 border-orange-300 text-orange-800",
  "bg-pink-100 border-pink-300 text-pink-800",
  "bg-teal-100 border-teal-300 text-teal-800",
];

function StudentSchedule() {
  const { t } = useTranslation("studentSchedule");
  const { t: tSchedule } = useTranslation("schedule");
  const { data: schedules = [], isLoading } = useStudentScheduleFromDB();

  const dayNames = [
    tSchedule("days.mon"),
    tSchedule("days.tue"),
    tSchedule("days.wed"),
    tSchedule("days.thu"),
    tSchedule("days.fri"),
    tSchedule("days.sat"),
    tSchedule("days.sun"),
  ];

  const events = useMemo(() => {
    const courseColorMap = new Map<string, string>();
    let colorIdx = 0;

    return schedules.map((s) => {
      if (!courseColorMap.has(s.course_id)) {
        courseColorMap.set(s.course_id, colors[colorIdx % colors.length]);
        colorIdx++;
      }
      const start = new Date(s.start_time);
      const end = new Date(s.end_time);
      const dayOfWeek = dayIndexMap[start.getDay()];
      const startHour = start.getHours() + start.getMinutes() / 60;
      const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

      return {
        ...s,
        dayOfWeek,
        startHour,
        duration,
        color: courseColorMap.get(s.course_id)!,
      };
    });
  }, [schedules]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">{tSchedule("loading")}</div>
      </div>
    );
  }

  if (schedules.length === 0) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>
          <p className="mt-1 text-sm text-gray-500">{t("subtitle")}</p>
        </div>
        <EmptyState
          icon={Calendar}
          title={t("emptyTitle")}
          description={t("emptyDesc")}
        />
      </div>
    );
  }

  const courseCount = new Set(schedules.map((s) => s.course_id)).size;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>
        <p className="mt-1 text-sm text-gray-500">
          {t("courseCount", { courses: courseCount, lessons: schedules.length })}
        </p>
      </div>

      {/* Week Grid View */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {t("weeklyView")}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="min-w-[700px]">
              {/* Day headers */}
              <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-gray-200">
                <div className="p-2" />
                {dayNames.map((day) => (
                  <div
                    key={day}
                    className="border-l border-gray-200 p-2 text-center text-sm font-medium text-gray-600"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Time grid */}
              <div className="relative">
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-gray-100"
                    style={{ height: 60 }}
                  >
                    <div className="flex items-start justify-end pr-2 pt-1 text-xs text-gray-400">
                      {hour}:00
                    </div>
                    {dayNames.map((day) => (
                      <div key={day} className="border-l border-gray-100" />
                    ))}
                  </div>
                ))}

                {/* Events */}
                {events.map((event, idx) => {
                  if (event.dayOfWeek === undefined || event.startHour < 8) return null;
                  const top = (event.startHour - 8) * 60;
                  const height = Math.max(event.duration * 60, 30);
                  const colStart = event.dayOfWeek;

                  return (
                    <div
                      key={idx}
                      className={`absolute rounded-md border p-1.5 text-xs overflow-hidden ${event.color}`}
                      style={{
                        top,
                        height,
                        left: `calc(60px + ${colStart} * ((100% - 60px) / 7) + 2px)`,
                        width: `calc((100% - 60px) / 7 - 4px)`,
                      }}
                    >
                      <p className="truncate font-medium">{event.course_title}</p>
                      {height >= 45 && event.room && (
                        <p className="mt-0.5 flex items-center gap-0.5 truncate opacity-75">
                          <MapPin className="h-3 w-3 shrink-0" />
                          {event.room}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* List View */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            {t("courseList")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {schedules.map((schedule) => (
              <div
                key={schedule.id}
                className="flex items-center gap-4 rounded-lg border border-gray-200 p-4"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-600">
                  {schedule.lesson_number}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-medium text-gray-900">
                      {schedule.title || t("lesson", { number: schedule.lesson_number })}
                    </h4>
                    <Badge variant="outline" className="text-xs">
                      {schedule.course_title}
                    </Badge>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {new Date(schedule.start_time).toLocaleString()} -{" "}
                      {new Date(schedule.end_time).toLocaleTimeString()}
                    </span>
                    {schedule.room && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {schedule.room}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
