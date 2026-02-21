import { createFileRoute } from "@tanstack/react-router";
import { TeacherCalendarPage } from "@/pages/teacher/calendar";

export const Route = createFileRoute("/(app)/teacher/calendar")({
  component: TeacherCalendarPage,
});
