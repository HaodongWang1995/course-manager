import { createFileRoute } from "@tanstack/react-router";
import { TeacherEnrollmentsPage } from "@/pages/teacher/enrollments";

export const Route = createFileRoute("/(app)/teacher/enrollments")({
  component: TeacherEnrollmentsPage,
});
