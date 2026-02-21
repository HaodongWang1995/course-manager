import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, Button } from "@course-manager/ui";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";

// Shared constants
const hours = Array.from({ length: 10 }, (_, i) => i + 8); // 8 AM to 5 PM

// PostgreSQL TIMESTAMP strips timezone to keep wall-clock time as intended
function parseLocalTime(isoStr: string): Date {
  const normalized = isoStr.replace(/Z$/, "").replace(/[+-]\d{2}:\d{2}$/, "");
  return new Date(normalized);
}

export { parseLocalTime };

export interface CalendarEvent {
  day: number;
  startHour: number;
  duration: number;
  title: string;
  room: string;
  color: string;
  bgColor: string;
  date: Date;
  startTime: string;
}

interface CalendarGridProps {
  view: string;
  headerTitle: string;
  allEvents: CalendarEvent[];
  currentDate: Date;
  sunday: Date;
  weekDays: string[];
  todayDayIdx: number;
  onNavigate: (dir: 1 | -1) => void;
  onSetToday: () => void;
  onDayClick: (d: Date) => void;
}

export function CalendarGrid({
  view,
  headerTitle,
  allEvents,
  currentDate,
  sunday,
  weekDays,
  todayDayIdx,
  onNavigate,
  onSetToday,
  onDayClick,
}: CalendarGridProps) {
  const { t } = useTranslation("teacherCalendar");
  const weekEvents = useMemo(
    () =>
      allEvents.filter((e) => {
        const diff = Math.floor((e.date.getTime() - sunday.getTime()) / 86400000);
        return diff >= 0 && diff < 7;
      }),
    [allEvents, sunday]
  );

  const dayEvents = useMemo(() => {
    const target = new Date(currentDate);
    target.setHours(0, 0, 0, 0);
    return allEvents.filter((e) => {
      const d = new Date(e.date);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === target.getTime();
    });
  }, [allEvents, currentDate]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="rounded-lg p-1 hover:bg-gray-100" onClick={() => onNavigate(-1)}>
              <ChevronLeft className="h-5 w-5 text-gray-500" />
            </button>
            <h2 className="text-lg font-semibold text-gray-900">{headerTitle}</h2>
            <button className="rounded-lg p-1 hover:bg-gray-100" onClick={() => onNavigate(1)}>
              <ChevronRight className="h-5 w-5 text-gray-500" />
            </button>
          </div>
          <Button variant="outline" size="sm" onClick={onSetToday}>
            {t("today")}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {view === "month" && (
          <MonthView
            currentDate={currentDate}
            events={allEvents}
            onDayClick={onDayClick}
          />
        )}
        {view === "day" && (
          <DayView
            events={dayEvents}
            dayLabel={currentDate.toLocaleDateString(undefined, {
              weekday: "short",
              month: "numeric",
              day: "numeric",
            })}
          />
        )}
        {view === "week" && (
          <WeekView events={weekEvents} weekDays={weekDays} todayIdx={todayDayIdx} />
        )}
      </CardContent>
    </Card>
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
  const { t } = useTranslation("teacherCalendar");
  const dayNamesFull = [
    t("days.sun"), t("days.mon"), t("days.tue"), t("days.wed"),
    t("days.thu"), t("days.fri"), t("days.sat"),
  ];
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startCol = firstDay.getDay();

  const cells: Array<{ date: Date | null; dayNum: number | null; isCurrentMonth: boolean }> = [];
  const prevMonthDays = new Date(year, month, 0).getDate();
  for (let i = startCol - 1; i >= 0; i--) {
    cells.push({ date: new Date(year, month - 1, prevMonthDays - i), dayNum: prevMonthDays - i, isCurrentMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(year, month, d), dayNum: d, isCurrentMonth: true });
  }
  let next = 1;
  while (cells.length % 7 !== 0) {
    cells.push({ date: new Date(year, month + 1, next), dayNum: next, isCurrentMonth: false });
    next++;
  }

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
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[560px]">
        <div className="grid grid-cols-7 border-b border-gray-200">
          {dayNamesFull.map((d) => (
            <div key={d} className="py-2 text-center text-xs font-medium text-gray-500">{d}</div>
          ))}
        </div>
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 border-b border-gray-100 last:border-0">
            {week.map((cell, di) => {
              if (!cell.date)
                return <div key={di} className="min-h-[90px] border-r border-gray-100 p-1 last:border-0" />;
              const dateKey = `${cell.date.getFullYear()}-${cell.date.getMonth()}-${cell.date.getDate()}`;
              const cellEvents = eventsByDate.get(dateKey) || [];
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
                    isToday ? "bg-blue-600 text-white"
                    : isSelected ? "bg-blue-100 text-blue-700"
                    : cell.isCurrentMonth ? "text-gray-900" : "text-gray-300"
                  }`}>
                    {cell.dayNum}
                  </div>
                  <div className="space-y-0.5">
                    {cellEvents.slice(0, 2).map((e, i) => (
                      <div key={i} className={`truncate rounded px-1 py-0.5 text-[10px] font-medium text-white ${e.bgColor}`}>
                        {e.title}
                      </div>
                    ))}
                    {cellEvents.length > 2 && (
                      <p className="text-[10px] text-gray-400">{t("more", { count: cellEvents.length - 2 })}</p>
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

// ── Day View ──────────────────────────────────────────
function DayView({
  events,
  dayLabel,
}: {
  events: Array<{ startHour: number; duration: number; title: string; room: string; color: string }>;
  dayLabel: string;
}) {
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
            <div key={hour} className="grid grid-cols-[60px_1fr] border-b border-gray-100" style={{ height: 60 }}>
              <div className="flex items-start justify-end pr-2 pt-1 text-xs text-gray-400">
                {hour > 12 ? hour - 12 : hour}{hour >= 12 ? " PM" : " AM"}
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
            <div key={day} className={`border-l border-gray-200 p-2 text-center text-sm font-medium ${
              i === todayIdx ? "bg-blue-50 text-blue-700" : "text-gray-600"
            }`}>
              {day}
            </div>
          ))}
        </div>
        <div className="relative">
          {hours.map((hour) => (
            <div key={hour} className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-gray-100" style={{ height: 60 }}>
              <div className="flex items-start justify-end pr-2 pt-1 text-xs text-gray-400">
                {hour > 12 ? hour - 12 : hour}{hour >= 12 ? " PM" : " AM"}
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
