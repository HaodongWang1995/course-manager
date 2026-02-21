import { createFileRoute } from "@tanstack/react-router";
import { TeacherReportsPage } from "@/pages/teacher/reports";

export const Route = createFileRoute("/(app)/teacher/reports")({
  component: TeacherReportsPage,
});
