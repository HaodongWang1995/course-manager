import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Badge } from "@course-manager/ui";
import { ScheduleCard } from "@course-manager/ui";
import { Bell, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { useStudentSchedule } from "@/hooks/use-queries";

export const Route = createFileRoute("/student/")({
  component: StudentSchedule,
});

const days = [
  { label: "Mon", date: 21 },
  { label: "Tue", date: 22 },
  { label: "Wed", date: 23 },
  { label: "Thu", date: 24 },
  { label: "Fri", date: 25 },
  { label: "Sat", date: 26 },
];

const tagColors: Record<string, string> = {
  "Material Ready": "bg-blue-100 text-blue-700",
  "No New Feedback": "bg-gray-100 text-gray-600",
  "Quiz Tomorrow": "bg-amber-100 text-amber-700",
  "Feedback Posted": "bg-green-100 text-green-700",
};

function StudentSchedule() {
  const navigate = useNavigate();
  const { data: schedule = [] } = useStudentSchedule();
  const [selectedDay, setSelectedDay] = useState(24);

  const morningClasses = useMemo(() => {
    return schedule
      .filter((c) => c.section === "morning")
      .map((c) => ({
        ...c,
        tag: c.tag || "",
        tagColor: tagColors[c.tag || ""] || "bg-gray-100 text-gray-600",
      }));
  }, [schedule]);

  const afternoonClasses = useMemo(() => {
    return schedule
      .filter((c) => c.section === "afternoon")
      .map((c) => ({
        ...c,
        tag: c.tag || "",
        tagColor: tagColors[c.tag || ""] || "bg-gray-100 text-gray-600",
      }));
  }, [schedule]);
  return (
    <div className="mx-auto max-w-lg space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Schedule</h1>
          <p className="mt-0.5 text-sm text-gray-500">October 24</p>
        </div>
        <button className="relative rounded-full bg-white p-2.5 shadow-sm border border-gray-200">
          <Bell className="h-5 w-5 text-gray-600" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
        </button>
      </div>

      {/* Day Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {days.map((day) => {
          const isActive = day.date === selectedDay;
          return (
            <button
              key={day.date}
              onClick={() => setSelectedDay(day.date)}
              className={`flex flex-col items-center gap-1 rounded-xl px-3.5 py-2.5 text-center transition-colors ${
                isActive
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              <span className={`text-xs font-medium ${isActive ? "text-blue-100" : "text-gray-400"}`}>
                {day.label}
              </span>
              <span className={`text-sm font-bold ${isActive ? "text-white" : "text-gray-900"}`}>
                {day.date}
              </span>
            </button>
          );
        })}
      </div>

      {/* Weekly / Monthly Toggle */}
      <div className="flex rounded-lg bg-gray-100 p-1">
        <button className="flex-1 rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-900 shadow-sm">
          Weekly
        </button>
        <button className="flex-1 rounded-md px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">
          Monthly
        </button>
      </div>

      {/* Morning Classes */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
            Morning Classes
          </h2>
          <ChevronRight className="h-4 w-4 text-gray-400" />
        </div>
        <div className="space-y-3">
          {morningClasses.map((cls) => (
            <div key={cls.courseName} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-sm font-semibold text-gray-900">{cls.courseName}</h3>
                <span
                  className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                    cls.status === "in-progress"
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : cls.status === "upcoming"
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-green-50 text-green-700 border-green-200"
                  }`}
                >
                  {cls.status === "in-progress"
                    ? "In Progress"
                    : cls.status === "upcoming"
                      ? "Upcoming"
                      : "Completed"}
                </span>
              </div>
              {/* Details */}
              <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                <span>{cls.teacher}</span>
                <span className="text-gray-300">|</span>
                <span>{cls.room}</span>
                <span className="text-gray-300">|</span>
                <span>{cls.startTime} - {cls.endTime}</span>
              </div>
              {/* Tag */}
              <div className="mt-3">
                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${cls.tagColor}`}>
                  {cls.tag}
                </span>
              </div>
              {/* Actions */}
              <div className="mt-3 flex items-center gap-2">
                <button className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                  View Requirements
                </button>
                <button
                  onClick={() => navigate({ to: `/student/feedback/${cls.id}` })}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Read Feedback
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Afternoon Classes */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
            Afternoon Classes
          </h2>
          <ChevronRight className="h-4 w-4 text-gray-400" />
        </div>
        <div className="space-y-3">
          {afternoonClasses.map((cls) => (
            <div key={cls.courseName} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-sm font-semibold text-gray-900">{cls.courseName}</h3>
                <span
                  className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                    cls.status === "in-progress"
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : cls.status === "upcoming"
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-green-50 text-green-700 border-green-200"
                  }`}
                >
                  {cls.status === "in-progress"
                    ? "In Progress"
                    : cls.status === "upcoming"
                      ? "Upcoming"
                      : "Completed"}
                </span>
              </div>
              {/* Details */}
              <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                <span>{cls.teacher}</span>
                <span className="text-gray-300">|</span>
                <span>{cls.room}</span>
                <span className="text-gray-300">|</span>
                <span>{cls.startTime} - {cls.endTime}</span>
              </div>
              {/* Tag */}
              <div className="mt-3">
                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${cls.tagColor}`}>
                  {cls.tag}
                </span>
              </div>
              {/* Actions */}
              <div className="mt-3 flex items-center gap-2">
                <button className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                  View Requirements
                </button>
                <button
                  onClick={() => navigate({ to: `/student/feedback/${cls.id}` })}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Read Feedback
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
