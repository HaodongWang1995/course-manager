import { Button } from "@course-manager/ui";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import type { ScheduleEvent } from "../index";

const hours = Array.from({ length: 11 }, (_, i) => i + 8); // 8 AM to 6 PM

const courseColors = [
  { bg: "bg-blue-100", border: "border-blue-300", text: "text-blue-800", solid: "bg-blue-500" },
  { bg: "bg-purple-100", border: "border-purple-300", text: "text-purple-800", solid: "bg-purple-500" },
  { bg: "bg-green-100", border: "border-green-300", text: "text-green-800", solid: "bg-green-500" },
  { bg: "bg-orange-100", border: "border-orange-300", text: "text-orange-800", solid: "bg-orange-500" },
  { bg: "bg-pink-100", border: "border-pink-300", text: "text-pink-800", solid: "bg-pink-500" },
  { bg: "bg-teal-100", border: "border-teal-300", text: "text-teal-800", solid: "bg-teal-500" },
];

interface CalendarGridProps {
  weekEvents: ScheduleEvent[];
  weekDayLabels: Array<{ label: string; date: Date }>;
  todayColIdx: number;
  selectedEventId?: string;
  onSelectEvent: (event: ScheduleEvent | null) => void;
  onNavigateWeek: (dir: 1 | -1) => void;
  weekRangeLabel: string;
  onGoToToday: () => void;
  todayLabel: string;
}

export function CalendarGrid({
  weekEvents,
  weekDayLabels,
  todayColIdx,
  selectedEventId,
  onSelectEvent,
  onNavigateWeek,
  weekRangeLabel,
  onGoToToday,
  todayLabel,
}: CalendarGridProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      {/* Week nav */}
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <button className="rounded-lg p-1.5 hover:bg-gray-100" onClick={() => onNavigateWeek(-1)}>
            <ChevronLeft className="h-4 w-4 text-gray-500" />
          </button>
          <span className="text-sm font-semibold text-gray-900">{weekRangeLabel}</span>
          <button className="rounded-lg p-1.5 hover:bg-gray-100" onClick={() => onNavigateWeek(1)}>
            <ChevronRight className="h-4 w-4 text-gray-500" />
          </button>
        </div>
        <Button variant="outline" size="sm" onClick={onGoToToday}>
          {todayLabel}
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
                  {hour > 12 ? hour - 12 : hour}{hour >= 12 ? " PM" : " AM"}
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
              const isSelected = selectedEventId === event.id;

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
                  onClick={() => onSelectEvent(isSelected ? null : event)}
                >
                  <p className="truncate font-semibold leading-tight">{event.course_title}</p>
                  {height >= 40 && (
                    <p className="mt-0.5 truncate opacity-75">
                      {new Date(event.start_time).toLocaleTimeString("en-US", {
                        hour: "numeric", minute: "2-digit", hour12: true,
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
  );
}
