import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
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
} from "@course-manager/ui";
import { Plus, Clock, MapPin, ChevronLeft, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/(app)/teacher/calendar")({
  component: TeacherCalendar,
});

const hours = Array.from({ length: 10 }, (_, i) => i + 8); // 8 AM to 5 PM
const weekDays = ["Mon 23", "Tue 24", "Wed 25", "Thu 26", "Fri 27"];

const calendarEvents = [
  { day: 0, startHour: 8, duration: 1.5, title: "MAT101 - Linear Algebra", room: "Room 301", color: "bg-blue-100 border-blue-300 text-blue-800" },
  { day: 0, startHour: 13, duration: 1.5, title: "PHY202 - Mechanics", room: "Lab 2B", color: "bg-green-100 border-green-300 text-green-800" },
  { day: 1, startHour: 10, duration: 1.5, title: "MAT202 - Calculus II", room: "Room 405", color: "bg-purple-100 border-purple-300 text-purple-800" },
  { day: 1, startHour: 15, duration: 1.5, title: "MAT301 - Diff Equations", room: "Room 210", color: "bg-orange-100 border-orange-300 text-orange-800" },
  { day: 2, startHour: 8, duration: 1.5, title: "MAT101 - Linear Algebra", room: "Room 301", color: "bg-blue-100 border-blue-300 text-blue-800" },
  { day: 2, startHour: 14, duration: 2, title: "Faculty Meeting", room: "Main Hall", color: "bg-red-100 border-red-300 text-red-800" },
  { day: 3, startHour: 10, duration: 1.5, title: "MAT202 - Calculus II", room: "Room 405", color: "bg-purple-100 border-purple-300 text-purple-800" },
  { day: 3, startHour: 13, duration: 1.5, title: "PHY202 - Mechanics", room: "Lab 2B", color: "bg-green-100 border-green-300 text-green-800" },
  { day: 4, startHour: 9, duration: 1, title: "Office Hours", room: "Office 112", color: "bg-gray-100 border-gray-300 text-gray-800" },
  { day: 4, startHour: 11, duration: 1.5, title: "MAT301 - Diff Equations", room: "Room 210", color: "bg-orange-100 border-orange-300 text-orange-800" },
];

const upcomingEvents = [
  { title: "Parent-Teacher Conference", date: "Oct 28, 2:00 PM", type: "Event" },
  { title: "Department Seminar", date: "Oct 30, 10:00 AM", type: "Seminar" },
  { title: "Midterm Exam - MAT101", date: "Nov 1, 8:00 AM", type: "Exam" },
];

const deadlines = [
  { title: "Grade Midterm Papers", date: "Oct 26", course: "MAT101" },
  { title: "Submit Lab Reports", date: "Oct 28", course: "PHY202" },
  { title: "Homework Set 5 Due", date: "Nov 1", course: "MAT202" },
];

function TeacherCalendar() {
  const [view, setView] = useState("week");

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
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="day">Day</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button>
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
                    October 23 - 27, 2023
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
              <div className="overflow-x-auto">
                <div className="min-w-[700px]">
                  {/* Day Headers */}
                  <div className="grid grid-cols-[60px_repeat(5,1fr)] border-b border-gray-200">
                    <div className="p-2" />
                    {weekDays.map((day, i) => (
                      <div
                        key={day}
                        className={`border-l border-gray-200 p-2 text-center text-sm font-medium ${
                          i === 1 ? "bg-blue-50 text-blue-700" : "text-gray-600"
                        }`}
                      >
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Time Grid */}
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
                          <div
                            key={dayIdx}
                            className="relative border-l border-gray-100"
                          />
                        ))}
                      </div>
                    ))}

                    {/* Events overlay */}
                    {calendarEvents.map((event, idx) => {
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
                          <p className="font-medium leading-tight">
                            {event.title}
                          </p>
                          <p className="mt-0.5 opacity-75">{event.room}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Upcoming Events */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingEvents.map((event, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-gray-100 p-3"
                >
                  <p className="text-sm font-medium text-gray-900">
                    {event.title}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <Clock className="h-3 w-3 text-gray-400" />
                    <span className="text-xs text-gray-500">{event.date}</span>
                  </div>
                  <Badge variant="secondary" className="mt-2">
                    {event.type}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Deadlines */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Deadlines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {deadlines.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-lg border border-gray-100 p-3"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {item.title}
                    </p>
                    <p className="text-xs text-gray-500">{item.course}</p>
                  </div>
                  <span className="whitespace-nowrap text-xs font-medium text-red-500">
                    {item.date}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
