import { createFileRoute } from "@tanstack/react-router";
import { TeacherDashboardPage } from "@/pages/teacher/dashboard";

export const Route = createFileRoute("/(app)/teacher/")({
  component: TeacherDashboardPage,
});
