import { createFileRoute } from "@tanstack/react-router";
import { TeacherSupportPage } from "@/pages/teacher/support";

export const Route = createFileRoute("/(app)/teacher/support")({
  component: TeacherSupportPage,
});
