import { useTranslation } from "react-i18next";
import { Button } from "@course-manager/ui";
import { Clock, ExternalLink, FileText, MapPin, MessageSquare } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import type { ScheduleEvent } from "../index";

function isUrl(str: string) {
  return /^https?:\/\//i.test(str);
}

const courseColors = [
  { bg: "bg-blue-100", border: "border-blue-300", text: "text-blue-800", solid: "bg-blue-500" },
  { bg: "bg-purple-100", border: "border-purple-300", text: "text-purple-800", solid: "bg-purple-500" },
  { bg: "bg-green-100", border: "border-green-300", text: "text-green-800", solid: "bg-green-500" },
  { bg: "bg-orange-100", border: "border-orange-300", text: "text-orange-800", solid: "bg-orange-500" },
  { bg: "bg-pink-100", border: "border-pink-300", text: "text-pink-800", solid: "bg-pink-500" },
  { bg: "bg-teal-100", border: "border-teal-300", text: "text-teal-800", solid: "bg-teal-500" },
];

interface MobileScheduleViewProps {
  morningEvents: ScheduleEvent[];
  afternoonEvents: ScheduleEvent[];
  upcomingEvents?: ScheduleEvent[];
  onGoToFeedback: (courseId: string) => void;
  onViewCourse: (courseId: string) => void;
}

export function MobileScheduleView({
  morningEvents,
  afternoonEvents,
  upcomingEvents = [],
  onGoToFeedback,
  onViewCourse,
}: MobileScheduleViewProps) {
  const { t } = useTranslation();
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  });

  const renderEvent = (event: ScheduleEvent) => {
    const c = courseColors[event.colorIdx];
    const startTime = new Date(event.start_time).toLocaleTimeString("en-US", {
      hour: "numeric", minute: "2-digit", hour12: true,
    });
    const endTime = new Date(event.end_time).toLocaleTimeString("en-US", {
      hour: "numeric", minute: "2-digit", hour12: true,
    });

    return (
      <div key={event.id} className={`overflow-hidden rounded-xl border-l-4 ${c.border.replace("border-", "border-l-")} bg-white shadow-sm`}>
        <div className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                {startTime} – {endTime}
              </p>
              <h4 className="mt-1 text-base font-semibold text-gray-900">{event.course_title}</h4>
              {event.room && (
                isUrl(event.room) ? (
                  <a
                    href={event.room}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-0.5 flex items-center gap-1 text-xs text-blue-600 hover:underline font-medium"
                  >
                    <ExternalLink className="h-3 w-3" />
                    {t("schedule.joinRoom")}
                  </a>
                ) : (
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
                    <MapPin className="h-3 w-3" />
                    {event.room}
                  </p>
                )
              )}
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <Button variant="outline" size="sm" className="flex-1 gap-1.5 text-xs" onClick={() => onViewCourse(event.course_id)}>
              <FileText className="h-3.5 w-3.5" />
              {t("schedule.requirements")}
            </Button>
            <Button size="sm" className="flex-1 gap-1.5 bg-blue-600 text-xs hover:bg-blue-700" onClick={() => onGoToFeedback(event.course_id)}>
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
        {upcomingEvents.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">{t("schedule.upcomingClasses")}</h3>
            {upcomingEvents.map((event) => {
              const c = courseColors[event.colorIdx];
              const dateLabel = event.startDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
              const startTime = new Date(event.start_time).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
              const endTime = new Date(event.end_time).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
              return (
                <div key={event.id} className={`overflow-hidden rounded-xl border-l-4 ${c.border.replace("border-", "border-l-")} bg-white shadow-sm`}>
                  <div className="p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{dateLabel} · {startTime} – {endTime}</p>
                    <h4 className="mt-1 text-base font-semibold text-gray-900">{event.course_title}</h4>
                    {event.room && (
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
                        <MapPin className="h-3 w-3" />
                        {event.room}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
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
