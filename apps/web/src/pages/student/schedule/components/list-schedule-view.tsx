import { useTranslation } from "react-i18next";
import { Calendar, MapPin } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import type { ScheduleEvent } from "../index";

const courseColors = [
  { bg: "bg-blue-100", border: "border-blue-300", text: "text-blue-800", solid: "bg-blue-500" },
  { bg: "bg-purple-100", border: "border-purple-300", text: "text-purple-800", solid: "bg-purple-500" },
  { bg: "bg-green-100", border: "border-green-300", text: "text-green-800", solid: "bg-green-500" },
  { bg: "bg-orange-100", border: "border-orange-300", text: "text-orange-800", solid: "bg-orange-500" },
  { bg: "bg-pink-100", border: "border-pink-300", text: "text-pink-800", solid: "bg-pink-500" },
  { bg: "bg-teal-100", border: "border-teal-300", text: "text-teal-800", solid: "bg-teal-500" },
];

interface ListScheduleViewProps {
  events: ScheduleEvent[];
  selectedEventId?: string;
  onSelectEvent: (event: ScheduleEvent | null) => void;
}

export function ListScheduleView({
  events,
  selectedEventId,
  onSelectEvent,
}: ListScheduleViewProps) {
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
          weekday: "short", month: "short", day: "numeric",
          hour: "numeric", minute: "2-digit", hour12: true,
        });
        const endTime = new Date(event.end_time).toLocaleTimeString("en-US", {
          hour: "numeric", minute: "2-digit", hour12: true,
        });

        return (
          <button
            key={event.id}
            className={`w-full rounded-xl border text-left transition-all ${
              isSelected
                ? "border-blue-300 bg-blue-50"
                : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
            }`}
            onClick={() => onSelectEvent(isSelected ? null : event)}
          >
            <div className="flex items-center gap-4 p-4">
              <div className={`h-10 w-1.5 rounded-full ${c.solid}`} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-gray-900">{event.course_title}</p>
                <p className="mt-0.5 text-sm text-gray-500">{startTime} – {endTime}</p>
                {event.room && (
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-400">
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
