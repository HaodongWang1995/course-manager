import { Button, Card, CardContent, CardHeader, CardTitle } from "@course-manager/ui";
import { CalendarPlus } from "lucide-react";
import type { Deadline } from "@/api/client";
import type { CalendarEvent } from "./calendar-grid";
import { monthNames } from "./calendar-grid";

const deadlineColors = [
  "border-red-500 bg-red-50",
  "border-amber-500 bg-amber-50",
  "border-blue-500 bg-blue-50",
];

interface UpcomingListPanelProps {
  upcomingEvents: CalendarEvent[];
  deadlines: Deadline[];
  onAddEvent: () => void;
}

export function UpcomingListPanel({
  upcomingEvents,
  deadlines,
  onAddEvent,
}: UpcomingListPanelProps) {
  return (
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
            <p className="py-2 text-center text-xs text-gray-400">No upcoming events</p>
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
                  <p className="truncate text-sm font-medium text-gray-900">{event.title}</p>
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
                  {item.urgent
                    ? "Due Today"
                    : new Date(item.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
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
          <Button variant="outline" size="sm" className="text-xs" onClick={onAddEvent}>
            Quick Add Task
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
